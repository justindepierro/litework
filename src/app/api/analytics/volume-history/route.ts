import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/analytics/volume-history
 * Fetch weekly training volume history
 * Query params: athleteId (optional, defaults to current user), weeks (optional, defaults to 12)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId") || user.id;
      const weeks = parseInt(searchParams.get("weeks") || "12", 10);

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
      startDate.setDate(endDate.getDate() - weeks * 7);

      // Fetch all completed workout sessions with set records
      const { data: sessions, error: sessionError } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          completed_at,
          session_exercises!inner(
            id,
            set_records(
              weight,
              reps
            )
          )
        `
        )
        .eq("athlete_id", athleteId)
        .eq("status", "completed")
        .gte("completed_at", startDate.toISOString())
        .lte("completed_at", endDate.toISOString())
        .order("completed_at", { ascending: true });

      if (sessionError) {
        console.error("Error fetching sessions:", sessionError);
        return NextResponse.json(
          { error: "Failed to fetch volume history" },
          { status: 500 }
        );
      }

      // Calculate volume by week
      const volumeByWeek = new Map<string, number>();

      sessions?.forEach((session) => {
        // Get the week start date (Sunday)
        const sessionDate = new Date(session.completed_at);
        const dayOfWeek = sessionDate.getDay();
        const weekStart = new Date(sessionDate);
        weekStart.setDate(sessionDate.getDate() - dayOfWeek);
        const weekKey = weekStart.toISOString().split("T")[0];

        // Calculate session volume
        let sessionVolume = 0;
        session.session_exercises?.forEach((exercise) => {
          exercise.set_records?.forEach((set) => {
            if (set.weight && set.reps) {
              sessionVolume += set.weight * set.reps;
            }
          });
        });

        // Add to week total
        const currentWeekVolume = volumeByWeek.get(weekKey) || 0;
        volumeByWeek.set(weekKey, currentWeekVolume + sessionVolume);
      });

      // Generate all weeks in range (including weeks with 0 volume)
      const allWeeks: { week: string; volume: number; displayWeek: string }[] =
        [];
      const currentWeekStart = new Date(startDate);
      currentWeekStart.setDate(startDate.getDate() - startDate.getDay());

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() + i * 7);
        const weekKey = weekStart.toISOString().split("T")[0];
        const volume = volumeByWeek.get(weekKey) || 0;

        // Format display label
        const displayWeek = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

        allWeeks.push({
          week: weekKey,
          volume,
          displayWeek,
        });
      }

      return NextResponse.json({
        data: allWeeks,
        totalVolume: Array.from(volumeByWeek.values()).reduce(
          (sum, v) => sum + v,
          0
        ),
        weekCount: allWeeks.length,
      });
    } catch (error) {
      console.error("Error in volume history endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
