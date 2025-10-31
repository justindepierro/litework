/**
 * Development Logging Utility
 * Centralized logging with environment-based controls
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class DevLogger {
  private isDev: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDev = process.env.NODE_ENV === "development";
    this.logLevel = this.isDev ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  /**
   * Log an error (always shown)
   */
  error(message: string, ...args: unknown[]) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`🚨 [ERROR] ${message}`, ...args);
    }
  }

  /**
   * Log a warning (dev + production)
   */
  warn(message: string, ...args: unknown[]) {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  /**
   * Log general information (dev only by default)
   */
  info(message: string, ...args: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(`ℹ️ [INFO] ${message}`, ...args);
    }
  }

  /**
   * Log debug information (dev only)
   */
  debug(message: string, ...args: unknown[]) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log API requests (dev only)
   */
  api(endpoint: string, method: string = "GET", data?: unknown) {
    if (this.isDev) {
      const hasData = data
        ? ` with data: ${JSON.stringify(data, null, 2)}`
        : "";
      console.log(`🔗 [API] ${method} ${endpoint}${hasData}`);
    }
  }

  /**
   * Log performance metrics (dev only)
   */
  perf(label: string, duration: number) {
    if (this.isDev) {
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Log auth events (dev only, secure)
   */
  auth(event: string, userId?: string) {
    if (this.isDev) {
      const userInfo = userId ? ` for user ${userId.slice(0, 8)}...` : "";
      console.log(`[AUTH] ${event}${userInfo}`);
    }
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void) {
    if (this.isDev) {
      console.group(`📁 ${label}`);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  /**
   * Time a function execution
   */
  time<T>(label: string, fn: () => T): T {
    if (this.isDev) {
      console.time(`[TIMER] ${label}`);
      const result = fn();
      console.timeEnd(`[TIMER] ${label}`);
      return result;
    }
    return fn();
  }

  /**
   * Conditionally log only in development
   */
  dev(message: string, ...args: unknown[]) {
    if (this.isDev) {
      console.log(`🔧 [DEV] ${message}`, ...args);
    }
  }
}

// Create singleton instance
export const logger = new DevLogger();

// Convenience methods for quick access
export const log = {
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  api: logger.api.bind(logger),
  perf: logger.perf.bind(logger),
  auth: logger.auth.bind(logger),
  group: logger.group.bind(logger),
  time: logger.time.bind(logger),
  dev: logger.dev.bind(logger),
};

export default logger;
