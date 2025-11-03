# 📬 LiteWork Notification System Guide

## Overview

LiteWork implements a **dual-channel notification system** supporting both **Push Notifications** (to mobile devices) and **Email Notifications**. This guide covers architecture, implementation, and how to send notifications to athletes' phones.

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Notification Dispatcher                   │
│  (src/lib/notification-dispatcher.ts)                       │
│  - Checks user preferences                                   │
│  - Routes to appropriate channels                            │
│  - Logs all notification attempts                            │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
         ┌────────▼────────┐     ┌───────▼────────┐
         │  Push Service   │     │  Email Service │
         │  (web-push)     │     │    (Resend)    │
         └────────┬────────┘     └────────┬───────┘
                  │                       │
         ┌────────▼────────┐     ┌───────▼────────┐
         │ Service Worker  │     │  SMTP/API      │
         │  (sw.js)        │     │  Delivery      │
         └────────┬────────┘     └────────┬───────┘
                  │                       │
         ┌────────▼────────┐     ┌───────▼────────┐
         │  Mobile Device  │     │  Email Inbox   │
         │  Notification   │     │                │
         └─────────────────┘     └────────────────┘
```

---

## 📱 How Push Notifications Reach Phones

### The Complete Flow

#### **Step 1: User Grants Permission** (One-Time Setup)

```javascript
// Browser prompts: "Allow LiteWork to send notifications?"
const permission = await Notification.requestPermission();
// User clicks "Allow" ✅
```

#### **Step 2: Device Subscribes to Push Service**

When user grants permission, browser creates a **unique push subscription**:

```javascript
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY, // Your server's public key
});

// Subscription contains:
// {
//   endpoint: "https://fcm.googleapis.com/fcm/send/...",  ← Push service URL
//   keys: {
//     p256dh: "...",  ← Encryption key
//     auth: "..."     ← Authentication secret
//   }
// }
```

**What's happening:**

- Browser contacts **Google's FCM** (Chrome/Android) or **Apple's APNs** (Safari/iOS)
- Push service generates a unique endpoint URL for this device
- Subscription is encrypted end-to-end

#### **Step 3: Store Subscription in Database**

```javascript
// Send to your server
await fetch("/api/notifications/subscribe", {
  method: "POST",
  body: JSON.stringify({
    subscription: subscription.toJSON(),
    deviceName: "Justin's iPhone",
  }),
});

// Server stores in push_subscriptions table:
// {
//   user_id: "athlete-uuid",
//   endpoint: "https://fcm.googleapis.com/...",
//   p256dh: "encryption-key",
//   auth: "auth-secret",
//   device_name: "Justin's iPhone"
// }
```

#### **Step 4: Coach Assigns Workout**

```javascript
// Coach clicks "Assign Workout" button
POST /api/assignments
{
  athleteId: "athlete-uuid",
  workoutId: "workout-123",
  scheduledDate: "2025-11-05"
}
```

#### **Step 5: Server Sends Push Notification**

```javascript
// Server retrieves stored subscription
const { data: subscriptions } = await supabase
  .from("push_subscriptions")
  .select("*")
  .eq("user_id", "athlete-uuid");

// For each device subscription:
await webpush.sendNotification(
  {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  },
  JSON.stringify({
    title: "New Workout Assigned! 🏋️",
    body: "Upper Body Strength - Monday 3:30 PM",
    url: "/workouts/view/123",
    tag: "workout-assignment",
  })
);
```

**What's happening:**

- Your server sends HTTPS request to push service endpoint
- Request is signed with VAPID keys (proves it's from your server)
- Payload is encrypted (only the device can decrypt it)

#### **Step 6: Push Service Delivers to Device**

```
Your Server → Push Service → Device OS → Browser → Service Worker
```

**Push services by platform:**

- **Android/Chrome**: Google FCM (Firebase Cloud Messaging)
- **iOS/Safari**: Apple APNs (Apple Push Notification service)
- **Windows**: Windows Push Notification Service
- **Mac/Safari**: Apple APNs

#### **Step 7: Service Worker Shows Notification**

```javascript
// sw.js (already implemented in LiteWork)
self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag: data.tag,
    requireInteraction: true,
    actions: [
      { action: "view", title: "View Workout" },
      { action: "dismiss", title: "Dismiss" },
    ],
    data: data.url,
  });
});
```

#### **Step 8: Athlete Sees Notification**

**On Phone Lock Screen:**

```
┌─────────────────────────────────┐
│ 🔔 LiteWork                     │
│ New Workout Assigned! 🏋️        │
│ Upper Body Strength - Monday... │
│ [View Workout] [Dismiss]        │
└─────────────────────────────────┘
```

**On Tap:** Opens workout in LiteWork app/browser

---

## 🔑 Key Technologies

### VAPID Keys (Voluntary Application Server Identification)

**What they are:**

- Public/private key pair that identifies your server
- Proves notifications come from your authorized server
- Required by push services (FCM, APNs)

**Generate once:**

```bash
npx web-push generate-vapid-keys

