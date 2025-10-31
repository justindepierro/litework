# LiteWork Architecture & Best Practices

**Last Updated**: October 30, 2025  
**Status**: Living Document - Update as patterns evolve

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Route Patterns](#api-route-patterns)
3. [Frontend Routing & Guards](#frontend-routing--guards)
4. [TypeScript Conventions](#typescript-conventions)
5. [Error Handling](#error-handling)
6. [Future-Proofing Checklist](#future-proofing-checklist)

---

## Authentication & Authorization

### Role Hierarchy

```
admin (level 3) - Full system access
  ↓
coach (level 2) - Manage athletes, workouts, groups
  ↓
athlete (level 1) - View own data, complete workouts
```

**Critical Rule**: Admin role ALWAYS has coach and athlete permissions. Never check `role === "coach"` without also allowing `admin`.

### Permission Matrix

| Permission | Admin | Coach | Athlete |
|-----------|-------|-------|---------|
| View All Users | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Assign Workouts | ✅ | ✅ | ❌ |
| Manage Groups | ✅ | ✅ | ❌ |
| View Own Data | ✅ | ✅ | ✅ |

### Auth Helper Functions

**Backend (API Routes)**:
```typescript
import { withAuth, withPermission, withRole } from "@/lib/auth-utils";

// Requires any authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    // user is typed as AuthenticatedUser
    return NextResponse.json({ data: "success" });
  });
}

// Requires specific permission
export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    // Only admin and coach can reach here
    return NextResponse.json({ data: "created" });
  });
}

// Requires specific role (or higher)
export async function DELETE(request: NextRequest) {
  return withRole(request, "admin", async (user) => {
    // Only admin can reach here
    return NextResponse.json({ data: "deleted" });
  });
}
```

**Frontend (Page Guards)**:
```typescript
import { useCoachGuard, useAthleteGuard, useAnyUserGuard } from "@/hooks/use-auth-guard";

// Pages for coaches (and admins automatically)
function CoachPage() {
  const { user, isLoading } = useCoachGuard();
  if (isLoading) return <Loading />;
  // user.role is "coach" or "admin"
}

// Pages for any authenticated user
function DashboardPage() {
  const { user, isLoading } = useAnyUserGuard();
  if (isLoading) return <Loading />;
  // user.role is "admin", "coach", or "athlete"
}
```

### Permission Helpers (Both Frontend & Backend)

Located in `src/lib/supabase-auth.ts`:

```typescript
isAdmin(user)              // user.role === "admin"
isCoach(user)              // user.role === "coach" || admin
isAthlete(user)            // user.role === "athlete"
canManageGroups(user)      // coach or admin
canAssignWorkouts(user)    // coach or admin
canViewAllAthletes(user)   // coach or admin
canModifyWorkouts(user)    // coach or admin
```

**⚠️ Important**: These functions already handle the admin hierarchy. Use them instead of direct role checks.

---

## API Route Patterns

### Required Authentication Check

**Every API route** (except `/api/health` and `/api/auth/*`) MUST include authentication:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth, withPermission } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    // Your logic here
  });
}
```

### Standard Response Format

```typescript
// Success
return NextResponse.json({
  success: true,
  data: { /* your data */ }
});

// Error
return NextResponse.json(
  { error: "Error message" },
  { status: 400 } // or 401, 403, 404, 500
);
```

### File Structure

```
src/app/api/
├── resource/
│   ├── route.ts          # Collection endpoints (GET all, POST new)
│   └── [id]/
│       └── route.ts      # Item endpoints (GET, PUT, DELETE)
```

### Checklist for New API Routes

- [ ] Import `withAuth`, `withPermission`, or `withRole` from `@/lib/auth-utils`
- [ ] Wrap handler in appropriate auth wrapper
- [ ] Validate request body/params
- [ ] Use try-catch for error handling
- [ ] Return consistent response format
- [ ] Log sensitive operations with `logAuthEvent`
- [ ] Add JSDoc comments explaining the endpoint

---

## Frontend Routing & Guards

### Route Protection

All pages in these directories MUST use auth guards:

- `/dashboard` → `useAnyUserGuard()`
- `/workouts` → `useCoachGuard()`
- `/athletes` → `useCoachGuard()`
- `/progress` → `useAnyUserGuard()` (can view own or others based on role)
- `/schedule` → `useAnyUserGuard()`

### Navigation Visibility

In `Navigation.tsx`, use permission helpers to show/hide links:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { canViewAllAthletes, canAssignWorkouts } from "@/lib/supabase-auth";

const { user } = useAuth();

{canAssignWorkouts(user) && (
  <Link href="/workouts">Workouts</Link>
)}

{canViewAllAthletes(user) && (
  <Link href="/athletes">Athletes</Link>
)}
```

**Never use**:
```typescript
// ❌ Bad - excludes admin
{user.role === "coach" && <Link>...</Link>}

// ✅ Good - includes admin
{canViewAllAthletes(user) && <Link>...</Link>}
```

---

## TypeScript Conventions

### Type Location

```
src/types/index.ts         # All shared types (User, Workout, Exercise, etc.)
src/lib/auth-utils.ts      # Auth-specific types (Role, Permission)
Component files            # Component-specific interfaces only
```

### Consistent Type Names

- **User Types**: `User`, `AuthenticatedUser`, `AthleteProfile`
- **Resource Types**: `Workout`, `WorkoutPlan`, `Exercise`, `WorkoutExercise`
- **Metadata Types**: `Role`, `Permission`, `AuthResult`

### Type Exports

Always export types from a centralized location:

```typescript
// ✅ Good
export type { User, Workout, Exercise } from "@/types";

// ❌ Bad
export type User = { ... };  // in multiple files
```

---

## Error Handling

### API Routes

```typescript
try {
  // Your logic
} catch (error) {
  console.error("Descriptive error context:", error);
  return NextResponse.json(
    { error: "User-friendly error message" },
    { status: 500 }
  );
}
```

### Frontend

```typescript
try {
  await apiClient.someMethod();
  setError(null);
} catch (error) {
  setError(error instanceof Error ? error.message : "An error occurred");
}
```

### Logging Sensitive Operations

```typescript
import { logAuthEvent } from "@/lib/auth-utils";

// After successful sensitive operation
logAuthEvent(user, "DELETE", "user", true, { targetUserId: id });

// After failed attempt
logAuthEvent(user, "DELETE", "user", false, { targetUserId: id, reason: "not found" });
```

---

## Future-Proofing Checklist

### Before Creating a New API Route

1. [ ] Choose appropriate auth wrapper (`withAuth`, `withPermission`, `withRole`)
2. [ ] Document expected request/response in JSDoc
3. [ ] Add to API route inventory (see below)
4. [ ] Test with all three roles (admin, coach, athlete)
5. [ ] Verify 401/403 responses work correctly

### Before Creating a New Page

1. [ ] Add appropriate guard hook (`useCoachGuard`, etc.)
2. [ ] Add loading state while auth is resolving
3. [ ] Add link to navigation if needed
4. [ ] Use permission helpers for conditional rendering
5. [ ] Test with different roles

### Before Checking User Roles

1. [ ] Use existing permission helpers (`canAssignWorkouts`, etc.)
2. [ ] If creating new check, add to `auth-utils.ts`
3. [ ] Remember: admin always has coach/athlete permissions
4. [ ] Never check `role === "coach"` without also allowing admin

### Code Review Checklist

- [ ] All API routes have auth
- [ ] All pages have guards
- [ ] No direct role comparisons (use helpers)
- [ ] Error messages are user-friendly
- [ ] Sensitive operations are logged
- [ ] TypeScript types are imported from central location
- [ ] No unused imports or console.logs
- [ ] Consistent code formatting

---

## API Route Inventory

| Route | Auth | Permission | Status |
|-------|------|-----------|--------|
| `/api/health` | Public | None | ✅ |
| `/api/auth/login` | Public | None | ✅ |
| `/api/auth/debug` | Required | Any | ✅ |
| `/api/workouts` | Required | Coach | ✅ |
| `/api/exercises` | Required | Any | ✅ |
| `/api/groups` | Required | Coach | ✅ |
| `/api/groups/[id]` | Required | Coach | ✅ |
| `/api/assignments` | Required | Role-based | ✅ |
| `/api/users` | Required | Coach | ✅ |
| `/api/users/[id]` | Required | Admin | ✅ |
| `/api/messages` | Required | Any | ✅ |
| `/api/kpis` | Required | Coach | ✅ |
| `/api/kpis/[id]` | Required | Coach | ✅ |
| `/api/bulk-operations` | Required | Coach | ✅ |
| `/api/analytics` | Required | Coach | ✅ |

---

## Common Pitfalls to Avoid

### ❌ Direct Role Check
```typescript
if (user.role === "coach") {
  // Excludes admin!
}
```

### ✅ Use Permission Helper
```typescript
if (canAssignWorkouts(user)) {
  // Includes admin and coach
}
```

### ❌ Missing Auth on API Route
```typescript
export async function GET(request: NextRequest) {
  const result = await getData(); // No auth check!
  return NextResponse.json(result);
}
```

### ✅ Proper Auth Wrapper
```typescript
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    const result = await getData();
    return NextResponse.json(result);
  });
}
```

### ❌ Inconsistent Error Responses
```typescript
return NextResponse.json("Error occurred"); // Wrong format
return new Response("Error", { status: 500 }); // Wrong class
```

### ✅ Consistent Error Format
```typescript
return NextResponse.json(
  { error: "Error occurred" },
  { status: 500 }
);
```

---

## Migration Guide

When you find an existing pattern that violates these guidelines:

1. **Don't panic** - These were added iteratively
2. **Fix incrementally** - Update one route/component at a time
3. **Test thoroughly** - Verify with all user roles
4. **Document changes** - Update this file if patterns evolve
5. **Commit atomically** - One logical fix per commit

---

## Questions or Updates?

If you encounter a scenario not covered here, or if a pattern needs to change:

1. Document the issue in `ARCHITECTURE.md` (this file)
2. Update relevant code
3. Add to the appropriate checklist
4. Commit with descriptive message

**Remember**: This is a living document. Keep it updated!
