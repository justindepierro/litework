# External Cron Jobs Setup Guide

## Overview
Since Vercel Hobby plan limits cron jobs, we use **cron-job.org** (free) to trigger our scheduled tasks.

## Cron Jobs to Set Up

### 1. Database Cleanup (Daily at 2 AM)
- **URL**: `https://liteworkapp.com/api/maintenance/cleanup`
- **Schedule**: `0 2 * * *` (2 AM every day)
- **Purpose**: Cleans up expired invites, old sessions, cancelled invites

### 2. Workout Reminders (Twice Daily)
- **URL**: `https://liteworkapp.com/api/cron/workout-reminders`
- **Schedule**: `0 7,17 * * *` (7 AM and 5 PM every day)
- **Purpose**: Sends reminders for upcoming workouts

---

## Setup Instructions

### Step 1: Create Account
1. Go to https://cron-job.org
2. Click **"Sign Up"** (top right)
3. Create free account with email
4. Verify email

### Step 2: Add CRON_SECRET to Vercel
For security, we need a secret key to verify cron requests.

1. **Generate a secret**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output (example: `Y2VQz4wGj7m7ijSLzdQJjw_hV1kJ7nd...`)

2. **Add to Vercel**:
   - Go to: https://vercel.com/justin-depierros-projects/litework/settings/environment-variables
   - Click **"Add New"**
   - Name: `CRON_SECRET`
   - Value: (paste the secret you generated)
   - Environments: Production, Preview, Development
   - Click **"Save"**

3. **Redeploy** (to pick up the new variable):
   - Go to Deployments
   - Click latest deployment → Redeploy

### Step 3: Add Cron Jobs

#### Job 1: Database Cleanup

1. **Login to cron-job.org**
2. Click **"Create cronjob"**
3. Fill in:
   - **Title**: `LiteWork - Database Cleanup`
   - **Address**: `https://liteworkapp.com/api/maintenance/cleanup`
   - **Schedule**: 
     - Type: Every day
     - Hour: `2`
     - Minute: `0`
   - **Request method**: `GET`
   - **Headers**: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET` (replace with secret from Step 2)
4. Click **"Create cronjob"**

#### Job 2: Workout Reminders (Morning)

1. Click **"Create cronjob"**
2. Fill in:
   - **Title**: `LiteWork - Morning Workout Reminders`
   - **Address**: `https://liteworkapp.com/api/cron/workout-reminders`
   - **Schedule**: 
     - Type: Every day
     - Hour: `7`
     - Minute: `0`
   - **Request method**: `GET`
   - **Headers**: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
3. Click **"Create cronjob"**

#### Job 3: Workout Reminders (Evening)

1. Click **"Create cronjob"**
2. Fill in:
   - **Title**: `LiteWork - Evening Workout Reminders`
   - **Address**: `https://liteworkapp.com/api/cron/workout-reminders`
   - **Schedule**: 
     - Type: Every day
     - Hour: `17` (5 PM)
     - Minute: `0`
   - **Request method**: `GET`
   - **Headers**: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
3. Click **"Create cronjob"**

---

## Testing Your Cron Jobs

### Test Manually

You can test the endpoints manually:

```bash
# Test cleanup (replace with your CRON_SECRET)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://liteworkapp.com/api/maintenance/cleanup

# Test workout reminders
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://liteworkapp.com/api/cron/workout-reminders
```

### Test via cron-job.org

On each cron job page:
1. Click **"Test run"** button
2. Check the **"Execution log"** tab
3. Should show `200 OK` status

---

## Monitoring

### Check Execution History

In cron-job.org dashboard:
1. Click on any job
2. View **"Execution history"** tab
3. See success/failure status and response times

### Enable Notifications

1. Click on a job
2. Go to **"Notifications"** tab
3. Enable **"Email on failure"**
4. Enter your email

---

## Troubleshooting

### "401 Unauthorized" Error
- Check `CRON_SECRET` is set in Vercel
- Verify `Authorization` header matches secret
- Redeploy if you just added the secret

### "500 Internal Server Error"
- Check Vercel deployment logs
- Verify Supabase credentials are set
- Test endpoint manually in browser

### Cron Not Running
- Verify schedule is correct (use 24-hour format)
- Check timezone settings (UTC by default)
- Enable "Email on failure" to get alerts

---

## Current Status

- ✅ Endpoints created
- ⏳ CRON_SECRET pending (do Step 2)
- ⏳ Cron jobs pending (do Step 3)

## Next Steps

1. Generate and add `CRON_SECRET` to Vercel
2. Set up 3 cron jobs on cron-job.org
3. Test each job
4. Enable failure notifications
5. Monitor for first 24 hours

---

## Alternative: Supabase Cron (if preferred)

If you prefer database-based crons, you can use Supabase Edge Functions:

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'litework-cleanup',
  '0 2 * * *',
  $$
  SELECT net.http_get(
    url:='https://liteworkapp.com/api/maintenance/cleanup',
    headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  );
  $$
);
```

But cron-job.org is simpler and has better monitoring.
