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
import { Display, Body } from "./Typography";

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
  gradientVariant?: "primary" | "secondary" | "tertiary";
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
  const alignmentClass = mobileAlign === "center" ? "text-center sm:text-left" : "text-left";
  
  return (
    <div className={`relative ${alignmentClass} ${className}`}>
      {/* Gradient Accent Bar - Desktop Only */}
      {showGradient && (
        <div 
          className={`
            absolute -left-4 top-0 bottom-0 w-1.5 rounded-full hidden sm:block
            bg-gradient-accent-${gradientVariant}
          `}
          aria-hidden="true"
        />
      )}
      
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Icon + Title */}
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
            {icon && (
              <div className="shrink-0 text-accent-orange">
                {icon}
              </div>
            )}
            <Display 
              size="lg" 
              className="text-navy-900"
            >
              {title}
            </Display>
          </div>
          
          {/* Subtitle */}
          {subtitle && (
            <Body 
              variant="secondary" 
              className="text-sm sm:text-base"
            >
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
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-navy-900 truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-steel-600 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
