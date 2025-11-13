/**
 * Skeleton Component - Loading placeholders
 * 
 * Usage:
 * <Skeleton className="h-8 w-32" />
 * <Skeleton variant="text" />
 * <Skeleton variant="circular" className="w-12 h-12" />
 */

"use client";

import React from "react";

export interface SkeletonProps {
  /** Additional classes */
  className?: string;
  /** Preset variants */
  variant?: "text" | "circular" | "rectangular" | "rounded";
  /** Animation style */
  animation?: "pulse" | "shimmer" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  animation = "shimmer",
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse bg-gray-200",
    shimmer: "skeleton bg-gray-200",
    none: "bg-gray-200",
  };

  return (
    <div
      className={`
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Specialized skeleton components for common patterns

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? "w-3/4" : ""}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-silver-300 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonWorkoutCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      {/* Metadata */}
      <div className="flex gap-4 mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-silver-300 rounded-lg p-6 ${className}`}>
      <Skeleton className="h-14 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonCalendarDay({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg p-3 shadow-sm ${className}`}>
      <Skeleton className="h-6 w-8 mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
  );
}

export function SkeletonExerciseItem({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg p-4 shadow-sm flex items-center gap-4 ${className}`}>
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-10" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}
