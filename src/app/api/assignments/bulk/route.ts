import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface BulkAssignmentRequest {
  workout_plan_id: string;
  athlete_ids?: string[];
  group_ids?: string[];
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
  notification_preferences?: object;
}

// POST /api/assignments/bulk - Create multiple assignments efficiently
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can bulk assign workouts
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can assign workouts" },
        { status: 403 }
      );
    }

    const body: BulkAssignmentRequest = await request.json();
    const {
      workout_plan_id,
      athlete_ids,
      group_ids,
      scheduled_date,
      start_time,
      end_time,
      location,
      notes,
      notification_preferences,
    } = body;

    // Validate required fields
    if (!workout_plan_id) {
      return NextResponse.json(
        { error: "workout_plan_id is required" },
        { status: 400 }
      );
    }

    if (!scheduled_date) {
      return NextResponse.json(
        { error: "scheduled_date is required" },
        { status: 400 }
      );
    }

    if (
      (!athlete_ids || athlete_ids.length === 0) &&
      (!group_ids || group_ids.length === 0)
    ) {
      return NextResponse.json(
        { error: "Either athlete_ids or group_ids must be provided" },
        { status: 400 }
      );
    }

    const assignmentsToInsert: Array<
      Record<string, string | boolean | object | null>
    > = [];

    // Create individual athlete assignments
    if (athlete_ids && athlete_ids.length > 0) {
      athlete_ids.forEach((athleteId) => {
        assignmentsToInsert.push({
          workout_plan_id,
          assigned_by: user.id,
          assigned_to_user_id: athleteId,
          assigned_to_group_id: null,
          scheduled_date,
          start_time: start_time || null,
          end_time: end_time || null,
          location: location || null,
          notes: notes || null,
          completed: false,
          reminder_sent: false,
          notification_preferences: notification_preferences || {},
        });
      });
    }

    // Create group assignments
    if (group_ids && group_ids.length > 0) {
      group_ids.forEach((groupId) => {
        assignmentsToInsert.push({
          workout_plan_id,
          assigned_by: user.id,
          assigned_to_user_id: null,
          assigned_to_group_id: groupId,
          scheduled_date,
          start_time: start_time || null,
          end_time: end_time || null,
          location: location || null,
          notes: notes || null,
          completed: false,
          reminder_sent: false,
          notification_preferences: notification_preferences || {},
        });
      });
    }

    // Insert all assignments at once
    const { data: insertedAssignments, error } = await supabaseAdmin
      .from("workout_assignments")
      .insert(assignmentsToInsert).select(`
        *,
        workout_plan:workout_plans!workout_assignments_workout_plan_id_fkey(
          id,
          name,
          description,
          estimated_duration
        )
      `);

    if (error) {
      console.error("Error bulk creating assignments:", error);
      return NextResponse.json(
        { error: "Failed to create assignments", details: error.message },
        { status: 500 }
      );
    }

    // Count assignments by type
    const individualCount =
      insertedAssignments?.filter((a) => a.assigned_to_user_id).length || 0;
    const groupCount =
      insertedAssignments?.filter((a) => a.assigned_to_group_id).length || 0;

    return NextResponse.json(
      {
        success: true,
        data: { assignments: insertedAssignments },
        message: `Successfully created ${individualCount} individual assignment(s) and ${groupCount} group assignment(s)`,
        stats: {
          total: insertedAssignments?.length || 0,
          individual: individualCount,
          group: groupCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/assignments/bulk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/assignments/bulk - Delete multiple assignments
export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can delete assignments
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can delete assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignment_ids } = body;

    if (
      !assignment_ids ||
      !Array.isArray(assignment_ids) ||
      assignment_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "assignment_ids array is required" },
        { status: 400 }
      );
    }

    // Delete assignments
    const { error } = await supabaseAdmin
      .from("workout_assignments")
      .delete()
      .in("id", assignment_ids);

    if (error) {
      console.error("Error bulk deleting assignments:", error);
      return NextResponse.json(
        { error: "Failed to delete assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${assignment_ids.length} assignment(s)`,
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/assignments/bulk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
