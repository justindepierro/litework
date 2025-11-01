/**
 * Lazy-loaded component exports
 *
 * Heavy components are dynamically imported to reduce initial bundle size
 * and improve Time to Interactive (TTI)
 */

import dynamic from "next/dynamic";

// Simple loading spinner component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Heavy workout components - lazy load
export const WorkoutEditorLazy = dynamic(
  () => import("@/components/WorkoutEditor"),
  {
    loading: () => <LoadingSpinner message="Loading workout editor..." />,
    ssr: false, // Editor has complex state, client-side only
  }
);

export const WorkoutLiveLazy = dynamic(
  () => import("@/components/WorkoutLive"),
  {
    loading: () => <LoadingSpinner message="Loading workout session..." />,
    ssr: false,
  }
);

// Calendar - heavy component with lots of logic
export const CalendarViewLazy = dynamic(
  () => import("@/components/CalendarView"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ),
  }
);

// Analytics components - lazy load (not needed immediately)
export const ProgressAnalyticsLazy = dynamic(
  () => import("@/components/ProgressAnalytics"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    ),
  }
);

export const ExerciseLibraryLazy = dynamic(
  () => import("@/components/ExerciseLibrary"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    ),
  }
);
