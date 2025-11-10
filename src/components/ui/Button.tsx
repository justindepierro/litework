/**
 * Polished Button Component with Micro-Interactions
 * Uses design tokens for consistency
 * Includes: hover lift, active press, ripple effect, loading states
 */

"use client";

import React, { memo, useRef, useState  } from "react";
import { Loader2, Check } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  showSuccessState?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      showSuccessState = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<
      Array<{ x: number; y: number; id: number }>
    >([]);

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!);

    // Ripple effect on click
    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) =>
          prev.filter((ripple) => ripple.id !== newRipple.id)
        );
      }, 600);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        createRipple(event);
        onClick?.(event);
      }
    };

    // Base styles using design tokens
    const baseStyles = `
      relative
      inline-flex items-center justify-center gap-2
      font-medium
      rounded-lg
      focus-ring
      smooth-transition
      overflow-hidden
      touch-manipulation
      ${fullWidth ? "w-full" : ""}
      ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
    `;

    // Variant styles using design tokens
    const variantStyles: Record<ButtonVariant, string> = {
      primary: `
        bg-[var(--color-accent-orange)]
        text-[var(--color-text-inverse)]
        border border-[var(--color-accent-orange)]
        shadow-[var(--elevation-1)]
        ${!disabled && !isLoading ? "hover:bg-[#e55a2b] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:translate-y-0" : ""}
      `,
      secondary: `
        bg-[var(--color-silver-200)]
        text-[var(--color-navy-800)]
        border-2 border-[var(--color-border-secondary)]
        ${!disabled && !isLoading ? "hover:bg-[var(--color-silver-300)] hover:border-[var(--color-navy-400)] hover:-translate-y-0.5 active:translate-y-0" : ""}
      `,
      danger: `
        bg-[var(--color-error)]
        text-[var(--color-text-inverse)]
        border border-[var(--color-error)]
        shadow-[var(--elevation-1)]
        ${!disabled && !isLoading ? "hover:bg-[#dc2626] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:translate-y-0" : ""}
      `,
      ghost: `
        bg-transparent
        text-[var(--color-text-primary)]
        border border-transparent
        ${!disabled && !isLoading ? "hover:bg-[var(--color-silver-200)] hover:text-[var(--color-navy-900)] active:bg-[var(--color-silver-300)]" : ""}
      `,
      success: `
        bg-[var(--color-success)]
        text-[var(--color-text-inverse)]
        border border-[var(--color-success)]
        shadow-[var(--elevation-1)]
        ${!disabled && !isLoading ? "hover:bg-[#00b894] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 active:translate-y-0" : ""}
      `,
    };

    // Size styles using design tokens
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-base min-h-[44px]",
      lg: "px-6 py-3 text-lg min-h-[52px]",
    };

    // Success state content
    if (showSuccessState) {
      return (
        <button
          ref={buttonRef}
          className={`${baseStyles} ${variantStyles.success} ${sizeStyles[size]} ${className}`}
          disabled={true}
          {...props}
        >
          <Check className="w-5 h-5 animate-success" />
          <span>Saved!</span>
        </button>
      );
    }

    // Loading state content
    const content = isLoading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{loadingText || "Loading..."}</span>
      </>
    ) : (
      <>
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </>
    );

    return (
      <button
        ref={buttonRef}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_600ms_ease-out]"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "100px",
              height: "100px",
            }}
          />
        ))}

        {/* Button content */}
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * Icon Button - Circular button for icons only
 */
export interface IconButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "md", className = "", ...props }, ref) => {
    const sizeClasses: Record<ButtonSize, string> = {
      sm: "w-9 h-9 p-2",
      md: "w-11 h-11 p-2.5",
      lg: "w-13 h-13 p-3",
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={`${sizeClasses[size]} !min-h-0 rounded-full ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

/**
 * Button Group - For grouped buttons
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = "",
  orientation = "horizontal",
}) => {
  return (
    <div
      className={`
        inline-flex
        ${orientation === "horizontal" ? "flex-row" : "flex-col"}
        ${orientation === "horizontal" ? "[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg" : "[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg"}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

ButtonGroup.displayName = "ButtonGroup";
