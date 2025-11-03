import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/blocks/[id]/favorite - Toggle favorite status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: blockId } = await params;

  try {
    // First, get the current block
    const { data: block, error: fetchError } = await supabase
      .from("workout_blocks")
      .select("*")
      .eq("id", blockId)
      .single();

    if (fetchError || !block) {
      return NextResponse.json(
        { success: false, error: "Block not found" },
        { status: 404 }
      );
    }

    // Check if user has permission (must be owner or it's a template)
    if (!block.is_template && block.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: "Permission denied" },
        { status: 403 }
      );
    }

    // Toggle favorite status
    const newFavoriteStatus = !block.is_favorite;

    const { data: updatedBlock, error: updateError } = await supabase
      .from("workout_blocks")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", blockId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      block: updatedBlock,
      isFavorite: newFavoriteStatus,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to toggle favorite",
      },
      { status: 500 }
    );
  }
}
