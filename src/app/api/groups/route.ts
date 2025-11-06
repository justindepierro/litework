import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  getAdminClient,
  isCoach,
} from "@/lib/auth-server";
import { cachedResponse, CacheDurations } from "@/lib/api-cache-headers";

// GET /api/groups - Get all groups (coaches) or user's groups (athletes)
export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();

    // Coaches/admins can see all groups, athletes only see their groups
    if (isCoach(user)) {
      const { data: groups, error } = await supabase
        .from("athlete_groups")
        .select("*")
        .order("name");

      if (error) throw error;

      // Map snake_case to camelCase for frontend
      const mappedGroups = groups?.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        sport: group.sport,
        category: group.category,
        coachId: group.coach_id,
        athleteIds: group.athlete_ids || [],
        color: group.color,
        archived: group.archived,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      }));

      return cachedResponse(
        { success: true, groups: mappedGroups },
        60, // Cache for 60s
        300 // Stale-while-revalidate for 300s
      );
    } else {
      // Athletes see only their groups
      const { data: groups, error } = await supabase
        .from("athlete_groups")
        .select("*")
        .contains("athlete_ids", [user.id])
        .order("name");

      if (error) throw error;

      // Map snake_case to camelCase for frontend
      const mappedGroups = groups?.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        sport: group.sport,
        category: group.category,
        coachId: group.coach_id,
        athleteIds: group.athlete_ids || [],
        color: group.color,
        archived: group.archived,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      }));

      return cachedResponse({ success: true, groups: mappedGroups }, 60, 300);
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
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isCoach(user)) {
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

    // Map snake_case to camelCase for frontend
    const mappedGroup = {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      sport: newGroup.sport,
      category: newGroup.category,
      coachId: newGroup.coach_id,
      athleteIds: newGroup.athlete_ids || [],
      color: newGroup.color,
      archived: newGroup.archived,
      createdAt: newGroup.created_at,
      updatedAt: newGroup.updated_at,
    };

    return NextResponse.json({
      success: true,
      group: mappedGroup,
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
