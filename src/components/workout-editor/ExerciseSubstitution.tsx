"use client";

import React, { useState } from "react";
import { WorkoutExercise } from "@/types";
import { Search, ArrowRight, Target, Info } from "lucide-react";

interface ExerciseSubstitutionProps {
  currentExercise: WorkoutExercise;
  onSubstitute: (newExercise: WorkoutExercise) => void;
  onClose: () => void;
}

// Mock exercise database for substitutions
const exerciseSubstitutions = {
  "bench-press": [
    {
      id: "dumbbell-press",
      name: "Dumbbell Press",
      muscleGroups: ["chest", "shoulders", "triceps"],
      difficulty: "intermediate",
      equipment: "dumbbells",
      reason: "Same movement pattern, allows for unilateral training",
    },
    {
      id: "incline-press",
      name: "Incline Barbell Press",
      muscleGroups: ["chest", "shoulders", "triceps"],
      difficulty: "intermediate",
      equipment: "barbell",
      reason: "Targets upper chest more effectively",
    },
    {
      id: "push-ups",
      name: "Push-ups",
      muscleGroups: ["chest", "shoulders", "triceps"],
      difficulty: "beginner",
      equipment: "bodyweight",
      reason: "Bodyweight alternative, easier on joints",
    },
  ],
  squats: [
    {
      id: "goblet-squats",
      name: "Goblet Squats",
      muscleGroups: ["quadriceps", "glutes", "core"],
      difficulty: "beginner",
      equipment: "dumbbell",
      reason: "Easier loading, better for beginners",
    },
    {
      id: "leg-press",
      name: "Leg Press",
      muscleGroups: ["quadriceps", "glutes"],
      difficulty: "beginner",
      equipment: "machine",
      reason: "Machine-assisted, reduced balance requirements",
    },
    {
      id: "lunges",
      name: "Walking Lunges",
      muscleGroups: ["quadriceps", "glutes", "hamstrings"],
      difficulty: "intermediate",
      equipment: "bodyweight",
      reason: "Unilateral movement, improves balance",
    },
  ],
};

// Exercise substitution types
interface ExerciseSubstitutionOption {
  id: string;
  name: string;
  muscleGroups: string[];
  difficulty: string;
  equipment: string;
  reason: string;
}

export default function ExerciseSubstitution({
  currentExercise,
  onSubstitute,
  onClose,
}: ExerciseSubstitutionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const suggestions =
    exerciseSubstitutions[
      currentExercise.exerciseId as keyof typeof exerciseSubstitutions
    ] || [];

  const filteredSuggestions = suggestions.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroups.some((group) =>
        group.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSubstitute = (suggestion: ExerciseSubstitutionOption) => {
    const newExercise: WorkoutExercise = {
      ...currentExercise,
      exerciseId: suggestion.id,
      exerciseName: suggestion.name,
      substitutionReason: suggestion.reason,
      originalExercise: currentExercise.exerciseName,
    };

    onSubstitute(newExercise);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600 bg-green-50";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50";
      case "advanced":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Exercise Substitutions
          </h2>
          <p className="text-gray-600">
            Find alternatives for{" "}
            <span className="font-semibold text-blue-600">
              {currentExercise.exerciseName}
            </span>
          </p>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exercises or muscle groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Current Exercise Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Current Exercise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Sets:</span>{" "}
                {currentExercise.sets}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Reps:</span>{" "}
                {currentExercise.reps}
              </div>
              <div>
                <span className="text-blue-700 font-medium">Weight:</span>{" "}
                {currentExercise.weight}lbs
              </div>
            </div>
          </div>

          {/* Substitution Options */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                  onClick={() => handleSubstitute(suggestion)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {suggestion.name}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}
                        >
                          {suggestion.difficulty}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {suggestion.equipment}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 mt-1" />
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.muscleGroups.map((muscle, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700">
                        {suggestion.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "No exercises found matching your search."
                    : "No substitutions available for this exercise."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Keep Original
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
