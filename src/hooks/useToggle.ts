import { useState, useCallback } from "react";

/**
 * Custom hook for managing boolean toggle state
 *
 * Replaces the common pattern:
 * const [isOpen, setIsOpen] = useState(false)
 *
 * @param initialValue - Initial boolean value (default: false)
 * @returns [value, toggle, setValue] tuple
 *
 * @example
 * ```typescript
 * const [isOpen, toggleOpen, setIsOpen] = useToggle();
 * const [isExpanded, toggleExpanded] = useToggle(true);
 *
 * <Button onClick={toggleOpen}>Toggle</Button>
 * <Button onClick={() => setIsOpen(false)}>Close</Button>
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
