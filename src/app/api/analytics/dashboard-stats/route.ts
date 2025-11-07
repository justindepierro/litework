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
import {
  getAuthenticatedUser,
  hasRoleOrHigher,
  isCoach,
} from "@/lib/auth-server";
import { supabase } from "@/lib/supabase";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
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

    // Get personal records count
    // A PR is when an athlete lifts more weight than their previous best for an exercise
    const { data: prData, error: prError } = await supabase
      .from("workout_sets")
      .select("exercise_id")
      .eq("user_id", user.id)
      .eq("is_pr", true);

    if (prError) throw prError;

    // Calculate current streak
    // Fetch all completed workout dates, sorted descending
    const { data: allWorkouts, error: streakError } = await supabase
      .from("workout_sessions")
      .select("completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (streakError) throw streakError;

    let currentStreak = 0;
    if (allWorkouts && allWorkouts.length > 0) {
      const dates = allWorkouts.map((w) => {
        const date = new Date(w.completed_at!);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      // Remove duplicates and sort
      const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

      // Check if today or yesterday has a workout
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

      if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
        currentStreak = 1;
        let expectedDate = uniqueDates[0] - 24 * 60 * 60 * 1000;

        for (let i = 1; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === expectedDate) {
            currentStreak++;
            expectedDate -= 24 * 60 * 60 * 1000;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        workoutsThisWeek: weekWorkouts?.length || 0,
        personalRecords: prData?.length || 0,
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
}
