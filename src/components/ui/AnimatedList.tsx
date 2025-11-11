/**
 * AnimatedList Component
 * Wrapper for lists with staggered fade-in animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animation-variants';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Custom stagger delay between items (in seconds) */
  staggerDelay?: number;
}

/**
 * AnimatedList - Container for animated list items
 * 
 * Usage:
 * ```tsx
 * <AnimatedList>
 *   {items.map(item => (
 *     <AnimatedListItem key={item.id}>
 *       <Card>{item.content}</Card>
 *     </AnimatedListItem>
 *   ))}
 * </AnimatedList>
 * ```
 */
export function AnimatedList({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.05,
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{
        delayChildren: delay,
        staggerChildren: staggerDelay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedListItem - Individual item in animated list
 * Must be a child of AnimatedList
 */
export function AnimatedListItem({
  children,
  className = '',
}: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={staggerItem}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedGrid - Grid layout with staggered animations
 */
interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 4 | 6 | 8;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedGrid({
  children,
  className = '',
  columns = 3,
  gap = 6,
  delay = 0,
  staggerDelay = 0.05,
}: AnimatedGridProps) {
  const columnsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  const gapClass = {
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  }[gap];

  return (
    <motion.div
      className={`grid ${columnsClass} ${gapClass} ${className}`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={{
        delayChildren: delay,
        staggerChildren: staggerDelay,
      }}
    >
      {children}
    </motion.div>
  );
}
