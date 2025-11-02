# 📋 Notification System - Quick Reference

**Quick Links:**
- 📘 [Complete System Guide](./NOTIFICATION_SYSTEM_GUIDE.md) - Full technical documentation
- 📧 [Email Guide](./EMAIL_NOTIFICATION_GUIDE.md) - Email-specific implementation
- 🗺️ [Implementation Roadmap](./NOTIFICATION_IMPLEMENTATION_ROADMAP.md) - Step-by-step plan
- 💡 [Push Explained](./PUSH_NOTIFICATIONS_EXPLAINED.md) - How push works (simple)

---

## 🎯 At a Glance

| Feature | Status | Effort | Dependencies |
|---------|--------|--------|--------------|
| Database Schema | ⬜ Not Started | 1-2h | PostgreSQL |
| Push Notifications | ⬜ Not Started | 4-5h | web-push, VAPID keys |
| Email Service | ⬜ Not Started | 3-4h | Resend account |
| Integration | ⬜ Not Started | 2-3h | Above complete |
| Settings UI | ⬜ Not Started | 2-3h | Above complete |
| **Total** | **⬜ 0%** | **14-20h** | ~2-3 days |

---

## 📦 Required Packages

```bash
npm install web-push resend
npm install --save-dev @types/web-push
```

---

## 🔑 Required Environment Variables

```bash
# Push Notifications (Generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY="BHxKz...your-public-key"
VAPID_PRIVATE_KEY="aS3k...your-private-key"
VAPID_SUBJECT="mailto:jdepierro@burkecatholic.org"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BHxKz...your-public-key"

# Email Service (Get from resend.com)
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="LiteWork <noreply@litework.app>"
```

---

## 🗄️ Database Tables

### push_subscriptions
Stores device subscriptions for push notifications.

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
```

### notification_preferences
User settings for notifications.

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  workout_reminders BOOLEAN DEFAULT true,
  assignment_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  progress_updates BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### notification_log
Audit trail for all notifications.

```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,
  error TEXT
);
```

---

## 🚀 Core Functions

### Push Notifications

```typescript
// src/lib/notification-service.ts
import webpush from "web-push";

export async function sendPushNotification(
  userId: string,
  payload: {
    title: string;
    body: string;
    url: string;
    tag?: string;
  }
) {
  // Gets subscriptions from database
  // Sends to Google/Apple push service
  // Handles expired subscriptions
  // Logs success/failure
}
```

### Email Service

```typescript
// src/lib/email-service.ts
import { Resend } from "resend";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // Sends via Resend API
  // Logs delivery
  // Returns success/failure
}

// Email templates available:
workoutAssignmentEmail(params);
coachMessageEmail(params);
workoutReminderEmail(params);
weeklyProgressEmail(params);
athleteInviteEmail(params);
```

### Unified Dispatcher

```typescript
// src/lib/notification-dispatcher.ts
export async function notifyUser(params: {
  userId: string;
  category: "workout" | "message" | "assignment";
  title: string;
  body: string;
  url: string;
  emailTemplate?: string;
  emailData?: any;
}) {
  // Checks user preferences
  // Sends push if enabled
  // Sends email if enabled
  // Returns results for both
}
```

---

## 🔌 API Routes

### Subscribe to Push
```typescript
POST /api/notifications/subscribe
Body: { subscription, deviceName }
Returns: { success: true }
```

### Unsubscribe
```typescript
DELETE /api/notifications/subscribe
Body: { endpoint }
Returns: { success: true }
```

### Send Notification (Admin)
```typescript
POST /api/notifications/send
Body: { userIds[], title, body, url, category }
Returns: { success: true, results: [...] }
```

### Get Preferences
```typescript
GET /api/notifications/preferences
Returns: { preferences: {...} }
```

### Update Preferences
```typescript
PUT /api/notifications/preferences
Body: { push_enabled, email_enabled, ... }
Returns: { success: true }
```

---

## 📱 Client Components

### NotificationPermission
```tsx
// src/components/NotificationPermission.tsx
<NotificationPermission />

// Shows:
// - Permission request button
// - Current status (enabled/disabled)
// - Device name
// - Enable/disable toggle
```

### Usage
```tsx
import NotificationPermission from "@/components/NotificationPermission";

export default function DashboardPage() {
  return (
    <div>
      <NotificationPermission />
      {/* rest of page */}
    </div>
  );
}
```

---

## 🔗 Integration Examples

### Send on Workout Assignment

```typescript
// src/app/api/assignments/route.ts
import { notifyUser } from "@/lib/notification-dispatcher";

