import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// PATCH /api/workouts/[id]/archive - Archive or unarchive a workout
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { archived } = await request.json();

    if (typeof archived !== "boolean") {
      return NextResponse.json(
        { error: "archived must be a boolean value" },
        { status: 400 }
      );
    }

    // Check if workout exists and user owns it
    const { data: existingWorkout, error: checkError } = await supabaseAdmin
      .from("workout_plans")
      .select("id, name, created_by")
      .eq("id", id)
      .single();

    if (checkError || !existingWorkout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      );
    }

    // Coaches can only archive their own workouts (admins can archive any)
    if (user.role !== "admin" && existingWorkout.created_by !== user.id) {
      return NextResponse.json(
        { error: "You can only archive your own workouts" },
        { status: 403 }
      );
    }

    // Update archived status
    const { data: updatedWorkout, error: updateError } = await supabaseAdmin
      .from("workout_plans")
      .update({
        archived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[ARCHIVE] Error updating workout:", updateError);
      return NextResponse.json(
        { error: "Failed to update workout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: archived ? "Workout archived" : "Workout unarchived",
      workout: {
        id: updatedWorkout.id,
        name: updatedWorkout.name,
        archived: updatedWorkout.archived,
      },
    });
  } catch (error) {
    console.error("[ARCHIVE] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
