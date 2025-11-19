/**
 * Typography Component System
 * Semantic typography components powered by design tokens
 */

"use client";

import React from "react";

const cx = (...classes: Array<string | undefined | false>) =>
  classes.filter(Boolean).join(" ");

const mergeStyles = (
  ...styles: Array<React.CSSProperties | undefined>
): React.CSSProperties => Object.assign({}, ...styles.filter(Boolean));

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingVariant = "primary" | "secondary" | "accent" | "inverse";
export type BodySize = "xs" | "sm" | "base" | "lg" | "xl";
export type BodyVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error"
  | "success"
  | "accent"
  | "inverse";
export type BodyWeight = "normal" | "medium" | "semibold" | "bold";
export type LabelVariant = "default" | "required" | "disabled" | "error";
export type CaptionVariant = "default" | "muted" | "error" | "success";
export type DisplaySize = "sm" | "md" | "lg" | "xl";
export type DisplayVariant = "primary" | "secondary" | "accent" | "inverse";
export type LinkVariant = "primary" | "secondary" | "accent" | "muted";

const headingSizeTokens: Record<HeadingLevel, string> = {
  h1: "--font-size-fluid-5xl",
  h2: "--font-size-fluid-4xl",
  h3: "--font-size-fluid-3xl",
  h4: "--font-size-fluid-2xl",
  h5: "--font-size-fluid-xl",
  h6: "--font-size-fluid-lg",
};

const headingLineHeights: Record<HeadingLevel, string> = {
  h1: "var(--line-height-tight)",
  h2: "var(--line-height-tight)",
  h3: "var(--line-height-snug)",
  h4: "var(--line-height-normal)",
  h5: "var(--line-height-normal)",
  h6: "var(--line-height-relaxed)",
};

const headingLetterSpacing: Record<HeadingLevel, string | undefined> = {
  h1: "var(--letter-spacing-tight)",
  h2: "var(--letter-spacing-tight)",
  h3: "var(--letter-spacing-normal)",
  h4: undefined,
  h5: undefined,
  h6: undefined,
};

const headingVariantColors: Record<HeadingVariant, string> = {
  primary: "var(--color-text-primary)",
  secondary: "var(--color-text-secondary)",
  accent: "var(--color-text-accent)",
  inverse: "var(--color-text-inverse)",
};

const bodySizeTokens: Record<BodySize, string> = {
  xs: "--font-size-xs",
  sm: "--font-size-sm",
  base: "--font-size-fluid-base",
  lg: "--font-size-fluid-lg",
  xl: "--font-size-fluid-xl",
};

const bodyLineHeights: Record<BodySize, string> = {
  xs: "var(--line-height-normal)",
  sm: "var(--line-height-normal)",
  base: "var(--line-height-relaxed)",
  lg: "var(--line-height-relaxed)",
  xl: "var(--line-height-loose)",
};

const bodyVariantColors: Record<BodyVariant, string> = {
  primary: "var(--color-text-primary)",
  secondary: "var(--color-text-secondary)",
  tertiary: "var(--color-text-tertiary)",
  error: "var(--color-error)",
  success: "var(--color-success)",
  accent: "var(--color-text-accent)",
  inverse: "var(--color-text-inverse)",
};

const weightScale: Record<BodyWeight, string> = {
  normal: "var(--font-weight-normal)",
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
};

const displaySizeTokens: Record<DisplaySize, string> = {
  sm: "--font-size-fluid-2xl",
  md: "--font-size-fluid-3xl",
  lg: "--font-size-fluid-4xl",
  xl: "--font-size-fluid-5xl",
};

const displayVariantColors: Record<DisplayVariant, string> = {
  primary: "var(--color-text-primary)",
  secondary: "var(--color-text-secondary)",
  accent: "var(--color-text-accent)",
  inverse: "var(--color-text-inverse)",
};

const labelColors: Record<LabelVariant, string> = {
  default: "var(--color-text-primary)",
  required: "var(--color-text-primary)",
  disabled: "var(--color-text-tertiary)",
  error: "var(--color-error)",
};

