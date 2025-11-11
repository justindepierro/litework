/**
 * PageHeader - Standardized page header component
 * 
 * Provides consistent page titles, breadcrumbs, icons, and action buttons.
 * Part of Phase 3 Layout Modernization.
 */

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Display, Body } from '@/components/ui/Typography';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * PageHeader Component
 * 
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Workouts"
 *   subtitle="Manage workout templates and exercise library"
 *   icon={Dumbbell}
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Workouts" }
 *   ]}
 *   actions={
 *     <>
 *       <Button variant="secondary">Import</Button>
 *       <Button variant="primary">Create Workout</Button>
 *     </>
 *   }
 *   badge={<Badge variant="info">42 workouts</Badge>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs,
  actions,
  badge,
  className = '',
  animate = true,
}: PageHeaderProps) {
  const headerContent = (
    <div className={`mb-8 border-b border-gray-200 pb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 mb-3 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Left: Icon + Title + Badge */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {Icon && (
            <motion.div
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
          )}
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Display size="lg" className="truncate">
                {title}
              </Display>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {subtitle && (
              <Body variant="secondary" className="mt-1">
                {subtitle}
              </Body>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {headerContent}
      </motion.div>
    );
  }

  return headerContent;
}

/**
 * SectionHeader - Smaller header for page sections
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-gray-900 truncate">
          {title}
        </h2>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {subtitle && (
        <Body variant="secondary" className="hidden md:block ml-4">
          {subtitle}
        </Body>
      )}
      {actions && (
        <div className="flex gap-2 shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
}
