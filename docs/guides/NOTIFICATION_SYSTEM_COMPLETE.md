# Notification System - Complete Implementation Guide

**Version**: 1.0.0  
**Created**: November 2, 2025  
**Status**: ✅ COMPLETE (Phases 1-7)

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Phase Status](#phase-status)
3. [Architecture](#architecture)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Instructions](#deployment-instructions)
7. [Testing Guide](#testing-guide)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

LiteWork now has a **comprehensive notification system** with three delivery channels:

### 🔔 Notification Channels

1. **In-App Notifications** (Notification Center)
   - Real-time updates in the app
   - Bell icon with badge count
   - Full notifications page
   - 7-day auto-expiry

2. **Push Notifications** (Web Push)
   - Native browser notifications
   - Works offline
   - Requires user permission
   - Works on mobile PWA

3. **Email Notifications** (Resend)
   - Fallback when push unavailable
   - Professional HTML templates
   - 5 notification types

### 🎯 Notification Types

- **Workout Assignment**: New workout assigned
- **Workout Reminder**: Upcoming workout reminder (24hrs before)
- **Message**: Coach messages
- **Progress Update**: Performance milestones
- **Achievement**: Goals completed

---

## Phase Status

### ✅ Phase 1: Database Foundation (COMPLETE)
- `push_subscriptions` table
- `notification_preferences` table
- `notification_log` table
- `in_app_notifications` table (NEW)
- RLS policies
- VAPID key generation

### ✅ Phase 2: Push Notification Service (COMPLETE)
- `src/lib/notification-service.ts`
- Web Push integration
- Service worker handlers
- Permission management UI
- Subscription management API

### ✅ Phase 3: Email Service (COMPLETE)
- `src/lib/email-service.ts`
- Resend API integration
- 5 HTML email templates
- Email API endpoints

### ✅ Phase 4: Unified Service (COMPLETE)
- `src/lib/unified-notification-service.ts`
- Smart fallback logic (in-app → push → email)
- Integration with workout assignments
- Comprehensive logging

### ✅ Phase 5: User Preferences (COMPLETE)
- `/settings` page
- Toggle switches for each channel
- Per-notification-type preferences
- `NotificationPreferences.tsx` component

### ✅ Phase 6: Scheduled Reminders (COMPLETE)
- Vercel Cron job configuration
- `/api/cron/workout-reminders` endpoint
- Runs twice daily (7 AM, 5 PM UTC)
- Sends reminders 24hrs before workouts

### ✅ Phase 7: In-App Notification Center (COMPLETE)
- NotificationBell component with badge
- Full notifications page (`/notifications`)
- Mark as read/unread functionality
- Delete notifications
- Real-time updates (polling every 30s)
- Auto-expiry after 7 days

---

## Architecture

### Notification Flow

```
┌─────────────────────────────────────────────────────────┐
│ Trigger Event (e.g., Workout Assigned)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     v
┌─────────────────────────────────────────────────────────┐
│ unified-notification-service.ts                          │
│ • Creates in-app notification (always)                   │
│ • Checks user preferences                                │
│ • Attempts push notification (if enabled)                │
│ • Falls back to email (if push fails)                    │
│ • Logs to notification_log                               │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┬───────────────────┐
         v                      v                    v
┌────────────────┐    ┌──────────────────┐  ┌─────────────┐
│ In-App         │    │ Push             │  │ Email       │
│ Notification   │    │ Notification     │  │ (Fallback)  │
│                │    │                  │  │             │
│ • Always sent  │    │ • If subscribed  │  │ • If push   │
│ • Stored in DB │    │ • If enabled     │  │   fails     │
│ • 7-day expiry │    │ • Web Push API   │  │ • Resend    │
└────────────────┘    └──────────────────┘  └─────────────┘
         │                      │                    │
         └──────────────────────┴────────────────────┘
                                │
                                v
                    ┌────────────────────────┐
                    │ User Receives          │
                    │ Notification           │
                    └────────────────────────┘
```

### Database Schema

```sql
-- In-app notification center
in_app_notifications (
  id, user_id, type, title, body, icon, url,
  read, clicked, priority, data,
  created_at, read_at, clicked_at, expires_at
)

-- Push subscriptions
push_subscriptions (
  id, user_id, endpoint, keys, 
  created_at, last_used_at
)

-- User preferences
notification_preferences (
  user_id, push_enabled, email_enabled, 
  workout_reminders, ...
)

-- Audit log
notification_log (
  id, user_id, type, channel, 
  success, error_message, sent_at
)
```

---

## Database Setup

### Step 1: Run In-App Notifications Migration

```bash
# Copy the SQL script to clipboard
cat scripts/database/create-in-app-notifications.sql

# Go to Supabase Dashboard → SQL Editor → New Query
# Paste the script and click "Run"
```

**Expected Output**:
```
✅ In-app notification center table created successfully!
📊 Table: in_app_notifications
🔒 RLS policies enabled
🚀 Ready for notification center UI
```

### Step 2: Verify Tables

```sql
-- Check all notification tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%notification%'
ORDER BY table_name;
```

**Expected Result**:
```
in_app_notifications
notification_log
notification_preferences
push_subscriptions
```

### Step 3: Verify Functions

```sql
-- Test helper functions
SELECT get_unread_notification_count('YOUR_USER_ID');
SELECT delete_expired_notifications();
```

---

## Environment Configuration

### Required Environment Variables

Create or update `.env.local`:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://lzsjaqkhdoqsafptqpnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web Push (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDdFmhhNn3e...
VAPID_PRIVATE_KEY=iRras99R9...

# Resend Email Service
RESEND_API_KEY=re_ND6yNNQG_PsDzkRA9kQCGvv9hgwp9w7p9

# Cron Job Authentication (NEW)
CRON_SECRET=/7HghhKqwCNSBnKxAisEUQLBVyRsQwFWoHeUkvCNlYg=
```

### Vercel Environment Variables

Add these to your Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure to add them for all environments (Production, Preview, Development)

---

## Deployment Instructions

### Step 1: Deploy to Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: Add notification system with in-app center and cron reminders"

# Push to trigger deployment
git push origin main
```

### Step 2: Configure Vercel Cron

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/workout-reminders",
      "schedule": "0 7,17 * * *"
    }
  ]
}
```

**Schedule**: Runs at 7 AM and 5 PM UTC (2 AM and 12 PM EST) daily

### Step 3: Verify Cron Setup

After deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Verify the workout-reminders job appears
3. Check next scheduled run time

### Step 4: Test Cron Manually

```bash
# Test the cron endpoint (requires CRON_SECRET header)
curl -X GET "https://your-app.vercel.app/api/cron/workout-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Testing Guide

