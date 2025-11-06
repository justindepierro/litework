# Authentication Quick Wins - Action Guide

**Status**: 🎯 HIGH PRIORITY IMPROVEMENTS  
**Time Required**: 6-10 hours total  
**Impact**: 🟢 HIGH (production hardening)

---

## Overview

After the deep security analysis, the auth system is **production-ready** but has 3 high-priority improvements that should be completed before launch:

1. ✅ **Integrate Server-Side Rate Limiting** (2-4 hours)
2. ✅ **Remove Deprecated Auth Functions** (4-6 hours)
3. ⚠️ **Verify Supabase RLS Policies** (30-60 min)

---

## Quick Win #1: Integrate Server-Side Rate Limiting

**Status**: Library created, not integrated  
**File**: `src/lib/rate-limit-server.ts` ✅ Complete  
**Time**: 2-4 hours  
**Priority**: 🔴 HIGH

### What's Missing

The rate limiting library exists but is not used in any API routes. This means:

- ⚠️ Client-side rate limiting can be bypassed (clear localStorage)
- ⚠️ No server-side protection against brute force attacks
- ⚠️ Attackers can make unlimited login attempts

### Files to Update

1. **Create Auth API Routes** (Supabase handles this, but we can add middleware)

2. **Add Rate Limiting Middleware** - NEW FILE  
   `src/middleware/rate-limit.ts`

3. **Or Add to Individual Routes** - Simpler approach

### Option A: Middleware Approach (Recommended)

**Create**: `src/middleware/rate-limit.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit-server";

/**
 * Rate limit middleware for API routes
 * Usage: Wrap handler with this middleware
 */
export async function withRateLimit(
  request: NextRequest,
  operation: "login" | "signup" | "passwordReset" | "api",
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = getClientIP(request.headers);

  const { allowed, remaining, resetTime } = await checkRateLimit(ip, operation);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": `${remaining}`,
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": `${resetTime}`,
        },
      }
    );
  }

  return handler(request);
}
```

### Option B: Direct Integration (Simpler)

**Example**: Add to invite acceptance route

**File**: `src/app/api/invites/accept/route.ts`

```typescript
import {
  checkRateLimit,
  getClientIP,
  resetRateLimit,
} from "@/lib/rate-limit-server";

export async function POST(request: NextRequest) {
  // 1. Check rate limit FIRST
  const ip = getClientIP(request.headers);
  const { allowed } = await checkRateLimit(ip, "signup");

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    // ... existing validation ...

    // ... create user account ...

    // 2. Reset rate limit on success
    await resetRateLimit(ip, "signup");

    return NextResponse.json({ success: true });
  } catch (error) {
    // Rate limit NOT reset on failure
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

### Routes to Protect

**Critical** (do first):

- ✅ `/api/invites/accept` - Signup rate limit (3/hour)
- ✅ Any custom login endpoint (if exists)

**Important** (do second):

- ✅ `/api/invites/route` - POST (creating invites)
- ✅ `/api/users/route` - POST (creating users)

**Nice to have**:

- ℹ️ All POST/PUT/DELETE API routes - General API limit (100/min)

### Implementation Steps

```bash
# 1. Test the rate limiting library
npm run dev
# Make 10 requests to same endpoint from same IP
# Verify 429 response after limit

# 2. Choose approach (middleware or direct)
# Recommendation: Start with direct integration (simpler)

# 3. Update routes one by one
# - Add checkRateLimit() call
# - Add resetRateLimit() on success
# - Test with curl/Postman

# 4. Test edge cases
# - Different IPs
# - Rate limit expiry
# - Success after rate limit
```

### Testing

```bash
# Test rate limiting
curl -X POST http://localhost:3000/api/invites/accept \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"test","password":"Test123!"}' \
  --repeat 5

