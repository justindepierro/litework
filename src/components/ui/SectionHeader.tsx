/**
 * SectionHeader Component
 *
 * A reusable section header component with optional icon, subtitle, and action buttons.
 * Provides consistent styling for section titles throughout the application.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   icon={<User className="w-5 h-5" />}
 *   title="Basic Information"
 *   subtitle="Update your personal details"
 *   level="h3"
 *   actions={<Button size="sm">Edit</Button>}
 * />
 * ```
 */

import React from "react";
import { Heading, Body } from "./Typography";

export interface SectionHeaderProps {
  /** The main title text */
  title: string;

  /** Optional icon to display before the title */
  icon?: React.ReactNode;

  /** Optional subtitle text */
  subtitle?: string;

  /** Heading level for semantic HTML */
  level?: "h2" | "h3" | "h4";

  /** Optional action buttons or content to display on the right */
  actions?: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Visual variant affecting styling */
  variant?: "default" | "primary" | "accent" | "gradient";

  /** Optional divider line below header */
  divider?: boolean;
}

/**
 * SectionHeader Component
 *
 * Displays a section header with consistent styling, optional icon, subtitle, and actions.
 */
export function SectionHeader({
  title,
  icon,
  subtitle,
  level = "h3",
  actions,
  className = "",
  variant = "default",
  divider = false,
}: SectionHeaderProps) {
  // Variant-specific styling
  const variantStyles = {
    default: {
      container: "mb-4",
      titleColor: "text-heading-primary",
      iconColor: "text-primary",
    },
    primary: {
      container: "mb-4",
      titleColor: "text-primary",
      iconColor: "text-primary",
    },
    accent: {
      container: "mb-4",
      titleColor: "text-accent",
      iconColor: "text-accent",
    },
    gradient: {
      container:
        "bg-gradient-to-br from-accent-blue-50 to-accent-indigo-50 rounded-xl p-4 sm:p-6 border border-accent-blue-100 mb-4",
      titleColor: "text-primary",
      iconColor: "text-primary",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <Heading
            level={level}
            className={`${styles.titleColor} flex items-center gap-2 ${subtitle ? "mb-1" : ""}`}
          >
            {icon && (
              <Body as="span" className={styles.iconColor}>
                {icon}
              </Body>
            )}
            <Body as="span">{title}</Body>
          </Heading>
          {subtitle && (
            <Body variant="secondary" className="text-sm mt-1">
              {subtitle}
            </Body>
          )}
        </div>

        {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
      </div>

      {divider && <div className="mt-4 border-t border-silver-300" />}
    </div>
  );
}

/**
 * SectionHeaderSimple Component
 *
 * A simplified version of SectionHeader for basic use cases.
 * Just title and optional icon.
 */
export function SectionHeaderSimple({
  title,
  icon,
  level = "h3",
  className = "",
}: {
  title: string;
  icon?: React.ReactNode;
  level?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <Heading
      level={level}
      className={`mb-4 flex items-center gap-2 ${className}`}
    >
      {icon && (
        <Body as="span" className="text-primary">
          {icon}
        </Body>
      )}
      {title}
    </Heading>
  );
}

/**
 * SectionContainer Component
 *
 * A wrapper component that combines SectionHeader with a content container.
 * Provides consistent spacing and styling for form sections.
 */
export function SectionContainer({
  title,
  icon,
  subtitle,
  level = "h3",
  actions,
  children,
  variant = "default",
  className = "",
}: SectionHeaderProps & {
  children: React.ReactNode;
}) {
  const containerStyles = {
    default: "bg-white rounded-lg p-4 sm:p-6 shadow-sm",
    primary:
      "bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-primary-light",
    accent:
      "bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-accent-light",
    gradient:
      "bg-gradient-to-br from-accent-blue-50 to-accent-indigo-50 rounded-xl p-4 sm:p-6 border border-accent-blue-100",
  };

  return (
    <div className={`${containerStyles[variant]} ${className}`}>
      <SectionHeader
        title={title}
        icon={icon}
        subtitle={subtitle}
        level={level}
        actions={actions}
        variant="default"
        className="mb-6"
      />
      <div className="space-y-4">{children}</div>
    </div>
  );
}
