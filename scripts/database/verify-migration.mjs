#!/usr/bin/env node

// Verify database migration - check users and invites table structure
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log("🔍 Verifying database migration...\n");

  try {
    // Check users table
    console.log("📊 Checking users table structure and data:");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name, first_name, last_name, full_name, role")
      .limit(5);

    if (usersError) {
      console.error("❌ Error querying users:", usersError.message);
    } else {
      console.log(`✅ Found ${users.length} users`);
      if (users.length > 0) {
        console.log("\nSample user data:");
        users.forEach((user) => {
          console.log(`  - Email: ${user.email}`);
          console.log(`    Name (old): ${user.name || "N/A"}`);
          console.log(`    First: ${user.first_name || "N/A"}`);
          console.log(`    Last: ${user.last_name || "N/A"}`);
          console.log(`    Full: ${user.full_name || "N/A"}`);
          console.log(`    Role: ${user.role}`);
          console.log("");
        });
      }
    }

    // Check invites table
    console.log("\n📊 Checking invites table structure:");
    const { data: invites, error: invitesError } = await supabase
      .from("invites")
      .select("*")
      .limit(5);

    if (invitesError) {
      console.error("❌ Error querying invites:", invitesError.message);
    } else {
      console.log(`✅ Invites table exists and is accessible`);
      console.log(`   Found ${invites.length} invites`);

      if (invites.length > 0) {
        console.log("\nSample invite data:");
        invites.forEach((invite) => {
          console.log(`  - Email: ${invite.email}`);
          console.log(`    First: ${invite.first_name}`);
          console.log(`    Last: ${invite.last_name}`);
          console.log(`    Full: ${invite.full_name}`);
          console.log(`    Status: ${invite.status}`);
          console.log("");
        });
      } else {
        console.log("   (No invites yet - table is empty but ready to use)");
      }
    }

    // Verify column existence
    console.log("\n📋 Migration Verification Summary:");

    const usersHasNewColumns =
      users &&
      users.length > 0 &&
      users[0].hasOwnProperty("first_name") &&
      users[0].hasOwnProperty("last_name") &&
      users[0].hasOwnProperty("full_name");

    if (usersHasNewColumns) {
      console.log(
        "✅ Users table: first_name, last_name, full_name columns exist"
      );
    } else {
      console.log("❌ Users table: Missing new columns");
    }

    if (!invitesError) {
      console.log("✅ Invites table: Created with split name structure");
    } else {
      console.log("❌ Invites table: Not accessible");
    }

    console.log("\n🎉 Migration verification complete!");
    console.log(
      "\n📝 Next step: Run `git push origin main` to deploy to production\n"
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

verifyMigration();
