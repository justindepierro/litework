/**
 * Group Membership API
 * Manage athlete assignments to groups
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to create server-side Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

/**
 * POST /api/groups/members
 * Add athlete(s) to a group
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isCoach(user)) {
    return NextResponse.json(
      { success: false, error: "Forbidden - Coach access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { groupId, athleteIds } = body;

    if (!groupId || !athleteIds || !Array.isArray(athleteIds)) {
      return NextResponse.json(
        { success: false, error: "Group ID and athlete IDs required" },
        { status: 400 }
      );
    }

    // Get server-side Supabase client
    const supabase = await getSupabaseClient();

    // Get current group
    const { data: group, error: groupError } = await supabase
      .from("athlete_groups")
      .select("id, athlete_ids")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Merge new athlete IDs with existing ones (avoid duplicates)
    const currentAthleteIds = group.athlete_ids || [];
    const updatedAthleteIds = Array.from(
      new Set([...currentAthleteIds, ...athleteIds])
    );

    // Update the group with the new athlete_ids array
    const { error } = await supabase
      .from("athlete_groups")
      .update({ athlete_ids: updatedAthleteIds })
      .eq("id", groupId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Added ${athleteIds.length} athlete(s) to group`,
      athleteIds: updatedAthleteIds,
    });
  } catch (error) {
    console.error("Error adding group members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add athletes to group" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/groups/members?groupId=xxx
 * Get all members of a specific group
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isCoach(user)) {
    return NextResponse.json(
      { success: false, error: "Forbidden - Coach access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "Group ID required" },
        { status: 400 }
      );
    }

    // Get server-side Supabase client
    const supabase = await getSupabaseClient();

    // Get the group with its athlete_ids
    const { data: group, error: groupError } = await supabase
      .from("athlete_groups")
      .select("id, athlete_ids")
      .eq("id", groupId)
      .single();

    if (groupError) throw groupError;

    if (!group || !group.athlete_ids || group.athlete_ids.length === 0) {
      return NextResponse.json({
        success: true,
        athletes: [],
      });
    }

    // Fetch all athletes that are in this group
    const { data: athletes, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role")
      .in("id", group.athlete_ids)
      .eq("role", "athlete");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      athletes: athletes || [],
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch group members" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/members?groupId=xxx&athleteId=yyy
 * Remove an athlete from a group
 */
export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isCoach(user)) {
    return NextResponse.json(
      { success: false, error: "Forbidden - Coach access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const athleteId = searchParams.get("athleteId");

    if (!groupId || !athleteId) {
      return NextResponse.json(
        { success: false, error: "Group ID and athlete ID required" },
        { status: 400 }
      );
    }

    // Get server-side Supabase client
    const supabase = await getSupabaseClient();

    // Get current group
    const { data: group, error: groupError } = await supabase
      .from("athlete_groups")
      .select("id, athlete_ids")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Remove athlete from the array
    const currentAthleteIds = group.athlete_ids || [];
    const updatedAthleteIds = currentAthleteIds.filter(
      (id: string) => id !== athleteId
    );

    // Update the group
    const { error } = await supabase
      .from("athlete_groups")
      .update({ athlete_ids: updatedAthleteIds })
      .eq("id", groupId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Athlete removed from group",
      athleteIds: updatedAthleteIds,
    });
  } catch (error) {
    console.error("Error removing group member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove athlete from group" },
      { status: 500 }
    );
  }
}
