/**
 * Input Component with Focus States
 * Uses design tokens for consistency
 * Includes: focus rings, error states, helper text, icons
 */

"use client";

import React from "react";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
  /** Auto-select text on focus (useful for inline editing) */
  selectOnFocus?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success = false,
      leftIcon,
      rightIcon,
      inputSize = "md",
      fullWidth = false,
      selectOnFocus = false,
      className = "",
      type = "text",
      disabled,
      onFocus,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // Handle focus with optional text selection
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (selectOnFocus) {
        e.target.select();
      }
      onFocus?.(e);
    };

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

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={`
              ${fullWidth ? "w-full" : ""}
              ${sizeStyles[inputSize]}
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon || isPassword || error || success ? "pr-10" : ""}
              ${stateStyles}
              bg-[var(--color-bg-surface)]
              border
              rounded-[var(--radius-md)]
              text-[var(--color-text-primary)]
              placeholder:text-[var(--color-text-tertiary)]
              focus-ring
              smooth-transition
              disabled:opacity-60
              disabled:cursor-not-allowed
              disabled:bg-[var(--color-silver-200)]
              ${className}
            `}
            disabled={disabled}
            onFocus={handleFocus}
            {...props}
          />

          {/* Right icon / state indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && (
              <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
            )}
            {success && !error && (
              <Check className="w-5 h-5 text-[var(--color-success)]" />
            )}
            {rightIcon && !isPassword && !error && !success && (
              <div className="text-[var(--color-text-tertiary)]">
                {rightIcon}
              </div>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] smooth-transition focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p
            className={`
            text-sm mt-2
            ${error ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"}
          `}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Textarea Component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** Auto-select text on focus (useful for inline editing) */
  selectOnFocus?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      autoResize = false,
      selectOnFocus = false,
      className = "",
      disabled,
      onFocus,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Handle focus with optional text selection
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (selectOnFocus) {
        e.target.select();
      }
      onFocus?.(e);
    };

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize, props.value]);

    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mb-2">
            {label}
            {props.required && (
              <span className="text-[var(--color-error)] ml-1">*</span>
            )}
          </label>
        )}

        <textarea
          ref={textareaRef}
          className={`
            ${fullWidth ? "w-full" : ""}
            ${stateStyles}
            min-h-[100px]
            px-4 py-3
            bg-[var(--color-bg-surface)]
            border
            rounded-[var(--radius-md)]
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-tertiary)]
            focus-ring
            smooth-transition
            disabled:opacity-60
            disabled:cursor-not-allowed
            disabled:bg-[var(--color-silver-200)]
            resize-${autoResize ? "none" : "vertical"}
            ${className}
          `}
          disabled={disabled}
          onFocus={handleFocus}
          {...props}
        />

        {(helperText || error) && (
          <p
            className={`
            text-sm mt-2
            ${error ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"}
          `}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

/**
 * Select Component
 */
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      options,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="block text-sm font-[var(--font-weight-medium)] text-[var(--color-text-primary)] mb-2">
            {label}
            {props.required && (
              <span className="text-[var(--color-error)] ml-1">*</span>
            )}
          </label>
        )}

        <select
          ref={ref}
          className={`
            ${fullWidth ? "w-full" : ""}
            ${stateStyles}
            h-11 px-4
            bg-[var(--color-bg-surface)]
            border
            rounded-[var(--radius-md)]
            text-[var(--color-text-primary)]
            focus-ring
            smooth-transition
            disabled:opacity-60
            disabled:cursor-not-allowed
            disabled:bg-[var(--color-silver-200)]
            ${className}
          `}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(helperText || error) && (
          <p
            className={`
            text-sm mt-2
            ${error ? "text-[var(--color-error)]" : "text-[var(--color-text-secondary)]"}
          `}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
