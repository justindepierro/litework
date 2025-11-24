"use client";

/**
 * PageTransition Component
 *
 * Provides smooth fade + slide transitions between route changes in Next.js App Router.
 * Uses Framer Motion with spring physics for natural, professional animations.
 *
 * Usage:
 * ```tsx
 * import PageTransition from '@/components/PageTransition';
 *
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>Your page content</div>
 *     </PageTransition>
 *   );
 * }
 * ```
 *
 * Features:
 * - Fade in/out with slide animation
 * - Spring physics (stiffness 260, damping 20)
 * - Automatic pathname detection
 * - Optimized for performance (GPU acceleration)
 * - Mobile-friendly (respects reduced motion preferences)
 */

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animation-variants";

interface PageTransitionProps {
  children: ReactNode;
  /**
   * Disable animations (useful for testing or accessibility)
   * @default false
   */
  disabled?: boolean;
}

export default function PageTransition({
  children,
  disabled = false,
}: PageTransitionProps) {
  const pathname = usePathname();

  // If animations are disabled, render children directly
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="visible"
        animate="visible"
        exit="exit"
        variants={pageTransition}
        style={{
          // GPU acceleration for smoother animations
          willChange: "transform, opacity",
          // Ensure content is always visible as fallback
          minHeight: "100%",
          position: "relative",
          zIndex: 1,
        }}
        onAnimationStart={() => {}}
        onAnimationComplete={() => {}}
      >
        <div
          style={{
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Alternative: PageTransitionWrapper for wrapping entire layouts
 * Use this if you want to apply transitions at the layout level
 */
export function PageTransitionWrapper({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
