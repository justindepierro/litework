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
    background: "var(--color-info-lightest)",
    color: "var(--color-info-dark)",
    border: "var(--color-info-light)",
    dot: "var(--color-info)",
  },
  success: {
    background: "var(--color-success-lightest)",
    color: "var(--color-success-dark)",
    border: "var(--color-success-light)",
    dot: "var(--color-success)",
  },
  warning: {
    background: "var(--color-warning-lightest)",
    color: "var(--color-warning-dark)",
    border: "var(--color-warning-light)",
    dot: "var(--color-warning)",
  },
  error: {
    background: "var(--color-error-lightest)",
    color: "var(--color-error-dark)",
    border: "var(--color-error-light)",
    dot: "var(--color-error)",
  },
  neutral: {
    background: "var(--color-neutral-lightest)",
    color: "var(--color-neutral-darker)",
    border: "var(--color-neutral-light)",
    dot: "var(--color-neutral)",
  },
  info: {
    background: "var(--color-info-lightest)",
    color: "var(--color-info-dark)",
    border: "var(--color-info-light)",
    dot: "var(--color-info)",
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
