"use client";

import { useState, useEffect } from "react";
import { AthleteGroup, User } from "@/types";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";
import { useFormValidation } from "@/hooks/use-form-validation";
import { Users } from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: AthleteGroup) => void;
  editingGroup?: AthleteGroup | null;
  existingGroups: AthleteGroup[];
}

const predefinedColors = [
  { name: "Orange", value: "#ff6b35" },
  { name: "Green", value: "#00d4aa" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
];

const sportOptions = [
  "Football",
  "Volleyball",
  "Basketball",
  "Soccer",
  "Cross Country",
  "Track & Field",
  "Wrestling",
  "Tennis",
  "Swimming",
  "Baseball",
  "Softball",
  "Golf",
  "Other",
];

export default function GroupFormModal({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  existingGroups,
}: GroupFormModalProps) {
  const [availableAthletes, setAvailableAthletes] = useState<User[]>([]);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setValues,
    isSubmitting,
  } = useFormValidation({
    initialValues: {
      name: editingGroup?.name || "",
      description: editingGroup?.description || "",
      sport: editingGroup?.sport || "",
      category: editingGroup?.category || "",
      color: editingGroup?.color || predefinedColors[0].value,
      athleteIds: (editingGroup?.athleteIds || []) as string[],
    },
    validationRules: {
      name: {
        required: "Group name is required",
        custom: (value, allValues) => {
          const name = String(value).trim();
          if (!name) return "Group name is required";

          const duplicateName = existingGroups.some(
            (group) =>
              group.name.toLowerCase() === name.toLowerCase() &&
              (!editingGroup || group.id !== editingGroup.id)
          );

          if (duplicateName) {
            return "A group with this name already exists";
          }

          return undefined;
        },
      },
      sport: { required: "Sport selection is required" },
    },
    onSubmit: async (values) => {
      try {
        if (editingGroup) {
          const response = (await apiClient.updateGroup(
            editingGroup.id,
            values
          )) as ApiResponse;
          if (response.success && response.data) {
            const data = response.data as { group?: AthleteGroup };
            if (data.group) {
              onSave(data.group);
              onClose();
            } else {
              throw new Error("Failed to update group");
            }
          } else {
            throw new Error(
              typeof response.error === "string"
                ? response.error
                : "Failed to update group"
            );
          }
        } else {
          const response = (await apiClient.createGroup(values)) as ApiResponse;
          if (response.success) {
            const data = response as unknown as { group?: AthleteGroup };
            if (data.group) {
              onSave(data.group);
              onClose();
            } else {
              console.error("No group in response:", data);
              throw new Error("Failed to create group - no group returned");
            }
          } else {
            console.error("API returned error:", response.error);
            throw new Error(
              typeof response.error === "string"
                ? response.error
                : "Failed to create group"
            );
          }
        }
      } catch (err) {
        // Re-throw to let useFormValidation handle it
        throw err;
      }
    },
  });

  // Load form data when editing
  useEffect(() => {
    if (editingGroup) {
      setValues({
        name: editingGroup.name,
        description: editingGroup.description || "",
        sport: editingGroup.sport,
        category: editingGroup.category || "",
        color: editingGroup.color,
        athleteIds: editingGroup.athleteIds || [],
      });
    } else {
      setValues({
        name: "",
        description: "",
        sport: "",
        category: "",
        color: predefinedColors[0].value,
        athleteIds: [],
      });
    }
  }, [editingGroup, isOpen, setValues]);

  // Load available athletes
  useEffect(() => {
    const loadAthletes = async () => {
      if (!isOpen) return;
      try {
        // TODO: Load athletes from API
        setAvailableAthletes([]);
      } catch (error) {
        console.error("Error loading athletes:", error);
        setAvailableAthletes([]);
      }
    };
    loadAthletes();
  }, [isOpen, existingGroups, editingGroup]);

  const handleInputChange = (field: keyof typeof values, value: string) => {
    handleChange(field, value as never); // Type assertion needed for generic constraint
  };

  const handleAthleteSelection = (athleteId: string, selected: boolean) => {
    handleChange(
      "athleteIds",
      selected
        ? [...values.athleteIds, athleteId]
        : (values.athleteIds.filter((id) => id !== athleteId) as never)
    );
  };

  if (!isOpen) return null;

  const selectedAthletes = availableAthletes.filter((athlete) =>
    values.athleteIds.includes(athlete.id)
  );

  const unselectedAthletes = availableAthletes.filter(
    (athlete) => !values.athleteIds.includes(athlete.id)
  );

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="
        bg-white 
        w-full h-full
        sm:rounded-lg sm:max-w-4xl sm:h-auto sm:max-h-[85vh]
        flex flex-col 
        sm:shadow-2xl
        safe-area-inset
      ">
        <ModalHeader
          title={editingGroup ? "Edit Group" : "Create New Group"}
          subtitle="Configure group details and member settings"
          onClose={onClose}
          icon={<Users className="w-6 h-6" />}
        />

        <div className="flex-1 overflow-y-auto">
          <ModalContent>
            <form onSubmit={handleSubmit} id="group-form">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-heading-secondary text-lg mb-4">
                  Group Details
                </h3>

                {/* Group Name */}
                <FloatingLabelInput
                  label="Group Name"
                  type="text"
                  value={values.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  required
                />

                {/* Sport */}
                <Select
                  label="Sport *"
                  value={values.sport}
                  onChange={(e) => handleInputChange("sport", e.target.value)}
                  disabled={isSubmitting}
                  fullWidth
                  required
                  options={[
                    { value: "", label: "Select a sport..." },
                    ...sportOptions.map((sport) => ({
                      value: sport,
                      label: sport,
                    })),
                  ]}
                />

                {/* Category */}
                <FloatingLabelInput
                  label="Category"
                  type="text"
                  value={values.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  disabled={isSubmitting}
                  fullWidth
                />

                {/* Description */}
                <FloatingLabelTextarea
                  label="Description"
                  value={values.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  disabled={isSubmitting}
                  fullWidth
                />

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Group Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange("color", color.value)}
                        className={`p-3 rounded-md border-2 transition-all ${
                          values.color === color.value
                            ? "border-navy-600 scale-105"
                            : "border-silver-300 hover:border-silver-400"
                        }`}
                        style={{ backgroundColor: color.value }}
                        disabled={isSubmitting}
                        title={color.name}
                      >
                        <div className="w-full h-4"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-heading-secondary text-lg mb-4">
                  Select Athletes ({values.athleteIds?.length || 0} selected)
                </h3>

                {selectedAthletes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-body-primary font-medium mb-2">
                      Selected Athletes
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-silver-300 rounded-md p-2">
                      {selectedAthletes.map((athlete) => (
                        <div
                          key={athlete.id}
                          className="flex items-center justify-between bg-accent-green/10 p-2 rounded"
                        >
                          <div>
                            <div className="text-body-primary font-medium">
                              {athlete.fullName}
                            </div>
                            <div className="text-body-small">
                              {athlete.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleAthleteSelection(athlete.id, false)
                            }
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {unselectedAthletes.length > 0 && (
                  <div>
                    <h4 className="text-body-primary font-medium mb-2">
                      Available Athletes
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-silver-300 rounded-md p-2">
                      {unselectedAthletes.map((athlete) => (
                        <div
                          key={athlete.id}
                          className="flex items-center justify-between p-2 hover:bg-silver-50 rounded"
                        >
                          <div>
                            <div className="text-body-primary font-medium">
                              {athlete.fullName}
                            </div>
                            <div className="text-body-small">
                              {athlete.email}
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() =>
                              handleAthleteSelection(athlete.id, true)
                            }
                            variant="secondary"
                            size="sm"
                            className="px-3 py-1"
                            disabled={isSubmitting}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {availableAthletes.length === 0 && (
                  <div className="text-center py-8 text-body-secondary">
                    No available athletes found. Add athletes to assign them to
                    groups.
                  </div>
                )}
              </div>
            </div>

            {(errors.name || errors.sport || errors.submit) && (
              <div className="mt-4 p-3 bg-error-light border border-error rounded-md">
                <p className="text-error text-sm">
                  {errors.name || errors.sport || errors.submit}
                </p>
              </div>
            )}
          </form>
        </ModalContent>
        </div>

        <ModalFooter align="between">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="group-form"
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : editingGroup
                ? "Update Group"
                : "Create Group"}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
