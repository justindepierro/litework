/**
 * Unified Notification Service
 * Handles both push and email notifications with smart fallback
 * Created: November 2, 2025
 */

import { sendPushNotification } from "./notification-service";
import { sendEmailNotification } from "./email-service";
import { getUserPreferences } from "./notification-service";
import { createClient } from "@supabase/supabase-js";
import type {
  PushNotificationPayload,
  NotificationCategory,
} from "./notification-service";
import type { EmailTemplateData } from "./email-service";

// Initialize Supabase client for in-app notifications
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================
// TYPES
// ============================================================

export interface UnifiedNotificationPayload {
  // Core content
  title: string;
  body: string;
  category: NotificationCategory;

  // URLs
  url?: string;

  // Push-specific
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;

  // Email-specific
  emailSubject?: string; // If different from title
  emailDetails?: Array<{ label: string; value: string }>;
  actionText?: string;
}

export interface NotificationRecipient {
  userId: string;
  email: string;
  name: string;
}

export interface NotificationResult {
  userId: string;
  pushSent: boolean;
  emailSent: boolean;
  success: boolean;
  error?: string;
}

// ============================================================
// UNIFIED NOTIFICATION FUNCTIONS
// ============================================================

/**
 * Send notification to a single user (tries push, falls back to email)
 */
export async function sendNotification(
  recipient: NotificationRecipient,
  payload: UnifiedNotificationPayload
): Promise<NotificationResult> {
  const { userId, email, name } = recipient;

  // Get user's notification preferences
  const prefs = await getUserPreferences(userId);

  if (!prefs) {
    console.log(
      `⚠️  No notification preferences found for user ${userId}, using defaults`
    );
  }

  const pushEnabled = prefs?.push_enabled ?? true;
  const emailEnabled = prefs?.email_enabled ?? true;
  const preferredContact = prefs?.preferred_contact ?? "push";

  let pushSent = false;
  let emailSent = false;
  let inAppCreated = false;
  let lastError: string | undefined;

  // Always create in-app notification first
  try {
    await createInAppNotification(userId, payload);
    inAppCreated = true;
  } catch (error) {
    console.error(
      `❌ Error creating in-app notification for user ${userId}:`,
      error
    );
    // Don't fail the whole process if in-app creation fails
  }

  // Try push notification (if enabled)
  if (pushEnabled) {
    try {
      const pushPayload: PushNotificationPayload = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        url: payload.url,
        category: payload.category,
        data: payload.data,
      };

      const pushResult = await sendPushNotification(userId, pushPayload);
      pushSent = pushResult.success && pushResult.sent > 0;

      if (!pushSent) {
        lastError = pushResult.errors?.[0]?.error || "Push notification failed";
      }
    } catch (error) {
      console.error(`❌ Error sending push to user ${userId}:`, error);
      lastError = error instanceof Error ? error.message : "Unknown push error";
    }
  }

  // Fallback to email if:
  // 1. Push failed or wasn't enabled
  // 2. User prefers email or both
  // 3. Email is enabled
  const shouldSendEmail =
    emailEnabled &&
    (!pushSent || preferredContact === "email" || preferredContact === "both");

  if (shouldSendEmail) {
    try {
      const emailTemplateData: EmailTemplateData = {
        userName: name,
        title: payload.title,
        message: payload.body,
        actionUrl: payload.url,
        actionText: payload.actionText,
        details: payload.emailDetails,
      };

      const emailResult = await sendEmailNotification(
        {
          to: email,
          subject: payload.emailSubject || payload.title,
          category: payload.category,
          templateData: emailTemplateData,
        },
        userId
      );

      emailSent = emailResult.success;

      if (!emailSent) {
        lastError = emailResult.error || "Email notification failed";
      }
    } catch (error) {
      console.error(`❌ Error sending email to user ${userId}:`, error);
      lastError =
        error instanceof Error ? error.message : "Unknown email error";
    }
  }

  const success = pushSent || emailSent || inAppCreated;

  if (success) {
    const methods = [];
    if (inAppCreated) methods.push("in-app");
    if (pushSent) methods.push("push");
    if (emailSent) methods.push("email");
    console.log(`✅ Notification sent to ${name} via ${methods.join(" and ")}`);
  } else {
    console.error(`❌ Failed to send notification to ${name}: ${lastError}`);
  }

  return {
    userId,
    pushSent,
    emailSent,
    success,
    error: success ? undefined : lastError,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Create in-app notification
 */
async function createInAppNotification(
  userId: string,
  payload: UnifiedNotificationPayload
): Promise<void> {
  try {
    await supabase.from("in_app_notifications").insert({
      user_id: userId,
      type: payload.category,
      title: payload.title,
      body: payload.body,
      icon: payload.icon || getIconForCategory(payload.category),
      url: payload.url,
      priority: "normal",
    });
  } catch (error) {
    console.error("❌ Error creating in-app notification:", error);
    throw error;
  }
}

/**
 * Get icon emoji for notification category
 */
function getIconForCategory(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    workout: "⏰",
    assignment: "",
    message: "💬",
    progress: "",
    achievement: "",
    invite: "📨",
  };
  return icons[category] || "🔔";
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  recipients: NotificationRecipient[],
  payload: UnifiedNotificationPayload
): Promise<NotificationResult[]> {
  const results = await Promise.all(
    recipients.map((recipient) => sendNotification(recipient, payload))
  );

  // Log summary
  const totalSuccess = results.filter((r) => r.success).length;
  const totalPush = results.filter((r) => r.pushSent).length;
  const totalEmail = results.filter((r) => r.emailSent).length;
  const totalFailed = results.filter((r) => !r.success).length;

  console.log(
    `Notification Summary: ${totalSuccess} succeeded, ${totalFailed} failed`
  );
  console.log(`   Push: ${totalPush}, Email: ${totalEmail}`);

  return results;
}

