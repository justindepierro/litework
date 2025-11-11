# Authentication System - Troubleshooting Guide

## Overview

LiteWork uses a comprehensive authentication system with full tracing, error handling, and health checking. This guide will help you debug any auth issues.

## Quick Diagnosis

### Step 1: Check Browser Console

Look for auth logs in the browser console. All auth operations are logged with this format:

```
[AUTH:event:correlationId] Message (duration)
```

**Event Types:**

- `init` - Auth system initialization
- `session_check` - Checking for existing session
- `profile_fetch` - Loading user profile from database
- `sign_in` - Sign in attempt
- `sign_out` - Sign out attempt
- `error` - Error occurred
- `timeout` - Operation timed out

### Step 2: Check Health Status

On page load, you'll see health check results:

```
[AUTH_HEALTH] Cookies are disabled
[AUTH_HEALTH] localStorage is disabled
[AUTH_HEALTH] Cannot reach Supabase server
```

**Common Issues:**

- **Cookies disabled**: Enable cookies in browser settings
- **localStorage disabled**: Disable private/incognito mode
- **Supabase unreachable**: Check network connection or Supabase status

### Step 3: Check Correlation IDs

Each auth flow has a unique correlation ID (e.g., `auth_1699347281234_a1b2c3d4e`). Follow the same correlation ID to trace a complete auth flow:

```
[AUTH:init:a1b2c3] Initializing authentication system
[AUTH:session_check:a1b2c3] Fetching session from Supabase
[AUTH:session_check:a1b2c3] No active session (150ms)
```

## Common Issues & Solutions

### Issue: "Session fetch timeout"

**Symptoms:**

```
[AUTH:session_check:xyz123] Session fetch timeout
```

**Causes:**

- Slow network connection
- Supabase service degraded
- Browser blocking third-party cookies

**Solutions:**

1. Check network connection
2. Verify Supabase status: https://status.supabase.com
3. Disable ad blockers/tracking protection
4. Enable third-party cookies for Supabase domain

### Issue: "Profile fetch timeout"

**Symptoms:**

```
[AUTH:profile_fetch:xyz123] Profile fetch timeout
```

**Causes:**

- Database query taking too long
- Network issues
- Missing user profile in database

**Solutions:**

1. Check database connection
2. Verify user exists in `users` table
3. Check Row Level Security (RLS) policies

### Issue: "Authentication initialization taking longer than expected"

**Symptoms:**

- Page shows loading spinner for 5+ seconds
- Console warning about initialization timeout

**Causes:**

- `getSession()` hanging
- Database query slow
- Network connectivity issues

**Solutions:**

1. Refresh the page
2. Clear browser cache and cookies
3. Check Supabase connection
4. Verify environment variables are set

### Issue: "Too many login attempts"

**Symptoms:**

```
[AUTH:sign_in:xyz123] Rate limit exceeded
```

**Causes:**

- Failed login attempts exceeded limit (5 per 15 minutes per email)

**Solutions:**

1. Wait 15 minutes before trying again
2. Verify correct password
3. Request password reset if needed

### Issue: "Invalid credentials or insufficient permissions"

**Symptoms:**

- Login fails with permission error
- 401 or 403 error in logs

**Causes:**

- Wrong email or password
- User account deactivated
- RLS policies blocking access

**Solutions:**

1. Verify email and password are correct
2. Check user exists in database
3. Verify user role is set correctly
4. Check RLS policies allow user access

## Debugging Tools

### Export Auth Logs

In browser console:

```javascript
// Get recent logs
console.log(JSON.stringify(window.authLogs || [], null, 2));

// Or use the export function (if available)
exportAuthLogs();
```

### Check Auth Health Manually

```javascript
checkAuthHealth().then((health) => {
  console.log("Health Check:", health);
});
```

### View Session Details

```javascript
supabase.auth.getSession().then(({ data, error }) => {
  console.log("Session:", data);
  console.log("Error:", error);
});
```

## Performance Metrics

All auth operations are timed. Look for duration in logs:

```
[AUTH:sign_in:xyz123] Sign in successful (1250ms)
```

**Expected Durations:**

- `session_check`: 50-300ms
- `profile_fetch`: 100-500ms
- `sign_in`: 500-2000ms (includes network round trip)
- `init`: 200-1000ms

**Slow Operations:**

- > 3000ms: Timeout will occur
- > 1000ms: Investigate network or database performance

## Error Messages

### User-Friendly Messages

The system provides clear error messages to users:

- "Unable to connect to the server. Please check your internet connection."
- "The request took too long. Please try again."
- "Invalid credentials or insufficient permissions."
- "An unexpected error occurred. Please try again."

### Technical Messages

Technical details are logged for debugging:

```
[AUTH:error:xyz123] Network error: Failed to fetch
```

## Environment Variables

Verify these are set correctly:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Check in browser console:**

```javascript
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
// Should show the URL, not "undefined"
```

## Testing Auth Flow

### Manual Test Checklist

1. **Cold Start (No Session)**
   - Open app in incognito/private mode
   - Should see login page within 2 seconds
   - Check for `[AUTH:init]` logs

2. **Login**
   - Enter credentials
   - Watch for `[AUTH:sign_in]` logs
   - Should redirect to dashboard within 2 seconds

3. **Session Restore**
   - Refresh page after login
   - Should auto-restore session
   - Check for `[AUTH:session_check]` and `[AUTH:profile_fetch]` logs

4. **Logout**
   - Click logout
   - Should redirect to login
   - Check for `[AUTH:sign_out]` logs

### Automated Health Check

The system automatically runs health checks on initialization:

```
[AUTH:init:xyz123] Auth system health check passed {
  checks: {
    supabaseConnection: true,
    cookiesEnabled: true,
    localStorageEnabled: true
  }
}
```

## Support

If issues persist after following this guide:

1. Export auth logs (see "Export Auth Logs" above)
2. Take screenshots of console errors
3. Note the correlation ID from the error
4. Report to development team with:
   - Browser and version
   - Steps to reproduce
   - Auth logs
   - Correlation ID

## Architecture Reference

- **Auth Logger**: `src/lib/auth-logger.ts`
- **Auth Client**: `src/lib/auth-client.ts`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Supabase Client**: `src/lib/supabase.ts`
- **Security Utilities**: `src/lib/security.ts`
