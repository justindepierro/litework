import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * Only trigger once (good for lazy loading components)
   */
  triggerOnce?: boolean;
  /**
   * Delay before triggering (milliseconds)
   */
  delay?: number;
}

/**
 * Hook to detect when an element is visible in the viewport
 * Perfect for lazy loading components, infinite scroll, or triggering animations
 * 
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });
 * return <div ref={ref}>{isIntersecting && <HeavyComponent />}</div>;
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false,
    delay = 0,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<T>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip if already triggered once
    if (triggerOnce && hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;

        if (delay > 0 && isVisible) {
          // Delay the trigger
          timeoutRef.current = setTimeout(() => {
            setIsIntersecting(true);
            if (triggerOnce) {
              setHasIntersected(true);
            }
          }, delay);
        } else {
          setIsIntersecting(isVisible);
          if (isVisible && triggerOnce) {
            setHasIntersected(true);
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, hasIntersected, delay]);

  return {
    ref: elementRef,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected,
  };
}

/**
 * Hook for lazy loading images
 * 
 * @example
 * const { ref, isVisible } = useLazyLoad();
 * return <img ref={ref} src={isVisible ? actualSrc : placeholder} />;
 */
export function useLazyLoad<T extends Element = HTMLImageElement>(
  options?: UseIntersectionObserverOptions
) {
  return useIntersectionObserver<T>({
    triggerOnce: true,
    rootMargin: '50px', // Start loading 50px before entering viewport
    ...options,
  });
}
