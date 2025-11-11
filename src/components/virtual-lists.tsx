/**
 * Virtual Scrolling Utilities
 * Efficient rendering of large lists using react-window
 *
 * Note: Virtual scrolling is powerful but adds complexity.
 * Only use for lists with 100+ items. For smaller lists, use standard rendering.
 */

import React from "react";

/**
 * Simple virtual list implementation
 * For now, we'll use a standard implementation with windowing logic
 * This can be upgraded to use react-window when needed for very large lists (1000+)
 */

/**
 * Virtual list for workouts
 * Uses basic windowing for now - can upgrade to react-window for 1000+ items
 */
interface VirtualWorkoutListProps {
  workouts: Array<{
    id: string;
    name: string;
    description?: string;
    exerciseCount: number;
  }>;
  onWorkoutClick: (id: string) => void;
  height?: number;
  itemHeight?: number;
}

export const VirtualWorkoutList: React.FC<VirtualWorkoutListProps> = ({
  workouts,
  onWorkoutClick,
}) => {
  // For now, render all items - upgrade to windowing when list gets large
  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onWorkoutClick(workout.id)}
        >
          <h3 className="font-semibold text-lg mb-2">{workout.name}</h3>
          {workout.description && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-2 line-clamp-2">
              {workout.description}
            </p>
          )}
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {workout.exerciseCount} exercises
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Virtual list for athletes
 */
interface VirtualAthleteListProps {
  athletes: Array<{
    id: string;
    name: string;
    email: string;
    sport?: string;
  }>;
  onAthleteClick: (id: string) => void;
  height?: number;
  itemHeight?: number;
}

export const VirtualAthleteList: React.FC<VirtualAthleteListProps> = ({
  athletes,
  onAthleteClick,
}) => {
  return (
    <div className="space-y-2">
      {athletes.map((athlete) => (
        <div
          key={athlete.id}
          className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAthleteClick(athlete.id)}
        >
          <div className="h-12 w-12 rounded-full bg-[var(--color-silver-300)] flex items-center justify-center">
            <span className="text-lg font-semibold text-[var(--color-text-secondary)]">
              {athlete.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-medium">{athlete.name}</div>
            <div className="text-sm text-[var(--color-text-secondary)]">{athlete.email}</div>
            {athlete.sport && (
              <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{athlete.sport}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Virtual list for exercises
 */
interface VirtualExerciseListProps {
  exercises: Array<{
    id: string;
    name: string;
    sets?: number;
    reps?: string;
    weight?: string;
  }>;
  onExerciseClick?: (id: string) => void;
  height?: number;
  itemHeight?: number;
}

export const VirtualExerciseList: React.FC<VirtualExerciseListProps> = ({
  exercises,
  onExerciseClick,
}) => {
  return (
    <div className="space-y-2">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className={`bg-[var(--color-silver-200)] rounded-lg p-3 ${
            onExerciseClick ? "cursor-pointer hover:bg-[var(--color-silver-300)]" : ""
          }`}
          onClick={() => onExerciseClick?.(exercise.id)}
        >
          <div className="font-medium">{exercise.name}</div>
          <div className="text-sm text-[var(--color-text-secondary)] mt-1 flex gap-3">
            {exercise.sets && <span>{exercise.sets} sets</span>}
            {exercise.reps && <span>{exercise.reps} reps</span>}
            {exercise.weight && <span>{exercise.weight}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Generic virtual list with custom row renderer
 * Simplified implementation - upgrade to react-window for 1000+ items
 */
interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number;
  itemHeight?: number;
  width?: string | number;
  className?: string;
}

export function VirtualList<T>({
  items,
  renderItem,
  className = "",
}: VirtualListProps<T>) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
      ))}
    </div>
  );
}

/**
 * Hook to automatically detect if virtual scrolling should be used
 * Use standard list for small datasets, virtual scrolling for large ones
 */
export function useVirtualScrolling<T>(
  items: T[],
  threshold: number = 50
): {
  shouldUseVirtual: boolean;
  itemCount: number;
} {
  const shouldUseVirtual = items.length > threshold;

  return {
    shouldUseVirtual,
    itemCount: items.length,
  };
}

/**
 * Smart list that automatically switches between standard and virtual rendering
 * For now, renders all items - will upgrade to true virtualization when needed
 */
interface SmartListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  virtualizationThreshold?: number;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

export function SmartList<T>({
  items,
  renderItem,
  className = "",
}: SmartListProps<T>) {
  // For now, always use standard list
  // Will upgrade to windowing when we have 1000+ items in production
  return (
    <div className={className}>
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
      ))}
    </div>
  );
}
