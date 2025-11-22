import { useCallback } from "react";
import { checkForPR, PRComparison } from "@/lib/pr-detection";
import type {
  WorkoutSession,
  ExerciseProgress,
  ExerciseGroupInfo,
} from "@/types/session";

interface UseSetCompletionProps {
  // Session data
  session: WorkoutSession | null;
  currentExercise: ExerciseProgress | undefined;
  isLastExercise: boolean;
  groups: Record<string, ExerciseGroupInfo>;
  userId: string | undefined;
  isMounted: boolean;

  // Form state
  weight: number;
  reps: number;
  rpe: number;

  // Session operations from context
  addSetRecord: (exerciseIndex: number, setRecord: any) => void;
  completeExercise: (exerciseIndex: number) => void;
  updateExerciseIndex: (index: number) => void;
  updateGroupRound: (groupId: string, round: number) => void;
  resetCircuitExercises: (groupId: string) => void;

  // State updates
  onPRDetected: (comparison: PRComparison) => void;
  resetForm: (targetReps?: number) => void;
}

/**
 * Hook for handling set completion logic in WorkoutLive
 * Manages PR detection, circuit/superset navigation, and set persistence
 */
export function useSetCompletion({
  session,
  currentExercise,
  isLastExercise,
  groups,
  userId,
  isMounted,
  weight,
  reps,
  rpe,
  addSetRecord,
  completeExercise,
  updateExerciseIndex,
  updateGroupRound,
  resetCircuitExercises,
  onPRDetected,
  resetForm,
}: UseSetCompletionProps) {
  const handleCompleteSet = useCallback(async () => {
    if (!session || !currentExercise || !userId) return;

    const weightNum = weight || null;
    const repsNum = reps || 0;

    if (repsNum === 0) {
      alert("Please enter the number of reps completed");
      return;
    }

    // Create set record
    const setRecord = {
      session_exercise_id: currentExercise.session_exercise_id,
      set_number: currentExercise.sets_completed + 1,
      weight: weightNum,
      reps: repsNum,
      rpe: rpe,
      completed_at: new Date().toISOString(),
    };

    // Add to local state immediately
    addSetRecord(session.current_exercise_index, setRecord);

    // Check for PR
    if (weightNum) {
      try {
        const comparison = await checkForPR(
          userId,
          currentExercise.exercise_id,
          weightNum,
          repsNum
        );
        if (comparison.isPR) {
          onPRDetected(comparison);
        }
      } catch (error) {
        console.error("[PR Detection] Failed to check for PR:", error);
      }
    }

    // Persist to API
    try {
      await fetch(`/api/sessions/${session.id}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setRecord),
      });
    } catch (error) {
      console.error("Failed to save set:", error);
    }

    // Check if all sets are complete
    if (currentExercise.sets_completed + 1 >= currentExercise.sets_target) {
      completeExercise(session.current_exercise_index);

      // Handle circuit/superset navigation
      const currentGroup = currentExercise.group_id
        ? groups[currentExercise.group_id]
        : null;

      if (
        currentGroup &&
        (currentGroup.type === "circuit" || currentGroup.type === "superset") &&
        currentGroup.rounds &&
        currentGroup.rounds > 1
      ) {
        // Multi-round circuit/superset logic
        const groupExercises = session.exercises
          .map((ex, idx) => ({ ...ex, index: idx }))
          .filter((ex) => ex.group_id === currentGroup.id);

        const currentPositionInGroup = groupExercises.findIndex(
          (ex) => ex.index === session.current_exercise_index
        );
        const isLastInGroup =
          currentPositionInGroup === groupExercises.length - 1;

        if (isLastInGroup) {
          // Finished last exercise in circuit
          const currentRound = session.group_rounds?.[currentGroup.id] || 1;

          if (currentRound < currentGroup.rounds) {
            // More rounds to go - loop back to first exercise
            const firstExerciseIndex = groupExercises[0].index;
            updateGroupRound(currentGroup.id, currentRound + 1);
            resetCircuitExercises(currentGroup.id);

            setTimeout(() => {
              if (isMounted) updateExerciseIndex(firstExerciseIndex);
            }, 500);
          } else {
            // Finished all rounds - move to next exercise
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
    }

    // Reset form for next set
    const repsTarget = currentExercise.reps_target
      ? parseInt(currentExercise.reps_target)
      : 0;
    resetForm(repsTarget);
  }, [
    session,
    currentExercise,
    weight,
    reps,
    rpe,
    userId,
    addSetRecord,
    completeExercise,
    isLastExercise,
    updateExerciseIndex,
    updateGroupRound,
    resetCircuitExercises,
    groups,
    isMounted,
    onPRDetected,
    resetForm,
  ]);

  return {
    handleCompleteSet,
  };
}
