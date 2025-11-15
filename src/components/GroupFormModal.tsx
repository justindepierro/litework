"use client";

import { useState, useEffect } from "react";
import { AthleteGroup, User } from "@/types";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Label, Caption } from "@/components/ui/Typography";
import { Form, FormField, FormTextarea, FormSelect } from "@/components/ui/Form";
import { validationRules, combineValidations } from "@/lib/form-validation";

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
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");

  // Load form data when editing
  useEffect(() => {
    if (editingGroup && isOpen) {
      setSelectedAthleteIds(editingGroup.athleteIds || []);
    } else {
      setSelectedAthleteIds([]);
    }
  }, [editingGroup, isOpen]);

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
  }, [isOpen]);

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitError("");

    try {
      // Add selected athletes to values
      const submitData = {
        ...values,
        athleteIds: selectedAthleteIds,
      };

      if (editingGroup) {
        const response = (await apiClient.updateGroup(
          editingGroup.id,
          submitData
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
        const response = (await apiClient.createGroup(submitData)) as ApiResponse;
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
      const errorMessage = err instanceof Error ? err.message : "Failed to save group";
      setSubmitError(errorMessage);
    }
  };

  const handleAthleteSelection = (athleteId: string, selected: boolean) => {
    setSelectedAthleteIds((prev) =>
      selected ? [...prev, athleteId] : prev.filter((id) => id !== athleteId)
    );
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-(--bg-surface) rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader
          title={editingGroup ? "Edit Group" : "Create Group"}
          icon={<Users className="w-6 h-6" />}
          onClose={onClose}
        />

        <Form
          onSubmit={handleSubmit}
          initialValues={{
            name: editingGroup?.name || "",
            description: editingGroup?.description || "",
            sport: editingGroup?.sport || "",
            category: editingGroup?.category || "",
            color: editingGroup?.color || predefinedColors[0].value,
          }}
          validation={{
            name: {
              required: "Group name is required",
              custom: (value: any) => {
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
            sport: validationRules.required("Sport selection is required"),
          }}
          validateOnBlur={true}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <ModalContent>
            <div className="space-y-6">
              {/* Group Name */}
              <FormField
                name="name"
                label="Group Name"
                placeholder="e.g., Varsity Football"
                required
                fullWidth
              />

              {/* Sport Selection */}
              <FormSelect
                name="sport"
                label="Sport"
                options={[
                  { value: "", label: "Select a sport..." },
                  ...sportOptions.map((sport) => ({
                    value: sport,
                    label: sport,
                  })),
                ]}
                required
                fullWidth
              />

              {/* Category (Optional) */}
              <FormField
                name="category"
                label="Category (Optional)"
                placeholder="e.g., Varsity, JV, Freshmen"
                helperText="Used to differentiate between skill levels or divisions"
                fullWidth
              />

              {/* Description */}
              <FormTextarea
                name="description"
                label="Description (Optional)"
                placeholder="Add any notes about this group..."
                rows={3}
                fullWidth
              />

              {/* Color Selection */}
              <div>
                <Label className="block mb-2">Group Color</Label>
                <Caption variant="muted" className="mb-3">
                  Choose a color to help identify this group
                </Caption>
                <FormSelect
                  name="color"
                  options={predefinedColors.map((color) => ({
                    value: color.value,
                    label: color.name,
                  }))}
                  fullWidth
                />
              </div>

              {/* Athlete Selection */}
              {availableAthletes.length > 0 && (
                <div>
                  <Label className="block mb-2">
                    Athletes ({selectedAthleteIds.length} selected)
                  </Label>
                  <Caption variant="muted" className="mb-3">
                    Select athletes to add to this group
                  </Caption>
                  <div className="border border-(--border-primary) rounded-lg max-h-60 overflow-y-auto">
                    {availableAthletes.map((athlete) => {
                      const isSelected = selectedAthleteIds.includes(athlete.id);
                      return (
                        <label
                          key={athlete.id}
                          className="flex items-center gap-3 p-3 hover:bg-(--interactive-hover) cursor-pointer border-b border-(--border-primary) last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleAthleteSelection(athlete.id, e.target.checked)
                            }
                            className="w-5 h-5 rounded border-(--border-primary) text-(--accent-blue-600) focus:ring-2 focus:ring-(--accent-blue-500)"
                          />
                          <div className="flex-1">
                            <div className="font-[var(--font-weight-medium)] text-(--text-primary)">
                              {athlete.firstName} {athlete.lastName}
                            </div>
                            <div className="text-sm text-(--text-secondary)">
                              {athlete.email}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-3 bg-(--status-error-light) border border-(--status-error) rounded-lg">
                  <Caption className="text-(--status-error)">{submitError}</Caption>
                </div>
              )}
            </div>
          </ModalContent>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </ModalFooter>
        </Form>
      </div>
    </ModalBackdrop>
  );
}
