"use client";

// Sentry has been removed due to Next.js 16 incompatibility
// import * as Sentry from '@sentry/nextjs';

// Define specific property types for better type safety
export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;
export type MetadataProperties = Record<
  string,
  string | number | boolean | Date | null | undefined
>;
export type AnalyticsEventData = Record<string, unknown>;

// Analytics Event Types
export interface AnalyticsEvent {
  name: string;
  properties?: AnalyticsProperties;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percentage";
  metadata?: MetadataProperties;
}

export interface BusinessMetric {
  metric: string;
  value: number;
  athleteId?: string;
  coachId?: string;
  groupId?: string;
  workoutId?: string;
  metadata?: MetadataProperties;
}

// Event Categories
export enum EventCategory {
  USER_INTERACTION = "user_interaction",
  PERFORMANCE = "performance",
  BUSINESS = "business",
  SECURITY = "security",
  ERROR = "error",
  NAVIGATION = "navigation",
  FEATURE_USAGE = "feature_usage",
}

// Business Events
export enum BusinessEvent {
  WORKOUT_STARTED = "workout_started",
  WORKOUT_COMPLETED = "workout_completed",
  WORKOUT_ABANDONED = "workout_abandoned",
  PROGRESS_LOGGED = "progress_logged",
  GOAL_ACHIEVED = "goal_achieved",
  GROUP_CREATED = "group_created",
  ATHLETE_INVITED = "athlete_invited",
  COACH_ASSIGNMENT = "coach_assignment",
  BULK_OPERATION = "bulk_operation",
  ANALYTICS_VIEWED = "analytics_viewed",
}

