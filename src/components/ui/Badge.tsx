/**
 * Badge/Tag Component
 * Uses design tokens for consistent styling
 * Variants: primary, success, warning, error, neutral
 */

import React, { HTMLAttributes, ReactNode } from "react";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const mergeStyles = (
  ...styles: Array<React.CSSProperties | undefined>
): React.CSSProperties => Object.assign({}, ...styles.filter(Boolean));

export type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "info"
  | "purple"
  | "orange"
  | "pink"
  | "emerald";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
  /** Use gradient background for more visual pop */
  gradient?: boolean;
}

const variantTokens: Record<
  BadgeVariant,
  {
    background: string;
    color: string;
    border: string;
    dot: string;
    gradientFrom?: string;
    gradientTo?: string;
  }
> = {
  primary: {
    background: "var(--color-accent-blue-100)",
    color: "var(--color-accent-blue-800)",
    border: "var(--color-accent-blue-300)",
    dot: "var(--color-accent-blue-600)",
    gradientFrom: "var(--color-accent-blue-500)",
    gradientTo: "var(--color-accent-blue-600)",
  },
  success: {
    background: "var(--color-accent-green-100)",
    color: "var(--color-accent-green-800)",
    border: "var(--color-accent-green-300)",
    dot: "var(--color-accent-green-600)",
    gradientFrom: "var(--color-accent-green-500)",
    gradientTo: "var(--color-accent-green-600)",
  },
  warning: {
    background: "var(--color-accent-amber-100)",
    color: "var(--color-accent-amber-900)",
    border: "var(--color-accent-amber-300)",
    dot: "var(--color-accent-amber-600)",
    gradientFrom: "var(--color-accent-amber-500)",
    gradientTo: "var(--color-accent-orange-500)",
  },
  error: {
    background: "var(--color-accent-red-100)",
    color: "var(--color-accent-red-800)",
    border: "var(--color-accent-red-300)",
    dot: "var(--color-accent-red-600)",
    gradientFrom: "var(--color-accent-red-500)",
    gradientTo: "var(--color-accent-red-600)",
  },
  neutral: {
    background: "var(--color-neutral-lighter)",
    color: "var(--color-navy-700)",
    border: "var(--color-neutral-light)",
    dot: "var(--color-neutral)",
  },
  info: {
    background: "var(--color-accent-cyan-100)",
    color: "var(--color-accent-cyan-800)",
    border: "var(--color-accent-cyan-300)",
    dot: "var(--color-accent-cyan-600)",
    gradientFrom: "var(--color-accent-cyan-500)",
    gradientTo: "var(--color-accent-blue-500)",
  },
  purple: {
    background: "var(--color-accent-purple-100)",
    color: "var(--color-accent-purple-800)",
    border: "var(--color-accent-purple-300)",
    dot: "var(--color-accent-purple-600)",
    gradientFrom: "var(--color-accent-purple-500)",
    gradientTo: "var(--color-accent-purple-600)",
  },
  orange: {
    background: "var(--color-accent-orange-100)",
    color: "var(--color-accent-orange-900)",
    border: "var(--color-accent-orange-300)",
    dot: "var(--color-accent-orange-600)",
    gradientFrom: "var(--color-accent-orange-500)",
    gradientTo: "var(--color-accent-orange-600)",
  },
  pink: {
    background: "var(--color-accent-pink-100)",
    color: "var(--color-accent-pink-800)",
    border: "var(--color-accent-pink-300)",
    dot: "var(--color-accent-pink-600)",
    gradientFrom: "var(--color-accent-pink-500)",
    gradientTo: "var(--color-accent-pink-600)",
  },
  emerald: {
    background: "var(--color-accent-emerald-100)",
    color: "var(--color-accent-emerald-800)",
    border: "var(--color-accent-emerald-300)",
    dot: "var(--color-accent-emerald-600)",
    gradientFrom: "var(--color-accent-emerald-500)",
    gradientTo: "var(--color-accent-emerald-600)",
  },
};

const sizeMetrics: Record<
  BadgeSize,
  {
    fontSize: string;
    paddingInline: string;
    paddingBlock: string;
  }
> = {
  sm: {
    fontSize: "var(--font-size-xs)",
    paddingInline: "var(--spacing-2)",
    paddingBlock: "var(--spacing-1)",
  },
  md: {
    fontSize: "var(--font-size-sm)",
    paddingInline: "var(--spacing-2-5)",
    paddingBlock: "var(--spacing-1-5)",
  },
  lg: {
    fontSize: "var(--font-size-base)",
    paddingInline: "var(--spacing-3)",
    paddingBlock: "var(--spacing-2)",
  },
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "neutral",
      size = "md",
      dot = false,
      gradient = false,
      className = "",
      style,
      children,
      ...props
    },
    ref
  ) => {
    const tokens = variantTokens[variant];
    const useGradient = gradient && tokens.gradientFrom && tokens.gradientTo;

    return (
      <span
        ref={ref}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
          useGradient && "shadow-sm hover:shadow-md",
          className
        )}
        style={mergeStyles(
          {
            background: useGradient
              ? `linear-gradient(135deg, ${tokens.gradientFrom}, ${tokens.gradientTo})`
              : tokens.background,
            color: useGradient ? "#ffffff" : tokens.color,
            borderColor: useGradient ? "transparent" : tokens.border,
            fontSize: sizeMetrics[size].fontSize,
            paddingInline: sizeMetrics[size].paddingInline,
            paddingBlock: sizeMetrics[size].paddingBlock,
            lineHeight: "var(--line-height-tight)",
          },
          style
        )}
        {...props}
      >
        {dot && (
          <span
            className="rounded-full animate-pulse"
            style={{
              background: useGradient ? "#ffffff" : tokens.dot,
              width: size === "sm" ? "0.375rem" : "0.5rem",
              height: size === "sm" ? "0.375rem" : "0.5rem",
              boxShadow: useGradient ? "0 0 4px rgba(255,255,255,0.5)" : "none",
            }}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
