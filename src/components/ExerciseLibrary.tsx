"use client";

import { memo, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Typography";
import { EmptySearch } from "@/components/ui/EmptyState";
import {
  useExerciseLibraryState,
  type Exercise,
} from "@/hooks/useExerciseLibraryState";
import { useExerciseFilters } from "@/hooks/useExerciseFilters";
import { ExerciseCard } from "@/components/ExerciseLibrary/ExerciseCard";
import { ExerciseFilters } from "@/components/ExerciseLibrary/ExerciseFilters";
import { ExerciseCreateForm } from "@/components/ExerciseLibrary/ExerciseCreateForm";

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
// MAIN COMPONENT
// ============================================================================

function ExerciseLibrary({
  isOpen,
  onClose,
  onSelectExercise,
  selectedExercises = [],
  multiSelect = false,
}: ExerciseLibraryProps) {
  // Use custom hooks for state management
  const {
    exercises,
    categories,
    muscleGroups,
    equipmentTypes,
    loading,
    error,
    showCreateForm,
    creating,
    newExercise,
    setShowCreateForm,
    setNewExercise,
    fetchExercises,
    handleCreateExercise,
  } = useExerciseLibraryState();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    showFilters,
    setShowFilters,
    debouncedSearchTerm,
    hasActiveFilters,
    clearFilters,
    getFilters,
  } = useExerciseFilters();

  // Fetch exercises when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchExercises(getFilters());
    }
  }, [
    isOpen,
    debouncedSearchTerm,
    selectedCategory,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    fetchExercises,
    getFilters,
  ]);

  // Helper functions
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

  const handleCreateSuccess = () => {
    fetchExercises(getFilters());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Exercise Library Modal */}
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-silver-300 flex items-center justify-between">
            <div>
              <Heading level="h2">Exercise Library</Heading>
              <p className="text-sm text-(--text-secondary) mt-1">
                Select an exercise or create a new one
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-silver-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-accent-red-200 bg-accent-red-50 px-4 py-3 text-sm text-accent-red-700">
              {error}
            </div>
          )}

          {/* Search and Action Bar */}
          <div className="p-6 border-b border-silver-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-silver-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={() => setShowCreateForm(true)} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            {/* Filter Component */}
            <ExerciseFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedMuscleGroup={selectedMuscleGroup}
              setSelectedMuscleGroup={setSelectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              setSelectedEquipment={setSelectedEquipment}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              categories={categories}
              muscleGroups={muscleGroups}
              equipmentTypes={equipmentTypes}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
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
              <Button onClick={onClose} variant="secondary">
                {multiSelect ? "Done" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Exercise Form Modal */}
      <ExerciseCreateForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        newExercise={newExercise}
        setNewExercise={setNewExercise}
        categories={categories}
        equipmentTypes={equipmentTypes}
        creating={creating}
        onSubmit={() => {
          handleCreateExercise(handleCreateSuccess);
        }}
      />
    </>
  );
}

export default memo(ExerciseLibrary);