# Output:
# Public Key: BGgj3...xyz
# Private Key: 7h4k...abc
```

**Add to .env.local:**

```bash
VAPID_PUBLIC_KEY="BGgj3...xyz"
VAPID_PRIVATE_KEY="7h4k...abc"
VAPID_SUBJECT="mailto:jdepierro@burkecatholic.org"
```

**How they work:**

1. **Public key** → Sent to browser → Included in subscription
2. **Private key** → Kept secret on server → Signs notification requests
3. Push service verifies signature matches public key in subscription

---

## 📊 Database Schema

### push_subscriptions

Stores device subscriptions for sending push notifications.

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Push subscription data from browser
  endpoint TEXT NOT NULL,           -- Push service URL
  p256dh TEXT NOT NULL,              -- Encryption key
  auth TEXT NOT NULL,                -- Authentication secret

  -- Metadata
  device_name TEXT,                  -- "Justin's iPhone"
  user_agent TEXT,                   -- Browser/OS info
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW(), -- Last successful push

  -- Prevent duplicate subscriptions per device
  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id);
```

### notification_preferences

User notification settings per category.

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Channel toggles
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,

  -- Category preferences
  workout_reminders BOOLEAN DEFAULT true,       -- Before workout starts
  assignment_notifications BOOLEAN DEFAULT true, -- New workout assigned
  message_notifications BOOLEAN DEFAULT true,    -- Coach messages
  progress_updates BOOLEAN DEFAULT false,        -- Weekly progress
  achievement_notifications BOOLEAN DEFAULT true, -- PRs, milestones

  -- Quiet hours (JSON: {start: "22:00", end: "07:00"})
  quiet_hours JSONB,

  -- Preferred contact method for urgent notifications
  preferred_contact TEXT DEFAULT 'push',  -- 'push', 'email', 'both'

  updated_at TIMESTAMP DEFAULT NOW()
);
```

### notification_log

Audit trail for all notifications.

```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Notification details
  type TEXT NOT NULL,           -- 'push' or 'email'
  category TEXT NOT NULL,       -- 'workout', 'message', 'assignment'
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,                     -- Deep link URL

  -- Delivery tracking
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,

  -- Error tracking
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  device_info JSONB  -- Device/browser details
);

CREATE INDEX idx_notif_log_user ON notification_log(user_id, sent_at DESC);
CREATE INDEX idx_notif_log_delivery ON notification_log(delivered, sent_at);
```

---

## 🚀 Implementation Guide

### Prerequisites

```bash
# Install required packages
npm install web-push resend

# Install type definitions
npm install --save-dev @types/web-push
```

### Step 1: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

**Save to `.env.local`:**

```bash
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY="BHxKz...your-public-key"
VAPID_PRIVATE_KEY="aS3k...your-private-key"
VAPID_SUBJECT="mailto:jdepierro@burkecatholic.org"

# Also expose public key to client
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BHxKz...your-public-key"

