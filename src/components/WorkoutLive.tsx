"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, WorkoutPlan, SetRecord } from "@/types";

// Mock data - same as WorkoutView
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

interface WorkoutLiveProps {
  sessionId: string;
}

export default function WorkoutLive({ sessionId }: WorkoutLiveProps) {
  const { user } = useAuth();
  const [workoutPlan] = useState<WorkoutPlan>(sampleWorkoutPlan);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  const currentExercise = workoutPlan.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workoutPlan.exercises.length - 1;
  const isLastSet = currentSetIndex >= currentExercise.sets - 1;

  // Initialize state based on current exercise
  const [actualWeight, setActualWeight] = useState(() => 
    currentExercise.weightType === "fixed" ? currentExercise.weight || 0 : 0
  );
  const [actualReps, setActualReps] = useState(() => currentExercise.reps);

  // Initialize workout session
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>(() => ({
    id: sessionId,
    userId: user?.id || "",
    workoutPlanId: workoutPlan.id,
    workoutPlanName: workoutPlan.name,
    date: new Date(),
    mode: "live",
    exercises: workoutPlan.exercises.map(exercise => ({
      id: exercise.id,
      workoutExerciseId: exercise.id,
      exerciseName: exercise.exerciseName,
      targetSets: exercise.sets,
      completedSets: 0,
      setRecords: [],
      started: false,
      completed: false,
    })),
    started: false,
    completed: false,
    progressPercentage: 0,
  }));

  // Update weight and reps when exercise changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentExercise.weightType === "fixed") {
        setActualWeight(currentExercise.weight || 0);
      } else {
        setActualWeight(0);
      }
      setActualReps(currentExercise.reps);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [currentExercise.id, currentExercise.weightType, currentExercise.weight, currentExercise.reps]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

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

  const startWorkout = () => {
    setWorkoutStarted(true);
    if (workoutSession) {
      setWorkoutSession({
        ...workoutSession,
        started: true,
        startedAt: new Date(),
      });
    }
  };

  const completeSet = () => {
    if (!workoutSession) return;

    const setRecord: SetRecord = {
      id: Date.now().toString(),
      setNumber: currentSetIndex + 1,
      targetReps: currentExercise.reps,
      actualReps,
      targetWeight: currentExercise.weight || 0,
      actualWeight: currentExercise.weightType === "bodyweight" ? 0 : actualWeight,
      completed: true,
      completedAt: new Date(),
    };

    const updatedExercises = workoutSession.exercises.map(exercise => {
      if (exercise.workoutExerciseId === currentExercise.id) {
        const updatedSetRecords = [...exercise.setRecords, setRecord];
        return {
          ...exercise,
          setRecords: updatedSetRecords,
          completedSets: updatedSetRecords.length,
          started: true,
          completed: updatedSetRecords.length >= exercise.targetSets,
        };
      }
      return exercise;
    });

    const totalSets = updatedExercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const completedSets = updatedExercises.reduce((acc, ex) => acc + ex.completedSets, 0);
    const progressPercentage = Math.round((completedSets / totalSets) * 100);

    setWorkoutSession({
      ...workoutSession,
      exercises: updatedExercises,
      progressPercentage,
    });

    // Move to next set or exercise
    if (currentSetIndex < currentExercise.sets - 1) {
      // Next set
      setCurrentSetIndex(currentSetIndex + 1);
      // Start rest timer
      if (currentExercise.restTime) {
        setRestTimer(currentExercise.restTime);
        setIsResting(true);
      }
    } else if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      // Next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      const nextExercise = workoutPlan.exercises[currentExerciseIndex + 1];
      if (nextExercise.weightType === "fixed") {
        setActualWeight(nextExercise.weight || 0);
      }
      setActualReps(nextExercise.reps);
    } else {
      // Workout complete
      const finalSession = {
        ...workoutSession,
        exercises: updatedExercises,
        completed: true,
        completedAt: new Date(),
        progressPercentage: 100,
      };
      setWorkoutSession(finalSession);
    }
  };

  const skipRestTimer = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-heading-primary">Please log in to start your workout.</div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-heading-primary text-2xl mb-4">
            Ready to start your workout?
          </h1>
          <p className="text-body-secondary mb-8">
            {workoutPlan.name} • {workoutPlan.estimatedDuration} minutes • {workoutPlan.exercises.length} exercises
          </p>
          <button
            onClick={startWorkout}
            className="btn-primary text-xl px-8 py-4 w-full"
          >
            <span className="workout-accent-strength text-2xl">🚀</span> Start Workout
          </button>
          <Link href={`/workouts/view/${sessionId}`} className="btn-secondary mt-4 w-full">
            ← Back to View Mode
          </Link>
        </div>
      </div>
    );
  }

  if (workoutSession?.completed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-heading-primary text-2xl mb-4">
            Workout Complete!
          </h1>
          <p className="text-body-secondary mb-8">
            Great job completing {workoutPlan.name}!
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="card-stat text-center">
              <div className="text-heading-primary text-xl">
                {workoutSession.exercises.reduce((acc, ex) => acc + ex.completedSets, 0)}
              </div>
              <div className="text-body-small">Sets Completed</div>
            </div>
            <div className="card-stat text-center">
              <div className="text-heading-primary text-xl">100%</div>
              <div className="text-body-small">Progress</div>
            </div>
          </div>
          <Link href="/dashboard" className="btn-primary w-full text-lg">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive section-spacing">
        <div className="max-w-2xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-heading-primary text-xl">
                🏋️ {workoutPlan.name}
              </h1>
              <Link
                href={`/workouts/view/${sessionId}`}
                className="btn-secondary text-sm"
              >
                View Mode
              </Link>
            </div>
            
            <div className="w-full bg-silver-300 rounded-full h-3 mb-4">
              <div
                className="bg-accent-green h-3 rounded-full transition-all duration-300"
                style={{ width: `${workoutSession?.progressPercentage || 0}%` }}
              ></div>
            </div>
            
            <div className="text-body-small text-center">
              Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length} • 
              Set {currentSetIndex + 1} of {currentExercise.sets}
            </div>
          </div>

          {/* Rest Timer */}
          {isResting && (
            <div className="card-primary text-center mb-8 bg-accent-blue/10 border-accent-blue">
              <div className="text-6xl mb-4">⏱️</div>
              <h2 className="text-heading-primary text-2xl mb-2">Rest Time</h2>
              <div className="text-4xl font-bold text-accent-blue mb-4">
                {formatTime(restTimer)}
              </div>
              <button
                onClick={skipRestTimer}
                className="btn-secondary"
              >
                Skip Rest
              </button>
            </div>
          )}

          {/* Current Exercise */}
          {!isResting && (
            <div className="space-y-6">
              {/* Exercise Info */}
              <div className="card-primary text-center">
                <h2 className="text-heading-primary text-2xl mb-2">
                  {currentExercise.exerciseName}
                </h2>
                <div className="text-body-secondary mb-4">
                  Set {currentSetIndex + 1} of {currentExercise.sets}
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-heading-primary text-lg">
                      {currentExercise.reps}
                    </div>
                    <div className="text-body-small">Target Reps</div>
                  </div>
                  <div>
                    <div className="text-heading-primary text-lg">
                      {formatWeight(currentExercise)}
                    </div>
                    <div className="text-body-small">Target Weight</div>
                  </div>
                </div>
              </div>

              {/* Weight Input */}
              {currentExercise.weightType !== "bodyweight" && (
                <div className="card-primary">
                  <label className="text-heading-secondary text-lg block mb-3 text-center">
                    Actual Weight (lbs)
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setActualWeight(Math.max(0, actualWeight - 5))}
                      className="btn-secondary text-2xl w-12 h-12 rounded-full"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={actualWeight}
                      onChange={(e) => setActualWeight(parseInt(e.target.value) || 0)}
                      className="text-center text-2xl font-bold w-24 p-3 border-2 border-silver-400 rounded-lg"
                    />
                    <button
                      onClick={() => setActualWeight(actualWeight + 5)}
                      className="btn-secondary text-2xl w-12 h-12 rounded-full"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Reps Input */}
              <div className="card-primary">
                <label className="text-heading-secondary text-lg block mb-3 text-center">
                  Actual Reps
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setActualReps(Math.max(0, actualReps - 1))}
                    className="btn-secondary text-2xl w-12 h-12 rounded-full"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={actualReps}
                    onChange={(e) => setActualReps(parseInt(e.target.value) || 0)}
                    className="text-center text-2xl font-bold w-24 p-3 border-2 border-silver-400 rounded-lg"
                  />
                  <button
                    onClick={() => setActualReps(actualReps + 1)}
                    className="btn-secondary text-2xl w-12 h-12 rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Complete Set Button */}
              <button
                onClick={completeSet}
                className="btn-primary w-full text-2xl py-6"
                disabled={actualReps <= 0}
              >
                <span className="workout-accent-progress text-3xl">✅</span>
                {isLastSet && isLastExercise ? "Finish Workout" : 
                 isLastSet ? "Next Exercise" : "Complete Set"}
              </button>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActualReps(currentExercise.reps)}
                  className="btn-secondary"
                >
                  Use Target Reps
                </button>
                {currentExercise.weightType === "fixed" && (
                  <button
                    onClick={() => setActualWeight(currentExercise.weight || 0)}
                    className="btn-secondary"
                  >
                    Use Target Weight
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}