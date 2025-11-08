/**
 * Cron Job: Database Cleanup
 * Runs daily at 2 AM to clean up old/expired data
 * 
 * External Cron: Daily at 2 AM
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/auth-server';

/**
 * GET /api/maintenance/cleanup
 * Clean up expired invites, old sessions, and orphaned data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized maintenance request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // [REMOVED] console.log('🧹 Starting database cleanup...');

    const supabase = getAdminClient();
    const results = {
      expiredInvites: 0,
      oldSessions: 0,
      orphanedData: 0,
    };

    // 1. Delete expired invites (older than expiry date)
    const { data: expiredInvites, error: invitesError } = await supabase
      .from('invites')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (!invitesError && expiredInvites) {
      results.expiredInvites = expiredInvites.length;
      // [REMOVED] console.log(`✅ Deleted ${results.expiredInvites} expired invites`);
    }

    // 2. Delete old workout sessions (completed > 90 days ago)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: oldSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('status', 'completed')
      .lt('completed_at', ninetyDaysAgo.toISOString())
      .select('id');

    if (!sessionsError && oldSessions) {
      results.oldSessions = oldSessions.length;
      // [REMOVED] console.log(`✅ Deleted ${results.oldSessions} old workout sessions`);
    }

    // 3. Clean up cancelled invites older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: cancelledInvites, error: cancelledError } = await supabase
      .from('invites')
      .delete()
      .eq('status', 'cancelled')
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .select('id');

    if (!cancelledError && cancelledInvites) {
      results.orphanedData = cancelledInvites.length;
      // [REMOVED] console.log(`✅ Deleted ${results.orphanedData} old cancelled invites`);
    }

    // [REMOVED] console.log('✅ Database cleanup completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
