import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/analytics/quick-stats
 * Fetch quick stats for dashboard: streak, workouts this week, total volume, recent PRs
 * Query params: athleteId (optional, defaults to current user)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId") || user.id;

      // Check if user can access this athlete's data
      if (
        athleteId !== user.id &&
        user.role !== "coach" &&
        user.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "Unauthorized to view this athlete data" },
          { status: 403 }
        );
      }

      const supabase = createClient();

      // Calculate date ranges
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);

      // Fetch all completed workouts for calculations
      const { data: sessions, error: sessionsError } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          completed_at,
          session_exercises!inner(
            id,
            set_records(
              actual_weight,
              actual_reps
            )
          )
        `
        )
        .eq("user_id", athleteId)
        .not("completed_at", "is", null)
        .gte("completed_at", last30Days.toISOString())
        .order("completed_at", { ascending: false });

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
        return NextResponse.json(
          { error: "Failed to fetch quick stats" },
          { status: 500 }
        );
      }

      // Calculate streak (consecutive days with workouts)
      let currentStreak = 0;
      const workoutDates = new Set<string>();
      sessions?.forEach((session) => {
        const date = new Date(session.completed_at).toISOString().split("T")[0];
        workoutDates.add(date);
      });

      // Check backwards from today
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];
        if (workoutDates.has(dateStr)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate workouts this week
      const workoutsThisWeek =
        sessions?.filter((session) => {
          const sessionDate = new Date(session.completed_at);
          return sessionDate >= startOfWeek;
        }).length || 0;

      // Calculate total volume this week
      let totalVolumeThisWeek = 0;
      sessions?.forEach((session) => {
        const sessionDate = new Date(session.completed_at);
        if (sessionDate >= startOfWeek) {
          session.session_exercises?.forEach((exercise) => {
            exercise.set_records?.forEach((set) => {
              if (set.actual_weight && set.actual_reps) {
                totalVolumeThisWeek += set.actual_weight * set.actual_reps;
              }
            });
          });
        }
      });

      // Count recent PRs (last 30 days) - placeholder until PR tracking implemented
      const recentPRs = 0;

      // Calculate trends (compare to previous week)
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7);

      const workoutsLastWeek =
        sessions?.filter((session) => {
          const sessionDate = new Date(session.completed_at);
          return sessionDate >= startOfLastWeek && sessionDate < startOfWeek;
        }).length || 0;

      let totalVolumeLastWeek = 0;
      sessions?.forEach((session) => {
        const sessionDate = new Date(session.completed_at);
        if (sessionDate >= startOfLastWeek && sessionDate < startOfWeek) {
          session.session_exercises?.forEach((exercise) => {
            exercise.set_records?.forEach((set) => {
              if (set.actual_weight && set.actual_reps) {
                totalVolumeLastWeek += set.actual_weight * set.actual_reps;
              }
            });
          });
        }
      });

      return NextResponse.json({
        stats: {
          currentStreak,
          workoutsThisWeek,
          totalVolumeThisWeek,
          recentPRs,
        },
        trends: {
          workoutsChange: workoutsThisWeek - workoutsLastWeek,
          volumeChange: totalVolumeThisWeek - totalVolumeLastWeek,
          volumeChangePercent:
            totalVolumeLastWeek > 0
              ? Math.round(
                  ((totalVolumeThisWeek - totalVolumeLastWeek) /
                    totalVolumeLastWeek) *
                    100
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Error in quick stats endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
