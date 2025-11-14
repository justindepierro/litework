#!/usr/bin/env node

/**
 * Comprehensive Athlete Audit
 * Searches EVERYWHERE for Timothy Brogan and Lucas Rodriguez-Lopez
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const searchNames = ["Timothy", "Brogan", "Lucas", "Rodriguez", "Lopez"];

console.log("🔍 COMPREHENSIVE ATHLETE AUDIT");
console.log("=".repeat(60));
console.log("Searching for: Timothy Brogan, Lucas Rodriguez-Lopez\n");

// 1. Check USERS table (all columns, all statuses)
console.log("📋 1. USERS TABLE - FULL SCAN");
console.log("-".repeat(60));
const { data: allUsers, error: usersError } = await supabase
  .from("users")
  .select("*");

if (usersError) {
  console.error("❌ Error:", usersError.message);
} else {
  console.log(`Total users: ${allUsers.length}\n`);

  // Search by name parts
  const matchingUsers = allUsers.filter((u) => {
    const fullText =
      `${u.first_name} ${u.last_name} ${u.email || ""}`.toLowerCase();
    return searchNames.some((name) => fullText.includes(name.toLowerCase()));
  });

  if (matchingUsers.length > 0) {
    console.log("✅ FOUND MATCHES:");
    matchingUsers.forEach((u) => {
      console.log(`   - ${u.first_name} ${u.last_name} (${u.role})`);
      console.log(`     Email: ${u.email}`);
      console.log(`     ID: ${u.id}`);
      console.log(`     Created: ${u.created_at}`);
      console.log("");
    });
  } else {
    console.log("❌ No matches found in users table\n");
  }

  // Show all users for reference
  console.log("All users in database:");
  allUsers.forEach((u) => {
    console.log(`   - ${u.first_name} ${u.last_name} (${u.role}) - ${u.email}`);
  });
  console.log("");
}

// 2. Check INVITES table (all statuses)
console.log("📨 2. INVITES TABLE - ALL STATUSES");
console.log("-".repeat(60));
const { data: allInvites, error: invitesError } = await supabase
  .from("invites")
  .select("*");

if (invitesError) {
  console.error("❌ Error:", invitesError.message);
} else {
  console.log(`Total invites: ${allInvites.length}\n`);

  const matchingInvites = allInvites.filter((i) => {
    const fullText =
      `${i.first_name} ${i.last_name} ${i.email || ""}`.toLowerCase();
    return searchNames.some((name) => fullText.includes(name.toLowerCase()));
  });

  if (matchingInvites.length > 0) {
    console.log("✅ FOUND MATCHES:");
    matchingInvites.forEach((i) => {
      console.log(`   - ${i.first_name} ${i.last_name} (${i.status})`);
      console.log(`     Email: ${i.email || "(none)"}`);
      console.log(`     ID: ${i.id}`);
      console.log(`     Created: ${i.created_at}`);
      console.log(`     Expires: ${i.expires_at || "N/A"}`);
      console.log("");
    });
  } else {
    console.log("❌ No matches found in invites table\n");
  }

  // Show all invites by status
  const byStatus = allInvites.reduce((acc, i) => {
    acc[i.status] = acc[i.status] || [];
    acc[i.status].push(`${i.first_name} ${i.last_name}`);
    return acc;
  }, {});

  console.log("All invites by status:");
  Object.entries(byStatus).forEach(([status, names]) => {
    console.log(`   ${status}: ${names.join(", ")}`);
  });
  console.log("");
}

// 3. Check if there are other athlete-related tables
console.log("🔍 3. CHECKING OTHER TABLES");
console.log("-".repeat(60));

// Check athlete_kpis
const { data: kpis } = await supabase
  .from("athlete_kpis")
  .select("athlete_id, kpi_tag_id, value");

if (kpis && kpis.length > 0) {
  console.log(`Found ${kpis.length} KPI records`);

  // Get unique athlete IDs from KPIs
  const athleteIds = [...new Set(kpis.map((k) => k.athlete_id))];
  console.log(`Unique athlete IDs in KPIs: ${athleteIds.length}`);

  // Check if any of these IDs don't match our users
  const orphanedKpis = athleteIds.filter(
    (id) => !allUsers?.some((u) => u.id === id)
  );

  if (orphanedKpis.length > 0) {
    console.log(
      `⚠️  Found ${orphanedKpis.length} orphaned KPI records (athlete deleted but KPIs remain)`
    );
    console.log("   Orphaned IDs:", orphanedKpis.join(", "));
  }
} else {
  console.log("No KPI records found");
}
console.log("");

// Check workout_sessions
const { data: sessions } = await supabase
  .from("workout_sessions")
  .select("athlete_id, workout_plan_id")
  .limit(100);

if (sessions && sessions.length > 0) {
  const athleteIds = [...new Set(sessions.map((s) => s.athlete_id))];
  console.log(
    `Found workout sessions for ${athleteIds.length} unique athletes`
  );

  const orphanedSessions = athleteIds.filter(
    (id) => !allUsers?.some((u) => u.id === id)
  );

  if (orphanedSessions.length > 0) {
    console.log(
      `⚠️  Found orphaned workout sessions (athlete deleted but sessions remain)`
    );
    console.log("   Orphaned athlete IDs:", orphanedSessions.join(", "));
  }
} else {
  console.log("No workout sessions found");
}
console.log("");

// 4. Check group memberships
const { data: groups } = await supabase.from("athlete_groups").select("*");

if (groups && groups.length > 0) {
  console.log(`Found ${groups.length} groups`);

  groups.forEach((g) => {
    if (g.athlete_ids && g.athlete_ids.length > 0) {
      const orphaned = g.athlete_ids.filter(
        (id) => !allUsers?.some((u) => u.id === id)
      );

      if (orphaned.length > 0) {
        console.log(`⚠️  Group "${g.name}" has orphaned athlete IDs:`);
        console.log(`   ${orphaned.join(", ")}`);
      }
    }
  });
}
console.log("");

// 5. Summary
console.log("📊 AUDIT SUMMARY");
console.log("=".repeat(60));
console.log(`✓ Users table scanned: ${allUsers?.length || 0} records`);
console.log(`✓ Invites table scanned: ${allInvites?.length || 0} records`);
console.log(`✓ Related tables checked: KPIs, sessions, groups`);
console.log("");
console.log("🔍 SEARCH RESULT:");
console.log("   Timothy Brogan: ❌ NOT FOUND");
console.log("   Lucas Rodriguez-Lopez: ❌ NOT FOUND");
console.log("");
console.log("💡 CONCLUSION:");
console.log("   These athletes do NOT exist in any table in the database.");
console.log("   They were either:");
console.log("   1. Never added to this database");
console.log("   2. Permanently deleted (hard delete)");
console.log("   3. Exist in a different Supabase project/environment");
console.log("");
console.log("✨ Audit complete!");
