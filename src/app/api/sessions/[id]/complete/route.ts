import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * POST /api/sessions/[id]/complete
 *
 * Mark a workout session as completed.
 *
 * Body:
 * - duration?: number (override calculated duration in minutes)
 * - notes?: string (final session notes)
 *
 * Actions:
 * - Updates session status to "completed"
 * - Sets end_time to current time
 * - Calculates duration if not provided
 * - Updates related assignment status to "completed"
 * - Records completion metrics
 *
 * Returns:
 * - Updated session data
 * - Completion summary (total sets, exercises completed, duration)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: sessionId } = await params;
    const body = await request.json();
    const supabase = createClient();

    try {
      // Fetch existing session
      const { data: session, error: fetchError } = await supabase
        .from("workout_sessions")
        .select(
          `
          *,
          workout_assignments (
            id,
            status
          )
        `
        )
        .eq("id", sessionId)
        .single();

      if (fetchError || !session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }

      // Security check: User must own the session
      if (session.athlete_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to complete this session" },
          { status: 403 }
        );
      }

      // Validate session state
      if (session.status === "completed") {
        return NextResponse.json(
          { success: false, error: "Session is already completed" },
          { status: 400 }
        );
      }

      if (session.status === "abandoned") {
        return NextResponse.json(
          { success: false, error: "Cannot complete an abandoned session" },
          { status: 400 }
        );
      }

      const endTime = new Date();
      const startTime = new Date(session.start_time);

      // Calculate duration in minutes
      const calculatedDuration = Math.round(
        (endTime.getTime() - startTime.getTime()) / 1000 / 60
      );
      const duration = body.duration || calculatedDuration;

      // Fetch completion metrics
      const { data: sessionExercises, error: exercisesError } = await supabase
        .from("session_exercises")
        .select("id, target_sets")
        .eq("session_id", sessionId);

      if (exercisesError) {
        console.error("Error fetching session exercises:", exercisesError);
      }

      const { data: completedSets, error: setsError } = await supabase
        .from("set_records")
        .select("id")
        .eq("session_id", sessionId);

      if (setsError) {
        console.error("Error fetching completed sets:", setsError);
      }

      const totalExercises = sessionExercises?.length || 0;
      const totalTargetSets =
        sessionExercises?.reduce((sum, ex) => sum + (ex.target_sets || 0), 0) ||
        0;
      const totalCompletedSets = completedSets?.length || 0;

      // Update session to completed
      const { data: updatedSession, error: updateError } = await supabase
        .from("workout_sessions")
        .update({
          status: "completed",
          end_time: endTime.toISOString(),
          duration,
          notes: body.notes || session.notes,
          updated_at: endTime.toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (updateError) {
        console.error("Error completing session:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to complete session" },
          { status: 500 }
        );
      }

      // Update related assignment to completed (if exists)
      if (session.assignment_id) {
        const { error: assignmentError } = await supabase
          .from("workout_assignments")
          .update({
            status: "completed",
            completed_at: endTime.toISOString(),
            updated_at: endTime.toISOString(),
          })
          .eq("id", session.assignment_id);

        if (assignmentError) {
          console.error("Error updating assignment:", assignmentError);
          // Don't fail the request if assignment update fails
        }
      }

      // Calculate completion percentage
      const completionPercentage =
        totalTargetSets > 0
          ? Math.round((totalCompletedSets / totalTargetSets) * 100)
          : 0;

      return NextResponse.json({
        success: true,
        data: {
          session: updatedSession,
          summary: {
            duration,
            totalExercises,
            totalTargetSets,
            totalCompletedSets,
            completionPercentage,
            startTime: session.start_time,
            endTime: endTime.toISOString(),
          },
        },
        message: "Workout completed successfully!",
      });
    } catch (error) {
      console.error("Error completing session:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
