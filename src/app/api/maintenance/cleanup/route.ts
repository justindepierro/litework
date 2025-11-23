/**
 * Cron Job: Database Cleanup
 * Runs daily at 2 AM to clean up old/expired data
 *
 * External Cron: Daily at 2 AM
 * Manual Trigger: Admin only
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAdminClient,
  getAuthenticatedUser,
  isAdmin,
} from "@/lib/auth-server";

/**
 * GET /api/maintenance/cleanup
 * Clean up expired invites, old sessions, and orphaned data
 *
 * Protected: Cron secret OR admin user required
 */
export async function GET(request: NextRequest) {
  try {
    // Check for cron secret first (for automated runs)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    const isCronRequest = cronSecret && authHeader === `Bearer ${cronSecret}`;

    // If not a cron request, require admin authentication
    if (!isCronRequest) {
      const { user } = await getAuthenticatedUser();

      if (!user || !isAdmin(user)) {
        console.error(
          "❌ Unauthorized maintenance request - admin access required"
        );
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 401 }
        );
      }

      console.log(`🔐 Manual cleanup triggered by admin: ${user.email}`);
    }

    // [REMOVED] console.log('🧹 Starting database cleanup...');

    const supabase = getAdminClient();
    const results = {
      expiredInvites: 0,
      oldSessions: 0,
      orphanedData: 0,
    };

    // 1. Soft-delete expired invites (older than expiry date)
    // Changed from hard delete to soft delete to maintain historical data
    const { data: expiredInvites, error: invitesError } = await supabase
      .from("invites")
      .update({ deleted_at: new Date().toISOString() })
      .lt("expires_at", new Date().toISOString())
      .is("deleted_at", null) // Only soft-delete invites that aren't already deleted
      .select("id");

    if (!invitesError && expiredInvites) {
      results.expiredInvites = expiredInvites.length;
      // [REMOVED] console.log(`✅ Soft-deleted ${results.expiredInvites} expired invites`);
    }

    // 2. Delete old workout sessions (completed > 90 days ago)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: oldSessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .delete()
      .eq("status", "completed")
      .lt("completed_at", ninetyDaysAgo.toISOString())
      .select("id");

    if (!sessionsError && oldSessions) {
      results.oldSessions = oldSessions.length;
      // [REMOVED] console.log(`✅ Deleted ${results.oldSessions} old workout sessions`);
    }

    // 3. Soft-delete cancelled invites older than 30 days
    // Changed from hard delete to soft delete to maintain historical data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: cancelledInvites, error: cancelledError } = await supabase
      .from("invites")
      .update({ deleted_at: new Date().toISOString() })
      .eq("status", "cancelled")
      .lt("updated_at", thirtyDaysAgo.toISOString())
      .is("deleted_at", null) // Only soft-delete invites that aren't already deleted
      .select("id");

    if (!cancelledError && cancelledInvites) {
      results.orphanedData = cancelledInvites.length;
      // [REMOVED] console.log(`✅ Soft-deleted ${results.orphanedData} old cancelled invites`);
    }

    // [REMOVED] console.log('✅ Database cleanup completed:', results);

    return NextResponse.json({
      success: true,
      message: "Database cleanup completed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
