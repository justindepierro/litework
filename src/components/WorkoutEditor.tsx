"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  GripVertical,
  Trash2,
  Edit3,
  MoreVertical,
  Users,
  Zap,
  RotateCcw,
  Target,
  Dumbbell,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { WorkoutPlan, WorkoutExercise, ExerciseGroup } from "@/types";

interface WorkoutEditorProps {
  workout: WorkoutPlan;
  onChange: (workout: WorkoutPlan) => void;
  onClose: () => void;
}

// Individual Exercise Component
interface ExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  groupId?: string;
  onUpdate: (exercise: WorkoutExercise) => void;
  onDelete: (exerciseId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToGroup: (groupId?: string) => void;
  availableGroups: ExerciseGroup[];
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  groupId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToGroup,
  availableGroups,
  canMoveUp,
  canMoveDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercise, setEditedExercise] = useState(exercise);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const saveExercise = () => {
    onUpdate(editedExercise);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedExercise(exercise);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white border border-silver-300 rounded-lg p-4 ${groupId ? "ml-4" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex flex-col space-y-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`p-1 text-xs ${
                canMoveUp
                  ? "text-silver-500 hover:text-silver-700"
                  : "text-silver-300"
              }`}
              title="Move up"
            >
              ↑
            </button>
            <GripVertical className="w-4 h-4 text-silver-500" />
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`p-1 text-xs ${
                canMoveDown
                  ? "text-silver-500 hover:text-silver-700"
                  : "text-silver-300"
              }`}
              title="Move down"
            >
              ↓
            </button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                {/* Enhanced mobile exercise name input */}
                <input
                  type="text"
                  value={editedExercise.exerciseName}
                  onChange={(e) =>
                    setEditedExercise({
                      ...editedExercise,
                      exerciseName: e.target.value,
                    })
                  }
                  className="w-full p-4 sm:p-3 border-2 border-silver-300 rounded-xl sm:rounded-lg text-lg sm:text-base focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation"
                  placeholder="Exercise Name"
                />

                {/* Enhanced mobile input grid */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={editedExercise.sets}
                    onChange={(e) =>
                      setEditedExercise({
                        ...editedExercise,
                        sets: parseInt(e.target.value) || 0,
                      })
                    }
                    className="p-4 sm:p-3 border-2 border-silver-300 rounded-xl sm:rounded-lg text-lg sm:text-base focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation"
                    placeholder="Sets"
                    min="1"
                  />
                  <input
                    type="number"
                    value={editedExercise.reps}
                    onChange={(e) =>
                      setEditedExercise({
                        ...editedExercise,
                        reps: parseInt(e.target.value) || 0,
                      })
                    }
                    className="p-4 sm:p-3 border-2 border-silver-300 rounded-xl sm:rounded-lg text-lg sm:text-base focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation"
                    placeholder="Reps"
                    min="1"
                  />
                  {editedExercise.weightType === "fixed" && (
                    <input
                      type="number"
                      value={editedExercise.weight || 0}
                      onChange={(e) =>
                        setEditedExercise({
                          ...editedExercise,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="col-span-2 p-4 sm:p-3 border-2 border-silver-300 rounded-xl sm:rounded-lg text-lg sm:text-base focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation"
                      placeholder="Weight (lbs)"
                      min="0"
                    />
                  )}
                </div>

                {/* Enhanced mobile action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={saveExercise}
                    className="btn-primary flex-1 py-4 sm:py-3 text-lg sm:text-base font-bold rounded-xl sm:rounded-lg touch-manipulation"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn-secondary flex-1 py-4 sm:py-3 text-lg sm:text-base font-medium rounded-xl sm:rounded-lg touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-heading-primary">
                  {exercise.exerciseName}
                </h4>
                <div className="text-sm text-body-secondary mt-1">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.weightType === "fixed" && exercise.weight && (
                    <span> @ {exercise.weight}lbs</span>
                  )}
                  {exercise.weightType === "percentage" &&
                    exercise.percentage && (
                      <span> @ {exercise.percentage}% 1RM</span>
                    )}
                  {exercise.restTime && (
                    <span> • {exercise.restTime}s rest</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced mobile action buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="p-3 sm:p-2 text-silver-500 hover:text-accent-blue rounded-xl sm:rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
              title="Move to group"
            >
              <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>

            {showMoveMenu && (
              <div className="absolute right-0 top-12 sm:top-8 bg-white border-2 border-silver-300 rounded-xl shadow-lg z-10 min-w-48 sm:min-w-32">
                <button
                  onClick={() => {
                    onMoveToGroup(undefined);
                    setShowMoveMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 sm:px-3 sm:py-2 hover:bg-silver-100 rounded-t-xl touch-manipulation"
                >
                  Remove from group
                </button>
                {availableGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      onMoveToGroup(group.id);
                      setShowMoveMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 sm:px-3 sm:py-2 hover:bg-silver-100 touch-manipulation"
                  >
                    Move to {group.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-3 sm:p-2 text-silver-500 hover:text-accent-blue rounded-xl sm:rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
          >
            <Edit3 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(exercise.id)}
            className="p-3 sm:p-2 text-silver-500 hover:text-red-500 rounded-xl sm:rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Exercise Group Component
interface GroupItemProps {
  group: ExerciseGroup;
  exercises: WorkoutExercise[];
  onUpdateGroup: (group: ExerciseGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateExercise: (exercise: WorkoutExercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveExercise: (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => void;
  onMoveExerciseToGroup: (exerciseId: string, targetGroupId?: string) => void;
  availableGroups: ExerciseGroup[];
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  exercises,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateExercise,
  onDeleteExercise,
  onMoveExercise,
  onMoveExerciseToGroup,
  availableGroups,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState(group);

  const groupExercises = exercises.filter((ex) => ex.groupId === group.id);

  const getGroupIcon = () => {
    switch (group.type) {
      case "superset":
        return <Zap className="w-4 h-4" />;
      case "circuit":
        return <RotateCcw className="w-4 h-4" />;
      case "section":
        return <Target className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getGroupColor = () => {
    switch (group.type) {
      case "superset":
        return "border-accent-orange bg-accent-orange/5";
      case "circuit":
        return "border-accent-blue bg-accent-blue/5";
      case "section":
        return "border-accent-green bg-accent-green/5";
      default:
        return "border-silver-300 bg-silver-50";
    }
  };

  const saveGroup = () => {
    onUpdateGroup(editedGroup);
    setIsEditing(false);
  };

  return (
    <div className={`border-2 border-dashed rounded-lg p-4 ${getGroupColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-silver-500 hover:text-accent-blue"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {getGroupIcon()}

          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedGroup.name}
                onChange={(e) =>
                  setEditedGroup({ ...editedGroup, name: e.target.value })
                }
                className="p-1 border border-silver-300 rounded text-sm"
                placeholder="Group name"
              />
              <select
                value={editedGroup.type}
                onChange={(e) =>
                  setEditedGroup({
                    ...editedGroup,
                    type: e.target.value as "superset" | "circuit" | "section",
                  })
                }
                className="p-1 border border-silver-300 rounded text-sm"
              >
                <option value="section">Section</option>
                <option value="superset">Superset</option>
                <option value="circuit">Circuit</option>
              </select>
              <button
                onClick={saveGroup}
                className="btn-primary text-xs px-2 py-1"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-xs px-2 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-heading-primary">{group.name}</h3>
              <span className="text-xs text-body-secondary capitalize">
                ({group.type} - {groupExercises.length} exercises)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-silver-500 hover:text-accent-blue"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-1 text-silver-500 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {groupExercises.map((exercise, index) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              groupId={group.id}
              onUpdate={onUpdateExercise}
              onDelete={onDeleteExercise}
              onMoveUp={() => onMoveExercise(exercise.id, "up", group.id)}
              onMoveDown={() => onMoveExercise(exercise.id, "down", group.id)}
              onMoveToGroup={onMoveExerciseToGroup.bind(null, exercise.id)}
              availableGroups={availableGroups.filter((g) => g.id !== group.id)}
              canMoveUp={index > 0}
              canMoveDown={index < groupExercises.length - 1}
            />
          ))}

          {groupExercises.length === 0 && (
            <div className="text-center text-body-secondary text-sm py-4 border-2 border-dashed border-silver-300 rounded-lg">
              No exercises in this {group.type} yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Workout Editor Component
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

  // Move exercise to different group
  const moveExerciseToGroup = (exerciseId: string, targetGroupId?: string) => {
    const updatedExercises = localWorkout.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, groupId: targetGroupId } : ex
    );

    updateWorkout({
      ...localWorkout,
      exercises: updatedExercises,
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
              className="text-silver-500 hover:text-silver-700 text-3xl sm:text-2xl w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors touch-manipulation"
            >
              ×
            </button>
          </div>

          {/* Enhanced mobile action buttons */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-2">
            <button
              onClick={addExercise}
              className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium touch-manipulation"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Add Exercise</span>
            </button>

            <button
              onClick={() => addGroup("superset")}
              className="btn-secondary flex items-center justify-center gap-2 py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium touch-manipulation"
            >
              <Zap className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Add Superset</span>
            </button>

            <button
              onClick={() => addGroup("circuit")}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Add Circuit</span>
            </button>

            <button
              onClick={() => addGroup("section")}
              className="btn-secondary flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {/* Enhanced mobile content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6 sm:space-y-4">
            {/* Ungrouped Exercises */}
            {ungroupedExercises.map((exercise, index) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                onUpdate={updateExercise}
                onDelete={deleteExercise}
                onMoveUp={() => moveExercise(exercise.id, "up")}
                onMoveDown={() => moveExercise(exercise.id, "down")}
                onMoveToGroup={moveExerciseToGroup.bind(null, exercise.id)}
                availableGroups={localWorkout.groups || []}
                canMoveUp={index > 0}
                canMoveDown={index < ungroupedExercises.length - 1}
              />
            ))}

            {/* Exercise Groups */}
            {localWorkout.groups?.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                exercises={localWorkout.exercises}
                onUpdateGroup={updateGroup}
                onDeleteGroup={deleteGroup}
                onUpdateExercise={updateExercise}
                onDeleteExercise={deleteExercise}
                onMoveExercise={moveExercise}
                onMoveExerciseToGroup={moveExerciseToGroup}
                availableGroups={localWorkout.groups || []}
              />
            ))}

            {/* Enhanced mobile empty state */}
            {ungroupedExercises.length === 0 &&
              (!localWorkout.groups || localWorkout.groups.length === 0) && (
                <div className="text-center text-body-secondary py-16 sm:py-12">
                  <Dumbbell className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-4 text-silver-400" />
                  <p className="text-xl sm:text-lg font-medium mb-2">
                    No exercises added yet
                  </p>
                  <p className="text-base sm:text-sm leading-relaxed max-w-md mx-auto">
                    Click &quot;Add Exercise&quot; to start building your
                    workout
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;
