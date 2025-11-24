import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/leaderboard
 * Fetch leaderboard rankings for a group
 * Query params: groupId (required), type (volume/streak/pr_count/workout_count), period (weekly/monthly/all_time)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const groupId = searchParams.get("groupId");
      const leaderboardType = searchParams.get("type") || "weekly_volume";
      const period = searchParams.get("period") || "weekly";

      if (!groupId) {
        return NextResponse.json(
          { error: "Group ID is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // Verify user has access to this group
      const { data: membership } = await supabase
        .from("athlete_groups")
        .select("id")
        .eq("group_id", groupId)
        .eq("athlete_id", user.id)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        !membership &&
        profile?.role !== "coach" &&
        profile?.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "Unauthorized to view this leaderboard" },
          { status: 403 }
        );
      }

      // Get athletes in the group
      const { data: groupMembers } = await supabase
        .from("athlete_groups")
        .select(
          `
          athlete_id,
          profiles!inner (
            id,
            first_name,
            last_name
          )
        `
        )
        .eq("group_id", groupId);

      if (!groupMembers || groupMembers.length === 0) {
        return NextResponse.json({
          success: true,
          leaderboard: [],
          type: leaderboardType,
          period,
        });
      }

      const athleteIds = groupMembers.map((m) => m.athlete_id);

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "all_time":
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }

      // Fetch stats based on leaderboard type
      let rankings: Array<{
        athleteId: string;
        athleteName: string;
        value: number;
        rank: number;
      }> = [];

      switch (leaderboardType) {
        case "weekly_volume":
        case "monthly_volume":
          const { data: volumeData } = await supabase
            .from("workout_sessions")
            .select("athlete_id, total_volume")
            .in("athlete_id", athleteIds)
            .eq("status", "completed")
            .gte("completed_at", startDate.toISOString());

          const volumeMap = new Map<string, number>();
          volumeData?.forEach((session) => {
            const current = volumeMap.get(session.athlete_id) || 0;
            volumeMap.set(
              session.athlete_id,
              current + (session.total_volume || 0)
            );
          });

          rankings = Array.from(volumeMap.entries()).map(
            ([athleteId, volume]) => {
              const member = groupMembers.find(
                (m) => m.athlete_id === athleteId
              );
              const profile = member?.profiles
                ? Array.isArray(member.profiles)
                  ? member.profiles[0]
                  : member.profiles
                : null;
              return {
                athleteId,
                athleteName: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
                value: volume,
                rank: 0, // Will be set after sorting
              };
            }
          );
          break;

        case "streak":
          const { data: streakData } = await supabase
            .from("athlete_kpis")
            .select("athlete_id, current_streak")
            .in("athlete_id", athleteIds);

          rankings = (streakData || []).map((kpi) => {
            const member = groupMembers.find(
              (m) => m.athlete_id === kpi.athlete_id
            );
            const profile = member?.profiles
              ? Array.isArray(member.profiles)
                ? member.profiles[0]
                : member.profiles
              : null;
            return {
              athleteId: kpi.athlete_id,
              athleteName: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
              value: kpi.current_streak || 0,
              rank: 0,
            };
          });
          break;

        case "pr_count":
          const { data: prData } = await supabase
            .from("set_records")
            .select("athlete_id")
            .in("athlete_id", athleteIds)
            .eq("is_pr", true)
            .gte("created_at", startDate.toISOString());

          const prMap = new Map<string, number>();
          prData?.forEach((pr) => {
            const current = prMap.get(pr.athlete_id) || 0;
            prMap.set(pr.athlete_id, current + 1);
          });

          rankings = Array.from(prMap.entries()).map(([athleteId, count]) => {
            const member = groupMembers.find((m) => m.athlete_id === athleteId);
            const profile = member?.profiles
              ? Array.isArray(member.profiles)
                ? member.profiles[0]
                : member.profiles
              : null;
            return {
              athleteId,
              athleteName: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
              value: count,
              rank: 0,
            };
          });
          break;

        case "workout_count":
          const { data: workoutData } = await supabase
            .from("workout_sessions")
            .select("athlete_id")
            .in("athlete_id", athleteIds)
            .eq("status", "completed")
            .gte("completed_at", startDate.toISOString());

          const workoutMap = new Map<string, number>();
          workoutData?.forEach((session) => {
            const current = workoutMap.get(session.athlete_id) || 0;
            workoutMap.set(session.athlete_id, current + 1);
          });

          rankings = Array.from(workoutMap.entries()).map(
            ([athleteId, count]) => {
              const member = groupMembers.find(
                (m) => m.athlete_id === athleteId
              );
              const profile = member?.profiles
                ? Array.isArray(member.profiles)
                  ? member.profiles[0]
                  : member.profiles
                : null;
              return {
                athleteId,
                athleteName: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
                value: count,
                rank: 0,
              };
            }
          );
          break;
      }

      // Sort by value (descending) and assign ranks
      rankings.sort((a, b) => b.value - a.value);
      rankings.forEach((item, index) => {
        item.rank = index + 1;
      });

      return NextResponse.json({
        success: true,
        leaderboard: rankings,
        type: leaderboardType,
        period,
        groupId,
      });
    } catch (error) {
      console.error("Error in leaderboard GET endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
