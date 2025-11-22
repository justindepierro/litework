import { useCallback, useState } from "react";
import {
  WorkoutBlock,
  BlockInstance,
  WorkoutExercise,
  ExerciseGroup,
  WorkoutPlan,
} from "@/types";

/**
 * Hook for managing workout block operations
 * Handles inserting blocks, saving blocks, and managing block instances
 */
export function useBlockOperations(
  workout: WorkoutPlan,
  updateWorkout: (workout: WorkoutPlan) => void
) {
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [editingBlockInstance, setEditingBlockInstance] =
    useState<BlockInstance | null>(null);

  // Insert a block from library into the workout
  const insertBlock = useCallback(
    (block: WorkoutBlock) => {
      // Create a new block instance
      const blockInstanceId = `block-${Date.now()}`;
      const newBlockInstance: BlockInstance = {
        id: blockInstanceId,
        sourceBlockId: block.id,
        sourceBlockName: block.name,
        customizations: {
          modifiedExercises: [],
          addedExercises: [],
          removedExercises: [],
          modifiedGroups: [],
          addedGroups: [],
          removedGroups: [],
        },
        estimatedDuration: block.estimatedDuration || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Clone exercises with new IDs
      const newExercises: WorkoutExercise[] = (block.exercises || []).map(
        (ex, index) => ({
          ...ex,
          id: `${blockInstanceId}-ex-${Date.now()}-${index}`,
          blockInstanceId: blockInstanceId,
          order: workout.exercises.length + index + 1,
        })
      );

      // Clone groups with new IDs
      const groupIdMap = new Map<string, string>();
      const newGroups: ExerciseGroup[] = (block.groups || []).map((group) => {
        const newGroupId = `${blockInstanceId}-group-${Date.now()}-${group.id}`;
        groupIdMap.set(group.id, newGroupId);
        return {
          ...group,
          id: newGroupId,
          blockInstanceId: blockInstanceId,
        };
      });

      // Update exercise groupIds to match new group IDs
      const exercisesWithUpdatedGroups = newExercises.map((ex) =>
        ex.groupId && groupIdMap.has(ex.groupId)
          ? { ...ex, groupId: groupIdMap.get(ex.groupId) }
          : ex
      );

      updateWorkout({
        ...workout,
        blockInstances: [...(workout.blockInstances || []), newBlockInstance],
        exercises: [...workout.exercises, ...exercisesWithUpdatedGroups],
        groups: [...(workout.groups || []), ...newGroups],
      });

      setShowBlockLibrary(false);
    },
    [workout, updateWorkout]
  );

  // Save current workout section as a new block
  const handleSaveBlock = useCallback(
    async (blockData: {
      name: string;
      description?: string;
      category?: string;
      exercises: WorkoutExercise[];
      groups?: ExerciseGroup[];
    }) => {
      try {
        const response = await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blockData),
        });

        if (!response.ok) {
          throw new Error("Failed to save block");
        }

        return await response.json();
      } catch (error) {
        console.error("Error saving block:", error);
        throw error;
      }
    },
    []
  );

  // Update an existing block instance in the workout
  const handleSaveBlockInstance = useCallback(
    (
      exercises: WorkoutExercise[],
      groups: ExerciseGroup[],
      instance: BlockInstance
    ) => {
      // Replace exercises for this block instance
      const otherExercises = workout.exercises.filter(
        (ex) => ex.blockInstanceId !== instance.id
      );
      const updatedExercises = [...otherExercises, ...exercises];

      // Replace groups for this block instance
      const otherGroups = (workout.groups || []).filter(
        (group) => group.blockInstanceId !== instance.id
      );
      const updatedGroups = [...otherGroups, ...groups];

      updateWorkout({
        ...workout,
        exercises: updatedExercises,
        groups: updatedGroups,
      });

      setEditingBlockInstance(null);
      setShowBlockEditor(false);
    },
    [workout, updateWorkout]
  );

  // Delete a block instance and its exercises/groups
  const deleteBlockInstance = useCallback(
    (instanceId: string) => {
      const updatedBlockInstances = (workout.blockInstances || []).filter(
        (instance) => instance.id !== instanceId
      );
      const updatedExercises = workout.exercises.filter(
        (ex) => ex.blockInstanceId !== instanceId
      );
      const updatedGroups = (workout.groups || []).filter(
        (group) => group.blockInstanceId !== instanceId
      );

      updateWorkout({
        ...workout,
        blockInstances: updatedBlockInstances,
        exercises: updatedExercises,
        groups: updatedGroups,
      });
    },
    [workout, updateWorkout]
  );

  return {
    // State
    showBlockLibrary,
    setShowBlockLibrary,
    showBlockEditor,
    setShowBlockEditor,
    editingBlockInstance,
    setEditingBlockInstance,

    // Operations
    insertBlock,
    handleSaveBlock,
    handleSaveBlockInstance,
    deleteBlockInstance,
  };
}
