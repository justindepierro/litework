"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, Star, Target, Zap, X } from "lucide-react";

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
  showCreateButton?: boolean;
  mode?: string;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export default function ExerciseLibrary({
  isOpen,
  onClose,
  onSelectExercise,
  selectedExercises = [],
  multiSelect = false,
  showCreateButton = true,
  mode,
  onAddToWorkout,
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

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedMuscleGroup)
        params.append("muscleGroup", selectedMuscleGroup);
      if (selectedEquipment) params.append("equipment", selectedEquipment);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);

      // Get token from localStorage
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth-token")
          : null;

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
    searchTerm,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Exercise Library
            </h2>
            <p className="text-gray-600 mt-1">
              {exercises.length} exercises available
            </p>
          </div>
          <div className="flex items-center gap-3">
            {showCreateButton && (
              <button
                onClick={() =>
                  console.log("Create exercise - to be implemented")
                }
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
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
              <div className="text-lg text-gray-600">Loading exercises...</div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2">
                  No exercises found
                </div>
                <div className="text-gray-500">
                  Try adjusting your search or filters
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    isExerciseSelected(exercise.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleExerciseSelect(exercise)}
                >
                  {/* Exercise Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {exercise.name}
                      </h3>
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
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Zap className="w-3 h-3" />
                        Compound
                      </span>
                    )}
                    {exercise.is_bodyweight && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        <Target className="w-3 h-3" />
                        Bodyweight
                      </span>
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
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                muscle.involvement === "primary"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {muscle.name}
                            </span>
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
    </div>
  );
}
