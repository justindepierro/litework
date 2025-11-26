/**
 * Dashboard Stats API
 * GET /api/analytics/dashboard-stats
 *
 * Returns key statistics for athlete dashboard:
 * - Workouts completed this week
 * - Personal records set
 * - Current workout streak
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, getAdminClient } from "@/lib/auth-server";
import { calculateWorkoutStreak } from "@/lib/analytics-utils";

// Cache dashboard stats for 1 minute (frequently changing data)
export const revalidate = 60;

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const supabase = getAdminClient();
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      // Get workouts completed this week
      const { data: weekWorkouts, error: weekError } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .gte("completed_at", startOfWeek.toISOString())
        .not("completed_at", "is", null);

      if (weekError) throw weekError;

      // Calculate current streak using shared utility
      const { data: allWorkouts, error: streakError } = await supabase
        .from("workout_sessions")
        .select("id, completed_at")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      if (streakError) throw streakError;

      const completedDates = allWorkouts?.map((w) => w.completed_at!) || [];
      const currentStreak = calculateWorkoutStreak(completedDates);

      return NextResponse.json({
        success: true,
        stats: {
          workoutsThisWeek: weekWorkouts?.length || 0,
          personalRecords: 0, // TODO: Implement PR tracking
          currentStreak: currentStreak,
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch dashboard statistics",
          stats: {
            workoutsThisWeek: 0,
            personalRecords: 0,
            currentStreak: 0,
          },
        },
        { status: 500 }
      );
    }
  });
}
