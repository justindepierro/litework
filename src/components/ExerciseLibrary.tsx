"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Book,
  Dumbbell,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Exercise, ExerciseVariation } from "@/types";
import {
  exerciseLibrary,
  exerciseCategories,
  muscleGroups,
  searchExercises,
} from "@/lib/exercise-library";

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onAddToWorkout?: (exercise: Exercise) => void;
  mode?: "browse" | "select";
}

export default function ExerciseLibrary({
  onSelectExercise,
  onAddToWorkout,
  mode = "browse",
}: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    let exercises = exerciseLibrary;

    // Apply search
    if (searchQuery.trim()) {
      exercises = searchExercises(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      exercises = exercises.filter((ex) => ex.category === selectedCategory);
    }

    // Apply muscle group filter
    if (selectedMuscleGroup !== "All") {
      exercises = exercises.filter((ex) =>
        ex.targetMuscleGroups.includes(selectedMuscleGroup)
      );
    }

    return exercises;
  }, [searchQuery, selectedCategory, selectedMuscleGroup]);

  const handleExerciseClick = (exercise: Exercise) => {
    if (mode === "select" && onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      setExpandedExercise(
        expandedExercise === exercise.id ? null : exercise.id
      );
    }
  };

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const isExpanded = expandedExercise === exercise.id;

    return (
      <div className="card-primary hover:shadow-lg transition-shadow">
        <div
          className="cursor-pointer"
          onClick={() => handleExerciseClick(exercise)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-heading-primary text-lg font-semibold">
                {exercise.name}
              </h3>
              <p className="text-heading-secondary text-sm">
                {exercise.category}
              </p>
            </div>
            <div className="flex space-x-2">
              {mode === "browse" && (
                <button className="text-accent-blue hover:text-accent-blue/80">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              )}
              {onAddToWorkout && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWorkout(exercise);
                  }}
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {exercise.targetMuscleGroups.map((muscle) => (
              <span
                key={muscle}
                className="bg-accent-blue/10 text-accent-blue text-xs px-2 py-1 rounded"
              >
                {muscle}
              </span>
            ))}
          </div>

          {exercise.description && (
            <p className="text-body text-sm mb-3">{exercise.description}</p>
          )}
        </div>

        {isExpanded && (
          <div className="border-t border-color-silver-200 pt-4 mt-4">
            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-heading-primary font-medium mb-2 flex items-center">
                  <Book className="w-4 h-4 mr-2" />
                  Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-1">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="text-body text-sm">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Variations */}
            {exercise.variations && exercise.variations.length > 0 && (
              <div>
                <h4 className="text-heading-primary font-medium mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Variations & Modifications
                </h4>
                <div className="space-y-3">
                  {exercise.variations.map((variation) => (
                    <VariationCard key={variation.id} variation={variation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const VariationCard = ({ variation }: { variation: ExerciseVariation }) => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case "easier":
          return "text-accent-green bg-accent-green/10";
        case "same":
          return "text-accent-blue bg-accent-blue/10";
        case "harder":
          return "text-accent-orange bg-accent-orange/10";
        default:
          return "text-body bg-color-silver-100";
      }
    };

    return (
      <div className="bg-color-silver-50 rounded p-3">
        <div className="flex justify-between items-start mb-2">
          <h5 className="text-heading-primary font-medium text-sm">
            {variation.name}
          </h5>
          <span
            className={`text-xs px-2 py-1 rounded ${getDifficultyColor(variation.difficulty)}`}
          >
            {variation.difficulty}
          </span>
        </div>
        <p className="text-body text-xs mb-2">{variation.description}</p>
        <p className="text-heading-secondary text-xs">
          <strong>Why:</strong> {variation.reason}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading-primary text-3xl mb-2">
            Exercise Library
          </h1>
          <p className="text-heading-secondary">
            Browse exercises and variations for your workouts
          </p>
        </div>
        <div className="text-right">
          <p className="text-heading-primary text-lg font-semibold">
            {filteredExercises.length}
          </p>
          <p className="text-heading-secondary text-sm">exercises</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-heading-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises, muscle groups, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-color-silver-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue text-body"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {showFilters ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-color-silver-50 rounded-lg">
            <div>
              <label className="block text-heading-primary font-medium mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-color-silver-300 rounded focus:ring-2 focus:ring-accent-blue text-body"
              >
                {exerciseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-heading-primary font-medium mb-2">
                Muscle Group
              </label>
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="w-full p-2 border border-color-silver-300 rounded focus:ring-2 focus:ring-accent-blue text-body"
              >
                <option value="All">All Muscle Groups</option>
                {muscleGroups.map((muscle) => (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-heading-secondary mx-auto mb-4" />
          <h3 className="text-heading-primary text-xl mb-2">
            No exercises found
          </h3>
          <p className="text-heading-secondary">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}
