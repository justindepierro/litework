# Codebase Cleanup Report

**Date**: October 31, 2025  
**Status**: In Progress

## Executive Summary

Comprehensive audit of LiteWork codebase identified **6 major issues** requiring cleanup:

1. ✅ **FIXED** - Admin role permission bug in dashboard
2. 🔄 **IN PROGRESS** - Obsolete auth files (3 files to remove)
3. ⚠️ **CRITICAL** - 13 API routes using deprecated auth system
4. 🧹 **CLEANUP** - Debug files in production code
5. 🧹 **CLEANUP** - 20+ console.log statements in production
6. 🔄 **AUDIT NEEDED** - Duplicate Supabase client files

---

## 1. ✅ Admin Role Permission Bug - FIXED

### Issue

Dashboard page checked `user.role === "coach"` without allowing admin access, violating the role hierarchy where admin inherits all coach permissions.

### Location

`src/app/dashboard/page.tsx:103`

### Fix Applied

```typescript
// Before
{user.role === "coach" && (

// After
{(user.role === "coach" || user.role === "admin") && (
```

### Impact

- **Severity**: Medium
- **Affected Users**: Admin users couldn't see Calendar View
- **Status**: ✅ FIXED

---

## 2. 🔄 Obsolete Auth Files - TO REMOVE

### Current Auth System

The codebase has been migrated to a clean client/server auth split:

- ✅ **KEEP** - `auth-client.ts` - Browser-side auth (signIn, signUp, getCurrentUser)
- ✅ **KEEP** - `auth-server.ts` - API route auth (getCurrentUser, requireAuth, requireCoach)
- ✅ **KEEP** - `auth-utils.ts` - Wrapper helpers (withAuth, withPermission)

### Obsolete Files (Not Used)

- ❌ **REMOVE** - `auth.ts` - Old JWT token verification system
- ❌ **REMOVE** - `auth-hybrid.ts` - Abandoned hybrid approach
- ❌ **REMOVE** - `supabase-auth.ts` - Old Supabase auth layer (402 lines!)

### Verification

```bash
# None of these are imported anywhere:
grep -r "from \"@/lib/auth-hybrid\"" src/  # 0 results
grep -r "from \"@/lib/supabase-auth\"" src/  # 0 results

# But old auth.ts is still used in 13 API routes (see Issue #3)
grep -r "from \"@/lib/auth\"" src/  # 13 matches
```

### Action Required

