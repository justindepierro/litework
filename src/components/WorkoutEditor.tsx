"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
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
  Package,
  Check,
} from "lucide-react";
import {
  WorkoutPlan,
  WorkoutExercise,
  ExerciseGroup,
  WorkoutBlock,
  BlockInstance,
} from "@/types";
import { apiClient } from "@/lib/api-client";
import ExerciseAutocomplete from "./ExerciseAutocomplete";
import ExerciseLibraryPanel from "./ExerciseLibraryPanel";
import { Badge } from "@/components/ui/Badge";
import BlockLibrary from "./BlockLibrary";
import BlockEditor from "./BlockEditor";
import BlockInstanceEditor from "./BlockInstanceEditor";
import { Input, Textarea } from "@/components/ui/Input";

interface WorkoutEditorProps {
  workout: WorkoutPlan;
  onChange: (workout: WorkoutPlan) => void;
  onClose: () => void;
}

// Individual Exercise Component - Memoized for performance
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
  onExerciseNameChange?: (name: string) => Promise<string>;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (exerciseId: string) => void;
}

// Individual Exercise Component - No longer memoized to ensure prop updates work
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
  onExerciseNameChange,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercise, setEditedExercise] = useState(exercise);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [inlineEditField, setInlineEditField] = useState<string | null>(null);

  const saveExercise = async () => {
    let updatedExercise = editedExercise;

    console.log("[ExerciseItem] saveExercise called:", {
      original: exercise.exerciseName,
      edited: editedExercise.exerciseName,
      exerciseId: exercise.id,
    });

    // If exercise name changed and we have the callback, add to library
    if (
      onExerciseNameChange &&
      editedExercise.exerciseName !== exercise.exerciseName &&
      editedExercise.exerciseName.trim().length > 0
    ) {
      const libraryExerciseId = await onExerciseNameChange(
        editedExercise.exerciseName
      );
      // Update the exerciseId with the one from the library
      updatedExercise = {
        ...editedExercise,
        exerciseId: libraryExerciseId,
      };
    }

    // [REMOVED] console.log("[ExerciseItem] Calling onUpdate with:", updatedExercise);
    onUpdate(updatedExercise);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedExercise(exercise);
    setIsEditing(false);
  };

  // Quick inline edit handler
  const handleInlineEdit = (
    field: string,
    value: string | number | undefined
  ) => {
    const updated = { ...exercise, [field]: value };
    onUpdate(updated);
    setInlineEditField(null);
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${groupId ? "ml-4" : ""} ${
        isSelected ? "border-blue-500 border-2 bg-blue-50" : "border-silver-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Selection checkbox */}
          {selectionMode && !groupId && onToggleSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(exercise.id)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          )}

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
                {/* Enhanced mobile exercise name input with autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-silver-700 mb-1">
                    Exercise Name
                  </label>
                  <ExerciseAutocomplete
                    value={editedExercise.exerciseName}
                    onChange={(name) =>
                      setEditedExercise({
                        ...editedExercise,
                        exerciseName: name,
                      })
                    }
                    onExerciseSelect={(exercise) => {
                      setEditedExercise({
                        ...editedExercise,
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        videoUrl: exercise.video_url,
                      } as WorkoutExercise);
                    }}
                    placeholder="Search or create exercise..."
                  />
                </div>

                {/* Sets and Reps Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Sets"
                    type="number"
                    value={editedExercise.sets}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditedExercise({
                        ...editedExercise,
                        sets: value === "" ? 0 : parseInt(value) || 0,
                      });
                    }}
                    onBlur={() => {
                      if (!editedExercise.sets || editedExercise.sets < 1) {
                        setEditedExercise({
                          ...editedExercise,
                          sets: 1,
                        });
                      }
                    }}
                    placeholder="Sets"
                    min={1}
                    fullWidth
                    inputSize="lg"
                  />
                  <Input
                    label="Reps"
                    type="number"
                    value={editedExercise.reps}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditedExercise({
                        ...editedExercise,
                        reps: value === "" ? 0 : parseInt(value) || 0,
                      });
                    }}
                    onBlur={() => {
                      if (!editedExercise.reps || editedExercise.reps < 1) {
                        setEditedExercise({
                          ...editedExercise,
                          reps: 1,
                        });
                      }
                    }}
                    placeholder="Reps"
                    min={1}
                    fullWidth
                    inputSize="lg"
                  />
                </div>

                {/* Weight Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-silver-700 mb-2">
                    Weight Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditedExercise({
                          ...editedExercise,
                          weightType: "fixed",
                          percentage: undefined,
                        })
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        editedExercise.weightType === "fixed"
                          ? "border-accent-blue bg-blue-50 text-accent-blue"
                          : "border-silver-300 text-silver-600 hover:border-silver-400"
                      }`}
                    >
                      Fixed
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditedExercise({
                          ...editedExercise,
                          weightType: "percentage",
                          weight: undefined,
                        })
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        editedExercise.weightType === "percentage"
                          ? "border-accent-blue bg-blue-50 text-accent-blue"
                          : "border-silver-300 text-silver-600 hover:border-silver-400"
                      }`}
                    >
                      % 1RM
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditedExercise({
                          ...editedExercise,
                          weightType: "bodyweight",
                          weight: undefined,
                          percentage: undefined,
                        })
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        editedExercise.weightType === "bodyweight"
                          ? "border-accent-blue bg-blue-50 text-accent-blue"
                          : "border-silver-300 text-silver-600 hover:border-silver-400"
                      }`}
                    >
                      Body
                    </button>
                  </div>
                </div>

                {/* Weight/Percentage Input */}
                {editedExercise.weightType === "fixed" && (
                  <div>
                    <label className="block text-sm font-medium text-silver-700 mb-1">
                      Weight (lbs)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedExercise.weight || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            weight:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Min"
                        min={0}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                      />
                      <span className="text-silver-600 font-medium">-</span>
                      <Input
                        type="number"
                        value={editedExercise.weightMax || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            weightMax:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Max (optional)"
                        min={0}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-silver-500 mt-1">
                      Leave max empty for single weight, or fill for range
                      (e.g., 20-30 lbs)
                    </p>
                  </div>
                )}

                {editedExercise.weightType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium text-silver-700 mb-1">
                      Percentage of 1RM
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedExercise.percentage || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            percentage:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Min %"
                        min={0}
                        max={100}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                      />
                      <span className="text-silver-600 font-medium">-</span>
                      <Input
                        type="number"
                        value={editedExercise.percentageMax || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            percentageMax:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Max % (optional)"
                        min={0}
                        max={100}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-silver-500 mt-1">
                      Leave max empty for single %, or fill for range (e.g.,
                      70-80%)
                    </p>
                  </div>
                )}

                {/* Rest Time and Tempo */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Rest (seconds)"
                    type="number"
                    value={editedExercise.restTime || ""}
                    onChange={(e) =>
                      setEditedExercise({
                        ...editedExercise,
                        restTime: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="Rest (sec)"
                    min={0}
                    step={15}
                    inputSize="lg"
                  />
                  <Input
                    label="Tempo"
                    type="text"
                    value={editedExercise.tempo || ""}
                    onChange={(e) =>
                      setEditedExercise({
                        ...editedExercise,
                        tempo: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g. 3-1-1-0"
                    inputSize="lg"
                  />
                </div>

                {/* Notes */}
                <Textarea
                  label="Notes"
                  value={editedExercise.notes || ""}
                  onChange={(e) =>
                    setEditedExercise({
                      ...editedExercise,
                      notes: e.target.value || undefined,
                    })
                  }
                  placeholder="Add notes about this exercise..."
                  rows={2}
                  fullWidth
                />

                {/* YouTube Video URL */}
                <Input
                  label="Demo Video (YouTube URL)"
                  type="url"
                  value={editedExercise.videoUrl || ""}
                  onChange={(e) =>
                    setEditedExercise({
                      ...editedExercise,
                      videoUrl: e.target.value || undefined,
                    } as WorkoutExercise)
                  }
                  placeholder="https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=VIDEO_ID"
                  helperText="Paste a YouTube link to show athletes how to perform this exercise"
                  inputSize="lg"
                  fullWidth
                />

                {/* Enhanced mobile action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={saveExercise}
                    variant="primary"
                    className="flex-1 py-4 sm:py-3 text-lg sm:text-base font-bold rounded-xl sm:rounded-lg"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    variant="secondary"
                    className="flex-1 py-4 sm:py-3 text-lg sm:text-base font-medium rounded-xl sm:rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Exercise Name - Click to search/edit */}
                {inlineEditField === "name" ? (
                  <div className="flex items-center gap-2">
                    <ExerciseAutocomplete
                      value={editedExercise.exerciseName}
                      onChange={(name) =>
                        setEditedExercise({
                          ...editedExercise,
                          exerciseName: name,
                        })
                      }
                      onExerciseSelect={(ex) => {
                        handleInlineEdit("exerciseName", ex.name);
                        if (ex.video_url) {
                          handleInlineEdit("videoUrl", ex.video_url);
                        }
                      }}
                      placeholder="Search exercises..."
                    />
                    <button
                      onClick={() => {
                        handleInlineEdit(
                          "exerciseName",
                          editedExercise.exerciseName
                        );
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setInlineEditField(null);
                        setEditedExercise(exercise);
                      }}
                      className="p-2 text-silver-500 hover:bg-gray-50 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <h4
                    className="font-medium text-heading-primary cursor-pointer hover:text-accent-blue transition-colors"
                    onClick={() => {
                      setInlineEditField("name");
                      setEditedExercise(exercise);
                    }}
                    title="Click to search/edit exercise"
                  >
                    {exercise.exerciseName}
                  </h4>
                )}

                {/* Sets, Reps, Weight - Inline editable */}
                <div className="flex items-center gap-3 text-sm text-body-secondary">
                  {/* Sets */}
                  {inlineEditField === "sets" ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editedExercise.sets}
                        onChange={(e) =>
                          setEditedExercise({
                            ...editedExercise,
                            sets: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-14 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="1"
                        autoFocus
                        onBlur={() =>
                          handleInlineEdit("sets", editedExercise.sets)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleInlineEdit("sets", editedExercise.sets);
                          if (e.key === "Escape") setInlineEditField(null);
                        }}
                      />
                      <span>sets</span>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-blue-50"
                      onClick={() => {
                        setInlineEditField("sets");
                        setEditedExercise(exercise);
                      }}
                      title="Click to edit"
                    >
                      {exercise.sets} sets
                    </span>
                  )}

                  <span>×</span>

                  {/* Reps */}
                  {inlineEditField === "reps" ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editedExercise.reps}
                        onChange={(e) =>
                          setEditedExercise({
                            ...editedExercise,
                            reps: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-14 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        min="1"
                        autoFocus
                        onBlur={() =>
                          handleInlineEdit("reps", editedExercise.reps)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleInlineEdit("reps", editedExercise.reps);
                          if (e.key === "Escape") setInlineEditField(null);
                        }}
                      />
                      <span>reps</span>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-blue-50"
                      onClick={() => {
                        setInlineEditField("reps");
                        setEditedExercise(exercise);
                      }}
                      title="Click to edit"
                    >
                      {exercise.reps} reps
                    </span>
                  )}

                  {/* Weight */}
                  {exercise.weightType === "fixed" && exercise.weight && (
                    <>
                      <span>@</span>
                      {inlineEditField === "weight" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editedExercise.weight || ""}
                            onChange={(e) =>
                              setEditedExercise({
                                ...editedExercise,
                                weight: parseFloat(e.target.value) || undefined,
                              })
                            }
                            className="w-16 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="5"
                            autoFocus
                            onBlur={() =>
                              handleInlineEdit("weight", editedExercise.weight)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleInlineEdit(
                                  "weight",
                                  editedExercise.weight
                                );
                              if (e.key === "Escape") setInlineEditField(null);
                            }}
                          />
                          <span>lbs</span>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-blue-50"
                          onClick={() => {
                            setInlineEditField("weight");
                            setEditedExercise(exercise);
                          }}
                          title="Click to edit"
                        >
                          {exercise.weight}
                          {exercise.weightMax ? `-${exercise.weightMax}` : ""}
                          lbs
                        </span>
                      )}
                    </>
                  )}

                  {/* Percentage */}
                  {exercise.weightType === "percentage" &&
                    exercise.percentage && (
                      <>
                        <span>@</span>
                        {inlineEditField === "percentage" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editedExercise.percentage || ""}
                              onChange={(e) =>
                                setEditedExercise({
                                  ...editedExercise,
                                  percentage:
                                    parseFloat(e.target.value) || undefined,
                                })
                              }
                              className="w-16 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                              min="0"
                              max="100"
                              step="5"
                              autoFocus
                              onBlur={() =>
                                handleInlineEdit(
                                  "percentage",
                                  editedExercise.percentage
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleInlineEdit(
                                    "percentage",
                                    editedExercise.percentage
                                  );
                                if (e.key === "Escape")
                                  setInlineEditField(null);
                              }}
                            />
                            <span>% 1RM</span>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-blue-50"
                            onClick={() => {
                              setInlineEditField("percentage");
                              setEditedExercise(exercise);
                            }}
                            title="Click to edit"
                          >
                            {exercise.percentage}
                            {exercise.percentageMax
                              ? `-${exercise.percentageMax}`
                              : ""}
                            % 1RM
                          </span>
                        )}
                      </>
                    )}

                  {/* Rest Time */}
                  {exercise.restTime && (
                    <>
                      <span>•</span>
                      {inlineEditField === "restTime" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editedExercise.restTime || ""}
                            onChange={(e) =>
                              setEditedExercise({
                                ...editedExercise,
                                restTime: parseInt(e.target.value) || undefined,
                              })
                            }
                            className="w-16 p-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="15"
                            autoFocus
                            onBlur={() =>
                              handleInlineEdit(
                                "restTime",
                                editedExercise.restTime
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleInlineEdit(
                                  "restTime",
                                  editedExercise.restTime
                                );
                              if (e.key === "Escape") setInlineEditField(null);
                            }}
                          />
                          <span>s rest</span>
                        </div>
                      ) : (
                        <span
                          className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-blue-50"
                          onClick={() => {
                            setInlineEditField("restTime");
                            setEditedExercise(exercise);
                          }}
                          title="Click to edit"
                        >
                          {exercise.restTime}s rest
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Edit button hint */}
                <p className="text-xs text-silver-400 italic">
                  Click any value to edit • Click ✏️ for advanced options
                </p>
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

// Block Instance Component - Shows blocks added to the workout
interface BlockInstanceItemProps {
  blockInstance: BlockInstance;
  exercises: WorkoutExercise[];
  groups: ExerciseGroup[];
  onCustomize: (blockInstance: BlockInstance) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: WorkoutExercise) => void;
  onMoveExercise: (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => void;
  onMoveExerciseToGroup: (exerciseId: string, targetGroupId?: string) => void;
  availableGroups: ExerciseGroup[];
  onExerciseNameChange?: (name: string) => Promise<string>;
}

const BlockInstanceItem: React.FC<BlockInstanceItemProps> = ({
  blockInstance,
  exercises,
  groups,
  onCustomize,
  onDeleteExercise,
  onUpdateExercise,
  onMoveExercise,
  onMoveExerciseToGroup,
  availableGroups,
  onExerciseNameChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const blockExercises = exercises.filter(
    (ex) => ex.blockInstanceId === blockInstance.id && !ex.groupId
  );
  const blockGroups = groups.filter(
    (g) => g.blockInstanceId === blockInstance.id
  );

  const hasCustomizations =
    blockInstance.customizations.modifiedExercises.length > 0 ||
    blockInstance.customizations.addedExercises.length > 0 ||
    blockInstance.customizations.removedExercises.length > 0;

  return (
    <div className="border-2 border-purple-300 rounded-lg bg-purple-50/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-silver-500 hover:text-purple-600"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <Package className="w-4 h-4 text-purple-600" />

          <div className="flex-1">
            <div className="font-medium text-silver-900">
              {blockInstance.instanceName || blockInstance.sourceBlockName}
            </div>
            <div className="text-xs text-silver-500">
              Block Template
              {hasCustomizations && (
                <Badge variant="info" size="sm" className="ml-2">
                  Customized
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCustomize(blockInstance)}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="ml-6 space-y-3 mt-3 border-l-2 border-purple-200 pl-4">
          {blockInstance.notes && (
            <div className="text-sm text-silver-600 italic bg-white/50 p-2 rounded">
              {blockInstance.notes}
            </div>
          )}

          {/* Block exercises (ungrouped) */}
          {blockExercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={0}
              onUpdate={onUpdateExercise}
              onDelete={onDeleteExercise}
              onMoveUp={() => onMoveExercise(exercise.id, "up")}
              onMoveDown={() => onMoveExercise(exercise.id, "down")}
              onMoveToGroup={(groupId) =>
                onMoveExerciseToGroup(exercise.id, groupId)
              }
              availableGroups={availableGroups}
              canMoveUp={false}
              canMoveDown={false}
              onExerciseNameChange={onExerciseNameChange}
            />
          ))}

          {/* Block groups */}
          {blockGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              exercises={exercises}
              onUpdateGroup={() => {}}
              onDeleteGroup={() => {}}
              onUpdateExercise={onUpdateExercise}
              onDeleteExercise={onDeleteExercise}
              onMoveExercise={onMoveExercise}
              onMoveExerciseToGroup={onMoveExerciseToGroup}
              availableGroups={availableGroups}
              onExerciseNameChange={onExerciseNameChange}
            />
          ))}
        </div>
      )}
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
  onExerciseNameChange?: (name: string) => Promise<string>;
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
  onExerciseNameChange,
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
            <div className="flex flex-col space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedGroup.name}
                  onChange={(e) =>
                    setEditedGroup({ ...editedGroup, name: e.target.value })
                  }
                  className="p-1 border border-silver-300 rounded text-sm flex-1"
                  placeholder="Group name"
                />
                <select
                  value={editedGroup.type}
                  onChange={(e) =>
                    setEditedGroup({
                      ...editedGroup,
                      type: e.target.value as
                        | "superset"
                        | "circuit"
                        | "section",
                    })
                  }
                  className="p-1 border border-silver-300 rounded text-sm"
                >
                  <option value="section">Section</option>
                  <option value="superset">Superset</option>
                  <option value="circuit">Circuit</option>
                </select>
              </div>

              {/* Rest Intervals */}
              <div className="flex items-center space-x-2 text-xs">
                {(editedGroup.type === "circuit" ||
                  editedGroup.type === "superset") && (
                  <>
                    <label className="flex items-center space-x-1">
                      <span className="text-gray-600">
                        Rest between exercises:
                      </span>
                      <input
                        type="number"
                        value={editedGroup.restBetweenExercises || ""}
                        onChange={(e) =>
                          setEditedGroup({
                            ...editedGroup,
                            restBetweenExercises:
                              parseInt(e.target.value) || undefined,
                          })
                        }
                        className="w-16 p-1 border border-silver-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-gray-600">sec</span>
                    </label>

                    <label className="flex items-center space-x-1">
                      <span className="text-gray-600">
                        Rest between rounds:
                      </span>
                      <input
                        type="number"
                        value={editedGroup.restBetweenRounds || ""}
                        onChange={(e) =>
                          setEditedGroup({
                            ...editedGroup,
                            restBetweenRounds:
                              parseInt(e.target.value) || undefined,
                          })
                        }
                        className="w-16 p-1 border border-silver-300 rounded"
                        placeholder="60"
                        min="0"
                      />
                      <span className="text-gray-600">sec</span>
                    </label>
                  </>
                )}

                {editedGroup.type === "circuit" && (
                  <label className="flex items-center space-x-1">
                    <span className="text-gray-600">Rounds:</span>
                    <input
                      type="number"
                      value={editedGroup.rounds || ""}
                      onChange={(e) =>
                        setEditedGroup({
                          ...editedGroup,
                          rounds: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="w-12 p-1 border border-silver-300 rounded"
                      placeholder="3"
                      min="1"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={saveGroup}
                  variant="primary"
                  size="sm"
                  className="text-xs px-2 py-1"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                  size="sm"
                  className="text-xs px-2 py-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-heading-primary">
                  {group.name}
                </h3>
                <span className="text-xs text-body-secondary capitalize">
                  ({group.type} - {groupExercises.length} exercises)
                </span>
              </div>

              {/* Display rest intervals */}
              {(group.restBetweenExercises ||
                group.restBetweenRounds ||
                group.rounds) && (
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  {group.restBetweenExercises !== undefined && (
                    <span>Rest between: {group.restBetweenExercises}s</span>
                  )}
                  {group.restBetweenRounds !== undefined && (
                    <span>Rest after round: {group.restBetweenRounds}s</span>
                  )}
                  {group.rounds !== undefined && (
                    <span>{group.rounds} rounds</span>
                  )}
                </div>
              )}
            </div>
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
              onExerciseNameChange={onExerciseNameChange}
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

// Group Creation Modal Component
interface GroupCreationModalProps {
  selectedCount: number;
  onClose: () => void;
  onCreateGroup: (
    groupType: "superset" | "circuit" | "section",
    rounds?: number,
    restBetweenExercises?: number,
    restBetweenRounds?: number
  ) => void;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  selectedCount,
  onClose,
  onCreateGroup,
}) => {
  const [groupType, setGroupType] = useState<
    "superset" | "circuit" | "section"
  >("superset");
  const [rounds, setRounds] = useState<number>(3);
  const [restBetweenExercises, setRestBetweenExercises] = useState<number>(30);
  const [restBetweenRounds, setRestBetweenRounds] = useState<number>(90);

  const handleSubmit = () => {
    onCreateGroup(
      groupType,
      groupType === "circuit" ? rounds : undefined,
      restBetweenExercises,
      groupType === "circuit" ? restBetweenRounds : undefined
    );
  };

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <ModalHeader
          title={`Create Group from ${selectedCount} Exercises`}
          icon={<Users className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
        <div className="space-y-6">
          {/* Group Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setGroupType("superset")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  groupType === "superset"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Zap className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Superset</div>
                <div className="text-xs text-gray-500 mt-1">2-4 exercises</div>
              </button>

              <button
                onClick={() => setGroupType("circuit")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  groupType === "circuit"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <RotateCcw className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Circuit</div>
                <div className="text-xs text-gray-500 mt-1">
                  Multiple rounds
                </div>
              </button>

              <button
                onClick={() => setGroupType("section")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  groupType === "section"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <Target className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Section</div>
                <div className="text-xs text-gray-500 mt-1">Workout phase</div>
              </button>
            </div>
          </div>

          {/* Rest Between Exercises */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rest Between Exercises (seconds)
            </label>
            <input
              type="number"
              value={restBetweenExercises}
              onChange={(e) =>
                setRestBetweenExercises(parseInt(e.target.value) || 0)
              }
              min="0"
              step="15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Circuit-specific settings */}
          {groupType === "circuit" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rounds
                </label>
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rest Between Rounds (seconds)
                </label>
                <input
                  type="number"
                  value={restBetweenRounds}
                  onChange={(e) =>
                    setRestBetweenRounds(parseInt(e.target.value) || 0)
                  }
                  min="0"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          </div>
        </ModalContent>
        <ModalFooter align="between">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-navy-400 text-navy-800 bg-white rounded-lg font-semibold hover:bg-navy-50 hover:border-navy-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors border-2 border-blue-700"
          >
            Create Group
          </button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
};

// Main Workout Editor Component
const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  workout,
  onChange,
  onClose,
}) => {
  // Workout name state - MUST be at top so it's available to updateWorkout
  const [workoutName, setWorkoutName] = useState(workout.name || "");

  // UI-only state (not part of workout data)
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [editingBlockInstance, setEditingBlockInstance] =
    useState<BlockInstance | null>(null);

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(
    new Set()
  );
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Fix orphaned exercises on load - if exercises have groupIds that don't exist, clear them
  useEffect(() => {
    const groupIds = new Set((workout.groups || []).map((g) => g.id));
    const orphanedExercises = workout.exercises.filter(
      (ex) => ex.groupId && !groupIds.has(ex.groupId)
    );

    if (orphanedExercises.length > 0) {
      console.log(
        "[WorkoutEditor] Found orphaned exercises, clearing invalid groupIds:",
        orphanedExercises.map((ex) => ({
          name: ex.exerciseName,
          oldGroupId: ex.groupId,
        }))
      );

      // Update exercises to remove invalid groupIds
      const fixedExercises = workout.exercises.map((ex) => {
        if (ex.groupId && !groupIds.has(ex.groupId)) {
          return { ...ex, groupId: undefined };
        }
        return ex;
      });

      // Trigger an update with fixed exercises
      onChange({
        ...workout,
        exercises: fixedExercises,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Update workout data - single source of truth through onChange
  const updateWorkout = useCallback(
    (updatedWorkout: WorkoutPlan) => {
      console.log("[WorkoutEditor] updateWorkout called:", {
        name: updatedWorkout.name,
        exerciseCount: updatedWorkout.exercises?.length,
        exercises: updatedWorkout.exercises?.map((ex) => ({
          id: ex.id,
          name: ex.exerciseName,
        })),
      });

      // CRITICAL: Always include the current workout name from local state
      // This ensures the name persists even when other properties change
      const workoutWithName = {
        ...updatedWorkout,
        name: workoutName || updatedWorkout.name,
      };

      // [REMOVED] console.log("[WorkoutEditor] Calling parent onChange with workout");
      onChange(workoutWithName);
    },
    [onChange, workoutName]
  );

  // Auto-add exercise to library when name is set/changed
  const handleExerciseNameChange = useCallback(
    async (exerciseName: string): Promise<string> => {
      if (!exerciseName || exerciseName.trim().length === 0) {
        return "new-exercise";
      }

      try {
        const response = await apiClient.findOrCreateExercise({
          name: exerciseName.trim(),
        });

        if (response && typeof response === "object" && "success" in response) {
          const apiResponse = response as {
            success: boolean;
            exercise?: { id: string };
            created?: boolean;
          };

          if (apiResponse.success && apiResponse.exercise) {
            // Return the exercise ID from the library
            return apiResponse.exercise.id;
          }
        }
      } catch (error) {
        console.error("Failed to add exercise to library:", error);
        // Don't block the user if API fails, just use a generated ID
      }

      // Fallback to generated ID if API call fails
      return `custom-${exerciseName.toLowerCase().replace(/\s+/g, "-")}`;
    },
    []
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
      order: workout.exercises.length + 1,
    };

    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });
  };

  // Add new group
  const addGroup = (type: "superset" | "circuit" | "section") => {
    const newGroup: ExerciseGroup = {
      id: Date.now().toString(),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      order: (workout.groups?.length || 0) + 1,
      ...(type === "circuit" && { rounds: 3, restBetweenRounds: 60 }),
    };

    updateWorkout({
      ...workout,
      groups: [...(workout.groups || []), newGroup],
    });
  };

  // Update exercise
  const updateExercise = (updatedExercise: WorkoutExercise) => {
    console.log("[WorkoutEditor] updateExercise called:", {
      id: updatedExercise.id,
      name: updatedExercise.exerciseName,
      currentExercises: workout.exercises.length,
    });

    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );

    console.log(
      "[WorkoutEditor] Updated exercises array:",
      updatedExercises.map((ex) => ({
        id: ex.id,
        name: ex.exerciseName,
      }))
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Delete exercise
  const deleteExercise = (exerciseId: string) => {
    const updatedExercises = workout.exercises.filter(
      (ex) => ex.id !== exerciseId
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Update group
  const updateGroup = (updatedGroup: ExerciseGroup) => {
    const updatedGroups = (workout.groups || []).map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group
    );

    updateWorkout({
      ...workout,
      groups: updatedGroups,
    });
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
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
  };

  // Multi-select functions
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExerciseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const selectAllExercises = () => {
    const ungroupedIds = workout.exercises
      .filter((ex) => !ex.groupId && !ex.blockInstanceId)
      .map((ex) => ex.id);
    setSelectedExerciseIds(new Set(ungroupedIds));
  };

  const clearSelection = () => {
    setSelectedExerciseIds(new Set());
    setSelectionMode(false);
  };

  const groupSelectedExercises = (
    groupType: "superset" | "circuit" | "section",
    rounds?: number,
    restBetweenExercises?: number,
    restBetweenRounds?: number
  ) => {
    if (selectedExerciseIds.size === 0) return;

    const newGroupId = Date.now().toString();
    const newGroup: ExerciseGroup = {
      id: newGroupId,
      name: `New ${groupType.charAt(0).toUpperCase() + groupType.slice(1)}`,
      type: groupType,
      order: (workout.groups?.length || 0) + 1,
      rounds: rounds,
      restBetweenExercises: restBetweenExercises,
      restBetweenRounds: restBetweenRounds,
    };

    // Move selected exercises into the new group
    const updatedExercises = workout.exercises.map((ex) =>
      selectedExerciseIds.has(ex.id) ? { ...ex, groupId: newGroupId } : ex
    );

    updateWorkout({
      ...workout,
      groups: [...(workout.groups || []), newGroup],
      exercises: updatedExercises,
    });

    clearSelection();
    setShowGroupModal(false);
  };

  // Move exercise up or down
  const moveExercise = (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => {
    const relevantExercises = groupId
      ? workout.exercises.filter((ex) => ex.groupId === groupId)
      : workout.exercises.filter((ex) => !ex.groupId);

    const exerciseIndex = relevantExercises.findIndex(
      (ex) => ex.id === exerciseId
    );
    if (exerciseIndex === -1) return;

    const newIndex = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    if (newIndex < 0 || newIndex >= relevantExercises.length) return;

    // Create new exercise array with reordered items
    const updatedExercises = [...workout.exercises];
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
      ...workout,
      exercises: updatedExercises.sort((a, b) => a.order - b.order),
    });
  };

  // Move exercise to different group
  const moveExerciseToGroup = (exerciseId: string, targetGroupId?: string) => {
    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, groupId: targetGroupId } : ex
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Insert a workout block
  const insertBlock = (block: WorkoutBlock) => {
    // Generate unique IDs for this block instance
    const timestamp = Date.now();
    const blockInstanceId = `block-instance-${timestamp}`;

    const maxOrder = Math.max(...workout.exercises.map((ex) => ex.order), 0);
    const maxGroupOrder = Math.max(
      ...(workout.groups || []).map((g) => g.order),
      0
    );

    // Clone exercises with new IDs, updated order, and block instance tracking
    const newExercises = block.exercises.map((ex, index) => ({
      ...ex,
      id: `${timestamp}-ex-${index}`,
      order: maxOrder + index + 1,
      groupId: ex.groupId ? `${timestamp}-group-${ex.groupId}` : undefined,
      blockInstanceId, // Track which instance this exercise belongs to
    }));

    // Clone groups with new IDs, updated order, and block instance tracking
    const newGroups = (block.groups || []).map((group, index) => ({
      ...group,
      id: `${timestamp}-group-${group.id}`,
      order: maxGroupOrder + index + 1,
      blockInstanceId, // Track which instance this group belongs to
    }));

    // Create the block instance metadata
    const blockInstance: BlockInstance = {
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
      estimatedDuration: block.estimatedDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update the workout with the new block instance
    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, ...newExercises],
      groups: [...(workout.groups || []), ...newGroups],
      blockInstances: [...(workout.blockInstances || []), blockInstance],
      estimatedDuration: workout.estimatedDuration + block.estimatedDuration,
    });

    // Close the block library
    setShowBlockLibrary(false);
  };

  // Handle saving a new block
  const handleSaveBlock = async (
    blockData: Omit<
      WorkoutBlock,
      "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
    >
  ) => {
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(blockData),
      });

      if (!response.ok) {
        throw new Error("Failed to create block");
      }

      const data = await response.json();

      // Optionally close the editor and show success message
      setShowBlockEditor(false);

      // Could add a toast notification here
      // [REMOVED] console.log("Block created successfully:", data.block);

      return data.block;
    } catch (error) {
      console.error("Error saving block:", error);
      throw error;
    }
  };

  // Handle block instance updates
  const handleSaveBlockInstance = (
    updatedExercises: WorkoutExercise[],
    updatedGroups: ExerciseGroup[],
    updatedInstance: BlockInstance
  ) => {
    // Replace exercises for this block instance
    const otherExercises = workout.exercises.filter(
      (ex) => ex.blockInstanceId !== updatedInstance.id
    );
    const otherGroups = (workout.groups || []).filter(
      (g) => g.blockInstanceId !== updatedInstance.id
    );

    // Replace block instance
    const otherInstances = (workout.blockInstances || []).filter(
      (bi) => bi.id !== updatedInstance.id
    );

    updateWorkout({
      ...workout,
      exercises: [...otherExercises, ...updatedExercises],
      groups: [...otherGroups, ...updatedGroups],
      blockInstances: [...otherInstances, updatedInstance],
    });
  };

  // Get ungrouped exercises
  const ungroupedExercises = workout.exercises.filter((ex) => !ex.groupId);

  // State for saving
  const [isSaving, setIsSaving] = useState(false);

  // Save workout to library
  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    setIsSaving(true);
    try {
      const workoutData = {
        ...workout,
        name: workoutName.trim(),
        updatedAt: new Date(),
        _shouldSave: true, // Flag to tell parent to save to API
      } as WorkoutPlan & { _shouldSave: boolean };

      // Update the parent component's workout
      // This will trigger the parent's onChange which should handle the save
      onChange(workoutData);

      // DON'T close here - let the parent handle closing after successful save
      // onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-lg w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex shadow-2xl">
        {/* Main workout editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced mobile header */}
          <div className="p-4 sm:p-6 border-b border-silver-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 pr-4">
                <Input
                  label="Workout Name"
                  type="text"
                  value={workoutName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setWorkoutName(newName);
                    // Immediately sync name to workout state
                    onChange({ ...workout, name: newName });
                  }}
                  placeholder="Enter workout name..."
                  className="text-xl sm:text-lg font-bold"
                  fullWidth
                />
              </div>
              <button
                onClick={onClose}
                className="text-silver-500 hover:text-silver-700 text-3xl sm:text-2xl w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors touch-manipulation shrink-0"
              >
                ×
              </button>
            </div>

            {/* Enhanced mobile action buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-2 flex-wrap">
                {!selectionMode ? (
                  <>
                    <Button
                      onClick={() => setShowBlockLibrary(true)}
                      variant="primary"
                      leftIcon={<Package className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Add Block
                    </Button>

                    <Button
                      onClick={addExercise}
                      variant="primary"
                      leftIcon={<Plus className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Add Exercise
                    </Button>

                    <Button
                      onClick={() => addGroup("superset")}
                      variant="secondary"
                      leftIcon={<Zap className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Add Superset
                    </Button>

                    <Button
                      onClick={() => addGroup("circuit")}
                      variant="secondary"
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Add Circuit
                    </Button>

                    <Button
                      onClick={() => addGroup("section")}
                      variant="secondary"
                      leftIcon={<Target className="w-4 h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Add Section
                    </Button>

                    {ungroupedExercises.filter((ex) => !ex.blockInstanceId)
                      .length > 0 && (
                      <Button
                        onClick={() => setSelectionMode(true)}
                        variant="success"
                        leftIcon={<Users className="w-5 h-5 sm:w-4 sm:h-4" />}
                        className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white border-green-700"
                      >
                        Group Exercises
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="col-span-full bg-blue-100 border-2 border-blue-400 rounded-lg p-3 text-sm text-blue-900 font-medium">
                      {selectedExerciseIds.size === 0
                        ? "Select exercises to group together"
                        : `${selectedExerciseIds.size} exercise${selectedExerciseIds.size > 1 ? "s" : ""} selected`}
                    </div>

                    <Button
                      onClick={selectAllExercises}
                      variant="secondary"
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Select All
                    </Button>

                    <Button
                      onClick={() => setShowGroupModal(true)}
                      disabled={selectedExerciseIds.size < 2}
                      variant="primary"
                      leftIcon={<Zap className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Create Group
                    </Button>

                    <Button
                      onClick={clearSelection}
                      variant="danger"
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white border-red-700"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* Save Workout Button - Separate Row */}
              {!selectionMode && (
                <Button
                  onClick={saveWorkout}
                  disabled={isSaving || !workoutName.trim()}
                  variant="primary"
                  fullWidth
                  className="py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-bold bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-2 border-green-700"
                >
                  {isSaving ? "Saving..." : "Save Workout"}
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced mobile content area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-4">
              {/* Block Instances */}
              {workout.blockInstances?.map((blockInstance) => (
                <BlockInstanceItem
                  key={blockInstance.id}
                  blockInstance={blockInstance}
                  exercises={workout.exercises}
                  groups={workout.groups || []}
                  onCustomize={setEditingBlockInstance}
                  onDeleteExercise={deleteExercise}
                  onUpdateExercise={updateExercise}
                  onMoveExercise={moveExercise}
                  onMoveExerciseToGroup={moveExerciseToGroup}
                  availableGroups={workout.groups || []}
                  onExerciseNameChange={handleExerciseNameChange}
                />
              ))}

              {/* Ungrouped Exercises (not in blocks) */}
              {ungroupedExercises
                .filter((ex) => !ex.blockInstanceId)
                .map((exercise, index) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onUpdate={updateExercise}
                    onDelete={deleteExercise}
                    onMoveUp={() => moveExercise(exercise.id, "up")}
                    onMoveDown={() => moveExercise(exercise.id, "down")}
                    onMoveToGroup={moveExerciseToGroup.bind(null, exercise.id)}
                    availableGroups={workout.groups || []}
                    canMoveUp={index > 0}
                    canMoveDown={index < ungroupedExercises.length - 1}
                    onExerciseNameChange={handleExerciseNameChange}
                    selectionMode={selectionMode}
                    isSelected={selectedExerciseIds.has(exercise.id)}
                    onToggleSelection={toggleExerciseSelection}
                  />
                ))}

              {/* Exercise Groups (not in blocks) */}
              {workout.groups
                ?.filter((g) => !g.blockInstanceId)
                .map((group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    exercises={workout.exercises}
                    onUpdateGroup={updateGroup}
                    onDeleteGroup={deleteGroup}
                    onUpdateExercise={updateExercise}
                    onDeleteExercise={deleteExercise}
                    onMoveExercise={moveExercise}
                    onMoveExerciseToGroup={moveExerciseToGroup}
                    availableGroups={workout.groups || []}
                    onExerciseNameChange={handleExerciseNameChange}
                  />
                ))}

              {/* Enhanced mobile empty state */}
              {ungroupedExercises.length === 0 &&
                (!workout.groups || workout.groups.length === 0) && (
                  <div className="text-center text-body-secondary py-16 sm:py-12">
                    <Dumbbell className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-4 text-silver-400" />
                    <p className="text-xl sm:text-lg font-medium mb-2">
                      No exercises added yet
                    </p>
                    <p className="text-base sm:text-sm leading-relaxed max-w-md mx-auto mb-4">
                      Click &quot;Add Exercise&quot; to start building your
                      workout, or use &quot;Add Block&quot; to insert pre-built
                      workout templates
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Exercise Library Panel - Right Side */}
        <ExerciseLibraryPanel onDragStart={() => {}} />
      </div>

      {/* Modals */}
      <BlockLibrary
        isOpen={showBlockLibrary}
        onClose={() => setShowBlockLibrary(false)}
        onSelectBlock={insertBlock}
        onCreateBlock={() => {
          setShowBlockLibrary(false);
          setShowBlockEditor(true);
        }}
        selectedBlocks={
          workout.blockInstances?.map((bi) => bi.sourceBlockId) || []
        }
      />

      {/* Block Editor Modal */}
      <BlockEditor
        isOpen={showBlockEditor}
        onClose={() => setShowBlockEditor(false)}
        onSave={handleSaveBlock}
      />

      {/* Block Instance Editor Modal */}
      {editingBlockInstance && (
        <BlockInstanceEditor
          isOpen={!!editingBlockInstance}
          onClose={() => setEditingBlockInstance(null)}
          blockInstance={editingBlockInstance}
          workout={workout}
          onSave={handleSaveBlockInstance}
        />
      )}

      {/* Group Creation Modal */}
      {showGroupModal && (
        <GroupCreationModal
          selectedCount={selectedExerciseIds.size}
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={groupSelectedExercises}
        />
      )}
    </ModalBackdrop>
  );
};

export default WorkoutEditor;
