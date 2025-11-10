#!/usr/bin/env node

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const sessionId = process.argv[2] || "449305b8-34c3-45e6-938f-68b782e799d5";

console.log(`🔍 Checking session: ${sessionId}\n`);

// Get session data
const { data: session, error } = await supabase
  .from("workout_sessions")
  .select("id, created_at, workout_plan_id, user_id, groups")
  .eq("id", sessionId)
  .single();

if (error) {
  console.error("❌ Error fetching session:", error.message);
  process.exit(1);
}

console.log("📅 Session Info:");
console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
console.log(`   Workout Plan: ${session.workout_plan_id}`);
console.log(`   User: ${session.user_id}`);
console.log();

console.log("🔷 Groups Data:");
console.log(`   Has 'groups' field: ${"groups" in session}`);
console.log(`   Groups value: ${JSON.stringify(session.groups, null, 2)}`);
console.log(`   Type: ${typeof session.groups}`);
console.log(`   Is null: ${session.groups === null}`);
console.log(`   Is undefined: ${session.groups === undefined}`);
console.log();

// Get actual groups from workout plan
const { data: groups } = await supabase
  .from("workout_exercise_groups")
  .select("*")
  .eq("workout_plan_id", session.workout_plan_id);

console.log("✅ Groups in workout_exercise_groups table:");
console.log(`   Count: ${groups?.length || 0}`);
if (groups && groups.length > 0) {
  groups.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g.name} (${g.type}) - ${g.rounds} rounds`);
  });
}
console.log();

console.log("💡 Diagnosis:");
if (!session.groups || session.groups === null || (Array.isArray(session.groups) && session.groups.length === 0)) {
  console.log("❌ Session was created WITHOUT groups data");
  console.log("   This session was likely created before groups were properly linked.");
  console.log();
  console.log("🔧 Solution: Start a NEW workout session to include groups.");
  console.log("   The enhanced API will fetch and include groups in new sessions.");
} else {
  console.log("✅ Session has groups data stored");
}
