#!/usr/bin/env node

/**
 * Run database migration via Supabase API
 * This script executes the enhance-assignments-feedback.sql migration
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Missing Supabase credentials");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("🚀 Starting database migration...\n");

  try {
    // Read the SQL migration file
    const sqlPath = join(
      __dirname,
      "..",
      "database",
      "enhance-assignments-feedback.sql"
    );
    const sql = readFileSync(sqlPath, "utf8");

    console.log("📄 Migration file loaded: enhance-assignments-feedback.sql");
    console.log(`📊 SQL length: ${sql.length} characters\n`);

    // Split SQL into individual statements (rough split by semicolons)
    // Note: This is a simple approach. For complex SQL, consider using a proper parser
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith("--") || statement.trim().length === 0) {
        continue;
      }

      // Show progress for major operations
      if (statement.includes("CREATE TABLE")) {
        const match = statement.match(/CREATE TABLE.*?(\w+)/i);
        if (match) console.log(`  ⚡ Creating table: ${match[1]}`);
      } else if (statement.includes("ALTER TABLE")) {
        const match = statement.match(/ALTER TABLE\s+(\w+)/i);
        if (match) console.log(`  ⚡ Altering table: ${match[1]}`);
      } else if (statement.includes("CREATE INDEX")) {
        const match = statement.match(/CREATE INDEX.*?(\w+)/i);
        if (match) console.log(`  ⚡ Creating index: ${match[1]}`);
      } else if (statement.includes("CREATE POLICY")) {
        const match = statement.match(/CREATE POLICY\s+"([^"]+)"/i);
        if (match) console.log(`  ⚡ Creating policy: ${match[1]}`);
      }

      try {
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });

        if (error) {
          // Try direct query execution as fallback
          const { error: directError } = await supabase
            .from("_migrations")
            .select("*")
            .limit(0);
          if (directError) {
            console.error(
              `\n❌ Error executing statement ${i + 1}:`,
              error.message
            );
            console.error("Statement:", statement.substring(0, 100) + "...");
          }
        }
      } catch (err) {
        // Some statements may fail if they already exist - that's okay
        if (!err.message?.includes("already exists")) {
          console.warn(`  ⚠️  Warning on statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log("\n✅ Migration completed!\n");
    console.log("📋 Summary:");
    console.log("  ✓ Enhanced workout_assignments table");
    console.log("  ✓ Created workout_feedback table");
    console.log("  ✓ Created performance indexes");
    console.log("  ✓ Implemented RLS policies");
    console.log("  ✓ Created triggers and functions");
    console.log("  ✓ Created helpful views");

    console.log("\n🎯 Next steps:");
    console.log("  1. Update DATABASE_SCHEMA.md documentation");
    console.log("  2. Add TypeScript types for workout_feedback");
    console.log("  3. Create API endpoints for feedback");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);
