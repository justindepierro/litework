# Authentication & Redirect Quick Reference

**Last Updated:** November 23, 2025  
**Status:** ✅ Production-Ready

---

## Quick Links

- **Full Audit Report**: `docs/reports/AUTH_SECURITY_AUDIT_2025.md`
- **Auth Utilities**: `src/lib/auth-server.ts` (server), `src/contexts/AuthContext.tsx` (client)
- **Auth Guards**: `src/hooks/use-auth-guard.ts`
- **Middleware**: `middleware.ts`

---

## When to Use What

### ✅ API Routes (Server-Side)

**Always use one of these patterns:**

#### **Pattern 1: `withAuth()` Wrapper (Recommended)**
```typescript
import { withAuth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    // user is guaranteed to exist here
    return NextResponse.json({ data: "success" });
  });
}
```

#### **Pattern 2: `getAuthenticatedUser()` (Also Good)**
```typescript
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { error: authError || "Authentication required" },
      { status: 401 }
    );
  }
  
  // Check permissions if needed
  if (!isCoach(user)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }
  
  // Proceed with logic
}
```

---

### ✅ Pages (Server Components) - **Recommended Approach**

**Use server-side auth for best performance:**

```typescript
import { redirect } from "next/navigation";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";

export default async function MyPage() {
  const { user } = await getAuthenticatedUser();
  
  // Redirect if not authenticated
  if (!user) {
    redirect("/login");
  }
  
  // Redirect if insufficient permissions
  if (!isCoach(user)) {
    redirect("/dashboard");
  }
  
  // Fetch data server-side
  const data = await fetchData(user.id);
  
  // Render page
  return <MyComponent data={data} />;
}
```

**Benefits:**
- ✅ No client JavaScript needed for auth
- ✅ Zero flash of unauthorized content
- ✅ Better performance (less client work)
- ✅ SEO-friendly redirects

---

### ✅ Pages (Client Components) - **Current Common Pattern**

**Use auth guard hooks:**

```typescript
"use client";

import { useRequireAuth, useCoachGuard, useAdminGuard } from "@/hooks/use-auth-guard";

export default function MyClientPage() {
  // For any authenticated user (athlete, coach, admin)
  const { user, isLoading } = useRequireAuth();
  
  // For coach or admin only
  // const { user, isLoading } = useCoachGuard();
  
  // For admin only
  // const { user, isLoading } = useAdminGuard();
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // user is guaranteed here (guard redirects if not authenticated)
  return <MyComponent user={user} />;
}
```

**When to Use:**
- Interactive features requiring client state
- Real-time updates
- Heavy client-side logic

---

### ✅ Login/Signup Pages

**Redirect authenticated users away:**

```typescript
"use client";

import { useRedirectIfAuthenticated } from "@/hooks/use-auth-guard";

export default function LoginPage() {
  const { isLoading } = useRedirectIfAuthenticated("/dashboard");
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  // Show login form
  return <LoginForm />;
}
```

---

## Permission Helpers

### Available Functions (from `src/lib/auth-server.ts`)

```typescript
import { isAdmin, isCoach, hasRoleOrHigher, canManageGroups } from "@/lib/auth-server";

// Admin only
isAdmin(user)  // true if role === "admin"

// Coach or admin
isCoach(user)  // true if role === "coach" OR "admin"

// Hierarchical check (admin > coach > athlete)
hasRoleOrHigher(user, "coach")  // true if admin or coach

// Permission-based checks
canManageGroups(user)       // coach or admin
canAssignWorkouts(user)     // coach or admin
canViewAllAthletes(user)    // coach or admin
```

**⚠️ IMPORTANT: Admin Hierarchy**

**NEVER** check for coach like this:
```typescript
// ❌ BAD - Excludes admins!
if (user.role === "coach") {
  // Admin users won't have access!
}
```

**ALWAYS** use helper functions:
```typescript
// ✅ GOOD - Includes admins
if (isCoach(user)) {
  // Coach AND admin users have access
}
```

---

## Auth Guard Hooks

### Available Hooks (from `src/hooks/use-auth-guard.ts`)

```typescript
// Require any authenticated user
useRequireAuth()     // Main hook
useAthleteGuard()    // Alias for clarity

// Require coach or admin
useRequireCoach()    // Main hook
useCoachGuard()      // Alias for clarity

// Require admin only
useRequireAdmin()    // Main hook
useAdminGuard()      // Alias for clarity

// Redirect authenticated users (for login/signup)
useRedirectIfAuthenticated(redirectTo = "/dashboard")
```

### Return Value

```typescript
const { user, isLoading } = useRequireAuth();

// user: UserProfile | null
// isLoading: boolean
```

---

## Common Patterns

### 1. **API Route with Role Check**

```typescript
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    // Check permissions
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can create workouts" },
        { status: 403 }
      );
    }
    
    // Parse request
    const body = await request.json();
    
    // Create workout
    const workout = await createWorkout(user.id, body);
    
    return NextResponse.json({ success: true, workout });
  });
}
```

---

### 2. **Server Page with Data Fetching**

