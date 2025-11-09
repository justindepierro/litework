"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Search, Filter, Plus, Star, Target, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Typography";
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
  ({ exercise, isSelected, onSelect, getDifficultyColor, getDifficultyLabel }) => {
    return (
      <div
        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
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
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3" />
              {exercise.usage_count}
            </div>
          )}
        </div>

        {/* Exercise Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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
            <div className="text-xs font-medium text-gray-700 mb-1">
              Target Muscles:
            </div>
            <div className="flex flex-wrap gap-1">
              {exercise.muscle_groups
                .slice(0, 3)
                .map((muscle, index) => (
                  <Badge
                    key={index}
                    variant={
                      muscle.involvement === "primary"
                        ? "error"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {muscle.name}
                  </Badge>
                ))}
              {exercise.muscle_groups.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{exercise.muscle_groups.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment_needed.length > 0 && (
          <div className="text-xs text-gray-600">
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
      "text-green-600",
      "text-green-600",
      "text-yellow-600",
      "text-orange-600",
      "text-red-600",
    ];
    return colors[level] || "text-gray-600";
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
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
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
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  showFilters
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
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
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Muscle Group
                  </label>
                  <select
                    value={selectedMuscleGroup}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="text-lg text-gray-600">
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
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {multiSelect && selectedExercises.length > 0 && (
                  <span>{selectedExercises.length} selected</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Needed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {equipmentTypes.map((equipment) => (
                      <label
                        key={equipment.id}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={newExercise.equipmentNeeded.includes(
                            equipment.name
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
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
                          className="rounded"
                        />
                        <span className="text-sm">{equipment.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newExercise.isCompound}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          isCompound: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Compound Exercise (works multiple muscle groups)
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newExercise.isBodyweight}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          isBodyweight: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Bodyweight Exercise
                    </span>
                  </label>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
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
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                    className="text-sm text-blue-600 hover:text-blue-700"
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
            <ModalFooter align="between">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateExercise}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  creating || !newExercise.name || !newExercise.categoryId
                }
              >
                {creating ? "Creating..." : "Create Exercise"}
              </button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      )}
    </>
  );
}

export default memo(ExerciseLibrary);
