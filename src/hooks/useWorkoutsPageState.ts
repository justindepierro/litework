import { useState } from "react";
import { WorkoutPlan } from "@/types";

/**
 * Custom hook for managing WorkoutsClientPage UI state
 * Centralizes all modal visibility, filters, and selection state
 */
export function useWorkoutsPageState(initialWorkouts: WorkoutPlan[] = []) {
  // Data state
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(initialWorkouts);
  const [loading, setLoading] = useState(initialWorkouts.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Modal visibility state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showGroupAssignModal, setShowGroupAssignModal] = useState(false);
  const [showIndividualAssignModal, setShowIndividualAssignModal] =
    useState(false);

  // Selection state
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [creatingWorkout, setCreatingWorkout] = useState<boolean>(false);

  // UI state
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [currentView, setCurrentView] = useState<"workouts" | "library">(
    "workouts"
  );
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    name: "",
    description: "",
    exercises: [],
    groups: [],
    blockInstances: [],
    estimatedDuration: 30,
  });

  // Helper to close all assignment modals
  const closeAssignModals = () => {
    setShowAssignForm(false);
    setShowGroupAssignModal(false);
    setShowIndividualAssignModal(false);
    setSelectedWorkout(null);
  };

  return {
    // Data state
    workouts,
    setWorkouts,
    loading,
    setLoading,
    error,
    setError,

    // Modal state
    showAssignForm,
    setShowAssignForm,
    showGroupAssignModal,
    setShowGroupAssignModal,
    showIndividualAssignModal,
    setShowIndividualAssignModal,

    // Selection state
    selectedWorkout,
    setSelectedWorkout,
    editingWorkout,
    setEditingWorkout,
    creatingWorkout,
    setCreatingWorkout,

    // UI state
    expandedWorkout,
    setExpandedWorkout,
    showArchived,
    setShowArchived,
    currentView,
    setCurrentView,
    newWorkout,
    setNewWorkout,

    // Helpers
    closeAssignModals,
  };
}
