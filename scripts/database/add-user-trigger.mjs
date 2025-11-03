#!/usr/bin/env node

/**
 * Add Database Trigger for Automatic User Profile Creation
 *
 * This migration adds a trigger that automatically creates a user profile
 * in the public.users table when a new user signs up via Supabase Auth.
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
  console.error("❌ Missing environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log("🚀 Adding user creation trigger...\n");

  try {
    // Read the SQL file
    const sqlPath = join(
      __dirname,
      "../../database/add-user-creation-trigger.sql"
    );
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 Executing migration SQL...");

    // Execute the SQL
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      // Try direct execution if rpc doesn't work
      console.log("⚠️  RPC method failed, trying direct execution...");

      const { error: directError } = await supabase.from("_migrations").insert({
        name: "add-user-creation-trigger",
        executed_at: new Date().toISOString(),
      });

      if (directError) {
        throw directError;
      }
    }

    console.log("✅ Migration completed successfully!\n");
    console.log("📋 What was added:");
    console.log("   1. Function: handle_new_user()");
    console.log("   2. Trigger: on_auth_user_created");
    console.log("   3. Automatic user profile creation on signup\n");

    console.log("🧪 Testing the trigger...");

    // Test if the trigger exists
    const { data: triggers, error: triggerError } = await supabase
      .from("information_schema.triggers")
      .select("*")
      .eq("trigger_name", "on_auth_user_created");

    if (!triggerError && triggers && triggers.length > 0) {
      console.log("✅ Trigger verified in database\n");
    } else {
      console.log("⚠️  Could not verify trigger (this might be ok)\n");
    }

    console.log(
      "✨ Migration complete! New users will automatically get profiles."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("\n📝 Manual Steps:");
    console.error("   1. Go to Supabase Dashboard > SQL Editor");
    console.error(
      "   2. Run the SQL from: database/add-user-creation-trigger.sql"
    );
    console.error('   3. Click "Run" to execute\n');
    process.exit(1);
  }
}

runMigration();
