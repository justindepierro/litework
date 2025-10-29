"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, WorkoutPlan } from "@/types";

// Mock assigned workouts for demonstration
const mockAssignedWorkouts: WorkoutSession[] = [
  {
    id: "1",
    userId: "member1",
    workoutPlanId: "1",
    workoutPlanName: "Upper Body Strength",
    date: new Date(),
    mode: "view",
    exercises: [
      {
        id: "1",
        workoutExerciseId: "1",
        exerciseName: "Bench Press",
        targetSets: 3,
        completedSets: 0,
        setRecords: [],
        started: false,
        completed: false,
      },
      {
        id: "2",
        workoutExerciseId: "2",
        exerciseName: "Shoulder Shrug",
        targetSets: 3,
        completedSets: 0,
        setRecords: [],
        started: false,
        completed: false,
      },
      {
        id: "3",
        workoutExerciseId: "3",
        exerciseName: "Tricep Extension",
        targetSets: 3,
        completedSets: 0,
        setRecords: [],
        started: false,
        completed: false,
      },
      {
        id: "4",
        workoutExerciseId: "4",
        exerciseName: "Jump Squats",
        targetSets: 1,
        completedSets: 0,
        setRecords: [],
        started: false,
        completed: false,
      },
    ],
    started: false,
    completed: false,
    progressPercentage: 0,
  },
];

const sampleWorkoutPlan: WorkoutPlan = {
  id: "1",
  name: "Upper Body Strength",
  description: "Focus on bench press, shoulders, and triceps",
  exercises: [
    {
      id: "1",
      exerciseId: "bench-press",
      exerciseName: "Bench Press",
      sets: 3,
      reps: 10,
      weightType: "percentage",
      percentage: 75,
      restTime: 180,
      order: 1,
    },
    {
      id: "2",
      exerciseId: "shoulder-shrug",
      exerciseName: "Shoulder Shrug",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 135,
      restTime: 120,
      order: 2,
    },
    {
      id: "3",
      exerciseId: "tricep-extension",
      exerciseName: "Tricep Extension",
      sets: 3,
      reps: 8,
      weightType: "fixed",
      weight: 25,
      restTime: 90,
      order: 3,
    },
    {
      id: "4",
      exerciseId: "jump-squats",
      exerciseName: "Jump Squats",
      sets: 1,
      reps: 10,
      weightType: "bodyweight",
      restTime: 60,
      order: 4,
    },
  ],
  estimatedDuration: 45,
  createdBy: "coach1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface WorkoutViewProps {
  sessionId: string;
}

export default function WorkoutView({ sessionId }: WorkoutViewProps) {
  const { user } = useAuth();
  const [workout] = useState<WorkoutSession>(mockAssignedWorkouts[0]);
  const [workoutPlan] = useState<WorkoutPlan>(sampleWorkoutPlan);

  const formatWeight = (exercise: { weightType: string; percentage?: number; weight?: number }) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage") return `${exercise.percentage}% of 1RM`;
    return `${exercise.weight} lbs`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-heading-primary">Please log in to view your workout.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive section-spacing">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-heading-primary text-2xl sm:text-3xl">
                🏋️ {workoutPlan.name}
              </h1>
              <p className="text-body-secondary mt-1">
                {workoutPlan.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-body-small">
                <span>📅 {workout.date.toLocaleDateString()}</span>
                <span>⏱️ ~{workoutPlan.estimatedDuration} min</span>
                <span>🎯 {workoutPlan.exercises.length} exercises</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/workouts/live/${sessionId}`}
                className="btn-primary"
              >
                <span className="workout-accent-strength">🚀</span> Start Live Mode
              </Link>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="card-primary mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-heading-secondary text-lg">Progress Overview</h2>
              <span className="text-body-small px-3 py-1 bg-silver-200 rounded-full">
                {workout.progressPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-silver-300 rounded-full h-3 mb-4">
              <div
                className="bg-accent-green h-3 rounded-full transition-all duration-300"
                style={{ width: `${workout.progressPercentage}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-heading-primary text-xl">
                  {workout.exercises.filter(e => e.completed).length}
                </div>
                <div className="text-body-small">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-heading-primary text-xl">
                  {workout.exercises.length}
                </div>
                <div className="text-body-small">Total Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-heading-primary text-xl">
                  {workout.exercises.reduce((acc, e) => acc + e.completedSets, 0)}
                </div>
                <div className="text-body-small">Sets Done</div>
              </div>
              <div className="text-center">
                <div className="text-heading-primary text-xl">
                  {workout.exercises.reduce((acc, e) => acc + e.targetSets, 0)}
                </div>
                <div className="text-body-small">Total Sets</div>
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            <h2 className="text-heading-secondary text-xl">Workout Exercises</h2>
            
            {workoutPlan.exercises.map((exercise, index) => {
              const sessionExercise = workout.exercises.find(e => e.workoutExerciseId === exercise.id);
              const isCompleted = sessionExercise?.completed || false;
              
              return (
                <div
                  key={exercise.id}
                  className={`card-primary transition-all ${
                    isCompleted ? "border-accent-green bg-green-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted 
                          ? "bg-accent-green text-white" 
                          : "bg-silver-300 text-navy-700"
                      }`}>
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <div>
                        <h3 className="text-heading-secondary text-lg">
                          {exercise.exerciseName}
                        </h3>
                        <div className="flex items-center gap-4 text-body-small mt-1">
                          <span>🎯 {exercise.sets} sets × {exercise.reps} reps</span>
                          <span>⚖️ {formatWeight(exercise)}</span>
                          {exercise.restTime && (
                            <span>⏱️ {formatTime(exercise.restTime)} rest</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isCompleted && (
                      <span className="text-accent-green text-sm font-medium">
                        Complete ✓
                      </span>
                    )}
                  </div>

                  {/* Set Breakdown */}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: exercise.sets }, (_, setIndex) => {
                      const setRecord = sessionExercise?.setRecords.find(r => r.setNumber === setIndex + 1);
                      const isSetComplete = setRecord?.completed || false;
                      
                      return (
                        <div
                          key={setIndex}
                          className={`p-3 rounded-md border-2 ${
                            isSetComplete 
                              ? "border-accent-green bg-green-50" 
                              : "border-silver-300 bg-silver-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-body-primary font-medium text-sm">
                              Set {setIndex + 1}
                            </span>
                            {isSetComplete && (
                              <span className="text-accent-green text-xs">✓</span>
                            )}
                          </div>
                          <div className="text-body-small text-xs mt-1">
                            Target: {exercise.reps} reps @ {formatWeight(exercise)}
                          </div>
                          {setRecord && (
                            <div className="text-body-small text-xs mt-1 text-accent-green">
                              Actual: {setRecord.actualReps} reps @ {setRecord.actualWeight} lbs
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Exercise Notes/Instructions */}
                  {exercise.notes && (
                    <div className="mt-4 p-3 bg-silver-100 rounded-md">
                      <div className="text-body-small">
                        <strong>Notes:</strong> {exercise.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 justify-center">
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
            <Link
              href={`/workouts/live/${sessionId}`}
              className="btn-primary text-lg px-8 py-4"
            >
              <span className="workout-accent-strength text-xl">🚀</span> 
              Start Live Workout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}