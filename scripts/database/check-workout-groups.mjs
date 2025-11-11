#!/usr/bin/env node
/**
 * Check if a workout has exercise groups defined
 * Usage: node scripts/database/check-workout-groups.mjs [workout_plan_id]
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const workoutPlanId = process.argv[2] || "a8401c27-99bd-4f4b-bf8a-11de388ffbfa"; // From your logs

async function checkWorkoutGroups() {
  console.log(`\n🔍 Checking workout plan: ${workoutPlanId}\n`);

  // Get workout plan
  const { data: workout, error: workoutError } = await supabase
    .from("workout_plans")
    .select("id, name, description")
    .eq("id", workoutPlanId)
    .single();

  if (workoutError) {
    console.error("❌ Error fetching workout:", workoutError.message);
    return;
  }

  console.log("📋 Workout:", workout.name);
  console.log("━".repeat(60));

  // Get exercise groups
  const { data: groups, error: groupsError } = await supabase
    .from("workout_exercise_groups")
    .select("*")
    .eq("workout_plan_id", workoutPlanId)
    .order("order_index");

  console.log("\n🔷 Exercise Groups:");
  if (groupsError) {
    console.error("❌ Error:", groupsError.message);
  } else if (!groups || groups.length === 0) {
    console.log("❌ NO GROUPS FOUND");
  } else {
    console.log(`✅ Found ${groups.length} group(s):`);
    groups.forEach((g, i) => {
      console.log(`\n  ${i + 1}. ${g.name}`);
      console.log(`     Type: ${g.type}`);
      console.log(`     ID: ${g.id}`);
      if (g.rounds) console.log(`     Rounds: ${g.rounds}`);
      if (g.rest_between_rounds)
        console.log(`     Rest between rounds: ${g.rest_between_rounds}s`);
    });
  }

  // Get exercises
  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_exercises")
    .select("id, exercise_name, group_id, order_index, sets, reps")
    .eq("workout_plan_id", workoutPlanId)
    .order("order_index");

  console.log("\n\n🏋️ Exercises:");
  if (exercisesError) {
    console.error("❌ Error:", exercisesError.message);
  } else if (!exercises || exercises.length === 0) {
    console.log("❌ NO EXERCISES FOUND");
  } else {
    console.log(`✅ Found ${exercises.length} exercise(s):`);

    const withGroups = exercises.filter((e) => e.group_id);
    const withoutGroups = exercises.filter((e) => !e.group_id);

    console.log(`   - ${withGroups.length} have group_id assigned`);
    console.log(`   - ${withoutGroups.length} without group_id`);

    exercises.forEach((e, i) => {
      const groupInfo = e.group_id
        ? `[GROUP: ${groups?.find((g) => g.id === e.group_id)?.name || "Unknown"}]`
        : "[NO GROUP]";
      console.log(`\n  ${i + 1}. ${e.exercise_name} ${groupInfo}`);
      console.log(`     Sets: ${e.sets}, Reps: ${e.reps}`);
      console.log(`     Exercise ID: ${e.id}`);
      if (e.group_id) {
        console.log(`     Group ID: ${e.group_id}`);
      }
    });
  }

  console.log("\n" + "━".repeat(60));
  console.log("\n💡 Summary:");
  console.log(`   Groups in DB: ${groups?.length || 0}`);
  console.log(`   Total exercises: ${exercises?.length || 0}`);
  console.log(
    `   Exercises with group_id: ${exercises?.filter((e) => e.group_id).length || 0}`
  );

  if (groups && groups.length > 0 && exercises?.every((e) => !e.group_id)) {
    console.log(
      "\n⚠️  WARNING: Groups exist but NO exercises are assigned to them!"
    );
    console.log("   This is likely the problem. Exercises need group_id set.");
  } else if (
    groups &&
    groups.length > 0 &&
    exercises?.some((e) => e.group_id)
  ) {
    console.log("\n✅ Groups are properly configured!");
  } else if (!groups || groups.length === 0) {
    console.log(
      "\n📝 No groups defined for this workout (this is normal for non-circuit workouts)"
    );
  }

  console.log("\n");
}

checkWorkoutGroups().catch(console.error);
