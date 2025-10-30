"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, WorkoutPlan, SetRecord, WorkoutExercise } from "@/types";
import {
  Dumbbell,
  PartyPopper,
  Clock,
  Target,
  TrendingUp,
  Info,
  Trophy,
  Rocket,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// Exercise form tips data
const exerciseTips: Record<string, string[]> = {
  "bench-press": [
    "Keep your shoulder blades retracted and tight",
    "Maintain a slight arch in your lower back",
    "Lower the bar to your chest with control",
  ],
  "shoulder-shrug": [
    "Keep shoulders back and down at the start",
    "Squeeze shoulder blades together at the top",
    "Don't roll shoulders forward",
  ],
  "tricep-extension": [
    "Keep your upper arms stationary",
    "Focus on controlled movement",
    "Don't let elbows flare out",
  ],
  "jump-squats": [
    "Land softly on the balls of your feet",
    "Keep knees aligned with toes",
    "Maintain upright posture",
  ],
};

export default function WorkoutLive({ sessionId }: { sessionId: string }) {
  const { user } = useAuth();

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  // Load workout session from API
  useEffect(() => {
    const loadWorkoutSession = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implement actual API call to fetch workout session
        // const response = await apiClient.getWorkoutSession(sessionId);
        // if (response.success && response.data) {
        //   setWorkoutPlan(response.data.workoutPlan);
        // } else {
        //   setError(response.error || "Failed to load workout");
        // }
        
        // For now, just set null until API is implemented
        setWorkoutPlan(null);
        setError("No workout session found. Please check back later.");
      } catch (err) {
        setError("Failed to load workout session");
        console.error("Error loading workout session:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && user) {
      loadWorkoutSession();
    }
  }, [sessionId, user]);

  // Auto-progression logic
  const getProgressionSuggestion = (
    exercise: WorkoutExercise,
    previousSets: SetRecord[]
  ) => {
    if (previousSets.length === 0) return null;

    const lastSet = previousSets[previousSets.length - 1];
    const canIncreaseWeight = lastSet.actualReps >= exercise.reps + 2;
    const canIncreaseReps =
      lastSet.actualReps < exercise.reps &&
      lastSet.actualReps >= exercise.reps - 1;

    if (canIncreaseWeight && exercise.weightType === "fixed") {
      return {
        type: "weight",
        suggestion: `Try ${(lastSet.actualWeight || 0) + 5} lbs`,
        reason: `You hit ${lastSet.actualReps} reps last set!`,
      };
    } else if (canIncreaseReps) {
      return {
        type: "reps",
        suggestion: `Try ${exercise.reps + 1} reps`,
        reason: `You're close to target reps!`,
      };
    }
    return null;
  };

  const currentExercise = workoutPlan?.exercises[currentExerciseIndex];
  const isLastExercise =
    currentExerciseIndex === (workoutPlan?.exercises.length || 1) - 1;
  const isLastSet = currentSetIndex >= (currentExercise?.sets || 1) - 1;

  // Initialize state based on current exercise
  const [actualWeight, setActualWeight] = useState(() =>
    currentExercise?.weightType === "fixed" ? currentExercise?.weight || 0 : 0
  );
  const [actualReps, setActualReps] = useState(() => currentExercise?.reps || 0);

  // Initialize workout session
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>(() => ({
    id: sessionId,
    userId: user?.id || "",
    workoutPlanId: workoutPlan?.id || "",
    workoutPlanName: workoutPlan?.name || "",
    workoutAssignmentId: "live-session",
    date: new Date(),
    mode: "live",
    exercises: workoutPlan?.exercises.map((exercise) => ({
      id: `session-${exercise.id}`,
      workoutExerciseId: exercise.id,
      exerciseName: exercise.exerciseName,
      targetSets: exercise.sets,
      completedSets: 0,
      setRecords: [],
      started: false,
      completed: false,
      isModified: false,
    })) || [],
    started: false,
    completed: false,
    progressPercentage: 0,
    appliedModifications: [],
  }));

  // Update weight and reps when exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    
    const timer = setTimeout(() => {
      if (currentExercise.weightType === "fixed") {
        setActualWeight(currentExercise.weight || 0);
      } else {
        setActualWeight(0);
      }
      setActualReps(currentExercise.reps);
    }, 0);

    return () => clearTimeout(timer);
  }, [currentExercise]);

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
    if (!workoutSession || !currentExercise) return;

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
    if (currentExercise && currentSetIndex < currentExercise.sets - 1) {
      // Next set
      setCurrentSetIndex(currentSetIndex + 1);
      // Start rest timer
      if (currentExercise.restTime) {
        setRestTimer(currentExercise.restTime);
        setIsResting(true);
      }
    } else if (workoutPlan && currentExerciseIndex < workoutPlan.exercises.length - 1) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Loading workout...</div>
        </div>
      </div>
    );
  }

  if (error || !workoutPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Workout Not Available</h3>
          <p className="text-gray-600 mb-6">
            {error || "The requested workout session could not be found."}
          </p>
          <Link 
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exercise Found</h3>
          <p className="text-gray-600 mb-6">
            There are no exercises in this workout plan.
          </p>
          <Link 
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <Dumbbell className="w-20 h-20 sm:w-16 sm:h-16 text-accent-orange mb-6 mx-auto" />
          <h1 className="text-heading-primary text-3xl sm:text-2xl mb-4 font-bold">
            Ready to start your workout?
          </h1>
          <p className="text-body-secondary mb-8 text-lg sm:text-base leading-relaxed">
            {workoutPlan.name} • {workoutPlan.estimatedDuration} minutes •{" "}
            {workoutPlan.exercises.length} exercises
          </p>
          <button
            onClick={startWorkout}
            className="btn-primary text-xl px-8 py-6 w-full rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all touch-manipulation mb-4 flex items-center justify-center gap-3"
          >
            <Rocket className="w-6 h-6" /> 
            Start Workout
          </button>
          <Link
            href={`/workouts/view/${sessionId}`}
            className="btn-secondary py-4 w-full rounded-xl touch-manipulation"
          >
            ← Back to View Mode
          </Link>
        </div>
      </div>
    );
  }

  if (workoutSession?.completed) {
    const totalWeight = workoutSession.exercises.reduce(
      (acc, ex) =>
        acc +
        ex.setRecords.reduce(
          (setAcc, set) => setAcc + (set.actualWeight || 0) * set.actualReps,
          0
        ),
      0
    );
    const totalReps = workoutSession.exercises.reduce(
      (acc, ex) =>
        acc + ex.setRecords.reduce((setAcc, set) => setAcc + set.actualReps, 0),
      0
    );

    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* Animated celebration */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Trophy className="w-20 h-20 sm:w-16 sm:h-16 text-yellow-400 animate-bounce" />
            </div>
            <PartyPopper className="w-16 h-16 text-accent-orange mb-4 mx-auto animate-pulse" />
          </div>

          <div className="card-primary mb-8">
            <h1 className="text-heading-primary text-4xl sm:text-3xl mb-3 font-bold">
              Workout Complete!
            </h1>
            <p className="text-body-secondary mb-8 text-lg">
              Outstanding work on{" "}
              <span className="font-semibold text-accent-orange">{workoutPlan.name}</span>!
            </p>

            {/* Mobile-optimized workout summary */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 touch-manipulation">
                <div className="text-green-800 text-2xl sm:text-xl font-bold">
                  {workoutSession.exercises.reduce(
                    (acc, ex) => acc + ex.completedSets,
                    0
                  )}
                </div>
                <div className="text-green-600 text-sm font-medium">Sets Completed</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 touch-manipulation">
                <div className="text-blue-800 text-2xl sm:text-xl font-bold">
                  {totalReps}
                </div>
                <div className="text-blue-600 text-sm font-medium">Total Reps</div>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 touch-manipulation">
                <div className="text-purple-800 text-2xl sm:text-xl font-bold">
                  {totalWeight.toLocaleString()}
                </div>
                <div className="text-purple-600 text-sm font-medium">
                  Total Weight (lbs)
                </div>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 touch-manipulation">
                <div className="text-orange-800 text-2xl sm:text-xl font-bold">100%</div>
                <div className="text-orange-600 text-sm font-medium">Completion</div>
              </div>
            </div>

            {/* Achievement badge */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="text-yellow-800 font-bold mb-3 flex items-center justify-center gap-2 text-lg">
                <Trophy className="w-5 h-5" /> Excellent Work!
              </h3>
              <p className="text-yellow-700">
                You&apos;ve completed all exercises with great consistency. 
                Keep up this momentum!
              </p>
            </div>
          </div>

          {/* Large, thumb-friendly buttons */}
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="btn-primary w-full text-xl py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all touch-manipulation"
            >
              ← Back to Dashboard
            </Link>
            <Link 
              href="/progress" 
              className="btn-secondary w-full py-4 rounded-xl touch-manipulation font-medium"
            >
              View Progress →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Mobile-optimized header with progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-heading-primary text-xl sm:text-lg flex items-center gap-2 font-bold">
                <Dumbbell className="w-6 h-6 text-accent-orange" />{" "}
                {workoutPlan.name}
              </h1>
              <Link
                href={`/workouts/view/${sessionId}`}
                className="btn-secondary text-sm px-3 py-2 rounded-lg touch-manipulation"
              >
                View Mode
              </Link>
            </div>

            {/* Enhanced progress bar */}
            <div className="w-full bg-silver-300 rounded-full h-4 mb-6 shadow-inner">
              <div
                className="bg-linear-to-r from-accent-green to-accent-blue h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${workoutSession?.progressPercentage || 0}%` }}
              ></div>
            </div>

            {/* Mobile-friendly progress text */}
            <div className="text-center bg-gray-50 rounded-xl py-3 px-4">
              <div className="text-body-primary font-semibold text-lg">
                Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}
              </div>
              <div className="text-body-small text-gray-600 mt-1">
                Set {currentSetIndex + 1} of {currentExercise.sets}
              </div>
            </div>
          </div>

          {/* Enhanced rest timer for mobile */}
          {isResting && (
            <div className="card-primary text-center mb-8 bg-accent-blue/10 border-2 border-accent-blue rounded-2xl">
              {/* Larger circular progress timer for mobile viewing */}
              <div className="relative w-40 h-40 sm:w-32 sm:h-32 mx-auto mb-6">
                <svg
                  className="w-40 h-40 sm:w-32 sm:h-32 transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - restTimer / (currentExercise.restTime || 120))}`}
                    className="text-accent-blue transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-10 h-10 sm:w-8 sm:h-8 text-accent-blue" />
                </div>
              </div>

              <h2 className="text-heading-primary text-3xl sm:text-2xl mb-3 font-bold">Rest Time</h2>
              <div className="text-5xl sm:text-4xl font-bold text-accent-blue mb-8">
                {formatTime(restTimer)}
              </div>

              {/* Large mobile-friendly buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={skipRestTimer} 
                  className="btn-primary py-4 px-8 text-lg font-bold rounded-2xl touch-manipulation shadow-lg hover:shadow-xl transition-all"
                >
                  Skip Rest →
                </button>
                <button
                  onClick={() => setRestTimer(restTimer + 30)}
                  className="btn-secondary py-4 px-6 text-lg font-medium rounded-xl touch-manipulation"
                >
                  +30 seconds
                </button>
              </div>
            </div>
          )}

          {/* Mobile-optimized current exercise interface */}
          {!isResting && (
            <div className="space-y-6">
              {/* Exercise info with larger, clearer display */}
              <div className="card-primary text-center rounded-2xl border-2 border-gray-200">
                <h2 className="text-heading-primary text-3xl sm:text-2xl mb-4 font-bold">
                  {currentExercise.exerciseName}
                </h2>
                <div className="text-body-secondary mb-6 text-lg">
                  Set {currentSetIndex + 1} of {currentExercise.sets}
                </div>
                
                {/* Target display with better mobile layout */}
                <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 rounded-xl p-4">
                  <div>
                    <div className="text-heading-primary text-2xl sm:text-xl font-bold text-accent-blue">
                      {currentExercise.reps}
                    </div>
                    <div className="text-body-small font-medium mt-1">Target Reps</div>
                  </div>
                  <div>
                    <div className="text-heading-primary text-2xl sm:text-xl font-bold text-accent-orange">
                      {formatWeight(currentExercise)}
                    </div>
                    <div className="text-body-small font-medium mt-1">Target Weight</div>
                  </div>
                </div>
              </div>

              {/* Exercise tips with better mobile formatting */}
              {exerciseTips[currentExercise.exerciseId] && (
                <div className="card-primary bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <h3 className="text-blue-800 font-bold mb-3 text-lg">
                        Form Tips
                      </h3>
                      <ul className="space-y-2 text-blue-700">
                        {exerciseTips[currentExercise.exerciseId].map(
                          (tip, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Target className="w-4 h-4 mt-1 shrink-0" />
                              <span className="text-sm leading-relaxed">{tip}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Progression suggestion with enhanced mobile visibility */}
              {(() => {
                const currentSessionExercise = workoutSession?.exercises.find(
                  (e) => e.workoutExerciseId === currentExercise.id
                );
                const suggestion = getProgressionSuggestion(
                  currentExercise,
                  currentSessionExercise?.setRecords || []
                );

                return suggestion ? (
                  <div className="card-primary bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-7 h-7 text-green-600" />
                      <div className="flex-1">
                        <div className="text-green-800 font-bold flex items-center gap-2 text-lg">
                          <Dumbbell className="w-5 h-5" />{" "}
                          {suggestion.suggestion}
                        </div>
                        <div className="text-green-600 mt-1">
                          {suggestion.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Enhanced weight input for gym use */}
              {currentExercise.weightType !== "bodyweight" && (
                <div className="card-primary rounded-2xl border-2 border-gray-200">
                  <label className="text-heading-secondary text-xl block mb-4 text-center font-bold">
                    Actual Weight (lbs)
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() =>
                        setActualWeight(Math.max(0, actualWeight - 5))
                      }
                      className="btn-secondary text-3xl w-16 h-16 sm:w-14 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all touch-manipulation"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={actualWeight}
                      onChange={(e) =>
                        setActualWeight(parseInt(e.target.value) || 0)
                      }
                      className="text-center text-3xl sm:text-2xl font-bold w-28 sm:w-24 p-4 border-3 border-accent-orange rounded-xl bg-orange-50 focus:bg-white focus:ring-2 focus:ring-accent-orange focus:border-accent-orange transition-all touch-manipulation"
                    />
                    <button
                      onClick={() => setActualWeight(actualWeight + 5)}
                      className="btn-secondary text-3xl w-16 h-16 sm:w-14 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all touch-manipulation"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Enhanced reps input for gym use */}
              <div className="card-primary rounded-2xl border-2 border-gray-200">
                <label className="text-heading-secondary text-xl block mb-4 text-center font-bold">
                  Actual Reps
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setActualReps(Math.max(0, actualReps - 1))}
                    className="btn-secondary text-3xl w-16 h-16 sm:w-14 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all touch-manipulation"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={actualReps}
                    onChange={(e) =>
                      setActualReps(parseInt(e.target.value) || 0)
                    }
                    className="text-center text-3xl sm:text-2xl font-bold w-28 sm:w-24 p-4 border-3 border-accent-blue rounded-xl bg-blue-50 focus:bg-white focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-all touch-manipulation"
                  />
                  <button
                    onClick={() => setActualReps(actualReps + 1)}
                    className="btn-secondary text-3xl w-16 h-16 sm:w-14 sm:h-14 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all touch-manipulation"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Large, prominent complete set button */}
              <button
                onClick={completeSet}
                className="btn-primary w-full text-2xl sm:text-xl py-6 sm:py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all touch-manipulation bg-linear-to-r from-accent-green to-green-600 border-0 flex items-center justify-center gap-3"
                disabled={actualReps <= 0}
              >
                <CheckCircle className="w-8 h-8" />
                {isLastSet && isLastExercise
                  ? <><PartyPopper className="w-6 h-6" /> Finish Workout</>
                  : isLastSet
                    ? <><ArrowRight className="w-6 h-6" /> Next Exercise</>
                    : "Complete Set"}
              </button>

              {/* Enhanced quick actions with better mobile layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActualReps(currentExercise.reps)}
                  className="btn-secondary py-4 rounded-xl font-medium touch-manipulation flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Use Target Reps ({currentExercise.reps})
                </button>
                {currentExercise.weightType === "fixed" && (
                  <button
                    onClick={() => setActualWeight(currentExercise.weight || 0)}
                    className="btn-secondary py-4 rounded-xl font-medium touch-manipulation flex items-center justify-center gap-2"
                  >
                    <Dumbbell className="w-5 h-5" />
                    Use Target Weight ({currentExercise.weight} lbs)
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
