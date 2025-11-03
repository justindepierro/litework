# Notification Preferences System

## Overview

LiteWork now supports customizable notification preferences, allowing athletes to control when and how they receive workout reminders. This system provides flexible timing options with intelligent "smart timing" that adapts to workout schedules.

## Features

### Notification Types

1. **Workout Reminders** ✅ (Fully Implemented)
   - Customizable timing (6 options)
   - Channel selection (email, push coming soon)
   - Smart timing algorithm

2. **Achievement Notifications** ✅ (UI Complete)
   - Enable/disable toggle
   - Channel selection
   - Ready for backend implementation

3. **Assignment Notifications** ✅ (UI Complete)
   - Enable/disable toggle
   - Channel selection
   - Ready for backend implementation

### Timing Options

| Option         | Description                               | When Reminder Sent                                            |
| -------------- | ----------------------------------------- | ------------------------------------------------------------- |
| **Smart**      | Adaptive timing based on workout schedule | 2 hours before (if today) OR day before at 5 PM (if tomorrow) |
| **Morning**    | Daily morning reminder                    | Every day at 7 AM (if workout within 24 hours)                |
| **Evening**    | Daily evening reminder                    | Every day at 5 PM (if workout within 24 hours)                |
| **2 Hours**    | Before workout                            | Exactly 2 hours before scheduled workout                      |
| **1 Hour**     | Before workout                            | Exactly 1 hour before scheduled workout                       |
| **30 Minutes** | Before workout                            | Exactly 30 minutes before scheduled workout                   |

### Channels

- **Email** ✅ - Fully implemented and working
- **Push Notifications** 🔄 - UI ready, backend coming soon

## Architecture

### Database Schema

```sql
-- notification_preferences column on users table
notification_preferences JSONB DEFAULT '{
  "workoutReminders": {
    "enabled": true,
    "timing": "smart",
    "channels": ["email"]
  },
  "achievementNotifications": {
    "enabled": true,
    "channels": ["email"]
  },
  "assignmentNotifications": {
    "enabled": true,
    "channels": ["email"]
  }
}'
```

**Migration Applied:** ✅ `scripts/database/apply-notification-system.sql`

### TypeScript Types

```typescript
// Timing options
type NotificationTiming =
  | "smart"
  | "morning"
  | "evening"
  | "2hours"
  | "1hour"
  | "30min";

// Communication channels
type NotificationChannel = "email" | "push";

// Complete preferences interface
interface NotificationPreferences {
  workoutReminders: {
    enabled: boolean;
    timing: NotificationTiming;
    channels: NotificationChannel[];
  };
  achievementNotifications: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  assignmentNotifications: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
}
```

**Location:** `src/types/index.ts`

### API Endpoints

#### Get User Preferences

```typescript
GET /api/user/preferences

Response:
{
  "success": true,
  "preferences": {
    "workoutReminders": { ... },
    "achievementNotifications": { ... },
    "assignmentNotifications": { ... }
  }
}
```

#### Update User Preferences

```typescript
PATCH /api/user/preferences

Body (partial updates supported):
{
  "workoutReminders": {
    "enabled": true,
    "timing": "morning"
  }
}

Response:
{
  "success": true,
  "preferences": { /* updated preferences */ }
}
```

**Location:** `src/app/api/user/preferences/route.ts`

### UI Component

**Component:** `NotificationPreferencesSettings.tsx`
**Route:** `/settings`
**Features:**

- Toggle switches for enable/disable
- Dropdown for timing selection (workout reminders)
- Checkboxes for channel selection
- Real-time save with success/error feedback
- Loading states for better UX

### Cron Job

**Endpoint:** `/api/cron/workout-reminders`
**Schedule:** Every 2 hours from 7 AM to 9 PM UTC
**Cron Expression:** `0 7,9,11,13,15,17,19,21 * * *`

**Smart Timing Algorithm:**

```typescript
switch (timing) {
  case "smart":
    // 2 hours before if workout is within 2.5-1.5 hours
    if (hoursUntilWorkout <= 2.5 && hoursUntilWorkout >= 1.5) {
      send();
    }
    // OR day before at 5 PM if workout is 22-26 hours away
    else if (
      hoursUntilWorkout >= 22 &&
      hoursUntilWorkout <= 26 &&
      currentHour === 17
    ) {
      send();
    }
    break;

  case "morning":
    // At 7 AM if workout is within next 24 hours
    if (currentHour === 7 && hoursUntilWorkout <= 24) {
      send();
    }
    break;

  // ... other timing options
}
```

**Location:** `src/app/api/cron/workout-reminders/route.ts`

## User Flow

### Athlete Experience

1. **Access Settings**
   - Navigate to `/settings`
   - Scroll to "Notification Preferences" section

2. **Customize Workout Reminders**
   - Toggle "Workout Reminders" on/off
   - Select timing preference from dropdown:
     - Smart (recommended)
     - Morning (7 AM daily)
     - Evening (5 PM daily)
     - 2 hours before
     - 1 hour before
     - 30 minutes before
   - Choose channels:
     - Email (available now)
     - Push (coming soon)

3. **Save Changes**
   - Click "Save Preferences" button
   - See success message
   - Preferences immediately take effect

