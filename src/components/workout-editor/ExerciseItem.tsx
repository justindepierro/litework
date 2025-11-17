"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { GripVertical, Trash2, Edit3, MoreVertical, Check } from "lucide-react";
import { WorkoutExercise, ExerciseGroup, KPITag } from "@/types";
import ExerciseAutocomplete from "../ExerciseAutocomplete";
import { SaveStatus, useSaveStatus } from "@/components/ui/SaveStatus";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label, Caption } from "@/components/ui/Typography";

export interface ExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  groupId?: string;
  onUpdate: (exercise: WorkoutExercise) => void;
  onDelete: (exerciseId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToGroup: (groupId?: string) => void;
  availableGroups: ExerciseGroup[];
  availableKPIs?: KPITag[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onExerciseNameChange?: (name: string) => Promise<string>;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (exerciseId: string) => void;
}

// Individual Exercise Component - No longer memoized to ensure prop updates work
export const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  groupId,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToGroup,
  availableGroups,
  availableKPIs = [],
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
  const [saveStatus, setSaving, setSaved, setError, setIdle] = useSaveStatus();

  const saveExercise = async () => {
    let updatedExercise = editedExercise;

    setSaving();

    // [REMOVED] console.log("[ExerciseItem] saveExercise called:", { original: exercise.exerciseName, edited: editedExercise.exerciseName, exerciseId: exercise.id });

    try {
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
      setSaved();
      setIsEditing(false);
    } catch (error) {
      console.error("[ExerciseItem] Error saving:", error);
      setError();
    }
  };

  const cancelEdit = () => {
    setEditedExercise(exercise);
    setIsEditing(false);
    setIdle();
  };

  // Quick inline edit handler with save feedback
  const handleInlineEdit = async (
    field: string,
    value: string | number | undefined
  ) => {
    setSaving();
    try {
      const updated = { ...exercise, [field]: value };
      onUpdate(updated);
      setSaved();
      setTimeout(() => setIdle(), 2000); // Auto-hide after 2s
    } catch (error) {
      console.error("[ExerciseItem] Error in inline edit:", error);
      setError();
    } finally {
      setInlineEditField(null);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 ${groupId ? "ml-4" : ""} ${
        isSelected
          ? "border-(--accent-blue-500) border-2 bg-(--accent-blue-50)"
          : "border-silver-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Selection checkbox */}
          {selectionMode && !groupId && onToggleSelection && (
            <Checkbox
              checked={isSelected || false}
              onChange={() => onToggleSelection(exercise.id)}
              label=""
              aria-label={`Select ${exercise.exerciseName}`}
            />
          )}

          <div className="flex flex-col space-y-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              aria-label="Move exercise up"
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
              aria-label="Move exercise down"
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
                  <Label className="block mb-1">Exercise Name</Label>
                  <ExerciseAutocomplete
                    value={editedExercise.exerciseName}
                    onChange={(name) =>
                      setEditedExercise({
                        ...editedExercise,
                        exerciseName: name,
                      })
                    }
                    onExerciseSelect={(exercise) => {
                      const updated = {
                        ...editedExercise,
                        exerciseId: exercise.id,
                        exerciseName: exercise.name,
                        videoUrl: exercise.video_url,
                      } as WorkoutExercise;
                      setEditedExercise(updated);
                      // Auto-save when exercise is selected from library
                      onUpdate(updated);
                      setIsEditing(false);
                    }}
                    placeholder="Search or create exercise..."
                  />
                </div>

                {/* Sets and Reps Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Sets"
                    type="number"
                    value={editedExercise.sets || ""}
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
                    placeholder="3"
                    min={1}
                    fullWidth
                    inputSize="lg"
                    selectOnFocus
                  />
                  <div>
                    <Input
                      label="Reps"
                      type="number"
                      value={editedExercise.reps || ""}
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
                      placeholder="10"
                      min={1}
                      fullWidth
                      inputSize="lg"
                      selectOnFocus
                    />
                    <div className="mt-2">
                      <Checkbox
                        checked={editedExercise.eachSide || false}
                        onChange={(checked) =>
                          setEditedExercise({
                            ...editedExercise,
                            eachSide: checked,
                          })
                        }
                        label="Each side"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Type Selection */}
                <div>
                  <Label className="block mb-2">Weight Type</Label>
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
                          ? "border-accent-blue bg-(--accent-blue-50) text-accent-blue"
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
                          ? "border-accent-blue bg-(--accent-blue-50) text-accent-blue"
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
                          ? "border-accent-blue bg-(--accent-blue-50) text-accent-blue"
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
                    <Label className="block mb-1">Weight (lbs)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedExercise.weight ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            weight:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="135"
                        min={0}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                        selectOnFocus
                      />
                      <span className="text-silver-600 font-medium">-</span>
                      <Input
                        type="number"
                        value={editedExercise.weightMax ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            weightMax:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Max"
                        min={0}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                        selectOnFocus
                      />
                    </div>
                    <Caption variant="muted" className="mt-1">
                      Leave max empty for single weight, or fill for range
                      (e.g., 20-30 lbs)
                    </Caption>
                  </div>
                )}

                {editedExercise.weightType === "percentage" && (
                  <div>
                    <Label className="block mb-1">Percentage of 1RM</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedExercise.percentage ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            percentage:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="75"
                        min={0}
                        max={100}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                        selectOnFocus
                      />
                      <span className="text-silver-600 font-medium">-</span>
                      <Input
                        type="number"
                        value={editedExercise.percentageMax ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditedExercise({
                            ...editedExercise,
                            percentageMax:
                              value === "" ? undefined : parseFloat(value),
                          });
                        }}
                        placeholder="Max %"
                        min={0}
                        max={100}
                        step={5}
                        inputSize="lg"
                        className="flex-1"
                        selectOnFocus
                      />
                    </div>
                    <Caption variant="muted" className="mt-1">
                      Leave max empty for single %, or fill for range (e.g.,
                      70-80%)
                    </Caption>
                  </div>
                )}

                {/* Rest Time and Tempo */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Rest (seconds)"
                    type="number"
                    value={editedExercise.restTime ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditedExercise({
                        ...editedExercise,
                        restTime: value === "" ? undefined : parseInt(value),
                      });
                    }}
                    placeholder="60"
                    min={0}
                    step={15}
                    inputSize="lg"
                    selectOnFocus
                  />
                  <Input
                    label="Tempo"
                    type="text"
                    value={editedExercise.tempo ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditedExercise({
                        ...editedExercise,
                        tempo: value === "" ? undefined : value,
                      });
                    }}
                    placeholder="3-1-1-0"
                    inputSize="lg"
                    selectOnFocus
                  />
                </div>

                {/* Notes */}
                <Textarea
                  label="Notes"
                  value={editedExercise.notes ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditedExercise({
                      ...editedExercise,
                      notes: value === "" ? undefined : value,
                    });
                  }}
                  placeholder="Add notes about this exercise..."
                  rows={2}
                  fullWidth
                />

                {/* KPI Tags */}
                {availableKPIs.length > 0 && (
                  <div>
                    <Label className="block mb-2">
                      KPI Tags
                      <span className="text-xs text-silver-500 ml-2 font-normal">
                        (Which KPIs does this exercise develop?)
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {availableKPIs.map((kpi) => {
                        const isSelected = editedExercise.kpiTagIds?.includes(
                          kpi.id
                        );
                        return (
                          <button
                            key={kpi.id}
                            type="button"
                            onClick={() => {
                              const currentTags =
                                editedExercise.kpiTagIds || [];
                              const newTags = isSelected
                                ? currentTags.filter((id) => id !== kpi.id)
                                : [...currentTags, kpi.id];
                              setEditedExercise({
                                ...editedExercise,
                                kpiTagIds:
                                  newTags.length > 0 ? newTags : undefined,
                              });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? "border-2 shadow-sm"
                                : "border-2 border-dashed opacity-60 hover:opacity-100"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? kpi.color
                                : "transparent",
                              borderColor: kpi.color,
                              color: isSelected ? "#fff" : kpi.color,
                            }}
                          >
                            {kpi.displayName}
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                    {editedExercise.kpiTagIds &&
                      editedExercise.kpiTagIds.length > 0 && (
                        <Caption variant="default" className="mt-2">
                          {editedExercise.kpiTagIds.length} KPI
                          {editedExercise.kpiTagIds.length !== 1
                            ? "s"
                            : ""}{" "}
                          selected
                        </Caption>
                      )}
                  </div>
                )}

                {/* YouTube Video URL */}
                {/* Video URL */}
                <Input
                  label="Video URL"
                  type="url"
                  value={editedExercise.videoUrl ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditedExercise({
                      ...editedExercise,
                      videoUrl: value === "" ? undefined : value,
                    });
                  }}
                  placeholder="https://youtu.be/abc123"
                  fullWidth
                  inputSize="lg"
                  selectOnFocus
                />

                {/* Enhanced mobile action buttons */}
                <div className="flex gap-3 items-center">
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
                  <SaveStatus
                    status={saveStatus}
                    onHidden={setIdle}
                    size="md"
                  />
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
                      className="p-2 text-(--status-success) hover:bg-(--status-success-light) rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setInlineEditField(null);
                        setEditedExercise(exercise);
                      }}
                      className="p-2 text-silver-500 hover:bg-(--interactive-hover) rounded"
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
                        className="w-14 p-1 border border-(--accent-blue-300) rounded focus:ring-2 focus:ring-(--accent-blue-500)"
                        min="1"
                        autoFocus
                        onFocus={(e) => e.target.select()}
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
                      className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-(--accent-blue-50)"
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
                        className="w-14 p-1 border border-(--accent-blue-300) rounded focus:ring-2 focus:ring-(--accent-blue-500)"
                        min="1"
                        autoFocus
                        onFocus={(e) => e.target.select()}
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
                      className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-(--accent-blue-50)"
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
                            className="w-16 p-1 border border-(--accent-blue-300) rounded focus:ring-2 focus:ring-(--accent-blue-500)"
                            min="0"
                            step="5"
                            autoFocus
                            onFocus={(e) => e.target.select()}
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
                          className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-(--accent-blue-50)"
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
                              className="w-16 p-1 border border-(--accent-blue-300) rounded focus:ring-2 focus:ring-(--accent-blue-500)"
                              min="0"
                              max="100"
                              step="5"
                              autoFocus
                              onFocus={(e) => e.target.select()}
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
                            className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-(--accent-blue-50)"
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
                            className="w-16 p-1 border border-(--accent-blue-300) rounded focus:ring-2 focus:ring-(--accent-blue-500)"
                            min="0"
                            step="15"
                            autoFocus
                            onFocus={(e) => e.target.select()}
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
                          className="cursor-pointer hover:text-accent-blue px-1 py-0.5 rounded hover:bg-(--accent-blue-50)"
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

                {/* KPI Tags Display */}
                {(isEditing ? editedExercise : exercise).kpiTagIds &&
                  ((isEditing ? editedExercise : exercise).kpiTagIds?.length ??
                    0) > 0 &&
                  availableKPIs.length > 0 && (
                    <div
                      key={`kpi-tags-${((isEditing ? editedExercise : exercise).kpiTagIds ?? []).join("-")}`}
                      className="flex flex-wrap gap-1.5 mt-2"
                    >
                      {(
                        (isEditing ? editedExercise : exercise).kpiTagIds ?? []
                      ).map((tagId) => {
                        const kpi = availableKPIs.find((k) => k.id === tagId);
                        if (!kpi) return null;
                        return (
                          <span
                            key={`${tagId}-${kpi.id}`}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: kpi.color }}
                            title={`Develops ${kpi.displayName}`}
                          >
                            {kpi.displayName}
                          </span>
                        );
                      })}
                    </div>
                  )}

                {/* Edit button hint */}
                <Caption variant="muted" className="italic">
                  Click any value to edit • Click ✏️ for advanced options
                </Caption>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced mobile action buttons */}
        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <button
                className="p-3 sm:p-2 text-silver-500 hover:text-accent-blue rounded-xl sm:rounded-lg hover:bg-(--interactive-hover) transition-colors touch-manipulation"
                title="Move to group"
              >
                <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            }
            align="right"
            width="sm"
            isOpen={showMoveMenu}
            onOpenChange={setShowMoveMenu}
          >
            <DropdownItem onClick={() => onMoveToGroup(undefined)}>
              Remove from group
            </DropdownItem>
            {availableGroups.map((group) => (
              <DropdownItem
                key={group.id}
                onClick={() => onMoveToGroup(group.id)}
              >
                Move to {group.name}
              </DropdownItem>
            ))}
          </Dropdown>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-3 sm:p-2 text-silver-500 hover:text-accent-blue rounded-xl sm:rounded-lg hover:bg-(--interactive-hover) transition-colors touch-manipulation"
          >
            <Edit3 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(exercise.id)}
            className="p-3 sm:p-2 text-silver-500 hover:text-(--status-error) rounded-xl sm:rounded-lg hover:bg-(--status-error-light) transition-colors touch-manipulation"
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
