/**
 * PageContainer - Standardized page wrapper component
 *
 * Provides consistent max-width, padding, and background across all pages.
 * Part of Phase 3 Layout Modernization.
 */

import React from "react";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: "1200px" | "1400px" | "1600px" | "full";
  padding?: "4" | "6" | "8";
  className?: string;
  animate?: boolean;
}

const maxWidthMap = {
  "1200px": "max-w-[1200px]",
  "1400px": "max-w-[1400px]",
  "1600px": "max-w-[1600px]",
  full: "max-w-full",
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
  maxWidth = "1600px",
  padding = "6",
  className = "",
  animate = true,
}: PageContainerProps) {
  const containerClasses = `
    min-h-screen 
    bg-gray-50 
    ${paddingMap[padding]}
    ${className}
  `.trim();

  const innerClasses = `
    mx-auto 
    ${maxWidthMap[maxWidth]}
    w-full
  `.trim();

  if (animate) {
    return (
      <motion.div
        className={containerClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={innerClasses}>{children}</div>
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>{children}</div>
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
