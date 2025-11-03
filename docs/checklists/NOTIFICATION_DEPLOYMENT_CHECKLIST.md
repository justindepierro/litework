# Notification System Deployment Checklist

**Date**: November 2, 2025  
**Feature**: Complete Notification System (Phases 1-7)

---

## ✅ Pre-Deployment Checklist

### Code Quality

- [x] Zero TypeScript errors (`npm run typecheck`)
- [x] No console.log statements in production code
- [x] All imports used
- [x] Proper error handling in all services
- [x] RLS policies configured

### Environment Variables

- [x] NEXT_PUBLIC_SUPABASE_URL set
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [x] SUPABASE_SERVICE_ROLE_KEY set
- [x] NEXT_PUBLIC_VAPID_PUBLIC_KEY set
- [x] VAPID_PRIVATE_KEY set
- [x] RESEND_API_KEY set
- [x] CRON_SECRET set (added today)

### Documentation

- [x] NOTIFICATION_SYSTEM_COMPLETE.md created
- [x] NOTIFICATION_IMPLEMENTATION_SUMMARY.md created
- [x] This deployment checklist created
- [x] Code comments added
- [x] API endpoints documented

---

## 📝 Deployment Steps

### Step 1: Database Migration

**Action**: Run SQL script in Supabase

```bash
# 1. Copy the SQL script
cat scripts/database/create-in-app-notifications.sql

# 2. Go to Supabase Dashboard
# https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt

# 3. Navigate to: SQL Editor → New Query

# 4. Paste the entire script

# 5. Click "Run"
```

**Expected Output**:

```
✅ In-app notification center table created successfully!
📊 Table: in_app_notifications
🔒 RLS policies enabled
🚀 Ready for notification center UI
```

**Verification**:

```sql
-- Run this query to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'in_app_notifications';

-- Should return: in_app_notifications
```

- [ ] SQL script executed successfully
- [ ] Table `in_app_notifications` exists
- [ ] Indexes created
- [ ] RLS policies enabled
- [ ] Helper functions created

---

### Step 2: Update Vercel Environment Variables

**Action**: Add CRON_SECRET to Vercel

```bash
# Your CRON_SECRET (from .env.local):
/7HghhKqwCNSBnKxAisEUQLBVyRsQwFWoHeUkvCNlYg=
```

**Steps**:

1. Go to Vercel Dashboard
2. Select project: LiteWork
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `CRON_SECRET`
6. Value: `/7HghhKqwCNSBnKxAisEUQLBVyRsQwFWoHeUkvCNlYg=`
7. Select: Production, Preview, Development
8. Click "Save"

- [ ] CRON_SECRET added to Vercel
- [ ] Applied to all environments
- [ ] Saved successfully

---

### Step 3: Git Commit & Push

**Action**: Commit all changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Complete notification system (Phases 6-7)

- Added scheduled workout reminders (Vercel Cron)
- Implemented in-app notification center
- Created NotificationBell component with badge
- Added full notifications page
- Integrated in-app creation into unified service
- Added comprehensive documentation

Phases completed:
✅ Phase 6: Scheduled reminders (cron job)
✅ Phase 7: In-app notification center

Features:
- Cron job runs twice daily (7 AM, 5 PM UTC)
- Bell icon with unread badge count
- Full notifications page with mark as read/delete
- Auto-expiry after 7 days
- RLS policies and indexes
- API endpoints for CRUD operations"

