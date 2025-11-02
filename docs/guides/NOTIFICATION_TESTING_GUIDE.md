# Notification System Testing Guide

## Quick Test - Send Your First Notification! 🚀

### Step 1: Test Email Notification

Open your browser's DevTools console on the LiteWork dashboard and run:

```javascript
// Test sending an email notification
fetch('/api/notifications/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jdepierro@burkecatholic.org',
    subject: 'Test Email from LiteWork',
    category: 'message',
    templateData: {
      userName: 'Justin',
      title: 'Test Notification',
      message: 'This is a test email from the LiteWork notification system!',
      actionUrl: 'https://litework.app',
      actionText: 'Open LiteWork'
    }
  })
})
.then(r => r.json())
.then(data => console.log('✅ Email sent:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected Result**: You should receive an email at jdepierro@burkecatholic.org within ~30 seconds.

---

### Step 2: Test Push Notification Subscription

1. **Add the NotificationPermission component** to your dashboard:

Open `src/app/dashboard/page.tsx` and add:

```typescript
import NotificationPermission from '@/components/NotificationPermission';

// Inside your component return:
<NotificationPermission 
  onPermissionGranted={() => console.log('✅ Push enabled!')}
  onPermissionDenied={() => console.log('❌ Push denied')}
/>
```

2. **Refresh the dashboard** - you should see a blue notification permission prompt

3. **Click "Enable Notifications"** - Browser will ask for permission

4. **Check console** - should see "✅ Successfully subscribed to push notifications"

---

### Step 3: Test Push Notification Sending

After subscribing in Step 2, run in DevTools console:

```javascript
// Get your user ID first
const userId = 'YOUR_USER_ID_HERE'; // Replace with your actual user ID

// Send a test push notification
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    payload: {
      title: 'Test Push Notification',
      body: 'This is a test from LiteWork!',
      category: 'message',
      url: '/dashboard'
    }
  })
})
.then(r => r.json())
.then(data => console.log('✅ Push sent:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected Result**: You should see a browser push notification pop up!

---

### Step 4: Test Unified Notification (Push + Email Fallback)

Create a test API route to use the unified notification service:

**File**: `src/app/api/test/notify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import { sendNotification } from '@/lib/unified-notification-service';

export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    const result = await sendNotification(
      {
        userId: user.userId,
        email: user.email,
        name: user.name || 'Athlete'
      },
      {
        title: 'Test Unified Notification',
        body: 'This tests both push and email!',
        category: 'message',
        url: '/dashboard',
        actionText: 'View Dashboard'
      }
    );

    return NextResponse.json(result);
  });
}
```

Then call it from console:

```javascript
fetch('/api/test/notify', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Result:', data));
```

---

## Testing Specific Notification Types

### Workout Assignment
```javascript
fetch('/api/notifications/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'athlete@example.com',
    subject: 'New Workout Assigned',
    category: 'assignment',
    templateData: {
      userName: 'John',
      title: 'Upper Body Strength',
      message: 'Coach Smith has assigned you a new workout',
      actionUrl: 'https://litework.app/workouts/view/123',
      actionText: 'View Workout',
      details: [
        { label: 'Workout', value: 'Upper Body Strength' },
        { label: 'Scheduled', value: 'November 3, 2025' },
        { label: 'Duration', value: '60 minutes' }
      ]
    }
  })
})
.then(r => r.json())
.then(console.log);
```

### Coach Message
```javascript
fetch('/api/notifications/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'athlete@example.com',
    subject: 'Message from Coach',
    category: 'message',
    templateData: {
      userName: 'John',
      title: 'Message from Your Coach',
      message: 'Great work this week! Keep pushing hard on those squats.',
      actionUrl: 'https://litework.app/messages',
      actionText: 'View Message'
    }
  })
})
.then(r => r.json())
.then(console.log);
```

### Achievement
```javascript
fetch('/api/notifications/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'athlete@example.com',
    subject: '🏆 New Personal Record!',
    category: 'achievement',
    templateData: {
      userName: 'John',
      title: 'New Personal Record!',
      message: 'Congratulations! You just set a new PR on Bench Press!',
      actionUrl: 'https://litework.app/progress',
      actionText: 'View Progress',
      details: [
        { label: 'Exercise', value: 'Bench Press' },
        { label: 'Previous PR', value: '225 lbs' },
        { label: 'New PR', value: '235 lbs' },
        { label: 'Improvement', value: '+10 lbs' }
      ]
    }
  })
})
.then(r => r.json())
.then(console.log);
```

---

## Checking Notification Logs

View all sent notifications in Supabase:

```sql
-- View recent notifications
SELECT 
  type,
  category,
  title,
  delivered,
  sent_at,
  error
FROM notification_log
ORDER BY sent_at DESC
LIMIT 20;

-- View notification statistics
SELECT * FROM notification_stats
ORDER BY date DESC;

-- View user notification summary
SELECT * FROM user_notification_summary;
```

---

## Troubleshooting

### Email not received?
1. Check spam folder
2. Verify RESEND_API_KEY is set in .env.local
3. Check Resend dashboard: https://resend.com/emails
4. Check notification_log table for errors

### Push notification not showing?
1. Check browser console for errors
2. Verify VAPID keys are set in .env.local
3. Ensure HTTPS (push requires secure context)
4. Check notification permission in browser settings
5. Query push_subscriptions table to verify subscription saved

### TypeScript errors?
```bash
npm run typecheck
```

### Build errors?
```bash
npm run build
```

---

## Next Steps

After testing works:
1. ✅ Integrate into workout assignment flow
2. ✅ Add notification preferences UI
3. ✅ Set up automated reminders
4. ✅ Add coach messaging with notifications
5. ✅ Implement achievement tracking

**Phase 4 Roadmap**: See `docs/guides/NOTIFICATION_IMPLEMENTATION_ROADMAP.md`
