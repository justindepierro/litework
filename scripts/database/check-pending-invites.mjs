#!/usr/bin/env node
/**
 * Check for pending/hanging invites in the database
 * Shows all invites with status 'pending' or 'draft'
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPendingInvites() {
  console.log("🔍 Checking for pending/hanging invites...\n");

  try {
    // Get all invites with status pending or draft (including soft-deleted)
    const { data: allInvites, error: allError } = await supabase
      .from("invites")
      .select(
        "id, email, first_name, last_name, status, expires_at, created_at, deleted_at"
      )
      .in("status", ["pending", "draft"])
      .order("created_at", { ascending: false });

    if (allError) throw allError;

    console.log(
      `📊 TOTAL INVITES (pending/draft): ${allInvites?.length || 0}\n`
    );

    if (!allInvites || allInvites.length === 0) {
      console.log("✅ No pending or draft invites found.");
      return;
    }

    // Separate by status
    const activeInvites = allInvites.filter((i) => !i.deleted_at);
    const softDeletedInvites = allInvites.filter((i) => i.deleted_at);
    const expiredInvites = allInvites.filter(
      (i) =>
        i.expires_at && new Date(i.expires_at) < new Date() && !i.deleted_at
    );

    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );
    console.log(`📌 ACTIVE INVITES (not deleted): ${activeInvites.length}`);
    console.log(`🗑️  SOFT-DELETED INVITES: ${softDeletedInvites.length}`);
    console.log(`⏰ EXPIRED (but not deleted): ${expiredInvites.length}\n`);
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    // Show active invites
    if (activeInvites.length > 0) {
      console.log("📋 ACTIVE PENDING/DRAFT INVITES:\n");
      activeInvites.forEach((invite, index) => {
        const isExpired =
          invite.expires_at && new Date(invite.expires_at) < new Date();
        const daysSinceCreated = Math.floor(
          (new Date() - new Date(invite.created_at)) / (1000 * 60 * 60 * 24)
        );

        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email || "(draft - no email)"}`);
        console.log(
          `   Status: ${invite.status} ${isExpired ? "⚠️ EXPIRED" : "✅ Active"}`
        );
        console.log(
          `   Created: ${new Date(invite.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`
        );
        if (invite.expires_at) {
          console.log(
            `   Expires: ${new Date(invite.expires_at).toLocaleDateString()}`
          );
        }
        console.log(`   ID: ${invite.id}\n`);
      });
    }

    // Show soft-deleted invites
    if (softDeletedInvites.length > 0) {
      console.log("\n🗑️  SOFT-DELETED INVITES (marked deleted but in DB):\n");
      softDeletedInvites.forEach((invite, index) => {
        const daysSinceDeleted = Math.floor(
          (new Date() - new Date(invite.deleted_at)) / (1000 * 60 * 60 * 24)
        );

        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email || "(draft - no email)"}`);
        console.log(`   Status: ${invite.status}`);
        console.log(
          `   Deleted: ${new Date(invite.deleted_at).toLocaleDateString()} (${daysSinceDeleted} days ago)`
        );
        console.log(`   ID: ${invite.id}\n`);
      });
    }

    // Show expired invites that need cleanup
    if (expiredInvites.length > 0) {
      console.log("\n⚠️  EXPIRED INVITES (candidates for next cleanup run):\n");
      expiredInvites.forEach((invite, index) => {
        const daysSinceExpired = Math.floor(
          (new Date() - new Date(invite.expires_at)) / (1000 * 60 * 60 * 24)
        );

        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email}`);
        console.log(
          `   Expired: ${new Date(invite.expires_at).toLocaleDateString()} (${daysSinceExpired} days ago)`
        );
        console.log(`   ID: ${invite.id}\n`);
      });
      console.log(
        `💡 These ${expiredInvites.length} invites will be soft-deleted in next cleanup run (daily at 2 AM)\n`
      );
    }
  } catch (error) {
    console.error("❌ Error checking invites:", error);
    process.exit(1);
  }
}

checkPendingInvites();
