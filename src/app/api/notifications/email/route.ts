/**
 * API Route: /api/notifications/email
 * Sends email notifications (coach/admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, isCoach } from "@/lib/auth-server";
import { sendEmailNotification, sendEmailToUsers } from "@/lib/email-service";
import type { EmailNotificationPayload } from "@/lib/email-service";
import type { NotificationCategory } from "@/lib/notification-service";

/**
 * POST /api/notifications/email
 * Send email notification to one or multiple users
 *
 * Body:
 * - Single user: { email, userId, subject, category, templateData }
 * - Multiple users: { users: [{ userId, email, name }], subject, category, templateData }
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    if (!isCoach(user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Coach access required" },
        { status: 403 }
      );
    }
    try {
    const body = await request.json();

    // Single email
    if (body.email && !body.users) {
      const { email, userId, subject, category, templateData } = body as {
        email: string;
        userId?: string;
        subject: string;
        category: NotificationCategory;
        templateData: EmailNotificationPayload["templateData"];
      };

      if (!email || !subject || !templateData) {
        return NextResponse.json(
          { error: "Missing required fields: email, subject, templateData" },
          { status: 400 }
        );
      }

      const result = await sendEmailNotification(
        {
          to: email,
          subject,
          category,
          templateData,
        },
        userId
      );

      return NextResponse.json({
        success: result.success,
        emailId: result.emailId,
        error: result.error,
      });
    }

    // Multiple emails
    if (body.users && Array.isArray(body.users)) {
      const { users, subject, category, templateData } = body as {
        users: Array<{ userId: string; email: string; name: string }>;
        subject: string;
        category: NotificationCategory;
        templateData: Omit<
          EmailNotificationPayload["templateData"],
          "userName"
        >;
      };

      if (!users || users.length === 0 || !subject || !templateData) {
        return NextResponse.json(
          { error: "Missing required fields: users, subject, templateData" },
          { status: 400 }
        );
      }

      const results = await sendEmailToUsers(
        users,
        subject,
        category,
        templateData
      );

      const totalSuccess = Object.values(results).filter(
        (r) => r.success
      ).length;
      const totalFailed = Object.values(results).filter(
        (r) => !r.success
      ).length;

      return NextResponse.json({
        success: totalSuccess > 0,
        sent: totalSuccess,
        failed: totalFailed,
        results,
      });
    }

    return NextResponse.json(
      { error: "Invalid request body. Provide either email or users array." },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Error sending email notifications:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
        { status: 500 }
      );
    }
  });
}
