import type {
  WorkoutAssignment,
  WorkoutPlan,
  AthleteGroup,
  User,
} from "@/types";
import type { DashboardStats } from "@/lib/dashboard-data";

interface UseDashboardOperationsProps {
  userId?: string;
  isCoachOrAdmin: boolean;
  assignments: WorkoutAssignment[];
  setStats: (stats: DashboardStats) => void;
  setLoadingStats: (loading: boolean) => void;
  setAssignments: (assignments: WorkoutAssignment[]) => void;
  setWorkoutPlans: (workouts: WorkoutPlan[]) => void;
  setGroups: (groups: AthleteGroup[]) => void;
  setAthletes: (athletes: User[]) => void;
  setLoadingData: (loading: boolean) => void;
  setCoachWelcomeMessage: (message: string | null) => void;
  setShowGroupAssignment: (show: boolean) => void;
  setShowIndividualAssignment: (show: boolean) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedAssignmentId: (id: string | null) => void;
  setShowDetailModal: (show: boolean) => void;
  closeDetailModal: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useDashboardOperations({
  userId,
  isCoachOrAdmin,
  assignments,
  setStats,
  setLoadingStats,
  setAssignments,
  setWorkoutPlans,
  setGroups,
  setAthletes,
  setLoadingData,
  setCoachWelcomeMessage,
  setShowGroupAssignment,
  setShowIndividualAssignment,
  setSelectedDate,
  setSelectedAssignmentId,
  setShowDetailModal,
  closeDetailModal,
  onSuccess,
  onError,
}: UseDashboardOperationsProps) {
  // Fetch dashboard stats for athletes
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch("/api/analytics/dashboard-stats");
      const data = await response.json();

      if (data.success) {
        setStats({
          workoutsThisWeek: data.stats.workoutsThisWeek || 0,
          personalRecords: data.stats.personalRecords || 0,
          currentStreak: data.stats.currentStreak || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      onError?.("Failed to load dashboard statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch assignments for athlete
  const fetchAthleteAssignments = async () => {
    if (!userId) return;

    try {
      setLoadingData(true);
      const response = await fetch(`/api/assignments?athleteId=${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAssignments(data.data.assignments || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch athlete assignments:", error);
      onError?.("Failed to load workout assignments");
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch coach welcome message
  const fetchCoachWelcomeMessage = async () => {
    try {
      // Get the athlete's coach ID from their first assignment
      if (assignments.length > 0 && assignments[0].assignedBy) {
        const response = await fetch(
          `/api/coach/settings/public?coachId=${assignments[0].assignedBy}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to fetch coach welcome message:",
            response.status,
            response.statusText,
            errorText
          );
          return;
        }

        const data = await response.json();

        if (data.success && data.settings?.welcome_message) {
          setCoachWelcomeMessage(data.settings.welcome_message);
        } else if (!data.success && data.error) {
          console.warn("Coach welcome message unavailable:", data.error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coach welcome message:", error);
    }
  };

  // Fetch all data for coach/admin
  const fetchCoachData = async () => {
    try {
      setLoadingData(true);

      // Fetch assignments, workouts, groups, and athletes in parallel
      const [assignmentsRes, workoutsRes, groupsRes, athletesRes] =
        await Promise.all([
          fetch("/api/assignments"),
          fetch("/api/workouts"),
          fetch("/api/groups"),
          fetch("/api/athletes"),
        ]);

      const [assignmentsData, workoutsData, groupsData, athletesData] =
        await Promise.all([
          assignmentsRes.json(),
          workoutsRes.json(),
          groupsRes.json(),
          athletesRes.json(),
        ]);

      if (assignmentsData.success && assignmentsData.data) {
        const assignments =
          assignmentsData.data.assignments || assignmentsData.data || [];
        setAssignments(assignments);
      }

      if (workoutsData.success && workoutsData.data) {
        setWorkoutPlans(workoutsData.data.workouts || workoutsData.data || []);
      }

      // Groups API returns { success: true, groups: [...] }
      if (groupsData.success) {
        setGroups(groupsData.groups || []);
      }

      if (athletesData.success && athletesData.data) {
        setAthletes(athletesData.data.athletes || athletesData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch coach data:", error);
      onError?.("Failed to load dashboard data");
    } finally {
      setLoadingData(false);
    }
  };

  // Assign workout to athletes/groups
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
        // Refresh assignments
        await fetchCoachData();
        onSuccess?.("Workout assigned successfully");
      } else {
        onError?.(data.error || "Failed to assign workout");
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
      onError?.("Failed to assign workout");
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        closeDetailModal();
        // Refresh assignments
        if (isCoachOrAdmin) {
          await fetchCoachData();
        } else {
          await fetchAthleteAssignments();
        }
        onSuccess?.("Assignment deleted successfully");
      } else {
        onError?.(data.error || "Failed to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      onError?.("Failed to delete assignment");
    }
  };

  // Move/reschedule assignment
  const handleAssignmentMove = async (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => {
    try {
      const response = await fetch("/api/assignments/reschedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          newDate: newDate.toISOString(),
          moveGroup: isGroupAssignment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh assignments to show new date
        if (isCoachOrAdmin) {
          await fetchCoachData();
        } else {
          await fetchAthleteAssignments();
        }
        onSuccess?.(data.message || "Assignment rescheduled successfully");
      } else {
        console.error("Failed to reschedule:", data.error);
        onError?.(data.error || "Failed to reschedule workout");
      }
    } catch (error) {
      console.error("Error rescheduling assignment:", error);
      onError?.("Failed to reschedule workout");
    }
  };

  // Modal handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowGroupAssignment(true);
  };

  const handleAssignmentClick = (assignment: WorkoutAssignment) => {
    setSelectedAssignmentId(assignment.id);
    setShowDetailModal(true);
  };

  const handleIndividualAssignClick = () => {
    setSelectedDate(new Date());
    setShowIndividualAssignment(true);
  };

  const handleGroupAssignClick = () => {
    setSelectedDate(new Date());
    setShowGroupAssignment(true);
  };

  return {
    // Data fetchers
    fetchDashboardStats,
    fetchAthleteAssignments,
    fetchCoachWelcomeMessage,
    fetchCoachData,

    // Assignment operations
    handleAssignWorkout,
    handleDeleteAssignment,
    handleAssignmentMove,

    // Modal handlers
    handleDateClick,
    handleAssignmentClick,
    handleIndividualAssignClick,
    handleGroupAssignClick,
  };
}
