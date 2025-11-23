/**
 * StatCard Component
 *
 * A reusable card component for displaying statistics with optional trend indicators.
 * Provides consistent styling and structure for stat displays across the application.
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Workouts"
 *   value={127}
 *   icon={<Dumbbell className="w-5 h-5" />}
 *   trend={{ value: 12, direction: 'up' }}
 *   variant="primary"
 * />
 * ```
 */

import React from "react";
import { Body, Heading } from "./Typography";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  /** The main value to display (number or string) */
  value: string | number;

  /** Label describing the statistic */
  label: string;

  /** Optional icon to display (usually from lucide-react) */
  icon?: React.ReactNode;

  /** Optional trend indicator showing change */
  trend?: {
    /** Percentage or absolute value change */
    value: number;
    /** Direction of trend */
    direction: "up" | "down" | "neutral";
    /** Optional label for trend (e.g., "vs last week") */
    label?: string;
  };

  /** Visual variant affecting accent color */
  variant?: "default" | "primary" | "success" | "warning" | "accent";

  /** Additional CSS classes */
  className?: string;

  /** Optional subtitle text */
  subtitle?: string;

  /** Display size of the card */
  size?: "sm" | "md" | "lg";
}

/**
 * StatCard Component
 *
 * Displays a statistic with consistent styling, optional icon, and trend indicator.
 */
export function StatCard({
  value,
  label,
  icon,
  trend,
  variant = "default",
  className = "",
  subtitle,
  size = "md",
}: StatCardProps) {
  // Variant-specific colors
  const variantColors = {
    default: {
      iconBg: "bg-primary-light",
      iconColor: "text-primary",
      valueColor: "text-heading-primary",
    },
    primary: {
      iconBg: "bg-primary-light",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    success: {
      iconBg: "bg-(--status-success-light)",
      iconColor: "text-(--status-success)",
      valueColor: "text-(--status-success)",
    },
    warning: {
      iconBg: "bg-(--status-warning-light)",
      iconColor: "text-(--status-warning)",
      valueColor: "text-(--status-warning)",
    },
    accent: {
      iconBg: "bg-accent-light",
      iconColor: "text-accent",
      valueColor: "text-accent",
    },
  };

  // Size-specific styling
  const sizeStyles = {
    sm: {
      padding: "p-3",
      iconSize: "w-8 h-8",
      valueText: "text-xl",
      gap: "gap-2",
    },
    md: {
      padding: "p-4",
      iconSize: "w-10 h-10",
      valueText: "text-2xl",
      gap: "gap-3",
    },
    lg: {
      padding: "p-6",
      iconSize: "w-12 h-12",
      valueText: "text-3xl",
      gap: "gap-4",
    },
  };

  const colors = variantColors[variant];
  const sizes = sizeStyles[size];

  // Trend styling
  const trendColors = {
    up: "text-(--status-success)",
    down: "text-(--status-error)",
    neutral: "text-(--text-tertiary)",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${sizes.padding} ${className}`}
    >
      {/* Icon and Label Header */}
      {icon && (
        <div className={`flex items-center ${sizes.gap} mb-4`}>
          <div
            className={`${sizes.iconSize} ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
          >
            <div className={colors.iconColor}>{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <Body variant="secondary" className="text-sm">
              {label}
            </Body>
            {subtitle && (
              <Body variant="secondary" className="text-xs mt-0.5">
                {subtitle}
              </Body>
            )}
          </div>
        </div>
      )}

      {/* Label only (no icon) */}
      {!icon && (
        <Body variant="secondary" className="text-sm mb-2">
          {label}
        </Body>
      )}

      {/* Value */}
      <Heading
        level="h4"
        className={`${sizes.valueText} font-bold ${colors.valueColor} mb-2`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Heading>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          {trend.direction === "up" && (
            <TrendingUp className="w-4 h-4 text-(--status-success)" />
          )}
          {trend.direction === "down" && (
            <TrendingDown className="w-4 h-4 text-(--status-error)" />
          )}
          <span className={`font-medium ${trendColors[trend.direction]}`}>
            {trend.direction === "up" ? "+" : ""}
            {trend.value}
            {typeof trend.value === "number" && "%"}
          </span>
          {trend.label && (
            <Body variant="secondary" className="text-xs">
              {trend.label}
            </Body>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * StatCardGrid Component
 *
 * A responsive grid container for displaying multiple StatCards.
 * Automatically handles responsive layout.
 */
export function StatCardGrid({
  children,
  columns = 4,
  className = "",
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
