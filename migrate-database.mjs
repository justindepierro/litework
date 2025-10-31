#!/usr/bin/env node

// Database migration utility to seed initial data with real user IDs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load environment variables
try {
  const envContent = readFileSync(".env.local", "utf8");
  const envLines = envContent.split("\n");
  envLines.forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
} catch (err) {
  console.error("❌ Could not read .env.local file:", err.message);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

// Real user IDs from our created users
const USER_IDS = {
  COACH_SMITH: 'e825fcc4-ef72-41e7-8e53-c12216ffcc73',
  JOHN_DOE: '2a7603f5-4a04-41c8-b6f8-23755b6e6332',
  JANE_SMITH: '8443615d-9aad-4008-861d-45b43b96d7b5',
  MIKE_WILSON: 'e22ecef6-952f-48d3-91a0-59cd15e92d3d'
};

// Use service role key for full admin access during migration
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mock data to migrate (users and exercises already exist)
const seedData = {
  athlete_groups: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Football Linemen",
      description: "Offensive and defensive line strength training",
      sport: "Football",
      category: "Linemen", 
      coach_id: USER_IDS.COACH_SMITH,
      athlete_ids: [USER_IDS.JOHN_DOE, USER_IDS.MIKE_WILSON],
      color: "#1f2937",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Volleyball Girls",
      description: "Women's volleyball team training program", 
      sport: "Volleyball",
      category: "Varsity",
      coach_id: USER_IDS.COACH_SMITH,
      athlete_ids: [USER_IDS.JANE_SMITH],
      color: "#7c3aed",
    },
  ],

  workout_plans: [
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Upper Body Strength",
      description: "Focus on bench press, rows, and shoulder development",
      estimated_duration: 45,
      target_group_id: "11111111-1111-1111-1111-111111111111",
      created_by: USER_IDS.COACH_SMITH,
    },
    {
      id: "44444444-4444-4444-4444-444444444444", 
      name: "Lower Body Power",
      description: "Explosive leg development with squats and deadlifts",
      estimated_duration: 60,
      target_group_id: "11111111-1111-1111-1111-111111111111", 
      created_by: USER_IDS.COACH_SMITH,
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      name: "Volleyball Conditioning", 
      description: "Sport-specific training for volleyball players",
      estimated_duration: 30,
      target_group_id: "22222222-2222-2222-2222-222222222222",
      created_by: USER_IDS.COACH_SMITH,
    },
  ]
};

async function seedDatabase() {
  console.log("🌱 Starting database migration...");

  try {
    // Skip users for now - they need to be created through Supabase Auth
    console.log("⚠️  Skipping users (require Auth signup)");

    // 1. Seed Athlete Groups  
    console.log("🏃 Seeding athlete groups...");
    const { data: groupsData, error: groupsError } = await supabase
      .from('athlete_groups')
      .upsert(seedData.athlete_groups, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();
    
    if (groupsError) {
      console.error("❌ Error seeding groups:", groupsError);
      return false;
    }
    console.log(`✅ Seeded ${groupsData.length} athlete groups`);

    // 2. Seed Workout Plans
    console.log("🏋️ Seeding workout plans...");
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workout_plans')
      .upsert(seedData.workout_plans, {
        onConflict: 'id',
        ignoreDuplicates: false  
      })
      .select();
    
    if (workoutsError) {
      console.error("❌ Error seeding workouts:", workoutsError);
      return false;
    }
    console.log(`✅ Seeded ${workoutsData.length} workout plans`);

    console.log("\n🎉 Database migration completed successfully!");
    console.log("\n📊 Migration Summary:");
    console.log(`   • ${groupsData.length} athlete groups`); 
    console.log(`   • ${workoutsData.length} workout plans`);
    console.log("   • Exercises already seeded via exercises-seed.sql");
    console.log("\n💡 Next steps:");
    console.log("   • Test CRUD operations via the web interface");
    console.log("   • Users will be automatically added to the users table");
    
    return true;

  } catch (err) {
    console.error("❌ Unexpected migration error:", err);
    return false;
  }
}

// Run migration
seedDatabase().then(success => {
  process.exit(success ? 0 : 1);
});