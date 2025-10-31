"use client";

import { useEffect } from "react";
import { performanceMonitor } from "@/lib/performance-monitor";

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export default function PerformanceProvider({
  children,
}: PerformanceProviderProps) {
  useEffect(() => {
    // Track app initialization
    performanceMonitor.trackCustomMetric("app_init", Date.now(), {
      page: "root",
    });

    // Listen for page visibility changes to track engagement
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      performanceMonitor.trackCustomMetric(
        isVisible ? "page_visible" : "page_hidden",
        Date.now(),
        { page: window.location.pathname }
      );
    };

    // Track unhandled errors as performance issues
    const handleError = (event: ErrorEvent) => {
      performanceMonitor.trackCustomMetric("js_error", 1, {
        message: event.message,
        filename: event.filename,
        line: event.lineno.toString(),
        page: window.location.pathname,
      });
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      performanceMonitor.trackCustomMetric("promise_rejection", 1, {
        reason: String(event.reason),
        page: window.location.pathname,
      });
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Track workout-specific metrics
    const trackWorkoutMetrics = () => {
      // Track if user is in a workout session
      if (window.location.pathname.includes("/workouts/live/")) {
        performanceMonitor.trackCustomMetric(
          "workout_session_start",
          Date.now(),
          {
            sessionType: "live",
          }
        );
      }
    };

    trackWorkoutMetrics();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      performanceMonitor.dispose();
    };
  }, []);

  return <>{children}</>;
}
