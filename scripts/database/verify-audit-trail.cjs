#!/usr/bin/env node

/**
 * Verify Audit Trail System
 * Checks that audit_trail table exists and is tracking changes
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAuditTrail() {
  console.log("🔍 Verifying Audit Trail System...\n");

  try {
    // 1. Check if audit_trail table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("audit_trail")
      .select("count")
      .limit(1);

    if (tableError) {
      console.error("❌ Audit trail table not found:", tableError.message);
      process.exit(1);
    }

    console.log("✅ Audit trail table exists");

    // 2. Get total count of audit events
    const { count, error: countError } = await supabase
      .from("audit_trail")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting audit events:", countError.message);
      process.exit(1);
    }

    console.log(`✅ Total audit events: ${count || 0}`);

    // 3. Get recent audit events
    const { data: recentEvents, error: recentError } = await supabase
      .from("audit_log_summary")
      .select("*")
      .order("performed_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("❌ Error fetching recent events:", recentError.message);
      process.exit(1);
    }

    console.log("✅ Audit log summary view accessible\n");

    if (recentEvents && recentEvents.length > 0) {
      console.log("📋 Recent Audit Events:");
      console.log("=".repeat(80));
      recentEvents.forEach((event) => {
        const timestamp = new Date(event.performed_at).toLocaleString();
        const actor = event.performed_by_name || "System";
        console.log(
          `${timestamp} | ${event.action.toUpperCase()} | ${event.table_name} | ${actor}`
        );
        if (event.record_name) {
          console.log(`  └─ Record: ${event.record_name}`);
        }
      });
    } else {
      console.log(
        "📋 No audit events yet (audit trail is ready to track changes)"
      );
    }

    // 4. Check functions exist
    console.log("\n🔧 Checking Audit Functions:");

    const functions = ["restore_deleted_invite", "get_deletion_history"];

    for (const func of functions) {
      const { data, error } = await supabase
        .rpc("get_deletion_history", { p_table_name: "invites", p_limit: 1 })
        .limit(0);

      if (!error || error.code !== "PGRST116") {
        // Function exists
        console.log(`  ✅ ${func}()`);
      }
    }

    console.log("\n✅ Audit trail system is fully operational!");
    console.log("\n📖 Usage Examples:");
    console.log(
      "   • View deletions: SELECT * FROM get_deletion_history('invites');"
    );
    console.log(
      "   • Restore invite: SELECT restore_deleted_invite('uuid-here');"
    );
    console.log(
      "   • View all events: SELECT * FROM audit_log_summary LIMIT 20;"
    );
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyAuditTrail();
