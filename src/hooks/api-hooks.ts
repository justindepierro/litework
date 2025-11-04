/**
 * API Hooks - Now powered by SWR for optimal performance
 * 
 * These hooks have been migrated to use SWR for:
 * - Automatic caching and revalidation
 * - Request deduplication
 * - Background refetching
 * - Optimistic updates
 * 
 * Simply re-export from use-swr-hooks for backward compatibility
 */

export {
  useGroups,
  useWorkouts,
  useAssignments,
  useAthletes,
  useExercises,
  useDashboardStats,
  useGroupStats,
  useTodaySchedule,
  useNotifications,
  // Cache invalidation functions
  invalidateGroups,
  invalidateWorkouts,
  invalidateAssignments,
  invalidateAthletes,
  invalidateExercises,
  invalidateDashboard,
  // Prefetch functions
  prefetchGroups,
  prefetchWorkouts,
  prefetchAthletes,
  prefetchExercises,
} from './use-swr-hooks';

