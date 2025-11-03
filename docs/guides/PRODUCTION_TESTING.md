# Production Testing Guide

## Deployment Status

✅ **Deployed**: https://liteworkapp.com  
✅ **Commit**: 5165e98 (Suspense boundary fix)  
✅ **Build**: Successful

---

## 1. Test Signup Flow

### A. Test Regular Signup (No Invite)

1. **Open signup page**:

   ```
   https://liteworkapp.com/signup
   ```

2. **Fill out form**:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com (use a real email you can check)
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!

3. **Expected Result**:
   - ✅ Account created successfully
   - ✅ Redirected to `/dashboard`
   - ✅ Profile created in database

### B. Test Invite-Based Signup

First, you need to create an invite as a coach:

1. **Login as coach**: https://liteworkapp.com/login
2. **Go to Athletes page**
3. **Click "Invite Athlete"**
4. **Fill out invite form**
5. **Check email for invite link**
6. **Click invite link** (should go to `/signup?invite=<id>`)

**Expected Result**:

- ✅ Email and name pre-filled from invite
- ✅ Can complete signup
- ✅ Invite marked as "accepted" in database

---

## 2. Add CRON_SECRET to Vercel

**CRITICAL**: Cron endpoints will return 401 without this!

### Steps:

1. **Go to Vercel Dashboard**:

   ```
   https://vercel.com/justin-depierros-projects/litework/settings/environment-variables
   ```

2. **Click "Add New" button**

3. **Enter Environment Variable**:
   - **Name**: `CRON_SECRET`
   - **Value**: `R0FVlFrBxoCRxhcSQ73mzF63gb56SAlrY1n2NuaawX0=`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

4. **Click "Save"**

5. **Redeploy** (to pick up new variable):
   - Go to: https://vercel.com/justin-depierros-projects/litework
   - Click "Deployments" tab
   - Find latest deployment
   - Click "⋯" menu → "Redeploy"
   - Select "Use existing Build Cache"
   - Click "Redeploy"

---

## 3. Test Cron Endpoints

### A. Test Database Cleanup Endpoint

```bash
curl -i -H "Authorization: Bearer R0FVlFrBxoCRxhcSQ73mzF63gb56SAlrY1n2NuaawX0=" \
  https://liteworkapp.com/api/maintenance/cleanup
```

**Expected Response**:

```
HTTP/2 200
Content-Type: application/json

{
  "success": true,
  "message": "Cleanup completed successfully",
  "deleted": {
    "expiredInvites": 0,
    "oldSessions": 0,
    "cancelledInvites": 0
  }
}
```

**❌ If you get 401**:

- Check that CRON_SECRET is in Vercel environment variables
- Verify you redeployed after adding it
- Check that the Bearer token matches exactly

### B. Test Workout Reminders Endpoint

```bash
curl -i -H "Authorization: Bearer R0FVlFrBxoCRxhcSQ73mzF63gb56SAlrY1n2NuaawX0=" \
  https://liteworkapp.com/api/cron/workout-reminders
```

**Expected Response**:

```
HTTP/2 200
Content-Type: application/json

{
  "success": true,
  "remindersSent": 0,
  "message": "Workout reminders sent successfully"
}
```

---

## 4. Test Cron Jobs via cron-job.org

### A. Login to cron-job.org

1. Go to: https://cron-job.org/en/members/
2. Login with your account

### B. Test Each Job

For each of the 3 jobs:

1. **Click on the job name**:
   - LiteWork - Database Cleanup
   - LiteWork - Morning Workout Reminders
   - LiteWork - Evening Workout Reminders

2. **Click "Execute now" button** (or "Test run")

3. **Check "History" tab**:
   - Status should be: **✅ Succeeded (200)**
   - Duration should be: ~1-5 seconds
   - Response should show JSON success message

### C. Verify Job Details

**Database Cleanup**:

- Schedule: `0 2 * * *` (Daily at 2:00 AM)
- URL: `https://liteworkapp.com/api/maintenance/cleanup`
- Method: GET
- Header: `Authorization: Bearer R0FVlFr...`

**Morning Reminders**:

- Schedule: `0 7 * * *` (Daily at 7:00 AM)
- URL: `https://liteworkapp.com/api/cron/workout-reminders`
- Method: GET
- Header: `Authorization: Bearer R0FVlFr...`

**Evening Reminders**:

- Schedule: `0 17 * * *` (Daily at 5:00 PM)
- URL: `https://liteworkapp.com/api/cron/workout-reminders`
- Method: GET
- Header: `Authorization: Bearer R0FVlFr...`

---

## 5. Test Email Delivery

### A. Test Invite Email

1. **Login as coach**
2. **Invite an athlete** (use your real email)
3. **Check your inbox** for:
   - From: LiteWork <noreply@liteworkapp.com>
   - Subject: "You're invited to join LiteWork!"
   - Body: HTML formatted with invite link

### B. Test Resend Invite

1. **Find the pending invite** in Athletes page
2. **Click "Resend" button**
3. **Check email again** (should receive duplicate)

---

## 6. Integration Test: Full User Journey

### Coach Creates & Assigns Workout

