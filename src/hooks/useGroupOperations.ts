import { useCallback } from "react";
import { ExerciseGroup, WorkoutPlan } from "@/types";

/**
 * Hook for managing exercise group operations (supersets, circuits, sections)
 * Handles creating, updating, deleting groups and bulk operations
 */
export function useGroupOperations(
  workout: WorkoutPlan,
  updateWorkout: (workout: WorkoutPlan) => void
) {
  // Create a new group from selected exercises
  const createGroup = useCallback(
    (
      exerciseIds: string[],
      groupType: "superset" | "circuit" | "section",
      rounds?: number,
      restBetweenExercises?: number,
      restBetweenRounds?: number
    ) => {
      if (exerciseIds.length === 0) return;

      const newGroupId = Date.now().toString();
      const groupNumber = (workout.groups?.length || 0) + 1;
      const newGroup: ExerciseGroup = {
        id: newGroupId,
        name: `Group ${groupNumber}`,
        type: groupType,
        order: groupNumber,
        rounds: rounds,
        restBetweenExercises: restBetweenExercises,
        restBetweenRounds: restBetweenRounds,
      };

      // Move selected exercises into the new group
      const updatedExercises = workout.exercises.map((ex) =>
        exerciseIds.includes(ex.id) ? { ...ex, groupId: newGroupId } : ex
      );

      updateWorkout({
        ...workout,
        groups: [...(workout.groups || []), newGroup],
        exercises: updatedExercises,
      });
    },
    [workout, updateWorkout]
  );

  // Update existing group
  const updateGroup = useCallback(
    (updatedGroup: ExerciseGroup) => {
      const updatedGroups = (workout.groups || []).map((group) =>
        group.id === updatedGroup.id ? updatedGroup : group
      );

      updateWorkout({
        ...workout,
        groups: updatedGroups,
      });
    },
    [workout, updateWorkout]
  );

  // Delete group and move exercises out
  const deleteGroup = useCallback(
    (groupId: string) => {
      const updatedGroups = (workout.groups || []).filter(
        (group) => group.id !== groupId
      );

      // Move exercises out of the deleted group
      const updatedExercises = workout.exercises.map((ex) =>
        ex.groupId === groupId ? { ...ex, groupId: undefined } : ex
      );

      updateWorkout({
        ...workout,
        groups: updatedGroups,
        exercises: updatedExercises,
      });
    },
    [workout, updateWorkout]
  );

  return {
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
