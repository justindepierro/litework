import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { withAuth } from "@/lib/auth-server";

/**
 * POST /api/exercise-kpi-tags
 * 
 * Add KPI tag(s) to a workout exercise (coaches/admins only)
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user is coach or admin
      if (user.role !== "coach" && user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Permission denied" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { workoutExerciseId, kpiTagIds, relevanceNotes } = body;

      if (!workoutExerciseId || !kpiTagIds || !Array.isArray(kpiTagIds)) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Insert multiple tags at once
      const inserts = kpiTagIds.map((tagId) => ({
        workout_exercise_id: workoutExerciseId,
        kpi_tag_id: tagId,
        relevance_notes: relevanceNotes,
      }));

      const { data, error } = await supabase
        .from("exercise_kpi_tags")
        .insert(inserts)
        .select();

      if (error) {
        console.error("[EXERCISE_KPI_TAGS] Error adding tags:", error);
        
        if (error.code === "23505") { // Unique violation
          return NextResponse.json(
            { success: false, error: "One or more tags are already assigned to this exercise" },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { success: false, error: "Failed to add KPI tags" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
      console.error("[EXERCISE_KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/exercise-kpi-tags
 * 
 * Remove a KPI tag from a workout exercise (coaches/admins only)
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      // Check if user is coach or admin
      if (user.role !== "coach" && user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Permission denied" },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const workoutExerciseId = searchParams.get("workoutExerciseId");
      const kpiTagId = searchParams.get("kpiTagId");

      const supabase = await createClient();

      if (id) {
        // Delete by link ID
        const { error } = await supabase
          .from("exercise_kpi_tags")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("[EXERCISE_KPI_TAGS] Error removing tag:", error);
          return NextResponse.json(
            { success: false, error: "Failed to remove KPI tag" },
            { status: 500 }
          );
        }
      } else if (workoutExerciseId && kpiTagId) {
        // Delete by combination
        const { error } = await supabase
          .from("exercise_kpi_tags")
          .delete()
          .eq("workout_exercise_id", workoutExerciseId)
          .eq("kpi_tag_id", kpiTagId);

        if (error) {
          console.error("[EXERCISE_KPI_TAGS] Error removing tag:", error);
          return NextResponse.json(
            { success: false, error: "Failed to remove KPI tag" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Must provide either id or both workoutExerciseId and kpiTagId" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[EXERCISE_KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
