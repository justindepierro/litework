import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/workouts/history
 * Fetch workout history for the authenticated user
 *
 * Query params:
 * - limit: number of workouts to return (default 50)
 * - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
      // Fetch workout sessions for the user with related data
      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from("workout_sessions")
        .select(
          `
          id,
          workout_plan_name,
          date,
          mode,
          started,
          completed,
          progress_percentage,
          started_at,
          completed_at,
          created_at,
          session_exercises (
            id,
            exercise_name,
            target_sets,
            completed_sets,
            started,
            completed,
            set_records (
              id,
              set_number,
              target_reps,
              actual_reps,
              target_weight,
              actual_weight,
              completed,
              completed_at
            )
          )
        `
        )
        .eq("user_id", user.userId)
        .order("date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (sessionsError) {
        console.error("Error fetching workout history:", sessionsError);
        return NextResponse.json(
          { error: "Failed to fetch workout history" },
          { status: 500 }
        );
      }

      // Calculate statistics for each session
      const enrichedSessions = sessions?.map((session) => {
        const totalExercises = session.session_exercises?.length || 0;
        const completedExercises =
          session.session_exercises?.filter((ex) => ex.completed).length || 0;
        const totalSets =
          session.session_exercises?.reduce(
            (sum, ex) => sum + ex.target_sets,
            0
          ) || 0;
        const completedSets =
          session.session_exercises?.reduce(
            (sum, ex) => sum + ex.completed_sets,
            0
          ) || 0;
        const totalVolume =
          session.session_exercises?.reduce((sum, ex) => {
            return (
              sum +
              (ex.set_records?.reduce(
                (setSum, set) => setSum + set.actual_weight * set.actual_reps,
                0
              ) || 0)
            );
          }, 0) || 0;

        return {
          ...session,
          stats: {
            totalExercises,
            completedExercises,
            totalSets,
            completedSets,
            totalVolume: Math.round(totalVolume),
            duration:
              session.started_at && session.completed_at
                ? Math.round(
                    (new Date(session.completed_at).getTime() -
                      new Date(session.started_at).getTime()) /
                      60000
                  ) // duration in minutes
                : null,
          },
        };
      });

      return NextResponse.json({
        sessions: enrichedSessions || [],
        pagination: {
          limit,
          offset,
          hasMore: (sessions?.length || 0) === limit,
        },
      });
    } catch (error) {
      console.error("Unexpected error in workout history:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  });
}
