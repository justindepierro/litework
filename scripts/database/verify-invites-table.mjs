#!/usr/bin/env node

/**
 * Verify Invites Table Exists
 * Checks if the invites table exists and creates it if needed
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error(
    "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyInvitesTable() {
  try {
    console.log("🔍 Checking if invites table exists...");

    // Try to query the invites table
    const { data, error } = await supabase
      .from("invites")
      .select("id")
      .limit(1);

    if (error) {
      if (error.message.includes("does not exist") || error.code === "42P01") {
        console.log("❌ Invites table does not exist");
        console.log("📝 Creating invites table...");

        // Read the SQL file
        const sqlPath = join(
          __dirname,
          "../../database/create-invites-table.sql"
        );
        const sql = readFileSync(sqlPath, "utf-8");

        // Execute the SQL
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql_query: sql,
        });

        if (createError) {
          console.error("❌ Failed to create invites table:", createError);
          console.log(
            "\n📋 Please run this SQL manually in Supabase SQL Editor:"
          );
          console.log(sql);
          process.exit(1);
        }

        console.log("✅ Invites table created successfully");
      } else {
        console.error("❌ Error checking invites table:", error);
        process.exit(1);
      }
    } else {
      console.log("✅ Invites table exists");
      console.log(`📊 Current invites count: ${data?.length || 0}`);
    }

    // Verify the table structure
    console.log("\n🔍 Verifying table structure...");
    const { data: invites, error: queryError } = await supabase
      .from("invites")
      .select("*")
      .limit(5);

    if (queryError) {
      console.error("❌ Error querying invites:", queryError);
      process.exit(1);
    }

    console.log("✅ Table structure verified");
    console.log(
      `📊 Sample invites (showing ${invites?.length || 0} of total):`
    );

    if (invites && invites.length > 0) {
      invites.forEach((invite) => {
        console.log(
          `  - ${invite.first_name} ${invite.last_name} <${invite.email}> - Status: ${invite.status}`
        );
      });
    } else {
      console.log("  (No invites yet)");
    }

    console.log("\n✅ Invites table verification complete!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

// Run verification
verifyInvitesTable();