### Test 1: In-App Notifications

```typescript
// Manual test via browser console
fetch('/api/notifications/inbox', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'workout',
    title: 'Test Notification',
    body: 'This is a test notification',
    icon: '💪',
    url: '/workouts'
  })
}).then(r => r.json()).then(console.log);
```

**Expected Result**: Notification appears in bell dropdown and `/notifications` page

### Test 2: Push Notifications

1. Go to `/settings`
2. Click "Enable Push Notifications"
3. Grant permission when prompted
4. Assign a workout to yourself
5. Check for push notification

### Test 3: Email Fallback

1. Go to `/settings`
2. Disable push notifications
3. Assign a workout to yourself
4. Check email inbox for notification

### Test 4: Workout Reminders (Cron)

```bash
# Manually trigger the cron job
curl -X GET "http://localhost:3000/api/cron/workout-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected Response**:
```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "total": 3,
  "assignments": [...]
}
```

### Test 5: Mark as Read

1. Go to `/notifications`
2. Click on an unread notification (blue background)
3. Notification should turn white (read)
4. Badge count should decrease

---

## Usage Examples

### Example 1: Send Custom Notification

```typescript
import { sendNotification } from '@/lib/unified-notification-service';

await sendNotification({
  userId: 'user-uuid',
  type: 'achievement',
  title: 'New Personal Record!',
  body: '🎉 You just hit a new PR on Bench Press!',
  url: '/progress'
});
```

### Example 2: Query Notifications

```typescript
// Get unread notifications
const response = await fetch('/api/notifications/inbox?unread_only=true');
const data = await response.json();
console.log(`${data.unreadCount} unread notifications`);

// Get all notifications (limit 50)
const response = await fetch('/api/notifications/inbox?limit=50');
const data = await response.json();
```

### Example 3: Mark All as Read

```typescript
await fetch('/api/notifications/inbox', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markAllRead: true })
});
```

### Example 4: Delete Notification

```typescript
await fetch('/api/notifications/inbox', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'notification-uuid' })
});
```

---

## Troubleshooting

### Issue: Bell icon not showing badge

**Cause**: Badge count not updating  
**Solution**:
```bash
# Check if API is working
curl http://localhost:3000/api/notifications/inbox?limit=1&unread_only=true

# Should return: {"success": true, "unreadCount": X, ...}
```

### Issue: Push notifications not working

**Possible Causes**:
1. User hasn't granted permission
2. Browser doesn't support push
3. Service worker not registered
4. VAPID keys incorrect

**Debug Steps**:
```javascript
// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', !!reg);
});

