import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/analytics/1rm-history
 * Fetch 1RM progression history for a specific exercise
 * Query params: exerciseId (required), athleteId (optional, defaults to current user)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const exerciseId = searchParams.get("exerciseId");
      const athleteId = searchParams.get("athleteId") || user.id;

      if (!exerciseId) {
        return NextResponse.json(
          { error: "exerciseId is required" },
          { status: 400 }
        );
      }

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

      // Fetch 1RM history from athlete_kpis
      const { data: kpiHistory, error: kpiError } = await supabase
        .from("athlete_kpis")
        .select("one_rep_max, updated_at")
        .eq("athlete_id", athleteId)
        .eq("exercise_id", exerciseId)
        .order("updated_at", { ascending: true });

      if (kpiError) {
        console.error("Error fetching 1RM history:", kpiError);
        return NextResponse.json(
          { error: "Failed to fetch 1RM history" },
          { status: 500 }
        );
      }

      // Also fetch calculated 1RMs from set_records (for more granular data)
      const { data: setRecords, error: setError } = await supabase
        .from("set_records")
        .select(
          `
          weight,
          reps,
          session_exercises!inner(
            workout_sessions!inner(
              completed_at
            )
          )
        `
        )
        .eq("session_exercises.exercise_id", exerciseId)
        .eq("session_exercises.athlete_id", athleteId)
        .gte("reps", 1)
        .lte("reps", 10)
        .order("session_exercises.workout_sessions.completed_at", {
          ascending: true,
        });

      if (setError) {
        console.error("Error fetching set records:", setError);
        // Continue with just KPI data
      }

      // Calculate estimated 1RMs from set records using Epley formula
      const estimated1RMs: { date: string; weight: number }[] = [];
      if (setRecords && setRecords.length > 0) {
        setRecords.forEach((record) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sessionExercise = record.session_exercises as any;
          const workoutSession = sessionExercise?.workout_sessions;
          if (record.weight && record.reps && workoutSession?.completed_at) {
            const estimated1RM = record.weight * (1 + record.reps / 30);
            estimated1RMs.push({
              date: new Date(workoutSession.completed_at)
                .toISOString()
                .split("T")[0],
              weight: Math.round(estimated1RM),
            });
          }
        });
      }

      // Combine KPI history and estimated 1RMs
      const allDataPoints: { date: string; weight: number }[] = [
        ...(kpiHistory || []).map((kpi) => ({
          date: new Date(kpi.updated_at).toISOString().split("T")[0],
          weight: kpi.one_rep_max,
        })),
        ...estimated1RMs,
      ];

      // Group by date and take the max for each day
      const dataByDate = new Map<string, number>();
      allDataPoints.forEach(({ date, weight }) => {
        const existing = dataByDate.get(date);
        if (!existing || weight > existing) {
          dataByDate.set(date, weight);
        }
      });

      // Convert to array and sort by date
      const chartData = Array.from(dataByDate.entries())
        .map(([date, weight]) => ({ date, weight }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Fetch exercise name
      const { data: exercise } = await supabase
        .from("exercises")
        .select("name")
        .eq("id", exerciseId)
        .single();

      return NextResponse.json({
        exerciseName: exercise?.name || "Unknown Exercise",
        data: chartData,
      });
    } catch (error) {
      console.error("Error in 1RM history endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
