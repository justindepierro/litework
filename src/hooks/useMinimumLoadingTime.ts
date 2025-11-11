/**
 * useMinimumLoadingTime Hook
 * Ensures skeleton screens display for a minimum duration
 * Prevents jarring flash of loading states on fast networks
 * 
 * Usage:
 * const showSkeleton = useMinimumLoadingTime(isLoading, 300);
 * 
 * @param isLoading - The actual loading state from API/data fetch
 * @param minimumMs - Minimum time to show skeleton (default 300ms)
 * @returns boolean - Whether to show skeleton screen
 */

import { useState, useEffect, useRef } from "react";

export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumMs: number = 300
): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - track time
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
      }
      // eslint-disable-next-line react-compiler/react-compiler
      setShowLoading(true);
    } else if (loadingStartTimeRef.current) {
      // Loading finished - check if minimum time has passed
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remaining = minimumMs - elapsed;

      if (remaining > 0) {
        // Wait for remaining time before hiding
        const timeout = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remaining);
        return () => clearTimeout(timeout);
      } else {
        // Minimum time already passed
        // eslint-disable-next-line react-compiler/react-compiler
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    }
  }, [isLoading, minimumMs]);

  return showLoading;
}
