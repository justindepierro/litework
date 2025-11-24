import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AuthUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId") || user.id;
      const limit = parseInt(searchParams.get("limit") || "10");

      // Verify permission - users can only see their own sessions, coaches can see anyone's
      if (
        athleteId !== user.id &&
        user.role !== "coach" &&
        user.role !== "admin"
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const { data: sessions, error } = await supabaseAdmin
        .from("workout_sessions")
        .select(
          `
          id,
          workout_plan_id,
          workout_plan_name,
          user_id,
          completed_at,
          started_at,
          workout_plans!inner (
            id,
            name,
            description
          ),
          session_exercises (
            id,
            exercise_name,
            target_sets,
            completed_sets,
            set_records (
              id,
              actual_weight,
              actual_reps,
              target_weight,
              target_reps
            )
          )
        `
        )
        .eq("user_id", athleteId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[workout-sessions] Database error:", error);
        return NextResponse.json(
          { error: "Failed to fetch workout sessions" },
          { status: 500 }
        );
      }

      // Transform the data to match the expected format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedSessions = sessions.map((session: any) => {
        const workoutPlan = Array.isArray(session.workout_plans)
          ? session.workout_plans[0]
          : session.workout_plans;

        // Calculate duration from started_at and completed_at
        let duration = 0;
        if (session.started_at && session.completed_at) {
          const start = new Date(session.started_at);
          const end = new Date(session.completed_at);
          duration = Math.round((end.getTime() - start.getTime()) / 60000); // minutes
        }

        return {
          id: session.id,
          workout_plan_id: session.workout_plan_id,
          completed_at: session.completed_at,
          duration,
          workout_plan: {
            id: workoutPlan?.id,
            name:
              workoutPlan?.name ||
              session.workout_plan_name ||
              "Unknown Workout",
            description: workoutPlan?.description,
          },
          session_exercises: session.session_exercises || [],
        };
      });

      return NextResponse.json({
        success: true,
        sessions: transformedSessions,
      });
    } catch (error) {
      console.error("[workout-sessions] Unexpected error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
