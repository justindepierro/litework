'use client';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  context?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  url?: string;
  userAgent?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableSentry: boolean;
  bufferSize: number;
  flushInterval: number;
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private userId?: string;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      enableSentry: true,
      bufferSize: 100,
      flushInterval: 5000,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  setContext(context: string) {
    // Set logging context for all subsequent logs
    this.config = { ...this.config, context };
  }

  error(message: string, metadata?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  // Specific logging methods for different categories
  security(event: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.WARN, `[SECURITY] ${event}`, {
      category: 'security',
      ...metadata
    });
  }

  performance(metric: string, value: number, unit: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, `[PERFORMANCE] ${metric}: ${value}${unit}`, {
      category: 'performance',
      metric,
      value,
      unit,
      ...metadata
    });
  }

  business(event: string, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, `[BUSINESS] ${event}`, {
      category: 'business',
      ...metadata
    });
  }

  api(method: string, endpoint: string, status: number, duration: number, metadata?: Record<string, unknown>) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `[API] ${method} ${endpoint} - ${status} (${duration}ms)`, {
      category: 'api',
      method,
      endpoint,
      status,
      duration,
      ...metadata
    });
  }

  database(query: string, duration: number, error?: Error, metadata?: Record<string, unknown>) {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
    const message = error 
      ? `[DATABASE] Query failed: ${query} (${duration}ms) - ${error.message}`
      : `[DATABASE] Query executed: ${query} (${duration}ms)`;
    
    this.log(level, message, {
      category: 'database',
      query,
      duration,
      error: error?.message,
      ...metadata
    }, error);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error) {
    // Check if this log level should be processed
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata,
      stack: error?.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    if (this.config.enableSentry && level === LogLevel.ERROR && error) {
      this.logToSentry(error, logEntry);
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex <= currentLevelIndex;
  }

  private logToConsole(entry: LogEntry) {
    const { level, message, metadata, timestamp } = entry;
    const timeString = new Date(timestamp).toLocaleTimeString();
    
    const consoleMessage = `[${timeString}] ${message}`;
    const consoleData = metadata ? [consoleMessage, metadata] : [consoleMessage];

    switch (level) {
      case LogLevel.ERROR:
        console.error(...consoleData);
        break;
      case LogLevel.WARN:
        console.warn(...consoleData);
        break;
      case LogLevel.INFO:
        console.info(...consoleData);
        break;
      case LogLevel.DEBUG:
        console.debug(...consoleData);
        break;
    }
  }

  private logToSentry(error: Error, entry: LogEntry) {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setLevel(entry.level as 'error' | 'warning' | 'info' | 'debug');
        scope.setUser({ id: this.userId });
        scope.setTag('sessionId', this.sessionId);
        
        if (entry.metadata) {
          Object.entries(entry.metadata).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        
        window.Sentry.captureException(error);
      });
    }
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      await this.sendLogsToRemote(logsToSend);
    } catch (error) {
      // If sending fails, add logs back to buffer for retry
      this.buffer.unshift(...logsToSend);
      console.warn('Failed to send logs to remote server:', error);
    }
  }

  private async sendLogsToRemote(logs: LogEntry[]) {
    if (typeof window === 'undefined') return;

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs }),
        signal: AbortSignal.timeout(10000)
      });
    } catch (error) {
      throw new Error(`Remote logging failed: ${error}`);
    }
  }

  private generateSessionId(): string {
    return `log_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush remaining logs
    if (this.buffer.length > 0) {
      this.flush();
    }
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Extend window for Sentry
declare global {
  interface Window {
    Sentry?: {
      withScope: (callback: (scope: {
        setLevel: (level: string) => void;
        setUser: (user: { id?: string }) => void;
        setTag: (key: string, value: string) => void;
        setExtra: (key: string, value: unknown) => void;
      }) => void) => void;
      captureException: (error: Error) => void;
    };
  }
}

// React hook for logging
export function useLogger() {
  return {
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    security: logger.security.bind(logger),
    performance: logger.performance.bind(logger),
    business: logger.business.bind(logger),
    api: logger.api.bind(logger),
    database: logger.database.bind(logger),
    setUser: logger.setUser.bind(logger),
    setContext: logger.setContext.bind(logger)
  };
}