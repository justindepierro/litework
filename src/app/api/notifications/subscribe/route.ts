/**
 * API Route: /api/notifications/subscribe
 * Handles push notification subscription management
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import {
  savePushSubscription,
  removePushSubscription,
} from "@/lib/notification-service";

/**
 * POST /api/notifications/subscribe
 * Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { subscription, deviceName } = body;

      if (!subscription || !subscription.endpoint) {
        return NextResponse.json(
          { error: "Invalid subscription object" },
          { status: 400 }
        );
      }

      // Get user agent from headers
      const userAgent = request.headers.get("user-agent") || undefined;

      // Save subscription to database
      const result = await savePushSubscription(
        user.id,
        subscription,
        deviceName,
        userAgent
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to save subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to push notifications",
        subscriptionId: result.id,
      });
    } catch (error) {
      console.error("❌ Error subscribing to push notifications:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/notifications/subscribe
 * Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { endpoint } = body;

      if (!endpoint) {
        return NextResponse.json(
          { error: "Endpoint is required" },
          { status: 400 }
        );
      }

      // Remove subscription from database
      const result = await removePushSubscription(user.id, endpoint);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to remove subscription" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed from push notifications",
      });
    } catch (error) {
      console.error("❌ Error unsubscribing from push notifications:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
