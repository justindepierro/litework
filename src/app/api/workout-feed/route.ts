import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/workout-feed
 * Fetch recent workout activities from group members
 * Query params: groupId (optional), limit (default 20)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const groupId = searchParams.get("groupId");
      const limit = parseInt(searchParams.get("limit") || "20", 10);

      const supabase = createClient();

      // Build query to get recent workouts from group members
      let query = supabase
        .from("workout_sessions")
        .select(
          `
          id,
          athlete_id,
          workout_name,
          completed_at,
          duration_minutes,
          total_volume,
          notes,
          profiles!inner (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(limit);

      // Filter by group if specified
      if (groupId) {
        // Get athletes in the group
        const { data: groupMembers } = await supabase
          .from("athlete_groups")
          .select("athlete_id")
          .eq("group_id", groupId);

        if (groupMembers && groupMembers.length > 0) {
          const athleteIds = groupMembers.map((m) => m.athlete_id);
          query = query.in("athlete_id", athleteIds);
        }
      } else {
        // Get all groups the user belongs to
        const { data: userGroups } = await supabase
          .from("athlete_groups")
          .select("group_id")
          .eq("athlete_id", user.id);

        if (userGroups && userGroups.length > 0) {
          const groupIds = userGroups.map((g) => g.group_id);

          // Get all athletes in those groups
          const { data: groupMembers } = await supabase
            .from("athlete_groups")
            .select("athlete_id")
            .in("group_id", groupIds);

          if (groupMembers && groupMembers.length > 0) {
            const athleteIds = groupMembers.map((m) => m.athlete_id);
            query = query.in("athlete_id", athleteIds);
          }
        }
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error("Error fetching workout feed:", error);
        return NextResponse.json(
          { error: "Failed to fetch workout feed" },
          { status: 500 }
        );
      }

      // Get recent PRs for these athletes
      const athleteIds = sessions?.map((s) => s.athlete_id) || [];
      const { data: recentPRs } = await supabase
        .from("set_records")
        .select(
          `
          id,
          athlete_id,
          exercise_id,
          weight,
          reps,
          one_rep_max,
          is_pr,
          created_at,
          exercises (
            name
          )
        `
        )
        .in("athlete_id", athleteIds)
        .eq("is_pr", true)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: false })
        .limit(10);

      // Combine into feed items
      const feedItems = [
        ...(sessions?.map((session) => {
          const profile = Array.isArray(session.profiles)
            ? session.profiles[0]
            : session.profiles;
          return {
            id: session.id,
            type: "workout_completed" as const,
            athleteId: session.athlete_id,
            athleteName: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
            timestamp: session.completed_at,
            content: {
              workoutName: session.workout_name,
              duration: session.duration_minutes,
              volume: session.total_volume,
              notes: session.notes,
            },
          };
        }) || []),
        ...(recentPRs?.map((pr) => {
          const exercise = Array.isArray(pr.exercises)
            ? pr.exercises[0]
            : pr.exercises;
          return {
            id: `pr-${pr.id}`,
            type: "pr_achieved" as const,
            athleteId: pr.athlete_id,
            athleteName: "", // Will be filled from sessions data
            timestamp: pr.created_at,
            content: {
              exerciseName: exercise?.name || "Unknown Exercise",
              weight: pr.weight,
              reps: pr.reps,
              oneRepMax: pr.one_rep_max,
            },
          };
        }) || []),
      ];

      // Sort by timestamp
      feedItems.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return NextResponse.json({
        success: true,
        feedItems: feedItems.slice(0, limit),
      });
    } catch (error) {
      console.error("Error in workout-feed GET endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
