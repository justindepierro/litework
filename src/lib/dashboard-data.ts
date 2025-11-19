import type {
  AthleteGroup,
  User,
  WorkoutAssignment,
  WorkoutPlan,
} from "@/types";
import type { AuthUser } from "@/lib/auth-server";
import {
  getAllAssignments,
  getAllGroups,
  getAllUsers,
  getAllWorkoutPlans,
  getAssignmentsByAthlete,
} from "@/lib/database-service";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateWorkoutStreak } from "@/lib/analytics-utils";

export interface DashboardStats {
  workoutsThisWeek: number;
  personalRecords: number;
  currentStreak: number;
}

export interface DashboardBootstrapData {
  role: AuthUser["role"];
  stats?: DashboardStats;
  assignments?: WorkoutAssignment[];
  workouts?: WorkoutPlan[];
  groups?: AthleteGroup[];
  athletes?: User[];
  coachWelcomeMessage?: string | null;
}

const EMPTY_STATS: DashboardStats = {
  workoutsThisWeek: 0,
  personalRecords: 0,
  currentStreak: 0,
};

async function getAthleteStats(userId: string): Promise<DashboardStats> {
  const supabase = supabaseAdmin;
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: weekWorkouts, error: weekError } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", userId)
      .gte("completed_at", startOfWeek.toISOString())
      .not("completed_at", "is", null);

    if (weekError) {
      throw weekError;
    }

    const { data: allWorkouts, error: historyError } = await supabase
      .from("workout_sessions")
      .select("completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    if (historyError) {
      throw historyError;
    }

    const completedDates = (allWorkouts || [])
      .map((session) => session.completed_at)
      .filter((value): value is string => Boolean(value));

    const currentStreak = calculateWorkoutStreak(completedDates);

    return {
      workoutsThisWeek: weekWorkouts?.length || 0,
      personalRecords: 0,
      currentStreak,
    };
  } catch (error) {
    console.error("[dashboard-data] Failed to compute athlete stats", error);
    return EMPTY_STATS;
  }
}

export async function getDashboardBootstrapData(
  user: AuthUser
): Promise<DashboardBootstrapData> {
  if (user.role === "coach" || user.role === "admin") {
    const [assignments, workouts, groups, users] = await Promise.all([
      getAllAssignments(),
      getAllWorkoutPlans(),
      getAllGroups(),
      getAllUsers(),
    ]);

    const filteredAssignments = assignments.filter(
      (assignment) => assignment.assignedBy === user.id
    );

    const filteredWorkouts =
      user.role === "admin"
        ? workouts
        : workouts.filter((workout) => workout.createdBy === user.id);

    const filteredGroups =
      user.role === "admin"
        ? groups
        : groups.filter((group) => group.coachId === user.id);

    const filteredAthletes = users.filter((athlete) => {
      if (athlete.role !== "athlete") {
        return false;
      }

      if (user.role === "admin") {
        return true;
      }

      return athlete.coachId === user.id;
    });

    return {
      role: user.role,
      assignments: filteredAssignments,
      workouts: filteredWorkouts,
      groups: filteredGroups,
      athletes: filteredAthletes,
    };
  }

  const [assignments, stats] = await Promise.all([
    getAssignmentsByAthlete(user.id),
    getAthleteStats(user.id),
  ]);

  return {
    role: user.role,
    assignments,
    stats,
  };
}