const captionColors: Record<CaptionVariant, string> = {
  default: "var(--color-text-secondary)",
  muted: "var(--color-text-tertiary)",
  error: "var(--color-error)",
  success: "var(--color-success)",
};
// ============================================================================
// HEADING COMPONENT
// ============================================================================

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  variant?: HeadingVariant;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  level = "h2",
  variant = "primary",
  children,
  className,
  style,
  ...props
}) => {
  const Component = level;

  return (
    <Component
      className={cx("tracking-tight", className)}
      style={mergeStyles(
        {
          fontFamily: "var(--font-family-heading)",
          fontWeight: "var(--font-weight-semibold)",
          fontSize: `var(${headingSizeTokens[level]})`,
          lineHeight: headingLineHeights[level],
          letterSpacing: headingLetterSpacing[level],
          color: headingVariantColors[variant],
        },
        style
      )}
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

export interface BodyProps extends React.HTMLAttributes<HTMLElement> {
  size?: BodySize;
  variant?: BodyVariant;
  weight?: BodyWeight;
  children: React.ReactNode;
  as?: "p" | "span" | "div";
}

export const Body: React.FC<BodyProps> = ({
  size = "base",
  variant = "primary",
  weight = "normal",
  children,
  as = "p",
  className,
  style,
  ...props
}) => {
  const Component = as;

  return (
    <Component
      className={cx(className)}
      style={mergeStyles(
        {
          fontFamily: "var(--font-family-primary)",
          fontSize: `var(${bodySizeTokens[size]})`,
          lineHeight: bodyLineHeights[size],
          fontWeight: weightScale[weight],
          color: bodyVariantColors[variant],
        },
        style
      )}
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

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: LabelVariant;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  variant = "default",
  children,
  className,
  style,
  ...props
}) => {
  const isRequired = variant === "required";

  return (
    <label
      className={cx("inline-flex items-center gap-0.5 text-left", className)}
      style={mergeStyles(
        {
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-medium)",
          color: labelColors[variant],
          opacity: variant === "disabled" ? 0.6 : 1,
        },
        style
      )}
      {...props}
    >
      <span>{children}</span>
      {isRequired && (
        <span
          aria-hidden="true"
          className="ml-0.5"
          style={{ color: "var(--color-error)" }}
        >
          *
        </span>
      )}
    </label>
  );
};

Label.displayName = "Label";

// ============================================================================
// CAPTION COMPONENT (Helper Text, Metadata)
// ============================================================================

export interface CaptionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CaptionVariant;
  children: React.ReactNode;
  as?: "p" | "span" | "div";
}

export const Caption: React.FC<CaptionProps> = ({
  variant = "default",
  children,
  as = "p",
  className,
  style,
  ...props
}) => {
  const Component = as;

  return (
    <Component
      className={cx(className)}
      style={mergeStyles(
        {
          fontFamily: "var(--font-family-primary)",
          fontSize: "var(--font-size-xs)",
          lineHeight: "var(--line-height-normal)",
          color: captionColors[variant],
        },
        style
      )}
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

export interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  size?: DisplaySize;
  variant?: DisplayVariant;
  children: React.ReactNode;
  as?: "h1" | "h2" | "div" | "span";
}

export const Display: React.FC<DisplayProps> = ({
  size = "lg",
  variant = "primary",
  children,
  as = "h1",
  className,
  style,
  ...props
}) => {
  const Component = as;

  return (
    <Component
      className={cx("tracking-tight", className)}
      style={mergeStyles(
        {
          fontFamily: "var(--font-family-display)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: `var(${displaySizeTokens[size]})`,
          lineHeight: "var(--line-height-tight)",
          letterSpacing: "var(--letter-spacing-tight)",
          color: displayVariantColors[variant],
        },
        style
      )}
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

export interface LinkProps {
  variant?: LinkVariant;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  children,
  href,
  onClick,
  external = false,
  className,
  ...props
}) => {
  const variantClasses: Record<LinkVariant, string> = {
    primary: "text-(--color-accent-blue) hover:opacity-80",
    secondary:
      "text-(--color-text-secondary) hover:text-(--color-text-primary)",
    accent: "text-(--color-accent-orange) hover:opacity-85",
    muted: "text-(--color-text-tertiary) hover:text-(--color-text-secondary)",
  };

  const baseClasses = cx(
    variantClasses[variant],
    "font-medium transition-colors underline-offset-4 hover:underline",
    className
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={baseClasses}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

Link.displayName = "Link";
