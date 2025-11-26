/**
 * Select Component - Enhanced Version
 * 🎨 Modern design with smooth animations
 * ✨ Improved hover states and micro-interactions
 * ♿ Enhanced accessibility with ARIA attributes
 * 🎯 Better visual hierarchy and spacing
 */

"use client";

import React, { useState } from "react";
import { ChevronDown, AlertCircle, Check } from "lucide-react";
import { Body } from "./Typography";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string; // Optional description for complex options
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
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Size styles with improved spacing
    const sizeStyles = {
      sm: "h-9 px-3 text-sm rounded-lg",
      md: "h-11 px-4 text-base rounded-xl",
      lg: "h-13 px-5 text-lg rounded-xl",
    };

    // Enhanced state colors with smooth transitions
    const stateStyles = error
      ? "border-error focus:border-error focus:ring-error/20"
      : success
        ? "border-success focus:border-success focus:ring-success/20"
        : "border-primary focus:border-focus focus:ring-focus/20 hover:border-strong";

    // Dynamic background with subtle hover effect
    const backgroundStyles = disabled
      ? "bg-silver-200"
      : isHovered && !isFocused
        ? "bg-secondary"
        : "bg-surface";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Label with improved typography */}
        {label && (
          <label className="block text-sm font-semibold mb-2 transition-colors text-primary">
            {label}
            {props.required && (
              <Body as="span" weight="medium" className="ml-1 text-error">
                *
              </Body>
            )}
          </label>
        )}

        {/* Select container with enhanced shadow on focus */}
        <div
          className={`relative group transition-all duration-200 ${
            isFocused ? "scale-[1.01]" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Select with enhanced interactions */}
          <select
            ref={ref}
            className={`
              ${fullWidth ? "w-full" : ""}
              ${sizeStyles[selectSize]}
              ${stateStyles}
              ${backgroundStyles}
              pr-${error || success ? "20" : "10"}
              border-2
              appearance-none
              transition-all
              duration-200
              ease-out
              focus:outline-none
              focus:ring-4
              focus:shadow-lg
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
              hover:shadow-md
              text-primary
              ${!disabled && "active:scale-[0.99]"}
              ${className}
            `}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${props.id || "select"}-error`
                : helperText
                  ? `${props.id || "select"}-helper`
                  : undefined
            }
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
                title={option.description}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Animated chevron icon */}
          <div
            className={`
              absolute right-3 top-1/2 -translate-y-1/2
              pointer-events-none
              transition-all duration-300 ease-out
              ${isFocused ? "rotate-180 text-info" : isHovered && !disabled ? "text-secondary" : "text-tertiary"}
            `}
          >
            <ChevronDown className="w-5 h-5" />
          </div>

          {/* Error/Success icon with animation */}
          {(error || success) && (
            <div
              className={`
                absolute right-10 top-1/2 -translate-y-1/2 transition-all duration-200 animate-in fade-in zoom-in-95
                ${error ? "text-error" : "text-success"}
              `}
            >
              {error ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </div>
          )}

          {/* Subtle gradient overlay on hover (non-disabled) */}
          {!disabled && isHovered && !isFocused && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent rounded-xl pointer-events-none" />
          )}
        </div>

        {/* Helper text or error with improved styling */}
        {(helperText || error) && (
          <p
            id={
              error
                ? `${props.id || "select"}-error`
                : `${props.id || "select"}-helper`
            }
            className={`
              mt-2 text-sm flex items-start gap-1.5
              transition-colors duration-200
              ${error ? "font-medium" : ""}
            `}
            style={{
              color: error
                ? "var(--color-error)"
                : "var(--color-text-secondary)",
            }}
            role={error ? "alert" : undefined}
            aria-live={error ? "polite" : undefined}
          >
            {error && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{error || helperText}</span>
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
