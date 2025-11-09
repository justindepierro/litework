/**
 * Select Component with Focus States
 * Uses design tokens for consistency
 * Matches Input component styling
 */

"use client";

import React from "react";
import { ChevronDown, AlertCircle, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Select label */
  label?: string;
  /** Helper text below select */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Options array */
  options: SelectOption[];
  /** Placeholder */
  placeholder?: string;
  /** Size variant */
  selectSize?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      success = false,
      options,
      placeholder = "Select an option",
      selectSize = "md",
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-base",
      lg: "h-13 px-5 text-lg",
    };

    // State colors
    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : success
        ? "border-[var(--color-success)] focus:border-[var(--color-success)]"
        : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mb-2">
            {label}
            {props.required && (
              <span className="text-[var(--color-error)] ml-1">*</span>
            )}
          </label>
        )}

        {/* Select container */}
        <div className="relative">
          {/* Select */}
          <select
            ref={ref}
            className={`
              ${fullWidth ? "w-full" : ""}
              ${sizeStyles[selectSize]}
              ${stateStyles}
              pr-10
              bg-[var(--color-bg-surface)]
              text-[var(--color-text-primary)]
              border-2
              rounded-lg
              appearance-none
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--color-border-focus)]
              focus:ring-opacity-50
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:bg-[var(--color-bg-disabled)]
              ${className}
            `}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
            <ChevronDown className="w-5 h-5" />
          </div>

          {/* Error/Success icon */}
          {(error || success) && (
            <div
              className={`absolute right-10 top-1/2 -translate-y-1/2 ${
                error
                  ? "text-[var(--color-error)]"
                  : "text-[var(--color-success)]"
              }`}
            >
              {error ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {/* Helper text or error */}
        {(helperText || error) && (
          <p
            className={`mt-2 text-sm ${
              error
                ? "text-[var(--color-error)]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
