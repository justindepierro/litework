import { useState, useCallback } from "react";
import type { PRComparison } from "@/lib/pr-detection";

/**
 * Hook for managing WorkoutLive form and UI state
 * Handles weight, reps, RPE inputs, modals, and collapsed groups
 */
export function useWorkoutLiveState() {
  // Form state
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [rpe, setRpe] = useState<number>(7);

  // UI state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [prComparison, setPrComparison] = useState<PRComparison | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showCompletedExercises, setShowCompletedExercises] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(true);

  // Form reset helpers
  const resetForm = useCallback((targetReps?: number) => {
    setReps(targetReps || 0);
    setRpe(7);
  }, []);

  const updateFormFromExercise = useCallback((
    lastSetWeight?: number | null,
    targetWeight?: number | null,
    targetReps?: string | null
  ) => {
    // Pre-fill weight from last set or target
    if (lastSetWeight) {
      setWeight(lastSetWeight);
    } else if (targetWeight) {
      setWeight(targetWeight);
    }

    // Pre-fill reps from target
    if (targetReps) {
      const repsNum = parseInt(targetReps);
      if (!isNaN(repsNum)) setReps(repsNum);
    }
  }, []);

  // Group collapse toggling
  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Modal controls
  const openExitConfirm = useCallback(() => setShowExitConfirm(true), []);
  const closeExitConfirm = useCallback(() => setShowExitConfirm(false), []);
  
  const showPRCelebration = useCallback((comparison: PRComparison) => {
    setPrComparison(comparison);
    setShowPRModal(true);
  }, []);
  
  const closePRModal = useCallback(() => {
    setShowPRModal(false);
    setPrComparison(null);
  }, []);

  return {
    // Form state
    weight,
    setWeight,
    reps,
    setReps,
    rpe,
    setRpe,
    
    // UI state
    showExitConfirm,
    openExitConfirm,
    closeExitConfirm,
    
    prComparison,
    showPRModal,
    showPRCelebration,
    closePRModal,
    
    collapsedGroups,
    toggleGroupCollapse,
    
    showCompletedExercises,
    setShowCompletedExercises,
    
    editingExerciseIndex,
    setEditingExerciseIndex,
    
    isMounted,
    setIsMounted,
    
    // Helper functions
    resetForm,
    updateFormFromExercise,
  };
}
