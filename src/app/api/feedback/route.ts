/**
 * Feedback Dashboard API
 * GET /api/feedback - Get all workout feedback (coaches/admins only)
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";
import type { AuthUser } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  return withAuth(request, async (user: AuthUser) => {
    // Only coaches and admins can view all feedback
    if (user.role !== "coach" && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have permission to view feedback" },
        { status: 403 }
      );
    }

    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      const limit = parseInt(searchParams.get("limit") || "50");

      const supabase = await createClient();

      // Build the query
      let query = supabase
        .from("workout_session_feedback")
        .select(
          `
          *,
          workout_sessions!inner(
            id,
            started_at,
            completed_at,
            athlete_id,
            users!workout_sessions_athlete_id_fkey(
              id,
              name,
              email
            ),
            workout_assignments!inner(
              id,
              workout_plans(
                id,
                name
              )
            )
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      // Filter by athlete if specified
      if (athleteId) {
        query = query.eq("user_id", athleteId);
      }

      // Filter by date range if specified
      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data: feedbackList, error: feedbackError } = await query;

      if (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        return NextResponse.json(
          { error: "Failed to fetch feedback" },
          { status: 500 }
        );
      }

      // Transform the data for easier consumption
      const transformedFeedback = feedbackList.map((item) => ({
        id: item.id,
        session_id: item.session_id,
        difficulty_rating: item.difficulty_rating,
        soreness_rating: item.soreness_rating,
        energy_level: item.energy_level,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        athlete: {
          id: item.workout_sessions.users.id,
          name: item.workout_sessions.users.name,
          email: item.workout_sessions.users.email,
        },
        workout: {
          name: item.workout_sessions.workout_assignments.workout_plans.name,
          completed_at: item.workout_sessions.completed_at,
        },
      }));

      return NextResponse.json(
        {
          feedback: transformedFeedback,
          count: transformedFeedback.length,
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
