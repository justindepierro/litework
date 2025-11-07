# Auth Timeout Error Fix

**Date**: November 7, 2025  
**Issue**: Profile fetch timeout showing empty error object in console  
**Status**: RESOLVED

## Problem

Console was showing cryptic auth errors:

```
[AUTH:profile_fetch:pje034] Auth state change error (5007ms) {}
```

### Root Cause Analysis

1. **Timeout Too Aggressive**: 5-second timeout was being exceeded (5007ms)
2. **Poor Error Reporting**: Error object was empty `{}` making debugging impossible
3. **Missing Context**: No indication whether issue was network, database, or timeout related
4. **Supabase Cold Starts**: Free tier databases can take 5+ seconds to wake up from sleep

## Solution

### 1. Increased Timeout (5s → 8s)

**Why**: Account for Supabase free tier cold starts and network latency

```typescript
// Before: 5000ms timeout
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
);

// After: 8000ms timeout with better message
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => {
    reject(new Error("Profile fetch timeout - database query exceeded 8 seconds. This may indicate network issues or database cold start."));
  }, 8000)
);
```

### 2. Enhanced Error Handling

**Why**: Provide actionable error information for debugging

```typescript
// Before: Silent failure, no error details
const { data: profile, error } = await Promise.race([
  profilePromise,
  timeoutPromise,
]);

// After: Explicit catch with detailed logging
const result = await Promise.race([
  profilePromise,
  timeoutPromise,
]).catch((err) => {
  const errorMessage = err?.message || String(err);
  timer.error("Profile fetch failed", {
    error: errorMessage,
    userId: session.user.id,
    isTimeout: errorMessage.includes("timeout"),
  });
  throw err;
});
```

### 3. Improved Error Classification

**Why**: Show error type, user message, and technical details

```typescript
// Before: Just passed classified object
timer.error("Auth state change error", classified);

// After: Structured error details
timer.error("Auth state change error", {
  type: classified.type,
  userMessage: classified.userMessage,
  technicalMessage: classified.technicalMessage,
  userId: session.user.id,
});
```

## Testing

### Expected Behavior (Normal Operation)

```
[AUTH:profile_fetch:xyz123] Auth state changed, loading user profile
[AUTH:profile_fetch:xyz123] User profile loaded successfully (247ms)
```

### Expected Behavior (Timeout)

```
[AUTH:profile_fetch:xyz123] Auth state changed, loading user profile
[AUTH:profile_fetch:xyz123] Profile fetch failed (8003ms) {
  error: "Profile fetch timeout - database query exceeded 8 seconds...",
  userId: "abc123",
  isTimeout: true
}
```

### Expected Behavior (Network Error)

```
[AUTH:profile_fetch:xyz123] Auth state changed, loading user profile
[AUTH:profile_fetch:xyz123] Profile fetch failed (1234ms) {
  error: "fetch failed",
  userId: "abc123",
  isTimeout: false
}
```

## Performance Expectations

| Scenario | Expected Duration | Action |
|----------|------------------|--------|
| **Hot database** | 100-500ms | Normal operation |
| **Warm database** | 500-2000ms | Acceptable |
| **Cold start** | 2000-6000ms | Acceptable (first load after idle) |
| **Timeout** | 8000ms+ | Investigate network/database issues |

## Monitoring

### How to Check for Issues

1. **Open Browser Console**
2. **Filter for `[AUTH:profile_fetch]`**
3. **Check duration** in parentheses: `(XXXXms)`
4. **Look for timeouts** or errors

### Common Issues

**Issue**: Consistent 8s+ timeouts  
**Cause**: Network issues or Supabase plan limitations  
**Solution**: Check internet connection, upgrade Supabase plan

**Issue**: Occasional 5-8s delays  
**Cause**: Supabase cold starts (free tier)  
**Solution**: Normal for free tier, consider upgrading or accept delay

**Issue**: All requests timeout  
**Cause**: Database down or network blocked  
**Solution**: Check Supabase status, firewall settings

## Related Files

- `src/lib/auth-client.ts` - Main auth logic with timeout
- `src/lib/auth-logger.ts` - Error classification and logging
- `src/components/ServiceWorkerRegistration.tsx` - Console error filtering
- `docs/AUTH_TROUBLESHOOTING.md` - Complete auth troubleshooting guide

## Prevention

### For Developers

1. **Always use timeouts** on external API calls
2. **Provide context** in error messages
3. **Log structured data** not just error objects
4. **Consider cold start scenarios** for serverless/free-tier services

### For Production

1. **Upgrade to paid Supabase tier** - No cold starts
2. **Monitor auth performance** - Track average duration
3. **Set up alerts** - Notify when timeouts increase
4. **Use connection pooling** - Supabase Pro feature

## Impact

✅ **Better Debugging**: Error messages now include actionable information  
✅ **Reduced False Positives**: 8s timeout accounts for cold starts  
✅ **Improved UX**: Fewer timeout errors for users on free tier  
✅ **Better Monitoring**: Structured error data for analytics

## Commit

Commit: `7f8c8ef`  
Message: "fix: Improve auth timeout handling and error diagnostics"
