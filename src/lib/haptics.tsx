/**
 * Haptic Feedback Utility for Mobile Devices
 * 
 * Provides tactile feedback for user interactions on iOS and Android devices.
 * Enhances mobile UX by providing physical feedback for button presses, confirmations, and errors.
 * 
 * @example
 * ```typescript
 * import { triggerHaptic, HapticType } from "@/lib/haptics";
 * 
 * // Light feedback for button tap
 * <Button onClick={() => {
 *   triggerHaptic('light');
 *   handleAction();
 * }}>
 * 
 * // Success feedback for form submission
 * triggerHaptic('success');
 * 
 * // Error feedback for validation
 * triggerHaptic('error');
 * ```
 */

import React from "react";

export type HapticType =
  | "light"      // Subtle tap (button press, selection)
  | "medium"     // Medium impact (drag start, toggle)
  | "heavy"      // Strong impact (delete, important action)
  | "success"    // Success notification (form submit, save)
  | "warning"    // Warning (approaching limit, caution)
  | "error"      // Error (validation fail, action failed)
  | "selection"; // Selection change (picker, tabs)

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  if (typeof window === "undefined") return false;
  
  // iOS - Haptic Feedback API
  if ("vibrate" in navigator) {
    return true;
  }
  
  // Android - Vibration API
  if ("vibrate" in navigator) {
    return true;
  }
  
  return false;
}

/**
 * Trigger haptic feedback
 * 
 * @param type - Type of haptic feedback to trigger
 */
export function triggerHaptic(type: HapticType = "light"): void {
  if (!isHapticSupported()) return;
  
  try {
    // Map haptic types to vibration patterns (in milliseconds)
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,              // Single short vibration
      medium: 20,             // Single medium vibration
      heavy: 30,              // Single strong vibration
      success: [10, 50, 10],  // Two short vibrations
      warning: [20, 100, 20], // Two medium vibrations
      error: [30, 100, 30],   // Two strong vibrations
      selection: 5,           // Very subtle vibration
    };
    
    const pattern = patterns[type];
    
    // Use Vibration API (supported on iOS and Android)
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    // Silently fail - haptic feedback is optional
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelHaptic(): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(0);
  }
}

/**
 * React hook for haptic feedback
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const haptic = useHaptic();
 *   
 *   return (
 *     <Button onClick={() => {
 *       haptic.trigger('light');
 *       handleClick();
 *     }}>
 *       Click Me
 *     </Button>
 *   );
 * }
 * ```
 */
export function useHaptic() {
  return {
    trigger: triggerHaptic,
    cancel: cancelHaptic,
    isSupported: isHapticSupported(),
  };
}

/**
 * Higher-order component to add haptic feedback to any interactive element
 * 
 * @example
 * ```typescript
 * const HapticButton = withHaptic(Button, 'light');
 * <HapticButton onClick={handleClick}>Click Me</HapticButton>
 * ```
 */
export function withHaptic<P extends { onClick?: () => void }>(
  Component: React.ComponentType<P>,
  hapticType: HapticType = "light"
) {
  return function WithHapticComponent(props: P) {
    const handleClick = () => {
      triggerHaptic(hapticType);
      props.onClick?.();
    };

    return <Component {...props} onClick={handleClick} />;
  };
}

/**
 * Utility for form validation haptics
 */
export const formHaptics = {
  /** Field focused */
  focus: () => triggerHaptic("selection"),
  
  /** Field value changed */
  change: () => triggerHaptic("light"),
  
  /** Form submitted successfully */
  success: () => triggerHaptic("success"),
  
  /** Validation error */
  error: () => triggerHaptic("error"),
  
  /** Warning message */
  warning: () => triggerHaptic("warning"),
};

/**
 * Utility for button haptics
 */
export const buttonHaptics = {
  /** Primary action button */
  primary: () => triggerHaptic("medium"),
  
  /** Secondary action button */
  secondary: () => triggerHaptic("light"),
  
  /** Destructive action (delete, remove) */
  destructive: () => triggerHaptic("heavy"),
  
  /** Toggle/switch */
  toggle: () => triggerHaptic("light"),
  
  /** Drag start */
  dragStart: () => triggerHaptic("medium"),
  
  /** Drag end */
  dragEnd: () => triggerHaptic("light"),
};

/**
 * Utility for navigation haptics
 */
export const navigationHaptics = {
  /** Tab change */
  tabChange: () => triggerHaptic("selection"),
  
  /** Page navigation */
  pageChange: () => triggerHaptic("light"),
  
  /** Modal open */
  modalOpen: () => triggerHaptic("medium"),
  
  /** Modal close */
  modalClose: () => triggerHaptic("light"),
};
