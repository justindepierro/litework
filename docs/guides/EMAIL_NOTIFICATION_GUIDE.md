# 📧 Email Notification System Guide

## Overview

LiteWork's email notification system sends transactional emails to athletes for workout assignments, coach messages, and important updates. This guide covers implementation using **Resend** (recommended) with fallback to standard SMTP.

---

## 🎯 Why Resend?

**Recommended for LiteWork:**

| Feature                  | Resend      | SendGrid  | AWS SES     | SMTP     |
| ------------------------ | ----------- | --------- | ----------- | -------- |
| **Free Tier**            | 3,000/month | 100/day   | 3,000/month | Varies   |
| **Ease of Setup**        | ⭐⭐⭐⭐⭐  | ⭐⭐⭐    | ⭐⭐        | ⭐⭐⭐⭐ |
| **Developer Experience** | Excellent   | Good      | Complex     | Basic    |
| **Deliverability**       | Excellent   | Excellent | Excellent   | Poor     |
| **React Email Support**  | ✅ Built-in | ❌        | ❌          | ❌       |
| **Webhooks**             | ✅          | ✅        | ✅          | ❌       |
| **Cost (50k/mo)**        | $20         | $20       | $5          | Free     |

**Winner: Resend** for simplicity and free tier.

---

## 🏗️ Architecture

### Email Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Notification Trigger                        │
│  (Workout assignment, message, etc.)                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Check User     │
         │  Preferences    │
         │  (email_enabled)│
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Email Service  │
         │  (Resend API)   │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Email Template │
         │  Renderer       │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Resend API     │
         │  Delivery       │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Athlete Inbox  │
         │  📧             │
         └─────────────────┘
```

---

## 🚀 Setup Guide

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Verify email
4. Get API key from dashboard

### Step 2: Add to Environment

```bash
# .env.local
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="LiteWork <noreply@litework.app>"
RESEND_FROM_NAME="LiteWork"

