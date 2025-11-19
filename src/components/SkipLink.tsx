/**
 * Skip to Main Content Link - Client Component
 * For keyboard accessibility - should be first focusable element
 */

"use client";

import React from "react";

export interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
}

/**
 * SkipLink - Allows keyboard users to skip navigation and go directly to main content
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content">Skip to main content</SkipLink>
 * ```
 */
export function SkipLink({
  targetId,
  children,
}: SkipLinkProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
