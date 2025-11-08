import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { transformToCamel } from "@/lib/case-transform";

interface BulkAssignmentRequest {
  workoutPlanId: string;
  athleteIds?: string[];
  groupIds?: string[];
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  notificationPreferences?: object;
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

    const bodyInput = await request.json();
    const body: BulkAssignmentRequest = transformToCamel(bodyInput);
    const {
      workoutPlanId,
      athleteIds,
      groupIds,
      scheduledDate,
      startTime,
      endTime,
      location,
      notes,
      notificationPreferences,
    } = body;

    // Validate required fields
    if (!workoutPlanId) {
      return NextResponse.json(
        { error: "workoutPlanId is required" },
        { status: 400 }
      );
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { error: "scheduledDate is required" },
        { status: 400 }
      );
    }

    if (
      (!athleteIds || athleteIds.length === 0) &&
      (!groupIds || groupIds.length === 0)
    ) {
      return NextResponse.json(
        { error: "Either athleteIds or groupIds must be provided" },
        { status: 400 }
      );
    }

    const assignmentsToInsert: Array<
      Record<string, string | boolean | object | null>
    > = [];

    // Create individual athlete assignments
    if (athleteIds && athleteIds.length > 0) {
      athleteIds.forEach((athleteId: string) => {
        assignmentsToInsert.push({
          workout_plan_id: workoutPlanId,
          assigned_by: user.id,
          assigned_to_user_id: athleteId,
          assigned_to_group_id: null,
          scheduled_date: scheduledDate,
          start_time: startTime || null,
          end_time: endTime || null,
          location: location || null,
          notes: notes || null,
          completed: false,
          reminder_sent: false,
          notification_preferences: notificationPreferences || {},
        });
      });
    }

    // Create group assignments
    if (groupIds && groupIds.length > 0) {
      groupIds.forEach((groupId: string) => {
        assignmentsToInsert.push({
          workout_plan_id: workoutPlanId,
          assigned_by: user.id,
          assigned_to_user_id: null,
          assigned_to_group_id: groupId,
          scheduled_date: scheduledDate,
          start_time: startTime || null,
          end_time: endTime || null,
          location: location || null,
          notes: notes || null,
          completed: false,
          reminder_sent: false,
          notification_preferences: notificationPreferences || {},
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
        data: { assignments: transformToCamel(insertedAssignments) },
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

    const bodyInput = await request.json();
    const body = transformToCamel(bodyInput);
    const { assignmentIds } = body;

    if (
      !assignmentIds ||
      !Array.isArray(assignmentIds) ||
      assignmentIds.length === 0
    ) {
      return NextResponse.json(
        { error: "assignmentIds array is required" },
        { status: 400 }
      );
    }

    // Delete assignments
    const { error } = await supabaseAdmin
      .from("workout_assignments")
      .delete()
      .in("id", assignmentIds);

    if (error) {
      console.error("Error bulk deleting assignments:", error);
      return NextResponse.json(
        { error: "Failed to delete assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${assignmentIds.length} assignment(s)`,
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/assignments/bulk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
