import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

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
        return NextResponse.json(
          { error: "assignment_id is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // 1. Get assignment details with workout and exercises
      const { data: assignment, error: assignmentError } = await supabase
        .from("workout_assignments")
        .select(
          `
          id,
          workout_plan_id,
          athlete_id,
          workout_plans (
            id,
            name,
            description
          )
        `
        )
        .eq("id", assignment_id)
        .eq("athlete_id", user.id)
        .single();

      if (assignmentError || !assignment) {
        return NextResponse.json(
          { error: "Assignment not found or access denied" },
          { status: 404 }
        );
      }

      // 2. Get workout exercises with all details
      const { data: workoutExercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select(
          `
          id,
          exercise_id,
          sets,
          reps,
          weight,
          rest_seconds,
          notes,
          order_index,
          exercises (
            id,
            name,
            description
          )
        `
        )
        .eq("workout_plan_id", assignment.workout_plan_id)
        .order("order_index", { ascending: true });

      if (exercisesError) {
        return NextResponse.json(
          { error: "Failed to load workout exercises" },
          { status: 500 }
        );
      }

      if (!workoutExercises || workoutExercises.length === 0) {
        return NextResponse.json(
          { error: "No exercises found in this workout" },
          { status: 400 }
        );
      }

      // 3. Create workout session
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          athlete_id: user.id,
          workout_plan_id: assignment.workout_plan_id,
          assignment_id: assignment.id,
          started_at: new Date().toISOString(),
          status: "in_progress",
        })
        .select()
        .single();

      if (sessionError || !session) {
        console.error("Session creation error:", sessionError);
        return NextResponse.json(
          { error: "Failed to create workout session" },
          { status: 500 }
        );
      }

      // 4. Create session exercises
      const sessionExercises = workoutExercises.map((we, index) => ({
        session_id: session.id,
        exercise_id: we.exercise_id,
        sets_target: we.sets || 3,
        reps_target: we.reps || "10",
        weight_target: we.weight,
        rest_seconds: we.rest_seconds || 60,
        notes: we.notes,
        order_index: index,
      }));

      const { data: createdExercises, error: sessExError } = await supabase
        .from("session_exercises")
        .insert(sessionExercises)
        .select();

      if (sessExError || !createdExercises) {
        console.error("Session exercises creation error:", sessExError);
        // Rollback: delete the session
        await supabase.from("workout_sessions").delete().eq("id", session.id);
        return NextResponse.json(
          { error: "Failed to create session exercises" },
          { status: 500 }
        );
      }

      // 5. Build response with full session data
      const workoutPlan = Array.isArray(assignment.workout_plans)
        ? assignment.workout_plans[0]
        : assignment.workout_plans;

      const sessionData = {
        id: session.id,
        assignment_id: assignment.id,
        workout_plan_id: assignment.workout_plan_id,
        workout_name: workoutPlan?.name || "Untitled Workout",
        workout_description: workoutPlan?.description || "",
        status: "active" as const,
        started_at: session.started_at,
        current_exercise_index: 0,
        total_duration_seconds: 0,
        paused_at: null,
        exercises: createdExercises.map((se, index) => {
          const exercise = Array.isArray(workoutExercises[index].exercises)
            ? workoutExercises[index].exercises[0]
            : workoutExercises[index].exercises;

          return {
            session_exercise_id: se.id,
            exercise_id: se.exercise_id,
            exercise_name: exercise?.name || "Unknown Exercise",
            sets_target: se.sets_target,
            sets_completed: 0,
            reps_target: se.reps_target,
            weight_target: se.weight_target,
            rest_seconds: se.rest_seconds,
            notes: se.notes,
            completed: false,
            set_records: [],
          };
        }),
      };

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
