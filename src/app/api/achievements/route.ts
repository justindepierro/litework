import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { getAdminClient, isCoach } from "@/lib/auth-server";
import { ACHIEVEMENTS, type AchievementType } from "@/lib/achievement-system";

/**
 * Get Achievements API
 * GET /api/achievements?athleteId=<uuid> - Get achievements for specific athlete (coaches only)
 * GET /api/achievements - Get current user's achievements
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId");

      // Determine target user
      let targetUserId = user.id;
      if (athleteId) {
        // Only coaches can view other athletes' achievements
        if (!isCoach(user)) {
          return NextResponse.json(
            { error: "Only coaches can view other athletes' achievements" },
            { status: 403 }
          );
        }
        targetUserId = athleteId;
      }

      const supabase = getAdminClient();

      // Fetch earned achievements
      const { data: earnedAchievements, error } = await supabase
        .from("athlete_achievements")
        .select("id, athlete_id, achievement_type, earned_at")
        .eq("athlete_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (error) {
        console.error("[Achievements] Error fetching achievements:", error);
        return NextResponse.json(
          { error: "Failed to fetch achievements" },
          { status: 500 }
        );
      }

      // Combine with achievement definitions
      const achievements = (earnedAchievements || []).map((earned) => {
        const achievementType = earned.achievement_type as AchievementType;
        return {
          id: earned.id,
          earned_at: earned.earned_at,
          ...ACHIEVEMENTS[achievementType],
        };
      });

      // Get all achievement types for progress tracking
      const allTypes = Object.keys(ACHIEVEMENTS) as AchievementType[];
      const earnedTypes = new Set(
        earnedAchievements?.map((a) => a.achievement_type) || []
      );
      const locked = allTypes
        .filter((type) => !earnedTypes.has(type))
        .map((type) => ACHIEVEMENTS[type]);

      return NextResponse.json({
        earned: achievements,
        locked,
        totalEarned: achievements.length,
        totalPossible: allTypes.length,
      });
    } catch (error) {
      console.error("[Achievements] API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch achievements" },
        { status: 500 }
      );
    }
  });
}
