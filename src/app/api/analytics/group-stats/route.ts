/**
 * Group Performance Stats API
 * GET /api/analytics/group-stats
 *
 * Returns performance statistics for all groups
 * For coaches/admins only
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabase } from "@/lib/supabase";

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
    // Fetch all groups
    const { data: groups, error: groupError } = await supabase
      .from("athlete_groups")
      .select("id, name")
      .order("name", { ascending: true });

    if (groupError) throw groupError;

    if (!groups || groups.length === 0) {
      return NextResponse.json({
        success: true,
        groups: [],
      });
    }

    // For each group, calculate stats
    const groupStatsPromises = groups.map(async (group) => {
      // Get athlete count
      const { data: members, error: memberError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", group.id);

      if (memberError) throw memberError;

      const athleteCount = members?.length || 0;

      // Get assignments for this group
      const { data: assignments, error: assignmentError } = await supabase
        .from("workout_assignments")
        .select("id")
        .eq("group_id", group.id);

      if (assignmentError) throw assignmentError;

      const totalAssignments = assignments?.length || 0;

      if (totalAssignments === 0 || athleteCount === 0) {
        return {
          id: group.id,
          groupName: group.name,
          athleteCount,
          completedWorkouts: 0,
          totalAssignments: 0,
          avgCompletionRate: 0,
        };
      }

      // Get all completed workout sessions for this group's assignments
      const assignmentIds = assignments.map((a) => a.id);
      const { data: completedSessions, error: sessionError } = await supabase
        .from("workout_sessions")
        .select("id")
        .in("assignment_id", assignmentIds)
        .not("completed_at", "is", null);

      if (sessionError) throw sessionError;

      const completedWorkouts = completedSessions?.length || 0;

      // Calculate completion rate
      // Total possible completions = totalAssignments * athleteCount
      const totalPossible = totalAssignments * athleteCount;
      const avgCompletionRate =
        totalPossible > 0
          ? Math.round((completedWorkouts / totalPossible) * 100)
          : 0;

      return {
        id: group.id,
        groupName: group.name,
        athleteCount,
        completedWorkouts,
        totalAssignments,
        avgCompletionRate,
      };
    });

    const groupStats = await Promise.all(groupStatsPromises);

    // Sort by completion rate descending
    groupStats.sort((a, b) => b.avgCompletionRate - a.avgCompletionRate);

    return NextResponse.json({
      success: true,
      groups: groupStats,
    });
  } catch (error) {
    console.error("Group stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch group statistics",
        groups: [],
      },
      { status: 500 }
    );
  }
}
