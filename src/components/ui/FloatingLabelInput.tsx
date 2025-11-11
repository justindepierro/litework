/**
 * FloatingLabelInput Component
 * Material Design-style floating label input with smooth animations
 * Uses Framer Motion for label transitions
 */

"use client";

import React, { useState, useId } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";

export interface FloatingLabelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Input label (floats on focus/value) */
  label: string;
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
}

export const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
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
      className = "",
      type = "text",
      disabled,
      value,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputId = useId();

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // Check if label should be floating
    const hasValue =
      value !== undefined && value !== null && value !== "" ||
      props.defaultValue !== undefined;
    const isFloating = isFocused || hasValue;

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Size styles
    const sizeStyles = {
      sm: "h-12 px-3 text-sm pt-5 pb-1",
      md: "h-14 px-4 text-base pt-6 pb-2",
      lg: "h-16 px-5 text-lg pt-7 pb-2",
    };

    const labelSizeStyles = {
      sm: { floating: "text-xs top-1.5", default: "text-sm top-3" },
      md: { floating: "text-xs top-2", default: "text-base top-4" },
      lg: { floating: "text-sm top-2.5", default: "text-lg top-5" },
    };

    // State colors
    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : success
        ? "border-[var(--color-success)] focus:border-[var(--color-success)]"
        : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    const labelColor = error
      ? "text-[var(--color-error)]"
      : isFocused
        ? "text-[var(--color-primary)]"
        : "text-[var(--color-text-tertiary)]";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={value}
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
              focus-ring
              smooth-transition
              disabled:opacity-60
              disabled:cursor-not-allowed
              disabled:bg-[var(--color-silver-200)]
              ${className}
            `}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="" // No placeholder, label acts as placeholder
            {...props}
          />

          {/* Floating label */}
          <motion.label
            htmlFor={inputId}
            className={`
              absolute
              ${leftIcon ? "left-10" : "left-4"}
              pointer-events-none
              origin-left
              ${labelColor}
              smooth-transition
              font-[var(--font-weight-medium)]
            `}
            animate={{
              y: isFloating ? -8 : 0,
              scale: isFloating ? 0.85 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{
              top: isFloating
                ? labelSizeStyles[inputSize].floating.split(" ")[1]
                : labelSizeStyles[inputSize].default.split(" ")[1],
            }}
          >
            {label}
            {props.required && (
              <span className="text-[var(--color-error)] ml-1">*</span>
            )}
          </motion.label>

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
                aria-label={showPassword ? "Hide password" : "Show password"}
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

FloatingLabelInput.displayName = "FloatingLabelInput";

/**
 * FloatingLabelTextarea Component
 */
export interface FloatingLabelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  /** Auto-resize based on content */
  autoResize?: boolean;
}

export const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      autoResize = false,
      className = "",
      disabled,
      value,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const inputId = useId();

    // Check if label should be floating
    const hasValue =
      value !== undefined && value !== null && value !== "" ||
      props.defaultValue !== undefined;
    const isFloating = isFocused || hasValue;

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Auto-resize functionality
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    // Combine refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // State colors
    const stateStyles = error
      ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
      : "border-[var(--color-border-primary)] focus:border-[var(--color-border-focus)]";

    const labelColor = error
      ? "text-[var(--color-error)]"
      : isFocused
        ? "text-[var(--color-primary)]"
        : "text-[var(--color-text-tertiary)]";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {/* Textarea container */}
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={setRefs}
            id={inputId}
            value={value}
            className={`
              ${fullWidth ? "w-full" : ""}
              min-h-[120px]
              px-4 pt-6 pb-2
              ${stateStyles}
              bg-[var(--color-bg-surface)]
              border
              rounded-[var(--radius-md)]
              text-[var(--color-text-primary)]
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
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="" // No placeholder, label acts as placeholder
            {...props}
          />

          {/* Floating label */}
          <motion.label
            htmlFor={inputId}
            className={`
              absolute left-4 top-2
              pointer-events-none
              origin-left
              ${labelColor}
              smooth-transition
              font-[var(--font-weight-medium)]
              text-xs
            `}
            animate={{
              y: isFloating ? 0 : 12,
              scale: isFloating ? 0.85 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            {label}
            {props.required && (
              <span className="text-[var(--color-error)] ml-1">*</span>
            )}
          </motion.label>
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

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";
