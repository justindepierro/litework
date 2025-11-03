/**
 * Group Membership API
 * Manage athlete assignments to groups
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabase } from "@/lib/supabase";

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

    // Check if group exists
    const { data: group, error: groupError } = await supabase
      .from("athlete_groups")
      .select("id")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Add athletes to group
    const memberships = athleteIds.map((athleteId) => ({
      group_id: groupId,
      user_id: athleteId,
    }));

    const { data, error } = await supabase
      .from("group_members")
      .insert(memberships)
      .select();

    if (error) {
      // Handle duplicate key errors gracefully
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Some athletes were already in this group",
          memberships: [],
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      memberships: data,
      message: `Added ${athleteIds.length} athlete(s) to group`,
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

    const { data: members, error } = await supabase
      .from("group_members")
      .select(
        `
          user_id,
          users!inner (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `
      )
      .eq("group_id", groupId);

    if (error) throw error;

    const athletes = members?.map((m) => m.users) || [];

    return NextResponse.json({
      success: true,
      athletes,
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch group members" },
      { status: 500 }
    );
  }
}
