import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/blocks - Fetch workout blocks
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const favoritesOnly = searchParams.get("favorites") === "true";
    const templatesOnly = searchParams.get("templates") === "true";

    let query = supabase
      .from("workout_blocks")
      .select("*")
      .order("usage_count", { ascending: false });

    // Filter by category
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Filter by favorites
    if (favoritesOnly) {
      query = query.eq("is_favorite", true).eq("created_by", user.id);
    }

    // Filter by templates vs user blocks
    if (templatesOnly) {
      query = query.eq("is_template", true);
    } else {
      // Show templates + user's own blocks
      query = query.or(`is_template.eq.true,created_by.eq.${user.id}`);
    }

    const { data: blocks, error } = await query;

    if (error) {
      console.error("Error fetching blocks:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch workout blocks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      blocks: blocks || [],
    });
  } catch (error) {
    console.error("Error in GET /api/blocks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/blocks - Create a new workout block
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      exercises,
      groups,
      estimatedDuration,
      tags,
    } = body;

    // Validation
    if (!name || !category || !exercises || exercises.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, category, and at least one exercise are required",
        },
        { status: 400 }
      );
    }

    // Create the block
    const { data: block, error } = await supabase
      .from("workout_blocks")
      .insert({
        name,
        description,
        category,
        exercises,
        groups: groups || [],
        estimated_duration: estimatedDuration || 0,
        tags: tags || [],
        is_template: false, // User-created blocks are not templates
        created_by: user.id,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating block:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create workout block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error("Error in POST /api/blocks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/blocks/[id] - Update a workout block
export async function PUT(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      category,
      exercises,
      groups,
      estimatedDuration,
      tags,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Block ID is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existingBlock, error: fetchError } = await supabase
      .from("workout_blocks")
      .select("created_by, is_template")
      .eq("id", id)
      .single();

    if (fetchError || !existingBlock) {
      return NextResponse.json(
        { success: false, error: "Block not found" },
        { status: 404 }
      );
    }

    // Can't edit templates unless admin
    if (existingBlock.is_template && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot edit template blocks" },
        { status: 403 }
      );
    }

    // Must own the block
    if (existingBlock.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized to edit this block" },
        { status: 403 }
      );
    }

    // Update the block
    const { data: block, error } = await supabase
      .from("workout_blocks")
      .update({
        name,
        description,
        category,
        exercises,
        groups: groups || [],
        estimated_duration: estimatedDuration || 0,
        tags: tags || [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating block:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update workout block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { block },
    });
  } catch (error) {
    console.error("Error in PUT /api/blocks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/blocks/[id] - Delete a workout block
export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Block ID is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existingBlock, error: fetchError } = await supabase
      .from("workout_blocks")
      .select("created_by, is_template")
      .eq("id", id)
      .single();

    if (fetchError || !existingBlock) {
      return NextResponse.json(
        { success: false, error: "Block not found" },
        { status: 404 }
      );
    }

    // Can't delete templates unless admin
    if (existingBlock.is_template && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete template blocks" },
        { status: 403 }
      );
    }

    // Must own the block
    if (existingBlock.created_by !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this block" },
        { status: 403 }
      );
    }

    // Delete the block
    const { error } = await supabase
      .from("workout_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting block:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete workout block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Block deleted successfully" },
    });
  } catch (error) {
    console.error("Error in DELETE /api/blocks:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