/**
 * Send push-only notification (no email fallback)
 */
export async function sendPushOnly(
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const result = await sendPushNotification(userId, payload);
    return result.success && result.sent > 0;
  } catch (error) {
    console.error(`❌ Error sending push-only notification:`, error);
    return false;
  }
}

/**
 * Send email-only notification (no push)
 */
export async function sendEmailOnly(
  email: string,
  subject: string,
  category: NotificationCategory,
  templateData: EmailTemplateData,
  userId?: string
): Promise<boolean> {
  try {
    const result = await sendEmailNotification(
      {
        to: email,
        subject,
        category,
        templateData,
      },
      userId
    );
    return result.success;
  } catch (error) {
    console.error(`❌ Error sending email-only notification:`, error);
    return false;
  }
}

// ============================================================
// CONVENIENCE FUNCTIONS FOR COMMON NOTIFICATIONS
// ============================================================

/**
 * Send workout assignment notification
 */
export async function notifyWorkoutAssignment(
  recipient: NotificationRecipient,
  workoutName: string,
  scheduledDate: string,
  workoutUrl: string
): Promise<NotificationResult> {
  return sendNotification(recipient, {
    title: "New Workout Assigned",
    body: `${workoutName} has been assigned to you`,
    category: "assignment",
    url: workoutUrl,
    emailSubject: `New Workout: ${workoutName}`,
    emailDetails: [
      { label: "Workout", value: workoutName },
      { label: "Scheduled", value: scheduledDate },
    ],
    actionText: "View Workout",
  });
}

/**
 * Send coach message notification
 */
export async function notifyCoachMessage(
  recipient: NotificationRecipient,
  message: string,
  messageUrl?: string
): Promise<NotificationResult> {
  return sendNotification(recipient, {
    title: "Message from Your Coach",
    body: message,
    category: "message",
    url: messageUrl,
    actionText: "View Message",
  });
}

/**
 * Send workout reminder notification
 */
export async function notifyWorkoutReminder(
  recipient: NotificationRecipient,
  workoutName: string,
  scheduledTime: string,
  workoutUrl: string
): Promise<NotificationResult> {
  return sendNotification(recipient, {
    title: "Workout Reminder",
    body: `${workoutName} is scheduled for ${scheduledTime}`,
    category: "workout",
    url: workoutUrl,
    emailSubject: `Reminder: ${workoutName}`,
    emailDetails: [
      { label: "Workout", value: workoutName },
      { label: "Time", value: scheduledTime },
    ],
    actionText: "Start Workout",
  });
}

/**
 * Send achievement notification
 */
export async function notifyAchievement(
  recipient: NotificationRecipient,
  achievementTitle: string,
  achievementDescription: string,
  progressUrl?: string
): Promise<NotificationResult> {
  return sendNotification(recipient, {
    title: achievementTitle,
    body: achievementDescription,
    category: "achievement",
    url: progressUrl,
    icon: "/icons/trophy.png",
    emailSubject: `Achievement: ${achievementTitle}`,
    actionText: "View Progress",
  });
}

/**
 * Send weekly progress report
 */
export async function notifyWeeklyProgress(
  recipient: NotificationRecipient,
  stats: Array<{ label: string; value: string }>,
  progressUrl: string
): Promise<NotificationResult> {
  const workoutsCompleted =
    stats.find((s) => s.label === "Workouts Completed")?.value || "0";

  return sendNotification(recipient, {
    title: "Your Weekly Progress",
    body: `You completed ${workoutsCompleted} workouts this week`,
    category: "progress",
    url: progressUrl,
    emailSubject: "Your Weekly Training Summary",
    emailDetails: stats,
    actionText: "View Full Report",
  });
}