// Check push permission
console.log('Push permission:', Notification.permission);

// Check subscription
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Push subscription:', sub);
  });
});
```

### Issue: Cron job not running

**Check Vercel Logs**:
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Go to Functions tab
4. Find `api/cron/workout-reminders`
5. Check invocation logs

**Common Issues**:
- `CRON_SECRET` not set in Vercel
- Timezone confusion (cron runs in UTC)
- Database connection issues

### Issue: Emails not sending

**Check Resend Dashboard**:
1. Go to https://resend.com/emails
2. Check for failed sends
3. Review error messages

**Common Issues**:
- `RESEND_API_KEY` not set
- Rate limit exceeded
- Invalid email addresses

### Issue: Notifications expiring too fast

**Solution**: Adjust expiry time in database schema
```sql
-- Change default expiry from 7 days to 30 days
ALTER TABLE in_app_notifications 
ALTER COLUMN expires_at 
SET DEFAULT (NOW() + INTERVAL '30 days');
```

---

## Next Steps

### Enhancements (Optional)

1. **Real-time Updates** (instead of polling)
   - Use Supabase Realtime subscriptions
   - Subscribe to `in_app_notifications` table changes
   - Update bell badge instantly

2. **Notification Grouping**
   - Group similar notifications (e.g., "3 new workouts")
   - Collapse/expand groups

3. **Notification Sounds**
   - Play sound on new notification
   - User preference to enable/disable

4. **Notification Categories**
   - Filter by type (workouts, messages, etc.)
   - Separate badge counts per category

5. **Rich Notifications**
   - Action buttons (Accept/Decline)
   - Inline replies
   - Images/attachments

6. **Analytics Dashboard**
   - Track notification open rates
   - Delivery success metrics
   - User engagement stats

---

## API Reference

### POST `/api/notifications/inbox`
Create a new in-app notification

**Request**:
```json
{
  "type": "workout",
  "title": "New Workout Assigned",
  "body": "Check out your new workout",
  "icon": "💪",
  "url": "/workouts/view/123",
  "priority": "normal"
}
```

**Response**:
```json
{
  "success": true,
  "notification": { "id": "uuid", ... }
}
```

### GET `/api/notifications/inbox`
Fetch notifications

**Query Parameters**:
- `limit` (number): Max results (default: 10)
- `unread_only` (boolean): Only unread

**Response**:
```json
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5
}
```

### PATCH `/api/notifications/inbox`
Mark notifications as read

**Request**:
```json
{
  "notificationId": "uuid"          // Mark single as read
  // OR
  "notificationIds": ["uuid1", ...] // Mark multiple as read
  // OR
  "markAllRead": true               // Mark all as read
}
```

### DELETE `/api/notifications/inbox`
Delete notifications

**Request**:
```json
{
  "notificationId": "uuid"          // Delete single
  // OR
  "notificationIds": ["uuid1", ...] // Delete multiple
}
```

### GET `/api/cron/workout-reminders`
Cron job endpoint (internal use)

**Headers**:
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response**:
```json
{
  "success": true,
  "sent": 5,
  "failed": 0,
  "total": 5,
  "assignments": [...]
}
```

---

## File Reference

### Core Services
- `src/lib/unified-notification-service.ts` - Main notification orchestrator
- `src/lib/notification-service.ts` - Push notification service
- `src/lib/email-service.ts` - Email service

### API Routes
- `src/app/api/notifications/inbox/route.ts` - In-app notification CRUD
- `src/app/api/notifications/subscribe/route.ts` - Push subscription
- `src/app/api/notifications/send/route.ts` - Manual push send
- `src/app/api/notifications/email/route.ts` - Manual email send
- `src/app/api/notifications/preferences/route.ts` - User preferences
- `src/app/api/cron/workout-reminders/route.ts` - Cron job

### Components
- `src/components/NotificationBell.tsx` - Bell icon with dropdown
- `src/components/NotificationPermission.tsx` - Permission UI
- `src/components/NotificationPreferences.tsx` - Settings UI

### Pages
- `src/app/notifications/page.tsx` - Full notifications page
- `src/app/settings/page.tsx` - Settings page

### Database
- `scripts/database/create-in-app-notifications.sql` - Schema

### Configuration
- `vercel.json` - Cron job configuration
- `public/sw.js` - Service worker (lines 489-537)

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in service files
3. Check Vercel deployment logs
4. Review Supabase logs
5. Check browser console for errors

---

**End of Documentation** ✅
