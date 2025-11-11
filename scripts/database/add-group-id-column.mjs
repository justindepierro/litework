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

console.log("🔧 Adding group_id column to session_exercises...\n");

// Use Supabase's rpc or direct SQL
const { data, error } = await supabase.rpc("exec_sql", {
  query: `
    ALTER TABLE session_exercises
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES workout_exercise_groups(id);
    
    CREATE INDEX IF NOT EXISTS idx_session_exercises_group_id 
    ON session_exercises(group_id);
  `,
});

if (error) {
  console.error("❌ Migration failed:", error.message);

  // Try alternative: Check if column exists first
  console.log("\nℹ️ Trying alternative approach...");

  const { data: columns } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "session_exercises")
    .eq("column_name", "group_id")
    .single();

  if (columns) {
    console.log("✅ Column 'group_id' already exists!");
  } else {
    console.log(
      "❌ Could not add column. Please run SQL manually in Supabase SQL Editor:"
    );
    console.log(
      "\n" +
        `
ALTER TABLE session_exercises
ADD COLUMN group_id UUID REFERENCES workout_exercise_groups(id);

CREATE INDEX idx_session_exercises_group_id 
ON session_exercises(group_id);
    `.trim()
    );
  }
} else {
  console.log("✅ Migration successful!");
  console.log("   - Added 'group_id' column to session_exercises");
  console.log("   - Created index for faster lookups");
}
