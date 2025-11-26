/**
 * Today's Schedule API
 * GET /api/analytics/today-schedule
 *
 * Returns scheduled workouts for today with completion status
 * For coaches/admins only
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth, isCoach } from "@/lib/auth-server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { transformToCamel } from "@/lib/case-transform";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    if (!isCoach(user)) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Coach access required" },
        { status: 403 }
      );
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch all assignments scheduled for today
      const { data: assignments, error: assignmentError } = await supabase
        .from("workout_assignments")
        .select("*")
        .gte("scheduled_date", today.toISOString())
        .lt("scheduled_date", tomorrow.toISOString())
        .order("scheduled_date", { ascending: true });

      if (assignmentError) {
        console.error("Assignment error:", assignmentError);
        throw assignmentError;
      }

      if (!assignments || assignments.length === 0) {
        return NextResponse.json({
          success: true,
          workouts: [],
        });
      }

      // For each assignment, get workout name and group name
      const workoutsWithStats = await Promise.all(
        assignments.map(async (assignment) => {
          // Get workout plan name
          let workoutName = assignment.workout_plan_name || "Unknown Workout";
          if (!workoutName && assignment.workout_plan_id) {
            const { data: workout } = await supabase
              .from("workout_plans")
              .select("name")
              .eq("id", assignment.workout_plan_id)
              .single();
            workoutName = workout?.name || "Unknown Workout";
          }

          // Get group name or athlete name for individual assignments
          let groupName = "Individual Assignment";
          let groupId: string | null = null;
          let groupColor: string | null = null;
          let athleteNames: string[] = [];

          if (assignment.assigned_to_group_id) {
            const { data: group } = await supabase
              .from("athlete_groups")
              .select("name, color")
              .eq("id", assignment.assigned_to_group_id)
              .single();
            groupName = group?.name || "Unknown Group";
            groupId = assignment.assigned_to_group_id;
            groupColor = group?.color || "#3b82f6";
          } else if (
            assignment.athlete_ids &&
            assignment.athlete_ids.length > 0
          ) {
            // Individual assignment - fetch athlete names
            const { data: athletes } = await supabase
              .from("users")
              .select("first_name, last_name")
              .in("id", assignment.athlete_ids);

            if (athletes && athletes.length > 0) {
              athleteNames = athletes.map(
                (a) => `${a.first_name} ${a.last_name}`
              );
              // Keep groupName as "Individual Assignment" to show badges
              groupName = "Individual Assignment";
            }
          }

          // Get athlete count from athlete_ids array
          const athleteCount = assignment.athlete_ids?.length || 1;

          // Get completed sessions for this assignment
          const { data: sessions } = await supabase
            .from("workout_sessions")
            .select("id")
            .eq("workout_assignment_id", assignment.id)
            .not("completed_at", "is", null);

          const completedCount = sessions?.length || 0;

          // Parse time from assignment fields or scheduled_date
          const startTime = assignment.start_time || "09:00";
          const endTime = assignment.end_time || "10:00";

          return {
            id: assignment.id,
            workoutName,
            groupName,
            groupId,
            groupColor,
            athleteNames,
            isIndividual: !assignment.assigned_to_group_id,
            athleteCount,
            completedCount,
            startTime,
            endTime,
          };
        })
      );

      console.log("[Today Schedule] Sample workout:", workoutsWithStats[0]);

      return NextResponse.json({
        success: true,
        workouts: transformToCamel(workoutsWithStats),
      });
    } catch (error) {
      console.error("Today schedule error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch today's schedule",
          workouts: [],
        },
        { status: 500 }
      );
    }
  });
}
