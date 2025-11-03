/**
 * Email Notification Service
 * Handles email notifications via Resend
 * Created: November 2, 2025
 */

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { NotificationCategory } from "./notification-service";

// ============================================================
// TYPES
// ============================================================

export interface EmailNotificationPayload {
  to: string | string[];
  subject: string;
  category: NotificationCategory;
  templateData: EmailTemplateData;
}

export interface EmailTemplateData {
  userName: string;
  title: string;
  message?: string;
  actionUrl?: string;
  actionText?: string;
  details?: Array<{ label: string; value: string }>;
  footer?: string;
}

interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

// ============================================================
// CONFIGURATION
// ============================================================

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
  process.env.RESEND_FROM_EMAIL || "LiteWork <noreply@litework.app>";

console.log("🔧 Email Service Initialization:");
console.log("   - RESEND_API_KEY present:", !!resendApiKey);
console.log("   - RESEND_API_KEY length:", resendApiKey?.length || 0);
console.log("   - FROM_EMAIL:", fromEmail);

if (!resendApiKey) {
  console.error(
    "❌ RESEND_API_KEY not configured. Email notifications will not work."
  );
  console.error("Please add RESEND_API_KEY to .env.local");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Supabase client for logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================
// EMAIL SENDING FUNCTIONS
// ============================================================

/**
 * Send an email notification
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload,
  userId?: string
): Promise<SendEmailResult> {
  try {
    if (!resend) {
      throw new Error("Resend is not configured");
    }

    // Generate HTML email from template
    const html = generateEmailHTML(payload.category, payload.templateData);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: payload.to,
      subject: payload.subject,
      html,
    });

    if (error) {
      console.error("❌ Error sending email:", error);

      // Log failed delivery
      if (userId) {
        await logEmail({
          user_id: userId,
          category: payload.category,
          title: payload.subject,
          body: payload.templateData.message,
          url: payload.templateData.actionUrl,
          delivered: false,
          error: error.message,
        });
      }

      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Email sent successfully: ${data?.id}`);

    // Log successful delivery
    if (userId) {
      await logEmail({
        user_id: userId,
        category: payload.category,
        title: payload.subject,
        body: payload.templateData.message,
        url: payload.templateData.actionUrl,
        delivered: true,
        email_id: data?.id,
      });
    }

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    console.error("❌ Error sending email notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email to multiple users
 */
export async function sendEmailToUsers(
  userEmails: Array<{ userId: string; email: string; name: string }>,
  subject: string,
  category: NotificationCategory,
  templateData: Omit<EmailTemplateData, "userName">
): Promise<Record<string, SendEmailResult>> {
  const results: Record<string, SendEmailResult> = {};

  await Promise.all(
    userEmails.map(async ({ userId, email, name }) => {
      try {
        results[userId] = await sendEmailNotification(
          {
            to: email,
            subject,
            category,
            templateData: {
              ...templateData,
              userName: name,
            },
          },
          userId
        );
      } catch (error) {
        console.error(`❌ Failed to send email to user ${userId}:`, error);
        results[userId] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Generate HTML email based on category and template data
 */
function generateEmailHTML(
  category: NotificationCategory,
  data: EmailTemplateData
): string {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .header { background-color: #3b82f6; padding: 32px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
      .content { padding: 32px; }
      .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; }
      .message { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
      .details { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { font-weight: 600; color: #374151; }
      .detail-value { color: #6b7280; }
      .button { display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 16px 0; }
      .button:hover { background-color: #2563eb; }
      .footer { padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
      .footer a { color: #3b82f6; text-decoration: none; }
    </style>
  `;

  switch (category) {
    case "assignment":
      return generateWorkoutAssignmentEmail(data, baseStyles);
    case "message":
      return generateCoachMessageEmail(data, baseStyles);
    case "workout":
      return generateWorkoutReminderEmail(data, baseStyles);
    case "progress":
      return generateProgressReportEmail(data, baseStyles);
    case "achievement":
      return generateAchievementEmail(data, baseStyles);
    case "invite":
      return generateAthleteInviteEmail(data, baseStyles);
    default:
      return generateGenericEmail(data, baseStyles);
  }
}

/**
 * Template: New Workout Assignment
 */
function generateWorkoutAssignmentEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Workout Assigned</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "You have a new workout assigned to you!"}
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "View Workout"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered as an athlete on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Coach Message
 */
function generateCoachMessageEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 Message from Your Coach</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "Your coach has sent you a message."}
          </div>
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "View Message"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered as an athlete on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Workout Reminder
 */
function generateWorkoutReminderEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Workout Reminder</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "Don't forget about your scheduled workout!"}
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "Start Workout"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered as an athlete on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Weekly Progress Report
 */
function generateProgressReportEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Weekly Progress</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "Here's a summary of your training progress this week!"}
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "View Full Report"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered as an athlete on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Achievement Notification
 */
function generateAchievementEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Achievement Unlocked!</h1>
        </div>
        <div class="content">
          <div class="greeting">Congratulations ${data.userName}!</div>
          <div class="message">
            ${data.message || "You've reached a new personal record!"}
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "View Progress"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered as an athlete on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Athlete Invitation
 */
function generateAthleteInviteEmail(
  data: EmailTemplateData,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited to LiteWork!</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "Your coach has invited you to join LiteWork, the complete workout tracking platform for weight lifting athletes."}
          </div>
          <div class="message">
            <strong>What is LiteWork?</strong><br>
            LiteWork helps you track workouts, monitor progress, hit new PRs, and stay connected with your coach. Get started today and take your training to the next level!
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "Accept Invitation"}</a>
          `
              : ""
          }
          <div class="message" style="margin-top: 24px; font-size: 14px; color: #6b7280;">
            This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          <p>You received this email because your coach invited you to join their training program.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template: Generic Email
 */
function generateGenericEmail(data: EmailTemplateData, styles: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.title}</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || ""}
          </div>
          ${
            data.details
              ? `
            <div class="details">
              ${data.details
                .map(
                  (d) => `
                <div class="detail-row">
                  <span class="detail-label">${d.label}</span>
                  <span class="detail-value">${d.value}</span>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            data.actionUrl
              ? `
            <a href="${data.actionUrl}" class="button">${data.actionText || "Learn More"}</a>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>LiteWork - Weight Lifting Tracker</p>
          ${data.footer || "<p>You received this email because you are registered on LiteWork.</p>"}
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Log email notification to database
 */
async function logEmail(log: {
  user_id: string;
  category: string;
  title: string;
  body?: string;
  url?: string;
  delivered: boolean;
  error?: string;
  email_id?: string;
}): Promise<void> {
  try {
    await supabase.from("notification_log").insert({
      ...log,
      type: "email",
    });
  } catch (error) {
    console.error("❌ Error logging email:", error);
  }
}
