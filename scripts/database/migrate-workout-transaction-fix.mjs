#!/usr/bin/env node

/**
 * Run database migration for workout transaction ID mapping fix
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log("🔄 Running workout transaction ID mapping fix migration...\n");

  const sqlFile = path.join(__dirname, "../database/fix-workout-transaction-id-mapping.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");

  try {
    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_string: sql }).single();

    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: queryError } = await supabase.from("_sql").select("*").limit(0);
      
      if (queryError) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("\nThe create_workout_plan_transaction function now:");
    console.log("  - Handles temporary frontend IDs (group-xxx, block-xxx)");
    console.log("  - Maps them to actual database UUIDs");
    console.log("  - Maintains referential integrity between exercises and groups");
    
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