# Optional: Your domain for branded emails
RESEND_DOMAIN="litework.app"
```

### Step 3: Verify Domain (Production)

**For production emails:**

1. Go to Resend dashboard → Domains
2. Add your domain (e.g., `litework.app`)
3. Add DNS records:
   ```
   TXT  _resend    verification-code
   MX   @          feedback-smtp.us-east-1.amazonses.com (10)
   TXT  @          "v=spf1 include:amazonses.com ~all"
   ```
4. Wait for verification (~10 minutes)

**For development:**

- Use `onboarding@resend.dev` (no verification needed)
- Limited to your registered email only

### Step 4: Install Package

```bash
npm install resend
```

---

## 📝 Implementation

### Email Service

Create `src/lib/email-service.ts`:

```typescript
import { Resend } from "resend";
import { getAdminClient } from "./auth-server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@litework.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(params: EmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw error;
    }

    // Log success
    await logEmail({
      to: params.to,
      subject: params.subject,
      delivered: true,
      emailId: data.id,
    });

    return {
      success: true,
      id: data.id,
    };
  } catch (error: any) {
    console.error("Email send failed:", error);

    // Log failure
    await logEmail({
      to: params.to,
      subject: params.subject,
      delivered: false,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send email to user by ID
 */
export async function sendEmailToUser(
  userId: string,
  params: Omit<EmailParams, "to">
) {
  const supabase = getAdminClient();

  // Get user email
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!user?.email) {
    throw new Error("User email not found");
  }

  return sendEmail({
    ...params,
    to: user.email,
  });
}

/**
 * Log email to database
 */
async function logEmail(data: {
  to: string;
  subject: string;
  delivered: boolean;
  emailId?: string;
  error?: string;
}) {
  const supabase = getAdminClient();

  await supabase.from("notification_log").insert({
    type: "email",
    category: "email", // Will be set by template
    title: data.subject,
    body: data.to,
    delivered: data.delivered,
    error: data.error,
  });
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Base email layout
 */
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LiteWork</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 30px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏋️ LiteWork</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>You're receiving this email because you're part of the LiteWork weight lifting club.</p>
      <p>
        <a href="${APP_URL}/settings/notifications">Notification Settings</a> |
        <a href="${APP_URL}">Open LiteWork</a>
      </p>
      <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} LiteWork. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Workout Assignment Email
 */
export function workoutAssignmentEmail(params: {
  athleteName: string;
  workoutName: string;
  date: string;
  exercises: string[];
  notes?: string;
  assignmentId: string;
}) {
  const exerciseList = params.exercises
    .slice(0, 5)
    .map((ex) => `<li>${ex}</li>`)
    .join("");

  const content = `
    <h2 style="color: #1e293b; margin-top: 0;">New Workout Assigned! 🏋️</h2>
    <p style="font-size: 16px; color: #374151;">Hi ${params.athleteName},</p>
    <p style="font-size: 16px; color: #374151;">
      You have a new workout assigned: <strong>${params.workoutName}</strong>
    </p>
    
    <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">Scheduled for</p>
      <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 600;">
        ${params.date}
      </p>
    </div>

    ${
      params.exercises.length > 0
        ? `
    <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">
      <strong>Exercises:</strong>
    </p>
    <ul style="color: #4b5563;">
      ${exerciseList}
      ${params.exercises.length > 5 ? `<li>+ ${params.exercises.length - 5} more...</li>` : ""}
    </ul>
    `
        : ""
    }

    ${
      params.notes
        ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Coach's Notes:</strong><br>
        ${params.notes}
      </p>
    </div>
    `
        : ""
    }

    <a href="${APP_URL}/workouts/view/${params.assignmentId}" class="button">
      View Workout Details
    </a>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Prepare to crush it! 💪
    </p>
  `;

  return {
    subject: `New Workout: ${params.workoutName}`,
    html: emailLayout(content),
    text: `Hi ${params.athleteName}, You have a new workout assigned: ${params.workoutName} for ${params.date}. View it at ${APP_URL}/workouts/view/${params.assignmentId}`,
  };
}

/**
 * Coach Message Email
 */
export function coachMessageEmail(params: {
  athleteName: string;
  coachName: string;
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  messageId?: string;
}) {
  const priorityColors = {
    low: { bg: "#f3f4f6", border: "#9ca3af", text: "#4b5563" },
    normal: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
    high: { bg: "#fef2f2", border: "#ef4444", text: "#991b1b" },
  };

  const colors = priorityColors[params.priority];

  const content = `
    <h2 style="color: #1e293b; margin-top: 0;">Message from Your Coach 💬</h2>
    <p style="font-size: 16px; color: #374151;">Hi ${params.athleteName},</p>
    <p style="font-size: 16px; color: #374151;">
      Coach ${params.coachName} sent you a message:
    </p>

    <div style="background-color: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: ${colors.text}; font-size: 18px; font-weight: 600;">
        ${params.subject}
      </p>
      <p style="margin: 0; color: #374151; font-size: 16px; white-space: pre-wrap;">
        ${params.message}
      </p>
    </div>

    ${
      params.messageId
        ? `
    <a href="${APP_URL}/messages?id=${params.messageId}" class="button">
      Reply in App
    </a>
    `
        : ""
    }

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Open LiteWork to reply or view your full conversation.
    </p>
  `;

  return {
    subject: `Message from Coach: ${params.subject}`,
    html: emailLayout(content),
    text: `Hi ${params.athleteName}, Coach ${params.coachName} sent you a message: "${params.subject}" - ${params.message}`,
    replyTo: params.coachName ? `coach@litework.app` : undefined,
  };
}

/**
 * Workout Reminder Email (1 hour before)
 */
export function workoutReminderEmail(params: {
  athleteName: string;
  workoutName: string;
  startTime: string;
  assignmentId: string;
}) {
  const content = `
    <h2 style="color: #1e293b; margin-top: 0;">Workout Reminder ⏰</h2>
    <p style="font-size: 16px; color: #374151;">Hi ${params.athleteName},</p>
    <p style="font-size: 16px; color: #374151;">
      Your workout <strong>${params.workoutName}</strong> starts in 1 hour!
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">Starting at</p>
      <p style="margin: 5px 0 0 0; color: #78350f; font-size: 24px; font-weight: 600;">
        ${params.startTime}
      </p>
    </div>

    <a href="${APP_URL}/workouts/live/${params.assignmentId}" class="button">
      Start Workout Now
    </a>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Get ready to train! 🔥
    </p>
  `;

  return {
    subject: `Reminder: ${params.workoutName} starts soon!`,
    html: emailLayout(content),
    text: `Hi ${params.athleteName}, Your workout "${params.workoutName}" starts at ${params.startTime}. Get ready!`,
  };
}

/**
 * Weekly Progress Summary Email
 */
export function weeklyProgressEmail(params: {
  athleteName: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    workoutsCompleted: number;
    totalVolume: number;
    newPRs: number;
    consistency: number;
  };
}) {
  const { stats } = params;

  const content = `
    <h2 style="color: #1e293b; margin-top: 0;">Your Weekly Progress 📊</h2>
    <p style="font-size: 16px; color: #374151;">Hi ${params.athleteName},</p>
    <p style="font-size: 16px; color: #374151;">
      Here's how you did this week (${params.weekStart} - ${params.weekEnd}):
    </p>

    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <div style="margin-bottom: 20px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Workouts Completed</p>
        <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 32px; font-weight: 700;">
          ${stats.workoutsCompleted}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Volume</p>
          <p style="margin: 5px 0 0 0; color: #3b82f6; font-size: 24px; font-weight: 600;">
            ${stats.totalVolume.toLocaleString()} lbs
          </p>
        </div>
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">New PRs</p>
          <p style="margin: 5px 0 0 0; color: #10b981; font-size: 24px; font-weight: 600;">
            ${stats.newPRs} 🏆
          </p>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Consistency Score</p>
        <div style="background-color: #e5e7eb; border-radius: 8px; height: 12px; margin-top: 8px; overflow: hidden;">
          <div style="background-color: #3b82f6; height: 100%; width: ${stats.consistency}%;"></div>
        </div>
        <p style="margin: 5px 0 0 0; color: #4b5563; font-size: 16px; font-weight: 600;">
          ${stats.consistency}%
        </p>
      </div>
    </div>

    <a href="${APP_URL}/progress" class="button">
      View Detailed Analytics
    </a>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      ${stats.workoutsCompleted >= 3 ? "Great work this week! Keep it up! 💪" : "Let's aim for more workouts next week! You've got this! 💪"}
    </p>
  `;

  return {
    subject: `Your Weekly Progress: ${stats.workoutsCompleted} Workouts Completed`,
    html: emailLayout(content),
    text: `Hi ${params.athleteName}, This week you completed ${stats.workoutsCompleted} workouts with ${stats.totalVolume} lbs total volume and ${stats.newPRs} new PRs. Keep it up!`,
  };
}

/**
 * Athlete Invitation Email
 */
export function athleteInviteEmail(params: {
  athleteName: string;
  coachName: string;
  groupName: string;
  inviteCode: string;
  expiresAt: string;
}) {
  const inviteUrl = `${APP_URL}/signup?code=${params.inviteCode}`;

  const content = `
    <h2 style="color: #1e293b; margin-top: 0;">You're Invited to LiteWork! 🎉</h2>
    <p style="font-size: 16px; color: #374151;">Hi ${params.athleteName},</p>
    <p style="font-size: 16px; color: #374151;">
      Coach ${params.coachName} has invited you to join the <strong>${params.groupName}</strong> on LiteWork!
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af; font-size: 16px;">
        <strong>What is LiteWork?</strong><br>
        A modern workout tracking app designed for weight lifting clubs. Track your workouts, monitor progress, and stay connected with your team.
      </p>
    </div>

    <a href="${inviteUrl}" class="button">
      Accept Invitation & Create Account
    </a>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      This invitation expires on <strong>${params.expiresAt}</strong>.
    </p>

    <p style="font-size: 14px; color: #9ca3af;">
      Invitation code: <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${params.inviteCode}</code>
    </p>
  `;

  return {
    subject: `You're invited to join ${params.groupName} on LiteWork`,
    html: emailLayout(content),
    text: `Hi ${params.athleteName}, Coach ${params.coachName} invited you to join ${params.groupName} on LiteWork. Accept your invitation at ${inviteUrl}. Code: ${params.inviteCode}`,
  };
}
```

---

## 🔌 API Integration

### Email API Route

Create `src/app/api/emails/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/auth-utils";
import {
  sendEmailToUser,
  workoutAssignmentEmail,
  coachMessageEmail,
  workoutReminderEmail,
} from "@/lib/email-service";

