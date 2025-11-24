import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/analytics/workout-frequency
 * Fetch daily workout frequency for calendar heatmap
 * Query params: athleteId (optional, defaults to current user), days (optional, defaults to 84)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId") || user.id;
      const days = parseInt(searchParams.get("days") || "84", 10); // Default 12 weeks

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

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);

      // Fetch all completed workout sessions
      const { data: sessions, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("completed_at")
        .eq("athlete_id", athleteId)
        .eq("status", "completed")
        .gte("completed_at", startDate.toISOString())
        .lte("completed_at", endDate.toISOString())
        .order("completed_at", { ascending: true });

      if (sessionError) {
        console.error("Error fetching sessions:", sessionError);
        return NextResponse.json(
          { error: "Failed to fetch workout frequency" },
          { status: 500 }
        );
      }

      // Count workouts by date
      const workoutsByDate = new Map<string, number>();

      sessions?.forEach((session) => {
        const date = new Date(session.completed_at).toISOString().split("T")[0];
        const count = workoutsByDate.get(date) || 0;
        workoutsByDate.set(date, count + 1);
      });

      // Convert to array format
      const data = Array.from(workoutsByDate.entries()).map(
        ([date, count]) => ({
          date,
          count,
        })
      );

      // Calculate stats
      const totalWorkouts = sessions?.length || 0;
      const activeDays = workoutsByDate.size;
      const maxWorkoutsPerDay = Math.max(
        ...Array.from(workoutsByDate.values()),
        0
      );

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];
        if (workoutsByDate.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }

      return NextResponse.json({
        data,
        stats: {
          totalWorkouts,
          activeDays,
          maxWorkoutsPerDay,
          currentStreak: streak,
        },
      });
    } catch (error) {
      console.error("Error in workout frequency endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
