/**
 * PageHeader Component
 *
 * Reusable page header with gradient accent bar and consistent styling.
 * Uses design tokens so colors can be changed in ONE place.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Your workout overview and statistics"
 *   icon={<LayoutDashboard className="w-6 h-6" />}
 *   actions={<Button>Add Workout</Button>}
 * />
 * ```
 */

import React from "react";
import { Display, Body, Heading } from "./Typography";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

type GradientVariant = "primary" | "secondary" | "tertiary";

const gradientBackgrounds: Record<GradientVariant, string> = {
  primary: "var(--page-gradient-energetic)",
  secondary: "var(--bg-gradient-primary)",
  tertiary: "var(--bg-gradient-secondary)",
};

export interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon to display before title */
  icon?: React.ReactNode;
  /** Optional action buttons/controls to display on the right */
  actions?: React.ReactNode;
  /** Show gradient accent bar (default: true) */
  showGradient?: boolean;
  /** Gradient variant - determines color combination */
  gradientVariant?: GradientVariant;
  /** Alignment for mobile (default: center) */
  mobileAlign?: "left" | "center";
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader Component
 *
 * Displays a page title with optional gradient accent bar, subtitle, icon, and actions.
 * All gradient colors are controlled via CSS custom properties in tokens.css.
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  showGradient = true,
  gradientVariant = "primary",
  mobileAlign = "center",
  className = "",
}: PageHeaderProps) {
  const alignmentClass =
    mobileAlign === "center" ? "text-center sm:text-left" : "text-left";
  const barBackground = gradientBackgrounds[gradientVariant];

  return (
    <div className={cx("relative", alignmentClass, className)}>
      {/* Gradient Accent Bar - Visible on Mobile & Desktop */}
      {showGradient && (
        <>
          {/* Mobile: Top horizontal bar */}
          <div
            className="absolute -top-2 left-0 right-0 h-1 rounded-full sm:hidden"
            style={{ background: barBackground }}
            aria-hidden="true"
          />
          {/* Desktop: Left vertical bar */}
          <div
            className="absolute -left-4 top-0 bottom-0 w-1.5 rounded-full hidden sm:block"
            style={{ background: barBackground }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
            {icon && <div className="shrink-0 text-accent">{icon}</div>}
            <Display size="md" variant="primary">
              {title}
            </Display>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <Body variant="secondary" className="text-sm sm:text-base">
              {subtitle}
            </Body>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact variant for smaller pages or sections
 */
export interface PageHeaderCompactProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeaderCompact({
  title,
  subtitle,
  actions,
  className = "",
}: PageHeaderCompactProps) {
  return (
    <div className={cx("flex items-center justify-between gap-4", className)}>
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
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;
