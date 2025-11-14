#!/usr/bin/env node

/**
 * Investigate Orphaned Athletes
 * These IDs exist in groups but not in users table - they were deleted!
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 INVESTIGATING ORPHANED ATHLETE IDS\n");

// Get all groups with athlete IDs
const { data: groups } = await supabase.from("athlete_groups").select("*");

// Get all users
const { data: users } = await supabase
  .from("users")
  .select("id, first_name, last_name, email, role");

const orphanedIds = [];
const orphanedDetails = [];

groups?.forEach((group) => {
  if (group.athlete_ids && group.athlete_ids.length > 0) {
    group.athlete_ids.forEach((athleteId) => {
      const userExists = users?.some((u) => u.id === athleteId);

      if (!userExists && !orphanedIds.includes(athleteId)) {
        orphanedIds.push(athleteId);
        orphanedDetails.push({
          id: athleteId,
          foundInGroup: group.name,
          groupId: group.id,
        });
      }
    });
  }
});

console.log(`Found ${orphanedIds.length} orphaned athlete IDs:\n`);

orphanedDetails.forEach((detail, index) => {
  console.log(`${index + 1}. ID: ${detail.id}`);
  console.log(`   Found in group: ${detail.foundInGroup}`);
  console.log(`   Group ID: ${detail.groupId}`);
  console.log("");
});

// Check if these IDs have any data in auth.users (Supabase Auth table)
console.log("Checking Supabase Auth table for these IDs...\n");

for (const id of orphanedIds) {
  // Try to get user from auth
  const { data: authUser, error } = await supabase.auth.admin.getUserById(id);

  if (authUser && authUser.user) {
    console.log(`✅ FOUND IN AUTH: ${id}`);
    console.log(`   Email: ${authUser.user.email}`);
    console.log(`   Created: ${authUser.user.created_at}`);
    console.log(`   Last sign in: ${authUser.user.last_sign_in_at || "Never"}`);
    console.log("   ⚠️  USER EXISTS IN AUTH BUT NOT IN YOUR USERS TABLE!");
    console.log("");
  } else if (error) {
    console.log(`❌ NOT IN AUTH: ${id}`);
    console.log(`   Error: ${error.message}`);
    console.log("");
  }
}

// Check workout assignments
console.log("\nChecking if these IDs have workout assignments...\n");

const { data: assignments } = await supabase
  .from("workout_assignments")
  .select("*")
  .in("athlete_id", orphanedIds);

if (assignments && assignments.length > 0) {
  console.log(
    `⚠️  Found ${assignments.length} workout assignments for deleted athletes`
  );
  assignments.forEach((a) => {
    console.log(`   - Athlete ID: ${a.athlete_id}`);
    console.log(`     Workout: ${a.workout_plan_id}`);
    console.log(`     Assigned: ${a.assigned_date}`);
  });
}

console.log("\n" + "=".repeat(60));
console.log("💡 ANALYSIS:");
console.log("   These athlete IDs were DELETED from the users table");
console.log("   but their references remain in:");
console.log("   - Group memberships");
console.log("   - Possibly workout assignments");
console.log("   - Possibly other related tables");
console.log("");
console.log("   This suggests a HARD DELETE without cascade cleanup.");
console.log("");
console.log("🔧 RECOMMENDED FIX:");
console.log("   1. Clean up orphaned references from groups");
console.log("   2. Implement soft delete (deleted_at column)");
console.log("   3. Add foreign key constraints with CASCADE");
console.log("   4. Create audit log for deletions");
