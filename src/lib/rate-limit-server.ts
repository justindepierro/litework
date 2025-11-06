/**
 * Server-Side Rate Limiting
 * IP-based rate limiting for API routes
 *
 * Usage:
 * ```typescript
 * import { checkRateLimit } from '@/lib/rate-limit-server';
 *
 * export async function POST(req: NextRequest) {
 *   const ip = req.headers.get('x-forwarded-for') || 'unknown';
 *
 *   if (!checkRateLimit(ip, 'login')) {
 *     return NextResponse.json(
 *       { error: 'Too many attempts. Please try again later.' },
 *       { status: 429 }
 *     );
 *   }
 *   // ... rest of endpoint
 * }
 * ```
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (replace with Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check if a request is rate limited
 * @param identifier - Usually IP address, but can be email or user ID
 * @param type - Type of rate limit (login, signup, etc.)
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType = "api"
): boolean {
  const key = `${type}:${identifier}`;
  const config = RATE_LIMITS[type];
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(key);

  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return true;
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.maxAttempts) {
    return false;
  }

  return true;
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string, type: RateLimitType): void {
  const key = `${type}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(
  identifier: string,
  type: RateLimitType
): {
  remaining: number;
  resetAt: number;
  limited: boolean;
} {
  const key = `${type}:${identifier}`;
  const config = RATE_LIMITS[type];
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    return {
      remaining: config.maxAttempts,
      resetAt: now + config.windowMs,
      limited: false,
    };
  }

  const remaining = Math.max(0, config.maxAttempts - entry.count);

  return {
    remaining,
    resetAt: entry.resetAt,
    limited: remaining === 0,
  };
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

// Auto-cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}

/**
 * Helper to get client IP from Next.js request
 */
export function getClientIP(headers: Headers): string {
  // Try various headers that might contain the IP
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback
  return "unknown";
}
