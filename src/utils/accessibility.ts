/**
 * Accessibility Utilities
 * WCAG AA compliance helpers and focus management
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Focus Trap Hook
 * Traps keyboard focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save the currently focused element
    previousFocus.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return [];

      const selectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");

      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(selectors)
      ).filter((el) => {
        // Filter out hidden elements
        return !el.hidden && el.offsetParent !== null;
      });
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      }
      // Tab
      else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);

      // Restore focus to previous element
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Skip to Main Content Helper
 * Improves keyboard navigation
 */
export function skipToMainContent() {
  const main = document.getElementById("main-content");
  if (main) {
    main.focus();
    main.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Announce to Screen Readers
 * Live region for dynamic content updates
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string) => {
    if (announcerRef.current) {
      // Clear previous message
      announcerRef.current.textContent = "";

      // Announce new message after a brief delay (allows screen readers to detect change)
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  return announce;
}

/**
 * Keyboard Navigation Hook
 * Handles arrow key navigation in lists
 */
export function useArrowNavigation<T extends HTMLElement>(
  itemsLength: number,
  onSelect?: (index: number) => void
) {
  const containerRef = useRef<T>(null);
  const activeIndexRef = useRef<number>(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const { key } = e;
      const isArrowKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(key);

      if (!isArrowKey && key !== "Enter" && key !== " ") return;

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          '[role="option"], [role="button"], button'
        )
      );

      if (items.length === 0) return;

      // Enter or Space - select current item
      if ((key === "Enter" || key === " ") && activeIndexRef.current >= 0) {
        e.preventDefault();
        if (onSelect) {
          onSelect(activeIndexRef.current);
        }
        return;
      }

      // Arrow navigation
      e.preventDefault();
      let newIndex = activeIndexRef.current;

      if (key === "ArrowDown" || key === "ArrowRight") {
        newIndex = (activeIndexRef.current + 1) % items.length;
      } else if (key === "ArrowUp" || key === "ArrowLeft") {
        newIndex =
          activeIndexRef.current <= 0
            ? items.length - 1
            : activeIndexRef.current - 1;
      }

      activeIndexRef.current = newIndex;
      items[newIndex].focus();
    },
    [onSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return containerRef;
}

/**
 * Accessible Form Field
 * Ensures proper ARIA labels and descriptions
 */
export function getAriaProps(
  id: string,
  label?: string,
  error?: string,
  helperText?: string
) {
  return {
    id,
    "aria-label": label,
    "aria-invalid": !!error,
    "aria-describedby":
      [error ? `${id}-error` : null, helperText ? `${id}-helper` : null]
        .filter(Boolean)
        .join(" ") || undefined,
  };
}

/**
 * Contrast Ratio Checker
 * Validates WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */
export function checkContrastRatio(
  foreground: string,
  background: string,
  fontSize: number = 16
): { ratio: number; passes: boolean } {
  const getRGBValues = (color: string): [number, number, number] => {
    // Simple hex to RGB conversion
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return [r, g, b];
  };

  const getLuminance = ([r, g, b]: [number, number, number]): number => {
    const [rs, gs, bs] = [r, g, b].map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgLuminance = getLuminance(getRGBValues(foreground));
  const bgLuminance = getLuminance(getRGBValues(background));

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA requirements
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && false); // bold text check would go here
  const requiredRatio = isLargeText ? 3 : 4.5;

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= requiredRatio,
  };
}

/**
 * Focus Visible Utility
 * Adds visible focus indicators only for keyboard navigation
 */
export function useFocusVisible() {
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.add("using-mouse");
      document.body.classList.remove("using-keyboard");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.classList.add("using-keyboard");
        document.body.classList.remove("using-mouse");
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
