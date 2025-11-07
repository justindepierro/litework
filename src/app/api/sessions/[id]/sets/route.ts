import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * POST /api/sessions/[id]/sets
 * Record a set completion during a workout session
 *
 * Body: {
 *   session_exercise_id: string,
 *   set_number: number,
 *   weight: number | null,
 *   reps: number,
 *   rpe: number,
 *   completed_at: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      const { id: sessionId } = await params;
      const body = await request.json();

      const {
        session_exercise_id,
        set_number,
        weight,
        reps,
        rpe,
        completed_at,
      } = body;

      // Validate required fields
      if (!session_exercise_id || !set_number || reps === undefined) {
        return NextResponse.json(
          {
            error:
              "Missing required fields: session_exercise_id, set_number, reps",
          },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // 1. Verify session ownership
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, athlete_id, status")
        .eq("id", sessionId)
        .eq("athlete_id", user.id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: "Session not found or access denied" },
          { status: 404 }
        );
      }

      if (session.status === "completed" || session.status === "abandoned") {
        return NextResponse.json(
          { error: "Cannot add sets to a completed or abandoned session" },
          { status: 400 }
        );
      }

      // 2. Verify session exercise exists and belongs to this session
      const { data: sessionExercise, error: exerciseError } = await supabase
        .from("session_exercises")
        .select("id, session_id")
        .eq("id", session_exercise_id)
        .eq("session_id", sessionId)
        .single();

      if (exerciseError || !sessionExercise) {
        return NextResponse.json(
          {
            error:
              "Session exercise not found or doesn't belong to this session",
          },
          { status: 404 }
        );
      }

      // 3. Create the set record
      const { data: setRecord, error: setError } = await supabase
        .from("set_records")
        .insert({
          session_exercise_id,
          set_number,
          weight,
          reps,
          rpe,
          completed_at: completed_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (setError || !setRecord) {
        console.error("Set record creation error:", setError);
        return NextResponse.json(
          { error: "Failed to save set record" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        set: setRecord,
      });
    } catch (error) {
      console.error("Set creation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
