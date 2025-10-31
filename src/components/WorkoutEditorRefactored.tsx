import React, { useState, useCallback } from "react";
import { X, Plus, Dumbbell } from "lucide-react";
import { WorkoutPlan, WorkoutExercise, ExerciseGroup } from "@/types";
import ExerciseItem from "./workout-editor/ExerciseItem";
import GroupItem from "./workout-editor/GroupItem";

interface WorkoutEditorProps {
  workout: WorkoutPlan;
  onChange: (workout: WorkoutPlan) => void;
  onClose: () => void;
}

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  workout,
  onChange,
  onClose,
}) => {
  const [localWorkout, setLocalWorkout] = useState<WorkoutPlan>(workout);

  const updateWorkout = useCallback(
    (updatedWorkout: WorkoutPlan) => {
      setLocalWorkout(updatedWorkout);
      onChange(updatedWorkout);
    },
    [onChange]
  );

  // Add new exercise
  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: "new-exercise",
      exerciseName: "New Exercise",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 0,
      restTime: 120,
      order: localWorkout.exercises.length + 1,
    };

    updateWorkout({
      ...localWorkout,
      exercises: [...localWorkout.exercises, newExercise],
    });
  };

  // Add new group
  const addGroup = (type: "superset" | "circuit" | "section") => {
    const newGroup: ExerciseGroup = {
      id: Date.now().toString(),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      order: (localWorkout.groups?.length || 0) + 1,
      ...(type === "circuit" && { rounds: 3, restBetweenRounds: 60 }),
    };

    updateWorkout({
      ...localWorkout,
      groups: [...(localWorkout.groups || []), newGroup],
    });
  };

  // Update exercise
  const updateExercise = (updatedExercise: WorkoutExercise) => {
    const updatedExercises = localWorkout.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );

    updateWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  // Delete exercise
  const deleteExercise = (exerciseId: string) => {
    const updatedExercises = localWorkout.exercises.filter(
      (ex) => ex.id !== exerciseId
    );

    updateWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  // Update group
  const updateGroup = (updatedGroup: ExerciseGroup) => {
    const updatedGroups = (localWorkout.groups || []).map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group
    );

    updateWorkout({
      ...localWorkout,
      groups: updatedGroups,
    });
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
    const updatedGroups = (localWorkout.groups || []).filter(
      (group) => group.id !== groupId
    );

    // Remove groupId from exercises in this group
    const updatedExercises = localWorkout.exercises.map((ex) =>
      ex.groupId === groupId ? { ...ex, groupId: undefined } : ex
    );

    updateWorkout({
      ...localWorkout,
      groups: updatedGroups,
      exercises: updatedExercises,
    });
  };

  // Move exercise up or down
  const moveExercise = (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => {
    const relevantExercises = groupId
      ? localWorkout.exercises.filter((ex) => ex.groupId === groupId)
      : localWorkout.exercises.filter((ex) => !ex.groupId);

    const exerciseIndex = relevantExercises.findIndex(
      (ex) => ex.id === exerciseId
    );
    if (exerciseIndex === -1) return;

    const newIndex = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    if (newIndex < 0 || newIndex >= relevantExercises.length) return;

    // Create new exercise array with reordered items
    const updatedExercises = [...localWorkout.exercises];
    const exerciseToMove = updatedExercises.find((ex) => ex.id === exerciseId);
    const exerciseToSwap = updatedExercises.find(
      (ex) => ex.id === relevantExercises[newIndex].id
    );

    if (exerciseToMove && exerciseToSwap) {
      const tempOrder = exerciseToMove.order;
      exerciseToMove.order = exerciseToSwap.order;
      exerciseToSwap.order = tempOrder;
    }

    updateWorkout({
      ...localWorkout,
      exercises: updatedExercises.sort((a, b) => a.order - b.order),
    });
  };

  // Get ungrouped exercises
  const ungroupedExercises = localWorkout.exercises.filter((ex) => !ex.groupId);

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Enhanced mobile header */}
        <div className="p-4 sm:p-6 border-b border-silver-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-primary text-xl sm:text-lg font-bold truncate pr-4">
              Edit: {localWorkout.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-white rounded-lg transition-colors"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={addExercise}
              className="flex items-center gap-2 px-3 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>

            <button
              onClick={() => addGroup("superset")}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Superset
            </button>

            <button
              onClick={() => addGroup("circuit")}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Circuit
            </button>

            <button
              onClick={() => addGroup("section")}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Section
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Exercise Groups */}
          {localWorkout.groups?.map((group, index) => (
            <GroupItem
              key={group.id}
              group={group}
              exercises={localWorkout.exercises}
              onUpdateGroup={updateGroup}
              onDeleteGroup={deleteGroup}
              onUpdateExercise={updateExercise}
              onDeleteExercise={deleteExercise}
              onMoveExerciseUp={(exerciseId) =>
                moveExercise(exerciseId, "up", group.id)
              }
              onMoveExerciseDown={(exerciseId) =>
                moveExercise(exerciseId, "down", group.id)
              }
              index={index}
            />
          ))}

          {/* Ungrouped Exercises */}
          {ungroupedExercises.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-heading-primary">
                <Dumbbell className="w-5 h-5" />
                <h3 className="font-medium">Individual Exercises</h3>
              </div>

              {ungroupedExercises.map((exercise, index) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  onUpdate={updateExercise}
                  onDelete={deleteExercise}
                  onMoveUp={(exerciseId) => moveExercise(exerciseId, "up")}
                  onMoveDown={(exerciseId) => moveExercise(exerciseId, "down")}
                  canMoveUp={index > 0}
                  canMoveDown={index < ungroupedExercises.length - 1}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {localWorkout.exercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-heading-primary font-medium mb-2">
                No exercises yet
              </h3>
              <p className="text-text-secondary mb-4">
                Start building your workout by adding exercises or creating
                exercise groups.
              </p>
              <button
                onClick={addExercise}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Add Your First Exercise
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;