1. **Login as coach**: https://liteworkapp.com/login
2. **Go to Workouts page**
3. **Click "Create Workout"**
4. **Create a workout**:
   - Add exercises
   - Use supersets/circuits
   - Save workout
5. **Go to Athletes page**
6. **Select athlete**
7. **Assign workout**:
   - Select the workout you created
   - Set date for tomorrow
   - Save assignment

### Athlete Receives Reminder (Next Day)

1. **Wait for cron job** (7 AM or 5 PM next day)
2. **Check athlete's notifications**
3. **Athlete clicks notification**
4. **Athlete completes workout**

---

## 7. Performance Check

### A. Load Times

Test these pages and ensure load time < 3 seconds:

```bash
# Homepage
curl -w "@-" -o /dev/null -s 'https://liteworkapp.com/' <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
         time_total:  %{time_total}\n
EOF
```

### B. Lighthouse Audit

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Run audit on https://liteworkapp.com
4. Check scores:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

---

## 8. Mobile Testing

### A. Install PWA

1. **On iOS**:
   - Open Safari
   - Go to https://liteworkapp.com
   - Tap Share button
   - Tap "Add to Home Screen"
   - Verify app icon appears

2. **On Android**:
   - Open Chrome
   - Go to https://liteworkapp.com
   - Tap menu (⋮)
   - Tap "Install app" or "Add to Home screen"
   - Verify app icon appears

### B. Test PWA Features

1. **Open installed app**
2. **Test offline mode**:
   - Turn on Airplane Mode
   - Navigate to previously visited pages
   - Should show cached content
3. **Test push notifications** (if implemented)

---

## 9. Security Check

### A. Test Authentication

1. **Try accessing coach-only pages as athlete**:

   ```
   https://liteworkapp.com/athletes
   ```

   Should: ❌ Redirect to dashboard or show error

2. **Try accessing API without auth**:
   ```bash
   curl https://liteworkapp.com/api/athletes
   ```
   Should: ❌ Return 401 Unauthorized

### B. Test Cron Security

1. **Try calling cron endpoint without secret**:

   ```bash
   curl https://liteworkapp.com/api/maintenance/cleanup
   ```

   Should: ❌ Return 401 Unauthorized

2. **Try with wrong secret**:
   ```bash
   curl -H "Authorization: Bearer wrong_secret" \
     https://liteworkapp.com/api/maintenance/cleanup
   ```
   Should: ❌ Return 401 Unauthorized

---

## 10. Monitoring

### A. Check Vercel Logs

1. Go to: https://vercel.com/justin-depierros-projects/litework/logs
2. Filter by "Errors" to see any runtime errors
3. Check for patterns or recurring issues

### B. Check Supabase Logs

1. Go to Supabase dashboard
2. Navigate to "Logs" section
3. Check for:
   - Failed queries
   - Authentication errors
   - RLS policy violations

---

## Checklist

Before marking production as "ready":

- [ ] Signup flow works (regular + invite)
- [ ] CRON_SECRET added to Vercel
- [ ] All 3 cron jobs respond with 200
- [ ] Cron-job.org jobs scheduled and tested
- [ ] Email delivery works (invite emails received)
- [ ] Coach can create and assign workouts
- [ ] Athlete can view and complete workouts
- [ ] PWA installs on mobile
- [ ] Authentication protects routes
- [ ] Cron endpoints are secured
- [ ] No errors in Vercel logs
- [ ] Lighthouse scores > 90

---

## Quick Test Commands

Save these for quick testing:

```bash
# Test cleanup endpoint
curl -i -H "Authorization: Bearer R0FVlFrBxoCRxhcSQ73mzF63gb56SAlrY1n2NuaawX0=" \
  https://liteworkapp.com/api/maintenance/cleanup

# Test reminders endpoint
curl -i -H "Authorization: Bearer R0FVlFrBxoCRxhcSQ73mzF63gb56SAlrY1n2NuaawX0=" \
  https://liteworkapp.com/api/cron/workout-reminders

# Check site is up
curl -I https://liteworkapp.com

# Test signup page loads
curl -s https://liteworkapp.com/signup | grep -q "meta" && echo "✅ Signup page loads"
```

---

## Troubleshooting

### Cron Jobs Returning 401

**Problem**: Cron endpoints return `401 Unauthorized`

**Solution**:

1. Check CRON_SECRET is in Vercel (Settings → Environment Variables)
2. Verify it's enabled for Production
3. Redeploy to pick up the variable
4. Wait 1-2 minutes for propagation

### Signup Page Not Loading

**Problem**: Blank page or error on `/signup`

**Solution**:

1. Check browser console for errors
2. Verify Suspense boundary is working
3. Check that searchParams is being read correctly
4. Test with and without `?invite=` parameter

### Emails Not Sending

**Problem**: Invite emails not received

**Solution**:

1. Check RESEND_API_KEY in Vercel
2. Verify domain is verified in Resend dashboard
3. Check spam folder
4. Look at Vercel logs for email errors

---

## Next Steps

Once all tests pass:

1. ✅ Mark deployment as successful
2. 📝 Document any issues found
3. 🔔 Enable cron-job.org email notifications
4. 📊 Monitor for 24-48 hours
5. 🎉 Share with beta testers
