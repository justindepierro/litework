/**
 * Route Prefetching Utilities
 * Prefetch data and routes before navigation for instant page loads
 */

import { mutate } from "swr";

/**
 * Prefetch API data for a route
 */
export async function prefetchData(key: string): Promise<void> {
  try {
    // Trigger SWR to fetch and cache the data
    await mutate(key, fetch(key).then((res) => res.json()), {
      revalidate: false,
    });
  } catch (error) {
    // Silently fail - prefetch is best-effort
    console.debug(`Prefetch failed for ${key}:`, error);
  }
}

/**
 * Prefetch multiple API endpoints
 */
export async function prefetchMultiple(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => prefetchData(key)));
}

/**
 * Prefetch workout detail page
 */
export function prefetchWorkoutPage(workoutId: string) {
  return Promise.all([
    prefetchData(`/api/workouts/${workoutId}`),
    prefetchData(`/api/workouts/${workoutId}/exercises`),
  ]);
}

/**
 * Prefetch dashboard data
 */
export function prefetchDashboard() {
  return Promise.all([
    prefetchData("/api/analytics/dashboard-stats"),
    prefetchData("/api/analytics/today-schedule"),
    prefetchData("/api/assignments"),
    prefetchData("/api/notifications/inbox?limit=5"),
  ]);
}

/**
 * Prefetch workouts list
 */
export function prefetchWorkouts() {
  return prefetchData("/api/workouts");
}

/**
 * Prefetch athletes list
 */
export function prefetchAthletes() {
  return prefetchData("/api/athletes");
}

/**
 * Prefetch groups list
 */
export function prefetchGroups() {
  return prefetchData("/api/groups");
}

/**
 * Prefetch assignment detail
 */
export function prefetchAssignment(assignmentId: string) {
  return prefetchData(`/api/assignments/${assignmentId}`);
}

/**
 * Prefetch workout session
 */
export function prefetchSession(sessionId: string) {
  return Promise.all([
    prefetchData(`/api/sessions/${sessionId}`),
    prefetchData(`/api/sessions/${sessionId}/exercises`),
  ]);
}

/**
 * Component prefetch map
 * Maps route names to their lazy components
 */
export const COMPONENT_PREFETCH_MAP = {
  "workout-editor": () =>
    import("@/components/WorkoutEditor").catch(() => null),
  "block-library": () => import("@/components/BlockLibrary").catch(() => null),
  "group-assignment": () =>
    import("@/components/GroupAssignmentModal").catch(() => null),
  "workout-detail": () =>
    import("@/components/WorkoutAssignmentDetailModal").catch(() => null),
  "workout-live": () => import("@/components/WorkoutLive").catch(() => null),
  "workout-view": () => import("@/components/WorkoutView").catch(() => null),
  "exercise-library": () =>
    import("@/components/ExerciseLibraryPanel").catch(() => null),
  "progress-analytics": () =>
    import("@/components/ProgressAnalytics").catch(() => null),
};

/**
 * Prefetch component code
 */
export async function prefetchComponent(
  componentName: keyof typeof COMPONENT_PREFETCH_MAP
): Promise<void> {
  const importFn = COMPONENT_PREFETCH_MAP[componentName];
  if (importFn) {
    try {
      await importFn();
    } catch (error) {
      console.debug(`Component prefetch failed for ${componentName}:`, error);
    }
  }
}

/**
 * Hook to add prefetch on hover
 *
 * @example
 * const prefetchProps = usePrefetch('/api/workouts', 'workout-editor');
 * return <Link {...prefetchProps}>Edit Workout</Link>;
 */
export function usePrefetch(
  dataKey?: string | string[],
  componentName?: keyof typeof COMPONENT_PREFETCH_MAP
) {
  const handlePrefetch = () => {
    if (dataKey) {
      if (Array.isArray(dataKey)) {
        prefetchMultiple(dataKey);
      } else {
        prefetchData(dataKey);
      }
    }
    if (componentName) {
      prefetchComponent(componentName);
    }
  };

  return {
    onMouseEnter: handlePrefetch,
    onFocus: handlePrefetch,
  };
}

/**
 * Prefetch on route patterns
 * Automatically prefetch data based on current route
 */