# Should see 429 after limit reached
```

---

## Quick Win #2: Remove Deprecated Auth Functions

**Status**: Present but marked deprecated  
**File**: `src/lib/auth-server.ts` (lines 181-231)  
**Time**: 4-6 hours  
**Priority**: 🟠 HIGH (consistency)

### Problem

**Deprecated Functions** (lines 181-231):

```typescript
// ❌ Old pattern
export async function requireAuth(): Promise<AuthUser>;
export async function requireCoach(): Promise<AuthUser>;
export async function requireRole(role): Promise<AuthUser>;
export async function getCurrentUser(): Promise<AuthUser | null>;
```

**Current Usage**: Found in 20+ API routes

**Issue**: Mixed patterns across codebase

- Some routes use `getAuthenticatedUser()` ✅ New pattern
- Some routes use `requireCoach()` ❌ Old pattern

### Decision Required

**Option A: Remove Completely** (Recommended for consistency)

- ✅ Single pattern across codebase
- ✅ Clearer for new developers
- ⚠️ Requires updating 20+ API routes

**Option B: Keep as Convenience Wrappers**

- ✅ Less work (just update docs)
- ⚠️ Two patterns forever
- ⚠️ Confusion for developers

### Recommendation: **Remove Completely**

### Implementation Plan

**Step 1**: Find all usages

```bash
# Find all API routes using deprecated functions
grep -r "requireAuth\|requireCoach\|requireRole\|getCurrentUser" src/app/api
```

**Step 2**: Update pattern (example)

**Before** (deprecated):

```typescript
// ❌ Old pattern
export async function GET() {
  await requireCoach();
  // ... logic
}
```

**After** (new pattern):

```typescript
// ✅ New pattern
export async function GET() {
  const { user, error } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!isCoach(user)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  // ... logic
}
```

**Step 3**: Update all routes

Routes to update (from grep search):

1. `/api/users/route.ts`
2. `/api/athletes/route.ts`
3. `/api/groups/route.ts`
4. `/api/assignments/route.ts`
5. ... (20+ total)

**Step 4**: Remove deprecated functions

**File**: `src/lib/auth-server.ts`

Delete lines 181-231:

```typescript
// Delete these functions:
// - getCurrentUser()
// - requireAuth()
// - requireRole()
// - requireCoach()
```

**Step 5**: Test

```bash
# Run TypeScript check
npm run typecheck

# Should show errors where deprecated functions are used
# Fix all errors

# Run tests
npm test

# Verify all API routes return proper status codes
```

### Quick Reference: Migration Patterns

**Pattern 1**: Any authenticated user

```typescript
// Before
const user = await requireAuth();

// After
const { user, error } = await getAuthenticatedUser();
if (!user) {
  return NextResponse.json({ error }, { status: 401 });
}
```

**Pattern 2**: Coach or admin only

```typescript
// Before
await requireCoach();

// After
const { user, error } = await getAuthenticatedUser();
if (!user) return NextResponse.json({ error }, { status: 401 });
if (!isCoach(user))
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**Pattern 3**: Admin only

```typescript
// Before
await requireRole("admin");

// After
const { user, error } = await getAuthenticatedUser();
if (!user) return NextResponse.json({ error }, { status: 401 });
if (!isAdmin(user))
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

**Pattern 4**: Check specific permission

```typescript
// Before
const user = await requireAuth();
if (!canManageGroups(user)) throw new Error("Forbidden");

// After (same, just different requireAuth)
const { user, error } = await getAuthenticatedUser();
if (!user) return NextResponse.json({ error }, { status: 401 });
if (!canManageGroups(user))
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

---

## Quick Win #3: Verify Supabase RLS Policies

**Status**: Assumed configured  
**Time**: 30-60 minutes  
**Priority**: 🔴 CRITICAL

### Why Critical

**Row Level Security (RLS)** is the last line of defense:

- Even if code has bugs, database blocks unauthorized access
- Prevents data leaks from SQL injection
- Ensures athlete data privacy

### What to Check

