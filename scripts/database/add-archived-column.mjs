#!/usr/bin/env node

/**
 * Add archived column to athlete_groups table
 * This migration adds support for archiving groups instead of deleting them
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("Required environment variables:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("🚀 Starting migration: Add archived column to groups");

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "../../database/add-archived-to-groups.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 Executing SQL migration...");

    // Execute the migration
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // If exec_sql RPC doesn't exist, try direct query
      const { error: directError } = await supabase.from("_sql").select(sql);
      if (directError) {
        throw new Error(`Migration failed: ${error.message}`);
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("   - Added 'archived' column to athlete_groups table");
    console.log("   - Created index for archived column");
    console.log("   - Groups can now be archived instead of deleted");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
