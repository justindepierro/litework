#!/usr/bin/env node

// Clean up test users - keep only Justin DePierro
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestUsers() {
  console.log("🧹 Cleaning up test users...\n");

  try {
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role");

    if (fetchError) {
      console.error("❌ Error fetching users:", fetchError.message);
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} users:\n`);
    users.forEach((user) => {
      console.log(
        `  - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`
      );
    });

    // Filter to find test users (everyone except Justin DePierro)
    const testUsers = users.filter(
      (u) => u.email !== "jdepierro@burkecatholic.org"
    );

    if (testUsers.length === 0) {
      console.log("\n✅ No test users to delete!");
      return;
    }

    console.log(`\n🗑️  Deleting ${testUsers.length} test users...\n`);

    // Delete from users table
    for (const user of testUsers) {
      console.log(
        `  Deleting: ${user.first_name} ${user.last_name} (${user.email})`
      );

      // Delete user profile
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteError) {
        console.error(`    ❌ Error deleting user: ${deleteError.message}`);
      } else {
        console.log(`    ✅ Deleted from users table`);
      }

      // Delete from auth.users (if exists)
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
          user.id
        );
        if (authDeleteError) {
          console.log(`    ⚠️  Auth delete: ${authDeleteError.message}`);
        } else {
          console.log(`    ✅ Deleted from auth`);
        }
      } catch (e) {
        console.log(`    ⚠️  Could not delete from auth (may not exist)`);
      }
    }

    console.log("\n✅ Cleanup complete!\n");

    // Verify remaining users
    const { data: remaining } = await supabase
      .from("users")
      .select("email, first_name, last_name, role");

    console.log("📋 Remaining users:");
    remaining.forEach((user) => {
      console.log(
        `  ✅ ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`
      );
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

cleanupTestUsers();
