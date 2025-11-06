#!/usr/bin/env node
/**
 * Test Workout Creation with Groups
 * This script tests the complete workflow to ensure groups save correctly
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🧪 Testing Workout Creation with Groups\n");

// Test data
const testWorkout = {
  name: "Test Workout - Groups Test",
  description: "Testing superset creation",
  estimated_duration: 30,
  created_by: "test-user-id", // Replace with actual user ID
};

const testGroup = {
  name: "Superset 1",
  type: "superset",
  description: "Upper body superset",
  order_index: 1,
  rest_between_rounds: 120,
  rest_between_exercises: 0,
  rounds: 3,
  notes: "Push hard!",
};

async function testWorkoutCreation() {
  console.log("1️⃣ Creating test workout plan...");

  const { data: workout, error: workoutError } = await supabase
    .from("workout_plans")
    .insert(testWorkout)
    .select()
    .single();

  if (workoutError) {
    console.error("❌ Failed to create workout:", workoutError);
    return;
  }

  console.log("✅ Workout created:", workout.id, "-", workout.name);

  console.log("\n2️⃣ Creating test group...");

  const groupData = {
    ...testGroup,
    workout_plan_id: workout.id,
  };

  const { data: group, error: groupError } = await supabase
    .from("workout_exercise_groups")
    .insert(groupData)
    .select()
    .single();

  if (groupError) {
    console.error("❌ Failed to create group:", groupError);
    console.error("   Error details:", JSON.stringify(groupError, null, 2));

    // Check RLS policies
    console.log("\n🔍 Checking RLS policies...");
    const { data: policies } = await supabase.rpc("exec_sql", {
      sql_query: `
          SELECT schemaname, tablename, policyname, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'workout_exercise_groups';
        `,
    });

    if (policies) {
      console.log("   Policies:", policies);
    }

    // Cleanup
    await supabase.from("workout_plans").delete().eq("id", workout.id);
    return;
  }

  console.log("✅ Group created:", group.id, "-", group.name);

  console.log("\n3️⃣ Verifying group was saved...");

  const { data: savedGroup, error: fetchError } = await supabase
    .from("workout_exercise_groups")
    .select("*")
    .eq("id", group.id)
    .single();

  if (fetchError) {
    console.error("❌ Failed to fetch group:", fetchError);
  } else {
    console.log("✅ Group verified in database:");
    console.log("   ID:", savedGroup.id);
    console.log("   Name:", savedGroup.name);
    console.log("   Type:", savedGroup.type);
    console.log("   Workout ID:", savedGroup.workout_plan_id);
  }

  console.log("\n4️⃣ Testing complete workout retrieval...");

  const { data: completeWorkout, error: retrieveError } = await supabase
    .from("workout_plans")
    .select(
      `
      *,
      workout_exercises(*),
      workout_exercise_groups(*)
    `
    )
    .eq("id", workout.id)
    .single();

  if (retrieveError) {
    console.error("❌ Failed to retrieve complete workout:", retrieveError);
  } else {
    console.log("✅ Complete workout retrieved:");
    console.log("   Workout:", completeWorkout.name);
    console.log(
      "   Exercises:",
      completeWorkout.workout_exercises?.length || 0
    );
    console.log(
      "   Groups:",
      completeWorkout.workout_exercise_groups?.length || 0
    );

    if (completeWorkout.workout_exercise_groups?.length > 0) {
      console.log("\n   📊 Groups found:");
      completeWorkout.workout_exercise_groups.forEach((g) => {
        console.log(`      - ${g.name} (${g.type})`);
      });
    }
  }

  console.log("\n5️⃣ Cleanup - Deleting test data...");

  const { error: deleteError } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", workout.id);

  if (deleteError) {
    console.error("⚠️  Failed to cleanup:", deleteError);
    console.log("   Please manually delete workout:", workout.id);
  } else {
    console.log("✅ Test data cleaned up");
  }
}

async function checkSchema() {
  console.log("\n🔍 Checking Schema...");

  // Check if tables exist
  const tables = [
    "workout_plans",
    "workout_exercises",
    "workout_exercise_groups",
    "workout_block_instances",
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(0);

    if (error) {
      console.log(`❌ ${table}: NOT ACCESSIBLE (${error.message})`);
    } else {
      console.log(`✅ ${table}: Exists and accessible`);
    }
  }
}

// Run tests
try {
  await checkSchema();
  console.log("\n" + "=".repeat(60) + "\n");
  await testWorkoutCreation();

  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests complete!");
  console.log("=".repeat(60) + "\n");
} catch (err) {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
}