**File**: `database/schema.sql` (or Supabase dashboard)

1. **Users Table** (`users`)
   - [ ] Athletes can only SELECT their own row
   - [ ] Coaches can SELECT all athletes
   - [ ] Only service role can INSERT/UPDATE/DELETE
2. **Workout Plans** (`workout_plans`)
   - [ ] Athletes can SELECT only assigned workouts
   - [ ] Coaches can SELECT/INSERT/UPDATE/DELETE own workouts
3. **Workout Assignments** (`workout_assignments`)
   - [ ] Athletes can SELECT only own assignments
   - [ ] Coaches can SELECT/INSERT/UPDATE/DELETE for their athletes
4. **Performance Data** (`athlete_kpis`, `progress_entries`)
   - [ ] Athletes can SELECT/UPDATE only own data
   - [ ] Coaches can SELECT all athlete data

### How to Test

**Option A**: Supabase Dashboard

1. Go to Authentication → Policies
2. Check each table has RLS enabled
3. Review policy definitions

**Option B**: SQL Query

```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Should show rowsecurity = true for all tables
```

**Option C**: Manual Test (most thorough)

```bash
# 1. Create test athlete account
# 2. Try to access another athlete's data via API
curl -X GET http://localhost:3000/api/athletes/[other-athlete-id] \
  -H "Cookie: litework-auth-token=..."

# Should return 403 or empty result
```

### Fix if Missing

If RLS not enabled:

```sql
-- Enable RLS on table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example policy: Athletes see only own data
CREATE POLICY "athletes_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id OR
         (SELECT role FROM users WHERE id = auth.uid()) IN ('coach', 'admin'));

-- Example policy: Coaches see all athletes
CREATE POLICY "coaches_select_all" ON users
  FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('coach', 'admin'));
```

### Reference

See: `docs/DATABASE_SCHEMA.md` for table relationships and expected access patterns.

---

## Testing Checklist

After completing all quick wins:

**Rate Limiting**:

- [ ] Make 6 login attempts → 6th should fail with 429
- [ ] Wait 15 minutes → Should work again
- [ ] Try from different IP → Should work

**Auth Pattern**:

- [ ] All API routes use `getAuthenticatedUser()`
- [ ] TypeScript compiles with 0 errors
- [ ] No deprecated function usages
- [ ] All routes return proper status codes (401/403)

**RLS Policies**:

- [ ] Athletes cannot see other athletes' data
- [ ] Coaches can see all athletes
- [ ] Admins can see everything
- [ ] Test with real user accounts (not service role)

---

## Time Estimate Summary

| Task                        | Priority    | Time        | Impact               |
| --------------------------- | ----------- | ----------- | -------------------- |
| Rate Limiting Integration   | 🔴 HIGH     | 2-4h        | Prevent brute force  |
| Remove Deprecated Functions | 🟠 HIGH     | 4-6h        | Code consistency     |
| Verify RLS Policies         | 🔴 CRITICAL | 0.5-1h      | Data privacy         |
| **TOTAL**                   |             | **6.5-11h** | **Production-ready** |

---

## What Not To Do

❌ **Don't** implement all at once (test incrementally)  
❌ **Don't** skip testing after each change  
❌ **Don't** deploy without verifying RLS policies  
❌ **Don't** remove rate limiting library (it's working)  
❌ **Don't** change cookie settings (they're secure)

---

## Questions?

**Q: Can we skip rate limiting integration?**  
A: Not recommended. Client-side protection is easily bypassed.

**Q: Can we keep deprecated functions?**  
A: Yes, but update documentation and accept two patterns forever.

**Q: How urgent is RLS verification?**  
A: CRITICAL. This is your last line of defense.

**Q: Should we add 2FA now?**  
A: No, not urgent. Can be added post-launch.

---

**Document Version**: 1.0  
**Created**: January 2025  
**Estimated Completion**: 1-2 days  
**Target**: Before production launch
