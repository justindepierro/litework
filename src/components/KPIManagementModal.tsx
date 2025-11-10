"use client";

import { useState, useEffect } from "react";
import { KPITag } from "@/types";
import { Tag } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Body, Label } from "@/components/ui/Typography";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

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

export default function KPIManagementModal({
  isOpen,
  onClose,
  onSave,
  editingKPI,
}: KPIManagementModalProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    color: predefinedColors[0].value,
    kpiType: "one_rm" as "one_rm" | "max_reps" | "max_distance" | "best_time",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate database name from display name
  const generateDatabaseName = (displayName: string): string => {
    return displayName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_") // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
  };

  const databaseName = generateDatabaseName(formData.displayName);

  // Load form data when editing
  useEffect(() => {
    if (editingKPI) {
      setFormData({
        displayName: editingKPI.displayName,
        color: editingKPI.color,
        kpiType: editingKPI.kpiType,
      });
    } else {
      setFormData({
        displayName: "",
        color: predefinedColors[0].value,
        kpiType: "one_rm",
      });
    }
    setError("");
  }, [editingKPI, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      setError("Display name is required");
      return;
    }

    // Auto-generate database name from display name
    const databaseName = generateDatabaseName(formData.displayName);

    if (!databaseName) {
      setError("Display name must contain letters or numbers");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        name: databaseName,
        display_name: formData.displayName.trim(),
        color: formData.color,
        kpi_type: formData.kpiType,
        description: null, // No longer exposed to user
        primary_exercise_id: null, // No longer exposed to user
      };

      if (editingKPI) {
        // Update existing KPI (only display_name, color, kpi_type can change)
        const response = await fetch(`/api/kpi-tags?id=${editingKPI.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
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
        // Create new KPI
        const response = await fetch("/api/kpi-tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title={editingKPI ? "Edit KPI Tag" : "Create New KPI Tag"}
          icon={<Tag className="w-6 h-6" />}
          onClose={handleClose}
        />

        <form onSubmit={handleSubmit}>
          <ModalContent>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
                <Body variant="secondary">{error}</Body>
              </div>
            )}

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <Input
                  label="KPI Name"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="e.g., Bench Press or 40 Yard Dash"
                  required
                  disabled={isLoading}
                />
                <Body variant="tertiary" className="mt-1 text-sm">
                  Database name: {databaseName || "(enter name above)"}
                </Body>
              </div>

              {/* KPI Type */}
              <div>
                <Select
                  label="KPI Type"
                  value={formData.kpiType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kpiType: e.target.value as
                        | "one_rm"
                        | "max_reps"
                        | "max_distance"
                        | "best_time",
                    })
                  }
                  options={kpiTypeOptions}
                  required
                  disabled={isLoading}
                />
              </div>

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
                          formData.color === color.value
                            ? "border-charcoal-900 shadow-md scale-110"
                            : "border-silver-300 hover:border-silver-400"
                        }
                      `}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setFormData({ ...formData, color: color.value })
                      }
                      disabled={isLoading}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Body variant="tertiary">Preview:</Body>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.displayName || "KPI Tag"}
                  </span>
                </div>
              </div>
            </div>
          </ModalContent>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingKPI
                  ? "Update KPI"
                  : "Create KPI"}
            </Button>
          </ModalFooter>
        </form>
      </div>
    </ModalBackdrop>
  );
}
