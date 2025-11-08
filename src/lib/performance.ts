/**
 * Performance Measurement Utilities
 *
 * Track and measure user interactions for performance optimization
 */

/**
 * Measure the duration of an interaction
 *
 * @param name - Name of the interaction (e.g., "workout-save", "page-load")
 * @returns Function to call when interaction completes
 *
 * @example
 * const endMeasure = measureInteraction('workout-save');
 * await saveWorkout(data);
 * endMeasure();
 */
export function measureInteraction(name: string) {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    const roundedDuration = Math.round(duration);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      const label =
        duration < 100 ? "[FAST]" : duration < 500 ? "[OK]" : "[SLOW]";
      // [REMOVED] console.log(`${label} ${name}: ${roundedDuration}ms`);
    }

    // Send to Vercel Analytics in production
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      // Send custom metric
      if ("sendBeacon" in navigator) {
        const data = JSON.stringify({
          name,
          value: roundedDuration,
          category: "Performance",
          timestamp: Date.now(),
        });

        navigator.sendBeacon("/api/analytics/performance", data);
      }
    }

    return roundedDuration;
  };
}

/**
 * Measure async function execution time
 *
 * @example
 * const workouts = await measureAsync('fetch-workouts', async () => {
 *   return await fetch('/api/workouts');
 * });
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const endMeasure = measureInteraction(name);
  try {
    const result = await fn();
    endMeasure();
    return result;
  } catch (error) {
    endMeasure();
    throw error;
  }
}

/**
 * Measure Core Web Vitals and report to analytics
 * This is already implemented in WebVitalsTracker.tsx but here's a standalone version
 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // Use web-vitals library if available
  import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
    onINP(console.log);
  });
}

/**
 * Performance marks for measuring page lifecycle
 */
export const PerformanceMarks = {
  /**
   * Mark the start of data fetching
   */
  markFetchStart: (resource: string) => {
    if ("performance" in window && "mark" in window.performance) {
      performance.mark(`fetch-${resource}-start`);
    }
  },

  /**
   * Mark the end of data fetching and measure duration
   */
  markFetchEnd: (resource: string) => {
    if ("performance" in window && "mark" in window.performance) {
      performance.mark(`fetch-${resource}-end`);

      try {
        performance.measure(
          `fetch-${resource}`,
          `fetch-${resource}-start`,
          `fetch-${resource}-end`
        );

        const measure = performance.getEntriesByName(`fetch-${resource}`)[0];
        if (measure && process.env.NODE_ENV === "development") {
          // [REMOVED] console.log(`[FETCH] ${resource}: ${Math.round(measure.duration)}ms`);
        }
      } catch {
        // Mark doesn't exist, ignore
      }
    }
  },

  /**
   * Mark when a component mounts
   */
  markComponentMount: (componentName: string) => {
    if ("performance" in window && "mark" in window.performance) {
      performance.mark(`component-${componentName}-mount`);
    }
  },

  /**
   * Mark when a component renders
   */
  markComponentRender: (componentName: string) => {
    if ("performance" in window && "mark" in window.performance) {
      performance.mark(`component-${componentName}-render`);
    }
  },
};

/**
 * Log navigation timing (how long it took to load the page)
 */
export function logNavigationTiming() {
  if (typeof window === "undefined") return;

  // Wait for page to fully load
  if (document.readyState !== "complete") {
    window.addEventListener("load", logNavigationTiming, { once: true });
    return;
  }

  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  if (!navigation) return;

  const metrics = {
    "DNS Lookup": navigation.domainLookupEnd - navigation.domainLookupStart,
    "TCP Connection": navigation.connectEnd - navigation.connectStart,
    Request: navigation.responseStart - navigation.requestStart,
    Response: navigation.responseEnd - navigation.responseStart,
    "DOM Processing":
      navigation.domContentLoadedEventEnd - navigation.responseEnd,
    "Load Complete": navigation.loadEventEnd - navigation.loadEventStart,
    "Total Time": navigation.loadEventEnd - navigation.fetchStart,
  };

  if (process.env.NODE_ENV === "development") {
    console.table(metrics);
  }

  return metrics;
}

/**
 * Measure render count (detect unnecessary re-renders)
 *
 * @example
 * function MyComponent() {
 *   useRenderCount('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      renderCount.current += 1;
      console.log(
        `[RENDER] ${componentName} rendered ${renderCount.current} times`
      );
    }
  });
}

// Import React for useRenderCount hook
import React from "react";
