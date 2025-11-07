#!/usr/bin/env node
/**
 * Run database migration to add assignment fields
 *
 * Usage: node scripts/database/migrate-assignment-fields.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log("📦 Running assignment fields migration...\n");

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "../../database/add-assignment-fields.sql");
    const sql = readFileSync(sqlPath, "utf8");

    // Split into individual statements (simple split on semicolon)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing...`);

      const { error } = await supabase.rpc("exec_sql", {
        sql_query: statement + ";",
      });

      if (error) {
        console.error(`❌ Error on statement ${i + 1}:`, error.message);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} completed`);
      }
    }

    console.log("\n✅ Migration completed!");
    console.log("\n📊 Verifying new columns...");

    // Verify the columns exist
    const { data, error } = await supabase
      .from("workout_assignments")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Verification failed:", error.message);
    } else {
      const columns = data && data[0] ? Object.keys(data[0]) : [];
      console.log("✅ Columns in workout_assignments:", columns.join(", "));
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
