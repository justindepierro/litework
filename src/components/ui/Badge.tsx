/**
 * Badge/Tag Component
 * Uses design tokens for consistent styling
 * Variants: primary, success, warning, error, neutral
 */

import React, { memo, HTMLAttributes, ReactNode  } from "react";

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

    // Variant styles
    const variantStyles: Record<BadgeVariant, string> = {
      primary:
        "bg-accent-blue/10 text-accent-blue border border-accent-blue/20",
      success:
        "bg-accent-green/10 text-accent-green border border-accent-green/20",
      warning:
        "bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20",
      error: "bg-accent-red/10 text-accent-red border border-accent-red/20",
      neutral: "bg-silver-300 text-silver-800 border border-silver-400",
      info: "bg-info-lighter text-info-dark border border-info-light",
    };

    // Size styles
    const sizeStyles: Record<BadgeSize, string> = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
      lg: "text-base px-3 py-1.5",
    };

    // Dot indicator
    const dotStyles: Record<BadgeVariant, string> = {
      primary: "bg-accent-blue",
      success: "bg-accent-green",
      warning: "bg-accent-yellow",
      error: "bg-accent-red",
      neutral: "bg-silver-600",
      info: "bg-info",
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
