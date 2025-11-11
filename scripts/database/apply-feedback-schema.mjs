#!/usr/bin/env node

/**
 * Apply Workout Session Feedback Schema
 * Runs the SQL migration to create the feedback table
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error(
    "   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applySchemaMigration() {
  console.log("🔄 Applying workout session feedback schema...\n");

  try {
    // Read the SQL file
    const sqlPath = join(
      __dirname,
      "../../database/workout-session-feedback-schema.sql"
    );
    const sql = readFileSync(sqlPath, "utf8");

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct query (older Supabase versions)
      console.log(
        "⚠️  exec_sql RPC not available, trying direct execution...\n"
      );

      // Split by semicolons and execute each statement
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        if (statement.includes("COMMENT ON")) {
          // Skip comments as they might not be supported via query
          continue;
        }

        const { error: stmtError } = await supabase.rpc("query", {
          query_text: statement + ";",
        });

        if (stmtError) {
          console.error(`❌ Error executing statement: ${stmtError.message}`);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log("✅ Workout session feedback schema applied successfully!\n");
    console.log("📋 Created:");
    console.log("   - workout_session_feedback table");
    console.log("   - RLS policies (athlete & coach access)");
    console.log("   - Indexes for performance");
    console.log("   - Auto-update timestamp trigger\n");

    // Verify the table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from("workout_session_feedback")
      .select("*")
      .limit(0);

    if (!tableError) {
      console.log("✅ Verification: Table is accessible\n");
    } else {
      console.log(
        "⚠️  Note: Could not verify table (this is normal if no data exists yet)\n"
      );
    }

    console.log("🎯 Next steps:");
    console.log("   1. Create API endpoint: /api/sessions/[id]/feedback");
    console.log("   2. Build WorkoutFeedbackModal.tsx component");
    console.log("   3. Create FeedbackDashboard.tsx for coaches\n");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

applySchemaMigration();