export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    const { userId, template, data } = await request.json();

    let emailContent;

    switch (template) {
      case "workout-assignment":
        emailContent = workoutAssignmentEmail(data);
        break;
      case "coach-message":
        emailContent = coachMessageEmail(data);
        break;
      case "workout-reminder":
        emailContent = workoutReminderEmail(data);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid template" },
          { status: 400 }
        );
    }

    const result = await sendEmailToUser(userId, emailContent);

    return NextResponse.json(result);
  });
}
```

### Usage in Assignment Route

Update `src/app/api/assignments/route.ts`:

```typescript
import { workoutAssignmentEmail, sendEmailToUser } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    // ... existing assignment logic ...

    // Get user preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_enabled, assignment_notifications")
      .eq("user_id", assignment.athlete_id)
      .single();

    // Send email if enabled
    if (prefs?.email_enabled && prefs?.assignment_notifications) {
      const emailContent = workoutAssignmentEmail({
        athleteName: athlete.name,
        workoutName: workout.name,
        date: formatDate(assignment.scheduled_date),
        exercises: workout.exercises.map((ex) => ex.name),
        notes: assignment.notes,
        assignmentId: assignment.id,
      });

      await sendEmailToUser(assignment.athlete_id, emailContent);
    }

    return NextResponse.json({ success: true });
  });
}
```

---

## 🧪 Testing

### Development Testing

```typescript
// Test in browser console or API route
const testEmail = await fetch("/api/emails/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "your-user-id",
    template: "workout-assignment",
    data: {
      athleteName: "Justin",
      workoutName: "Upper Body Strength",
      date: "Monday, Nov 4 at 3:30 PM",
      exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
      notes: "Focus on form today!",
      assignmentId: "123",
    },
  }),
});
```

### Test with Resend Dashboard

1. Go to Resend dashboard
2. View "Emails" tab
3. See delivery status, opens, clicks
4. View rendered HTML

---

## 📊 Tracking Email Performance

### Resend Webhooks

Set up webhooks to track delivery:

```typescript
// src/app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const event = await request.json();

  const supabase = getAdminClient();

  switch (event.type) {
    case "email.delivered":
      await supabase
        .from("notification_log")
        .update({ delivered: true })
        .eq("email_id", event.data.email_id);
      break;

    case "email.opened":
      await supabase
        .from("notification_log")
        .update({ opened: true })
        .eq("email_id", event.data.email_id);
      break;

    case "email.clicked":
      await supabase
        .from("notification_log")
        .update({
          clicked: true,
          clicked_at: new Date().toISOString(),
        })
        .eq("email_id", event.data.email_id);
      break;

    case "email.bounced":
    case "email.complained":
      // Handle bounces/complaints
      break;
  }

  return NextResponse.json({ received: true });
}
```

---

## 🎨 Email Design Best Practices

### Mobile-First

- **Max width:** 600px
- **Font size:** Minimum 16px for body text
- **Button size:** Minimum 44px height
- **Padding:** 20-30px on mobile

### Accessibility

- **Alt text** for images
- **Semantic HTML** (h1, h2, p, etc.)
- **High contrast** (4.5:1 ratio)
- **Plain text fallback** for all emails

### Spam Prevention

- **Authenticate domain** (SPF, DKIM, DMARC)
- **Avoid spam words** (FREE, BUY NOW, etc.)
- **Include unsubscribe link**
- **Don't use URL shorteners**
- **Consistent from address**

---

## 💰 Cost Management

### Free Tier (Resend)

- **3,000 emails/month** FREE
- Perfect for MVP (100 emails/day)

### Paid Tier

- **$20/month** for 50,000 emails
- **$0.40 per 1,000** emails beyond

### Cost Projections

| Athletes | Emails/Month | Cost |
| -------- | ------------ | ---- |
| 30       | ~900         | FREE |
| 100      | ~3,000       | FREE |
| 200      | ~6,000       | $20  |
| 500      | ~15,000      | $20  |

---

## 🚀 Next Steps

1. ✅ Set up Resend account
2. ✅ Implement email service
3. ✅ Create email templates
4. ✅ Integrate with assignments API
5. ⬜ Set up webhooks
6. ⬜ Create notification preferences UI
7. ⬜ Test with real athletes

---

**Last Updated:** November 2, 2025  
**Status:** Ready for Implementation
