# Security Features Documentation

## Overview

LiteWork implements comprehensive security measures to protect user data and prevent common web vulnerabilities while maintaining fast performance. All security features are designed to be transparent to users while providing robust protection.

## Core Security Features

### 1. Rate Limiting

**Purpose**: Prevent brute force attacks and API abuse

**Implementation**: In-memory rate limiting with configurable windows

**Limits**:

- **Login**: 5 attempts per 15 minutes per email
- **Signup**: 3 attempts per hour per client
- **API**: 100 requests per minute per IP
- **Password Reset**: 3 attempts per hour per email

**User Experience**:

- Clear error messages with time remaining
- Countdown timer showing when to retry
- Automatic retry after limit expires
- Non-blocking UI (form disabled during rate limit)

**Files**:

- `src/lib/security.ts` - Rate limiting logic
- `src/lib/auth-client.ts` - Integration in auth flows
- `src/components/ui/RateLimitError.tsx` - User feedback component

### 2. Input Validation

**Purpose**: Prevent invalid data and injection attacks

**Email Validation**:

- RFC 5322 compliant regex pattern
- Maximum length: 254 characters
- Real-time feedback on login/signup forms
- Automatic trimming and lowercase conversion

**Password Validation**:

- Minimum length: 8 characters
- Maximum length: 128 characters
- Strength calculation (weak/medium/strong):
  - **Weak**: < 8 chars or common password
  - **Medium**: 8+ chars, 2+ criteria met
  - **Strong**: 12+ chars, all criteria met (uppercase, lowercase, numbers, special chars)
- Common password detection (top 100 most common)
- Real-time strength indicator on signup

**Name Validation**:

- Minimum length: 2 characters
- Maximum length: 50 characters
- Allowed: letters, spaces, hyphens, apostrophes
- Prevents special characters and numbers

**Files**:

- `src/lib/security.ts` - Validation functions
- `src/components/ui/PasswordStrengthIndicator.tsx` - Visual feedback
- `src/app/login/page.tsx` - Login form with validation
- `src/app/signup/page.tsx` - Signup form with validation (when created)

### 3. XSS Prevention

**Purpose**: Prevent cross-site scripting attacks

**Methods**:

- Input sanitization removes HTML tags, script tags, and event handlers
- Content Security Policy (CSP) headers restrict script execution
- All user inputs sanitized before storage
- Context-aware output encoding

**Implementation**:

```typescript
// Example usage
const safeInput = sanitizeInput(userInput);
// Removes: <script>, javascript:, onclick=, etc.
```

**Files**:

- `src/lib/security.ts` - `sanitizeInput()` function
- `middleware.ts` - CSP headers

### 4. Security Headers

**Purpose**: Protect against various web vulnerabilities

**Headers Applied**:

- **Content-Security-Policy**: Restricts resource loading, prevents XSS
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS filtering
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **Referrer-Policy**: strict-origin-when-cross-origin - Protects referrer info
- **Permissions-Policy**: Restricts browser features (camera, mic, etc.)

**Files**:

- `middleware.ts` - Applied to all routes via Next.js middleware

### 5. Audit Logging

**Purpose**: Track security events for monitoring and forensics

**Events Logged**:

- Successful logins
- Failed login attempts
- Rate limit violations
- Signup attempts
- Password resets
- Session events

**Log Format**:

```typescript
{
  timestamp: Date.now(),
  event: "login_success",
  userId: "user-id",
  success: true,
  metadata: { email: "user@example.com" },
  fingerprint: "client-fingerprint"
}
```

**Storage**:

- Development: Console logging
- Production: Ready for logging service integration (Datadog, LogRocket, etc.)

**Files**:

- `src/lib/security.ts` - `logSecurityEvent()`, `createAuditLog()`

### 6. Client Fingerprinting

**Purpose**: Identify devices for rate limiting and suspicious activity detection

**Data Collected** (anonymous):

- User agent
- Screen resolution
- Timezone
- Language preferences
- Platform

**Privacy**:

- No personal information collected
- Used only for security purposes
- Stored temporarily in rate limit checks

**Files**:

- `src/lib/security.ts` - `getClientFingerprint()`

### 7. Session Security

**Purpose**: Secure user sessions and prevent hijacking

**Features**:

- Secure token generation using Web Crypto API
- Session validation on protected routes
- Automatic session refresh
- Logout on suspicious activity detection

**Files**:

- `src/contexts/AuthContext.tsx` - Session management
- `src/hooks/use-auth-guard.ts` - Route protection

## Performance Considerations

### Target: <100ms Overhead

All security features are optimized for minimal performance impact:

**Validation** (synchronous):

- Email validation: ~0.5ms
- Password validation: ~1-2ms
- Name validation: ~0.3ms
- Input sanitization: ~1-2ms
- **Total**: ~5ms per form submission

