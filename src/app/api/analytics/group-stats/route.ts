/**
 * Group Performance Stats API
 * GET /api/analytics/group-stats
 *
 * Returns performance statistics for all groups
 * For coaches/admins only
 */

import { NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import { supabase } from "@/lib/supabase";

export async function GET() {
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

    // Batch fetch all data for all groups at once (avoid N+1)
    const groupIds = groups.map(g => g.id);
    
    // Get all group members in one query
    const { data: allMembers, error: memberError } = await supabase
      .from("group_members")
      .select("group_id, user_id")
      .in("group_id", groupIds);

    if (memberError) throw memberError;

    // Get all assignments in one query
    const { data: allAssignments, error: assignmentError } = await supabase
      .from("workout_assignments")
      .select("id, group_id")
      .in("group_id", groupIds);

    if (assignmentError) throw assignmentError;

    // Get all completed sessions in one query
    const assignmentIds = (allAssignments || []).map(a => a.id);
    const { data: allCompletedSessions, error: sessionError } = assignmentIds.length > 0
      ? await supabase
          .from("workout_sessions")
          .select("id, assignment_id")
          .in("assignment_id", assignmentIds)
          .not("completed_at", "is", null)
      : { data: [], error: null };

    if (sessionError) throw sessionError;

    // Build lookup maps for O(1) access
    const membersByGroup = new Map();
    const assignmentsByGroup = new Map();
    const sessionsByAssignment = new Map();

    (allMembers || []).forEach(m => {
      if (!membersByGroup.has(m.group_id)) membersByGroup.set(m.group_id, []);
      membersByGroup.get(m.group_id).push(m);
    });

    (allAssignments || []).forEach(a => {
      if (!assignmentsByGroup.has(a.group_id)) assignmentsByGroup.set(a.group_id, []);
      assignmentsByGroup.get(a.group_id).push(a);
    });

    (allCompletedSessions || []).forEach(s => {
      if (!sessionsByAssignment.has(s.assignment_id)) sessionsByAssignment.set(s.assignment_id, []);
      sessionsByAssignment.get(s.assignment_id).push(s);
    });

    // Calculate stats for each group using cached data
    const groupStatsPromises = groups.map(async (group) => {
      const members = membersByGroup.get(group.id) || [];
      const athleteCount = members.length;

      const assignments = assignmentsByGroup.get(group.id) || [];
      const totalAssignments = assignments.length;

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

      // Count completed sessions for this group's assignments
      const assignmentIdsForGroup = assignments.map((a: any) => a.id);
      let completedWorkouts = 0;
      assignmentIdsForGroup.forEach((aid: string) => {
        const sessions = sessionsByAssignment.get(aid) || [];
        completedWorkouts += sessions.length;
      });

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
