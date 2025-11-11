/**
 * Workout Session Feedback API
 * POST /api/sessions/[id]/feedback - Submit feedback for a workout session
 * GET /api/sessions/[id]/feedback - Get feedback for a workout session
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import type { AuthUser } from "@/lib/auth-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id: sessionId } = await params;
      const body = await request.json();

      const { difficulty_rating, soreness_rating, energy_level, notes } = body;

      // Validate ratings (1-5 scale)
      if (
        difficulty_rating < 1 ||
        difficulty_rating > 5 ||
        soreness_rating < 1 ||
        soreness_rating > 5 ||
        energy_level < 1 ||
        energy_level > 5
      ) {
        return NextResponse.json(
          { error: "Ratings must be between 1 and 5" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Verify the session belongs to the user
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id, athlete_id")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: "Workout session not found" },
          { status: 404 }
        );
      }

      if (session.athlete_id !== user.id) {
        return NextResponse.json(
          { error: "You can only provide feedback for your own workouts" },
          { status: 403 }
        );
      }

      // Insert or update feedback (upsert)
      const { data: feedback, error: feedbackError } = await supabase
        .from("workout_session_feedback")
        .upsert(
          {
            session_id: sessionId,
            user_id: user.id,
            difficulty_rating,
            soreness_rating,
            energy_level,
            notes: notes || null,
          },
          {
            onConflict: "session_id",
          }
        )
        .select()
        .single();

      if (feedbackError) {
        console.error("Error saving feedback:", feedbackError);
        return NextResponse.json(
          { error: "Failed to save feedback" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Feedback saved successfully",
          feedback,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Feedback submission error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user: AuthUser) => {
    try {
      const { id: sessionId } = await params;
      const supabase = await createClient();

      // Get the feedback for this session
      const { data: feedback, error: feedbackError } = await supabase
        .from("workout_session_feedback")
        .select(
          `
          *,
          workout_sessions!inner(
            id,
            athlete_id,
            workout_assignments!inner(
              id,
              workout_plans(name)
            )
          )
        `
        )
        .eq("session_id", sessionId)
        .single();

      if (feedbackError) {
        if (feedbackError.code === "PGRST116") {
          // No feedback found
          return NextResponse.json(
            { feedback: null, message: "No feedback provided yet" },
            { status: 200 }
          );
        }

        console.error("Error fetching feedback:", feedbackError);
        return NextResponse.json(
          { error: "Failed to fetch feedback" },
          { status: 500 }
        );
      }

      // Check if user has permission to view this feedback
      const isOwnFeedback = feedback.user_id === user.id;
      const isCoach = user.role === "coach" || user.role === "admin";

      if (!isOwnFeedback && !isCoach) {
        return NextResponse.json(
          { error: "You do not have permission to view this feedback" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          feedback,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Feedback fetch error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
