/**
 * Core Web Vitals Monitoring Service
 * Tracks performance metrics for ongoing optimization
 */
import React from "react";

// Type definitions for Web Vitals
interface WebVitalEntry {
  name: "FCP" | "LCP" | "CLS" | "TTFB" | "INP";
  value: number;
  delta: number;
  id: string;
}

interface NetworkConnection {
  effectiveType?: string;
  type?: string;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
  }

  interface Performance {
    memory?: PerformanceMemory;
  }
}

export interface WebVitalMetric {
  name: "FCP" | "LCP" | "CLS" | "TTFB" | "INP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
}

export interface PerformanceMetrics {
  webVitals: WebVitalMetric[];
  customMetrics: CustomMetric[];
  resourceTiming: ResourceTiming[];
  navigationTiming: NavigationTiming;
  memoryInfo?: MemoryInfo;
}

export interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, string | number | boolean>;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
}

export interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    webVitals: [],
    customMetrics: [],
    resourceTiming: [],
    navigationTiming: {
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      timeToInteractive: 0,
    },
  };

  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;

    this.setupWebVitalsTracking();
    this.setupNavigationTiming();
    this.setupResourceTiming();
    this.setupMemoryMonitoring();

    this.isInitialized = true;
  }

  private setupWebVitalsTracking() {
    // Import web-vitals dynamically for better performance
    import("web-vitals")
      .then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
        const reportMetric = (metric: WebVitalEntry) => {
          const webVital: WebVitalMetric = {
            name: metric.name,
            value: metric.value,
            rating: this.getRating(metric.name, metric.value),
            delta: metric.delta,
            id: metric.id,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connectionType: this.getConnectionType(),
          };

          this.metrics.webVitals.push(webVital);
          this.reportToAnalytics(webVital);
        };

        // Track Core Web Vitals (FID deprecated in favor of INP)
        onCLS(reportMetric);
        onFCP(reportMetric);
        onLCP(reportMetric);
        onTTFB(reportMetric);
        onINP(reportMetric);
      })
      .catch((error) => {
        console.warn("Web Vitals library not available:", error);
      });
  }

  private setupNavigationTiming() {
    if ("performance" in window && "getEntriesByType" in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.navigationTiming = {
              domContentLoaded:
                navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint(),
              timeToInteractive: this.calculateTTI(navEntry),
            };
          }
        }
      });

      observer.observe({ entryTypes: ["navigation"] });
      this.observers.push(observer);
    }
  }

  private setupResourceTiming() {
    if ("performance" in window && "getEntriesByType" in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource") {
            const resourceEntry = entry as PerformanceResourceTiming;

            this.metrics.resourceTiming.push({
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              type: this.getResourceType(resourceEntry.name),
              cached:
                resourceEntry.transferSize === 0 &&
                resourceEntry.decodedBodySize > 0,
            });
          }
        }
      });

      observer.observe({ entryTypes: ["resource"] });
      this.observers.push(observer);
    }
  }

  private setupMemoryMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      if ("memory" in performance && performance.memory) {
        const memory = performance.memory;
        this.metrics.memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    }, 30000);
  }

  private getRating(
    metricName: string,
    value: number
  ): "good" | "needs-improvement" | "poor" {
    const thresholds = {
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      TTFB: { good: 800, needsImprovement: 1800 },
      INP: { good: 200, needsImprovement: 500 },
    };

    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (!threshold) return "good";

    if (value <= threshold.good) return "good";
    if (value <= threshold.needsImprovement) return "needs-improvement";
    return "poor";
  }

  private getConnectionType(): string {
    if ("connection" in navigator && navigator.connection) {
      const connection = navigator.connection;
      return connection.effectiveType || connection.type || "unknown";
    }
    return "unknown";
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType("paint");
    const fpEntry = paintEntries.find((entry) => entry.name === "first-paint");
    return fpEntry ? fpEntry.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint"
    );
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private calculateTTI(navEntry: PerformanceNavigationTiming): number {
    // Simplified TTI calculation using domInteractive
    return navEntry.domInteractive;
  }

  private getResourceType(url: string): string {
    if (url.includes(".js")) return "script";
    if (url.includes(".css")) return "stylesheet";
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return "image";
    if (url.includes("/api/")) return "api";
    return "other";
  }

  private async reportToAnalytics(metric: WebVitalMetric) {
    try {
      // Send metrics to analytics endpoint
      await fetch("/api/analytics/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn("Failed to report web vital:", error);
    }
  }

  // Public methods for custom metrics
  public trackCustomMetric(
    name: string,
    value: number,
    context?: Record<string, string | number | boolean>
  ) {
    const metric: CustomMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.customMetrics.push(metric);

    // Report custom metric
    this.reportCustomMetric(metric);
  }

  private async reportCustomMetric(metric: CustomMetric) {
    try {
      await fetch("/api/analytics/custom-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn("Failed to report custom metric:", error);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getWebVitalsSummary() {
    const latestMetrics = this.metrics.webVitals.reduce(
      (acc, metric) => {
        acc[metric.name] = metric;
        return acc;
      },
      {} as Record<string, WebVitalMetric>
    );

    return Object.values(latestMetrics);
  }

  public getPerformanceScore(): number {
    const vitals = this.getWebVitalsSummary();
    if (vitals.length === 0) return 0;

    const scores: number[] = vitals.map((vital) => {
      switch (vital.rating) {
        case "good":
          return 100;
        case "needs-improvement":
          return 50;
        case "poor":
          return 0;
        default:
          return 0;
      }
    });

    return Math.round(
      scores.reduce((sum: number, score: number) => sum + score, 0) /
        scores.length
    );
  }

  public dispose() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for using performance data
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    };

    // Update immediately
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const trackCustomMetric = React.useCallback(
    (
      name: string,
      value: number,
      context?: Record<string, string | number | boolean>
    ) => {
      performanceMonitor.trackCustomMetric(name, value, context);
    },
    []
  );

  return { metrics, score, trackCustomMetric };
}

export default PerformanceMonitor;
