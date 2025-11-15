"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Search, Filter, Plus, Star, Target, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Heading, Label } from "@/components/ui/Typography";
import { EmptySearch } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface Exercise {
  id: string;
  name: string;
  description: string;
  category_name: string;
  category_color: string;
  muscle_groups: Array<{ name: string; involvement: string }>;
  equipment_needed: string[];
  difficulty_level: number;
  is_compound: boolean;
  is_bodyweight: boolean;
  instructions: string[];
  video_url?: string;
  usage_count: number;
}

interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
}

interface MuscleGroup {
  id: string;
  name: string;
  description?: string;
}

interface EquipmentType {
  id: string;
  name: string;
  description?: string;
  availability: string;
}

interface ExerciseLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
  selectedExercises?: string[];
  multiSelect?: boolean;
  mode?: string;
  onAddToWorkout?: (exercise: Exercise) => void;
}

// ============================================================================
// MEMOIZED EXERCISE CARD COMPONENT
// ============================================================================

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (exercise: Exercise) => void;
  getDifficultyColor: (level: number) => string;
  getDifficultyLabel: (level: number) => string;
}

const ExerciseCard = memo<ExerciseCardProps>(
  ({
    exercise,
    isSelected,
    onSelect,
    getDifficultyColor,
    getDifficultyLabel,
  }) => {
    return (
      <div
        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? "border-(--accent-blue-500) bg-(--accent-blue-50)"
            : "border-silver-300 hover:border-silver-400"
        }`}
        onClick={() => onSelect(exercise)}
      >
        {/* Exercise Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Heading level="h3" className="mb-1">
              {exercise.name}
            </Heading>
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: exercise.category_color }}
              >
                {exercise.category_name}
              </span>
              <span
                className={`text-xs font-medium ${getDifficultyColor(exercise.difficulty_level)}`}
              >
                {getDifficultyLabel(exercise.difficulty_level)}
              </span>
            </div>
          </div>
          {exercise.usage_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-(--text-tertiary)">
              <Star className="w-3 h-3" />
              {exercise.usage_count}
            </div>
          )}
        </div>

        {/* Exercise Description */}
        <p className="text-sm text-(--text-secondary) mb-3 line-clamp-2">
          {exercise.description}
        </p>

        {/* Exercise Attributes */}
        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.is_compound && (
            <Badge variant="success" size="sm">
              <Zap className="w-3 h-3" />
              Compound
            </Badge>
          )}
          {exercise.is_bodyweight && (
            <Badge variant="info" size="sm">
              <Target className="w-3 h-3" />
              Bodyweight
            </Badge>
          )}
        </div>

        {/* Muscle Groups */}
        {exercise.muscle_groups.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-(--text-secondary) mb-1">
              Target Muscles:
            </div>
            <div className="flex flex-wrap gap-1">
              {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                <Badge
                  key={index}
                  variant={
                    muscle.involvement === "primary" ? "error" : "neutral"
                  }
                  size="sm"
                >
                  {muscle.name}
                </Badge>
              ))}
              {exercise.muscle_groups.length > 3 && (
                <span className="text-xs text-(--text-tertiary)">
                  +{exercise.muscle_groups.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment_needed.length > 0 && (
          <div className="text-xs text-(--text-secondary)">
            <span className="font-medium">Equipment:</span>{" "}
            {exercise.equipment_needed.slice(0, 2).join(", ")}
            {exercise.equipment_needed.length > 2 && "..."}
          </div>
        )}
      </div>
    );
  },
  // Custom comparison function - only re-render if these props change
  (prevProps, nextProps) => {
    return (
      prevProps.exercise.id === nextProps.exercise.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.exercise.usage_count === nextProps.exercise.usage_count
    );
  }
);

ExerciseCard.displayName = "ExerciseCard";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ExerciseLibrary({
  isOpen,
  onClose,
  onSelectExercise,
  selectedExercises = [],
  multiSelect = false,
}: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    categoryId: "",
    instructions: [""],
    difficultyLevel: 2,
    equipmentNeeded: [] as string[],
    isCompound: false,
    isBodyweight: false,
    videoUrl: "",
  });

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedMuscleGroup)
        params.append("muscleGroup", selectedMuscleGroup);
      if (selectedEquipment) params.append("equipment", selectedEquipment);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      // Get token from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`/api/exercises?${params}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      setExercises(data.exercises);
      setCategories(data.categories);
      setMuscleGroups(data.muscleGroups);
      setEquipmentTypes(data.equipmentTypes);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch exercises"
      );
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, fetchExercises]);

  const getDifficultyLabel = (level: number) => {
    const labels = [
      "Beginner",
      "Beginner",
      "Intermediate",
      "Advanced",
      "Expert",
    ];
    return labels[level] || "Unknown";
  };

  const handleCreateExercise = async () => {
    if (!newExercise.name || !newExercise.categoryId) {
      setError("Name and category are required");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExercise),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exercise");
      }

      // Reset form and refresh exercises
      setNewExercise({
        name: "",
        description: "",
        categoryId: "",
        instructions: [""],
        difficultyLevel: 2,
        equipmentNeeded: [],
        isCompound: false,
        isBodyweight: false,
        videoUrl: "",
      });
      setShowCreateForm(false);
      fetchExercises(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create exercise"
      );
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      "text-(--status-success)",
      "text-(--status-success)",
      "text-(--status-warning)",
      "text-(--accent-orange-600)",
      "text-(--status-error)",
    ];
    return colors[level] || "text-(--text-secondary)";
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
    if (!multiSelect) {
      onClose();
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.includes(exerciseId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMuscleGroup("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          <ModalHeader
            title="Exercise Library"
            subtitle="Select an exercise or create a new one"
            icon={<Target className="w-6 h-6" />}
            onClose={onClose}
          />

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-(--status-error-light) bg-(--status-error-light) px-4 py-3 text-sm text-(--status-error)">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="p-6 border-b border-silver-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="primary"
                  className="h-9 mb-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-tertiary)" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  showFilters
                    ? "bg-(--accent-blue-100) text-(--accent-blue-700)"
                    : "bg-(--bg-tertiary) text-(--text-secondary)"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              {(selectedCategory ||
                selectedMuscleGroup ||
                selectedEquipment ||
                selectedDifficulty) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-(--text-secondary) hover:text-(--text-primary)"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="block mb-1">Category</Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block mb-1">Muscle Group</Label>
                  <select
                    value={selectedMuscleGroup}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                    className="w-full p-2 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Muscle Groups</option>
                    {muscleGroups.map((muscle) => (
                      <option key={muscle.id} value={muscle.name}>
                        {muscle.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block mb-1">Equipment</Label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full p-2 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Equipment</option>
                    {equipmentTypes.map((equipment) => (
                      <option key={equipment.id} value={equipment.name}>
                        {equipment.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block mb-1">Difficulty</Label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-2 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="1">Beginner</option>
                    <option value="2">Intermediate</option>
                    <option value="3">Advanced</option>
                    <option value="4">Expert</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Exercise Grid */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-lg text-(--text-secondary)">
                  Loading exercises...
                </div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptySearch
                  searchTerm={
                    searchTerm ||
                    selectedCategory ||
                    selectedMuscleGroup ||
                    "your filters"
                  }
                  onClearSearch={clearFilters}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isSelected={isExerciseSelected(exercise.id)}
                    onSelect={handleExerciseSelect}
                    getDifficultyColor={getDifficultyColor}
                    getDifficultyLabel={getDifficultyLabel}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-silver-300 bg-(--bg-secondary)">
            <div className="flex justify-between items-center">
              <div className="text-sm text-(--text-secondary)">
                {multiSelect && selectedExercises.length > 0 && (
                  <span>{selectedExercises.length} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-(--text-secondary) hover:text-(--text-primary)"
                >
                  {multiSelect ? "Done" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalBackdrop>

      {/* Create Exercise Modal */}
      {showCreateForm && (
        <ModalBackdrop
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ModalHeader
              title="Create New Exercise"
              icon={<Plus className="w-6 h-6" />}
              onClose={() => setShowCreateForm(false)}
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                                equipmentNeeded:
                                  newExercise.equipmentNeeded.filter(
                                    (eq) => eq !== equipment.name
                                  ),
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{equipment.name}</span>
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
                            const newInstructions =
                              newExercise.instructions.filter(
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
                onClick={() => setShowCreateForm(false)}
                variant="secondary"
                disabled={creating}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateExercise}
                variant="primary"
                disabled={
                  creating || !newExercise.name || !newExercise.categoryId
                }
                isLoading={creating}
                loadingText="Creating..."
                fullWidth
              >
                Create Exercise
              </Button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      )}
    </>
  );
}

export default memo(ExerciseLibrary);
