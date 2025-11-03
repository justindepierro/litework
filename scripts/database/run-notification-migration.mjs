#!/usr/bin/env node

/**
 * Create Notification System Tables
 * Applies the notification database schema to Supabase
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
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error(
    "   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("🚀 Starting notification system migration...\n");

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, "create-notification-tables.sql");
    const sql = readFileSync(sqlPath, "utf8");

    console.log("📄 Loaded SQL migration file");
    console.log(`   Path: ${sqlPath}`);
    console.log(`   Size: ${sql.length} characters\n`);

    // Split into individual statements (rough split on semicolons)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (
        statement.startsWith("--") ||
        statement.length < 10 ||
        statement.includes("RAISE NOTICE")
      ) {
        continue;
      }

      try {
        // Log what we're executing (first 100 chars)
        const preview =
          statement.length > 100
            ? statement.substring(0, 100) + "..."
            : statement;
        console.log(`⏳ [${i + 1}/${statements.length}] ${preview}`);

        const { error } = await supabase.rpc("exec_sql", { sql: statement });

        if (error) {
          // Try direct execution as fallback
          const { error: directError } = await supabase
            .from("_sql")
            .select(statement);
          if (directError) {
            throw error;
          }
        }

        successCount++;
        console.log(`   ✅ Success\n`);
      } catch (error) {
        // Some errors are expected (like "already exists")
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate")
        ) {
          console.log(`   ⚠️  Already exists (skipped)\n`);
          successCount++;
        } else {
          errorCount++;
          console.error(`   ❌ Error: ${error.message}\n`);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    if (errorCount === 0) {
      console.log("🎉 Migration completed successfully!");
      console.log("\n📋 Next steps:");
      console.log("   1. Verify tables: npm run check-tables");
      console.log(
        "   2. Generate VAPID keys: npx web-push generate-vapid-keys"
      );
      console.log("   3. Add keys to .env.local");
      console.log("   4. Start Phase 2: Push Notification Implementation\n");
    } else {
      console.log(
        "⚠️  Migration completed with some errors. Check logs above."
      );
      console.log("   Common issues:");
      console.log('   - "already exists" errors are usually fine');
      console.log("   - Permission errors may need manual SQL execution");
      console.log("\n");
    }

    // Verify tables were created
    await verifyTables();
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

async function verifyTables() {
  console.log("🔍 Verifying table creation...\n");

  const tables = [
    "push_subscriptions",
    "notification_preferences",
    "notification_log",
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND`);
      } else {
        console.log(`   ✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ERROR`);
    }
  }

  console.log("");
}

// Run migration
runMigration();
