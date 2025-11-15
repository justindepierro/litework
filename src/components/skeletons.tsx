/**
 * Skeleton Loading Components
 * Better perceived performance than spinners
 */

import React from "react";

// ============================================================================
// BASE SKELETON COMPONENTS
// ============================================================================

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

/**
 * Basic skeleton box
 */
export const SkeletonBox: React.FC<SkeletonProps> = ({
  className = "",
  animate = true,
}) => (
  <div
    className={`bg-(--bg-tertiary) rounded ${
      animate ? "animate-pulse" : ""
    } ${className}`}
  />
);

/**
 * Skeleton text line
 */
export const SkeletonText: React.FC<
  SkeletonProps & { width?: string; height?: string }
> = ({ className = "", width = "100%", height = "h-4", animate = true }) => (
  <div
    className={`bg-(--bg-tertiary) rounded ${height} ${
      animate ? "animate-pulse" : ""
    } ${className}`}
    style={{ width }}
  />
);

/**
 * Skeleton circle (for avatars)
 */
export const SkeletonCircle: React.FC<SkeletonProps & { size?: string }> = ({
  className = "",
  size = "h-12 w-12",
  animate = true,
}) => (
  <div
    className={`bg-(--bg-tertiary) rounded-full ${size} ${
      animate ? "animate-pulse" : ""
    } ${className}`}
  />
);

// ============================================================================
// WORKOUT SKELETONS
// ============================================================================

/**
 * Skeleton for workout card
 */
export const WorkoutCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonText width="60%" height="h-6" />
        <SkeletonText width="40%" height="h-4" />
      </div>
      <SkeletonBox className="h-8 w-8" />
    </div>
    <div className="space-y-2">
      <SkeletonText width="80%" />
      <SkeletonText width="70%" />
      <SkeletonText width="50%" />
    </div>
    <div className="flex gap-2 pt-2">
      <SkeletonBox className="h-8 w-20" />
      <SkeletonBox className="h-8 w-24" />
    </div>
  </div>
);

/**
 * Skeleton for workout list
 */
export const WorkoutListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <WorkoutCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for exercise item in workout
 */
export const ExerciseItemSkeleton: React.FC = () => (
  <div className="bg-(--bg-secondary) rounded-lg p-3 space-y-2">
    <div className="flex items-center gap-3">
      <SkeletonBox className="h-6 w-6" />
      <SkeletonText width="50%" height="h-5" />
    </div>
    <div className="grid grid-cols-3 gap-2 ml-9">
      <SkeletonText height="h-4" />
      <SkeletonText height="h-4" />
      <SkeletonText height="h-4" />
    </div>
  </div>
);

/**
 * Skeleton for workout detail view
 */
export const WorkoutDetailSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
    {/* Header */}
    <div className="space-y-3">
      <SkeletonText width="70%" height="h-8" />
      <div className="flex gap-4">
        <SkeletonText width="120px" height="h-6" />
        <SkeletonText width="100px" height="h-6" />
      </div>
    </div>

    {/* Description */}
    <div className="space-y-2">
      <SkeletonText width="100%" />
      <SkeletonText width="90%" />
      <SkeletonText width="60%" />
    </div>

    {/* Exercises */}
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <ExerciseItemSkeleton key={i} />
      ))}
    </div>

    {/* Actions */}
    <div className="flex gap-3 pt-4 border-t">
      <SkeletonBox className="h-10 w-32" />
      <SkeletonBox className="h-10 w-24" />
    </div>
  </div>
);

// ============================================================================
// DASHBOARD SKELETONS
// ============================================================================

/**
 * Skeleton for stat card
 */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
    <div className="flex items-center justify-between">
      <SkeletonText width="40%" height="h-5" />
      <SkeletonCircle size="h-10 w-10" />
    </div>
    <SkeletonText width="50%" height="h-8" />
    <SkeletonText width="60%" height="h-4" />
  </div>
);

/**
 * Skeleton for dashboard overview
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SkeletonText width="40%" height="h-6" className="mb-4" />
        <SkeletonBox className="h-64 w-full" />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SkeletonText width="40%" height="h-6" className="mb-4" />
        <SkeletonBox className="h-64 w-full" />
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <SkeletonText width="30%" height="h-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <SkeletonCircle size="h-8 w-8" />
            <div className="flex-1 space-y-1">
              <SkeletonText width="60%" />
              <SkeletonText width="40%" height="h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// LIST SKELETONS
// ============================================================================

/**
 * Skeleton for athlete card
 */
export const AthleteCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
    <SkeletonCircle size="h-12 w-12" />
    <div className="flex-1 space-y-2">
      <SkeletonText width="50%" height="h-5" />
      <SkeletonText width="40%" height="h-4" />
    </div>
    <SkeletonBox className="h-8 w-20" />
  </div>
);

/**
 * Skeleton for group card
 */
export const GroupCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
    <div className="flex items-center justify-between">
      <SkeletonText width="50%" height="h-6" />
      <SkeletonBox className="h-8 w-8" />
    </div>
    <SkeletonText width="70%" height="h-4" />
    <div className="flex items-center gap-2">
      <SkeletonCircle size="h-6 w-6" />
      <SkeletonCircle size="h-6 w-6" />
      <SkeletonCircle size="h-6 w-6" />
      <SkeletonText width="60px" height="h-4" />
    </div>
  </div>
);

/**
 * Generic list skeleton
 */
export const ListSkeleton: React.FC<{
  count?: number;
  itemComponent?: React.ComponentType;
}> = ({ count = 5, itemComponent: ItemComponent = AthleteCardSkeleton }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ItemComponent key={i} />
    ))}
  </div>
);

// ============================================================================
// TABLE SKELETONS
// ============================================================================

/**
 * Skeleton for table row
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({
  columns = 4,
}) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonText />
      </td>
    ))}
  </tr>
);

/**
 * Skeleton for full table
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-(--bg-secondary)">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3">
              <SkeletonText width="80%" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================================
// FORM SKELETONS
// ============================================================================

/**
 * Skeleton for form field
 */
export const FormFieldSkeleton: React.FC = () => (
  <div className="space-y-2">
    <SkeletonText width="30%" height="h-4" />
    <SkeletonBox className="h-10 w-full" />
  </div>
);

/**
 * Skeleton for full form
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
    <SkeletonText width="40%" height="h-6" />
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <FormFieldSkeleton key={i} />
      ))}
    </div>
    <div className="flex gap-3 pt-4">
      <SkeletonBox className="h-10 w-24" />
      <SkeletonBox className="h-10 w-20" />
    </div>
  </div>
);

// ============================================================================
// CALENDAR SKELETONS
// ============================================================================

/**
 * Skeleton for calendar view
 */
export const CalendarSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-8 w-8" />
      <SkeletonText width="150px" height="h-6" />
      <SkeletonBox className="h-8 w-8" />
    </div>

    {/* Calendar Grid */}
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonText key={`header-${i}`} width="100%" height="h-6" />
      ))}
      {/* Days */}
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonBox key={`day-${i}`} className="h-20 w-full" />
      ))}
    </div>
  </div>
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show skeleton for a duration before showing actual content
 * Prevents flash of loading state for fast responses
 */
export function useMinimumSkeletonTime(
  isLoading: boolean,
  minimumMs: number = 300
) {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowSkeleton(true);
    } else if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minimumMs - elapsed);

      if (remaining > 0) {
        const timeout = setTimeout(() => setShowSkeleton(false), remaining);
        return () => clearTimeout(timeout);
      } else {
        setShowSkeleton(false);
      }
    }
  }, [isLoading, minimumMs]);

  return showSkeleton;
}
