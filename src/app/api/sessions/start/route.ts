import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import { errorResponse, handleSupabaseError } from "@/lib/api-errors";

/**
 * POST /api/sessions/start
 * Create a new workout session from an assignment
 *
 * Body: { assignment_id: string }
 * Returns: { session_id: string, session: WorkoutSession }
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { assignment_id } = body;

      if (!assignment_id) {
        return errorResponse("VALIDATION_ERROR", "assignment_id is required");
      }

      const supabase = createClient();

      console.log("[SessionStart] Looking for assignment:", {
        assignment_id,
        user_id: user.id,
        user_email: user.email,
      });

      // 1. Get assignment details with workout and exercises
      const { data: assignment, error: assignmentError } = await supabase
        .from("workout_assignments")
        .select(
          `
          id,
          workout_plan_id,
          assigned_to_user_id,
          assigned_to_group_id,
          workout_plans (
            id,
            name,
            description
          )
        `
        )
        .eq("id", assignment_id)
        .single();

      console.log("[SessionStart] Assignment query result:", {
        found: !!assignment,
        error: assignmentError?.message,
        assigned_to_user_id: assignment?.assigned_to_user_id,
        assigned_to_group_id: assignment?.assigned_to_group_id,
        current_user_id: user.id,
      });

      if (assignmentError || !assignment) {
        console.error("[SessionStart] Assignment not found:", {
          assignmentError: assignmentError?.message,
        });
        return NextResponse.json(
          { error: "Assignment not found or access denied" },
          { status: 404 }
        );
      }

      // Check if this assignment belongs to the current user
      // For individual assignments: assigned_to_user_id must match
      // For group assignments: we need to check if user is in the group
      let isAssignedToUser = assignment.assigned_to_user_id === user.id;

      if (!isAssignedToUser && assignment.assigned_to_group_id) {
        // Check if user is in the assigned group
        const { data: groupMember } = await supabase
          .from("group_members")
          .select("id")
          .eq("group_id", assignment.assigned_to_group_id)
          .eq("user_id", user.id)
          .single();

        isAssignedToUser = !!groupMember;
        console.log("[SessionStart] Group assignment check:", {
          group_id: assignment.assigned_to_group_id,
          is_member: isAssignedToUser,
        });
      }

      if (!isAssignedToUser) {
        console.error("[SessionStart] Access denied:", {
          reason: "User not assigned to this workout",
          assigned_to_user_id: assignment.assigned_to_user_id,
          assigned_to_group_id: assignment.assigned_to_group_id,
          current_user_id: user.id,
        });
        return NextResponse.json(
          { error: "Assignment not found or access denied" },
          { status: 404 }
        );
      }

      console.log("[SessionStart] Auth passed, fetching workout exercises...");

      // 2. Get workout exercises with all details
      // Note: exercise data is denormalized in workout_exercises table
      const { data: workoutExercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select(
          `
          id,
          exercise_id,
          exercise_name,
          sets,
          reps,
          weight,
          weight_type,
          percentage,
          percentage_base_kpi,
          rest_time,
          tempo,
          notes,
          order_index,
          group_id,
          each_side
        `
        )
        .eq("workout_plan_id", assignment.workout_plan_id)
        .order("order_index", { ascending: true });

      console.log("[SessionStart] Exercises query result:", {
        count: workoutExercises?.length || 0,
        error: exercisesError?.message,
      });

      if (exercisesError) {
        console.error("[SessionStart] Failed to load exercises:", exercisesError);
        return NextResponse.json(
          { error: "Failed to load workout exercises" },
          { status: 500 }
        );
      }

      if (!workoutExercises || workoutExercises.length === 0) {
        console.error("[SessionStart] No exercises found in workout");
        return NextResponse.json(
          { error: "No exercises found in this workout" },
          { status: 400 }
        );
      }

      // 2b. Get exercise groups if any exercises are grouped
      const groupIds = workoutExercises
        .map((ex) => ex.group_id)
        .filter((id): id is string => !!id);
      
      console.log("[SessionStart] Exercise group check:", {
        totalExercises: workoutExercises.length,
        exercisesWithGroupId: groupIds.length,
        groupIds: groupIds,
        sampleExercise: workoutExercises[0] ? {
          id: workoutExercises[0].id,
          name: workoutExercises[0].exercise_name,
          group_id: workoutExercises[0].group_id,
        } : null,
      });
      
      let exerciseGroups: Array<{
        id: string;
        name: string;
        type: "superset" | "circuit" | "section";
        description?: string;
        order_index: number;
        rest_between_rounds?: number;
        rest_between_exercises?: number;
        rounds?: number;
        notes?: string;
      }> = [];
      
      // ALWAYS try to fetch groups for this workout, regardless of exercise group_ids
      const { data: groupsData, error: groupsError } = await supabase
        .from("workout_exercise_groups")
        .select("*")
        .eq("workout_plan_id", assignment.workout_plan_id);

      console.log("[SessionStart] Groups query result:", {
        found: !!groupsData,
        count: groupsData?.length || 0,
        error: groupsError?.message,
        groups: groupsData,
      });

      if (!groupsError && groupsData) {
        exerciseGroups = groupsData;
        console.log("[SessionStart] Loaded exercise groups:", {
          count: exerciseGroups.length,
          types: exerciseGroups.map((g) => g.type),
          names: exerciseGroups.map((g) => g.name),
        });
      }

      console.log("[SessionStart] Creating workout session...");

      // Get workout plan name from the assignment
      const workoutPlan = Array.isArray(assignment.workout_plans)
        ? assignment.workout_plans[0]
        : assignment.workout_plans;

      // 3. Create workout session
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_plan_id: assignment.workout_plan_id,
          workout_plan_name: workoutPlan?.name || "Untitled Workout",
          workout_assignment_id: assignment.id,
          started_at: new Date().toISOString(),
          started: true,
          mode: "live",
        })
        .select()
        .single();

      console.log("[SessionStart] Session creation result:", {
        success: !!session,
        session_id: session?.id,
        error: sessionError?.message,
      });

      if (sessionError || !session) {
        console.error("[SessionStart] Failed to create session:", sessionError);
        return NextResponse.json(
          { error: "Failed to create workout session" },
          { status: 500 }
        );
      }

      console.log("[SessionStart] Creating session exercises...");

      // 4. Create session exercises
      const sessionExercises = workoutExercises.map((we) => ({
        workout_session_id: session.id,
        workout_exercise_id: we.id,
        exercise_name: we.exercise_name,
        target_sets: we.sets || 3,
        completed_sets: 0,
        started: false,
        completed: false,
        group_id: we.group_id, // Preserve group assignment
      }));

      const { data: createdExercises, error: sessExError } = await supabase
        .from("session_exercises")
        .insert(sessionExercises)
        .select();

      console.log("[SessionStart] Session exercises result:", {
        count: createdExercises?.length || 0,
        error: sessExError?.message,
      });

      if (sessExError || !createdExercises) {
        console.error("[SessionStart] Session exercises creation error:", sessExError);
        // Rollback: delete the session
        await supabase.from("workout_sessions").delete().eq("id", session.id);
        return NextResponse.json(
          { error: "Failed to create session exercises" },
          { status: 500 }
        );
      }

      // 5. Build response with full session data
      // workoutPlan already extracted above

      const sessionData = {
        id: session.id,
        assignment_id: assignment.id,
        athlete_id: user.id,
        workout_plan_id: assignment.workout_plan_id,
        workout_name: workoutPlan?.name || "Untitled Workout",
        workout_description: workoutPlan?.description || "",
        status: "active" as const,
        started_at: session.started_at,
        current_exercise_index: 0,
        total_duration_seconds: 0,
        paused_at: null,
        completed_at: null,
        groups: exerciseGroups, // Include exercise groups
        exercises: createdExercises.map((se, index) => {
          const workoutExercise = workoutExercises[index];

          return {
            session_exercise_id: se.id,
            workout_exercise_id: se.workout_exercise_id,
            exercise_id: workoutExercise?.exercise_id || "",
            exercise_name: se.exercise_name,
            sets_target: se.target_sets,
            sets_completed: se.completed_sets,
            reps_target: workoutExercise?.reps?.toString() || "10",
            weight_target: workoutExercise?.weight,
            weight_percentage: workoutExercise?.percentage,
            rest_seconds: workoutExercise?.rest_time || 60,
            tempo: workoutExercise?.tempo,
            notes: workoutExercise?.notes,
            order_index: workoutExercise?.order_index || index,
            completed: se.completed,
            set_records: [],
            group_id: workoutExercise?.group_id || null, // Include group_id
          };
        }),
      };

      console.log("[SessionStart] Session created successfully:", {
        session_id: sessionData.id,
        exercise_count: sessionData.exercises.length,
        group_count: sessionData.groups.length,
      });

      return NextResponse.json({
        success: true,
        session_id: session.id,
        session: sessionData,
      });
    } catch (error) {
      console.error("Session start error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
