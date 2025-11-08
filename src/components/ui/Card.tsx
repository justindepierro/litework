/**
 * Card Component with Hover Effects
 * Uses design tokens for consistency
 * Includes: subtle lift, shadow expansion, smooth transitions
 */

"use client";

import React from "react";

export type CardVariant = "default" | "elevated" | "flat" | "bordered";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Enable hover effects */
  hoverable?: boolean;
  /** Make card interactive (cursor pointer) */
  interactive?: boolean;
  /** Custom className */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      hoverable = false,
      interactive = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // Base styles using design tokens
    const baseStyles = `
      rounded-[var(--radius-lg)]
      smooth-transition
      ${interactive ? "cursor-pointer" : ""}
    `;

    // Variant styles
    const variantStyles: Record<CardVariant, string> = {
      default: `
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border-primary)]
        shadow-[var(--elevation-1)]
      `,
      elevated: `
        bg-[var(--color-bg-surface)]
        border border-[var(--color-border-primary)]
        shadow-[var(--elevation-2)]
      `,
      flat: `
        bg-[var(--color-bg-surface)]
        border-0
      `,
      bordered: `
        bg-[var(--color-bg-surface)]
        border-2 border-[var(--color-border-secondary)]
      `,
    };

    // Padding styles
    const paddingStyles: Record<CardPadding, string> = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    // Hover effects
    const hoverStyles = hoverable
      ? `
      hover:-translate-y-0.5
      hover:shadow-[var(--elevation-2)]
      active:translate-y-0
      active:shadow-[var(--elevation-1)]
    `
      : "";

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
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
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className="text-[var(--color-accent-orange)]">{icon}</div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="ml-4">{action}</div>}
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
      className={`
      mt-4 pt-4
      border-t border-[var(--color-border-primary)]
      ${className}
    `}
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
  const changeColors = {
    increase: "text-[var(--color-success)]",
    decrease: "text-[var(--color-error)]",
    neutral: "text-[var(--color-text-tertiary)]",
  };

  return (
    <Card
      variant="default"
      padding="md"
      hoverable={!!onClick}
      interactive={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            {label}
          </p>
          <p className="text-3xl font-[var(--font-weight-bold)] text-[var(--color-text-primary)]">
            {value}
          </p>
          {change && (
            <p
              className={`text-sm mt-2 flex items-center gap-1 ${changeColors[change.type]}`}
            >
              {change.type === "increase" && "↑"}
              {change.type === "decrease" && "↓"}
              <span>{change.value}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-[var(--color-accent-orange)] opacity-80">
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
    <Card
      hoverable
      interactive
      className={`relative ${className}`}
      {...props}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          {badge}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {showArrow && (
          <svg
            className="w-5 h-5 text-[var(--color-text-tertiary)] flex-shrink-0 ml-4"
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
