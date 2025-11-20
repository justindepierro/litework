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
    className: "border shadow-[var(--elevation-1)] bg-surface border-primary",
    style: {},
  },
  elevated: {
    className: "border shadow-[var(--elevation-2)] bg-surface border-primary",
    style: {},
  },
  flat: {
    className: "border-0 shadow-none bg-surface",
    style: {},
  },
  bordered: {
    className: "border-2 bg-surface border-secondary",
    style: {},
  },
  interactive: {
    className:
      "border shadow-[var(--elevation-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] focus-within:ring-1 focus-within:ring-(--color-border-accent) bg-surface border-primary",
    style: {},
  },
  hero: {
    className: "border shadow-xl",
    style: {
      background:
        "linear-gradient(135deg, var(--color-accent-green-500), var(--color-accent-emerald-600))",
      color: "white",
      borderColor: "transparent",
    },
  },
};

// Modern gradient surface visuals - using OKLCH accent colors
const surfaceVisuals: Record<EnergySurface, React.CSSProperties> = {
  strength: {
    background:
      "linear-gradient(135deg, var(--color-accent-green-500), var(--color-accent-emerald-600))",
    color: "white",
    borderColor: "transparent",
    boxShadow:
      "0 10px 25px -5px rgba(var(--color-accent-green-500-rgb, 34, 197, 94), 0.3)",
  },
  recovery: {
    background:
      "linear-gradient(135deg, var(--color-accent-purple-500), var(--color-accent-pink-600))",
    color: "white",
    borderColor: "transparent",
    boxShadow:
      "0 10px 25px -5px rgba(var(--color-accent-purple-500-rgb, 168, 85, 247), 0.3)",
  },
  speed: {
    background:
      "linear-gradient(135deg, var(--color-accent-red-500), var(--color-accent-orange-600))",
    color: "white",
    borderColor: "transparent",
    boxShadow:
      "0 10px 25px -5px rgba(var(--color-accent-red-500-rgb, 239, 68, 68), 0.3)",
  },
  mobility: {
    background:
      "linear-gradient(135deg, var(--color-accent-cyan-500), var(--color-accent-blue-600))",
    color: "white",
    borderColor: "transparent",
    boxShadow:
      "0 10px 25px -5px rgba(var(--color-accent-cyan-500-rgb, 6, 182, 212), 0.3)",
  },
  focus: {
    background:
      "linear-gradient(135deg, var(--color-accent-blue-500), var(--color-accent-indigo-600))",
    color: "white",
    borderColor: "transparent",
    boxShadow:
      "0 10px 25px -5px rgba(var(--color-accent-blue-500-rgb, 59, 130, 246), 0.3)",
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
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="text-(--color-text-accent) shrink-0">{icon}</div>
        )}
        <div className="flex-1 min-w-0">
          <Heading level="h4" className="truncate">
            {title}
          </Heading>
          {subtitle && (
            <Body size="sm" variant="secondary" className="mt-0.5 line-clamp-2">
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

  // Vibrant gradient backgrounds for each trend
  const trendGradientMap = {
    up: "bg-linear-to-br from-accent-green-500 to-accent-emerald-600",
    down: "bg-linear-to-br from-accent-blue-500 to-accent-indigo-600",
    neutral: "bg-linear-to-br from-accent-purple-500 to-accent-pink-600",
  };

  const surface = trend ? trendSurfaceMap[trend] : undefined;
  const gradient = trend ? trendGradientMap[trend] : undefined;
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
      className={`relative overflow-hidden glass-thick backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      {/* Gradient Accent Overlay */}
      {gradient && (
        <div className={`absolute inset-0 ${gradient} opacity-90`} />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <Body
            size="sm"
            variant={secondaryVariant as BodyVariant}
            className="mb-1 opacity-90"
          >
            {label}
          </Body>
          <Display
            size="md"
            variant={textVariant as DisplayVariant}
            as="p"
            className="font-bold"
          >
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
            className="opacity-90 drop-shadow-lg"
            style={{
              color: trend ? "white" : "var(--color-accent-orange-500)",
            }}
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
      {badge && <div className="absolute top-4 right-4 z-10">{badge}</div>}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">{children}</div>
        {showArrow && (
          <svg
            className="w-5 h-5 text-(--color-text-tertiary) shrink-0"
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
