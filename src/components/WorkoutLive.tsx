"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSession } from "@/contexts/WorkoutSessionContext";
import { OfflineStatusBanner } from "@/components/OfflineStatus";
import RestTimer from "./RestTimer";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  X,
  Info,
  Trophy,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface WorkoutLiveProps {
  assignmentId: string;
}

export default function WorkoutLive({ assignmentId }: WorkoutLiveProps) {
  const router = useRouter();
  const {
    session,
    isLoading,
    error,
    pauseSession,
    resumeSession,
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
  const [showNotesPanel, setShowNotesPanel] = useState(false);

  const currentExercise = session?.exercises[session.current_exercise_index];
  const isLastExercise = session
    ? session.current_exercise_index === session.exercises.length - 1
    : false;
  const exerciseProgress = currentExercise
    ? Math.round(
        (currentExercise.sets_completed / currentExercise.sets_target) * 100
      )
    : 0;

  useEffect(() => {
    if (!currentExercise) return;
    if (currentExercise.set_records.length > 0) {
      const lastSet =
        currentExercise.set_records[currentExercise.set_records.length - 1];
      if (lastSet.weight) setWeight(lastSet.weight.toString());
    } else if (currentExercise.weight_target) {
      setWeight(currentExercise.weight_target.toString());
    }
    if (currentExercise.reps_target) {
      const repsNum = parseInt(currentExercise.reps_target);
      if (!isNaN(repsNum)) setReps(repsNum.toString());
    }
  }, [currentExercise?.session_exercise_id]);

  const handleCompleteSet = useCallback(async () => {
    if (!session || !currentExercise) return;
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
    addSetRecord,
    completeExercise,
    isLastExercise,
    updateExerciseIndex,
  ]);

  const handleRestComplete = useCallback(() => setShowRestTimer(false), []);
  const handlePrevious = useCallback(() => {
    if (!session || session.current_exercise_index === 0) return;
    updateExerciseIndex(session.current_exercise_index - 1);
  }, [session, updateExerciseIndex]);
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
  const handlePauseResume = useCallback(() => {
    if (!session) return;
    if (session.status === "active") pauseSession();
    else resumeSession();
  }, [session, pauseSession, resumeSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading workout...</p>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Offline Status Banner */}
      <OfflineStatusBanner />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {session.workout_name}
              </h1>
              <p className="text-sm text-gray-600">
                Exercise {session.current_exercise_index + 1} of{" "}
                {session.exercises.length}
              </p>
            </div>
            <button
              onClick={handlePauseResume}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {session.status === "active" ? (
                <Pause className="w-6 h-6 text-blue-600" />
              ) : (
                <Play className="w-6 h-6 text-green-600" />
              )}
            </button>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((session.current_exercise_index + exerciseProgress / 100) / session.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {currentExercise && (
          <>
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentExercise.exercise_name}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      {currentExercise.sets_target} sets ×{" "}
                      {currentExercise.reps_target} reps
                    </div>
                    {currentExercise.weight_target && (
                      <div className="text-blue-600 font-medium">
                        Target: {currentExercise.weight_target} lbs
                      </div>
                    )}
                    {currentExercise.rest_seconds > 0 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {currentExercise.rest_seconds}s rest
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowNotesPanel(!showNotesPanel)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Info className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              {showNotesPanel && currentExercise.notes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    {currentExercise.notes}
                  </p>
                </div>
              )}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Sets Completed: {currentExercise.sets_completed} /{" "}
                    {currentExercise.sets_target}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {exerciseProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${exerciseProgress}%` }}
                  />
                </div>
              </div>
            </div>
            {currentExercise.set_records.length > 0 && (
              <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Previous Sets
                </h3>
                <div className="space-y-2">
                  {currentExercise.set_records.map((set, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">
                          Set {set.set_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {set.weight && (
                          <span className="text-gray-600">
                            <span className="font-medium text-gray-900">
                              {set.weight}
                            </span>{" "}
                            lbs
                          </span>
                        )}
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">
                            {set.reps}
                          </span>{" "}
                          reps
                        </span>
                        {set.rpe && (
                          <span className="text-gray-600">
                            RPE{" "}
                            <span className="font-medium text-gray-900">
                              {set.rpe}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {currentExercise.sets_completed < currentExercise.sets_target && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Record Set {currentExercise.sets_completed + 1}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reps Completed
                  </label>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPE (Rate of Perceived Exertion)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rpe}
                      onChange={(e) => setRpe(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                      {rpe}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Easy</span>
                    <span>Moderate</span>
                    <span>Max Effort</span>
                  </div>
                </div>
                <button
                  onClick={handleCompleteSet}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle className="w-6 h-6 inline-block mr-2" />
                  Complete Set
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={session.current_exercise_index === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          {isLastExercise && currentExercise?.completed ? (
            <button
              onClick={handleCompleteWorkout}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
            >
              <Trophy className="w-5 h-5 inline-block mr-2" />
              Finish Workout
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                session.current_exercise_index >= session.exercises.length - 1
              }
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Exercise
              <ChevronRight className="w-5 h-5 inline-block ml-2" />
            </button>
          )}
        </div>
      </div>
      {showRestTimer && currentExercise && (
        <RestTimer
          key={`rest-${session.current_exercise_index}-${currentExercise.sets_completed}`}
          duration={currentExercise.rest_seconds}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      )}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Exit Workout?
            </h3>
            <p className="text-gray-600 mb-6">
              Choose how you&apos;d like to handle this workout session.
            </p>

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
          </div>
        </div>
      )}
    </div>
  );
}
