/**
 * Authentication Logging and Tracing System
 *
 * Provides comprehensive logging for auth operations with:
 * - Correlation IDs for tracing requests
 * - Timestamps for performance tracking
 * - Error categorization
 * - Debug mode for development
 */

// Generate unique correlation ID for tracing auth flows
export function generateCorrelationId(): string {
  return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp in ISO format
function getTimestamp(): string {
  return new Date().toISOString();
}

// Auth event types
export type AuthEventType =
  | "init"
  | "session_check"
  | "profile_fetch"
  | "sign_in"
  | "sign_up"
  | "sign_out"
  | "refresh"
  | "error"
  | "success"
  | "timeout"
  | "network"
  | "validation";

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Auth log entry
export interface AuthLogEntry {
  correlationId: string;
  timestamp: string;
  level: LogLevel;
  event: AuthEventType;
  message: string;
  data?: unknown;
  duration?: number;
}

// In-memory log store (last 100 entries)
const authLogs: AuthLogEntry[] = [];
const MAX_LOGS = 100;

// Debug mode (enabled in development)
const DEBUG_MODE = process.env.NODE_ENV === "development";

/**
 * Log an auth event
 */
export function logAuthEvent(
  correlationId: string,
  level: LogLevel,
  event: AuthEventType,
  message: string,
  data?: unknown,
  duration?: number
) {
  const entry: AuthLogEntry = {
    correlationId,
    timestamp: getTimestamp(),
    level,
    event,
    message,
    data,
    duration,
  };

  // Add to in-memory store
  authLogs.push(entry);
  if (authLogs.length > MAX_LOGS) {
    authLogs.shift();
  }

  // Console logging with color coding
  const prefix = `[AUTH:${event}:${correlationId.slice(-6)}]`;
  const durationStr = duration ? ` (${duration}ms)` : "";
  const fullMessage = `${prefix} ${message}${durationStr}`;

  switch (level) {
    case "debug":
      if (DEBUG_MODE) console.debug(fullMessage, data || "");
      break;
    case "info":
      console.log(fullMessage, data || "");
      break;
    case "warn":
      console.warn(fullMessage, data || "");
      break;
    case "error":
      console.error(fullMessage, data || "");
      break;
  }
}

/**
 * Get recent auth logs
 */
export function getAuthLogs(count: number = 20): AuthLogEntry[] {
  return authLogs.slice(-count);
}

/**
 * Clear auth logs
 */
export function clearAuthLogs() {
  authLogs.length = 0;
}

/**
 * Export logs for debugging
 */
export function exportAuthLogs(): string {
  return JSON.stringify(authLogs, null, 2);
}

/**
 * Performance timer helper
 */
export class AuthTimer {
  private startTime: number;
  private correlationId: string;
  private event: AuthEventType;

  constructor(correlationId: string, event: AuthEventType) {
    this.startTime = Date.now();
    this.correlationId = correlationId;
    this.event = event;
    logAuthEvent(correlationId, "debug", event, "Started", {
      startTime: this.startTime,
    });
  }

  end(message: string, data?: unknown) {
    const duration = Date.now() - this.startTime;
    logAuthEvent(
      this.correlationId,
      "info",
      this.event,
      message,
      data,
      duration
    );
    return duration;
  }

  error(message: string, error: unknown) {
    const duration = Date.now() - this.startTime;
    logAuthEvent(
      this.correlationId,
      "error",
      this.event,
      message,
      { error, duration },
      duration
    );
    return duration;
  }
}

/**
 * Error classification
 */
export function classifyAuthError(error: unknown): {
  type: "network" | "validation" | "timeout" | "permission" | "unknown";
  userMessage: string;
  technicalMessage: string;
} {
  const err = error as {
    message?: string;
    code?: string | number;
    status?: number;
  };
  const errorMessage = err?.message || String(error);
  const errorCode = err?.code || err?.status;

  // Network errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("ECONNREFUSED")
  ) {
    return {
      type: "network",
      userMessage:
        "Unable to connect to the server. Please check your internet connection.",
      technicalMessage: `Network error: ${errorMessage}`,
    };
  }

  // Timeout errors
  if (errorMessage.includes("timeout") || errorMessage.includes("aborted")) {
    return {
      type: "timeout",
      userMessage: "The request took too long. Please try again.",
      technicalMessage: `Timeout error: ${errorMessage}`,
    };
  }

  // Validation errors
  if (
    errorMessage.includes("Invalid") ||
    errorMessage.includes("required") ||
    errorCode === 400
  ) {
    return {
      type: "validation",
      userMessage: errorMessage,
      technicalMessage: `Validation error: ${errorMessage}`,
    };
  }

  // Permission errors
  if (
    errorMessage.includes("Unauthorized") ||
    errorMessage.includes("Forbidden") ||
    errorCode === 401 ||
    errorCode === 403
  ) {
    return {
      type: "permission",
      userMessage: "Invalid credentials or insufficient permissions.",
      technicalMessage: `Permission error: ${errorMessage}`,
    };
  }

  // Unknown errors
  return {
    type: "unknown",
    userMessage: "An unexpected error occurred. Please try again.",
    technicalMessage: `Unknown error: ${errorMessage}`,
  };
}

/**
 * Check if auth system is healthy
 */
export async function checkAuthHealth(): Promise<{
  healthy: boolean;
  checks: {
    supabaseConnection: boolean;
    cookiesEnabled: boolean;
    localStorageEnabled: boolean;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const checks = {
    supabaseConnection: false,
    cookiesEnabled: false,
    localStorageEnabled: false,
  };

  // Check if we're in browser
  if (typeof window === "undefined") {
    return {
      healthy: false,
      checks,
      errors: ["Not in browser environment"],
    };
  }

  // Check cookies
  try {
    document.cookie = "auth_test=1; path=/";
    checks.cookiesEnabled = document.cookie.includes("auth_test=1");
    document.cookie =
      "auth_test=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (!checks.cookiesEnabled) {
      errors.push("Cookies are disabled");
    }
  } catch {
    errors.push("Cookie access error");
  }

  // Check localStorage
  try {
    localStorage.setItem("auth_test", "1");
    checks.localStorageEnabled = localStorage.getItem("auth_test") === "1";
    localStorage.removeItem("auth_test");
    if (!checks.localStorageEnabled) {
      errors.push("localStorage is disabled");
    }
  } catch {
    errors.push("localStorage access error");
  }

  // Check Supabase connection (basic check)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (url) {
      const response = await fetch(`${url}/rest/v1/`, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      checks.supabaseConnection = response.status !== 0;
      if (!checks.supabaseConnection) {
        errors.push("Cannot reach Supabase server");
      }
    } else {
      errors.push("Supabase URL not configured");
    }
  } catch {
    errors.push("Supabase connection failed");
  }

  const healthy =
    checks.cookiesEnabled &&
    checks.localStorageEnabled &&
    checks.supabaseConnection;

  return { healthy, checks, errors };
}
