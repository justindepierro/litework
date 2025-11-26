"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label, Body } from "@/components/ui/Typography";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import type {
  ExerciseCategory,
  EquipmentType,
} from "@/hooks/useExerciseLibraryState";

interface NewExercise {
  name: string;
  description: string;
  categoryId: string;
  difficultyLevel: number;
  equipmentNeeded: string[];
  instructions: string[];
  videoUrl: string;
  isCompound: boolean;
  isBodyweight: boolean;
}

interface ExerciseCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  newExercise: NewExercise;
  setNewExercise: React.Dispatch<React.SetStateAction<NewExercise>>;
  categories: ExerciseCategory[];
  equipmentTypes: EquipmentType[];
  creating: boolean;
  onSubmit: () => void;
}

function ExerciseCreateFormComponent({
  isOpen,
  onClose,
  newExercise,
  setNewExercise,
  categories,
  equipmentTypes,
  creating,
  onSubmit,
}: ExerciseCreateFormProps) {
  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title="Create New Exercise"
          icon={<Plus className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          <div className="space-y-4">
            {/* Name */}
            <Input
              label="Exercise Name *"
              type="text"
              value={newExercise.name}
              onChange={(e) =>
                setNewExercise({ ...newExercise, name: e.target.value })
              }
              placeholder="e.g., Barbell Bench Press"
              fullWidth
              required
            />

            {/* Description */}
            <Textarea
              label="Description"
              value={newExercise.description}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  description: e.target.value,
                })
              }
              rows={3}
              placeholder="Brief description of the exercise..."
              fullWidth
            />

            {/* Category */}
            <Select
              label="Category *"
              value={newExercise.categoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewExercise({
                  ...newExercise,
                  categoryId: e.target.value,
                })
              }
              options={[
                { value: "", label: "Select a category" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              fullWidth
              required
            />

            {/* Difficulty Level */}
            <Select
              label="Difficulty Level"
              value={newExercise.difficultyLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewExercise({
                  ...newExercise,
                  difficultyLevel: parseInt(e.target.value),
                })
              }
              options={[
                { value: "1", label: "Beginner" },
                { value: "2", label: "Intermediate" },
                { value: "3", label: "Advanced" },
                { value: "4", label: "Expert" },
              ]}
              fullWidth
            />

            {/* Equipment */}
            <div>
              <Label className="block mb-1">Equipment Needed</Label>
              <div className="flex flex-wrap gap-2">
                {equipmentTypes.map((equipment) => (
                  <div
                    key={equipment.id}
                    className="flex items-center gap-2 px-3 py-2 border border-silver-400 rounded-lg"
                  >
                    <Checkbox
                      checked={newExercise.equipmentNeeded.includes(
                        equipment.name
                      )}
                      onChange={(checked) => {
                        if (checked) {
                          setNewExercise({
                            ...newExercise,
                            equipmentNeeded: [
                              ...newExercise.equipmentNeeded,
                              equipment.name,
                            ],
                          });
                        } else {
                          setNewExercise({
                            ...newExercise,
                            equipmentNeeded: newExercise.equipmentNeeded.filter(
                              (eq) => eq !== equipment.name
                            ),
                          });
                        }
                      }}
                    />
                    <Body size="sm">{equipment.name}</Body>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <Checkbox
                checked={newExercise.isCompound}
                onChange={(checked) =>
                  setNewExercise({
                    ...newExercise,
                    isCompound: checked,
                  })
                }
                label="Compound Exercise (works multiple muscle groups)"
              />
              <Checkbox
                checked={newExercise.isBodyweight}
                onChange={(checked) =>
                  setNewExercise({
                    ...newExercise,
                    isBodyweight: checked,
                  })
                }
                label="Bodyweight Exercise"
              />
            </div>

            {/* Instructions */}
            <div>
              <Label className="block mb-1">Instructions</Label>
              {newExercise.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...newExercise.instructions];
                      newInstructions[index] = e.target.value;
                      setNewExercise({
                        ...newExercise,
                        instructions: newInstructions,
                      });
                    }}
                    className="flex-1 p-2 border border-silver-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Step ${index + 1}`}
                  />
                  {newExercise.instructions.length > 1 && (
                    <button
                      onClick={() => {
                        const newInstructions = newExercise.instructions.filter(
                          (_, i) => i !== index
                        );
                        setNewExercise({
                          ...newExercise,
                          instructions: newInstructions,
                        });
                      }}
                      className="px-3 py-2 text-(--status-error) hover:bg-(--status-error-light) rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setNewExercise({
                    ...newExercise,
                    instructions: [...newExercise.instructions, ""],
                  })
                }
                className="text-sm text-(--accent-blue-600) hover:text-(--accent-blue-700)"
              >
                + Add Step
              </button>
            </div>

            {/* Video URL */}
            <Input
              label="Video URL (optional)"
              type="url"
              value={newExercise.videoUrl}
              onChange={(e) =>
                setNewExercise({
                  ...newExercise,
                  videoUrl: e.target.value,
                })
              }
              placeholder="https://youtube.com/..."
              fullWidth
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={creating}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            variant="primary"
            disabled={creating || !newExercise.name || !newExercise.categoryId}
            isLoading={creating}
            loadingText="Creating..."
            fullWidth
          >
            Create Exercise
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}

// Memoize with custom comparison - only re-render when form state or modal visibility changes
export const ExerciseCreateForm = memo(
  ExerciseCreateFormComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.creating === nextProps.creating &&
      prevProps.newExercise === nextProps.newExercise &&
      prevProps.categories.length === nextProps.categories.length &&
      prevProps.equipmentTypes.length === nextProps.equipmentTypes.length
    );
  }
);
