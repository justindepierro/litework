/**
 * useMinimumLoadingTime Hook
 * 
 * Ensures loading states are shown for a minimum duration to prevent jarring flashes.
 * Improves perceived performance by providing stable, predictable loading experiences.
 * 
 * Usage:
 * ```tsx
 * const { isLoading, showSkeleton } = useMinimumLoadingTime(dataIsLoading, 300);
 * 
 * if (showSkeleton) {
 *   return <SkeletonDashboard />;
 * }
 * ```
 * 
 * @param isLoading - The actual loading state from data fetching
 * @param minimumMs - Minimum time to show skeleton (default: 300ms)
 * @returns Object with isLoading and showSkeleton flags
 */

"use client";

import { useState, useEffect, useRef } from "react";

interface UseMinimumLoadingTimeReturn {
  /** Original loading state */
  isLoading: boolean;
  /** Whether to show skeleton (considers minimum time) */
  showSkeleton: boolean;
}

export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumMs: number = 300
): UseMinimumLoadingTimeReturn {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When loading starts
    if (isLoading && !loadingStartTimeRef.current) {
      loadingStartTimeRef.current = Date.now();
      setShowSkeleton(true);
    }

    // When loading finishes
    if (!isLoading && loadingStartTimeRef.current) {
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = minimumMs - elapsedTime;

      if (remainingTime > 0) {
        // Show skeleton for remaining minimum time
        timerRef.current = setTimeout(() => {
          setShowSkeleton(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      } else {
        // Minimum time already elapsed
        setShowSkeleton(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, minimumMs]);

  return {
    isLoading,
    showSkeleton,
  };
}

/**
 * Alternative: Simple debounced skeleton hook
 * Shows skeleton immediately but delays hiding it
 */
export function useDebouncedSkeleton(
  isLoading: boolean,
  delayMs: number = 300
): boolean {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Show skeleton immediately
      setShowSkeleton(true);
      // Clear any pending hide
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Delay hiding skeleton
      timerRef.current = setTimeout(() => {
        setShowSkeleton(false);
      }, delayMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, delayMs]);

  return showSkeleton;
}
