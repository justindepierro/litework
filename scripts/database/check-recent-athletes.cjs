#!/usr/bin/env node
/**
 * Check for recently created athlete users that might have come from deleted invites
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentAthletes() {
  console.log("🔍 Checking for recent athlete accounts...\n");

  try {
    // Get all athletes created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: athletes, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at, deleted_at")
      .eq("role", "athlete")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(
      `📊 ATHLETES CREATED IN LAST 30 DAYS: ${athletes?.length || 0}\n`
    );

    if (!athletes || athletes.length === 0) {
      console.log("✅ No athletes created in the last 30 days.");
      return;
    }

    const activeAthletes = athletes.filter((a) => !a.deleted_at);
    const deletedAthletes = athletes.filter((a) => a.deleted_at);

    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.log(`👤 ACTIVE ATHLETES: ${activeAthletes.length}`);
    console.log(`🗑️  DELETED ATHLETES: ${deletedAthletes.length}\n`);
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    if (activeAthletes.length > 0) {
      console.log("👤 ACTIVE ATHLETES (recently created):\n");
      activeAthletes.forEach((athlete, index) => {
        const daysSinceCreated = Math.floor(
          (new Date() - new Date(athlete.created_at)) / (1000 * 60 * 60 * 24)
        );

        console.log(`${index + 1}. ${athlete.first_name} ${athlete.last_name}`);
        console.log(`   Email: ${athlete.email}`);
        console.log(
          `   Created: ${new Date(athlete.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`
        );
        console.log(`   ID: ${athlete.id}\n`);
      });
    }

    if (deletedAthletes.length > 0) {
      console.log("\n🗑️  DELETED ATHLETES (recently created then deleted):\n");
      deletedAthletes.forEach((athlete, index) => {
        const daysSinceCreated = Math.floor(
          (new Date() - new Date(athlete.created_at)) / (1000 * 60 * 60 * 24)
        );
        const daysSinceDeleted = Math.floor(
          (new Date() - new Date(athlete.deleted_at)) / (1000 * 60 * 60 * 24)
        );

        console.log(`${index + 1}. ${athlete.first_name} ${athlete.last_name}`);
        console.log(`   Email: ${athlete.email}`);
        console.log(
          `   Created: ${new Date(athlete.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`
        );
        console.log(
          `   Deleted: ${new Date(athlete.deleted_at).toLocaleDateString()} (${daysSinceDeleted} days ago)`
        );
        console.log(`   ID: ${athlete.id}`);
        console.log(`   💡 Can be recovered by setting deleted_at = NULL\n`);
      });
    }

    // Check audit trail for deleted invites
    console.log("\n🔍 Checking audit trail for deleted invites...\n");

    const { data: auditLogs, error: auditError } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("table_name", "invites")
      .eq("action", "delete")
      .order("performed_at", { ascending: false })
      .limit(10);

    if (auditError) {
      console.log("⚠️  No audit_trail table found or error accessing it.");
    } else if (auditLogs && auditLogs.length > 0) {
      console.log("📋 RECENT INVITE DELETIONS (from audit trail):\n");
      auditLogs.forEach((log, index) => {
        console.log(
          `${index + 1}. Deleted at: ${new Date(log.performed_at).toLocaleDateString()}`
        );
        console.log(`   Performed by: ${log.user_id || "system"}`);
        console.log(`   Record ID: ${log.record_id}`);
        if (log.old_values) {
          console.log(
            `   Old values: ${JSON.stringify(log.old_values, null, 2)}`
          );
        }
        console.log("");
      });
    } else {
      console.log("✅ No invite deletions found in audit trail.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkRecentAthletes();
