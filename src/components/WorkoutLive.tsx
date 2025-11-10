"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSession } from "@/contexts/WorkoutSessionContext";
import { OfflineStatusBanner } from "@/components/OfflineStatus";
import { PRCelebrationModal } from "@/components/PRBadge";
import { checkForPR, PRComparison } from "@/lib/pr-detection";
import { useAuth } from "@/contexts/AuthContext";
import RestTimer from "./RestTimer";
import {
  ChevronRight,
  CheckCircle,
  X,
  Info,
  Trophy,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface WorkoutLiveProps {
  assignmentId: string;
}

export default function WorkoutLive({}: WorkoutLiveProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    session,
    isLoading,
    error,
    pauseSession,
    completeSession,
    abandonSession,
    updateExerciseIndex,
    addSetRecord,
    completeExercise,
  } = useWorkoutSession();

  const [weight, setWeight] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [rpe, setRpe] = useState<number>(7);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [prComparison, setPrComparison] = useState<PRComparison | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);

  const currentExercise = session?.exercises[session.current_exercise_index];
  const isLastExercise = session
    ? session.current_exercise_index === session.exercises.length - 1
    : false;

  // Pre-fill form fields when exercise changes
  useEffect(() => {
    if (!currentExercise) return;

    // Pre-fill weight from last set or target
    if (currentExercise.set_records.length > 0) {
      const lastSet =
        currentExercise.set_records[currentExercise.set_records.length - 1];
      if (lastSet.weight) setWeight(lastSet.weight.toString());
    } else if (currentExercise.weight_target) {
      setWeight(currentExercise.weight_target.toString());
    }

    // Pre-fill reps from target
    if (currentExercise.reps_target) {
      const repsNum = parseInt(currentExercise.reps_target);
      if (!isNaN(repsNum)) setReps(repsNum.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.session_exercise_id]);

  const handleCompleteSet = useCallback(async () => {
    if (!session || !currentExercise || !user) return;
    const weightNum = weight ? parseFloat(weight) : null;
    const repsNum = reps ? parseInt(reps) : 0;
    if (repsNum === 0) {
      alert("Please enter the number of reps completed");
      return;
    }
    const setRecord = {
      session_exercise_id: currentExercise.session_exercise_id,
      set_number: currentExercise.sets_completed + 1,
      weight: weightNum,
      reps: repsNum,
      rpe: rpe,
      completed_at: new Date().toISOString(),
    };
    addSetRecord(session.current_exercise_index, setRecord);

    // Check for PR
    if (weightNum) {
      try {
        const comparison = await checkForPR(
          user.id,
          currentExercise.exercise_id,
          weightNum,
          repsNum
        );
        if (comparison.isPR) {
          setPrComparison(comparison);
          setShowPRModal(true);
        }
      } catch (error) {
        console.error("[PR Detection] Failed to check for PR:", error);
      }
    }

    try {
      await fetch(`/api/sessions/${session.id}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setRecord),
      });
    } catch (error) {
      console.error("Failed to save set:", error);
    }
    if (currentExercise.sets_completed + 1 >= currentExercise.sets_target) {
      completeExercise(session.current_exercise_index);
      if (!isLastExercise) {
        setTimeout(
          () => updateExerciseIndex(session.current_exercise_index + 1),
          500
        );
      }
    } else {
      setShowRestTimer(true);
    }
    setReps(currentExercise.reps_target || "");
    setRpe(7);
  }, [
    session,
    currentExercise,
    weight,
    reps,
    rpe,
    user,
    addSetRecord,
    completeExercise,
    isLastExercise,
    updateExerciseIndex,
  ]);

  const handleRestComplete = useCallback(() => setShowRestTimer(false), []);
  
  const handleNext = useCallback(() => {
    if (
      !session ||
      session.current_exercise_index >= session.exercises.length - 1
    )
      return;
    updateExerciseIndex(session.current_exercise_index + 1);
  }, [session, updateExerciseIndex]);
  
  const handleCompleteWorkout = useCallback(async () => {
    if (!session) return;
    const allComplete = session.exercises.every((ex) => ex.completed);
    if (
      !allComplete &&
      !window.confirm(
        "Not all exercises are complete. Are you sure you want to finish?"
      )
    )
      return;
    await completeSession();
    setTimeout(() => router.push("/dashboard"), 2000);
  }, [session, completeSession, router]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Loading workout..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <Info className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Active Workout
          </h2>
          <p className="text-gray-600 mb-6">
            Start a workout from your dashboard or calendar to begin tracking.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (session.status === "completed") {
    const completedExercises = session.exercises.filter(
      (ex) => ex.completed
    ).length;
    const totalSets = session.exercises.reduce(
      (sum, ex) => sum + ex.sets_completed,
      0
    );
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-lg w-full text-center">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workout Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-8">Great job!</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600">
                {completedExercises}
              </div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600">
                {totalSets}
              </div>
              <div className="text-sm text-gray-600">Total Sets</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(session.total_duration_seconds / 60)}m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col h-screen overflow-hidden">
      {/* Offline Status Banner */}
      <OfflineStatusBanner />

      {/* Sticky Header - 100px */}
      <div className="bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Exit Button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Exit workout"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Workout Title & Progress */}
            <div className="text-center flex-1 px-4">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {session.workout_name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {session.exercises.filter((ex) => ex.completed).length} of{" "}
                {session.exercises.length} exercises complete
              </p>
            </div>
            
            {/* Menu Button (⋮) - For future controls */}
            <button
              onClick={() => {/* TODO: Open controls menu */}}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Workout controls"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(session.exercises.filter((ex) => ex.completed).length / session.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Exercise List */}
      <div className="flex-1 overflow-y-auto pb-6" style={{ paddingBottom: '24px' }}>
        <div className="px-4 py-6 space-y-4">
          {session.exercises.map((exercise, index) => {
            const isActive = index === session.current_exercise_index;
            const isPending = !exercise.completed && !isActive;
            const isCompleted = exercise.completed;
            
            // Determine exercise type color
            let colorClasses = {
              border: 'border-green-200',
              bg: 'bg-green-50',
              text: 'text-green-700',
              badge: 'bg-green-100 text-green-800',
              glow: 'shadow-green-200',
            };
            
            // TODO: Add circuit/superset detection and color coding
            // if (exercise.group_type === 'circuit') colorClasses = bluePalette
            // if (exercise.group_type === 'superset') colorClasses = purplePalette
            
            if (isActive) {
              colorClasses = {
                border: 'border-blue-400',
                bg: 'bg-blue-50',
                text: 'text-blue-900',
                badge: 'bg-blue-100 text-blue-800',
                glow: 'shadow-lg shadow-blue-200',
              };
            } else if (isPending) {
              colorClasses = {
                border: 'border-gray-200',
                bg: 'bg-white',
                text: 'text-gray-700',
                badge: 'bg-gray-100 text-gray-600',
                glow: 'shadow-sm',
              };
            } else if (isCompleted) {
              colorClasses = {
                border: 'border-green-300',
                bg: 'bg-green-50',
                text: 'text-green-900',
                badge: 'bg-green-100 text-green-800',
                glow: 'shadow-sm',
              };
            }
            
            return (
              <button
                key={exercise.session_exercise_id}
                onClick={() => updateExerciseIndex(index)}
                className={`w-full text-left rounded-xl border-2 transition-all duration-200 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.glow} ${
                  isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                } ${isPending ? 'opacity-75' : 'opacity-100'}`}
                style={{ minHeight: '48px' }}
              >
                <div className="p-4">
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        )}
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                        )}
                        <h3 className={`text-lg font-semibold ${colorClasses.text}`}>
                          {exercise.exercise_name}
                        </h3>
                      </div>
                      
                      {/* Exercise Meta */}
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded ${colorClasses.badge} font-medium`}>
                          {exercise.sets_target} × {exercise.reps_target}
                        </span>
                        {exercise.weight_target && (
                          <span className={`px-2 py-0.5 rounded ${colorClasses.badge}`}>
                            {exercise.weight_target} lbs
                          </span>
                        )}
                        {exercise.rest_seconds > 0 && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exercise.rest_seconds}s
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="ml-4 text-right shrink-0">
                      {isCompleted ? (
                        <div className="text-green-600 font-bold">✓</div>
                      ) : (
                        <div className={`text-sm font-semibold ${colorClasses.text}`}>
                          {exercise.sets_completed}/{exercise.sets_target}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar (if in progress) */}
                  {!isCompleted && exercise.sets_completed > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isActive ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{
                            width: `${(exercise.sets_completed / exercise.sets_target) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Active Exercise: Show set records */}
                  {isActive && exercise.set_records.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="space-y-1">
                        {exercise.set_records.slice(-2).map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1"
                          >
                            <span className="text-gray-600 font-medium">Set {set.set_number}</span>
                            <span className="text-gray-900">
                              {set.weight && `${set.weight} lbs × `}
                              {set.reps} reps
                              {set.rpe && ` @ RPE ${set.rpe}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Input Area - Only show for active exercise */}
      {currentExercise && !currentExercise.completed && (
        <div className="bg-white border-t-2 border-gray-200 shadow-lg shrink-0 safe-area-bottom">
          <div className="px-4 py-4">
            <div className="mb-3">
              <div className="text-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Recording Set {currentExercise.sets_completed + 1}
                </span>
              </div>
              
              {/* Quick Input Controls */}
              <div className="grid grid-cols-3 gap-3">
                {/* Weight Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-3 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                    inputMode="decimal"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                
                {/* Reps Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full px-3 py-3 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="0"
                    inputMode="numeric"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                
                {/* RPE Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 text-center">
                    RPE
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rpe}
                    onChange={(e) => setRpe(parseInt(e.target.value) || 7)}
                    className="w-full px-3 py-3 text-xl font-bold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    inputMode="numeric"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Complete Set Button */}
            <button
              onClick={handleCompleteSet}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              style={{ minHeight: '56px' }}
            >
              <CheckCircle className="w-6 h-6" />
              Complete Set
            </button>
          </div>
        </div>
      )}
      
      {/* Finished all sets but workout not complete - show finish button */}
      {currentExercise && currentExercise.completed && (
        <div className="bg-white border-t-2 border-gray-200 shadow-lg shrink-0 safe-area-bottom">
          <div className="px-4 py-4">
            {isLastExercise ? (
              <button
                onClick={handleCompleteWorkout}
                className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ minHeight: '56px' }}
              >
                <Trophy className="w-6 h-6" />
                Finish Workout
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ minHeight: '56px' }}
              >
                Next Exercise
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
      {showRestTimer && currentExercise && (
        <RestTimer
          key={`rest-${session.current_exercise_index}-${currentExercise.sets_completed}`}
          duration={currentExercise.rest_seconds}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      )}
      {showPRModal && prComparison && currentExercise && (
        <PRCelebrationModal
          comparison={prComparison}
          exerciseName={currentExercise.exercise_name}
          onClose={() => setShowPRModal(false)}
        />
      )}
      {showExitConfirm && (
        <ModalBackdrop
          isOpen={showExitConfirm}
          onClose={() => setShowExitConfirm(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full">
            <ModalHeader
              title="Exit Workout?"
              subtitle="Choose how you'd like to handle this workout session."
              icon={<AlertCircle className="w-6 h-6" />}
              onClose={() => setShowExitConfirm(false)}
            />
            <ModalContent>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await pauseSession();
                    router.push("/dashboard");
                  }}
                  className="w-full p-4 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-medium text-left border-2 border-blue-200 transition-colors"
                >
                  <div className="font-semibold mb-1">💾 Save & Exit</div>
                  <div className="text-sm text-blue-700">
                    Your progress will be saved. Resume anytime.
                  </div>
                </button>

                <button
                  onClick={async () => {
                    if (
                      confirm(
                        "Are you sure? This workout will be marked as abandoned and cannot be resumed."
                      )
                    ) {
                      await abandonSession();
                      router.push("/dashboard");
                    }
                  }}
                  className="w-full p-4 bg-red-50 hover:bg-red-100 text-red-900 rounded-xl font-medium text-left border-2 border-red-200 transition-colors"
                >
                  <div className="font-semibold mb-1">🗑️ Abandon Workout</div>
                  <div className="text-sm text-red-700">
                    Discard this session completely.
                  </div>
                </button>

                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </ModalContent>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
