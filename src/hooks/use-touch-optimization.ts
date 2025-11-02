"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Touch event optimization utilities for mobile devices
 * Improves scroll performance and touch responsiveness
 */

interface TouchOptimizationOptions {
  enablePassiveListeners?: boolean;
  enableTouchFeedback?: boolean;
  preventDoubleTapZoom?: boolean;
}

/**
 * Hook to optimize touch events on mobile devices
 */
export function useTouchOptimization(options: TouchOptimizationOptions = {}) {
  const {
    enablePassiveListeners = true,
    enableTouchFeedback = true,
    preventDoubleTapZoom = true,
  } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Add touch-action CSS for better performance
    if (preventDoubleTapZoom) {
      document.body.style.touchAction = "manipulation";
    }

    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      if (preventDoubleTapZoom) {
        document.body.style.touchAction = "";
      }
    };
  }, [preventDoubleTapZoom]);

  return {
    // Optimized touch handlers
    getTouchProps: useCallback(
      (onTouch?: (e: TouchEvent) => void) => ({
        onTouchStart: enablePassiveListeners
          ? undefined
          : (e: React.TouchEvent) => onTouch?.(e.nativeEvent),
        style: {
          touchAction: preventDoubleTapZoom ? "manipulation" : "auto",
          WebkitTapHighlightColor: enableTouchFeedback
            ? "rgba(0, 0, 0, 0.1)"
            : "transparent",
        },
      }),
      [enablePassiveListeners, enableTouchFeedback, preventDoubleTapZoom]
    ),
  };
}

/**
 * Hook for haptic feedback on touch devices
 */
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return {
    // Light tap feedback
    tapFeedback: useCallback(() => vibrate(10), [vibrate]),
    
    // Success feedback
    successFeedback: useCallback(() => vibrate([10, 50, 10]), [vibrate]),
    
    // Error feedback
    errorFeedback: useCallback(() => vibrate([50, 50, 50]), [vibrate]),
    
    // Warning feedback
    warningFeedback: useCallback(() => vibrate([20, 100, 20]), [vibrate]),
    
    // Custom pattern
    customFeedback: vibrate,
  };
}

/**
 * Hook to detect and prevent accidental touches
 */
export function useAccidentalTouchPrevention(delay: number = 300) {
  const lastTouchRef = useRef<number>(0);
  const touchCountRef = useRef<number>(0);

  const isAccidentalTouch = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTouch = now - lastTouchRef.current;

    // Rapid successive touches (< delay ms) might be accidental
    if (timeSinceLastTouch < delay) {
      touchCountRef.current++;
      return touchCountRef.current > 3; // More than 3 rapid touches is suspicious
    }

    // Reset counter if enough time has passed
    touchCountRef.current = 1;
    lastTouchRef.current = now;
    return false;
  }, [delay]);

  const handleTouch = useCallback(
    (callback: () => void) => {
      if (!isAccidentalTouch()) {
        callback();
      }
    },
    [isAccidentalTouch]
  );

  return { handleTouch, isAccidentalTouch };
}

/**
 * Hook to handle pull-to-refresh gesture
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY !== 0 || isRefreshingRef.current) return;

      currentYRef.current = e.touches[0].clientY;
      const pullDistance = currentYRef.current - startYRef.current;

      // If pulled down more than 100px, show refresh indicator
      if (pullDistance > 100) {
        // Visual feedback could be added here
        document.body.style.transform = `translateY(${Math.min(pullDistance - 100, 50)}px)`;
      }
    };

    const handleTouchEnd = async () => {
      if (window.scrollY !== 0 || isRefreshingRef.current) return;

      const pullDistance = currentYRef.current - startYRef.current;

      if (pullDistance > 100) {
        isRefreshingRef.current = true;
        try {
          await onRefresh();
        } finally {
          isRefreshingRef.current = false;
          document.body.style.transform = "";
        }
      } else {
        document.body.style.transform = "";
      }

      startYRef.current = 0;
      currentYRef.current = 0;
    };

    // Use passive listeners for better scroll performance
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh]);
}

/**
 * Component to prevent zoom on double-tap
 */
export function TouchOptimizationProvider({ children }: { children: React.ReactNode }) {
  useTouchOptimization({
    enablePassiveListeners: true,
    enableTouchFeedback: true,
    preventDoubleTapZoom: true,
  });

  return children;
}
