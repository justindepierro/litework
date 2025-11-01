import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getAdminClient } from "@/lib/auth-server";

// GET /api/groups - Get all groups (coaches) or user's groups (athletes)
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Coaches/admins can see all groups, athletes only see their groups
    if (user.role === "coach" || user.role === "admin") {
      const { data: groups, error } = await supabase
        .from("athlete_groups")
        .select("*")
        .order("name");

      if (error) throw error;

      return NextResponse.json({ success: true, groups });
    } else {
      // Athletes see only their groups
      const { data: groups, error } = await supabase
        .from("athlete_groups")
        .select("*")
        .contains("athlete_ids", [user.id])
        .order("name");

      if (error) throw error;

      return NextResponse.json({ success: true, groups });
    }
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create new group (coaches only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "coach" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Coach access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, sport, category, color, athleteIds } = body;

    if (!name || !sport) {
      return NextResponse.json(
        { error: "Name and sport are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { data: newGroup, error } = await supabase
      .from("athlete_groups")
      .insert({
        name,
        description,
        sport,
        category,
        coach_id: user.id,
        athlete_ids: athleteIds || [],
        color: color || "#3b82f6",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      group: newGroup,
    });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
