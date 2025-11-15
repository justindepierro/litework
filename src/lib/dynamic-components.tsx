/**
 * Dynamic Component Loader
 * Lazy load heavy components to reduce initial bundle size
 */

import dynamic from "next/dynamic";
import React from "react";
import { ModalBackdrop } from "@/components/ui/Modal";

/**
 * Loading fallback for modals (centered spinner)
 */
const ModalLoadingFallback = () => (
  <ModalBackdrop isOpen={true} onClose={() => {}}>
    <div className="bg-white rounded-lg p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p className="mt-4 text-sm text-(--text-secondary)">Loading...</p>
    </div>
  </ModalBackdrop>
);

/**
 * Loading fallback for panels (inline spinner)
 */
const PanelLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

// ============================================================================
// HEAVY MODAL COMPONENTS
// ============================================================================
/**
 * WorkoutEditor - 2221 lines, heavy modal
 * Used when: Creating/editing workouts
 */
export const WorkoutEditor = dynamic(
  () => import("@/components/WorkoutEditor"),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
);

/**
 * BlockLibrary - Block selection modal
 */
export const BlockLibrary = dynamic(() => import("@/components/BlockLibrary"), {
  loading: ModalLoadingFallback,
  ssr: false,
});

/**
 * BlockEditor - Block creation/editing
 */
export const BlockEditor = dynamic(() => import("@/components/BlockEditor"), {
  loading: ModalLoadingFallback,
  ssr: false,
});

/**
 * GroupAssignmentModal - Bulk workout assignment
 */
export const GroupAssignmentModal = dynamic(
  () => import("@/components/GroupAssignmentModal"),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
);

/**
 * WorkoutAssignmentDetailModal - Assignment details
 */
export const WorkoutAssignmentDetailModal = dynamic(
  () => import("@/components/WorkoutAssignmentDetailModal"),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
);

/**
 * ManageGroupMembersModal - Group member management
 */
export const ManageGroupMembersModal = dynamic(
  () => import("@/components/ManageGroupMembersModal"),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
);

/**
 * GroupFormModal - Create/edit groups
 */
export const GroupFormModal = dynamic(
  () => import("@/components/GroupFormModal"),
  {
    loading: ModalLoadingFallback,
    ssr: false,
  }
);

// ============================================================================
// HEAVY PANEL COMPONENTS
// ============================================================================

/**
 * ExerciseLibraryPanel - Exercise browser
 */
export const ExerciseLibraryPanel = dynamic(
  () => import("@/components/ExerciseLibraryPanel"),
  {
    loading: PanelLoadingFallback,
    ssr: false,
  }
);

/**
 * ProgressAnalytics - Charts and data visualization
 */
export const ProgressAnalytics = dynamic(
  () => import("@/components/ProgressAnalytics"),
  {
    loading: PanelLoadingFallback,
    ssr: false,
  }
);

/**
 * NotificationPreferences - Settings panel
 */
export const NotificationPreferences = dynamic(
  () => import("@/components/NotificationPreferences"),
  {
    loading: PanelLoadingFallback,
    ssr: false,
  }
);

// ============================================================================
// WORKOUT SESSION COMPONENTS
// ============================================================================

/**
 * WorkoutLive - Live workout session (heavy interactive component)
 */
export const WorkoutLive = dynamic(() => import("@/components/WorkoutLive"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-lg font-semibold">Starting Workout...</p>
      </div>
    </div>
  ),
  ssr: false,
});

/**
 * WorkoutView - Workout preview/review
 */
export const WorkoutView = dynamic(() => import("@/components/WorkoutView"), {
  loading: PanelLoadingFallback,
  ssr: false,
});

// ============================================================================
// CHART COMPONENTS (from recharts)
// ============================================================================

/**
 * Note: Add PerformanceCharts component when needed
 * Charts - Heavy data visualization library
 * Lazy load to reduce initial bundle
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Preload a component before it's needed
 * Use on route change or user interaction (hover, focus)
 *
 * @example
 * <button
 *   onMouseEnter={() => preloadComponent(WorkoutEditor)}
 *   onClick={openEditor}
 * >
 *   Edit Workout
 * </button>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function preloadComponent(component: any): void {
  if (component && typeof component.preload === "function") {
    component.preload();
  }
}

/**
 * Create a lazy-loaded component with custom loading state
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  loadingComponent?: () => React.ReactElement,
  options?: { ssr?: boolean }
) {
  return dynamic(importFn, {
    loading: loadingComponent || PanelLoadingFallback,
    ssr: options?.ssr ?? false,
  });
}
