import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can reschedule
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignmentId, newDate, moveGroup } = body;

    if (!assignmentId || !newDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[RESCHEDULE] Request received:", {
      assignmentId,
      newDate,
      moveGroup,
    });

    const supabase = await createClient();

    // Get the assignment to check if it's a group assignment
    const { data: assignment, error: fetchError } = await supabase
      .from("workout_assignments")
      .select("*, athlete_groups(name), workout_plans(name)")
      .eq("id", assignmentId)
      .single();

    if (fetchError || !assignment) {
      console.error("[RESCHEDULE] Assignment not found:", fetchError);
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    console.log("[RESCHEDULE] Found assignment:", {
      id: assignment.id,
      athleteGroupId: assignment.athlete_group_id,
      workoutPlanId: assignment.workout_plan_id,
      currentDate: assignment.scheduled_date,
    });

    // Format the new date properly (keep time if it exists, otherwise use noon)
    const targetDate = new Date(newDate);

    // Preserve the original time if it exists
    if (assignment.start_time) {
      const [hours, minutes] = assignment.start_time.split(":");
      targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      targetDate.setHours(12, 0, 0, 0);
    }

    console.log("[RESCHEDULE] Target date calculated:", targetDate.toISOString());

    // If it's a group assignment and moveGroup is true, update all assignments in the group
    if (assignment.athlete_group_id && moveGroup) {
      console.log("[RESCHEDULE] Processing group assignment move");
      // Get all assignments for the same workout plan, group, and date
      const { data: groupAssignments, error: groupFetchError } = await supabase
        .from("workout_assignments")
        .select("id, athlete_id")
        .eq("athlete_group_id", assignment.athlete_group_id)
        .eq("workout_plan_id", assignment.workout_plan_id)
        .eq("scheduled_date", assignment.scheduled_date);

      if (groupFetchError) {
        console.error("Error fetching group assignments:", groupFetchError);
        return NextResponse.json(
          { success: false, error: "Failed to fetch group assignments" },
          { status: 500 }
        );
      }

      // Update all assignments in the group
      const assignmentIds = groupAssignments?.map((a) => a.id) || [];

      if (assignmentIds.length > 0) {
        // Format date as YYYY-MM-DD for DATE column
        const dateOnly = targetDate.toISOString().split('T')[0];
        
        console.log(`[RESCHEDULE] About to update ${assignmentIds.length} assignments`, {
          assignmentIds,
          dateOnly,
          oldDate: assignment.scheduled_date,
        });
        
        const { error: updateError } = await supabase
          .from("workout_assignments")
          .update({
            scheduled_date: dateOnly,
            updated_at: new Date().toISOString(),
          })
          .in("id", assignmentIds);

        if (updateError) {
          console.error("[RESCHEDULE] Error updating group assignments:", updateError);
          return NextResponse.json(
            { success: false, error: "Failed to update group assignments" },
            { status: 500 }
          );
        }

        console.log(`[RESCHEDULE] Successfully updated ${assignmentIds.length} group assignments from ${assignment.scheduled_date} to ${dateOnly}`);

        // Create notifications for all affected athletes
        const notifications = groupAssignments
          .filter((ga) => ga.athlete_id) // Only notify athletes with IDs
          .map((ga) => ({
            user_id: ga.athlete_id,
            type: "workout_rescheduled",
            title: "Workout Rescheduled",
            message: `Your ${assignment.workout_plans?.name || "workout"} has been moved to ${targetDate.toLocaleDateString()}`,
            related_id: ga.id,
            created_at: new Date().toISOString(),
          }));

        // Insert notifications (ignore errors as they're not critical)
        await supabase.from("notifications").insert(notifications);

        return NextResponse.json({
          success: true,
          message: `Updated ${assignmentIds.length} group assignments`,
          data: { assignmentIds, newDate: dateOnly },
        });
      }
    }

    // Individual assignment update
    console.log("[RESCHEDULE] Processing individual assignment move");
    
    // Format date as YYYY-MM-DD for DATE column
    const dateOnly = targetDate.toISOString().split('T')[0];
    
    const { error: updateError } = await supabase
      .from("workout_assignments")
      .update({
        scheduled_date: dateOnly,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    if (updateError) {
      console.error("Error updating assignment:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update assignment" },
        { status: 500 }
      );
    }

    console.log(`[RESCHEDULE] Successfully updated individual assignment to ${dateOnly}`);

    // Create notification for the athlete (if assignment has an athlete_id)
    if (assignment.athlete_id) {
      await supabase.from("notifications").insert({
        user_id: assignment.athlete_id,
        type: "workout_rescheduled",
        title: "Workout Rescheduled",
        message: `Your ${assignment.workout_plans?.name || "workout"} has been moved to ${targetDate.toLocaleDateString()}`,
        related_id: assignmentId,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      data: { assignmentId, newDate: dateOnly },
    });
  } catch (error) {
    console.error("Error in reschedule endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
