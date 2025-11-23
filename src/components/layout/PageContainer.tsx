/**
 * PageContainer - Standardized page wrapper component
 *
 * Provides consistent max-width, padding, and background across all pages.
 * Enhanced for Phase 5: Layout Standardization
 */

import React from "react";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: "2xl" | "4xl" | "7xl" | "1200px" | "1400px" | "1600px" | "full";
  padding?: "4" | "6" | "8";
  background?: "primary" | "secondary" | "gradient" | "white" | "silver";
  className?: string;
  animate?: boolean;
  as?: "div" | "main";
}

const maxWidthMap = {
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
  "1200px": "max-w-[1200px]",
  "1400px": "max-w-[1400px]",
  "1600px": "max-w-[1600px]",
  full: "max-w-full",
};

const backgroundMap = {
  primary: "bg-bg-primary",
  secondary: "bg-bg-secondary",
  gradient: "bg-gradient-primary",
  white: "bg-white",
  silver: "bg-silver-100",
};

const paddingMap = {
  "4": "p-4 md:p-6",
  "6": "p-4 md:p-6 lg:p-8",
  "8": "p-6 md:p-8 lg:p-10",
};

/**
 * PageContainer Component
 *
 * Usage:
 * ```tsx
 * <PageContainer maxWidth="1600px" padding="6">
 *   <PageHeader title="Dashboard" />
 *   <div className="space-y-8">
 *     {content}
 *   </div>
 * </PageContainer>
 * ```
 */
export function PageContainer({
  children,
  maxWidth = "7xl",
  padding = "6",
  background = "secondary",
  className = "",
  animate = true,
  as: Component = "div",
}: PageContainerProps) {
  const containerClasses = `
    min-h-screen 
    ${backgroundMap[background]}
    ${paddingMap[padding]}
    ${className}
  `.trim();

  const innerClasses = `
    mx-auto 
    ${maxWidthMap[maxWidth]}
    w-full
  `.trim();

  if (animate) {
    const MotionComponent = motion[Component];
    return (
      <MotionComponent
        className={containerClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={innerClasses}>{children}</div>
      </MotionComponent>
    );
  }

  return (
    <Component className={containerClasses}>
      <div className={innerClasses}>{children}</div>
    </Component>
  );
}

/**
 * CenteredContainer - For auth pages and centered content
 */
export function CenteredContainer({
  children,
  maxWidth = "4xl",
  background = "gradient",
  className = "",
}: Omit<PageContainerProps, "as" | "animate" | "padding">) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${backgroundMap[background]} py-8 px-4 ${className}`}
    >
      <div className={`w-full ${maxWidthMap[maxWidth]}`}>{children}</div>
    </div>
  );
}

/**
 * PageSection - Consistent section wrapper
 */
interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function PageSection({
  children,
  className = "",
  animate = true,
  delay = 0,
}: PageSectionProps) {
  if (animate) {
    return (
      <motion.section
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        {children}
      </motion.section>
    );
  }

  return <section className={className}>{children}</section>;
}
