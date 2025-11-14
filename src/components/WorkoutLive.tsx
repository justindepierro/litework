"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutSession } from "@/contexts/WorkoutSessionContext";
import { OfflineStatusBanner } from "@/components/OfflineStatus";
import { PRCelebrationModal } from "@/components/PRBadge";
import { checkForPR, PRComparison } from "@/lib/pr-detection";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
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
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard, SkeletonExerciseItem } from "@/components/ui/Skeleton";
import { StepperInput } from "@/components/ui/StepperInput";
import { WorkoutHeader } from "@/components/WorkoutHeader";
import type { ExerciseGroupInfo } from "@/types/session";

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
    deleteSet,
    completeExercise,
    updateGroupRound,
    resetCircuitExercises,
  } = useWorkoutSession();

  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);

  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [rpe, setRpe] = useState<number>(7);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [prComparison, setPrComparison] = useState<PRComparison | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [showCompletedExercises, setShowCompletedExercises] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [isMounted, setIsMounted] = useState(true);

  // Cleanup on unmount to prevent state updates
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Get groups for display (memoized to prevent re-creation on every render)
  const groups: Record<string, ExerciseGroupInfo> = useMemo(() => {
    const groupsMap: Record<string, ExerciseGroupInfo> = {};
    if (session?.groups) {
      session.groups.forEach((g) => {
        groupsMap[g.id] = g;
      });
    }
    return groupsMap;
  }, [session?.groups]);

  // Debug: Log groups and exercises on mount
  useEffect(() => {
    if (session) {
      console.log("[WorkoutLive] Session loaded:", {
        hasGroups: !!session.groups,
        groupCount: session.groups?.length || 0,
        groups: session.groups,
        exercisesWithGroups: session.exercises.filter((e) => e.group_id).length,
        totalExercises: session.exercises.length,
      });
    }
  }, [session]);

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
      if (lastSet.weight) setWeight(lastSet.weight);
    } else if (currentExercise.weight_target) {
      setWeight(currentExercise.weight_target);
    }

    // Pre-fill reps from target
    if (currentExercise.reps_target) {
      const repsNum = parseInt(currentExercise.reps_target);
      if (!isNaN(repsNum)) setReps(repsNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.session_exercise_id]);

  const handleCompleteSet = useCallback(async () => {
    if (!session || !currentExercise || !user) return;
    const weightNum = weight || null;
    const repsNum = reps || 0;
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

      // Check if this exercise is part of a circuit/superset
      const currentGroup = currentExercise.group_id
        ? groups[currentExercise.group_id]
        : null;

      if (
        currentGroup &&
        (currentGroup.type === "circuit" || currentGroup.type === "superset") &&
        currentGroup.rounds &&
        currentGroup.rounds > 1
      ) {
        // Find all exercises in this group
        const groupExercises = session.exercises
          .map((ex, idx) => ({ ...ex, index: idx }))
          .filter((ex) => ex.group_id === currentGroup.id);

        const currentPositionInGroup = groupExercises.findIndex(
          (ex) => ex.index === session.current_exercise_index
        );
        const isLastInGroup =
          currentPositionInGroup === groupExercises.length - 1;

        if (isLastInGroup) {
          // Just finished last exercise in the circuit
          const currentRound = session.group_rounds?.[currentGroup.id] || 1;

          if (currentRound < currentGroup.rounds) {
            // More rounds to go - loop back to first exercise in circuit
            const firstExerciseIndex = groupExercises[0].index;
            // Increment round counter
            updateGroupRound(currentGroup.id, currentRound + 1);
            // Reset completed state for all exercises in this circuit
            resetCircuitExercises(currentGroup.id);
            // Move to first exercise in circuit for next round
            setTimeout(() => {
              if (isMounted) updateExerciseIndex(firstExerciseIndex);
            }, 500);
          } else {
            // Finished all rounds - move to next exercise after this group
            if (!isLastExercise) {
              setTimeout(() => {
                if (isMounted)
                  updateExerciseIndex(session.current_exercise_index + 1);
              }, 500);
            }
          }
        } else {
          // Move to next exercise in circuit
          const nextExerciseIndex =
            groupExercises[currentPositionInGroup + 1].index;
          setTimeout(() => {
            if (isMounted) updateExerciseIndex(nextExerciseIndex);
          }, 500);
        }
      } else {
        // Regular exercise or single-round group - just move to next
        if (!isLastExercise) {
          setTimeout(() => {
            if (isMounted)
              updateExerciseIndex(session.current_exercise_index + 1);
          }, 500);
        }
      }
    } else {
      // More sets remaining - just continue to next set (no timer)
      // Form inputs are already pre-filled for the next set
    }
    const repsTarget = currentExercise.reps_target
      ? parseInt(currentExercise.reps_target)
      : 0;
    setReps(repsTarget);
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
    updateGroupRound,
    resetCircuitExercises,
    groups,
    isMounted,
  ]);

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
    setTimeout(() => {
      if (isMounted) router.push("/dashboard");
    }, 2000);
  }, [session, completeSession, router, isMounted]);

  if (showSkeleton) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-4xl space-y-4">
          <SkeletonCard />
          <div className="space-y-3">
            <SkeletonExerciseItem />
            <SkeletonExerciseItem />
            <SkeletonExerciseItem />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
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
          <Info className="w-16 h-16 text-info mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Active Workout
          </h2>
          <p className="text-gray-600 mb-6">
            Start a workout from your dashboard or calendar to begin tracking.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
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
          <Trophy className="w-24 h-24 text-warning mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workout Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-8">Great job!</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-primary">
                {completedExercises}
              </div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-success">
                {totalSets}
              </div>
              <div className="text-sm text-gray-600">Total Sets</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-brand">
                {Math.floor(session.total_duration_seconds / 60)}m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark font-medium text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Offline Status Banner */}
      <OfflineStatusBanner />

      {/* Workout Header with Timer - Fixed at top */}
      <WorkoutHeader
        workoutName={session.workout_name}
        startedAt={session.started_at}
        totalExercises={session.exercises.length}
        completedExercises={
          session.exercises.filter((ex) => ex.completed).length
        }
        onMenuClick={() => setShowExitConfirm(true)}
      />

      {/* SPLIT VIEW: Top = Scrollable Exercise List, Bottom = Fixed Input */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP SECTION: Scrollable Exercise List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-4 space-y-4 pb-4">
            {/* Completed Exercises - Collapsed by default */}
            {session.exercises.some((ex) => ex.completed) && (
              <div className="mb-4">
                <button
                  onClick={() =>
                    setShowCompletedExercises(!showCompletedExercises)
                  }
                  className="w-full flex items-center justify-between p-4 bg-success-light hover:bg-success-lighter active:bg-success border-2 border-success-light rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-semibold text-success-dark">
                      Completed (
                      {session.exercises.filter((ex) => ex.completed).length})
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-success transition-transform duration-200 ${showCompletedExercises ? "" : "-rotate-90"}`}
                  />
                </button>

                {/* Show completed exercises when expanded */}
                {showCompletedExercises && (
                  <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {session.exercises.map((exercise, index) => {
                      if (!exercise.completed) return null;

                      return (
                        <button
                          key={exercise.session_exercise_id}
                          onClick={() => setEditingExerciseIndex(index)}
                          className="w-full text-left p-4 bg-white border-2 border-success-light rounded-lg hover:shadow-md active:scale-[0.99] transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <CheckCircle className="w-4 h-4 text-success shrink-0" />
                              <span className="font-medium text-gray-900">
                                {exercise.exercise_name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {exercise.set_records.length} sets
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Active and Pending Exercises */}
            {session.exercises.map((exercise, index) => {
              // Skip completed exercises (they're in collapsed section above)
              if (exercise.completed) return null;

              const isActive = index === session.current_exercise_index;
              const isPending = !isActive; // All remaining exercises are pending since completed are filtered out

              // Check if this is the first exercise in a group
              const group = exercise.group_id
                ? groups[exercise.group_id]
                : null;
              const isFirstInGroup =
                group &&
                (index === 0 ||
                  session.exercises[index - 1]?.group_id !== exercise.group_id);

              // Determine exercise type color
              let colorClasses = {
                border: "border-success-light",
                bg: "bg-success-light",
                text: "text-success",
                badge: "bg-success-lighter text-success-dark",
                glow: "shadow-success-light",
              };

              // Color by group type
              if (group) {
                if (group.type === "circuit") {
                  colorClasses = {
                    border: "border-primary-light",
                    bg: "bg-primary-light",
                    text: "text-primary",
                    badge: "bg-primary-lighter text-primary-dark",
                    glow: "shadow-primary-light",
                  };
                } else if (group.type === "superset") {
                  colorClasses = {
                    border: "border-purple-300",
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                    badge: "bg-purple-100 text-purple-800",
                    glow: "shadow-purple-200",
                  };
                } else if (group.type === "section") {
                  colorClasses = {
                    border: "border-cyan-300",
                    bg: "bg-cyan-50",
                    text: "text-cyan-700",
                    badge: "bg-cyan-100 text-cyan-800",
                    glow: "shadow-cyan-200",
                  };
                }
              }

              if (isActive) {
                colorClasses.glow = "shadow-lg shadow-blue-200";
                colorClasses.border = "border-blue-400";
              } else if (isPending) {
                colorClasses = {
                  border: "border-gray-200",
                  bg: "bg-white",
                  text: "text-gray-700",
                  badge: "bg-gray-100 text-gray-600",
                  glow: "shadow-sm",
                };
              }

              return (
                <div key={exercise.session_exercise_id}>
                  {/* Group Header (if first in group) */}
                  {isFirstInGroup && group && (
                    <button
                      onClick={() => {
                        setCollapsedGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(group.id)) {
                            next.delete(group.id);
                          } else {
                            next.add(group.id);
                          }
                          return next;
                        });
                      }}
                      className={`w-full rounded-xl border-2 ${colorClasses.border} ${colorClasses.bg} p-3 mb-2 transition-all duration-200 hover:shadow-md active:scale-[0.99]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 ${colorClasses.text} transition-transform duration-200 ${
                              collapsedGroups.has(group.id) ? "-rotate-90" : ""
                            }`}
                          />
                          <div>
                            <span
                              className={`text-xs font-bold uppercase tracking-wide ${colorClasses.text} block`}
                            >
                              {group.type}
                            </span>
                            <span
                              className={`font-semibold ${colorClasses.text}`}
                            >
                              {group.name}
                            </span>
                            {group.rounds && group.rounds > 1 && (
                              <span
                                className={`text-sm ${colorClasses.text} opacity-75 ml-2`}
                              >
                                • Round {session.group_rounds?.[group.id] || 1}{" "}
                                of {group.rounds}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Exercise Card (hide if group is collapsed) */}
                  {(!group || !collapsedGroups.has(group.id)) && (
                    <button
                      onClick={() => {
                        // Always activate for recording since completed exercises are filtered out
                        updateExerciseIndex(index);
                      }}
                      className={`w-full text-left rounded-xl border-2 transition-all duration-200 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.glow} ${
                        isActive
                          ? "scale-[1.02] shadow-lg ring-2 ring-blue-400 ring-opacity-50"
                          : "hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                      } ${isPending ? "opacity-75" : "opacity-100"} ${group ? "ml-4" : ""} mb-3`}
                      style={{ minHeight: "56px" }}
                    >
                      <div className="p-5">
                        {/* Exercise Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isActive && (
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                              )}
                              <h3
                                className={`text-xl font-semibold ${colorClasses.text}`}
                              >
                                {exercise.exercise_name}
                              </h3>
                            </div>

                            {/* Exercise Meta */}
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span
                                className={`px-2 py-0.5 rounded ${colorClasses.badge} font-medium`}
                              >
                                {exercise.sets_target} × {exercise.reps_target}
                              </span>
                              {exercise.weight_target && (
                                <span
                                  className={`px-2 py-0.5 rounded ${colorClasses.badge}`}
                                >
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

                            {/* Coach's Notes - Show for active exercise */}
                            {isActive && exercise.notes && (
                              <div className="mt-3 p-3 bg-primary-lighter rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <h4 className="text-xs font-bold text-primary-dark uppercase tracking-wide mb-1">
                                      Coach&apos;s Tips
                                    </h4>
                                    <p className="text-sm text-primary-dark leading-relaxed whitespace-pre-wrap">
                                      {exercise.notes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Progress Indicator */}
                          <div className="ml-4 text-right shrink-0">
                            <div
                              className={`text-sm font-semibold ${colorClasses.text}`}
                            >
                              {exercise.sets_completed}/{exercise.sets_target}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar (if in progress) */}
                        {exercise.sets_completed > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  isActive ? "bg-primary" : "bg-success"
                                }`}
                                style={{
                                  width: `${(exercise.sets_completed / exercise.sets_target) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Active Exercise: Show ALL set records */}
                        {isActive && exercise.set_records.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200 animate-in fade-in duration-300">
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              Completed Sets
                            </div>
                            <div className="space-y-1.5">
                              {exercise.set_records.map((set, setIndex) => (
                                <div
                                  key={setIndex}
                                  className="flex items-center justify-between text-sm bg-white/70 rounded-lg px-3 py-2 animate-in slide-in-from-right-2 duration-200 border border-blue-100"
                                  style={{
                                    animationDelay: `${setIndex * 50}ms`,
                                  }}
                                >
                                  <span className="text-gray-700 font-semibold">
                                    Set {set.set_number}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    {set.weight && (
                                      <span className="text-primary font-bold">
                                        {set.weight} lbs
                                      </span>
                                    )}
                                    <span className="text-gray-900 font-semibold">
                                      × {set.reps}
                                    </span>
                                    {set.rpe && (
                                      <span className="text-brand font-medium text-xs px-2 py-0.5 bg-brand-lighter rounded">
                                        RPE {set.rpe}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* END: Top Scrollable Section */}

        {/* BOTTOM SECTION: Fixed Input Area - Always Visible, No Scroll */}
        {currentExercise && !currentExercise.completed && (
          <div className="shrink-0 bg-white border-t-2 border-silver-300 shadow-2xl">
            <div className="px-4 py-4 pb-safe">
              {/* Active Exercise Summary Card */}
              <div className="mb-4 p-4 bg-linear-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">
                    {currentExercise.exercise_name}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {currentExercise.sets_completed + 1}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      of {currentExercise.sets_target}
                    </div>
                  </div>
                </div>

                {/* Target and Progress */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-lg">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-semibold text-gray-900">
                      {currentExercise.sets_target} ×{" "}
                      {currentExercise.reps_target}
                      {currentExercise.weight_target &&
                        ` @ ${currentExercise.weight_target} lbs`}
                    </span>
                  </div>
                  {currentExercise.rest_seconds > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-white/80 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {currentExercise.rest_seconds}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Last Set Display + Quick Copy */}
                {currentExercise.set_records.length > 0 && (
                  <div className="mt-3">
                    {/* Last Set Info */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Last Set
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-blue-600">
                          {currentExercise.set_records[
                            currentExercise.set_records.length - 1
                          ].weight || 0}{" "}
                          lbs
                        </span>
                        <span className="text-gray-400">×</span>
                        <span className="font-bold text-gray-900">
                          {
                            currentExercise.set_records[
                              currentExercise.set_records.length - 1
                            ].reps
                          }{" "}
                          reps
                        </span>
                        {currentExercise.set_records[
                          currentExercise.set_records.length - 1
                        ].rpe && (
                          <span className="text-xs font-medium text-brand px-1.5 py-0.5 bg-brand-lighter rounded">
                            RPE{" "}
                            {
                              currentExercise.set_records[
                                currentExercise.set_records.length - 1
                              ].rpe
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        const lastSet =
                          currentExercise.set_records[
                            currentExercise.set_records.length - 1
                          ];
                        if (lastSet.weight) setWeight(lastSet.weight);
                        setReps(lastSet.reps);
                        if (lastSet.rpe) setRpe(lastSet.rpe);
                      }}
                      className="w-full py-2 bg-white hover:bg-primary-lighter active:bg-primary-light border-2 border-primary-light text-primary-dark rounded-lg font-medium text-sm active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      <span className="text-base">↻</span>
                      <span>Copy to Inputs</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Horizontal Input Layout */}
              <div className="space-y-3 mb-4">
                {/* Weight and Reps side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <StepperInput
                    label="Weight"
                    value={weight}
                    onChange={setWeight}
                    step={5}
                    min={0}
                    unit="lbs"
                  />
                  <StepperInput
                    label="Reps"
                    value={reps}
                    onChange={setReps}
                    step={1}
                    min={0}
                  />
                </div>

                {/* RPE full width below */}
                <StepperInput
                  label="RPE (Effort)"
                  value={rpe}
                  onChange={setRpe}
                  step={1}
                  min={1}
                  max={10}
                />
              </div>

              {/* Complete Set Button - Larger */}
              <button
                onClick={handleCompleteSet}
                className="w-full py-5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                style={{ minHeight: "64px" }}
              >
                <CheckCircle className="w-7 h-7" />
                Complete Set
              </button>
            </div>
          </div>
        )}

        {/* Finished all sets but workout not complete - show finish button */}
        {currentExercise && currentExercise.completed && (
          <div className="shrink-0 bg-white border-t-2 border-silver-300 shadow-2xl">
            <div className="px-4 py-5">
              {isLastExercise ? (
                <button
                  onClick={handleCompleteWorkout}
                  className="w-full py-5 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                  style={{ minHeight: "64px" }}
                >
                  <Trophy className="w-7 h-7" />
                  Finish Workout
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                  style={{ minHeight: "64px" }}
                >
                  Next Exercise
                  <ChevronRight className="w-7 h-7" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* END: Split View Container */}

      {showPRModal && prComparison && currentExercise && (
        <PRCelebrationModal
          comparison={prComparison}
          exerciseName={currentExercise.exercise_name}
          onClose={() => setShowPRModal(false)}
        />
      )}

      {/* Quick Edit Modal - Edit completed sets */}
      {editingExerciseIndex !== null && session && (
        <ModalBackdrop
          isOpen={true}
          onClose={() => setEditingExerciseIndex(null)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <ModalHeader
              title={session.exercises[editingExerciseIndex].exercise_name}
              subtitle="Tap a set to edit or delete"
              icon={<Info className="w-6 h-6" />}
              onClose={() => setEditingExerciseIndex(null)}
            />
            <ModalContent>
              <div className="space-y-2">
                {session.exercises[editingExerciseIndex].set_records.map(
                  (set, setIndex) => (
                    <div
                      key={setIndex}
                      className="p-4 bg-silver-200 hover:bg-silver-300 rounded-xl shadow-sm transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Set {set.set_number}
                        </span>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete Set ${set.set_number}?`)) {
                              try {
                                if (!set.id) {
                                  alert("Cannot delete set without ID");
                                  return;
                                }
                                await deleteSet(editingExerciseIndex, set.id);
                                // Close modal if no sets left
                                if (
                                  session.exercises[editingExerciseIndex]
                                    .set_records.length === 0
                                ) {
                                  setEditingExerciseIndex(null);
                                }
                              } catch (err) {
                                console.error("Error deleting set:", err);
                                alert(
                                  "Failed to delete set. Please try again."
                                );
                              }
                            }
                          }}
                          className="text-error hover:text-error-dark hover:bg-error-lighter px-3 py-1.5 rounded-lg text-sm font-medium active:scale-95 transition-all duration-150"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                        {set.weight !== undefined && set.weight !== null && (
                          <div>
                            <label className="text-gray-600 text-xs block mb-1">
                              Weight (lbs)
                            </label>
                            <input
                              type="number"
                              defaultValue={set.weight}
                              onBlur={async (e) => {
                                const newWeight = parseFloat(e.target.value);
                                if (
                                  !isNaN(newWeight) &&
                                  newWeight !== set.weight &&
                                  set.id
                                ) {
                                  try {
                                    const response = await fetch(
                                      `/api/sets/${set.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          weight: newWeight,
                                        }),
                                      }
                                    );
                                    if (!response.ok)
                                      throw new Error("Failed to update");
                                    // Update local state
                                    const updatedSession = { ...session };
                                    const setRecord = updatedSession.exercises[
                                      editingExerciseIndex
                                    ].set_records.find((s) => s.id === set.id);
                                    if (setRecord) setRecord.weight = newWeight;
                                  } catch (err) {
                                    console.error(
                                      "Error updating weight:",
                                      err
                                    );
                                    e.target.value =
                                      set.weight?.toString() || "";
                                  }
                                }
                              }}
                              className="w-full px-2 py-1.5 border-2 border-silver-400 rounded-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-gray-600 text-xs block mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            defaultValue={set.reps}
                            onBlur={async (e) => {
                              const newReps = parseInt(e.target.value);
                              if (
                                !isNaN(newReps) &&
                                newReps !== set.reps &&
                                set.id
                              ) {
                                try {
                                  const response = await fetch(
                                    `/api/sets/${set.id}`,
                                    {
                                      method: "PATCH",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ reps: newReps }),
                                    }
                                  );
                                  if (!response.ok)
                                    throw new Error("Failed to update");
                                  // Update local state
                                  const updatedSession = { ...session };
                                  const setRecord = updatedSession.exercises[
                                    editingExerciseIndex
                                  ].set_records.find((s) => s.id === set.id);
                                  if (setRecord) setRecord.reps = newReps;
                                } catch (err) {
                                  console.error("Error updating reps:", err);
                                  e.target.value = set.reps.toString();
                                }
                              }
                            }}
                            className="w-full px-2 py-1.5 border-2 border-silver-400 rounded-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        {set.rpe !== undefined && set.rpe !== null && (
                          <div>
                            <label className="text-gray-600 text-xs block mb-1">
                              RPE
                            </label>
                            <div className="px-2 py-1.5 bg-gray-100 rounded-lg font-semibold text-gray-900">
                              {set.rpe}
                            </div>
                            <span className="text-[10px] text-gray-500">
                              Not editable yet
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Close button */}
              <div className="mt-4">
                <button
                  onClick={() => setEditingExerciseIndex(null)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 rounded-xl font-medium active:scale-95 transition-all duration-150"
                >
                  Done
                </button>
              </div>
            </ModalContent>
          </div>
        </ModalBackdrop>
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
                  className="w-full p-4 bg-primary-lighter hover:bg-primary-light active:bg-primary text-primary-dark rounded-xl font-medium text-left border-2 border-primary-light transition-all duration-150 active:scale-[0.99]"
                >
                  <div className="font-semibold mb-1">💾 Save & Exit</div>
                  <div className="text-sm text-primary-dark">
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
                  className="w-full p-4 bg-error-lighter hover:bg-error-light active:bg-error text-error-dark rounded-xl font-medium text-left border-2 border-error-light transition-all duration-150 active:scale-[0.99]"
                >
                  <div className="font-semibold mb-1">🗑️ Abandon Workout</div>
                  <div className="text-sm text-error-dark">
                    Discard this session completely.
                  </div>
                </button>

                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 rounded-xl font-medium active:scale-95 transition-all duration-150"
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
