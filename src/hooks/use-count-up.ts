/**
 * useCountUp Hook - Animate numbers counting up
 *
 * Usage:
 * const count = useCountUp(endValue, { duration: 1000, delay: 0 });
 */

import { useEffect, useState } from "react";

export interface UseCountUpOptions {
  /** Animation duration in ms */
  duration?: number;
  /** Delay before starting in ms */
  delay?: number;
  /** Easing function */
  easing?: (t: number) => number;
  /** Whether to start animation immediately */
  start?: boolean;
}

// Easing functions
const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export function useCountUp(
  end: number,
  {
    duration = 1000,
    delay = 0,
    easing = easeOutQuart,
    start = true,
  }: UseCountUpOptions = {}
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime - delay;

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = Math.floor(easedProgress * end);

      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, delay, easing, start]);

  return count;
}