# Email Service (Resend)
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="noreply@litework.app"
```

### Step 2: Create Database Tables

```bash
# Run migration
psql -h your-db-host -U postgres -d litework < scripts/database/create-notification-tables.sql
```

### Step 3: Implement Push Service

Create `src/lib/notification-service.ts`:

```typescript
import webpush from "web-push";
import { getAdminClient } from "./auth-server";

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
  icon?: string;
  badge?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
) {
  const supabase = getAdminClient();

  // Get all push subscriptions for user
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error || !subscriptions?.length) {
    return {
      success: false,
      error: "No push subscriptions found",
    };
  }

  // Send to all user's devices
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url,
            tag: payload.tag || "notification",
            icon: payload.icon || "/icons/icon-192x192.png",
            badge: payload.badge || "/icons/icon-192x192.png",
            requireInteraction: payload.requireInteraction || false,
            actions: payload.actions || [
              { action: "view", title: "View" },
              { action: "dismiss", title: "Dismiss" },
            ],
          })
        );

        // Update last_used timestamp
        await supabase
          .from("push_subscriptions")
          .update({ last_used: new Date().toISOString() })
          .eq("id", sub.id);

        // Log success
        await logNotification({
          userId,
          type: "push",
          category: payload.tag || "general",
          title: payload.title,
          body: payload.body,
          url: payload.url,
          delivered: true,
        });

        return { success: true, deviceName: sub.device_name };
      } catch (error: any) {
        // Handle expired/invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Removing invalid subscription: ${sub.id}`);
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }

        // Log failure
        await logNotification({
          userId,
          type: "push",
          category: payload.tag || "general",
          title: payload.title,
          body: payload.body,
          url: payload.url,
          delivered: false,
          error: error.message,
        });

        throw error;
      }
    })
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    success: successful > 0,
    successful,
    failed,
    results,
  };
}

async function logNotification(data: {
  userId: string;
  type: "push" | "email";
  category: string;
  title: string;
  body: string;
  url?: string;
  delivered: boolean;
  error?: string;
}) {
  const supabase = getAdminClient();

  await supabase.from("notification_log").insert({
    user_id: data.userId,
    type: data.type,
    category: data.category,
    title: data.title,
    body: data.body,
    url: data.url,
    delivered: data.delivered,
    error: data.error,
  });
}
```

### Step 4: Create API Routes

**Subscribe to Push:**

```typescript
// src/app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { getAdminClient } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    const { subscription, deviceName, userAgent } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Upsert subscription (update if exists, insert if new)
    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      device_name: deviceName || "Unknown Device",
      user_agent: userAgent,
      last_used: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  });
}

