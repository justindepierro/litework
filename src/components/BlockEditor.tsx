"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Flame,
  Dumbbell,
  Wind,
  Zap,
  Star,
} from "lucide-react";
import { WorkoutBlock, WorkoutExercise } from "@/types";
import { ButtonLoading } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";

interface BlockEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    block: Omit<
      WorkoutBlock,
      "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
    >
  ) => Promise<void>;
  initialBlock?: WorkoutBlock;
}

const CATEGORY_OPTIONS = [
  { value: "warmup", label: "Warm-up", icon: Flame, color: "text-orange-500" },
  {
    value: "main",
    label: "Main Lifts",
    icon: Dumbbell,
    color: "text-blue-600",
  },
  {
    value: "accessory",
    label: "Accessory",
    icon: Zap,
    color: "text-purple-500",
  },
  {
    value: "cooldown",
    label: "Cool Down",
    icon: Wind,
    color: "text-green-500",
  },
  { value: "custom", label: "Custom", icon: Star, color: "text-gray-500" },
] as const;

export default function BlockEditor({
  isOpen,
  onClose,
  onSave,
  initialBlock,
}: BlockEditorProps) {
  const [name, setName] = useState(initialBlock?.name || "");
  const [description, setDescription] = useState(
    initialBlock?.description || ""
  );
  const [category, setCategory] = useState<WorkoutBlock["category"]>(
    initialBlock?.category || "custom"
  );
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    initialBlock?.exercises || []
  );
  const [tags, setTags] = useState(initialBlock?.tags.join(", ") || "");
  const [estimatedDuration, setEstimatedDuration] = useState(
    initialBlock?.estimatedDuration?.toString() || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: `temp-${Date.now()}`,
      exerciseId: "",
      exerciseName: "",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      order: exercises.length + 1,
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
    );
  };

  const removeExercise = (index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, order: i + 1 }))
    );
  };

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Block name is required");
      return;
    }

    if (exercises.length === 0) {
      setError("At least one exercise is required");
      return;
    }

    // Check if all exercises have names
    const hasEmptyExercise = exercises.some((ex) => !ex.exerciseName.trim());
    if (hasEmptyExercise) {
      setError("All exercises must have a name");
      return;
    }

    setIsSaving(true);

    try {
      const blockData: Omit<
        WorkoutBlock,
        "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
      > = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        exercises: exercises.map((ex, index) => ({
          ...ex,
          order: index + 1,
          // Generate a proper exerciseId if it's empty
          exerciseId:
            ex.exerciseId || ex.exerciseName.toLowerCase().replace(/\s+/g, "-"),
        })),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        estimatedDuration: estimatedDuration
          ? parseInt(estimatedDuration, 10)
          : 0,
        isTemplate: false,
        createdBy: "", // Will be set by the API
        isFavorite: false,
      };

      await onSave(blockData);
      onClose();
    } catch (err) {
      console.error("Error saving block:", err);
      setError(err instanceof Error ? err.message : "Failed to save block");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = CATEGORY_OPTIONS.find(
    (opt) => opt.value === category
  );
  const CategoryIcon = selectedCategory?.icon || Star;

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-purple-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CategoryIcon className="w-7 h-7" />
                {initialBlock ? "Edit Block" : "Create Workout Block"}
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Build a reusable block of exercises
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Push Day Main Lifts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as WorkoutBlock["category"])
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this workout block..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., push, strength, chest"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Exercises */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Exercises *
                </label>
                <button
                  onClick={addExercise}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No exercises yet</p>
                  <p className="text-sm text-gray-500">
                    Click &quot;Add Exercise&quot; to start building your block
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>

                        <div className="flex-1 space-y-3">
                          {/* Exercise Name */}
                          <input
                            type="text"
                            value={exercise.exerciseName}
                            onChange={(e) =>
                              updateExercise(index, {
                                exerciseName: e.target.value,
                              })
                            }
                            placeholder="Exercise name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />

                          {/* Sets, Reps, Tempo */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Sets
                              </label>
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) =>
                                  updateExercise(index, {
                                    sets: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="Sets"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Reps
                              </label>
                              <input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateExercise(index, {
                                    reps: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="Reps"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Tempo
                                <span
                                  className="text-gray-400 ml-1"
                                  title="e.g., 3-1-1-0 (down-pause-up-top)"
                                >
                                  ⓘ
                                </span>
                              </label>
                              <input
                                type="text"
                                value={exercise.tempo || ""}
                                onChange={(e) =>
                                  updateExercise(index, {
                                    tempo: e.target.value,
                                  })
                                }
                                placeholder="3-1-1-0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Rest (sec)
                              </label>
                              <input
                                type="number"
                                value={exercise.restTime || ""}
                                onChange={(e) =>
                                  updateExercise(index, {
                                    restTime:
                                      parseInt(e.target.value) || undefined,
                                  })
                                }
                                placeholder="60"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          {/* Weight Type and Load */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Load Type
                              </label>
                              <select
                                value={exercise.weightType}
                                onChange={(e) =>
                                  updateExercise(index, {
                                    weightType: e.target.value as
                                      | "fixed"
                                      | "percentage"
                                      | "bodyweight",
                                    weight: undefined,
                                    percentage: undefined,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="fixed">Fixed Weight</option>
                                <option value="percentage">% of 1RM</option>
                                <option value="bodyweight">Bodyweight</option>
                              </select>
                            </div>

                            {exercise.weightType === "fixed" && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Weight (lbs)
                                </label>
                                <input
                                  type="number"
                                  value={exercise.weight || ""}
                                  onChange={(e) =>
                                    updateExercise(index, {
                                      weight:
                                        parseFloat(e.target.value) || undefined,
                                    })
                                  }
                                  placeholder="135"
                                  min="0"
                                  step="5"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            )}

                            {exercise.weightType === "percentage" && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Percentage
                                </label>
                                <input
                                  type="number"
                                  value={exercise.percentage || ""}
                                  onChange={(e) =>
                                    updateExercise(index, {
                                      percentage:
                                        parseFloat(e.target.value) || undefined,
                                    })
                                  }
                                  placeholder="80"
                                  min="0"
                                  max="100"
                                  step="5"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            )}

                            <div className="flex items-end">
                              <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={exercise.eachSide || false}
                                  onChange={(e) =>
                                    updateExercise(index, {
                                      eachSide: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-xs text-gray-700">
                                  Each Side
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Notes (equipment, cues, etc.)
                            </label>
                            <textarea
                              value={exercise.notes || ""}
                              onChange={(e) =>
                                updateExercise(index, { notes: e.target.value })
                              }
                              placeholder="e.g., Use resistance band, focus on squeeze at top..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeExercise(index)}
                          className="shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <ButtonLoading className="text-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Block
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
