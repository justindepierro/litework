/**
 * Card Component with Hover Effects
 * Uses design tokens for consistency
 * Includes: subtle lift, shadow expansion, smooth transitions
 * Enhanced with Framer Motion for magnetic hover effects
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Body,
  BodyVariant,
  Display,
  DisplayVariant,
  Heading,
} from "./Typography";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const mergeStyles = (
  ...styles: Array<React.CSSProperties | undefined>
): React.CSSProperties => Object.assign({}, ...styles.filter(Boolean));

export type CardVariant =
  | "default"
  | "elevated"
  | "flat"
  | "bordered"
  | "interactive"
  | "hero";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";
export type EnergySurface =
  | "strength"
  | "recovery"
  | "speed"
  | "mobility"
  | "focus";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Enable hover effects */
  hoverable?: boolean;
  /** Make card interactive (cursor pointer) */
  interactive?: boolean;
  /** Apply energetic gradient surface */
  surface?: EnergySurface;
  /** Custom className */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

const variantVisuals: Record<
  CardVariant,
  { className: string; style?: React.CSSProperties }
> = {
  default: {
    className: "border shadow-[var(--elevation-1)]",
    style: {
      background: "var(--color-bg-surface)",
      borderColor: "var(--color-border-primary)",
    },
  },
  elevated: {
    className: "border shadow-[var(--elevation-2)]",
    style: {
      background: "var(--color-bg-surface)",
      borderColor: "var(--color-border-primary)",
    },
  },
  flat: {
    className: "border-0 shadow-none",
    style: {
      background: "var(--color-bg-surface)",
    },
  },
  bordered: {
    className: "border-2",
    style: {
      background: "var(--color-bg-surface)",
      borderColor: "var(--color-border-secondary)",
    },
  },
  interactive: {
    className:
      "border shadow-[var(--elevation-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] focus-within:ring-1 focus-within:ring-(--color-border-accent)",
    style: {
      background: "var(--color-bg-surface)",
      borderColor: "var(--color-border-primary)",
    },
  },
  hero: {
    className: "border shadow-[var(--elevation-2)]",
    style: {
      background: "var(--surface-strength-bg)",
      color: "var(--surface-strength-foreground)",
      borderColor: "transparent",
    },
  },
};