// Unsubscribe
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    const { endpoint } = await request.json();

    const supabase = getAdminClient();

    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    return NextResponse.json({ success: true });
  });
}
```

**Send Notification (Admin/Testing):**

```typescript
// src/app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/auth-utils";
import { sendPushNotification } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  return withPermission(request, "manage-users", async (user) => {
    const { userIds, title, body, url, category } = await request.json();

    if (!Array.isArray(userIds) || !title || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      userIds.map((userId: string) =>
        sendPushNotification(userId, {
          title,
          body,
          url: url || "/dashboard",
          tag: category || "notification",
        })
      )
    );

    return NextResponse.json({ success: true, results });
  });
}
```

### Step 5: Client-Side Permission Request

Create `src/components/NotificationPermission.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return;
    }

    setPermission(Notification.permission);

    if (Notification.permission === "granted") {
      await checkExistingSubscription();
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser doesn't support notifications");
      return;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await subscribeToPush();
      }
    } catch (error) {
      console.error("Permission request failed:", error);
      alert("Failed to request notification permission");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      }

      // Send subscription to server
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceName: getDeviceName(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Push subscription failed:", error);
      alert("Failed to enable push notifications");
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from server
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Unsubscribe failed:", error);
    }
  };

  // Helper: Convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Helper: Get device name
  function getDeviceName(): string {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Mac/i.test(ua)) return "Mac";
    if (/Windows/i.test(ua)) return "Windows PC";
    return "Unknown Device";
  }

  if (!("Notification" in window)) {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">
              Notifications Blocked
            </p>
            <p className="text-sm text-red-700">
              Enable notifications in your browser settings to receive updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">
              {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
            </p>
            <p className="text-sm text-blue-700">
              {isSubscribed
                ? "You'll receive workout and message updates"
                : "Get notified about new workouts and messages"}
            </p>
          </div>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : requestPermission}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isSubscribed
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50`}
        >
          {isLoading ? "..." : isSubscribed ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}
```

### Step 6: Integrate with Existing Features

Update `src/app/api/assignments/route.ts`:

```typescript
import { sendPushNotification } from "@/lib/notification-service";

export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    // ... existing assignment logic ...

    // After successful assignment, send notification
    const athlete = await getAthleteById(assignment.athlete_id);
    const workout = await getWorkoutById(assignment.workout_id);

    await sendPushNotification(assignment.athlete_id, {
      title: "New Workout Assigned! 🏋️",
      body: `${workout.name} - ${formatDate(assignment.scheduled_date)}`,
      url: `/workouts/view/${assignment.id}`,
      tag: "workout-assignment",
      requireInteraction: true,
    });

    return NextResponse.json({ success: true, assignment });
  });
}
```

---

## 📱 Testing Push Notifications

### Local Testing

**Option 1: Use ngrok (Expose localhost)**

```bash
# VAPID requires HTTPS, so use ngrok for local testing
npm install -g ngrok
ngrok http 3000

# Use the https://xxx.ngrok.io URL for testing
```

**Option 2: Test on Production**

```bash
# Deploy to Vercel (has HTTPS)
npm run deploy
```

### Send Test Notification

```javascript
// In browser console (after subscribing)
fetch("/api/notifications/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userIds: ["your-user-id"],
    title: "Test Notification",
    body: "This is a test!",
    url: "/dashboard",
    category: "test",
  }),
});
```

### Device-Specific Testing

**iOS (Safari):**

- Must be added to home screen as PWA
- Notifications only work for installed PWAs
- Test on iOS 16.4+

**Android (Chrome):**

- Works in browser and as PWA
- More permissive than iOS
- Test notification actions

**Desktop:**

- Works in all modern browsers
- Easier for initial testing

---

## 🔧 Troubleshooting

### "Notifications not showing on iPhone"

**Solution:**

1. Install LiteWork as PWA (Add to Home Screen)
2. Open from home screen icon (not Safari)
3. Grant notification permission
4. Ensure iOS 16.4 or later

### "Push subscription fails"

**Check:**

- VAPID keys are correct in `.env.local`
- NEXT_PUBLIC_VAPID_PUBLIC_KEY is exposed to client
- Service worker is registered
- HTTPS is enabled (required for push)

### "Notification sent but not received"

**Debug:**

1. Check notification_log table for errors
2. Verify subscription is in push_subscriptions table
3. Check browser console for errors
4. Ensure device hasn't revoked permission

### "Error: 410 Gone"

**Meaning:** Subscription expired/invalid

**Fix:**

- Code automatically removes invalid subscriptions
- User needs to re-subscribe

---

## 📊 Monitoring & Analytics

### Track Notification Performance

```sql
-- Delivery rate
SELECT
  type,
  category,
  COUNT(*) as total_sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(100.0 * SUM(CASE WHEN delivered THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate
FROM notification_log
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY type, category;

-- Click-through rate
SELECT
  category,
  COUNT(*) as total_delivered,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as ctr
FROM notification_log
WHERE delivered = true
  AND sent_at > NOW() - INTERVAL '7 days'
GROUP BY category;

-- Active devices per user
SELECT
  u.name,
  COUNT(ps.id) as device_count
FROM users u
LEFT JOIN push_subscriptions ps ON ps.user_id = u.id
WHERE u.role = 'athlete'
GROUP BY u.id, u.name
ORDER BY device_count DESC;
```

---

## 🚀 Next Steps

1. **Implement Email Service** - See `EMAIL_NOTIFICATION_GUIDE.md`
2. **Create Notification Preferences UI** - `/settings/notifications`
3. **Add Quiet Hours** - Don't send at night
4. **Implement Notification Center** - In-app notification list
5. **Add Rich Notifications** - Images, progress bars
6. **Schedule Workout Reminders** - 30 min before workout

---

## 📚 Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Status:** Ready for Implementation
