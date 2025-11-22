import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";

export function useExerciseFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedMuscleGroup("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
  }, []);

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedMuscleGroup ||
      selectedEquipment ||
      selectedDifficulty
  );

  const getFilters = useCallback(() => {
    return {
      search: debouncedSearchTerm,
      category: selectedCategory,
      muscleGroup: selectedMuscleGroup,
      equipment: selectedEquipment,
      difficulty: selectedDifficulty,
    };
  }, [
    debouncedSearchTerm,
    selectedCategory,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
  ]);

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,

    // Filter state
    selectedCategory,
    setSelectedCategory,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,

    // UI state
    showFilters,
    setShowFilters,

    // Computed
    hasActiveFilters,

    // Actions
    clearFilters,
    getFilters,
  };
}
