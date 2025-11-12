/**
 * Page-Specific Skeleton Loading States
 * Comprehensive skeleton screens for better perceived performance
 *
 * Features:
 * - Match actual page layouts exactly
 * - Smooth transitions with minimum display time
 * - Optimized for mobile-first design
 */

"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { AnimatedGrid } from "./AnimatedList";

/**
 * Dashboard Stats Skeleton
 * Used on dashboard for the 3-stat card grid
 */
export function DashboardStatsSkeleton() {
  return (
    <AnimatedGrid columns={3} gap={4} delay={0}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-silver-300 shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </AnimatedGrid>
  );
}

/**
 * Dashboard Workout Cards Skeleton
 * Used for upcoming workouts section
 */
export function DashboardWorkoutsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-xl border border-silver-300 shadow-sm divide-y divide-silver-300 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton variant="circular" className="w-5 h-5 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Today's Workout Hero Skeleton
 * Large hero card for today's workout
 */
export function DashboardTodayWorkoutSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 shadow-lg overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-24 bg-white/30" />
            <Skeleton className="h-8 w-48 bg-white/30" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 bg-white/30" />
              <Skeleton className="h-4 w-32 bg-white/30" />
            </div>
          </div>
          <Skeleton
            variant="circular"
            className="w-16 h-16 bg-white/20 shrink-0"
          />
        </div>
      </div>
      {/* Button Area */}
      <div className="p-5">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Athlete Roster Skeleton
 * Grid of athlete cards (3 columns)
 */
export function AthleteRosterSkeleton({ count = 9 }: { count?: number }) {
  return (
    <AnimatedGrid columns={3} gap={6} delay={0}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-silver-300 shadow-sm overflow-hidden min-h-[280px]"
        >
          {/* Header with avatar */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton variant="circular" className="w-12 h-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            {/* Stats */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          {/* Action buttons */}
          <div className="border-t border-silver-300 p-4 flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
    </AnimatedGrid>
  );
}

/**
 * Workout Library Skeleton
 * 2-column grid of workout cards
 */
export function WorkoutLibrarySkeleton({ count = 6 }: { count?: number }) {
  return (
    <AnimatedGrid columns={2} gap={4} delay={0}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-silver-300 shadow-sm p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          {/* Exercise list preview */}
          <div className="space-y-3 mb-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-6 h-6" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-silver-300">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      ))}
    </AnimatedGrid>
  );
}

/**
 * Profile Page Skeleton
 * Settings sections with form fields
 */
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-silver-300 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton variant="circular" className="w-20 h-20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-silver-300 shadow-sm p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Additional Sections */}
      {[1, 2].map((section) => (
        <div
          key={section}
          className="bg-white rounded-xl border border-silver-300 shadow-sm p-6"
        >
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Assignment Details Modal Skeleton
 * Used in WorkoutAssignmentDetailModal
 */
export function AssignmentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-silver-300 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-silver-300">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-24" />
      </div>
    </div>
  );
}

/**
 * Workout Editor Skeleton
 * Used when creating/editing workouts
 */
export function WorkoutEditorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-silver-300 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton variant="circular" className="w-8 h-8" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Athlete Detail Modal Skeleton
 * Used in athlete detail views
 */
export function AthleteDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with avatar */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-20 h-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 border border-silver-300 rounded-lg"
          >
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-silver-300">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Schedule/Calendar Skeleton
 * Used on schedule page
 */
export function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={`header-${i}`} className="h-8" />
        ))}
        {/* Calendar days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="border border-silver-300 rounded-lg p-2 space-y-2 min-h-[100px]"
          >
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Notification List Skeleton
 * Used on notifications page
 */
export function NotificationListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-silver-300 rounded-lg p-4 flex items-start gap-4"
        >
          <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}
