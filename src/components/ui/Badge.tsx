/**
 * Badge/Tag Component
 * Uses design tokens for consistent styling
 * Variants: primary, success, warning, error, neutral
 */

import React, { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "neutral",
      size = "md",
      dot = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";

    // Variant styles using semantic color tokens
    const variantStyles: Record<BadgeVariant, string> = {
      primary:
        "bg-[var(--color-semantic-info-lightest)] text-[var(--color-semantic-info-dark)] border border-[var(--color-semantic-info-light)]",
      success:
        "bg-[var(--color-semantic-success-lightest)] text-[var(--color-semantic-success-dark)] border border-[var(--color-semantic-success-light)]",
      warning:
        "bg-[var(--color-semantic-warning-lightest)] text-[var(--color-semantic-warning-dark)] border border-[var(--color-semantic-warning-light)]",
      error:
        "bg-[var(--color-semantic-error-lightest)] text-[var(--color-semantic-error-dark)] border border-[var(--color-semantic-error-light)]",
      neutral:
        "bg-[var(--color-semantic-neutral-lightest)] text-[var(--color-semantic-neutral-darker)] border border-[var(--color-semantic-neutral-light)]",
      info: "bg-[var(--color-semantic-info-lightest)] text-[var(--color-semantic-info-dark)] border border-[var(--color-semantic-info-light)]",
    };

    // Size styles
    const sizeStyles: Record<BadgeSize, string> = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
      lg: "text-base px-3 py-1.5",
    };

    // Dot indicator using semantic colors
    const dotStyles: Record<BadgeVariant, string> = {
      primary: "bg-[var(--color-semantic-info-base)]",
      success: "bg-[var(--color-semantic-success-base)]",
      warning: "bg-[var(--color-semantic-warning-base)]",
      error: "bg-[var(--color-semantic-error-base)]",
      neutral: "bg-[var(--color-semantic-neutral-base)]",
      info: "bg-[var(--color-semantic-info-base)]",
    };

    const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`rounded-full ${dotSize} ${dotStyles[variant]}`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
