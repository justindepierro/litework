import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/sessions/[id]
 *
 * Retrieve a workout session by ID with all exercises and completed sets.
 * Used for resuming workouts and viewing session history.
 *
 * Returns:
 * - Session details (status, start time, assignment info)
 * - All session exercises with exercise details
 * - All completed sets for each exercise
 *
 * Security:
 * - User must own the session (athlete who started it)
 * - Coaches can view sessions for their athletes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: sessionId } = await params;
    const supabase = createClient();

    try {
      // Fetch session with assignment and workout plan details
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .select(
          `
          *,
          workout_assignments (
            id,
            workout_plan_name,
            scheduled_date,
            athlete_id
          )
        `
        )
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }

      // Security check: User must own the session or be a coach
      const assignment = session.workout_assignments;
      const isOwner = assignment?.athlete_id === user.id;
      const isCoach = user.role === "coach" || user.role === "admin";

      if (!isOwner && !isCoach) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to view this session" },
          { status: 403 }
        );
      }

      // Fetch session exercises with exercise details
      const { data: sessionExercises, error: exercisesError } = await supabase
        .from("session_exercises")
        .select(
          `
          id,
          exercise_id,
          exercise_name,
          order_index,
          target_sets,
          target_reps,
          target_weight,
          weight_type,
          rest_time,
          notes,
          exercises (
            id,
            name,
            description,
            is_compound,
            is_bodyweight
          )
        `
        )
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

      if (exercisesError) {
        console.error("Error fetching session exercises:", exercisesError);
        return NextResponse.json(
          { success: false, error: "Failed to load session exercises" },
          { status: 500 }
        );
      }

      // Fetch all completed sets for this session
      const { data: completedSets, error: setsError } = await supabase
        .from("set_records")
        .select("*")
        .eq("session_id", sessionId)
        .order("completed_at", { ascending: true });

      if (setsError) {
        console.error("Error fetching completed sets:", setsError);
        return NextResponse.json(
          { success: false, error: "Failed to load completed sets" },
          { status: 500 }
        );
      }

      // Group completed sets by exercise
      const setsByExercise: { [key: string]: typeof completedSets } = {};
      completedSets?.forEach((set) => {
        if (!setsByExercise[set.session_exercise_id]) {
          setsByExercise[set.session_exercise_id] = [];
        }
        setsByExercise[set.session_exercise_id].push(set);
      });

      // Build response with exercises and their sets
      const exercises = sessionExercises?.map((exercise) => ({
        id: exercise.id,
        exerciseId: exercise.exercise_id,
        exerciseName: exercise.exercise_name,
        orderIndex: exercise.order_index,
        targetSets: exercise.target_sets,
        targetReps: exercise.target_reps,
        targetWeight: exercise.target_weight,
        weightType: exercise.weight_type,
        restTime: exercise.rest_time,
        notes: exercise.notes,
        exerciseDetails: exercise.exercises,
        completedSets: setsByExercise[exercise.id] || [],
      }));

      // Calculate session progress
      const totalSets =
        exercises?.reduce((sum, ex) => sum + ex.targetSets, 0) || 0;
      const completedSetsCount = completedSets?.length || 0;
      const progress =
        totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          session: {
            id: session.id,
            assignmentId: session.assignment_id,
            athleteId: session.athlete_id,
            workoutPlanName: assignment?.workout_plan_name || "Unknown Workout",
            status: session.status,
            startTime: session.start_time,
            endTime: session.end_time,
            duration: session.duration,
            notes: session.notes,
            createdAt: session.created_at,
          },
          exercises,
          progress: {
            totalSets,
            completedSets: completedSetsCount,
            percentage: Math.round(progress),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * PATCH /api/sessions/[id]
 *
 * Update session state and metadata.
 *
 * Body:
 * - status?: "in-progress" | "paused" | "completed" | "abandoned"
 * - notes?: string
 * - endTime?: string (ISO date)
 * - duration?: number (minutes)
 *
 * Use cases:
 * - Pause/resume workout
 * - Add session notes
 * - Update completion metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: sessionId } = await params;
    const body = await request.json();
    const supabase = createClient();

    try {
      // Fetch existing session to verify ownership
      const { data: session, error: fetchError } = await supabase
        .from("workout_sessions")
        .select("athlete_id, status")
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
          { success: false, error: "Unauthorized to modify this session" },
          { status: 403 }
        );
      }

      // Validate status transition
      const validStatuses = ["in-progress", "paused", "completed", "abandoned"];
      if (body.status && !validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Prevent modifications to completed or abandoned sessions
      if (session.status === "completed" || session.status === "abandoned") {
        return NextResponse.json(
          { success: false, error: `Cannot modify ${session.status} session` },
          { status: 400 }
        );
      }

      // Build update object
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (body.status) updates.status = body.status;
      if (body.notes !== undefined) updates.notes = body.notes;
      if (body.endTime) updates.end_time = body.endTime;
      if (body.duration !== undefined) updates.duration = body.duration;

      // Update session
      const { data: updatedSession, error: updateError } = await supabase
        .from("workout_sessions")
        .update(updates)
        .eq("id", sessionId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating session:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to update session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { session: updatedSession },
      });
    } catch (error) {
      console.error("Error updating session:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/sessions/[id]
 *
 * Abandon/cancel a workout session.
 * Marks the session as abandoned without deleting data.
 *
 * Security:
 * - User must own the session
 * - Cannot abandon completed sessions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: sessionId } = await params;
    const supabase = createClient();

    try {
      // Fetch existing session to verify ownership
      const { data: session, error: fetchError } = await supabase
        .from("workout_sessions")
        .select("athlete_id, status")
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
          { success: false, error: "Unauthorized to delete this session" },
          { status: 403 }
        );
      }

      // Prevent abandoning completed sessions
      if (session.status === "completed") {
        return NextResponse.json(
          { success: false, error: "Cannot abandon a completed session" },
          { status: 400 }
        );
      }

      // Mark as abandoned (don't actually delete)
      const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({
          status: "abandoned",
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Error abandoning session:", updateError);
        return NextResponse.json(
          { success: false, error: "Failed to abandon session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Session abandoned successfully",
      });
    } catch (error) {
      console.error("Error abandoning session:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * PUT /api/sessions/[id]
 *
 * Create or update a workout session (upsert).
 * Used by sync manager to sync offline sessions.
 *
 * Body:
 * - id: string (session ID)
 * - athlete_id: string
 * - workout_plan_id: string
 * - assignment_id: string | null
 * - status: "active" | "paused" | "completed" | "abandoned"
 * - started_at: string (ISO timestamp)
 * - completed_at: string | null (ISO timestamp)
 * - notes: string | null
 *
 * Security:
 * - User must own the session (athlete_id matches user.id)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    const { id: sessionId } = await params;
    const supabase = createClient();

    try {
      const body = await request.json();
      const {
        athlete_id,
        workout_plan_id,
        assignment_id,
        status,
        started_at,
        completed_at,
        notes,
      } = body;

      // Verify ownership
      if (athlete_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Not authorized to sync this session" },
          { status: 403 }
        );
      }

      // Validate required fields
      if (!athlete_id || !workout_plan_id || !status || !started_at) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Upsert session
      const { data: session, error: upsertError } = await supabase
        .from("workout_sessions")
        .upsert(
          {
            id: sessionId,
            athlete_id,
            workout_plan_id,
            assignment_id,
            status,
            start_time: started_at,
            end_time: completed_at,
            notes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (upsertError) {
        console.error("Error upserting session:", upsertError);
        return NextResponse.json(
          { success: false, error: "Failed to sync session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: session,
      });
    } catch (error) {
      console.error("Error syncing session:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
