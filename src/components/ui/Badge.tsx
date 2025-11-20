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
  | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: ReactNode;
}

const variantTokens: Record<
  BadgeVariant,
  {
    background: string;
    color: string;
    border: string;
    dot: string;
  }
> = {
  primary: {
    background: "var(--color-accent-blue-100)",
    color: "var(--color-accent-blue-700)",
    border: "var(--color-accent-blue-300)",
    dot: "var(--color-accent-blue-500)",
  },
  success: {
    background: "var(--color-accent-green-100)",
    color: "var(--color-accent-green-700)",
    border: "var(--color-accent-green-300)",
    dot: "var(--color-accent-green-500)",
  },
  warning: {
    background: "var(--color-accent-amber-100)",
    color: "var(--color-accent-amber-700)",
    border: "var(--color-accent-amber-300)",
    dot: "var(--color-accent-amber-500)",
  },
  error: {
    background: "var(--color-accent-red-100)",
    color: "var(--color-accent-red-700)",
    border: "var(--color-accent-red-300)",
    dot: "var(--color-accent-red-500)",
  },
  neutral: {
    background: "var(--color-neutral-lighter)",
    color: "var(--color-navy-700)",
    border: "var(--color-neutral-light)",
    dot: "var(--color-neutral)",
  },
  info: {
    background: "var(--color-accent-cyan-100)",
    color: "var(--color-accent-cyan-700)",
    border: "var(--color-accent-cyan-300)",
    dot: "var(--color-accent-cyan-500)",
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
      className = "",
      style,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
          className
        )}
        style={mergeStyles(
          {
            background: variantTokens[variant].background,
            color: variantTokens[variant].color,
            borderColor: variantTokens[variant].border,
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
            className="rounded-full"
            style={{
              background: variantTokens[variant].dot,
              width: size === "sm" ? "0.375rem" : "0.5rem",
              height: size === "sm" ? "0.375rem" : "0.5rem",
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
