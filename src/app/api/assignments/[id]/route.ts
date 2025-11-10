import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

// GET /api/assignments/[id] - Get single assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // [REMOVED] console.log(`[API] Fetching assignment ${id} for user ${user.id}`);

    // Fetch assignment with related data
    const { data: assignment, error } = await supabaseAdmin
      .from("workout_assignments")
      .select(
        `
        *,
        workout_plan:workout_plans!workout_assignments_workout_plan_id_fkey(
          id,
          name,
          description,
          estimated_duration,
          exercises:workout_exercises(
            id,
            exercise_id,
            exercise_name,
            sets,
            reps,
            weight,
            weight_type,
            weight_max,
            percentage,
            percentage_max,
            percentage_base_kpi,
            tempo,
            each_side,
            rest_time,
            notes,
            order_index,
            group_id
          ),
          groups:workout_exercise_groups(
            id,
            name,
            type,
            description,
            order_index,
            rest_between_rounds,
            rest_between_exercises,
            rounds,
            notes
          )
        ),
        assigned_by_user:users!workout_assignments_assigned_by_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        assigned_group:athlete_groups!workout_assignments_assigned_to_group_id_fkey(
          id,
          name,
          description
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !assignment) {
      console.error("Assignment fetch error:", {
        id,
        error,
        hasAssignment: !!assignment,
      });
      return NextResponse.json(
        { error: "Assignment not found", details: error?.message },
        { status: 404 }
      );
    }

    // Check permissions: Athletes can only view their own assignments or group assignments they're in
    if (!isCoach(user)) {
      let hasAccess = assignment.assigned_to_user_id === user.id;

      // If it's a group assignment, check if user is in the group
      if (!hasAccess && assignment.assigned_to_group_id) {
        const { data: group } = await supabaseAdmin
          .from("athlete_groups")
          .select("athlete_ids")
          .eq("id", assignment.assigned_to_group_id)
          .single();

        if (group && group.athlete_ids) {
          hasAccess = group.athlete_ids.includes(user.id);
        }
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "You don't have permission to view this assignment" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: transformToCamel(assignment),
    });
  } catch (error) {
    console.error("Error in GET /api/assignments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/assignments/[id] - Update assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches can update assignments
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can update assignments" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updatesInput = await request.json();
    const updates = transformToSnake(updatesInput);

    // Validate allowed fields
    const allowedFields = [
      "scheduled_date",
      "start_time",
      "end_time",
      "location",
      "notes",
      "completed",
      "reminder_sent",
      "notification_preferences",
    ];

    const updateData: Record<
      string,
      string | boolean | object | null | undefined
    > = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update assignment
    const { data: updatedAssignment, error } = await supabaseAdmin
      .from("workout_assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating assignment:", error);
      return NextResponse.json(
        { error: "Failed to update assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transformToCamel(updatedAssignment),
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Error in PUT /api/assignments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/assignments/[id] - Delete assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches can delete assignments
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can delete assignments" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Delete assignment
    const { error } = await supabaseAdmin
      .from("workout_assignments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting assignment:", error);
      return NextResponse.json(
        { error: "Failed to delete assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/assignments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/assignments/[id]/complete - Mark assignment as complete (for athletes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify user has access to this assignment
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from("workout_assignments")
      .select("assigned_to_user_id, assigned_to_group_id")
      .eq("id", id)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user is assigned (either individually or through group)
    const isDirectlyAssigned = assignment.assigned_to_user_id === user.id;
    let isInGroup = false;

    // Check group membership for group assignments
    if (assignment.assigned_to_group_id) {
      const { data: group } = await supabaseAdmin
        .from("athlete_groups")
        .select("athlete_ids")
        .eq("id", assignment.assigned_to_group_id)
        .single();

      if (group && group.athlete_ids) {
        isInGroup = group.athlete_ids.includes(user.id);
      }
    }

    if (!isDirectlyAssigned && !isInGroup && !isCoach(user)) {
      return NextResponse.json(
        { error: "You don't have permission to complete this assignment" },
        { status: 403 }
      );
    }

    // Mark as complete
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("workout_assignments")
      .update({ completed: true })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error completing assignment:", updateError);
      return NextResponse.json(
        { error: "Failed to complete assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Assignment marked as complete",
    });
  } catch (error) {
    console.error("Error in PATCH /api/assignments/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
