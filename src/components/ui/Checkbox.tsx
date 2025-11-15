/**
 * Checkbox Component
 * Accessible checkbox with proper design tokens
 * Supports individual checkboxes and checkbox groups
 */

"use client";

import React, { createContext, useContext } from "react";
import { Body, Caption } from "./Typography";

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checkbox state changes */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Helper text below checkbox */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Indeterminate state (for "select all" scenarios) */
  indeterminate?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Value (used in CheckboxGroup) */
  value?: string;
  /** Custom className */
  className?: string;
  /** ID for the input */
  id?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      helperText,
      error = false,
      disabled = false,
      indeterminate = false,
      size = "md",
      value,
      className = "",
      id,
    },
    ref
  ) => {
    const sizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    // Get context if inside CheckboxGroup
    const groupContext = useContext(CheckboxGroupContext);
    const isInGroup = groupContext !== null;

    const actualChecked = isInGroup
      ? groupContext.value.includes(value || "")
      : checked;
    const actualOnChange = isInGroup
      ? () => groupContext.onChange(value || "")
      : (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked);
    const actualDisabled = isInGroup ? groupContext.disabled : disabled;

    // Set indeterminate state via ref
    React.useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [ref, indeterminate]);

    return (
      <label
        className={`flex items-start gap-3 ${actualDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          checked={actualChecked}
          onChange={actualOnChange}
          disabled={actualDisabled}
          value={value}
          className={`
            ${sizes[size]}
            mt-0.5
            rounded border-2
            ${error ? "border-error" : "border-silver-400"}
            text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
          `}
        />
        {(label || helperText) && (
          <div className="flex-1 -mt-0.5">
            {label && <Body>{label}</Body>}
            {helperText && (
              <Caption variant={error ? "error" : "muted"}>
                {helperText}
              </Caption>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

// ============================================================================
// CHECKBOX GROUP COMPONENT
// ============================================================================

interface CheckboxGroupContextValue {
  value: string[];
  onChange: (value: string) => void;
  disabled: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null
);

export interface CheckboxGroupProps {
  /** Label for the group */
  label?: string;
  /** Helper text below group */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Array of selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (value: string[]) => void;
  /** Disabled state for all checkboxes */
  disabled?: boolean;
  /** Orientation */
  orientation?: "vertical" | "horizontal";
  /** Children (Checkbox components) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  helperText,
  error,
  value,
  onChange,
  disabled = false,
  orientation = "vertical",
  children,
  className = "",
}) => {
  const handleToggle = (itemValue: string) => {
    if (value.includes(itemValue)) {
      onChange(value.filter((v) => v !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  const contextValue: CheckboxGroupContextValue = {
    value,
    onChange: handleToggle,
    disabled,
  };

  return (
    <div className={className}>
      {label && <Body className="mb-3 font-medium">{label}</Body>}

      <CheckboxGroupContext.Provider value={contextValue}>
        <div
          className={`
            flex gap-4
            ${orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"}
          `}
        >
          {children}
        </div>
      </CheckboxGroupContext.Provider>

      {(helperText || error) && (
        <Caption variant={error ? "error" : "muted"} className="mt-2">
          {error || helperText}
        </Caption>
      )}
    </div>
  );
};

CheckboxGroup.displayName = "CheckboxGroup";
