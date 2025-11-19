#!/usr/bin/env node
/**
 * Consolidated Supabase smoke tests for workout+group features.
 *
 * Usage:
 *   node scripts/database/smoke-test-workouts.mjs            # run schema + workouts + athlete groups
 *   node scripts/database/smoke-test-workouts.mjs --workouts # only workout plan/exercise checks
 *   node scripts/database/smoke-test-workouts.mjs --athlete-groups
 *   node scripts/database/smoke-test-workouts.mjs --schema
 *   node scripts/database/smoke-test-workouts.mjs --skip-cleanup
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
  console.error("❌ Missing Supabase credentials. Check .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const flags = new Set(process.argv.slice(2));
const runAll = flags.size === 0 || flags.has("--all");
const runSchema = runAll || flags.has("--schema");
const runWorkouts = runAll || flags.has("--workouts");
const runAthleteGroups = runAll || flags.has("--athlete-groups");
const skipCleanup = flags.has("--skip-cleanup");

const logStep = (label) => {
  console.log(`\n🧪 ${label}`);
  console.log("".padStart(label.length + 4, "="));
};

async function ensureCoachUser() {
  const { data: coaches, error: coachError } = await supabase
    .from("users")
    .select("id")
    .eq("role", "coach")
    .limit(1);

  if (coachError) {
    throw new Error(`Unable to query users table: ${coachError.message}`);
  }

  if (coaches && coaches.length > 0) {
    return coaches[0].id;
  }

  const { data: fallback, error: fallbackError } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (fallbackError) {
    throw new Error(`Unable to find fallback user: ${fallbackError.message}`);
  }

  if (!fallback || fallback.length === 0) {
    throw new Error(
      "No users found in database. Seed users before running smoke tests."
    );
  }

  console.warn("⚠️  No coach role found. Using first user in table instead.");
  return fallback[0].id;
}

async function checkSchemaAccess() {
  logStep("Checking critical tables are accessible");
  const tables = [
    "workout_plans",
    "workout_exercises",
    "workout_exercise_groups",
    "athlete_groups",
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      throw new Error(`${table} not accessible: ${error.message}`);
    }
    console.log(`✅ ${table} OK`);
  }
}

async function smokeTestWorkoutPlan() {
  logStep("Smoke test: workout plan + exercises + groups");
  const coachId = await ensureCoachUser();
  const uniqueSuffix = Date.now();

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert([
      {
        name: `Smoke Test Plan ${uniqueSuffix}`,
        description: "Automated verification run",
        estimated_duration: 45,
        created_by: coachId,
      },
    ])
    .select()
    .single();

  if (planError) {
    throw new Error(`Failed to create workout plan: ${planError.message}`);
  }

  const exercises = [
    {
      workout_plan_id: plan.id,
      exercise_id: "barbell-squat",
      exercise_name: "Barbell Squat",
      sets: 3,
      reps: 10,
      weight_type: "percentage",
      percentage: 70,
      percentage_max: 80,
      tempo: "3-1-1-0",
      rest_time: 120,
      notes: "Depth focus",
      order_index: 1,
    },
    {
      workout_plan_id: plan.id,
      exercise_id: "bench-press",
      exercise_name: "Bench Press",
      sets: 4,
      reps: 8,
      weight_type: "fixed",
      weight: 135,
      weight_max: 155,
      rest_time: 90,
      order_index: 2,
    },
  ];

  const { error: exerciseError } = await supabase
    .from("workout_exercises")
    .insert(exercises);
  if (exerciseError) {
    throw new Error(`Failed to add exercises: ${exerciseError.message}`);
  }

  const { error: groupError } = await supabase
    .from("workout_exercise_groups")
    .insert([
      {
        workout_plan_id: plan.id,
        name: "Superset A",
        type: "superset",
        order_index: 1,
        rest_between_rounds: 60,
        rounds: 3,
        notes: "Push hard",
      },
    ]);

  if (groupError) {
    throw new Error(`Failed to add exercise group: ${groupError.message}`);
  }

  const { data: hydratedPlan, error: fetchError } = await supabase
    .from("workout_plans")
    .select(
      `
      id,
      name,
      workout_exercises(*),
      workout_exercise_groups(*)
    `
    )
    .eq("id", plan.id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch hydrated plan: ${fetchError.message}`);
  }

  console.log(
    `✅ Workout plan saved with ${hydratedPlan.workout_exercises?.length || 0} exercises and ${
      hydratedPlan.workout_exercise_groups?.length || 0
    } groups`
  );

  if (!skipCleanup) {
    await supabase.from("workout_plans").delete().eq("id", plan.id);
    console.log("🧹 Cleanup complete for workout plan data");
  } else {
    console.log("⚠️  --skip-cleanup enabled. Test data left in database.");
  }
}

async function smokeTestAthleteGroup() {
  logStep("Smoke test: athlete group creation");
  const coachId = await ensureCoachUser();
  const timestamp = new Date().toISOString();

  const payload = {
    name: `Smoke Test Group ${timestamp}`,
    description: "Temporary verification group",
    sport: "Other",
    category: "QA",
    coach_id: coachId,
    athlete_ids: [],
    color: "#ff6b35",
  };

  const { data: group, error } = await supabase
    .from("athlete_groups")
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create athlete group: ${error.message}`);
  }

  console.log(`✅ Athlete group created: ${group.id}`);

  if (!skipCleanup) {
    await supabase.from("athlete_groups").delete().eq("id", group.id);
    console.log("🧹 Cleanup complete for athlete group data");
  } else {
    console.log("⚠️  --skip-cleanup enabled. Athlete group left in database.");
  }
}

async function main() {
  try {
    if (runSchema) {
      await checkSchemaAccess();
    }

    if (runWorkouts) {
      await smokeTestWorkoutPlan();
    }

    if (runAthleteGroups) {
      await smokeTestAthleteGroup();
    }

    console.log("\n✅ Smoke tests finished successfully");
  } catch (error) {
    console.error(
      "\n❌ Smoke tests failed:",
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

await main();
