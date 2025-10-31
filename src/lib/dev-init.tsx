/**
 * Development Environment Initialization
 * Sets up development-specific features and checks
 */

import { devUtils, devFeatures } from "@/lib/dev-config";
import { log } from "@/lib/dev-logger";

/**
 * Initialize development environment
 * Should be called early in the application lifecycle
 */
export function initializeDevelopmentEnvironment() {
  // Only run in development
  devUtils.onlyInDev(() => {
    // Check for React DevTools
    devUtils.checkReactDevTools();

    // Log development environment info
    if (devFeatures.enableConsoleLogging) {
      log.info("🔧 Development mode initialized");
      log.info("Feature flags:", devFeatures);
    }

    // Setup performance monitoring
    if (devFeatures.enablePerformanceLogging) {
      setupPerformanceMonitoring();
    }

    // Setup unhandled error logging
    setupErrorHandling();

    // Warn about browser compatibility
    checkBrowserCompatibility();
  });
}

/**
 * Setup performance monitoring for development
 */
function setupPerformanceMonitoring() {
  // Monitor long tasks
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            log.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      log.debug("Performance monitoring not available:", error);
    }
  }

  // Monitor largest contentful paint
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          log.perf("Largest Contentful Paint", entry.startTime);
        }
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (error) {
      log.debug("LCP monitoring not available:", error);
    }
  }
}

/**
 * Setup error handling for development
 */
function setupErrorHandling() {
  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    log.error("Unhandled promise rejection:", event.reason);
  });

  // Catch JavaScript errors
  window.addEventListener("error", (event) => {
    log.error("JavaScript error:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility() {
  const requiredFeatures = [
    "fetch",
    "Promise",
    "localStorage",
    "sessionStorage",
    "addEventListener",
  ];

  const missingFeatures = requiredFeatures.filter(
    (feature) => !(feature in window)
  );

  if (missingFeatures.length > 0) {
    log.warn("Missing browser features:", missingFeatures);
  }

  // Check for service worker support
  if (!("serviceWorker" in navigator)) {
    log.warn("Service Worker not supported - offline features disabled");
  }

  // Check for storage quota
  if ("storage" in navigator && "estimate" in navigator.storage) {
    navigator.storage.estimate().then((estimate) => {
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = (usage / quota) * 100;

      if (percentUsed > 80) {
        log.warn(`Storage quota ${percentUsed.toFixed(1)}% full`);
      } else {
        log.debug(
          `Storage: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB`
        );
      }
    });
  }
}

/**
 * Development-only component wrapper
 */
export function DevOnly({ children }: { children: React.ReactNode }) {
  if (devFeatures.enableConsoleLogging) {
    return <>{children}</>;
  }
  return null;
}

/**
 * Production-only component wrapper
 */
export function ProdOnly({ children }: { children: React.ReactNode }) {
  if (!devFeatures.enableConsoleLogging) {
    return <>{children}</>;
  }
  return null;
}

/**
 * Development utilities for debugging
 */
export const devDebug = {
  /**
   * Log component render information
   */
  logRender: (componentName: string, props?: Record<string, unknown>) => {
    devUtils.onlyInDev(() => {
      log.debug(`${componentName} rendered`, props);
    });
  },

  /**
   * Log state changes
   */
  logStateChange: (stateName: string, oldValue: unknown, newValue: unknown) => {
    devUtils.onlyInDev(() => {
      log.debug(`State change: ${stateName}`, { oldValue, newValue });
    });
  },

  /**
   * Measure and log hook performance
   */
  measureHook: function <T>(hookName: string, hookFn: () => T): T {
    return devUtils.measurePerformance(`Hook: ${hookName}`, hookFn);
  },

  /**
   * Add development-only data attributes for testing
   */
  dataTestId: (id: string) =>
    devFeatures.enableConsoleLogging ? { "data-testid": id } : {},
};

const devInitExport = {
  initializeDevelopmentEnvironment,
  DevOnly,
  ProdOnly,
  devDebug,
};

export default devInitExport;
