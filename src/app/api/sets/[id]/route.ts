import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * PATCH /api/sets/[id]
 *
 * Update a specific set record (weight, reps, RPE).
 * Used for inline editing of completed sets.
 *
 * Body:
 * - weight?: number
 * - reps?: number
 * - rpe?: number
 *
 * Security:
 * - User must own the session containing this set
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: setId } = await params;
    const body = await request.json();
    const supabase = createClient();

    try {
      // Validate input
      const { weight, reps, rpe } = body;
      if (weight === undefined && reps === undefined && rpe === undefined) {
        return NextResponse.json(
          { success: false, error: "No fields to update" },
          { status: 400 }
        );
      }

      // Get the set to verify ownership
      const { data: setRecord, error: fetchError } = await supabase
        .from("set_records")
        .select(
          `
          id,
          session_exercises!inner (
            workout_session_id,
            workout_sessions!inner (
              user_id
            )
          )
        `
        )
        .eq("id", setId)
        .single();

      if (fetchError || !setRecord) {
        return NextResponse.json(
          { success: false, error: "Set not found" },
          { status: 404 }
        );
      }

      // Security check: User must own the session
      const sessionExercise = setRecord.session_exercises as unknown as {
        workout_sessions: { user_id: string };
      };
      const session = sessionExercise.workout_sessions;

      if (session.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to update this set" },
          { status: 403 }
        );
      }

      // Build update object
      const updates: Record<string, number> = {};
      if (weight !== undefined) updates.actual_weight = weight;
      if (reps !== undefined) updates.actual_reps = reps;
      // Note: RPE not in schema yet, will be added in future migration

      // Update the set
      const { error: updateError } = await supabase
        .from("set_records")
        .update(updates)
        .eq("id", setId);

      if (updateError) {
        console.error("Error updating set:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to update set" },
          { status: 500 }
        );
      }

      console.log(`[UpdateSet] Updated set ${setId}:`, updates);

      return NextResponse.json({
        success: true,
        message: "Set updated successfully",
      });
    } catch (error) {
      console.error("Error updating set:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/sets/[id]
 *
 * Delete a specific set record from a workout session.
 * Used when user wants to remove a set they've completed.
 *
 * Security:
 * - User must own the session containing this set
 * - Updates session_exercises completed count
 *
 * Returns:
 * - Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: setId } = await params;
    const supabase = createClient();

    try {
      // First, get the set to find its session
      const { data: setRecord, error: fetchError } = await supabase
        .from("set_records")
        .select(
          `
          id,
          session_exercise_id,
          session_exercises!inner (
            workout_session_id,
            workout_sessions!inner (
              user_id
            )
          )
        `
        )
        .eq("id", setId)
        .single();

      if (fetchError || !setRecord) {
        return NextResponse.json(
          { success: false, error: "Set not found" },
          { status: 404 }
        );
      }

      // Security check: User must own the session
      const sessionExercise = setRecord.session_exercises as unknown as {
        workout_sessions: { user_id: string };
      };
      const session = sessionExercise.workout_sessions;

      if (session.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to delete this set" },
          { status: 403 }
        );
      }

      // Delete the set
      const { error: deleteError } = await supabase
        .from("set_records")
        .delete()
        .eq("id", setId);

      if (deleteError) {
        console.error("Error deleting set:", deleteError);
        return NextResponse.json(
          { success: false, error: "Failed to delete set" },
          { status: 500 }
        );
      }

      // Update session_exercises completed count
      const { data: remainingSets } = await supabase
        .from("set_records")
        .select("id")
        .eq("session_exercise_id", setRecord.session_exercise_id);

      await supabase
        .from("session_exercises")
        .update({ completed_sets: remainingSets?.length || 0 })
        .eq("id", setRecord.session_exercise_id);

      console.log(
        `[DeleteSet] Deleted set ${setId}, ${remainingSets?.length || 0} sets remaining`
      );

      return NextResponse.json({
        success: true,
        message: "Set deleted successfully",
        remainingSets: remainingSets?.length || 0,
      });
    } catch (error) {
      console.error("Error deleting set:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
