"use client";

import { useState } from "react";
import { WorkoutModification, AthleteGroup, User, WorkoutPlan } from "@/types";
import { X, Weight, RotateCcw, Settings } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";

interface AthleteModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: User;
  group: AthleteGroup;
  workoutPlan: WorkoutPlan;
  existingModifications: WorkoutModification[];
  onSaveModifications: (modifications: WorkoutModification[]) => void;
}

export default function AthleteModificationModal({
  isOpen,
  onClose,
  athlete,
  group,
  workoutPlan,
  existingModifications,
  onSaveModifications,
}: AthleteModificationModalProps) {
  const [modifications, setModifications] = useState<WorkoutModification[]>(
    existingModifications
  );
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  if (!isOpen) return null;

  const addModification = () => {
    if (!selectedExercise) return;

    const exercise = workoutPlan.exercises.find(
      (ex) => ex.id === selectedExercise
    );
    if (!exercise) return;

    const newModification: WorkoutModification = {
      id: `mod-${Date.now()}`,
      workoutExerciseId: selectedExercise,
      athleteId: athlete.id,
      modificationType: "sets",
      originalValue: exercise.sets,
      modifiedValue: exercise.sets,
      reason: "",
      modifiedBy: "coach1", // In real app, get from auth context
      createdAt: new Date(),
    };

    setModifications([...modifications, newModification]);
    setSelectedExercise("");
  };

  const updateModification = (
    id: string,
    field: keyof WorkoutModification,
    value: string | number
  ) => {
    setModifications((mods) =>
      mods.map((mod) => (mod.id === id ? { ...mod, [field]: value } : mod))
    );
  };

  const removeModification = (id: string) => {
    setModifications((mods) => mods.filter((mod) => mod.id !== id));
  };

  const handleSave = () => {
    onSaveModifications(modifications);
    onClose();
  };

  const getExerciseById = (exerciseId: string) => {
    return workoutPlan.exercises.find((ex) => ex.id === exerciseId);
  };

  const getUnmodifiedExercises = () => {
    const modifiedExerciseIds = modifications.map(
      (mod) => mod.workoutExerciseId
    );
    return workoutPlan.exercises.filter(
      (ex) => !modifiedExerciseIds.includes(ex.id)
    );
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-heading-primary text-xl">
                Individual Modifications
              </h2>
              <p className="text-body-secondary text-sm mt-1">
                Customize{" "}
                <span className="font-medium">{workoutPlan.name}</span> for{" "}
                <span className="font-medium">{athlete.fullName}</span> (
                {group.name})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-silver-600 hover:text-navy-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Add New Modification */}
          <div className="card-secondary mb-6">
            <h3 className="text-heading-secondary text-lg mb-4">
              Add Modification
            </h3>
            <div className="flex gap-3">
              <Select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                options={[
                  { value: "", label: "Select exercise to modify..." },
                  ...getUnmodifiedExercises().map((exercise) => ({
                    value: exercise.id,
                    label: exercise.exerciseName,
                  })),
                ]}
                className="flex-1"
              />
              <button
                onClick={addModification}
                disabled={!selectedExercise}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Current Modifications */}
          <div className="space-y-4">
            <h3 className="text-heading-secondary text-lg">
              Current Modifications ({modifications.length})
            </h3>

            {modifications.length === 0 ? (
              <div className="text-center py-8 text-body-secondary">
                No modifications added yet. This athlete will follow the
                standard group workout.
              </div>
            ) : (
              <div className="space-y-4">
                {modifications.map((modification) => {
                  const exercise = getExerciseById(
                    modification.workoutExerciseId
                  );
                  if (!exercise) return null;

                  return (
                    <div
                      key={modification.id}
                      className="card-primary border-l-4 border-accent-orange"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-heading-secondary text-lg">
                            {exercise.exerciseName}
                          </h4>
                          <p className="text-body-small">
                            Original: {exercise.sets} sets × {exercise.reps}{" "}
                            reps
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeModification(modification.id)}
                          className="text-silver-600 hover:text-red-600 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Select
                          label="Modification Type"
                          value={modification.modificationType}
                          onChange={(e) =>
                            updateModification(
                              modification.id,
                              "modificationType",
                              e.target.value
                            )
                          }
                          options={[
                            { value: "sets", label: "Sets" },
                            { value: "reps", label: "Reps" },
                            { value: "weight", label: "Weight" },
                            { value: "exercise", label: "Exercise Variation" },
                          ]}
                          fullWidth
                        />

                        {modification.modificationType !== "exercise" ? (
                          <Input
                            label="New Value"
                            type="number"
                            value={modification.modifiedValue}
                            onChange={(e) =>
                              updateModification(
                                modification.id,
                                "modifiedValue",
                                Number(e.target.value)
                              )
                            }
                            placeholder="Enter new value"
                            fullWidth
                          />
                        ) : (
                          <Input
                            label="Alternative Exercise"
                            type="text"
                            value={modification.modifiedValue}
                            onChange={(e) =>
                              updateModification(
                                modification.id,
                                "modifiedValue",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Goblet Squats"
                            fullWidth
                          />
                        )}

                        <Select
                          label="Reason"
                          value={modification.reason}
                          onChange={(e) =>
                            updateModification(
                              modification.id,
                              "reason",
                              e.target.value
                            )
                          }
                          options={[
                            { value: "", label: "Select reason..." },
                            { value: "injury", label: "Injury Recovery" },
                            { value: "beginner", label: "Beginner Level" },
                            { value: "advanced", label: "Advanced Athlete" },
                            {
                              value: "equipment",
                              label: "Equipment Limitation",
                            },
                            {
                              value: "medical",
                              label: "Medical Restriction",
                            },
                            { value: "other", label: "Other" },
                          ]}
                          fullWidth
                        />
                      </div>

                      {modification.reason === "other" && (
                        <Input
                          label="Custom Reason"
                          type="text"
                          value={modification.customReason || ""}
                          onChange={(e) =>
                            updateModification(
                              modification.id,
                              "customReason",
                              e.target.value
                            )
                          }
                          placeholder="Explain the reason for this modification"
                          fullWidth
                          className="mb-4"
                        />
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-body-secondary flex items-center gap-1">
                          {modification.modificationType === "sets" ? (
                            <Settings className="w-4 h-4" />
                          ) : modification.modificationType === "reps" ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : modification.modificationType === "weight" ? (
                            <Weight className="w-4 h-4" />
                          ) : (
                            <Settings className="w-4 h-4" />
                          )}
                          {modification.originalValue} →{" "}
                          {modification.modifiedValue}
                          {modification.modificationType !== "exercise" &&
                            ` ${modification.modificationType}`}
                        </div>
                        <div className="text-body-small">
                          {modification.reason && (
                            <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded text-xs">
                              {modification.reason === "other"
                                ? modification.customReason
                                : modification.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              Save Modifications ({modifications.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
