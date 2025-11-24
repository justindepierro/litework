import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/goals
 * Fetch athlete's goals with optional filtering
 * Query params: status (active|completed|abandoned), athleteId (coach only)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const athleteId = searchParams.get("athleteId") || user.id;

      // Check permissions
      if (
        athleteId !== user.id &&
        user.role !== "coach" &&
        user.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "Unauthorized to view goals" },
          { status: 403 }
        );
      }

      const supabase = createClient();

      let query = supabase
        .from("athlete_goals")
        .select(
          `
          *,
          exercise:exercises(id, name)
        `
        )
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data: goals, error } = await query;

      if (error) {
        // If table doesn't exist yet, return empty array gracefully
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          console.log(
            "[goals] Table athlete_goals does not exist yet, returning empty array"
          );
          return NextResponse.json({ success: true, goals: [] });
        }

        console.error("Error fetching goals:", error);
        return NextResponse.json(
          { error: "Failed to fetch goals" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, goals: goals || [] });
    } catch (error) {
      console.error("Error in goals GET endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/goals
 * Create a new goal
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const {
        goalType,
        title,
        description,
        exerciseId,
        targetWeight,
        targetVolume,
        targetFrequency,
        targetStreak,
        targetBodyweight,
        deadline,
      } = body;

      // Validation
      if (!goalType || !title) {
        return NextResponse.json(
          { error: "Goal type and title are required" },
          { status: 400 }
        );
      }

      // Validate goal-specific fields
      if (goalType === "strength" && (!exerciseId || !targetWeight)) {
        return NextResponse.json(
          { error: "Exercise and target weight required for strength goals" },
          { status: 400 }
        );
      }

      if (goalType === "volume" && !targetVolume) {
        return NextResponse.json(
          { error: "Target volume required for volume goals" },
          { status: 400 }
        );
      }

      if (goalType === "frequency" && !targetFrequency) {
        return NextResponse.json(
          { error: "Target frequency required for frequency goals" },
          { status: 400 }
        );
      }

      if (goalType === "streak" && !targetStreak) {
        return NextResponse.json(
          { error: "Target streak required for streak goals" },
          { status: 400 }
        );
      }

      if (goalType === "bodyweight" && !targetBodyweight) {
        return NextResponse.json(
          { error: "Target bodyweight required for bodyweight goals" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      const goalData = {
        athlete_id: user.id,
        goal_type: goalType,
        title,
        description: description || null,
        exercise_id: exerciseId || null,
        target_weight: targetWeight || null,
        target_volume: targetVolume || null,
        target_frequency: targetFrequency || null,
        target_streak: targetStreak || null,
        target_bodyweight: targetBodyweight || null,
        deadline: deadline || null,
        current_value: 0,
        status: "active",
      };

      const { data: goal, error } = await supabase
        .from("athlete_goals")
        .insert(goalData)
        .select(
          `
          *,
          exercise:exercises(id, name)
        `
        )
        .single();

      if (error) {
        console.error("Error creating goal:", error);
        return NextResponse.json(
          { error: "Failed to create goal" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, goal }, { status: 201 });
    } catch (error) {
      console.error("Error in goals POST endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * PUT /api/goals
 * Update goal progress or details
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { goalId, currentValue, status, ...updates } = body;

      if (!goalId) {
        return NextResponse.json(
          { error: "Goal ID is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // Verify ownership
      const { data: existingGoal, error: fetchError } = await supabase
        .from("athlete_goals")
        .select("athlete_id")
        .eq("id", goalId)
        .single();

      if (fetchError || !existingGoal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      if (existingGoal.athlete_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to update this goal" },
          { status: 403 }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = { ...updates };

      if (currentValue !== undefined) {
        updateData.current_value = currentValue;
      }

      if (status === "completed") {
        updateData.status = "completed";
        updateData.completed_at = new Date().toISOString();
      } else if (status) {
        updateData.status = status;
      }

      const { data: goal, error } = await supabase
        .from("athlete_goals")
        .update(updateData)
        .eq("id", goalId)
        .select(
          `
          *,
          exercise:exercises(id, name)
        `
        )
        .single();

      if (error) {
        console.error("Error updating goal:", error);
        return NextResponse.json(
          { error: "Failed to update goal" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, goal });
    } catch (error) {
      console.error("Error in goals PUT endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/goals
 * Delete a goal
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const goalId = searchParams.get("goalId");

      if (!goalId) {
        return NextResponse.json(
          { error: "Goal ID is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // Verify ownership
      const { data: existingGoal, error: fetchError } = await supabase
        .from("athlete_goals")
        .select("athlete_id")
        .eq("id", goalId)
        .single();

      if (fetchError || !existingGoal) {
        return NextResponse.json({ error: "Goal not found" }, { status: 404 });
      }

      if (existingGoal.athlete_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to delete this goal" },
          { status: 403 }
        );
      }

      const { error } = await supabase
        .from("athlete_goals")
        .delete()
        .eq("id", goalId);

      if (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json(
          { error: "Failed to delete goal" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error in goals DELETE endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