export async function POST(request: NextRequest) {
  // ... create assignment ...

  await notifyUser({
    userId: assignment.athlete_id,
    category: "assignment",
    title: "New Workout Assigned! 🏋️",
    body: `${workout.name} - ${formatDate(date)}`,
    url: `/workouts/view/${assignment.id}`,
    emailTemplate: "workoutAssignment",
    emailData: { athleteName, workoutName, date, exercises }
  });

  return NextResponse.json({ success: true });
}
```

### Send on Coach Message

```typescript
// src/app/api/messages/route.ts
await notifyUser({
  userId: recipientId,
  category: "message",
  title: "Message from Coach 💬",
  body: message.subject,
  url: `/messages?id=${message.id}`,
  emailTemplate: "coachMessage",
  emailData: { athleteName, coachName, subject, message }
});
```

---

## 🧪 Testing Commands

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### Test Push Notification
```javascript
// Browser console (after granting permission)
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['your-user-id'],
    title: 'Test Notification',
    body: 'This is a test!',
    url: '/dashboard',
    category: 'test'
  })
});
```

### Test Email
```javascript
fetch('/api/emails/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id',
    template: 'workout-assignment',
    data: {
      athleteName: 'Justin',
      workoutName: 'Test Workout',
      date: 'Today',
      exercises: ['Bench Press'],
      assignmentId: '123'
    }
  })
});
```

---

## 📊 Monitoring Queries

### Delivery Stats
```sql
SELECT 
  type,
  category,
  COUNT(*) as total,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  ROUND(100.0 * SUM(CASE WHEN delivered THEN 1 ELSE 0 END) / COUNT(*), 2) as rate
FROM notification_log
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY type, category;
```

### User Subscriptions
```sql
SELECT 
  u.name,
  COUNT(ps.id) as devices,
  np.push_enabled,
  np.email_enabled
FROM users u
LEFT JOIN push_subscriptions ps ON ps.user_id = u.id
LEFT JOIN notification_preferences np ON np.user_id = u.id
WHERE u.role = 'athlete'
GROUP BY u.id, u.name, np.push_enabled, np.email_enabled;
```

---

## ⚠️ Common Issues

### Push not working on iPhone
**Fix:** Must be installed as PWA and opened from home screen icon.

### Email going to spam
**Fix:** Verify domain in Resend dashboard (SPF, DKIM, DMARC records).

### Notification shows but click doesn't work
**Fix:** Check service worker notification click handler in `public/sw.js`.

### "Permission denied" error
**Fix:** User must grant permission in browser. Can't request again if denied.

### Subscription expired
**Fix:** Auto-removed on 410 error. User needs to re-subscribe.

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid Tier | LiteWork Need |
|---------|-----------|-----------|---------------|
| Push (FCM/APNs) | ∞ unlimited | ∞ unlimited | FREE ✅ |
| Resend Email | 3,000/month | $20 for 50k | FREE ✅ |
| Database Storage | Minimal | Minimal | Included ✅ |
| **Total** | **$0** | **$0-20** | **FREE** ✅ |

For 100 athletes × 30 emails/month = 3,000 emails → **FREE**

---

## 🎯 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Push Delivery Rate | >95% | TBD |
| Email Delivery Rate | >98% | TBD |
| Push CTR | >20% | TBD |
| Email CTR | >15% | TBD |
| Opt-out Rate | <5% | TBD |
| User Satisfaction | >4.5★ | TBD |

---

## 📅 Implementation Timeline

| Phase | Duration | What Gets Built |
|-------|----------|-----------------|
| Phase 1: Database | 1-2h | Tables, indexes, RLS policies |
| Phase 2: Push | 4-5h | Service, API routes, client component |
| Phase 3: Email | 3-4h | Service, templates, Resend integration |
| Phase 4: Integration | 2-3h | Connect to assignments & messages |
| Phase 5: UI | 2-3h | Settings page, preferences |
| **Total** | **14-20h** | **Full system operational** |

---

## 🚦 Current Status

**Overall Progress:** ⬜⬜⬜⬜⬜ 0%

**Phase Status:**
- ⬜ Phase 1: Database - Not Started
- ⬜ Phase 2: Push Notifications - Not Started
- ⬜ Phase 3: Email Service - Not Started
- ⬜ Phase 4: Integration - Not Started
- ⬜ Phase 5: User Interface - Not Started

**Ready to start?** Begin with Phase 1! 🚀

---

## 📚 Documentation Files

1. **NOTIFICATION_SYSTEM_GUIDE.md** - Complete technical guide (main doc)
2. **EMAIL_NOTIFICATION_GUIDE.md** - Email service implementation
3. **NOTIFICATION_IMPLEMENTATION_ROADMAP.md** - Step-by-step plan
4. **PUSH_NOTIFICATIONS_EXPLAINED.md** - How push works (beginner-friendly)
5. **QUICK_REFERENCE.md** - This file (cheat sheet)

---

**Last Updated:** November 2, 2025  
**Status:** ✅ Documentation Complete - Ready for Implementation
