/**
 * Typography Component System
 * Semantic typography components using design tokens
 * Replaces direct Tailwind classes for consistent text styling
 */

"use client";

import React from "react";

// ============================================================================
// HEADING COMPONENT
// ============================================================================

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingVariant = "primary" | "secondary" | "accent";

export interface HeadingProps {
  /** Heading level (h1-h6) */
  level?: HeadingLevel;
  /** Visual variant */
  variant?: HeadingVariant;
  /** Content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Heading: React.FC<HeadingProps> = ({
  level = "h2",
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const Component = level;

  // Size mapping for semantic hierarchy
  const sizeClasses = {
    h1: "text-3xl sm:text-4xl",
    h2: "text-2xl sm:text-3xl",
    h3: "text-xl sm:text-2xl",
    h4: "text-lg sm:text-xl",
    h5: "text-base sm:text-lg",
    h6: "text-sm sm:text-base",
  };

  // Variant colors using design tokens
  const variantClasses = {
    primary: "text-[var(--color-text-primary)]",
    secondary: "text-[var(--color-text-secondary)]",
    accent: "text-[var(--color-accent-orange)]",
  };

  return (
    <Component
      className={`
        ${sizeClasses[level]}
        ${variantClasses[variant]}
        font-[var(--font-family-heading)]
        font-[var(--font-weight-semibold)]
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

Heading.displayName = "Heading";

// ============================================================================
// BODY TEXT COMPONENT
// ============================================================================

export type BodySize = "xs" | "sm" | "base" | "lg" | "xl";
export type BodyVariant = "primary" | "secondary" | "tertiary" | "error" | "success";

export interface BodyProps {
  /** Text size */
  size?: BodySize;
  /** Visual variant (color) */
  variant?: BodyVariant;
  /** Font weight */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /** Content */
  children: React.ReactNode;
  /** Render as specific element */
  as?: "p" | "span" | "div";
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Body: React.FC<BodyProps> = ({
  size = "base",
  variant = "primary",
  weight = "normal",
  children,
  as = "p",
  className = "",
  ...props
}) => {
  const Component = as;

  // Size classes
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Variant colors using design tokens
  const variantClasses = {
    primary: "text-[var(--color-text-primary)]",
    secondary: "text-[var(--color-text-secondary)]",
    tertiary: "text-[var(--color-text-tertiary)]",
    error: "text-[var(--color-error)]",
    success: "text-[var(--color-success)]",
  };

  // Weight classes
  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <Component
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${weightClasses[weight]}
        font-[var(--font-family-primary)]
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

Body.displayName = "Body";

// ============================================================================
// LABEL COMPONENT (Form Labels, Captions)
// ============================================================================

export type LabelVariant = "default" | "required" | "disabled" | "error";

export interface LabelProps {
  /** Label variant */
  variant?: LabelVariant;
  /** Content */
  children: React.ReactNode;
  /** HTML for attribute (for form labels) */
  htmlFor?: string;
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Label: React.FC<LabelProps> = ({
  variant = "default",
  children,
  htmlFor,
  className = "",
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    default: "text-[var(--color-text-primary)]",
    required: "text-[var(--color-text-primary)] after:content-['*'] after:ml-0.5 after:text-[var(--color-error)]",
    disabled: "text-[var(--color-text-tertiary)] opacity-60",
    error: "text-[var(--color-error)]",
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`
        block text-sm font-medium
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </label>
  );
};

Label.displayName = "Label";

// ============================================================================
// CAPTION COMPONENT (Helper Text, Metadata)
// ============================================================================

export type CaptionVariant = "default" | "muted" | "error" | "success";

export interface CaptionProps {
  /** Caption variant */
  variant?: CaptionVariant;
  /** Content */
  children: React.ReactNode;
  /** Render as specific element */
  as?: "p" | "span" | "div";
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Caption: React.FC<CaptionProps> = ({
  variant = "default",
  children,
  as = "p",
  className = "",
  ...props
}) => {
  const Component = as;

  // Variant classes
  const variantClasses = {
    default: "text-[var(--color-text-secondary)]",
    muted: "text-[var(--color-text-tertiary)]",
    error: "text-[var(--color-error)]",
    success: "text-[var(--color-success)]",
  };

  return (
    <Component
      className={`
        text-xs
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

Caption.displayName = "Caption";

// ============================================================================
// DISPLAY TEXT COMPONENT (Hero Text, Large Numbers)
// ============================================================================

export type DisplaySize = "sm" | "md" | "lg" | "xl";

export interface DisplayProps {
  /** Display size */
  size?: DisplaySize;
  /** Content */
  children: React.ReactNode;
  /** Render as specific element */
  as?: "h1" | "h2" | "div" | "span";
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Display: React.FC<DisplayProps> = ({
  size = "lg",
  children,
  as = "h1",
  className = "",
  ...props
}) => {
  const Component = as;

  // Size classes for large display text
  const sizeClasses = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-6xl",
  };

  return (
    <Component
      className={`
        ${sizeClasses[size]}
        font-[var(--font-family-display)]
        font-[var(--font-weight-bold)]
        text-[var(--color-text-primary)]
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

Display.displayName = "Display";

// ============================================================================
// LINK COMPONENT (Semantic Links)
// ============================================================================

export type LinkVariant = "primary" | "secondary" | "accent" | "muted";

export interface LinkProps {
  /** Link variant */
  variant?: LinkVariant;
  /** Content */
  children: React.ReactNode;
  /** Link href */
  href?: string;
  /** Click handler (for button-like links) */
  onClick?: () => void;
  /** Open in new tab */
  external?: boolean;
  /** Custom className */
  className?: string;
  /** Additional HTML attributes */
  [key: string]: any;
}

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  children,
  href,
  onClick,
  external = false,
  className = "",
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    primary: "text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]/80",
    secondary: "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
    accent: "text-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)]/80",
    muted: "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
  };

  const Component = href ? "a" : "button";

  return (
    <Component
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`
        ${variantClasses[variant]}
        font-medium
        transition-colors
        underline-offset-4
        hover:underline
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

Link.displayName = "Link";