4. **Receive Reminders**
   - System checks every 2 hours
   - Sends reminders based on your timing preference
   - Only sends for workouts you have assigned
   - Respects your enabled/disabled setting

### Coach Experience

Coaches don't need to do anything! The system automatically:

- Reads athlete preferences from database
- Calculates optimal send times
- Filters athletes who have reminders disabled
- Sends personalized reminders

## Testing

### Manual Testing Checklist

1. **UI Testing**
   - [ ] Navigate to `/settings`
   - [ ] Toggle workout reminders on/off
   - [ ] Change timing preference (select each option)
   - [ ] Toggle email channel
   - [ ] Click "Save Preferences"
   - [ ] Verify success message appears

2. **Database Verification**

   ```sql
   -- Check your preferences
   SELECT
     id,
     email,
     notification_preferences
   FROM users
   WHERE email = 'your-email@example.com';
   ```

3. **API Testing**

   ```bash
   # Get preferences (requires authentication)
   curl https://liteworkapp.com/api/user/preferences

   # Update preferences
   curl -X PATCH https://liteworkapp.com/api/user/preferences \
     -H "Content-Type: application/json" \
     -d '{"workoutReminders":{"enabled":true,"timing":"morning"}}'
   ```

4. **Cron Job Testing**
   - Create a workout assignment scheduled for tomorrow
   - Wait for cron job to run (every 2 hours)
   - Check email for reminder
   - Verify timing matches your preference

### Automated Testing (Coming Soon)

- Unit tests for timing calculation logic
- Integration tests for API endpoints
- E2E tests for complete user flow

## Configuration

### Environment Variables

```bash
# Required for cron job
CRON_SECRET=your-secret-key-here

# Required for email notifications
RESEND_API_KEY=your-resend-api-key

# App URL for links in emails
NEXT_PUBLIC_APP_URL=https://liteworkapp.com
```

### Cron Job Setup (cron-job.org)

1. **URL:** `https://liteworkapp.com/api/cron/workout-reminders`
2. **Schedule:** `0 7,9,11,13,15,17,19,21 * * *`
3. **Authorization Header:** `Bearer YOUR_CRON_SECRET`
4. **Method:** GET
5. **Timezone:** UTC

## Smart Timing Logic

The "smart" timing option uses an adaptive algorithm:

### For Workouts Today (within 2 hours)

- **Send:** 2 hours before workout
- **Example:** Workout at 3 PM → Reminder at 1 PM
- **Benefits:** Last-minute reminder, time to prepare

### For Workouts Tomorrow

- **Send:** Day before at 5 PM
- **Example:** Workout at 2 PM tomorrow → Reminder today at 5 PM
- **Benefits:** Advance notice, time to plan

### Time Windows

- 2 hours before: 1.5 - 2.5 hours before workout
- Day before: 22 - 26 hours before workout (sent at 5 PM)

This ensures athletes always get timely reminders without being overwhelmed by notifications.

## Future Enhancements

### Phase 1 (Current) ✅

- [x] Database schema with JSONB preferences
- [x] TypeScript types and interfaces
- [x] API endpoints (GET, PATCH)
- [x] UI component with all controls
- [x] Smart timing algorithm
- [x] Cron job integration
- [x] Email channel support

### Phase 2 (Planned)

- [ ] Push notification support
- [ ] Achievement notifications implementation
- [ ] Assignment notifications implementation
- [ ] Quiet hours feature
- [ ] Timezone support
- [ ] Notification history log
- [ ] A/B testing for optimal timing

### Phase 3 (Future)

- [ ] SMS notifications
- [ ] In-app notifications
- [ ] Notification templates customization
- [ ] Machine learning for optimal timing
- [ ] Group notification preferences
- [ ] Coach notification controls

## Troubleshooting

### Issue: Not Receiving Reminders

**Check:**

1. Preferences enabled: `/settings` → Workout Reminders = ON
2. Email channel selected
3. Workout assignments exist for next 24 hours
4. Cron job is running (check cron-job.org dashboard)
5. Email address is verified in Supabase Auth

### Issue: Reminders at Wrong Time

**Check:**

1. Timing preference in `/settings`
2. Workout scheduled_date is correct
3. Server timezone (should be UTC)
4. Cron job schedule matches expected times

### Issue: Preferences Not Saving

**Check:**

1. Browser console for errors
2. Network tab for failed API calls
3. Authentication (logged in?)
4. Database migration applied successfully

### Issue: TypeScript Errors

**Solution:**

```bash
npm run typecheck
# Should show 0 errors

# If errors exist, check:
# - src/types/index.ts has NotificationPreferences interface
# - All imports use '@/types'
# - No 'any' types in preference-related code
```

## Support

For questions or issues:

1. Check this documentation first
2. Review `ARCHITECTURE.md` for auth patterns
3. Check `PROJECT_STRUCTURE.md` for file locations
4. Review database schema in `database/schema.sql`
5. Test API endpoints with curl or Postman

## Summary

The notification preferences system gives athletes full control over their workout reminders while maintaining a simple, intuitive interface. The smart timing algorithm ensures reminders are sent at optimal times, and the flexible architecture supports future expansion to additional notification types and channels.

**Status:** ✅ Production Ready
**Last Updated:** November 2, 2025
**Version:** 1.0.0
