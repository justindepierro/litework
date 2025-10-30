"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, WorkoutPlan, SetRecord } from "@/types";
import { Dumbbell, PartyPopper, Clock, Target, TrendingUp, Info, Trophy } from "lucide-react";

// Exercise form tips data
const exerciseTips: Record<string, string[]> = {
  "bench-press": [
    "Keep your shoulder blades retracted and tight",
    "Maintain a slight arch in your lower back",
    "Lower the bar to your chest with control"
  ],
  "shoulder-shrug": [
    "Keep shoulders back and down at the start",
    "Squeeze shoulder blades together at the top",
    "Don't roll shoulders forward"
  ],
  "tricep-extension": [
    "Keep your upper arms stationary",
    "Focus on controlled movement",
    "Don't let elbows flare out"
  ],
  "jump-squats": [
    "Land softly on the balls of your feet",
    "Keep knees aligned with toes",
    "Maintain upright posture"
  ]
};

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

export default function WorkoutLive({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();

  // Auto-progression logic
  const getProgressionSuggestion = (exercise: typeof currentExercise, previousSets: SetRecord[]) => {
    if (previousSets.length === 0) return null;
    
    const lastSet = previousSets[previousSets.length - 1];
    const canIncreaseWeight = lastSet.actualReps >= exercise.reps + 2;
    const canIncreaseReps = lastSet.actualReps < exercise.reps && lastSet.actualReps >= exercise.reps - 1;
    
    if (canIncreaseWeight && exercise.weightType === "fixed") {
      return {
        type: "weight",
        suggestion: `Try ${(lastSet.actualWeight || 0) + 5} lbs`,
        reason: `You hit ${lastSet.actualReps} reps last set!`
      };
    } else if (canIncreaseReps) {
      return {
        type: "reps",
        suggestion: `Try ${exercise.reps + 1} reps`,
        reason: `You're close to target reps!`
      };
    }
    return null;
  };
  const [workoutPlan] = useState<WorkoutPlan>(sampleWorkoutPlan);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  const currentExercise = workoutPlan.exercises[currentExerciseIndex];
  const isLastExercise =
    currentExerciseIndex === workoutPlan.exercises.length - 1;
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
    workoutAssignmentId: "live-session",
    date: new Date(),
    mode: "live",
    exercises: workoutPlan.exercises.map((exercise) => ({
      id: `session-${exercise.id}`,
      workoutExerciseId: exercise.id,
      exerciseName: exercise.exerciseName,
      targetSets: exercise.sets,
      completedSets: 0,
      setRecords: [],
      started: false,
      completed: false,
      isModified: false,
    })),
    started: false,
    completed: false,
    progressPercentage: 0,
    appliedModifications: [],
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
  }, [
    currentExercise.id,
    currentExercise.weightType,
    currentExercise.weight,
    currentExercise.reps,
  ]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
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

  const formatWeight = (exercise: {
    weightType: string;
    percentage?: number;
    weight?: number;
  }) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage")
      return `${exercise.percentage}% of 1RM`;
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
      actualWeight:
        currentExercise.weightType === "bodyweight" ? 0 : actualWeight,
      completed: true,
      completedAt: new Date(),
    };

    const updatedExercises = workoutSession.exercises.map((exercise) => {
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

    const totalSets = updatedExercises.reduce(
      (acc, ex) => acc + ex.targetSets,
      0
    );
    const completedSets = updatedExercises.reduce(
      (acc, ex) => acc + ex.completedSets,
      0
    );
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
        <div className="text-heading-primary">
          Please log in to start your workout.
        </div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <Dumbbell className="w-16 h-16 text-accent-orange mb-4 mx-auto" />
          <h1 className="text-heading-primary text-2xl mb-4">
            Ready to start your workout?
          </h1>
          <p className="text-body-secondary mb-8">
            {workoutPlan.name} • {workoutPlan.estimatedDuration} minutes •{" "}
            {workoutPlan.exercises.length} exercises
          </p>
          <button
            onClick={startWorkout}
            className="btn-primary text-xl px-8 py-4 w-full"
          >
            <span className="workout-accent-strength text-2xl">🚀</span> Start
            Workout
          </button>
          <Link
            href={`/workouts/view/${sessionId}`}
            className="btn-secondary mt-4 w-full"
          >
            ← Back to View Mode
          </Link>
        </div>
      </div>
    );
  }

  if (workoutSession?.completed) {
    const totalWeight = workoutSession.exercises.reduce((acc, ex) => 
      acc + ex.setRecords.reduce((setAcc, set) => setAcc + (set.actualWeight || 0) * set.actualReps, 0), 0
    );
    const totalReps = workoutSession.exercises.reduce((acc, ex) => 
      acc + ex.setRecords.reduce((setAcc, set) => setAcc + set.actualReps, 0), 0
    );

    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* Animated celebration */}
          <div className="mb-6">
            <div className="flex justify-center mb-2">
              <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
            </div>
            <PartyPopper className="w-16 h-16 text-white mb-4 mx-auto animate-pulse" />
          </div>
          
          <div className="card-primary mb-6">
            <h1 className="text-heading-primary text-3xl mb-2">
              Workout Complete!
            </h1>
            <p className="text-body-secondary mb-6">
              Outstanding work on <span className="font-semibold">{workoutPlan.name}</span>!
            </p>
            
            {/* Workout Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-800 text-xl font-bold">
                  {workoutSession.exercises.reduce((acc, ex) => acc + ex.completedSets, 0)}
                </div>
                <div className="text-green-600 text-sm">Sets Completed</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 text-xl font-bold">{totalReps}</div>
                <div className="text-blue-600 text-sm">Total Reps</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-purple-800 text-xl font-bold">{totalWeight.toLocaleString()}</div>
                <div className="text-purple-600 text-sm">Total Weight (lbs)</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-orange-800 text-xl font-bold">100%</div>
                <div className="text-orange-600 text-sm">Completion</div>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-800 font-medium mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Great Work!
              </h3>
              <p className="text-yellow-700 text-sm">
                You&apos;ve completed all exercises and maintained excellent form. Keep up the consistency!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard" className="btn-primary w-full text-lg py-4">
              ← Back to Dashboard
            </Link>
            <Link href="/progress" className="btn-secondary w-full">
              View Progress
            </Link>
          </div>
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
              <h1 className="text-heading-primary text-xl flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-accent-orange" />{" "}
                {workoutPlan.name}
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
              Exercise {currentExerciseIndex + 1} of{" "}
              {workoutPlan.exercises.length} • Set {currentSetIndex + 1} of{" "}
              {currentExercise.sets}
            </div>
          </div>

          {/* Rest Timer */}
          {isResting && (
            <div className="card-primary text-center mb-8 bg-accent-blue/10 border-accent-blue">
              {/* Circular Progress Timer */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - (restTimer / (currentExercise.restTime || 120)))}`}
                    className="text-accent-blue transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-accent-blue" />
                </div>
              </div>
              
              <h2 className="text-heading-primary text-2xl mb-2">Rest Time</h2>
              <div className="text-4xl font-bold text-accent-blue mb-4">
                {formatTime(restTimer)}
              </div>
              
              <div className="flex gap-3 justify-center">
                <button onClick={skipRestTimer} className="btn-secondary">
                  Skip Rest
                </button>
                <button 
                  onClick={() => setRestTimer(restTimer + 30)} 
                  className="btn-secondary"
                >
                  +30s
                </button>
              </div>
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

              {/* Exercise Tips */}
              {exerciseTips[currentExercise.exerciseId] && (
                <div className="card-primary bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="text-blue-800 font-medium mb-2">Form Tips</h3>
                      <ul className="space-y-1 text-blue-700 text-sm">
                        {exerciseTips[currentExercise.exerciseId].map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Target className="w-3 h-3 mt-1 shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Progression Suggestion */}
              {(() => {
                const currentSessionExercise = workoutSession?.exercises.find(e => e.workoutExerciseId === currentExercise.id);
                const suggestion = getProgressionSuggestion(currentExercise, currentSessionExercise?.setRecords || []);
                
                return suggestion ? (
                  <div className="card-primary bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <div className="text-green-800 font-medium flex items-center gap-2">
                          <Dumbbell className="w-4 h-4" /> {suggestion.suggestion}
                        </div>
                        <div className="text-green-600 text-sm">
                          {suggestion.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Weight Input */}
              {currentExercise.weightType !== "bodyweight" && (
                <div className="card-primary">
                  <label className="text-heading-secondary text-lg block mb-3 text-center">
                    Actual Weight (lbs)
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() =>
                        setActualWeight(Math.max(0, actualWeight - 5))
                      }
                      className="btn-secondary text-2xl w-12 h-12 rounded-full"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={actualWeight}
                      onChange={(e) =>
                        setActualWeight(parseInt(e.target.value) || 0)
                      }
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
                    onChange={(e) =>
                      setActualReps(parseInt(e.target.value) || 0)
                    }
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
                {isLastSet && isLastExercise
                  ? "Finish Workout"
                  : isLastSet
                    ? "Next Exercise"
                    : "Complete Set"}
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
