import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { withAuth } from "@/lib/auth-server";

/**
 * GET /api/kpi-tags
 *
 * Fetch all available KPI tags (everyone can read)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("kpi_tags")
        .select("*")
        .order("display_name");

      if (error) {
        console.error("[KPI_TAGS] Error fetching tags:", error);
        return NextResponse.json(
          { success: false, error: "Failed to fetch KPI tags" },
          { status: 500 }
        );
      }

      // Convert to camelCase for frontend
      const tags = (data || []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        displayName: tag.display_name,
        color: tag.color,
        description: tag.description,
        kpiType: tag.kpi_type,
        primaryExerciseId: tag.primary_exercise_id,
        createdBy: tag.created_by,
        createdAt: new Date(tag.created_at),
        updatedAt: new Date(tag.updated_at),
      }));

      return NextResponse.json({ success: true, data: tags });
    } catch (error) {
      console.error("[KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/kpi-tags
 *
 * Create a new KPI tag (coaches/admins only)
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
      const {
        name,
        display_name,
        displayName,
        color,
        description,
        kpi_type,
        kpiType,
        primary_exercise_id,
        primaryExerciseId,
      } = body;

      // Handle both camelCase and snake_case
      const finalName = name;
      const finalDisplayName = display_name || displayName;
      const finalKpiType = kpi_type || kpiType;
      const finalDescription = description;
      const finalPrimaryExerciseId = primary_exercise_id || primaryExerciseId;

      // Validation
      if (!finalName || !finalDisplayName || !color || !finalKpiType) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Validate name format (uppercase, underscores, numbers only)
      if (!/^[A-Z0-9_]+$/.test(finalName)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Name must be uppercase letters, numbers, and underscores only",
          },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Check for existing KPI with same name
      const { data: existing } = await supabase
        .from("kpi_tags")
        .select("id, display_name")
        .eq("name", finalName)
        .single();

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `A KPI with the name "${existing.display_name}" (${finalName}) already exists`,
          },
          { status: 409 }
        );
      }

      const { data, error } = await supabase
        .from("kpi_tags")
        .insert({
          name: finalName,
          display_name: finalDisplayName,
          color,
          description: finalDescription,
          kpi_type: finalKpiType,
          primary_exercise_id: finalPrimaryExerciseId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("[KPI_TAGS] Error creating tag:", error);

        if (error.code === "23505") {
          // Unique violation
          return NextResponse.json(
            { success: false, error: "A tag with this name already exists" },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { success: false, error: "Failed to create KPI tag" },
          { status: 500 }
        );
      }

      // Convert to camelCase
      const tag = {
        id: data.id,
        name: data.name,
        displayName: data.display_name,
        color: data.color,
        description: data.description,
        kpiType: data.kpi_type,
        primaryExerciseId: data.primary_exercise_id,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return NextResponse.json({ success: true, data: tag }, { status: 201 });
    } catch (error) {
      console.error("[KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * PATCH /api/kpi-tags
 *
 * Update a KPI tag (coaches/admins only)
 */
export async function PATCH(request: NextRequest) {
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
      const {
        id,
        displayName,
        color,
        description,
        kpiType,
        primaryExerciseId,
      } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Tag ID is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      const updates: Record<string, unknown> = {};
      if (displayName) updates.display_name = displayName;
      if (color) updates.color = color;
      if (description !== undefined) updates.description = description;
      if (kpiType) updates.kpi_type = kpiType;
      if (primaryExerciseId !== undefined)
        updates.primary_exercise_id = primaryExerciseId;

      const { data, error } = await supabase
        .from("kpi_tags")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[KPI_TAGS] Error updating tag:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update KPI tag" },
          { status: 500 }
        );
      }

      // Convert to camelCase
      const tag = {
        id: data.id,
        name: data.name,
        displayName: data.display_name,
        color: data.color,
        description: data.description,
        kpiType: data.kpi_type,
        primaryExerciseId: data.primary_exercise_id,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return NextResponse.json({ success: true, data: tag });
    } catch (error) {
      console.error("[KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/kpi-tags
 *
 * Delete a KPI tag (coaches/admins only)
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

      if (!id) {
        return NextResponse.json(
          { success: false, error: "Tag ID is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      const { error } = await supabase.from("kpi_tags").delete().eq("id", id);

      if (error) {
        console.error("[KPI_TAGS] Error deleting tag:", error);
        return NextResponse.json(
          { success: false, error: "Failed to delete KPI tag" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[KPI_TAGS] Unexpected error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
