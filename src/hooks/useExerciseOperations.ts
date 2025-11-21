import { useState, useCallback } from "react";
import { WorkoutExercise, ExerciseGroup, WorkoutPlan } from "@/types";

/**
 * Hook for managing exercise operations in WorkoutEditor
 * Handles adding, updating, deleting, and moving exercises
 */
export function useExerciseOperations(
  workout: WorkoutPlan,
  updateWorkout: (workout: WorkoutPlan) => void
) {
  // Add new blank exercise
  const addExercise = useCallback(() => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: "new-exercise",
      exerciseName: "New Exercise",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 0,
      restTime: 120,
      order: workout.exercises.length + 1,
    };

    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });
  }, [workout, updateWorkout]);

  // Add exercise from library
  const addExerciseFromLibrary = useCallback(
    (libraryExercise: {
      id: string;
      name: string;
      video_url?: string;
    }) => {
      const newExercise: WorkoutExercise = {
        id: Date.now().toString(),
        exerciseId: libraryExercise.id,
        exerciseName: libraryExercise.name,
        sets: 3,
        reps: 10,
        weightType: "fixed",
        weight: 0,
        restTime: 120,
        order: workout.exercises.length + 1,
        videoUrl: libraryExercise.video_url,
      };

      updateWorkout({
        ...workout,
        exercises: [...workout.exercises, newExercise],
      });
    },
    [workout, updateWorkout]
  );

  // Update existing exercise
  const updateExercise = useCallback(
    (updatedExercise: WorkoutExercise) => {
      const updatedExercises = workout.exercises.map((ex) =>
        ex.id === updatedExercise.id ? updatedExercise : ex
      );

      updateWorkout({
        ...workout,
        exercises: updatedExercises,
      });
    },
    [workout, updateWorkout]
  );

  // Delete exercise
  const deleteExercise = useCallback(
    (exerciseId: string) => {
      const updatedExercises = workout.exercises.filter(
        (ex) => ex.id !== exerciseId
      );

      updateWorkout({
        ...workout,
        exercises: updatedExercises,
      });
    },
    [workout, updateWorkout]
  );

  // Move exercise up or down in order
  const moveExercise = useCallback(
    (exerciseId: string, direction: "up" | "down", groupId?: string) => {
      const relevantExercises = groupId
        ? workout.exercises.filter((ex) => ex.groupId === groupId)
        : workout.exercises.filter((ex) => !ex.groupId);

      const exerciseIndex = relevantExercises.findIndex(
        (ex) => ex.id === exerciseId
      );
      if (exerciseIndex === -1) return;

      const newIndex =
        direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
      if (newIndex < 0 || newIndex >= relevantExercises.length) return;

      // Create new exercise array with reordered items
      const updatedExercises = [...workout.exercises];
      const exerciseToMove = updatedExercises.find(
        (ex) => ex.id === exerciseId
      );
      const exerciseToSwap = updatedExercises.find(
        (ex) => ex.id === relevantExercises[newIndex].id
      );

      if (exerciseToMove && exerciseToSwap) {
        const tempOrder = exerciseToMove.order;
        exerciseToMove.order = exerciseToSwap.order;
        exerciseToSwap.order = tempOrder;
      }

      updateWorkout({
        ...workout,
        exercises: updatedExercises.sort((a, b) => a.order - b.order),
      });
    },
    [workout, updateWorkout]
  );

  // Move exercise to a different group (or remove from group)
  const moveExerciseToGroup = useCallback(
    (exerciseId: string, targetGroupId?: string) => {
      const updatedExercises = workout.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, groupId: targetGroupId } : ex
      );

      updateWorkout({
        ...workout,
        exercises: updatedExercises,
      });
    },
    [workout, updateWorkout]
  );

  return {
    addExercise,
    addExerciseFromLibrary,
    updateExercise,
    deleteExercise,
    moveExercise,
    moveExerciseToGroup,
  };
}
