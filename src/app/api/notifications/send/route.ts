/**
 * API Route: /api/notifications/send
 * Sends push notifications to users (coach/admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasRoleOrHigher, isCoach } from '@/lib/auth-server';
import { sendPushNotification, sendPushNotificationToUsers } from '@/lib/notification-service';
import type { PushNotificationPayload } from '@/lib/notification-service';

/**
 * POST /api/notifications/send
 * Send push notification to one or multiple users
 * 
 * Body:
 * - userId?: string - Send to single user
 * - userIds?: string[] - Send to multiple users
 * - payload: PushNotificationPayload - Notification content
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }
  
  if (!isCoach(user)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden - Coach access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, userIds, payload } = body as {
      userId?: string;
      userIds?: string[];
      payload: PushNotificationPayload;
    };

      // Validate payload
      if (!payload || !payload.title) {
        return NextResponse.json(
          { error: 'Invalid payload: title is required' },
          { status: 400 }
        );
      }

      // Validate recipients
      if (!userId && (!userIds || userIds.length === 0)) {
        return NextResponse.json(
          { error: 'Either userId or userIds must be provided' },
          { status: 400 }
        );
      }

      // Send to single user
      if (userId) {
        const result = await sendPushNotification(userId, payload);
        
        return NextResponse.json({
          success: result.success,
          sent: result.sent,
          failed: result.failed,
          errors: result.errors
        });
      }

      // Send to multiple users
      if (userIds && userIds.length > 0) {
        const results = await sendPushNotificationToUsers(userIds, payload);
        
        // Aggregate results
        const totalSent = Object.values(results).reduce((sum, r) => sum + r.sent, 0);
        const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
        const allErrors = Object.entries(results)
          .filter(([, r]) => r.errors && r.errors.length > 0)
          .map(([userId, r]) => ({
            userId,
            errors: r.errors
          }));

        return NextResponse.json({
          success: totalSent > 0,
          sent: totalSent,
          failed: totalFailed,
          results,
          errors: allErrors.length > 0 ? allErrors : undefined
      });
    }

    return NextResponse.json(
      { error: 'No valid recipients specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error sending push notifications:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}