class AnalyticsService {
  private userId?: string;
  private sessionId: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === "production";
  }

  // Initialize user session
  setUser(userId: string, userProperties?: AnalyticsProperties) {
    this.userId = userId;

    // Note: Sentry integration removed due to Next.js 16 incompatibility
    // Sentry.setUser would go here

    // Track user session start
    this.track({
      name: "session_started",
      properties: {
        category: EventCategory.USER_INTERACTION,
        ...userProperties,
      },
    });
  }

  // Clear user session
  clearUser() {
    if (this.userId) {
      this.track({
        name: "session_ended",
        properties: {
          category: EventCategory.USER_INTERACTION,
          sessionDuration: this.getSessionDuration(),
        },
      });
    }

    this.userId = undefined;
    // Note: Sentry integration removed due to Next.js 16 incompatibility
    // Sentry.setUser(null) would go here
  }

  // Track general analytics events
  track(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      userId: event.userId || this.userId,
      sessionId: event.sessionId || this.sessionId,
      timestamp: event.timestamp || new Date(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      viewport:
        typeof window !== "undefined"
          ? {
              width: window.innerWidth,
              height: window.innerHeight,
            }
          : undefined,
    };

    // Send to multiple analytics providers
    this.sendToProviders(enrichedEvent);

    // Log to console in development
    if (!this.isProduction) {
      console.log("[Analytics Event]:", enrichedEvent);
    }
  }

  // Track performance metrics
  trackPerformance(metric: PerformanceMetric) {
    const performanceEvent: AnalyticsEvent = {
      name: "performance_metric",
      properties: {
        category: EventCategory.PERFORMANCE,
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        ...metric.metadata,
      },
    };

    this.track(performanceEvent);

    // Note: Sentry metrics integration removed due to Next.js 16 incompatibility
    // Sentry.metrics.gauge would go here
  }

  // Track business-specific metrics
  trackBusiness(metric: BusinessMetric) {
    const businessEvent: AnalyticsEvent = {
      name: "business_metric",
      properties: {
        category: EventCategory.BUSINESS,
        metric: metric.metric,
        value: metric.value,
        athleteId: metric.athleteId,
        coachId: metric.coachId,
        groupId: metric.groupId,
        workoutId: metric.workoutId,
        ...metric.metadata,
      },
    };

    this.track(businessEvent);
  }

  // Specific business event tracking methods
  trackWorkoutStarted(
    workoutId: string,
    athleteId: string,
    metadata?: MetadataProperties
  ) {
    this.track({
      name: BusinessEvent.WORKOUT_STARTED,
      properties: {
        category: EventCategory.BUSINESS,
        workoutId,
        athleteId,
        ...metadata,
      },
    });
  }

  trackWorkoutCompleted(
    workoutId: string,
    athleteId: string,
    duration: number,
    metadata?: MetadataProperties
  ) {
    this.track({
      name: BusinessEvent.WORKOUT_COMPLETED,
      properties: {
        category: EventCategory.BUSINESS,
        workoutId,
        athleteId,
        duration,
        ...metadata,
      },
    });

    // Track as business metric
    this.trackBusiness({
      metric: "workout_completion_rate",
      value: 1,
      athleteId,
      workoutId,
      metadata: { duration, ...metadata },
    });
  }

  trackProgressLogged(
    athleteId: string,
    exerciseId: string,
    improvement: number,
    metadata?: MetadataProperties
  ) {
    this.track({
      name: BusinessEvent.PROGRESS_LOGGED,
      properties: {
        category: EventCategory.BUSINESS,
        athleteId,
        exerciseId,
        improvement,
        ...metadata,
      },
    });

    // Track performance improvement
    this.trackBusiness({
      metric: "progress_improvement",
      value: improvement,
      athleteId,
      metadata: { exerciseId, ...metadata },
    });
  }

  trackFeatureUsage(
    feature: string,
    action: string,
    metadata?: MetadataProperties
  ) {
    this.track({
      name: "feature_used",
      properties: {
        category: EventCategory.FEATURE_USAGE,
        feature,
        action,
        ...metadata,
      },
    });
  }

  trackNavigation(
    from: string,
    to: string,
    method: "click" | "programmatic" = "click"
  ) {
    this.track({
      name: "navigation",
      properties: {
        category: EventCategory.NAVIGATION,
        from,
        to,
        method,
      },
    });
  }

  trackError(error: Error, context?: AnalyticsProperties) {
    const errorEvent: AnalyticsEvent = {
      name: "client_error",
      properties: {
        category: EventCategory.ERROR,
        error: error.message,
        stack: error.stack,
        ...context,
      },
    };

    this.track(errorEvent);

    // Note: Sentry exception tracking removed due to Next.js 16 incompatibility
    // Sentry.captureException would go here
  }

  // Web Vitals tracking
  trackWebVitals() {
    if (typeof window !== "undefined" && "web-vitals" in window) {
      // This would integrate with web-vitals library
      // Implementation depends on how you want to measure Core Web Vitals
    }
  }

  // Page view tracking
  trackPageView(path: string, title?: string, metadata?: MetadataProperties) {
    this.track({
      name: "page_view",
      properties: {
        category: EventCategory.NAVIGATION,
        path,
        title: title || document?.title,
        referrer: document?.referrer,
        ...metadata,
      },
    });
  }

  // Conversion tracking
  trackConversion(goal: string, value?: number, metadata?: MetadataProperties) {
    this.track({
      name: "conversion",
      properties: {
        category: EventCategory.BUSINESS,
        goal,
        value,
        ...metadata,
      },
    });
  }

  // A/B test tracking
  trackExperiment(
    experiment: string,
    variant: string,
    metadata?: MetadataProperties
  ) {
    this.track({
      name: "experiment_exposure",
      properties: {
        category: EventCategory.FEATURE_USAGE,
        experiment,
        variant,
        ...metadata,
      },
    });
  }

  // Private helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionDuration(): number {
    const sessionStart = parseInt(this.sessionId.split("_")[1]);
    return Date.now() - sessionStart;
  }

  private async sendToProviders(event: AnalyticsEventData) {
    // Send to Vercel Analytics (if available)
    if (typeof window !== "undefined" && window.va) {
      window.va(
        "track",
        event.name as string,
        event.properties as AnalyticsProperties
      );
    }

    // Send to custom analytics endpoint
    try {
      if (this.isProduction) {
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      // Silently fail analytics - don't break user experience
      console.warn("Analytics tracking failed:", error);
    }

    // Send to Google Analytics (if configured)
    if (typeof window !== "undefined" && window.gtag && event.properties) {
      const props = event.properties as Record<
        string,
        string | number | boolean | undefined
      >;
      window.gtag("event", event.name as string, {
        event_category: props.category,
        event_label: props.label,
        value: props.value,
        custom_map: event.properties,
      });
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackBusiness: analytics.trackBusiness.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackNavigation: analytics.trackNavigation.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    setUser: analytics.setUser.bind(analytics),
    clearUser: analytics.clearUser.bind(analytics),
  };
}

// Extend window for external analytics libraries
declare global {
  interface Window {
    va?: (
      event: string,
      name: string,
      properties?: AnalyticsProperties
    ) => void;
    gtag?: (...args: unknown[]) => void;
  }
}
