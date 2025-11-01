/**
 * Security utilities for authentication and API protection
 * Implements rate limiting, input validation, and security best practices
 */

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  api: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
};

/**
 * Check if an IP/identifier has exceeded rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remainingAttempts: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // Clean expired entries periodically
  if (Math.random() < 0.01) {
    cleanExpiredRateLimits();
  }

  if (!entry || now > entry.resetAt) {
    // First attempt or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxAttempts) {
    // Rate limit exceeded
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment attempt count
  entry.count++;
  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit for specific action
 */
export function getRateLimit(action: keyof typeof RATE_LIMITS) {
  return RATE_LIMITS[action];
}

/**
 * Clean expired rate limit entries
 */
function cleanExpiredRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string) {
  rateLimitStore.delete(identifier);
}

// ===========================
// INPUT VALIDATION
// ===========================

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    return { valid: false, error: "Email is required" };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: "Email is too long" };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { 
  valid: boolean; 
  error?: string;
  strength: "weak" | "medium" | "strong";
} {
  if (!password) {
    return { valid: false, error: "Password is required", strength: "weak" };
  }

  if (password.length < 8) {
    return { 
      valid: false, 
      error: "Password must be at least 8 characters", 
      strength: "weak" 
    };
  }

  if (password.length > 128) {
    return { 
      valid: false, 
      error: "Password is too long", 
      strength: "weak" 
    };
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password", "12345678", "qwerty", "abc123", "letmein", 
    "welcome", "monkey", "password1", "123456789"
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { 
      valid: false, 
      error: "This password is too common", 
      strength: "weak" 
    };
  }

  // Calculate strength
  let strength: "weak" | "medium" | "strong" = "weak";
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (password.length >= 12 && criteriaCount >= 3) {
    strength = "strong";
  } else if (password.length >= 10 && criteriaCount >= 2) {
    strength = "medium";
  } else if (criteriaCount < 2) {
    return {
      valid: false,
      error: "Password must contain at least lowercase, uppercase, and numbers",
      strength: "weak"
    };
  }

  return { valid: true, strength };
}

/**
 * Validate name input (first/last name)
 */
export function validateName(name: string, fieldName: string = "Name"): { 
  valid: boolean; 
  error?: string 
} {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} is too long` };
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { 
      valid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }

  return { valid: true };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
}

// ===========================
// SESSION SECURITY
// ===========================

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a value using subtle crypto (for client-side fingerprinting)
 */
export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get client fingerprint (browser/device identification)
 */
export function getClientFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];
  
  return btoa(components.join('|'));
}

/**
 * Detect suspicious activity patterns
 */
export function detectSuspiciousActivity(params: {
  rapidRequests?: boolean;
  unusualLocation?: boolean;
  newDevice?: boolean;
  failedAttempts?: number;
}): { suspicious: boolean; reason?: string } {
  const { rapidRequests, unusualLocation, newDevice, failedAttempts = 0 } = params;

  if (failedAttempts >= 3) {
    return { suspicious: true, reason: "Multiple failed authentication attempts" };
  }

  if (rapidRequests) {
    return { suspicious: true, reason: "Unusual request pattern detected" };
  }

  if (unusualLocation && newDevice) {
    return { suspicious: true, reason: "Login from new location and device" };
  }

  return { suspicious: false };
}

// ===========================
// SECURITY HEADERS
// ===========================

/**
 * Get security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent XSS attacks
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // CSP (Content Security Policy)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
    ].join(', '),
  };
}

// ===========================
// AUDIT LOGGING
// ===========================

export interface AuditLog {
  timestamp: Date;
  action: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
}

/**
 * Log security-related events (in production, send to logging service)
 */
export function logSecurityEvent(log: AuditLog) {
  // In development, just console log
  if (process.env.NODE_ENV === 'development') {
    console.log('[SECURITY]', {
      timestamp: log.timestamp.toISOString(),
      action: log.action,
      success: log.success,
      userId: log.userId,
      details: log.details,
    });
  }
  
  // In production, send to logging service (Sentry, LogRocket, etc.)
  // Example: sendToLoggingService(log);
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  action: string,
  success: boolean,
  details?: Record<string, any>
): AuditLog {
  return {
    timestamp: new Date(),
    action,
    success,
    details,
  };
}
