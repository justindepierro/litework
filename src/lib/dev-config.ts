/**
 * Development Environment Configuration
 * Controls development-specific features and logging
 */

// Environment checks
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

// Feature flags for development
export const devFeatures = {
  // Enable/disable development logging
  enableConsoleLogging: isDevelopment,

  // Enable React DevTools suggestions
  showReactDevToolsMessage: isDevelopment,

  // Enable detailed error boundaries
  showDetailedErrors: isDevelopment,

  // Enable performance monitoring in dev
  enablePerformanceLogging: isDevelopment,

  // Enable API request logging
  enableApiLogging: isDevelopment,

  // Enable service worker logging
  enableServiceWorkerLogging: isDevelopment,

  // Enable PWA install prompts in dev
  enablePWAPrompts: isDevelopment,

  // Enable hot reload messages
  enableHMRLogging: isDevelopment,
};

// Development utilities
export const devUtils = {
  /**
   * Conditionally execute code only in development
   */
  onlyInDev: (callback: () => void) => {
    if (isDevelopment) {
      callback();
    }
  },

  /**
   * Conditionally execute code only in production
   */
  onlyInProd: (callback: () => void) => {
    if (isProduction) {
      callback();
    }
  },

  /**
   * Get environment-specific configuration
   */
  getConfig: <T>(devConfig: T, prodConfig: T): T => {
    return isDevelopment ? devConfig : prodConfig;
  },

  /**
   * Performance measurement wrapper
   */
  measurePerformance: <T>(label: string, fn: () => T): T => {
    if (devFeatures.enablePerformanceLogging) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  /**
   * React DevTools installation helper
   */
  checkReactDevTools: () => {
    if (devFeatures.showReactDevToolsMessage && typeof window !== "undefined") {
      const hasReactDevTools = !!(
        window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }
      ).__REACT_DEVTOOLS_GLOBAL_HOOK__;

      if (!hasReactDevTools) {
        console.info(
          "🔧 Install React DevTools for a better development experience:\n" +
            "https://react.dev/link/react-devtools"
        );
      }
    }
  },
};

// Environment-specific API configuration
export const apiConfig = {
  baseUrl: devUtils.getConfig(
    "http://localhost:3000/api",
    process.env.NEXT_PUBLIC_API_URL || "/api"
  ),

  timeout: devUtils.getConfig(30000, 10000), // 30s dev, 10s prod

  retryAttempts: devUtils.getConfig(3, 1),

  enableLogging: devFeatures.enableApiLogging,
};

// Service Worker configuration
export const swConfig = {
  enableLogging: devFeatures.enableServiceWorkerLogging,

  enableDebugMode: isDevelopment,

  cachingStrategy: devUtils.getConfig(
    "networkFirst", // Dev: always get fresh data
    "cacheFirst" // Prod: prioritize performance
  ),
};

// PWA configuration
export const pwaConfig = {
  enableInstallPrompts: devFeatures.enablePWAPrompts,

  enableBackgroundSync: true,

  enableNotifications: !isDevelopment, // Disable notifications in dev

  enableOfflineMode: true,
};

const devConfigExport = {
  isDevelopment,
  isProduction,
  isTest,
  devFeatures,
  devUtils,
  apiConfig,
  swConfig,
  pwaConfig,
};

export default devConfigExport;
