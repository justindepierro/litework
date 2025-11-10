import { useEffect, useCallback } from "react";

/**
 * Keyboard shortcut configuration
 */
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  preventDefaultOnMatch?: boolean;
}

/**
 * Hook to manage keyboard shortcuts throughout the app
 * Provides configurable keyboard shortcuts with automatic event handling
 *
 * @param options - Configuration for keyboard shortcuts
 * @param options.shortcuts - Array of keyboard shortcuts to register
 * @param options.enabled - Whether shortcuts are active (default: true)
 * @param options.preventDefaultOnMatch - Prevent default browser behavior (default: true)
 *
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'n',
 *       description: 'Create new workout',
 *       action: () => navigate('/workouts/new'),
 *     },
 *     {
 *       key: 's',
 *       ctrlKey: true,
 *       description: 'Save',
 *       action: handleSave,
 *     },
 *   ],
 * });
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  preventDefaultOnMatch = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in an input
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        // Skip if shortcut is explicitly disabled
        if (shortcut.enabled === false) continue;

        // Check key match (case-insensitive)
        if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) continue;

        // Check modifier keys
        if (shortcut.ctrlKey && !event.ctrlKey) continue;
        if (shortcut.metaKey && !event.metaKey) continue;
        if (shortcut.shiftKey && !event.shiftKey) continue;
        if (shortcut.altKey && !event.altKey) continue;

        // If no modifiers specified, ensure none are pressed (except for special keys)
        const hasModifiers = event.ctrlKey || event.metaKey || event.altKey;
        const shortcutHasModifiers =
          shortcut.ctrlKey || shortcut.metaKey || shortcut.altKey;

        // Skip if in input field and no modifiers (allow Ctrl+S etc.)
        if (isInputField && !shortcutHasModifiers) continue;

        // Skip if modifiers don't match
        if (hasModifiers && !shortcutHasModifiers) continue;

        // Match found - execute action
        if (preventDefaultOnMatch) {
          event.preventDefault();
        }
        shortcut.action();
        return;
      }
    },
    [shortcuts, enabled, preventDefaultOnMatch]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for global keyboard shortcuts that work across the entire app
 * Pre-configured with common app shortcuts
 *
 * @example
 * useGlobalKeyboardShortcuts({
 *   onNewWorkout: () => navigate('/workouts/new'),
 *   onNewExercise: () => navigate('/exercises/new'),
 *   onSearch: () => setSearchOpen(true),
 * });
 */
export function useGlobalKeyboardShortcuts({
  onNewWorkout,
  onNewExercise,
  onSearch,
  onDashboard,
  onSettings,
  enabled = true,
}: {
  onNewWorkout?: () => void;
  onNewExercise?: () => void;
  onSearch?: () => void;
  onDashboard?: () => void;
  onSettings?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Quick actions
    {
      key: "n",
      description: "New workout",
      action: onNewWorkout || (() => {}),
      enabled: !!onNewWorkout,
    },
    {
      key: "e",
      description: "New exercise",
      action: onNewExercise || (() => {}),
      enabled: !!onNewExercise,
    },
    // Navigation
    {
      key: "h",
      description: "Go to dashboard",
      action: onDashboard || (() => {}),
      enabled: !!onDashboard,
    },
    {
      key: "/",
      description: "Focus search",
      action: onSearch || (() => {}),
      enabled: !!onSearch,
    },
    {
      key: ",",
      description: "Open settings",
      action: onSettings || (() => {}),
      enabled: !!onSettings,
    },
  ];

  useKeyboardShortcuts({
    shortcuts,
    enabled,
    preventDefaultOnMatch: true,
  });
}

/**
 * Get keyboard shortcut display string
 * Formats shortcut for display in UI (e.g., "Ctrl+S", "Cmd+K")
 *
 * @param shortcut - Keyboard shortcut configuration
 * @returns Formatted string for display
 *
 * @example
 * getShortcutDisplay({ key: 's', ctrlKey: true })
 * // Returns: "Ctrl+S" (on Windows/Linux) or "⌘S" (on Mac)
 */
export function getShortcutDisplay(
  shortcut: Omit<KeyboardShortcut, "action" | "description">
): string {
  const parts: string[] = [];
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.includes("Mac");

  if (shortcut.ctrlKey) {
    parts.push(isMac ? "⌃" : "Ctrl");
  }
  if (shortcut.metaKey) {
    parts.push(isMac ? "⌘" : "Win");
  }
  if (shortcut.altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  // Add the key itself
  const keyDisplay = shortcut.key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join(isMac ? "" : "+");
}
