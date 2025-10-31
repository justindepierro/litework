"use client";

import React from "react";
import { WorkoutExercise } from "@/types";
import { TrendingUp, Target, BarChart3, ChevronRight } from "lucide-react";

interface ProgressionTrackingProps {
  exercise: WorkoutExercise;
  onUpdate: (exercise: WorkoutExercise) => void;
  historicalData?: Array<{
    date: string;
    weight: number;
    reps: number;
    sets: number;
  }>;
}

interface ProgressionSuggestion {
  type: "weight" | "reps" | "sets";
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidence: "high" | "medium" | "low";
}

export default function ProgressionTracking({
  exercise,
  onUpdate,
  historicalData = [],
}: ProgressionTrackingProps) {
  // Generate progression suggestions based on historical data
  const generateProgressionSuggestions = (): ProgressionSuggestion[] => {
    const suggestions: ProgressionSuggestion[] = [];

    // Weight progression (5-10% increase)
    const currentWeight = exercise.weight || 0;
    if (currentWeight > 0) {
      const weightIncrease = Math.max(5, Math.round(currentWeight * 0.05));
      suggestions.push({
        type: "weight",
        currentValue: currentWeight,
        suggestedValue: currentWeight + weightIncrease,
        reason: `Progressive overload with 5% weight increase`,
        confidence: "high",
      });
    }

    // Rep progression (if weight stays same)
    const currentReps = exercise.reps;

    if (currentReps < 15) {
      suggestions.push({
        type: "reps",
        currentValue: currentReps,
        suggestedValue: currentReps + 2,
        reason: `Increase reps for muscular endurance`,
        confidence: "medium",
      });
    }

    // Set progression (for volume increase)
    const currentSets = exercise.sets;
    if (currentSets < 5) {
      suggestions.push({
        type: "sets",
        currentValue: currentSets,
        suggestedValue: currentSets + 1,
        reason: `Add volume with extra set`,
        confidence: "medium",
      });
    }

    return suggestions;
  };

  const progressionSuggestions = generateProgressionSuggestions();

  const applyProgression = (suggestion: ProgressionSuggestion) => {
    const updatedExercise = { ...exercise };

    switch (suggestion.type) {
      case "weight":
        updatedExercise.weight = suggestion.suggestedValue;
        break;
      case "reps":
        updatedExercise.reps = suggestion.suggestedValue;
        break;
      case "sets":
        updatedExercise.sets = suggestion.suggestedValue;
        break;
    }

    updatedExercise.progressionNotes = `Auto-progression: ${suggestion.reason}`;
    onUpdate(updatedExercise);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case "weight":
        return `${value} lbs`;
      case "reps":
        return `${value} reps`;
      case "sets":
        return `${value} sets`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Progression Tracking
          </h3>
          <p className="text-sm text-gray-600">
            Smart suggestions for {exercise.exerciseName}
          </p>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {exercise.weight || 0}
          </div>
          <div className="text-xs text-blue-600 font-medium">Weight (lbs)</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {exercise.reps}
          </div>
          <div className="text-xs text-green-600 font-medium">Reps</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {exercise.sets}
          </div>
          <div className="text-xs text-purple-600 font-medium">Sets</div>
        </div>
      </div>

      {/* Historical Trend */}
      {historicalData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Recent Performance
          </h4>
          <div className="space-y-2">
            {historicalData.slice(-3).map((data, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2"
              >
                <span className="text-gray-600">{data.date}</span>
                <span className="font-medium">
                  {data.weight}lbs × {data.reps} × {data.sets}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progression Suggestions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Progression Suggestions
        </h4>

        {progressionSuggestions.length > 0 ? (
          <div className="space-y-3">
            {progressionSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${getConfidenceColor(suggestion.confidence)}`}
                onClick={() => applyProgression(suggestion)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize">
                      {suggestion.type} Progression
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}
                    >
                      {suggestion.confidence} confidence
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium">
                    {formatValue(suggestion.type, suggestion.currentValue)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-bold">
                    {formatValue(suggestion.type, suggestion.suggestedValue)}
                  </span>
                </div>

                <p className="text-sm opacity-75">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No progression suggestions available</p>
            <p className="text-xs">
              Complete more workouts to unlock smart progressions
            </p>
          </div>
        )}
      </div>

      {/* Manual Progression */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Manual Adjustments
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Weight</label>
            <input
              type="number"
              value={exercise.weight || 0}
              onChange={(e) =>
                onUpdate({ ...exercise, weight: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Reps</label>
            <input
              type="number"
              value={
                typeof exercise.reps === "number"
                  ? exercise.reps
                  : parseInt(exercise.reps)
              }
              onChange={(e) =>
                onUpdate({ ...exercise, reps: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sets</label>
            <input
              type="number"
              value={exercise.sets}
              onChange={(e) =>
                onUpdate({ ...exercise, sets: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
