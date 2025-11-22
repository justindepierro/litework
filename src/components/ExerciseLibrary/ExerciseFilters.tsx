"use client";

import { memo } from "react";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/Typography";
import type {
  ExerciseCategory,
  MuscleGroup,
  EquipmentType,
} from "@/hooks/useExerciseLibraryState";

interface ExerciseFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedMuscleGroup: string;
  setSelectedMuscleGroup: (value: string) => void;
  selectedEquipment: string;
  setSelectedEquipment: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  categories: ExerciseCategory[];
  muscleGroups: MuscleGroup[];
  equipmentTypes: EquipmentType[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

function ExerciseFiltersComponent({
  showFilters,
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  selectedEquipment,
  setSelectedEquipment,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
  muscleGroups,
  equipmentTypes,
  hasActiveFilters,
  onClearFilters,
}: ExerciseFiltersProps) {
  return (
    <div className="border-b border-silver-300 pb-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-silver-400 rounded-md hover:bg-silver-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
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
  );
}

// Memoize with custom comparison - only re-render if filter values or options change
export const ExerciseFilters = memo(
  ExerciseFiltersComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.showFilters === nextProps.showFilters &&
      prevProps.selectedCategory === nextProps.selectedCategory &&
      prevProps.selectedMuscleGroup === nextProps.selectedMuscleGroup &&
      prevProps.selectedEquipment === nextProps.selectedEquipment &&
      prevProps.selectedDifficulty === nextProps.selectedDifficulty &&
      prevProps.hasActiveFilters === nextProps.hasActiveFilters &&
      prevProps.categories.length === nextProps.categories.length &&
      prevProps.muscleGroups.length === nextProps.muscleGroups.length &&
      prevProps.equipmentTypes.length === nextProps.equipmentTypes.length
    );
  }
);
