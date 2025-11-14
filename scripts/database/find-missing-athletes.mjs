#!/usr/bin/env node

/**
 * Find missing athletes in the database
 * Searches for specific names across users and invites tables
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const missingNames = ["Timothy Brogan", "Lucas Rodriguez-Lopez"];

console.log("🔍 Searching for missing athletes...\n");

// Search in users table
console.log("📋 Checking USERS table:");
const { data: users, error: usersError } = await supabase
  .from("users")
  .select("id, first_name, last_name, email, role, created_at")
  .order("created_at", { ascending: false });

if (usersError) {
  console.error("Error fetching users:", usersError);
} else {
  console.log(`Found ${users.length} total users:\n`);

  users.forEach((user) => {
    const fullName = `${user.first_name} ${user.last_name}`;
    const isMatch = missingNames.some(
      (name) =>
        fullName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(fullName.toLowerCase())
    );

    if (isMatch) {
      console.log("✅ FOUND:", fullName);
      console.log("   Email:", user.email);
      console.log("   Role:", user.role);
      console.log("   ID:", user.id);
      console.log("   Created:", new Date(user.created_at).toLocaleString());
      console.log("");
    }
  });

  // Show all users by role
  const byRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  console.log("Users by role:", byRole);
  console.log("");
}

// Search in invites table
console.log("📨 Checking INVITES table:");
const { data: invites, error: invitesError } = await supabase
  .from("invites")
  .select("id, first_name, last_name, email, status, created_at")
  .order("created_at", { ascending: false });

if (invitesError) {
  console.error("Error fetching invites:", invitesError);
} else {
  console.log(`Found ${invites.length} total invites:\n`);

  invites.forEach((invite) => {
    const fullName = `${invite.first_name} ${invite.last_name}`;
    const isMatch = missingNames.some(
      (name) =>
        fullName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(fullName.toLowerCase())
    );

    if (isMatch) {
      console.log("✅ FOUND:", fullName);
      console.log("   Email:", invite.email || "(no email)");
      console.log("   Status:", invite.status);
      console.log("   ID:", invite.id);
      console.log("   Created:", new Date(invite.created_at).toLocaleString());
      console.log("");
    }
  });

  // Show all invites by status
  const byStatus = invites.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  console.log("Invites by status:", byStatus);
  console.log("");
}

// List ALL names for reference
console.log("\n📋 ALL NAMES IN DATABASE:");
console.log("\nUSERS:");
users?.forEach((u) => {
  console.log(`  - ${u.first_name} ${u.last_name} (${u.role})`);
});

console.log("\nINVITES:");
invites?.forEach((i) => {
  console.log(`  - ${i.first_name} ${i.last_name} (${i.status})`);
});

console.log("\n✨ Search complete!");
