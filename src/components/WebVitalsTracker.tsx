"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";

/**
 * Web Vitals tracking component
 * Sends Core Web Vitals to analytics endpoint
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Only track in production
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const sendToAnalytics = (metric: Metric) => {
      // Send to our analytics endpoint
      fetch("/api/analytics/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
          // Additional context
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          // Network info if available
          effectiveType:
            (
              navigator as Navigator & {
                connection?: { effectiveType?: string };
              }
            ).connection?.effectiveType || "unknown",
        }),
      }).catch((error) => {
        // Silently fail - don't break the app for analytics
        console.debug("Failed to send web vitals:", error);
      });

      // Also send to Vercel Analytics if available
      if (typeof window !== "undefined") {
        const analyticsWindow = window as Window & {
          va?: (event: string, properties?: Record<string, unknown>) => void;
        };
        if (analyticsWindow.va) {
          analyticsWindow.va("Web Vital", {
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
          });
        }
      }
    };

    // Track all Core Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);
  }, []);

  return null; // This is a tracking component, no UI
}

/**
 * Custom hook to track Web Vitals
 * Use this in any component that needs vitals tracking
 */
export function useWebVitals(onMetric?: (metric: Metric) => void) {
  useEffect(() => {
    if (!onMetric) return;

    onCLS(onMetric);
    onFCP(onMetric);
    onLCP(onMetric);
    onTTFB(onMetric);
    onINP(onMetric);
  }, [onMetric]);
}
