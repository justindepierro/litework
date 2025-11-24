/**
 * Performance Optimization - Dynamic Imports
 * Lazy load heavy components to reduce initial bundle size
 */

import dynamic from "next/dynamic";

// Heavy workout editor - only load when needed
export const WorkoutEditor = dynamic(
  () => import("@/components/WorkoutEditor"),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    ),
    ssr: false, // Client-side only for better performance
  }
);

// Heavy chart components - load when needed
export const VolumeChart = dynamic(
  () =>
    import("@/components/charts/VolumeChart").then((mod) => mod.VolumeChart),
  {
    loading: () => (
      <div className="h-64 bg-silver-100 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);

export const OneRMProgressChart = dynamic(
  () =>
    import("@/components/charts/OneRMProgressChart").then(
      (mod) => mod.OneRMProgressChart
    ),
  {
    loading: () => (
      <div className="h-64 bg-silver-100 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);

export const CalendarHeatmap = dynamic(
  () =>
    import("@/components/charts/CalendarHeatmap").then(
      (mod) => mod.CalendarHeatmap
    ),
  {
    loading: () => (
      <div className="h-64 bg-silver-100 animate-pulse rounded-lg" />
    ),
    ssr: false,
  }
);

// Photo upload modal - only load when user clicks upload
export const PhotoUploadModal = dynamic(
  () =>
    import("@/components/modals/PhotoUploadModal").then(
      (mod) => mod.PhotoUploadModal
    ),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Social feed components - load on-demand
export const WorkoutFeed = dynamic(
  () =>
    import("@/components/social/WorkoutFeed").then((mod) => mod.WorkoutFeed),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-silver-200 p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-silver-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-silver-200 rounded w-1/3" />
                <div className="h-3 bg-silver-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
);

export const Leaderboard = dynamic(
  () =>
    import("@/components/social/Leaderboard").then((mod) => mod.Leaderboard),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-silver-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-silver-200 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-silver-200 rounded" />
                <div className="w-10 h-10 bg-silver-200 rounded-full" />
                <div className="flex-1 h-4 bg-silver-200 rounded" />
                <div className="w-16 h-4 bg-silver-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Progress photos - load when viewing progress page
export const ProgressPhotos = dynamic(
  () =>
    import("@/components/progress/ProgressPhotos").then(
      (mod) => mod.ProgressPhotos
    ),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-silver-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-3/4 bg-silver-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const BeforeAfterSlider = dynamic(
  () =>
    import("@/components/progress/BeforeAfterSlider").then(
      (mod) => mod.BeforeAfterSlider
    ),
  {
    loading: () => (
      <div className="aspect-3/4 bg-silver-200 rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

// Goal components - load on progress page
export const GoalsWidget = dynamic(
  () => import("@/components/goals/GoalsWidget").then((mod) => mod.GoalsWidget),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-silver-200 p-6">
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-silver-200 rounded w-1/2" />
              <div className="h-8 bg-silver-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

export const AchievementBadges = dynamic(
  () =>
    import("@/components/goals/AchievementBadges").then(
      (mod) => mod.AchievementBadges
    ),
  {
    loading: () => (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-silver-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    ),
    ssr: false,
  }
);

export const StrengthStandards = dynamic(
  () =>
    import("@/components/goals/StrengthStandards").then(
      (mod) => mod.StrengthStandards
    ),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-silver-200 p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-silver-200 rounded w-1/3" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-silver-200 rounded w-1/4" />
              <div className="h-12 bg-silver-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);