const surfaceVisuals: Record<EnergySurface, React.CSSProperties> = {
  strength: {
    background: "var(--surface-strength-bg)",
    color: "var(--surface-strength-foreground)",
    borderColor: "transparent",
    boxShadow: "var(--elevation-3)",
  },
  recovery: {
    background: "var(--surface-recovery-bg)",
    color: "var(--surface-recovery-foreground)",
    borderColor: "transparent",
    boxShadow: "var(--elevation-3)",
  },
  speed: {
    background: "var(--surface-speed-bg)",
    color: "var(--surface-speed-foreground)",
    borderColor: "transparent",
    boxShadow: "var(--elevation-3)",
  },
  mobility: {
    background: "var(--surface-mobility-bg)",
    color: "var(--surface-mobility-foreground)",
    borderColor: "transparent",
    boxShadow: "var(--elevation-3)",
  },
  focus: {
    background: "var(--surface-focus-bg)",
    color: "var(--surface-focus-foreground)",
    borderColor: "transparent",
    boxShadow: "var(--elevation-3)",
  },
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      hoverable = false,
      interactive = false,
      surface,
      className = "",
      style,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...restProps
    },
    ref
  ) => {
    const variantVisual = variantVisuals[variant];
    const surfaceStyle = surface
      ? surfaceVisuals[surface]
      : variant === "hero"
        ? surfaceVisuals.strength
        : undefined;

    // Padding styles
    const paddingStyles: Record<CardPadding, string> = {
      none: "",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-5",
      lg: "p-5 sm:p-6",
      xl: "p-6 sm:p-8",
    };

    const hoverClasses = hoverable
      ? "hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] active:translate-y-0 active:shadow-[var(--elevation-1)]"
      : undefined;

    const combinedClasses = cx(
      "rounded-[var(--radius-lg)] smooth-transition",
      interactive && "cursor-pointer",
      variantVisual.className,
      paddingStyles[padding],
      hoverClasses,
      className
    );

    const combinedStyle = mergeStyles(variantVisual.style, surfaceStyle, style);

    // Use motion for interactive/hoverable cards
    if (interactive || hoverable) {
      return (
        <motion.div
          ref={ref}
          className={combinedClasses}
          style={combinedStyle}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          whileHover={{
            y: -4,
            scale: 1.01,
            transition: { type: "spring", stiffness: 300, damping: 20 },
          }}
          whileTap={{
            scale: 0.98,
            transition: { type: "spring", stiffness: 400, damping: 17 },
          }}
          {...Object.fromEntries(
            Object.entries(restProps).filter(
              ([key]) =>
                !key.startsWith("onAnimation") &&
                !key.startsWith("onDrag") &&
                !key.startsWith("while") &&
                !key.startsWith("animate")
            )
          )}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={combinedClasses}
        style={combinedStyle}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = "",
}) => {
  return (
    <div
      className={cx("flex items-start justify-between gap-4 mb-4", className)}
    >
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="text-(--color-text-accent)">{icon}</div>}
        <div className="flex-1 min-w-0">
          <Heading level="h4" className="truncate">
            {title}
          </Heading>
          {subtitle && (
            <Body size="sm" variant="secondary" className="mt-0.5">
              {subtitle}
            </Body>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

CardHeader.displayName = "CardHeader";

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cx("mt-4 pt-4 border-t", className)}
      style={{ borderColor: "var(--color-border-primary)" }}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = "CardFooter";

/**
 * Stat Card Component - For dashboard statistics
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  trend,
  className = "",
  onClick,
}) => {
  const trendSurfaceMap: Record<
    NonNullable<StatCardProps["trend"]>,
    EnergySurface
  > = {
    up: "strength",
    down: "focus",
    neutral: "recovery",
  };

  const surface = trend ? trendSurfaceMap[trend] : undefined;
  const textVariant = surface ? "inverse" : ("primary" as const);
  const secondaryVariant = surface ? "inverse" : ("secondary" as const);
  const changeColorTokens = {
    increase: "var(--color-success)",
    decrease: "var(--color-error)",
    neutral: surface
      ? "var(--color-text-inverse)"
      : "var(--color-text-tertiary)",
  } as const;

  return (
    <Card
      variant="default"
      padding="md"
      hoverable={!!onClick}
      interactive={!!onClick}
      onClick={onClick}
      surface={surface}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Body
            size="sm"
            variant={secondaryVariant as BodyVariant}
            className="mb-1"
          >
            {label}
          </Body>
          <Display size="md" variant={textVariant as DisplayVariant} as="p">
            {value}
          </Display>
          {change && (
            <Body
              as="p"
              size="sm"
              className="mt-2 flex items-center gap-1"
              style={{ color: changeColorTokens[change.type] }}
            >
              {change.type === "increase" && "↑"}
              {change.type === "decrease" && "↓"}
              <span>{change.value}</span>
            </Body>
          )}
        </div>
        {icon && (
          <div
            className="opacity-80"
            style={{ color: "var(--color-accent-orange)" }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

StatCard.displayName = "StatCard";

/**
 * Interactive Card Component - For list items
 */
export interface InteractiveCardProps extends CardProps {
  /** Show chevron/arrow */
  showArrow?: boolean;
  /** Badge or label */
  badge?: React.ReactNode;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  showArrow = false,
  badge,
  children,
  className = "",
  ...props
}) => {
  return (
    <Card hoverable interactive className={`relative ${className}`} {...props}>
      {badge && <div className="absolute top-4 right-4">{badge}</div>}
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {showArrow && (
          <svg
            className="w-5 h-5 text-(--color-text-tertiary) shrink-0 ml-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </Card>
  );
};

InteractiveCard.displayName = "InteractiveCard";
