// Reusable component for displaying exercise groups (supersets, circuits, sections)
// with consistent, vibrant styling across all workout views

import React from "react";
import { Clock, Repeat, Layers, Dumbbell } from "lucide-react";
import type { WorkoutExercise, ExerciseGroup } from "@/types";

interface ExerciseGroupDisplayProps {
  exercises: WorkoutExercise[];
  groups?: ExerciseGroup[];
  showProgress?: boolean;
  completedExercises?: Set<string>;
  onExerciseClick?: (exercise: WorkoutExercise) => void;
}

export function ExerciseGroupDisplay({
  exercises,
  groups = [],
  showProgress = false,
  completedExercises = new Set(),
  onExerciseClick,
}: ExerciseGroupDisplayProps) {
  // Organize exercises by group
  const organizedExercises = React.useMemo(() => {
    const grouped: Array<{
      group?: ExerciseGroup;
      exercises: WorkoutExercise[];
    }> = [];

    // Sort groups by order
    const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

    // Add grouped exercises
    sortedGroups.forEach((group) => {
      const groupExercises = exercises
        .filter((ex) => ex.groupId === group.id)
        .sort((a, b) => a.order - b.order);

      if (groupExercises.length > 0) {
        grouped.push({ group, exercises: groupExercises });
      }
    });

    // Add ungrouped exercises
    const ungroupedExercises = exercises
      .filter((ex) => !ex.groupId)
      .sort((a, b) => a.order - b.order);

    ungroupedExercises.forEach((exercise) => {
      grouped.push({ exercises: [exercise] });
    });

    return grouped;
  }, [exercises, groups]);

  const getGroupColor = (type: ExerciseGroup["type"]) => {
    switch (type) {
      case "superset":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-pink-50",
          border: "border-purple-300",
          badge: "bg-purple-500",
          text: "text-purple-900",
          icon: "text-purple-600",
        };
      case "circuit":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-blue-300",
          badge: "bg-blue-500",
          text: "text-blue-900",
          icon: "text-blue-600",
        };
      case "section":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-orange-50",
          border: "border-amber-300",
          badge: "bg-amber-500",
          text: "text-amber-900",
          icon: "text-amber-600",
        };
    }
  };

  const formatWeight = (exercise: WorkoutExercise) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage") {
      if (exercise.percentageMax && exercise.percentage) {
        return `${exercise.percentage}-${exercise.percentageMax}% 1RM`;
      }
      return `${exercise.percentage}% 1RM`;
    }
    if (exercise.weightMax && exercise.weight) {
      return `${exercise.weight}-${exercise.weightMax} lbs`;
    }
    return `${exercise.weight} lbs`;
  };

  const formatRestTime = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const getGroupIcon = (type: ExerciseGroup["type"]) => {
    switch (type) {
      case "superset":
        return <Layers className="w-5 h-5" />;
      case "circuit":
        return <Repeat className="w-5 h-5" />;
      case "section":
        return <Dumbbell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {organizedExercises.map((item, groupIndex) => {
        const { group, exercises: groupExercises } = item;
        const colors = group ? getGroupColor(group.type) : null;

        if (group) {
          // Grouped exercises (superset, circuit, section)
          return (
            <div
              key={group.id}
              className={`border-2 ${colors?.border} ${colors?.bg} rounded-xl p-4 shadow-sm`}
            >
              {/* Group Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${colors?.badge} text-white p-2 rounded-lg`}>
                    {getGroupIcon(group.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-lg ${colors?.text}`}>
                        {group.name}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 ${colors?.badge} text-white rounded-full uppercase`}
                      >
                        {group.type}
                      </span>
                    </div>
                    {group.description && (
                      <p className={`text-sm ${colors?.text} opacity-80 mt-1`}>
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Prominent Group Instructions */}
                {(group.rounds || group.restBetweenRounds) && (
                  <div className="bg-white bg-opacity-70 rounded-lg p-3 border-2 border-white">
                    <div className="flex items-center justify-center gap-6">
                      {group.rounds && (
                        <div className="flex items-center gap-2">
                          <div className={`${colors?.badge} text-white p-2 rounded-lg`}>
                            <Repeat className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-600 uppercase">Complete</div>
                            <div className={`text-2xl font-bold ${colors?.text}`}>
                              {group.rounds} {group.rounds === 1 ? 'Round' : 'Rounds'}
                            </div>
                          </div>
                        </div>
                      )}
                      {group.restBetweenRounds && (
                        <div className="flex items-center gap-2">
                          <div className={`${colors?.badge} text-white p-2 rounded-lg`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-600 uppercase">Rest Between Rounds</div>
                            <div className={`text-2xl font-bold ${colors?.text}`}>
                              {formatRestTime(group.restBetweenRounds)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Exercises in group */}
              <div className="space-y-2">
                {groupExercises.map((exercise, exerciseIndex) => {
                  const isCompleted = completedExercises.has(exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      onClick={() => onExerciseClick?.(exercise)}
                      className={`bg-white border-2 ${
                        isCompleted ? "border-green-300" : "border-silver-300"
                      } rounded-lg p-4 transition-all hover:shadow-md ${
                        onExerciseClick ? "cursor-pointer" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Exercise number badge */}
                        <div
                          className={`shrink-0 w-8 h-8 ${
                            isCompleted
                              ? "bg-green-500"
                              : colors?.badge || "bg-primary"
                          } text-white rounded-full flex items-center justify-center font-bold text-sm`}
                        >
                          {String.fromCharCode(65 + exerciseIndex)}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {exercise.exerciseName}
                          </h4>

                          {/* Exercise details */}
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-medium">Sets:</span>
                              <span className="text-gray-900 font-semibold">
                                {exercise.sets}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-700">
                              <span className="font-medium">Reps:</span>
                              <span className="text-gray-900 font-semibold">
                                {exercise.reps}
                                {exercise.eachSide && " each side"}
                              </span>
                            </div>

                            {exercise.weight && (
                              <div className="flex items-center gap-1 text-gray-700">
                                <span className="font-medium">Weight:</span>
                                <span className="text-gray-900 font-semibold">
                                  {formatWeight(exercise)}
                                </span>
                              </div>
                            )}

                            {exercise.tempo && (
                              <div className="flex items-center gap-1 text-gray-700">
                                <span className="font-medium">Tempo:</span>
                                <span className="text-gray-900 font-semibold">
                                  {exercise.tempo}
                                </span>
                              </div>
                            )}

                            {exercise.restTime && (
                              <div className="flex items-center gap-1 text-gray-700">
                                <Clock className="w-4 h-4" />
                                <span className="text-gray-900 font-semibold">
                                  {formatRestTime(exercise.restTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Exercise notes */}
                          {exercise.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic border-l-2 border-silver-400 pl-3">
                              {exercise.notes}
                            </p>
                          )}
                        </div>

                        {/* Completion indicator */}
                        {showProgress && isCompleted && (
                          <div className="shrink-0">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group notes */}
              {group.notes && (
                <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-silver-300">
                  <p className="text-sm text-gray-700 italic">{group.notes}</p>
                </div>
              )}
            </div>
          );
        } else {
          // Standalone exercise (not in a group)
          const exercise = groupExercises[0];
          const isCompleted = completedExercises.has(exercise.id);

          return (
            <div
              key={exercise.id}
              onClick={() => onExerciseClick?.(exercise)}
              className={`border-2 ${
                isCompleted ? "border-green-300 bg-green-50" : "border-silver-300 bg-white"
              } rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${
                onExerciseClick ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Exercise number badge */}
                <div
                  className={`shrink-0 w-10 h-10 ${
                    isCompleted ? "bg-green-500" : "bg-gray-700"
                  } text-white rounded-full flex items-center justify-center font-bold text-lg`}
                >
                  {groupIndex + 1}
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">
                    {exercise.exerciseName}
                  </h4>

                  {/* Exercise details */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-700">
                      <span className="font-medium">Sets:</span>
                      <span className="text-gray-900 font-semibold">
                        {exercise.sets}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-700">
                      <span className="font-medium">Reps:</span>
                      <span className="text-gray-900 font-semibold">
                        {exercise.reps}
                        {exercise.eachSide && " each side"}
                      </span>
                    </div>

                    {exercise.weight && (
                      <div className="flex items-center gap-1 text-gray-700">
                        <span className="font-medium">Weight:</span>
                        <span className="text-gray-900 font-semibold">
                          {formatWeight(exercise)}
                        </span>
                      </div>
                    )}

                    {exercise.tempo && (
                      <div className="flex items-center gap-1 text-gray-700">
                        <span className="font-medium">Tempo:</span>
                        <span className="text-gray-900 font-semibold">
                          {exercise.tempo}
                        </span>
                      </div>
                    )}

                    {exercise.restTime && (
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-gray-900 font-semibold">
                          {formatRestTime(exercise.restTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Exercise notes */}
                  {exercise.notes && (
                    <p className="mt-2 text-sm text-gray-600 italic border-l-2 border-silver-400 pl-3">
                      {exercise.notes}
                    </p>
                  )}
                </div>

                {/* Completion indicator */}
                {showProgress && isCompleted && (
                  <div className="shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