```typescript
export default async function WorkoutsPage() {
  // Check auth
  const { user } = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (!isCoach(user)) redirect("/dashboard");
  
  // Fetch data server-side
  const workouts = await fetchWorkouts(user.id);
  
  // Render page
  return <WorkoutsClient workouts={workouts} />;
}
```

---

### 3. **Client Page with Loading State**

```typescript
export default function ProfilePage() {
  const { user, isLoading } = useRequireAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchProfile(user.id).then(setProfile);
    }
  }, [user]);
  
  if (isLoading || !profile) {
    return <LoadingSkeleton />;
  }
  
  return <ProfileView profile={profile} />;
}
```

---

### 4. **Conditional Rendering Based on Role**

```typescript
export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show to all authenticated users */}
      <MyWorkouts userId={user!.id} />
      
      {/* Show only to coaches/admins */}
      {isCoach(user!) && (
        <AthleteManagement />
      )}
      
      {/* Show only to admins */}
      {isAdmin(user!) && (
        <SystemSettings />
      )}
    </div>
  );
}
```

---

## Redirect Flows

### Login → Dashboard

```
/login → useRedirectIfAuthenticated()
  ↓
If already logged in → redirect to /dashboard
  ↓
If not logged in → show login form
  ↓
After successful login → AuthContext updates
  ↓
useRedirectIfAuthenticated() detects user
  ↓
Redirect to /dashboard
```

### Protected Page → Login

```
User visits /workouts (protected page)
  ↓
useCoachGuard() checks auth
  ↓
If no user → redirect to /login
  ↓
If athlete user → redirect to /dashboard
  ↓
If coach/admin → render page
```

### Logout → Login

```
User clicks logout
  ↓
signOut() called (clears Supabase session)
  ↓
AuthContext clears user state
  ↓
Redirect to /login
  ↓
Protected pages now redirect back to /login
```

---

## Testing Checklist

### ✅ Authentication

- [ ] Login with valid credentials → dashboard
- [ ] Login with invalid credentials → error
- [ ] Already logged in + visit /login → dashboard
- [ ] Signup creates account → setup page
- [ ] Logout clears session → login page
- [ ] Password reset flow works

### ✅ Authorization

- [ ] Athlete cannot access /workouts → dashboard
- [ ] Coach can access /workouts
- [ ] Admin can access all pages
- [ ] API routes return 401 for unauthed
- [ ] API routes return 403 for insufficient perms

### ✅ Edge Cases

- [ ] Session expiration → logout
- [ ] Token refresh works
- [ ] Multiple tabs maintain state
- [ ] Back button after logout → login
- [ ] Direct URL to protected page → redirect

---

## Common Mistakes to Avoid

### ❌ **Mistake 1: Forgetting Admin Hierarchy**

```typescript
// ❌ BAD
if (user.role === "coach") {
  // Excludes admins!
}

// ✅ GOOD
if (isCoach(user)) {
  // Includes coaches AND admins
}
```

### ❌ **Mistake 2: Not Checking Auth in API Routes**

```typescript
// ❌ BAD - Unprotected endpoint!
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json({ data });
}

// ✅ GOOD
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    const data = await fetchData(user.id);
    return NextResponse.json({ data });
  });
}
```

### ❌ **Mistake 3: Client-Only Auth for Sensitive Pages**

```typescript
// ⚠️ WORKS but not optimal
export default function SensitivePage() {
  const { user, isLoading } = useRequireAuth();
  // Brief flash possible before redirect
}

// ✅ BETTER - Server-side check
export default async function SensitivePage() {
  const { user } = await getAuthenticatedUser();
  if (!user) redirect("/login");
  // No flash, better performance
}
```

### ❌ **Mistake 4: Not Handling Loading States**

```typescript
// ❌ BAD - Shows empty page
export default function MyPage() {
  const { user, isLoading } = useRequireAuth();
  return <div>{user.name}</div>; // Crashes if user is null!
}

// ✅ GOOD
export default function MyPage() {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  return <div>{user!.name}</div>; // Safe to use user!
}
```

---

## Quick Decision Tree

```
Need to protect a route?
  ↓
Is it an API route?
  ↓ YES
  Use withAuth() or getAuthenticatedUser()
  ↓
Is it a page?
  ↓ YES
  Can it be a server component?
    ↓ YES (RECOMMENDED)
    Use getAuthenticatedUser() + redirect()
    ↓ NO (client state needed)
    Use auth guard hooks (useRequireAuth, etc.)
  ↓
Need role-based access?
  ↓ YES
  Use permission helpers (isCoach, isAdmin, etc.)
  ↓
Is it login/signup page?
  ↓ YES
  Use useRedirectIfAuthenticated()
```

---

## Resources

- **Full Audit**: `docs/reports/AUTH_SECURITY_AUDIT_2025.md`
- **Architecture Docs**: `ARCHITECTURE.md`
- **Security Audit**: `SECURITY_AUDIT_REPORT.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md` (RLS policies)

---

## Quick Commands

```bash
# Check TypeScript (should show 0 errors)
npm run typecheck

# Run production build (verify auth works)
npm run build

# Run development server
npm run dev
```

---

**Need Help?** Check the full audit report at `docs/reports/AUTH_SECURITY_AUDIT_2025.md`
