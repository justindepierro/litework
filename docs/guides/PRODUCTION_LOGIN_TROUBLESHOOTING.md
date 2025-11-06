# Production Login Troubleshooting Guide

**Issue**: Unable to login in production (Vercel deployment)

## Step 1: Use the Diagnostic Page

1. **Visit**: `https://your-app.vercel.app/diagnose`
2. **Look for** any ❌ marks in the diagnostics
3. **Most common issue**: Missing environment variables

## Step 2: Check Vercel Environment Variables

Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

**Required Variables** (must match your `.env.local`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lzsjaqkhdoqsafptqpnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...

# JWT
JWT_SECRET=U2VcJCvOzpwTA1jLoarCXljX3XohXiEMsoi54DArie0

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_VERSION=1.0.0

# Notifications (if using)
VAPID_PUBLIC_KEY=your-key
VAPID_PRIVATE_KEY=your-key
VAPID_SUBJECT=mailto:your-email
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-key
RESEND_API_KEY=your-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
CRON_SECRET=your-secret
```

**CRITICAL**: Make sure to set these for **all environments**:
- Production
- Preview  
- Development

## Step 3: Verify Supabase Keys

Your Supabase keys might be old or placeholder values. Get fresh keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/settings/api)
2. Copy the **anon/public** key
3. Copy the **service_role** key (secret!)
4. Update in Vercel environment variables
5. **Redeploy** the app after updating

## Step 4: Common Issues & Solutions

### Issue: "Invalid email or password"

**Possible causes**:
- Wrong credentials
- Email not verified in Supabase
- User doesn't exist in production database

**Solution**:
1. Check [Supabase Authentication](https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/auth/users)
2. Verify user exists
3. Check if email is confirmed
4. Try resetting password

### Issue: "Network error" or "Failed to fetch"

**Possible causes**:
- Supabase project paused
- Wrong Supabase URL
- CORS issues

**Solution**:
1. Check Supabase project is active
2. Verify `NEXT_PUBLIC_SUPABASE_URL` matches your project
3. Check Supabase dashboard for any service issues

### Issue: Cookies not working

**Possible causes**:
- Not using HTTPS
- Browser blocking third-party cookies
- Incorrect cookie settings

**Solution**:
1. Ensure production URL uses `https://` not `http://`
2. Check browser allows cookies
3. Try in incognito/private mode
4. Use diagnostic page → "Clear All Cookies" button

### Issue: "Too many login attempts"

**Solution**:
- Wait 15 minutes (rate limiting)
- Or use diagnostic page → "Clear LocalStorage" button

## Step 5: Test Login

**Test credentials** (coach account):
```
Email: jdepierro@burkecatholic.org
Password: TempPassword123!
```

Try logging in:
1. In production: `https://your-app.vercel.app/login`
2. In diagnostic page: Use "Test Login" button

## Step 6: Check Browser Console

If login still fails:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for errors (especially AUTH_CLIENT messages)
5. Check Network tab for failed requests

## Step 7: Force Redeploy

Sometimes Vercel needs a fresh deployment:

```bash
# From your local machine
git commit --allow-empty -m "force redeploy"
git push origin main
```

Or in Vercel Dashboard:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

## Step 8: Nuclear Option - Clear Everything

If nothing works, try this on the diagnostic page:

1. Click "Clear LocalStorage"
2. Click "Clear All Cookies"  
3. Click "Force Sign Out"
4. Close browser completely
5. Reopen and try logging in

## Getting Help

If still having issues, share:

1. Screenshot of `/diagnose` page
2. Browser console errors
3. Network tab screenshot showing failed requests
4. Which step you're stuck on

## Quick Reference

**Diagnostic page**: `/diagnose`
**Login page**: `/login`
**Supabase Dashboard**: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt
**Vercel Dashboard**: https://vercel.com/dashboard

## Most Likely Solutions

Based on common issues:

1. **80% chance**: Missing `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
2. **15% chance**: Using old/placeholder Supabase keys
3. **5% chance**: Supabase project paused or billing issue

**First thing to check**: Vercel environment variables are set!
