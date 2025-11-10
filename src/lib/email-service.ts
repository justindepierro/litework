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

// [REMOVED] console.log("🔧 Email Service Initialization:");
// [REMOVED] console.log("   - RESEND_API_KEY present:", !!resendApiKey);
// [REMOVED] console.log("   - RESEND_API_KEY length:", resendApiKey?.length || 0);
// [REMOVED] console.log("   - FROM_EMAIL:", fromEmail);

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

    // [REMOVED] console.log(`✅ Email sent successfully: ${data?.id}`);

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
      <style>
        .benefits { margin: 24px 0; }
        .benefit-item { display: flex; align-items: flex-start; margin-bottom: 16px; }
        .benefit-icon { width: 32px; height: 32px; background-color: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; }
        .benefit-icon svg { width: 18px; height: 18px; fill: #3b82f6; }
        .benefit-text { flex: 1; }
        .benefit-title { font-weight: 600; color: #111827; margin-bottom: 4px; }
        .benefit-description { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .cta-section { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
        .cta-section h3 { color: #ffffff; margin: 0 0 16px 0; font-size: 20px; }
        .cta-button { display: inline-block; background-color: #ffffff; color: #3b82f6; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .cta-button:hover { background-color: #f3f4f6; }
        .faq-link { text-align: center; margin-top: 20px; }
        .faq-link a { color: #3b82f6; text-decoration: none; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited to LiteWork!</h1>
        </div>
        <div class="content">
          <div class="greeting">Hi ${data.userName},</div>
          <div class="message">
            ${data.message || "Your coach has invited you to join LiteWork, the complete workout tracking platform built specifically for weight lifting athletes."}
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

          <div class="benefits">
            <h3 style="color: #111827; margin-bottom: 16px; font-size: 18px;">What You'll Get:</h3>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              </div>
              <div class="benefit-text">
                <div class="benefit-title">Smart Workout Tracking</div>
                <div class="benefit-description">Log sets, reps, and weight with lightning-fast mobile interface. Auto-calculates 1RMs and suggests progressive overload.</div>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              </div>
              <div class="benefit-text">
                <div class="benefit-title">Performance Analytics</div>
                <div class="benefit-description">Visualize your progress with charts, track personal records, and see your strength gains over time.</div>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              </div>
              <div class="benefit-text">
                <div class="benefit-title">Personalized Programs</div>
                <div class="benefit-description">Get workouts tailored to your goals, schedule, and experience level. Your coach assigns everything - you just show up and lift.</div>
              </div>
            </div>

            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
              </div>
              <div class="benefit-text">
                <div class="benefit-title">Mobile-First Design</div>
                <div class="benefit-description">Built for the gym. Large buttons, clear text, and works offline. Use it on your phone while training - no laptop needed.</div>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <h3>Ready to Start Training Smarter?</h3>
            ${
              data.actionUrl
                ? `
              <a href="${data.actionUrl}" class="cta-button">${data.actionText || "Accept Invitation & Get Started"}</a>
            `
                : ""
            }
          </div>

          <div class="faq-link">
            <a href="${data.actionUrl?.split("?")[0] || "https://litework.app"}/faq">Have questions? Check our FAQ →</a>
          </div>

          <div class="message" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <strong>This invitation expires in 7 days.</strong><br>
            Click the button above to create your account and start tracking your workouts. If you didn't expect this invitation, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          <p style="font-weight: 600; color: #111827; margin-bottom: 8px;">LiteWork - Weight Lifting Tracker</p>
          <p>You received this email because your coach invited you to join their training program.</p>
          <p style="margin-top: 16px; font-size: 12px;">
            Questions? Reply to this email or contact your coach directly.
          </p>
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
