/**
 * API Data Caching with SWR
 * Implements stale-while-revalidate pattern for better performance
 */

"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useCallback } from "react";

// Default fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch on window focus
  revalidateOnReconnect: true, // Refetch when connection restored
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 1000, // Wait 1 second between retries
};

// Hook for fetching workout feed with caching
export function useWorkoutFeed(groupId?: string, limit = 20) {
  const params = new URLSearchParams();
  if (groupId) params.append("groupId", groupId);
  params.append("limit", limit.toString());

  const { data, error, mutate, isLoading } = useSWR(
    `/api/workout-feed?${params.toString()}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 30000, // Auto-refresh every 30 seconds
    }
  );

  return {
    feedItems: data?.items || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook for fetching leaderboard with caching
export function useLeaderboard(
  groupId?: string,
  type:
    | "weekly_volume"
    | "monthly_volume"
    | "streak"
    | "pr_count"
    | "workout_count" = "weekly_volume",
  period: "weekly" | "monthly" | "all_time" = "weekly",
  limit = 10
) {
  const params = new URLSearchParams();
  if (groupId) params.append("groupId", groupId);
  params.append("type", type);
  params.append("period", period);
  params.append("limit", limit.toString());

  const { data, error, mutate, isLoading } = useSWR(
    `/api/leaderboard?${params.toString()}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 60000, // Auto-refresh every minute
    }
  );

  return {
    entries: data?.entries || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook for fetching progress photos with caching
export function useProgressPhotos(
  athleteId: string,
  limit = 50,
  beforeAfterOnly = false
) {
  const params = new URLSearchParams();
  params.append("athleteId", athleteId);
  params.append("limit", limit.toString());
  if (beforeAfterOnly) params.append("beforeAfterOnly", "true");

  const { data, error, mutate, isLoading } = useSWR(
    `/api/progress-photos?${params.toString()}`,
    fetcher,
    {
      ...defaultConfig,
      revalidateOnMount: true, // Always fetch on mount
    }
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      try {
        const response = await fetch(`/api/progress-photos`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId }),
        });

        if (!response.ok) throw new Error("Failed to delete photo");

        // Optimistically update cache
        mutate(
          (currentData: any) => ({
            ...currentData,
            photos:
              currentData?.photos?.filter((p: any) => p.id !== photoId) || [],
          }),
          { revalidate: true }
        );

        return true;
      } catch (err) {
        console.error("Delete error:", err);
        return false;
      }
    },
    [mutate]
  );

  return {
    photos: data?.photos || [],
    error,
    isLoading,
    refresh: mutate,
    deletePhoto,
  };
}

// Hook for fetching athlete goals with caching
export function useAthleteGoals(athleteId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/goals?athleteId=${athleteId}`,
    fetcher,
    {
      ...defaultConfig,
      revalidateOnMount: true,
    }
  );

  const createGoal = useCallback(
    async (goalData: any) => {
      try {
        const response = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });

        if (!response.ok) throw new Error("Failed to create goal");

        const result = await response.json();

        // Optimistically update cache
        mutate(
          (currentData: any) => ({
            ...currentData,
            goals: [...(currentData?.goals || []), result.goal],
          }),
          { revalidate: true }
        );

        return result.goal;
      } catch (err) {
        console.error("Create goal error:", err);
        throw err;
      }
    },
    [mutate]
  );

  const updateGoal = useCallback(
    async (goalId: string, updates: any) => {
      try {
        const response = await fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId, ...updates }),
        });

        if (!response.ok) throw new Error("Failed to update goal");

        const result = await response.json();

        // Optimistically update cache
        mutate(
          (currentData: any) => ({
            ...currentData,
            goals:
              currentData?.goals?.map((g: any) =>
                g.id === goalId ? result.goal : g
              ) || [],
          }),
          { revalidate: true }
        );

        return result.goal;
      } catch (err) {
        console.error("Update goal error:", err);
        throw err;
      }
    },
    [mutate]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      try {
        const response = await fetch("/api/goals", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goalId }),
        });

        if (!response.ok) throw new Error("Failed to delete goal");

        // Optimistically update cache
        mutate(
          (currentData: any) => ({
            ...currentData,
            goals:
              currentData?.goals?.filter((g: any) => g.id !== goalId) || [],
          }),
          { revalidate: true }
        );

        return true;
      } catch (err) {
        console.error("Delete goal error:", err);
        return false;
      }
    },
    [mutate]
  );

  return {
    goals: data?.goals || [],
    error,
    isLoading,
    refresh: mutate,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}

// Hook for fetching analytics with caching
export function useVolumeProgress(athleteId: string, days = 30) {
  const { data, error, isLoading } = useSWR(
    `/api/analytics/volume-progress?athleteId=${athleteId}&days=${days}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data: data?.data || [],
    error,
    isLoading,
  };
}

export function useStrengthProgress(
  athleteId: string,
  exerciseId: string,
  days = 90
) {
  const { data, error, isLoading } = useSWR(
    `/api/analytics/strength-progress?athleteId=${athleteId}&exerciseId=${exerciseId}&days=${days}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data: data?.data || [],
    error,
    isLoading,
  };
}

export function useExerciseFrequency(athleteId: string, days = 30) {
  const { data, error, isLoading } = useSWR(
    `/api/analytics/exercise-frequency?athleteId=${athleteId}&days=${days}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    data: data?.data || [],
    error,
    isLoading,
  };
}
