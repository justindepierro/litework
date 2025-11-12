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
export function SkipLink({ targetId, children }: SkipLinkProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-link fixed top-0 left-0 bg-primary text-white px-4 py-2 -translate-y-full focus:translate-y-0 transition-transform z-[9999]"
    >
      {children}
    </a>
  );
}