export function setupRoutePrefetch() {
  if (typeof window === "undefined") return;

  // Prefetch dashboard data when user is on any page
  // (dashboard is frequently visited)
  const prefetchDashboardDelayed = () => {
    setTimeout(() => {
      prefetchDashboard();
    }, 2000); // Wait 2s after page load
  };

  // Run after initial page load
  if (document.readyState === "complete") {
    prefetchDashboardDelayed();
  } else {
    window.addEventListener("load", prefetchDashboardDelayed);
  }

  // Prefetch on navigation hover
  document.addEventListener("mouseover", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a[href]") as HTMLAnchorElement;

    if (!link || !link.href) return;

    const url = new URL(link.href);

    // Only prefetch same-origin links
    if (url.origin !== window.location.origin) return;

    const path = url.pathname;

    // Prefetch based on route patterns
    if (path.startsWith("/workouts")) {
      prefetchWorkouts();
      prefetchComponent("workout-editor");
    } else if (path.startsWith("/athletes")) {
      prefetchAthletes();
    } else if (path.startsWith("/groups")) {
      prefetchGroups();
    } else if (path.startsWith("/dashboard")) {
      prefetchDashboard();
    } else if (path.startsWith("/progress")) {
      prefetchComponent("progress-analytics");
    }
  });
}

/**
 * Prefetch for next likely navigation
 * Uses heuristics to predict where user will go next
 */
export function prefetchNextLikely(currentRoute: string) {
  // If on dashboard, likely to go to workouts
  if (currentRoute === "/dashboard") {
    prefetchWorkouts();
  }
  // If on workouts list, likely to create or edit
  else if (currentRoute === "/workouts") {
    prefetchComponent("workout-editor");
  }
  // If on athletes, likely to view groups
  else if (currentRoute === "/athletes") {
    prefetchGroups();
  }
  // If on workout detail, likely to start session
  else if (currentRoute.includes("/workouts/view/")) {
    prefetchComponent("workout-live");
  }
}

/**
 * Smart prefetch based on user behavior
 * Tracks user navigation patterns and prefetches accordingly
 */
class SmartPrefetch {
  private navigationHistory: string[] = [];
  private commonPatterns: Map<string, string[]> = new Map();

  recordNavigation(route: string) {
    this.navigationHistory.push(route);

    // Keep only last 10 navigations
    if (this.navigationHistory.length > 10) {
      this.navigationHistory.shift();
    }

    // Update patterns
    if (this.navigationHistory.length >= 2) {
      const previous = this.navigationHistory[this.navigationHistory.length - 2];
      const patterns = this.commonPatterns.get(previous) || [];
      patterns.push(route);
      this.commonPatterns.set(previous, patterns);
    }
  }

  predictNext(currentRoute: string): string[] {
    const patterns = this.commonPatterns.get(currentRoute) || [];

    // Find most common next routes
    const frequency = new Map<string, number>();
    patterns.forEach((route) => {
      frequency.set(route, (frequency.get(route) || 0) + 1);
    });

    // Return top 3 most common next routes
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([route]) => route);
  }

  autoPrefetch(currentRoute: string) {
    const predictions = this.predictNext(currentRoute);

    predictions.forEach((route) => {
      // Map route to prefetch function
      if (route.startsWith("/workouts")) {
        prefetchWorkouts();
      } else if (route.startsWith("/dashboard")) {
        prefetchDashboard();
      } else if (route.startsWith("/athletes")) {
        prefetchAthletes();
      }
    });
  }
}

// Export singleton instance
export const smartPrefetch = new SmartPrefetch();

/**
 * Initialize prefetch system
 * Call this once in app layout or root component
 */
export function initializePrefetch() {
  if (typeof window === "undefined") return;

  // Setup route-based prefetching
  setupRoutePrefetch();

  // Track navigation for smart prefetch
  const handleRouteChange = () => {
    const currentRoute = window.location.pathname;
    smartPrefetch.recordNavigation(currentRoute);
    smartPrefetch.autoPrefetch(currentRoute);
  };

  // Listen to navigation events
  window.addEventListener("popstate", handleRouteChange);

  // Initial call
  handleRouteChange();

  return () => {
    window.removeEventListener("popstate", handleRouteChange);
  };
}
