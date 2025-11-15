"use client";

import { KPITag } from "@/types";
import { Tag } from "lucide-react";
import { Form, FormField, FormSelect, FormSubmitButton, useFormContext } from "@/components/ui/Form";
import { validationRules } from "@/lib/form-validation";
import { Body, Label } from "@/components/ui/Typography";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";

interface KPIManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kpi: KPITag) => void;
  editingKPI?: KPITag | null;
}

const predefinedColors = [
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Green", value: "#10B981" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Yellow", value: "#EAB308" },
];

const kpiTypeOptions = [
  { value: "one_rm", label: "1 Rep Max (Weight)" },
  { value: "max_reps", label: "Max Reps" },
  { value: "max_distance", label: "Max Distance" },
  { value: "best_time", label: "Best Time" },
];

// Auto-generate database name from display name
const generateDatabaseName = (displayName: string): string => {
  return displayName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

function FormContent({
  selectedColor,
  setSelectedColor,
  submitError,
}: {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  submitError: string;
}) {
  const { values } = useFormContext();
  const displayName = values.displayName || "";
  const databaseName = generateDatabaseName(displayName);

  return (
    <ModalContent>
      {submitError && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
          <Body variant="secondary">{submitError}</Body>
        </div>
      )}

      <div className="space-y-4">
        {/* Display Name */}
        <div>
          <FormField
            name="displayName"
            label="KPI Name"
            type="text"
            required
            fullWidth
          />
          <Body variant="tertiary" className="mt-1 text-sm">
            Database name: {databaseName || "(enter name above)"}
          </Body>
        </div>

        {/* KPI Type */}
        <FormSelect
          name="kpiType"
          label="KPI Type"
          options={kpiTypeOptions}
          required
          fullWidth
        />

        {/* Color */}
        <div>
          <Label>Badge Color</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`
                  w-full aspect-square rounded-lg border-2 transition-all
                  ${
                    selectedColor === color.value
                      ? "border-charcoal-900 shadow-md scale-110"
                      : "border-silver-300 hover:border-silver-400"
                  }
                `}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Body variant="tertiary">Preview:</Body>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: selectedColor }}
            >
              {displayName || "KPI Tag"}
            </span>
          </div>
        </div>
      </div>
    </ModalContent>
  );
}

export default function KPIManagementModal({
  isOpen,
  onClose,
  onSave,
  editingKPI,
}: KPIManagementModalProps) {
  const [selectedColor, setSelectedColor] = useState(
    editingKPI?.color || predefinedColors[0].value
  );
  const [submitError, setSubmitError] = useState("");

  // Update color when editingKPI changes
  useEffect(() => {
    if (editingKPI) {
      setSelectedColor(editingKPI.color);
    } else {
      setSelectedColor(predefinedColors[0].value);
    }
  }, [editingKPI]);

  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitError("");

    const databaseName = generateDatabaseName(values.displayName);

    if (!databaseName) {
      setSubmitError("Display name must contain letters or numbers");
      return;
    }

    try {
      const payload = {
        name: databaseName,
        display_name: values.displayName.trim(),
        color: selectedColor,
        kpi_type: values.kpiType,
        description: null,
        primary_exercise_id: null,
      };

      if (editingKPI) {
        const response = await fetch(`/api/kpi-tags?id=${editingKPI.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingKPI.id,
            displayName: payload.display_name,
            color: payload.color,
            kpiType: payload.kpi_type,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update KPI tag");
        }

        const result = await response.json();
        onSave(result.data);
        onClose();
      } else {
        const response = await fetch("/api/kpi-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create KPI tag");
        }

        const result = await response.json();
        onSave(result.data);
        onClose();
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
      throw err; // Re-throw to prevent form reset
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title={editingKPI ? "Edit KPI Tag" : "Create New KPI Tag"}
          icon={<Tag className="w-6 h-6" />}
          onClose={onClose}
        />

        <Form
          onSubmit={handleSubmit}
          initialValues={{
            displayName: editingKPI?.displayName || "",
            kpiType: editingKPI?.kpiType || "one_rm",
          }}
          validation={{
            displayName: validationRules.required("KPI name is required"),
            kpiType: validationRules.required("KPI type is required"),
          }}
        >
          <FormContent
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            submitError={submitError}
          />

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <FormSubmitButton variant="primary">
              {editingKPI ? "Update KPI" : "Create KPI"}
            </FormSubmitButton>
          </ModalFooter>
        </Form>
      </div>
    </ModalBackdrop>
  );
}