1. First migrate all API routes from `auth.ts` to `auth-server.ts` (Issue #3)
2. Then safely delete: `auth.ts`, `auth-hybrid.ts`, `supabase-auth.ts`

---

## 3. ⚠️ CRITICAL - Deprecated Auth System in API Routes

### Issue

13 API routes still use old `auth.ts` with JWT `verifyToken()` instead of new Supabase-based `auth-server.ts` with `getCurrentUser()`.

### Affected Files

```typescript
// Using OLD auth.ts:
src / app / api / debug / me / route.ts; // verifyToken
src / app / api / analytics / route.ts; // verifyToken
src / app / api / users / [id] / route.ts; // verifyToken, isAdmin
src / app / api / users / route.ts; // verifyToken, canViewAllAthletes
src / app / api / exercises / route.ts; // verifyToken
src / app / api / groups / [id] / route.ts; // verifyToken, canManageGroups
src / app / api / bulk - operations / route.ts; // verifyToken, canAssignWorkouts
src / app / api / workouts / route.ts; // verifyToken, canAssignWorkouts, canViewAllAthletes
src / app / api / kpis / route.ts; // verifyToken, canAssignWorkouts
src / app / api / kpis / [id] / route.ts; // verifyToken, canAssignWorkouts
src / app / api / auth / debug / route.ts; // verifyToken
src / app / api / assignments / route.ts; // verifyToken, canAssignWorkouts, isAthlete
src / app / api / messages / route.ts; // verifyToken
```

### Migration Pattern

```typescript
// OLD PATTERN (auth.ts):
import { verifyToken, canAssignWorkouts } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await verifyToken(request);
  if (!user || !canAssignWorkouts(user)) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... rest of code
}

// NEW PATTERN (auth-server.ts):
import { requireCoach, getAdminClient } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const user = await requireCoach(); // Automatically handles auth header + permissions
    const supabase = getAdminClient(); // For database operations
    // ... rest of code
  } catch (error) {
    return new Response(error.message, { status: 401 });
  }
}
```

### Benefits of Migration

- ✅ Consistent auth across all routes
- ✅ Reads Authorization header automatically
- ✅ Proper Supabase token verification
- ✅ Admin client bypasses RLS correctly
- ✅ Cleaner error handling

### Priority

**HIGH** - Two auth systems running in parallel is confusing and error-prone.

---

## 4. 🧹 Debug Files in Production

### Files to Remove

```
src/app/api/debug/me/route.ts       # Debug endpoint for auth testing
src/app/api/auth/debug/route.ts     # Another debug auth endpoint
src/app/debug/me/page.tsx           # Debug page (likely created during auth troubleshooting)
```

### Why Remove

- Expose internal auth details
- Not needed in production
- Created during October 30 auth rewrite debugging session
- Console shows these were used: `GET /api/debug/me` calls in terminal history

### Action

Delete all three files after verifying no production code references them.

---

## 5. 🧹 Console.log Statements

### Issue

20+ `console.log`, `console.error`, and `console.warn` statements in production code.

### Locations

**Authentication Files** (Most verbose):

- `auth-hybrid.ts` - 2 statements
- `auth-client.ts` - 1 error log
- `auth-server.ts` - 4 logs (including "No auth header found")
- `supabase-auth.ts` - 11 error logs

**Other Files**:

- `dev-config.ts` - Performance logging
- `performance-monitor.ts` - 2 web vitals warnings

### Recommendation

**Option A**: Remove entirely from production files  
**Option B**: Wrap in development check:

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("Debug info");
}
```

**Option C**: Replace with proper logging service (structured logs to Supabase/Sentry)

### Priority

**MEDIUM** - Not breaking but unprofessional and may leak sensitive info in browser console.

---

## 6. 🔄 Duplicate Supabase Client Files

### Files Found

```
src/lib/supabase.ts           # Used by: 3 files (analytics, health, exercises)
src/lib/supabase-client.ts    # Used by: 7 files (users, kpis, messages, bulk-ops, auth/login)
src/lib/supabase-server.ts    # Used by: 2 files (invites accept/validate)
src/lib/supabase-admin.ts     # Used by: auth-server.ts (admin client)
```

### Usage Breakdown

```typescript
// Current imports:
import { supabase } from "@/lib/supabase"; // 3 routes
import { supabaseApiClient } from "@/lib/supabase-client"; // 7 routes
import { createClient } from "@/lib/supabase-server"; // 2 routes
import { supabaseAdmin } from "@/lib/supabase-admin"; // 1 file (auth-server)
```

### Recommended Structure

**After auth migration is complete**:

1. **Keep** `supabase-admin.ts` - Admin client with service role key (used by auth-server)
2. **Consolidate** rest into single `supabase.ts` with clear exports:
   ```typescript
   // supabase.ts
   export const supabase = createClient(url, anonKey); // For client-side
   export const supabaseAdmin = createClient(url, serviceKey); // For server with RLS bypass
   ```

### Action Required

Audit each file to determine:

- Which ones are actually different?
- Can we consolidate to 2 files (client + admin)?
- Are the different names just historical artifacts?

---

## Summary of Actions

### Immediate (Before Production Deploy)

1. ✅ **DONE** - Fix admin role check in dashboard
2. ⚠️ **TODO** - Migrate 13 API routes to new auth system
3. 🧹 **TODO** - Delete debug files (3 files)

### Near-Term Cleanup

4. 🔄 **TODO** - Delete obsolete auth files (after migration complete)
5. 🔄 **TODO** - Audit and consolidate Supabase client files
6. 🧹 **TODO** - Remove/wrap console.log statements

### Validation Required

- [ ] Run full test suite after auth migration
- [ ] Verify no 401 errors on any routes
- [ ] Test admin, coach, and athlete access levels
- [ ] Confirm groups API working with new auth
- [ ] Check invite flow still works

---

## Testing Checklist

After completing auth migration:

- [ ] Admin can access all coach features (workouts, athletes, calendar)
- [ ] Coach can create groups and assign workouts
- [ ] Athlete can only see their own data
- [ ] All 13 migrated API routes return 200 on valid requests
- [ ] Invalid auth tokens return 401 with clear error message
- [ ] Group creation/editing still works (recently fixed Oct 31)
- [ ] Invite flow works end-to-end

---

## Related Documentation

- `ARCHITECTURE.md` - Auth patterns and best practices
- `SECURITY_AUDIT_REPORT.md` - Previous security fixes (Oct 30)
- `.github/copilot-instructions.md` - Auth rules for AI assistance
