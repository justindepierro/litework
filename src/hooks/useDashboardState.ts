import { useState } from "react";
import type {
  WorkoutAssignment,
  WorkoutPlan,
  AthleteGroup,
  User,
} from "@/types";
import type { DashboardStats } from "@/lib/dashboard-data";

interface UseDashboardStateProps {
  initialStats?: DashboardStats;
  initialAssignments?: WorkoutAssignment[];
  initialWorkouts?: WorkoutPlan[];
  initialGroups?: AthleteGroup[];
  initialAthletes?: User[];
  initialCoachMessage?: string | null;
}

export function useDashboardState({
  initialStats,
  initialAssignments = [],
  initialWorkouts = [],
  initialGroups = [],
  initialAthletes = [],
  initialCoachMessage = null,
}: UseDashboardStateProps) {
  const DEFAULT_STATS: DashboardStats = {
    workoutsThisWeek: 0,
    personalRecords: 0,
    currentStreak: 0,
  };

  // Data state
  const [stats, setStats] = useState<DashboardStats>(
    initialStats ?? DEFAULT_STATS
  );
  const [loadingStats, setLoadingStats] = useState(!initialStats);
  const [coachWelcomeMessage, setCoachWelcomeMessage] = useState<string | null>(
    initialCoachMessage
  );

  // Assignment data
  const [assignments, setAssignments] =
    useState<WorkoutAssignment[]>(initialAssignments);
  const [workoutPlans, setWorkoutPlans] =
    useState<WorkoutPlan[]>(initialWorkouts);
  const [groups, setGroups] = useState<AthleteGroup[]>(initialGroups);
  const [athletes, setAthletes] = useState<User[]>(initialAthletes);
  const [loadingData, setLoadingData] = useState(false);

  // Modal state
  const [showGroupAssignment, setShowGroupAssignment] = useState(false);
  const [showIndividualAssignment, setShowIndividualAssignment] =
    useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  // Helper function to close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAssignmentId(null);
  };

  return {
    // Data state
    stats,
    setStats,
    loadingStats,
    setLoadingStats,
    coachWelcomeMessage,
    setCoachWelcomeMessage,

    // Assignment data
    assignments,
    setAssignments,
    workoutPlans,
    setWorkoutPlans,
    groups,
    setGroups,
    athletes,
    setAthletes,
    loadingData,
    setLoadingData,

    // Modal state
    showGroupAssignment,
    setShowGroupAssignment,
    showIndividualAssignment,
    setShowIndividualAssignment,
    showDetailModal,
    setShowDetailModal,
    selectedDate,
    setSelectedDate,
    selectedAssignmentId,
    setSelectedAssignmentId,

    // Helpers
    closeDetailModal,
  };
}
