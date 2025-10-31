import React, { useState } from "react";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
  RotateCcw,
  Percent,
} from "lucide-react";
import { WorkoutExercise } from "@/types";

interface ExerciseItemProps {
  exercise: WorkoutExercise;
  onUpdate: (exercise: WorkoutExercise) => void;
  onDelete: (exerciseId: string) => void;
  onMoveUp: (exerciseId: string) => void;
  onMoveDown: (exerciseId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  index: number;
  groupId?: string;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  index,
  groupId,
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

  if (isEditing) {
    return (
      <div className="bg-surface-primary border border-border-subtle rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-heading-primary font-medium">Edit Exercise</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={saveExercise}
              className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded-md transition-colors"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-2 text-text-secondary hover:bg-surface-secondary rounded-md transition-colors"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              value={editedExercise.exerciseName}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise,
                  exerciseName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Sets
            </label>
            <input
              type="number"
              value={editedExercise.sets}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise,
                  sets: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Reps
            </label>
            <input
              type="number"
              value={editedExercise.reps}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise,
                  reps: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Weight Type
            </label>
            <select
              value={editedExercise.weightType}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise,
                  weightType: e.target.value as
                    | "bodyweight"
                    | "percentage"
                    | "fixed",
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            >
              <option value="bodyweight">Bodyweight</option>
              <option value="percentage">Percentage of 1RM</option>
              <option value="fixed">Fixed Weight</option>
            </select>
          </div>

          {editedExercise.weightType === "percentage" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Percentage (%)
              </label>
              <input
                type="number"
                value={editedExercise.percentage || 70}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise,
                    percentage: parseInt(e.target.value) || 70,
                  })
                }
                className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                min="1"
                max="150"
              />
            </div>
          )}

          {editedExercise.weightType === "fixed" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={editedExercise.weight || 0}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise,
                    weight: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                min="0"
                step="0.5"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Rest Time (seconds)
            </label>
            <input
              type="number"
              value={editedExercise.restTime || 120}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise,
                  restTime: parseInt(e.target.value) || 120,
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              min="30"
              step="15"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes (optional)
          </label>
          <textarea
            value={editedExercise.notes || ""}
            onChange={(e) =>
              setEditedExercise({
                ...editedExercise,
                notes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary resize-none"
            rows={2}
            placeholder="Exercise-specific instructions or modifications..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary border border-border-subtle rounded-lg p-4 hover:border-accent-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-primary/10 rounded-lg flex items-center justify-center text-accent-primary font-medium text-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="text-heading-primary font-medium">
              {exercise.exerciseName}
            </h4>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>
                {exercise.sets} sets × {exercise.reps} reps
              </span>

              {exercise.weightType === "percentage" && (
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {exercise.percentage}% 1RM
                </span>
              )}

              {exercise.weightType === "fixed" && (
                <span>{exercise.weight} lbs</span>
              )}

              {exercise.weightType === "bodyweight" && <span>Bodyweight</span>}

              {exercise.restTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(exercise.restTime / 60)}:
                  {(exercise.restTime % 60).toString().padStart(2, "0")}
                </span>
              )}
            </div>

            {exercise.notes && (
              <p className="text-sm text-text-secondary mt-1 italic">
                {exercise.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoveMenu && (
              <div className="absolute right-0 top-full mt-1 bg-surface-primary border border-border-subtle rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMoveMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-text-primary hover:bg-surface-secondary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>

                {canMoveUp && (
                  <button
                    onClick={() => {
                      onMoveUp(exercise.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-text-primary hover:bg-surface-secondary flex items-center gap-2"
                  >
                    <ArrowUp className="w-4 h-4" />
                    Move Up
                  </button>
                )}

                {canMoveDown && (
                  <button
                    onClick={() => {
                      onMoveDown(exercise.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-text-primary hover:bg-surface-secondary flex items-center gap-2"
                  >
                    <ArrowDown className="w-4 h-4" />
                    Move Down
                  </button>
                )}

                <button
                  onClick={() => {
                    onDelete(exercise.id);
                    setShowMoveMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseItem;
