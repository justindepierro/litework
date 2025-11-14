# 🔧 Quick Implementation Guide - Critical Auth Fixes
**Estimated Time**: 45 minutes  
**Impact**: High security improvements  
**Risk**: Low (additive changes only)

---

## Fix 1: Lock Email to Invite (15 minutes)

### Step 1: Update Signup Form

**File**: `src/app/signup/page.tsx`

**Find** (around line 200):
```tsx
<FloatingLabelInput
  label="Email"
  type="email"
  value={email}
  onChange={(value) => setEmail(value)}
  error={emailError}
/>
```

**Replace with**:
```tsx
<FloatingLabelInput
  label="Email"
  type="email"
  value={email}
  onChange={(value) => setEmail(value)}
  disabled={!!inviteData?.email}
  helperText={
    inviteData?.email
      ? "Email from your coach's invitation (cannot be changed)"
      : "Enter your email address"
  }
  error={emailError}
/>
```

### Step 2: Add Server Validation

**File**: `src/app/api/invites/accept/route.ts`

**Find** (around line 50):
```typescript
const body = await request.json();
const { inviteCode, password } = body;
```

**Replace with**:
```typescript
const body = await request.json();
const { inviteCode, password, email: submittedEmail } = body;

// CRITICAL: Validate email matches invite
if (submittedEmail && invite.email) {
  const inviteEmail = invite.email.toLowerCase().trim();
  const providedEmail = submittedEmail.toLowerCase().trim();
  
  if (providedEmail !== inviteEmail) {
    console.warn(
      `[SECURITY] Email mismatch attempt - Invite: ${inviteEmail}, Provided: ${providedEmail}`
    );
    return NextResponse.json(
      {
        error: "Email does not match invitation",
        details: "You must use the email address from your coach's invitation.",
      },
      { status: 400 }
    );
  }
}
```

**Test**:
1. Create invite for `athlete@test.com`
2. Try to sign up with different email
3. Should see error: "Email does not match invitation"

---

## Fix 2: Server-Side Password Validation (10 minutes)

### Step 1: Add Password Validation to API

**File**: `src/app/api/invites/accept/route.ts`

**Add import** (top of file):
```typescript
import { validatePassword } from "@/lib/security";
```

**Find** (around line 60):
```typescript
if (!inviteCode || !password) {
  return NextResponse.json(
    { error: "Invitation code and password are required" },
    { status: 400 }
  );
}
```

**Add after this block**:
```typescript
// CRITICAL: Enforce password requirements on server
const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
  console.warn("[SECURITY] Weak password attempt blocked");
  return NextResponse.json(
    {
      error: "Password does not meet requirements",
      details: passwordValidation.error,
      strength: passwordValidation.strength,
      requirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      },
    },
    { status: 400 }
  );
}

// Warn if password is weak (but allow it - user was warned)
if (passwordValidation.strength === "weak") {
  console.warn("[SECURITY] Weak password accepted after user warning");
}
```

**Test**:
1. Try to sign up with password "test" (bypass client validation in browser dev tools)
2. Should be rejected by server with specific error
3. Try with "Test123!" → Should succeed

---

## Fix 3: Email Verification (20 minutes)

### Option A: Supabase Built-in Verification (Recommended)

**File**: `src/app/api/invites/accept/route.ts`

**Find** (around line 90):
```typescript
const { data: authData, error: signUpError } = await supabase.auth.signUp({
  email: invite.email.toLowerCase(),
  password,
  options: {
    data: {
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role || "athlete",
    },
  },
});
```

**Replace with**:
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const { data: authData, error: signUpError } = await supabase.auth.signUp({
  email: invite.email.toLowerCase(),
  password,
  options: {
    emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    data: {
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role || "athlete",
      inviteId: inviteCode, // Store for callback
    },
  },
});

// Check if email confirmation is required
const requiresVerification = !authData.session; // No session = needs verification