**Rate Limiting** (synchronous):

- Map lookup: ~0.1ms
- Rate calculation: ~0.2ms
- **Total**: ~0.3ms per request

**Fingerprinting** (synchronous):

- Browser info collection: ~1ms
- Hashing (when needed): ~5-10ms (async, non-blocking)

**Total Security Overhead**: ~6-16ms

- Well below 100ms target
- Imperceptible to users
- No impact on perceived performance

### Optimization Strategies

1. **In-Memory Rate Limiting**:
   - Fast Map lookups (O(1))
   - No database queries
   - Cleared automatically on successful auth

2. **Validation Caching**:
   - Common password list precompiled
   - Regex patterns compiled once
   - Reusable validation functions

3. **Async Where Possible**:
   - Password hashing uses crypto.subtle (non-blocking)
   - Audit logging doesn't block UI
   - Client fingerprinting cached per session

4. **Lazy Loading**:
   - Security utilities imported only when needed
   - Components code-split automatically
   - Minimal bundle size impact

## Implementation Guide

### Adding Security to New Features

**1. API Routes** - Add rate limiting:

```typescript
import { checkRateLimit, getRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateCheck = checkRateLimit(ip, getRateLimit("api"));

  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // ... rest of handler
}
```

**2. Forms** - Add validation:

```typescript
import { validateEmail, validatePassword } from "@/lib/security";

const handleSubmit = async (e: FormEvent) => {
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    setError(emailCheck.error);
    return;
  }

  // ... rest of submission
};
```

**3. User Input** - Sanitize before storage:

```typescript
import { sanitizeInput } from "@/lib/security";

const safeComment = sanitizeInput(userComment);
await saveToDatabase(safeComment);
```

## Security Best Practices

### Do's ✅

- Always validate on both client and server
- Use rate limiting for all sensitive operations
- Sanitize all user inputs before storage
- Log security events for monitoring
- Test security features in production-like environment
- Keep security library updated

### Don'ts ❌

- Never store passwords in plain text (using Supabase Auth)
- Don't skip validation on "trusted" inputs
- Avoid blocking UI with security checks
- Don't log sensitive data (passwords, tokens)
- Never trust client-side validation alone

## Monitoring & Alerts

### Metrics to Track

1. **Rate Limit Events**:
   - Number of rate-limited requests
   - Most frequently limited endpoints
   - Time-to-recovery patterns

2. **Authentication Events**:
   - Failed login attempts per email
   - Successful logins per hour
   - Signup conversion rate

3. **Suspicious Activity**:
   - Multiple failed attempts from same IP
   - Rapid request patterns
   - Unusual device/location combinations

### Integration Points

The security system is ready for integration with:

- **Datadog**: APM and logging
- **Sentry**: Error tracking and alerts
- **LogRocket**: Session replay for security events
- **CloudFlare**: Edge-level protection

## Future Enhancements

### Planned Features

1. **Two-Factor Authentication (2FA)**:
   - TOTP support
   - SMS backup codes
   - Recovery codes

2. **Advanced Rate Limiting**:
   - Redis-based distributed rate limiting
   - Adaptive limits based on user behavior
   - Whitelist for trusted IPs

3. **Enhanced Session Security**:
   - Device management (trust/revoke devices)
   - Session timeout warnings
   - Concurrent session limits

4. **Account Protection**:
   - Account lockout after X failed attempts
   - Password history (prevent reuse)
   - Compromised password detection

5. **Security Notifications**:
   - Email alerts for suspicious activity
   - New device login notifications
   - Password change confirmations

## Testing Security Features

### Manual Testing

1. **Rate Limiting**:

   ```
   1. Attempt login 6 times with wrong password
   2. Verify error message shows minutes remaining
   3. Wait for countdown and verify retry enabled
   ```

2. **Password Strength**:

   ```
   1. Enter "password" → See weak indicator
   2. Enter "Password1!" → See medium indicator
   3. Enter "MySecureP@ssw0rd2024" → See strong indicator
   ```

3. **Email Validation**:
   ```
   1. Enter "invalid" → See error immediately
   2. Enter "test@" → See error after @
   3. Enter "test@example.com" → No error
   ```

### Automated Testing

```typescript
// Example test suite structure
describe("Security Features", () => {
  describe("Rate Limiting", () => {
    it("should block after 5 failed login attempts");
    it("should reset limit after successful login");
    it("should show countdown timer");
  });

  describe("Input Validation", () => {
    it("should reject invalid email formats");
    it("should detect weak passwords");
    it("should sanitize XSS attempts");
  });
});
```

## Support & Resources

- **Security Issues**: Report to security@litework.app (when available)
- **Documentation**: This file + `ARCHITECTURE.md`
- **Code Reference**: `src/lib/security.ts`
- **Examples**: `src/app/login/page.tsx`

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintainer**: LiteWork Security Team
