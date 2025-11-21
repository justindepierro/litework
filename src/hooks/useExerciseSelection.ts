import { useState, useCallback } from "react";

/**
 * Hook for managing multi-select state in WorkoutEditor
 * Handles selecting multiple exercises for bulk operations (grouping, etc.)
 */
export function useExerciseSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(
    new Set()
  );

  // Toggle single exercise selection
  const toggleExerciseSelection = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  }, []);

  // Select all ungrouped exercises
  const selectAllExercises = useCallback((exerciseIds: string[]) => {
    setSelectedExerciseIds(new Set(exerciseIds));
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedExerciseIds(new Set());
    setSelectionMode(false);
  }, []);

  // Enter selection mode
  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  // Exit selection mode
  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedExerciseIds(new Set());
  }, []);

  return {
    selectionMode,
    selectedExerciseIds,
    toggleExerciseSelection,
    selectAllExercises,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
  };
}
