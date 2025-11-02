/**
 * Notification Service
 * Handles push and email notifications for LiteWork
 * Created: November 2, 2025
 */

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  category?: NotificationCategory;
  data?: Record<string, unknown>;
}

export type NotificationCategory = 
  | 'workout'
  | 'message'
  | 'assignment'
  | 'progress'
  | 'achievement'
  | 'invite';

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  device_name?: string;
  user_agent?: string;
  last_used: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  workout_reminders: boolean;
  assignment_notifications: boolean;
  message_notifications: boolean;
  progress_updates: boolean;
  achievement_notifications: boolean;
  quiet_hours?: {
    start: string;
    end: string;
    timezone: string;
  };
  preferred_contact: 'push' | 'email' | 'both';
}

interface SendNotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors?: Array<{ device: string; error: string }>;
}

// ============================================================
// CONFIGURATION
// ============================================================

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@litework.app';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('❌ VAPID keys not configured. Push notifications will not work.');
  console.error('Please add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to .env.local');
} else {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Supabase client for database operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================================

/**
 * Send push notification to a specific user
 * Sends to all of the user's registered devices
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendNotificationResult> {
  try {
    // 1. Check user's notification preferences
    const prefs = await getUserPreferences(userId);
    
    if (!prefs || !prefs.push_enabled) {
      console.log(`⏭️  Push notifications disabled for user ${userId}`);
      return { success: true, sent: 0, failed: 0 };
    }

    // 2. Check if notification category is enabled
    if (!isCategoryEnabled(prefs, payload.category)) {
      console.log(`⏭️  Category '${payload.category}' disabled for user ${userId}`);
      return { success: true, sent: 0, failed: 0 };
    }

    // 3. Check quiet hours
    if (isQuietHours(prefs.quiet_hours)) {
      console.log(`🔕 Quiet hours active for user ${userId}, skipping notification`);
      return { success: true, sent: 0, failed: 0 };
    }

    // 4. Get all active push subscriptions for user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`📵 No push subscriptions found for user ${userId}`);
      return { success: true, sent: 0, failed: 0 };
    }

    // 5. Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      url: payload.url || '/',
      data: {
        ...payload.data,
        category: payload.category,
        timestamp: new Date().toISOString(),
      }
    });

    // 6. Send to all devices
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              }
            },
            notificationPayload,
            {
              TTL: 24 * 60 * 60, // 24 hours
            }
          );

          // Update last_used timestamp
          await supabase
            .from('push_subscriptions')
            .update({ last_used: new Date().toISOString() })
            .eq('id', sub.id);

          // Log successful delivery
          await logNotification({
            user_id: userId,
            type: 'push',
            category: payload.category || 'message',
            title: payload.title,
            body: payload.body,
            url: payload.url,
            delivered: true,
            device_info: {
              device_name: sub.device_name,
              user_agent: sub.user_agent,
            }
          });

          return { success: true, device: sub.device_name || sub.endpoint };
        } catch (error) {
          const err = error as Error & { statusCode?: number };
          console.error(`❌ Failed to send to device ${sub.device_name}:`, err);

          // If subscription is invalid (410 Gone), remove it
          if (err.statusCode === 410) {
            console.log(`🗑️  Removing expired subscription: ${sub.id}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }

          // Log failed delivery
          await logNotification({
            user_id: userId,
            type: 'push',
            category: payload.category || 'message',
            title: payload.title,
            body: payload.body,
            url: payload.url,
            delivered: false,
            error: err.message,
            device_info: {
              device_name: sub.device_name,
              user_agent: sub.user_agent,
            }
          });

          return { success: false, device: sub.device_name || sub.endpoint, error: err.message };
        }
      })
    );

    // 7. Analyze results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    const errors = results
      .filter(r => r.status === 'fulfilled' && !r.value.success)
      .map(r => r.status === 'fulfilled' ? r.value : { device: 'unknown', error: 'unknown' });

    console.log(`✅ Push notification sent: ${successful} successful, ${failed} failed`);

    return {
      success: successful > 0,
      sent: successful,
      failed,
      errors: errors.length > 0 ? errors as Array<{ device: string; error: string }> : undefined
    };

  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<Record<string, SendNotificationResult>> {
  const results: Record<string, SendNotificationResult> = {};

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        results[userId] = await sendPushNotification(userId, payload);
      } catch (error) {
        console.error(`❌ Failed to send notification to user ${userId}:`, error);
        results[userId] = {
          success: false,
          sent: 0,
          failed: 1,
          errors: [{ device: 'all', error: error instanceof Error ? error.message : 'Unknown error' }]
        };
      }
    })
  );

  return results;
}

// ============================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================

/**
 * Save a new push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON,
  deviceName?: string,
  userAgent?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      throw new Error('Invalid subscription object');
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        device_name: deviceName,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      // If duplicate, update last_used instead
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('push_subscriptions')
          .update({ last_used: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint)
          .select()
          .single();

        if (updateError) throw updateError;
        
        return { success: true, id: updated.id };
      }
      throw error;
    }

    console.log(`✅ Push subscription saved for user ${userId}`);
    return { success: true, id: data.id };

  } catch (error) {
    console.error('❌ Error saving push subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) throw error;

    console.log(`🗑️  Push subscription removed for user ${userId}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error removing push subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================
// PREFERENCES MANAGEMENT
// ============================================================

/**
 * Get user's notification preferences
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences exist, create defaults
      if (error.code === 'PGRST116') {
        return await createDefaultPreferences(userId);
      }
      throw error;
    }

    return data as NotificationPreferences;

  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    return null;
  }
}

/**
 * Create default notification preferences for a user
 */
async function createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        push_enabled: true,
        email_enabled: true,
        workout_reminders: true,
        assignment_notifications: true,
        message_notifications: true,
        progress_updates: false,
        achievement_notifications: true,
        preferred_contact: 'push'
      })
      .select()
      .single();

    if (error) throw error;
    return data as NotificationPreferences;

  } catch (error) {
    console.error('❌ Error creating default preferences:', error);
    return null;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if a notification category is enabled for the user
 */
function isCategoryEnabled(prefs: NotificationPreferences, category?: NotificationCategory): boolean {
  if (!category) return true;

  const categoryMap: Record<NotificationCategory, keyof NotificationPreferences> = {
    workout: 'workout_reminders',
    assignment: 'assignment_notifications',
    message: 'message_notifications',
    progress: 'progress_updates',
    achievement: 'achievement_notifications',
    invite: 'message_notifications', // Invites use message notification preference
  };

  const prefKey = categoryMap[category];
  return prefs[prefKey] === true;
}

/**
 * Check if current time is within user's quiet hours
 */
function isQuietHours(quietHours?: { start: string; end: string; timezone: string }): boolean {
  if (!quietHours) return false;

  try {
    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: quietHours.timezone }));
    const hours = userTime.getHours();
    const minutes = userTime.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (endTime < startTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }

    return currentTime >= startTime && currentTime <= endTime;

  } catch (error) {
    console.error('❌ Error checking quiet hours:', error);
    return false;
  }
}

/**
 * Log notification to database for analytics
 */
async function logNotification(log: {
  user_id: string;
  type: 'push' | 'email';
  category: string;
  title: string;
  body?: string;
  url?: string;
  delivered: boolean;
  error?: string;
  device_info?: Record<string, unknown>;
  email_id?: string;
}): Promise<void> {
  try {
    await supabase
      .from('notification_log')
      .insert(log);
  } catch (error) {
    console.error('❌ Error logging notification:', error);
  }
}
