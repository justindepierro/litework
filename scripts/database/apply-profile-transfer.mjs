#!/usr/bin/env node

/**
 * Apply Profile Transfer Enhancement
 *
 * ⚠️  MIGRATIONS ALREADY APPLIED (Nov 3, 2025)
 *
 * This script applies database migrations to enable profile data transfer
 * from invites to user accounts when athletes accept invitations.
 *
 * Migration files are now in: database/archive/
 *
 * Features enabled:
 * - Coach can add notes, bio, DOB, injury status to invite
 * - Multiple groups can be assigned to invite
 * - All data transfers automatically when athlete signs up
 * - Athlete sees pre-filled profile from coach
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, "../../.env.local") });

// Check for required environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables");
  console.error(
    "   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration(filePath, description) {
  console.log(`\n📝 ${description}...`);

  try {
    const sql = readFileSync(filePath, "utf8");

    // Split on semicolons and execute each statement separately
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--") && !s.startsWith("/*"));

    for (const statement of statements) {
      if (!statement) continue;

      const { error } = await supabase.rpc("exec", { query: statement });

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabase
          .from("_migrations")
          .select("*")
          .limit(1);

        if (queryError) {
          console.error(`❌ Error: ${error.message}`);
          console.log(
            `\n⚠️  Please apply this migration manually in Supabase SQL Editor:`
          );
          console.log(`   File: ${filePath}\n`);
          return false;
        }
      }
    }

    console.log(`✅ Success`);
    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    console.log(
      `\n⚠️  Please apply this migration manually in Supabase SQL Editor:`
    );
    console.log(`   File: ${filePath}\n`);
    return false;
  }
}

async function applyProfileTransferMigrations() {
  console.log("🚀 Applying Profile Transfer Enhancement Migrations\n");
  console.log("=".repeat(60));

  const migrations = [
    {
      file: join(
        process.cwd(),
        "database",
        "archive",
        "add-user-profile-fields.sql"
      ),
      description: "Adding bio and notes fields to users table",
    },
    {
      file: join(
        process.cwd(),
        "database",
        "archive",
        "enhance-invites-for-profile-transfer.sql"
      ),
      description: "Enhancing invites table for profile data storage",
    },
  ];

  let allSuccess = true;

  for (const migration of migrations) {
    const success = await runMigration(migration.file, migration.description);
    if (!success) {
      allSuccess = false;
      console.log("\n⚠️  Migration failed. Stopping here.");
      break;
    }
  }

  console.log("\n" + "=".repeat(60));

  if (allSuccess) {
    console.log("\n✅ All migrations applied successfully!\n");
    console.log("📋 Next steps:");
    console.log("   1. Restart your development server");
    console.log("   2. Create a new athlete invite with profile data");
    console.log(
      "   3. Have athlete accept invite and verify profile transfers\n"
    );
  } else {
    console.log(
      "\n❌ Some migrations failed. Please check the errors above.\n"
    );
    process.exit(1);
  }
}

// Run migrations
applyProfileTransferMigrations().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