# Push to trigger Vercel deployment
git push origin main
```

- [ ] Changes committed
- [ ] Pushed to main branch
- [ ] Vercel deployment triggered

---

### Step 4: Monitor Deployment

**Action**: Watch Vercel deployment

1. Go to Vercel Dashboard → Deployments
2. Watch for latest deployment
3. Wait for "Ready" status
4. Check build logs for errors

**Expected**:

- ✅ Build succeeds
- ✅ No TypeScript errors
- ✅ No build warnings
- ✅ Deployment goes live

- [ ] Deployment started
- [ ] Build completed successfully
- [ ] No errors in logs
- [ ] Deployment is live

---

### Step 5: Verify Cron Job

**Action**: Check Vercel Cron configuration

1. Go to Vercel Dashboard → Project → Settings → Cron Jobs
2. Verify `workout-reminders` cron appears
3. Check schedule: `0 7,17 * * *`
4. Check next run time

**Expected**:

- Path: `/api/cron/workout-reminders`
- Schedule: `0 7,17 * * *` (7 AM & 5 PM UTC)
- Status: Active

- [ ] Cron job appears in Vercel
- [ ] Correct schedule configured
- [ ] Next run time shown

---

## 🧪 Post-Deployment Testing

### Test 1: In-App Notification Bell

**Steps**:

1. Visit deployed site
2. Log in as athlete
3. Look for bell icon in navigation
4. Should show "0" or current unread count

**Expected**:

- Bell icon visible in navigation
- Badge count accurate
- Clicking opens dropdown

- [ ] Bell icon appears
- [ ] Badge count shows
- [ ] Dropdown works

---

### Test 2: Notifications Page

**Steps**:

1. Navigate to `/notifications`
2. Should see full notifications page
3. Test filter buttons (All / Unread)
4. Test "Mark all read" button

**Expected**:

- Page loads successfully
- Filters work
- Actions work (mark read, delete)

- [ ] Page loads
- [ ] Filters work
- [ ] Actions work

---

### Test 3: Create Test Notification

**Method 1: Via Workout Assignment**

1. Log in as coach
2. Assign workout to athlete
3. Check if athlete receives notification

**Method 2: Via API (Browser Console)**

```javascript
fetch("/api/notifications/inbox", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "workout",
    title: "Test Notification",
    body: "This is a test",
    icon: "💪",
    url: "/workouts",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Expected**:

- Notification created successfully
- Appears in bell dropdown
- Badge count increases
- Notification appears on `/notifications` page

- [ ] Test notification created
- [ ] Appears in bell dropdown
- [ ] Appears on notifications page
- [ ] Badge count accurate

---

### Test 4: Mark as Read

**Steps**:

1. Click on unread notification (blue background)
2. Notification should turn white
3. Badge count should decrease
4. Refresh page - should stay read

**Expected**:

- Visual change (blue → white)
- Badge count decreases
- State persists after refresh

- [ ] Visual change works
- [ ] Badge updates
- [ ] State persists

---

### Test 5: Delete Notification

**Steps**:

1. Click X button on notification
2. Notification should disappear
3. Badge count should update if it was unread
4. Refresh - notification should stay deleted

**Expected**:

- Notification removed from list
- Badge updates if needed
- Deletion persists

- [ ] Notification deleted
- [ ] Badge updates
- [ ] Deletion persists

---

### Test 6: Cron Job (Manual Trigger)

**Steps**:

```bash
# Replace with your deployed URL and CRON_SECRET
curl -X GET "https://your-app.vercel.app/api/cron/workout-reminders" \
  -H "Authorization: Bearer /7HghhKqwCNSBnKxAisEUQLBVyRsQwFWoHeUkvCNlYg="
```

**Expected Response**:

```json
{
  "success": true,
  "sent": 0,
  "failed": 0,
  "total": 0,
  "assignments": []
}
```

**Note**: `sent: 0` is normal if no workouts are scheduled for tomorrow

- [ ] Cron endpoint accessible
- [ ] Returns success response
- [ ] No authentication errors

---

### Test 7: Workout Reminder Flow (End-to-End)

**Setup**:

1. Log in as coach
2. Assign workout to athlete for TOMORROW
3. Verify athlete has `workout_reminders: true` in `/settings`
4. Wait for next cron run (7 AM or 5 PM UTC)

**Or manually trigger**:

```bash
curl -X GET "https://your-app.vercel.app/api/cron/workout-reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected**:

- Cron finds the assignment
- Sends reminder to athlete
- Athlete receives:
  - In-app notification (bell badge increases)
  - Push notification (if enabled)
  - Email (if push disabled)

- [ ] Workout assigned for tomorrow
- [ ] Athlete preferences enabled
- [ ] Cron triggered manually
- [ ] Notification received

---

### Test 8: Push Notifications

**Steps**:

1. Go to `/settings`
2. Click "Enable Push Notifications"
3. Grant permission when browser prompts
4. Assign workout to yourself
5. Check for push notification

**Expected**:

- Permission granted
- Subscription saved
- Push notification appears

- [ ] Permission granted
- [ ] Push received
- [ ] Also created in-app notification

---

### Test 9: Email Fallback

**Steps**:

1. Go to `/settings`
2. Disable push notifications
3. Assign workout to yourself
4. Check email inbox

**Expected**:

- Email received
- Professional HTML template
- Links work

- [ ] Email received
- [ ] Template looks good
- [ ] Links work

---

## 🐛 Troubleshooting

### Issue: Bell icon not showing

**Check**:

- [ ] Navigation.tsx imports NotificationBell
- [ ] Component is rendered in JSX
- [ ] No console errors
- [ ] User is logged in

### Issue: Notifications not appearing

**Check**:

- [ ] Database migration ran successfully
- [ ] Table `in_app_notifications` exists
- [ ] RLS policies are correct
- [ ] User is authenticated

### Issue: Cron job not running

**Check**:

- [ ] `vercel.json` has cron configuration
- [ ] CRON_SECRET is set in Vercel
- [ ] Endpoint is deployed
- [ ] Check Vercel cron logs

### Issue: Badge count wrong

**Check**:

- [ ] API endpoint returns correct count
- [ ] Query filters expired notifications
- [ ] RLS policies allow user to see own notifications

---

## 📊 Success Criteria

### Functional

- [x] Zero TypeScript errors
- [ ] Database migration successful
- [ ] All API endpoints working
- [ ] Bell icon visible and functional
- [ ] Notifications page loads
- [ ] Mark as read works
- [ ] Delete works
- [ ] Badge count accurate
- [ ] Cron job configured
- [ ] Push notifications work
- [ ] Email fallback works

### Performance

- [ ] Page load < 2 seconds
- [ ] API responses < 500ms
- [ ] No console errors
- [ ] No memory leaks

### UX

- [ ] Mobile-friendly
- [ ] Accessible (keyboard navigation)
- [ ] Visual feedback on actions
- [ ] Error messages clear
- [ ] Loading states smooth

---

## 🎉 Launch Checklist

- [ ] All deployment steps completed
- [ ] All tests passing
- [ ] No critical issues
- [ ] Documentation updated
- [ ] Team notified
- [ ] Users informed of new feature

---

## 📝 Notes

**Deployment Date**: ******\_\_\_******

**Deployed By**: ******\_\_\_******

**Production URL**: ******\_\_\_******

**Issues Encountered**:

- None yet

**Resolutions**:

- N/A

**Post-Launch Tasks**:

- [ ] Monitor Vercel logs for 24 hours
- [ ] Check Resend dashboard for email delivery
- [ ] Monitor Supabase for RLS policy violations
- [ ] Collect user feedback
- [ ] Track notification open rates

---

## 📞 Support Contacts

**Supabase**: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt  
**Vercel**: https://vercel.com/dashboard  
**Resend**: https://resend.com/emails

---

**Status**: Ready for Deployment ✅

**Next Action**: Run database migration in Supabase SQL Editor
