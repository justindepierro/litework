/**
 * Accessibility Utilities
 * 
 * Comprehensive utilities for WCAG 2.1 AA compliance and enhanced accessibility.
 * Provides helper functions for keyboard navigation, focus management, and ARIA attributes.
 * 
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
 */

import React from 'react';

/**
 * Keyboard Key Constants
 * Use these instead of magic strings/numbers
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  SPACEBAR: 'Spacebar', // IE11 compatibility
  ESCAPE: 'Escape',
  ESC: 'Esc', // IE11 compatibility
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Check if a key event is an activation key (Enter or Space)
 * Use for making non-button elements keyboard accessible
 */
export function isActivationKey(event: React.KeyboardEvent): boolean {
  const key = event.key;
  return key === Keys.ENTER || key === Keys.SPACE || key === Keys.SPACEBAR;
}

/**
 * Check if Escape key was pressed
 */
export function isEscapeKey(event: React.KeyboardEvent): boolean {
  const key = event.key;
  return key === Keys.ESCAPE || key === Keys.ESC;
}

/**
 * Handle keyboard activation for interactive elements
 * Prevents default for Space to avoid page scroll
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: (event: React.KeyboardEvent) => void
): void {
  if (isActivationKey(event)) {
    // Prevent space from scrolling the page
    if (event.key === Keys.SPACE || event.key === Keys.SPACEBAR) {
      event.preventDefault();
    }
    callback(event);
  }
}

/**
 * Focus Management Utilities
 */

/**
 * Focus the first focusable element within a container
 * Useful for modals and dropdowns
 */
export function focusFirstElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    return true;
  }
  return false;
}

/**
 * Focus the last focusable element within a container
 */
export function focusLastElement(container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus();
    return true;
  }
  return false;
}

/**
 * Get all focusable elements within a container
 * Excludes disabled and hidden elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(selector)
  );

  // Filter out elements that are not visible
  return elements.filter((element) => {
    return (
      element.offsetWidth > 0 &&
      element.offsetHeight > 0 &&
      !element.hasAttribute('hidden') &&
      window.getComputedStyle(element).visibility !== 'hidden'
    );
  });
}

/**
 * Trap focus within a container (for modals, dropdowns)
 * Returns a cleanup function to remove listeners
 */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== Keys.TAB) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forwards
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * ARIA Attribute Helpers
 */

/**
 * Get ARIA attributes for a button-like element
 */
export function getButtonAriaProps(props: {
  pressed?: boolean;
  expanded?: boolean;
  controls?: string;
  label?: string;
  disabled?: boolean;
}): Record<string, string | boolean | undefined> {
  const ariaProps: Record<string, string | boolean | undefined> = {};

  if (props.pressed !== undefined) {
    ariaProps['aria-pressed'] = props.pressed;
  }
  if (props.expanded !== undefined) {
    ariaProps['aria-expanded'] = props.expanded;
  }
  if (props.controls) {
    ariaProps['aria-controls'] = props.controls;
  }
  if (props.label) {
    ariaProps['aria-label'] = props.label;
  }
  if (props.disabled) {
    ariaProps['aria-disabled'] = true;
  }

  return ariaProps;
}

/**
 * Get ARIA attributes for a link with icon
 */
export function getIconLinkAriaProps(label: string): Record<string, string> {
  return {
    'aria-label': label,
  };
}

/**
 * Screen Reader Utilities
 */

/**
 * Visually hide element but keep it accessible to screen readers
 * Use this instead of display: none or visibility: hidden for SR-only content
 */
export const srOnlyClass =
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Create a visually hidden span for screen readers
 */
export function createSROnlyText(text: string): React.ReactElement {
  return <span className={srOnlyClass}>{text}</span>;
}

/**
 * Announce message to screen readers
 * Uses aria-live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnlyClass;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Color Contrast Utilities
 */

/**
 * Calculate relative luminance of a color
 * Used for WCAG contrast ratio calculation
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @returns Contrast ratio (1-21)
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 * - UI components: 3:1
 */
export function meetsContrastRequirement(
  contrastRatio: number,
  level: 'normal' | 'large' | 'ui' = 'normal'
): boolean {
  const required = {
    normal: 4.5,
    large: 3.0,
    ui: 3.0,
  };
  return contrastRatio >= required[level];
}

/**
 * Reduced Motion Detection
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const [prefersReduced, setPrefersReduced] = React.useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReduced(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReduced;
}
