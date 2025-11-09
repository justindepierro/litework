/**
 * Textarea Component with Focus States
 * Uses design tokens for consistency
 * Matches Input component styling
 */

"use client";

import React, { useEffect, useRef } from "react";
import { AlertCircle, Check } from "lucide-react";

export interface TextareaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "rows"
  > {
  /** Textarea label */
  label?: string;
  /** Helper text below textarea */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Number of visible rows */
  rows?: number;
  /** Minimum rows (for auto-resize) */
  minRows?: number;
  /** Maximum rows (for auto-resize) */
  maxRows?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Show character count */
  showCharCount?: boolean;
  /** Auto-resize textarea based on content */
  autoResize?: boolean;
  /** Resize handle */
  resize?: "none" | "vertical" | "both";
  /** Size variant */
  textareaSize?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      success = false,
      rows = 4,
      minRows = 3,
      maxRows = 12,
      maxLength,
      showCharCount = false,
      autoResize = false,
      resize = "vertical",
      textareaSize = "md",
      fullWidth = false,
      className = "",
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Calculate character count directly from value (no need for state)
    const charCount =
      showCharCount && value !== undefined ? String(value).length : 0;

    // Size styles
    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-5 py-4 text-lg",
    };

    // State colors
    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : success
        ? "border-[var(--color-success)] focus:border-[var(--color-success)]"
        : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    // Resize styles
    const resizeStyles = {
      none: "resize-none",
      vertical: "resize-y",
      both: "resize",
    };

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseInt(
          window.getComputedStyle(textarea).lineHeight
        );
        const maxHeight = lineHeight * maxRows;
        const minHeight = lineHeight * minRows;
        textarea.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`;
      }
    }, [value, autoResize, maxRows, minRows, textareaRef]);

    // Handle change with character count
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    // Character count warning (90% of max)
    const charWarning = maxLength && charCount >= maxLength * 0.9;
    const charError = maxLength && charCount >= maxLength;

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

        {/* Textarea container */}
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={autoResize ? minRows : rows}
            maxLength={maxLength}
            className={`
              ${fullWidth ? "w-full" : ""}
              ${sizeStyles[textareaSize]}
              ${stateStyles}
              ${resizeStyles[resize]}
              bg-[var(--color-bg-surface)]
              text-[var(--color-text-primary)]
              border-2
              rounded-lg
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              focus:ring-[var(--color-border-focus)]
              focus:ring-opacity-50
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:bg-[var(--color-bg-disabled)]
              placeholder:text-[var(--color-text-tertiary)]
              ${className}
            `}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            {...props}
          />

          {/* Error/Success icon */}
          {(error || success) && (
            <div
              className={`absolute right-3 top-3 ${
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

        {/* Helper text, error, or character count */}
        <div className="mt-2 flex justify-between items-start text-sm">
          {/* Left: Helper text or error */}
          <p
            className={`flex-1 ${
              error
                ? "text-[var(--color-error)]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {error || helperText}
          </p>

          {/* Right: Character count */}
          {showCharCount && maxLength && (
            <p
              className={`ml-2 ${
                charError
                  ? "text-[var(--color-error)]"
                  : charWarning
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-text-tertiary)]"
              }`}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
