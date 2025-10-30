"use client";

import { useState, useEffect } from "react";
import { AthleteGroup, User } from "@/types";
import { apiClient } from "@/lib/api-client";
import { X } from "lucide-react";

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
  "Football", "Volleyball", "Basketball", "Soccer", "Cross Country",
  "Track & Field", "Wrestling", "Tennis", "Swimming", "Baseball",
  "Softball", "Golf", "Other"
];

export default function GroupFormModal({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  existingGroups,
}: GroupFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sport: "",
    category: "",
    color: predefinedColors[0].value,
    athleteIds: [] as string[],
  });
  const [availableAthletes, setAvailableAthletes] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load form data when editing
  useEffect(() => {
    if (editingGroup) {
      setFormData({
        name: editingGroup.name,
        description: editingGroup.description || "",
        sport: editingGroup.sport,
        category: editingGroup.category || "",
        color: editingGroup.color,
        athleteIds: editingGroup.athleteIds,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sport: "",
        category: "",
        color: predefinedColors[0].value,
        athleteIds: [],
      });
    }
    setError("");
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
  }, [isOpen, existingGroups, editingGroup]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleAthleteSelection = (athleteId: string, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      athleteIds: selected 
        ? [...prev.athleteIds, athleteId]
        : prev.athleteIds.filter(id => id !== athleteId)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Group name is required");
      return false;
    }
    if (!formData.sport) {
      setError("Sport selection is required");
      return false;
    }
    
    const duplicateName = existingGroups.some(group => 
      group.name.toLowerCase() === formData.name.toLowerCase() &&
      (!editingGroup || group.id !== editingGroup.id)
    );
    
    if (duplicateName) {
      setError("A group with this name already exists");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      if (editingGroup) {
        const response = await apiClient.updateGroup(editingGroup.id, formData);
        if (response.success && response.data) {
          const data = response.data as { group?: AthleteGroup };
          if (data.group) {
            onSave(data.group);
            onClose();
          } else {
            setError("Failed to update group");
          }
        } else {
          setError(response.error || "Failed to update group");
        }
      } else {
        const response = await apiClient.createGroup(formData);
        if (response.success && response.data) {
          const data = response.data as { group?: AthleteGroup };
          if (data.group) {
            onSave(data.group);
            onClose();
          } else {
            setError("Failed to create group");
          }
        } else {
          setError(response.error || "Failed to create group");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedAthletes = availableAthletes.filter(athlete => 
    formData.athleteIds.includes(athlete.id)
  );

  const unselectedAthletes = availableAthletes.filter(athlete => 
    !formData.athleteIds.includes(athlete.id)
  );

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-heading-primary text-xl">
              {editingGroup ? "Edit Group" : "Create New Group"}
            </h2>
            <button
              onClick={onClose}
              className="text-silver-600 hover:text-navy-600 p-1"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-heading-secondary text-lg mb-4">Group Details</h3>
                
                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md focus:border-accent-blue focus:outline-none"
                    placeholder="e.g., Football Linemen, Volleyball Girls"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Sport *
                  </label>
                  <select
                    value={formData.sport}
                    onChange={(e) => handleInputChange("sport", e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md focus:border-accent-blue focus:outline-none"
                    disabled={isLoading}
                  >
                    <option value="">Select a sport...</option>
                    {sportOptions.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md focus:border-accent-blue focus:outline-none"
                    placeholder="e.g., Varsity, JV, Linemen, Receivers"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md focus:border-accent-blue focus:outline-none"
                    rows={3}
                    placeholder="Brief description of the group..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Group Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange("color", color.value)}
                        className={`p-3 rounded-md border-2 transition-all ${
                          formData.color === color.value 
                            ? "border-navy-600 scale-105" 
                            : "border-silver-300 hover:border-silver-400"
                        }`}
                        style={{ backgroundColor: color.value }}
                        disabled={isLoading}
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
                  Select Athletes ({formData.athleteIds.length} selected)
                </h3>

                {selectedAthletes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-body-primary font-medium mb-2">Selected Athletes</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-silver-300 rounded-md p-2">
                      {selectedAthletes.map(athlete => (
                        <div key={athlete.id} className="flex items-center justify-between bg-accent-green/10 p-2 rounded">
                          <div>
                            <div className="text-body-primary font-medium">{athlete.name}</div>
                            <div className="text-body-small">{athlete.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAthleteSelection(athlete.id, false)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={isLoading}
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
                    <h4 className="text-body-primary font-medium mb-2">Available Athletes</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-silver-300 rounded-md p-2">
                      {unselectedAthletes.map(athlete => (
                        <div key={athlete.id} className="flex items-center justify-between p-2 hover:bg-silver-50 rounded">
                          <div>
                            <div className="text-body-primary font-medium">{athlete.name}</div>
                            <div className="text-body-small">{athlete.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAthleteSelection(athlete.id, true)}
                            className="btn-secondary text-sm px-3 py-1"
                            disabled={isLoading}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {availableAthletes.length === 0 && (
                  <div className="text-center py-8 text-body-secondary">
                    No available athletes found. Add athletes to assign them to groups.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : editingGroup ? "Update Group" : "Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
