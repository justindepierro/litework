/**
 * Optimized SWR Data Fetching Hooks
 * 
 * Benefits:
 * - Automatic caching and revalidation
 * - Request deduplication (multiple components, one request)
 * - Background refetching
 * - Optimistic updates
 * - Network status tracking
 * - Significantly reduced API calls
 */

import useSWR, { mutate } from 'swr';
import { AthleteGroup, WorkoutPlan, WorkoutAssignment } from '@/types';

// Generic fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  
  return response.json();
};

// SWR configuration
const defaultConfig = {
  revalidateOnFocus: false, // Don't refetch when user returns to tab
  revalidateOnReconnect: true, // Refetch when network reconnects
  dedupingInterval: 30000, // Dedupe requests within 30 seconds
  shouldRetryOnError: true, // Retry on error
  errorRetryCount: 3, // Max retry attempts
  errorRetryInterval: 5000, // Wait 5s between retries
};

/**
 * Hook for fetching groups with automatic caching
 * Multiple components can call this simultaneously - only one request made!
 */
export function useGroups() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/groups',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 60000, // Groups change infrequently, cache for 1 minute
    }
  );

  return {
    groups: (data?.groups || []) as AthleteGroup[],
    isLoading,
    error: error ? 'Failed to load groups' : null,
    refetch,
  };
}

/**
 * Hook for fetching workouts with automatic caching
 */
export function useWorkouts() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/workouts',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    workouts: (data?.data?.workouts || []) as WorkoutPlan[],
    isLoading,
    error: error ? 'Failed to load workouts' : null,
    refetch,
  };
}

/**
 * Hook for fetching assignments with optional filters
 * Supports athleteId, groupId, and date parameters
 */
export function useAssignments(params?: {
  athleteId?: string;
  groupId?: string;
  date?: string;
}) {
  // Build query string from params
  const queryString = params 
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null) as [string, string][]
      ).toString()
    : '';
    
  const { data, error, isLoading, mutate: refetch } = useSWR(
    `/api/assignments${queryString}`,
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 20000, // Assignments change more frequently, 20s cache
    }
  );

  return {
    assignments: (data?.data?.assignments || []) as WorkoutAssignment[],
    isLoading,
    error: error ? 'Failed to load assignments' : null,
    refetch,
  };
}

/**
 * Hook for fetching athletes with caching
 */
export function useAthletes() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/athletes',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 45000, // Athletes list changes occasionally, 45s cache
    }
  );

  return {
    athletes: data?.data?.athletes || [],
    invites: data?.data?.invites || [],
    isLoading,
    error: error ? 'Failed to load athletes' : null,
    refetch,
  };
}

/**
 * Hook for fetching exercises with search and category filters
 */
export function useExercises(params?: {
  search?: string;
  category?: string;
  favorites?: boolean;
}) {
  // Build query string from params
  const queryString = params 
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '') as [string, string][]
      ).toString()
    : '';
    
  const { data, error, isLoading, mutate: refetch } = useSWR(
    `/api/exercises${queryString}`,
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 120000, // Exercises rarely change, cache for 2 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    exercises: data?.data || [],
    isLoading,
    error: error ? 'Failed to load exercises' : null,
    refetch,
  };
}

/**
 * Hook for fetching dashboard stats (athletes only)
 */
export function useDashboardStats() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/analytics/dashboard-stats',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 60000, // Stats update every minute at most
    }
  );

  return {
    stats: data?.stats || {
      workoutsThisWeek: 0,
      personalRecords: 0,
      currentStreak: 0,
    },
    isLoading,
    error: error ? 'Failed to load dashboard stats' : null,
    refetch,
  };
}

/**
 * Hook for fetching group stats (coaches/admins)
 */
export function useGroupStats() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/analytics/group-stats',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 60000, // Group stats update every minute
    }
  );

  return {
    groups: data?.groups || [],
    isLoading,
    error: error ? 'Failed to load group stats' : null,
    refetch,
  };
}

/**
 * Hook for fetching today's schedule
 */
export function useTodaySchedule() {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/analytics/today-schedule',
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 30000, // Today's schedule can change, 30s cache
      revalidateOnFocus: true, // DO refetch when user comes back to check schedule
    }
  );

  return {
    workouts: data?.workouts || [],
    isLoading,
    error: error ? 'Failed to load today\'s schedule' : null,
    refetch,
  };
}

/**
 * Hook for fetching notifications
 */
export function useNotifications(params?: {
  limit?: number;
  unread_only?: boolean;
}) {
  const queryString = params 
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';
    
  const { data, error, isLoading, mutate: refetch } = useSWR(
    `/api/notifications/inbox${queryString}`,
    fetcher,
    {
      ...defaultConfig,
      dedupingInterval: 15000, // Notifications need frequent checks, 15s cache
      revalidateOnFocus: true, // Refetch when user returns to check notifications
      shouldRetryOnError: false, // Don't retry on 401 errors
    }
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error: error ? null : null, // Silently fail for notifications (401 is common)
    refetch,
  };
}

/**
 * Global cache invalidation functions
 * Use these after mutations (create, update, delete) to refresh data
 */
export const invalidateGroups = () => mutate('/api/groups');
export const invalidateWorkouts = () => mutate('/api/workouts');
export const invalidateAssignments = () => mutate((key) => 
  typeof key === 'string' && key.startsWith('/api/assignments')
);
export const invalidateAthletes = () => mutate('/api/athletes');
export const invalidateExercises = () => mutate((key) => 
  typeof key === 'string' && key.startsWith('/api/exercises')
);
export const invalidateDashboard = () => {
  mutate('/api/analytics/dashboard-stats');
  mutate('/api/analytics/group-stats');
  mutate('/api/analytics/today-schedule');
};

/**
 * Prefetch functions - use these to load data before navigation
 * Example: await prefetchWorkouts() before navigating to /workouts
 */
export const prefetchGroups = () => mutate('/api/groups', fetcher('/api/groups'));
export const prefetchWorkouts = () => mutate('/api/workouts', fetcher('/api/workouts'));
export const prefetchAthletes = () => mutate('/api/athletes', fetcher('/api/athletes'));
export const prefetchExercises = () => mutate('/api/exercises', fetcher('/api/exercises'));
