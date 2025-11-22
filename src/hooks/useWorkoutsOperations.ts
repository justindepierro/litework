import { useState } from "react";
import { WorkoutPlan, WorkoutAssignment, AthleteGroup, User } from "@/types";

interface UseWorkoutsOperationsProps {
  setWorkouts: React.Dispatch<React.SetStateAction<WorkoutPlan[]>>;
  setShowGroupAssignModal: (value: boolean) => void;
  setShowIndividualAssignModal: (value: boolean) => void;
  setSelectedWorkout: (value: WorkoutPlan | null) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/**
 * Custom hook for managing WorkoutsClientPage operations
 * Centralizes all CRUD operations and business logic
 */
export function useWorkoutsOperations({
  setWorkouts,
  setShowGroupAssignModal,
  setShowIndividualAssignModal,
  setSelectedWorkout,
  onSuccess,
  onError,
}: UseWorkoutsOperationsProps) {
  // Assignment data - loaded on demand
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);

  /**
   * Load groups and athletes for assignment modals
   */
  const loadAssignmentData = async () => {
    if (groups.length > 0 && athletes.length > 0) return; // Already loaded

    try {
      const [groupsRes, athletesRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/athletes"),
      ]);

      const [groupsData, athletesData] = await Promise.all([
        groupsRes.json(),
        athletesRes.json(),
      ]);

      if (groupsData.success) {
        setGroups(groupsData.groups || []);
      }

      if (athletesData.success && athletesData.data) {
        setAthletes(athletesData.data.athletes || []);
      }
    } catch (err) {
      console.error("Failed to load assignment data:", err);
      onError("Failed to load groups and athletes");
    }
  };

  /**
   * Open assignment modal and load assignment data
   */
  const handleOpenAssignModal = async (
    workout: WorkoutPlan,
    mode: "group" | "individual"
  ) => {
    setSelectedWorkout(workout);
    await loadAssignmentData();

    if (mode === "group") {
      setShowGroupAssignModal(true);
    } else {
      setShowIndividualAssignModal(true);
    }
  };

  /**
   * Assign workout to athletes or groups
   */
  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess("Workout assigned successfully!");
        setShowGroupAssignModal(false);
        setShowIndividualAssignModal(false);
        setSelectedWorkout(null);
      } else {
        onError(data.error || "Failed to assign workout");
      }
    } catch (err) {
      console.error("Failed to assign workout:", err);
      onError("Failed to assign workout");
    }
  };

  /**
   * Toggle workout archived status
   */
  const handleArchiveToggle = async (
    workoutId: string,
    currentArchived: boolean
  ) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !currentArchived }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from current list (will be in opposite list now)
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        onSuccess(currentArchived ? "Workout restored" : "Workout archived");
      } else {
        onError(data.error || "Failed to update workout");
      }
    } catch (err) {
      console.error("Archive error:", err);
      onError("Failed to update workout");
    }
  };

  return {
    // Assignment data
    groups,
    athletes,

    // Operations
    handleOpenAssignModal,
    handleAssignWorkout,
    handleArchiveToggle,
    loadAssignmentData,
  };
}