if (requiresVerification) {
  console.log(
    `[AUTH] Email verification required for ${invite.email}`
  );
  
  // Update invite status but don't mark as fully accepted yet
  await supabase.from("invites").update(
    transformToSnake({
      status: "pending_verification",
      updatedAt: new Date().toISOString(),
    })
  ).eq("id", inviteCode);

  return NextResponse.json({
    success: true,
    requiresVerification: true,
    message: "Account created! Please check your email to verify your address.",
    email: invite.email,
  });
}
```

### Step 2: Update Frontend to Handle Verification

**File**: `src/app/signup/page.tsx`

**Find** (around line 180 in handleSubmit):
```typescript
if (response.ok) {
  // Success - redirect to dashboard
  router.push("/dashboard");
} else {
  // Handle error
}
```

**Replace with**:
```typescript
if (response.ok) {
  const data = await response.json();
  
  if (data.requiresVerification) {
    // Show email confirmation message
    setShowEmailConfirmation(true);
    setError("");
    // Don't redirect - show message to check email
  } else {
    // Auto-login successful - redirect
    router.push("/dashboard");
  }
} else {
  // Handle error
}
```

### Step 3: Update Email Confirmation UI

**File**: `src/app/signup/page.tsx`

**Find the email confirmation block** (should already exist around line 400):
```tsx
{showEmailConfirmation && (
  <div className="rounded-md bg-blue-50 p-4">
    {/* Existing content */}
  </div>
)}
```

**Update the message**:
```tsx
{showEmailConfirmation && (
  <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
    <div className="flex items-start">
      <Mail className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
      <div>
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Verify Your Email Address
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            We've sent a verification link to{" "}
            <strong>{email}</strong>
          </p>
          <p>
            Click the link in the email to activate your account and start
            tracking workouts!
          </p>
          <p className="text-xs text-blue-600 mt-3">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResendVerification}
              className="underline hover:text-blue-800"
            >
              resend verification email
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

### Step 4: Create Auth Callback Handler

**File**: `src/app/auth/callback/route.ts` (create new file)

```typescript
import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { transformToSnake } from "@/lib/case-transform";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      console.log(`[AUTH] Email verified for user: ${data.user.id}`);
      
      // Mark invite as fully accepted
      const inviteId = data.user.user_metadata?.inviteId;
      if (inviteId) {
        await supabase.from("invites").update(
          transformToSnake({
            status: "accepted",
            acceptedAt: new Date().toISOString(),
          })
        ).eq("id", inviteId);
      }
      
      // Redirect to dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Something went wrong - redirect to login
  return NextResponse.redirect(new URL("/login?error=verification_failed", requestUrl.origin));
}
```

### Step 5: Configure Supabase Email Templates (Optional)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize "Confirm signup" template with your branding
3. Update redirect URL to your domain

**Test**:
1. Create new invite
2. Sign up with that invite
3. Should see "Check your email" message
4. Check email for verification link
5. Click link → Should redirect to dashboard
6. Verify invite status changed to "accepted"

---

## Testing Checklist

### Test Fix 1: Email Lock
- [ ] Create invite for `test@example.com`
- [ ] Go to signup page with invite link
- [ ] Try to change email field
- [ ] Email field should be disabled/locked
- [ ] Submit form → Should succeed

### Test Fix 2: Password Validation
- [ ] Open browser dev tools
- [ ] Disable password validation JavaScript
- [ ] Try to submit with weak password
- [ ] Server should reject with error
- [ ] Check server logs for security warning

### Test Fix 3: Email Verification
- [ ] Sign up with new account
- [ ] Should see "Check your email" message
- [ ] Check inbox for verification email
- [ ] Click verification link
- [ ] Should redirect to dashboard
- [ ] Check database: invite status = "accepted"

---

## Rollback Plan

If anything breaks:

### Revert Fix 1
```tsx
// Remove disabled and helperText props from email input
<FloatingLabelInput
  label="Email"
  type="email"
  value={email}
  onChange={(value) => setEmail(value)}
  error={emailError}
/>
```

### Revert Fix 2
```typescript
// Remove password validation block from API
// Keep only the existing null check
if (!inviteCode || !password) {
  return NextResponse.json(
    { error: "Invitation code and password are required" },
    { status: 400 }
  );
}
```

### Revert Fix 3
```typescript
// Remove emailRedirectTo from signUp options
const { data: authData, error: signUpError } = await supabase.auth.signUp({
  email: invite.email.toLowerCase(),
  password,
  options: {
    data: {
      firstName: invite.firstName,
      lastName: invite.lastName,
      role: invite.role || "athlete",
    },
  },
});
// Remove requiresVerification check
```

---

## Production Deployment

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: Add critical auth security fixes
   
   - Lock email to invite to prevent hijacking
   - Add server-side password validation
   - Enable email verification for new signups
   
   Ref: AUTH_SIGNUP_SECURITY_AUDIT_NOV_14_2025.md"
   ```

2. **Test locally**:
   ```bash
   npm run typecheck  # Should pass
   npm run build      # Should succeed
   npm run dev        # Test signup flow
   ```

3. **Deploy to production**:
   ```bash
   git push origin main
   # Vercel will auto-deploy
   ```

4. **Verify in production**:
   - Test invite creation
   - Test signup with email lock
   - Test password validation
   - Test email verification flow

---

## Support

**Issues?** Check:
- Console logs for security warnings
- Supabase logs for auth errors
- Email delivery in Supabase dashboard

**Need help?** Let me know which fix is giving you trouble! 🚀
