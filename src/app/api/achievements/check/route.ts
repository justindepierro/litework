/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { getAdminClient } from "@/lib/auth-server";
import { ACHIEVEMENTS, type AchievementType } from "@/lib/achievement-system";

/**
 * Check and Award Achievements API
 * POST /api/achievements/check
 *
 * Checks if user has earned new achievements after completing a workout
 * Body: { userId?: string } - Optional: for service/admin use
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const targetUserId = body.userId || user.id;

      // Only allow checking own achievements unless admin
      if (targetUserId !== user.id && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const supabase = getAdminClient();
      const newAchievements: Array<{
        id: string;
        type: AchievementType;
        earned_at: string;
      }> = [];

      // Check for first workout
      const { count: sessionCount } = await supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId)
        .eq("status", "completed");

      if (sessionCount === 1) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "first_workout"
        );
        if (earned) newAchievements.push(earned);
      }

      // Check for streak achievements
      const streak = await calculateStreak(supabase, targetUserId);
      if (streak >= 3) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "streak_3"
        );
        if (earned) newAchievements.push(earned);
      }
      if (streak >= 7) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "streak_7"
        );
        if (earned) newAchievements.push(earned);
      }
      if (streak >= 30) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "streak_30"
        );
        if (earned) newAchievements.push(earned);
      }

      // Check for volume achievements
      const totalVolume = await calculateTotalVolume(supabase, targetUserId);
      if (totalVolume >= 10000) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "volume_10k"
        );
        if (earned) newAchievements.push(earned);
      }
      if (totalVolume >= 50000) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "volume_50k"
        );
        if (earned) newAchievements.push(earned);
      }
      if (totalVolume >= 100000) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "volume_100k"
        );
        if (earned) newAchievements.push(earned);
      }

      // Check for set count achievements
      const totalSets = await countTotalSets(supabase, targetUserId);
      if (totalSets >= 100) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "sets_100"
        );
        if (earned) newAchievements.push(earned);
      }
      if (totalSets >= 500) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "sets_500"
        );
        if (earned) newAchievements.push(earned);
      }
      if (totalSets >= 1000) {
        const earned = await awardAchievement(
          supabase,
          targetUserId,
          "sets_1000"
        );
        if (earned) newAchievements.push(earned);
      }

      // Map to full achievement objects
      const achievements = newAchievements.map((earned) => ({
        id: earned.id,
        earned_at: earned.earned_at,
        ...ACHIEVEMENTS[earned.type],
      }));

      return NextResponse.json({
        newAchievements: achievements,
        count: achievements.length,
      });
    } catch (error) {
      console.error("[Achievements] Check error:", error);
      return NextResponse.json(
        { error: "Failed to check achievements" },
        { status: 500 }
      );
    }
  });
}

// Helper functions (server-side versions)

async function awardAchievement(
  supabase: any,
  userId: string,
  achievementType: AchievementType
): Promise<{ id: string; type: AchievementType; earned_at: string } | null> {
  // Check if already earned
  const { data: existing } = await supabase
    .from("athlete_achievements")
    .select("id")
    .eq("athlete_id", userId)
    .eq("achievement_type", achievementType)
    .single();

  if (existing) return null;

  // Award achievement
  const { data, error } = await supabase
    .from("athlete_achievements")
    .insert({
      athlete_id: userId,
      achievement_type: achievementType,
      earned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[Achievements] Award error:", error);
    return null;
  }

  return {
    id: data.id,
    type: achievementType,
    earned_at: data.earned_at,
  };
}

async function calculateStreak(supabase: any, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error || !data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkout = new Date(data[0].completed_at);
  lastWorkout.setHours(0, 0, 0, 0);

  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastWorkout > 1) return 0;

  const workoutDates = new Set(
    data.map((session: any) => {
      const date = new Date(session.completed_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  let currentDate = new Date(lastWorkout);
  while (workoutDates.has(currentDate.getTime())) {
    streak++;
    currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
  }

  return streak;
}

async function calculateTotalVolume(
  supabase: any,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("set_records")
    .select(
      "weight, reps, session_exercises!inner(workout_sessions!inner(user_id))"
    )
    .eq("session_exercises.workout_sessions.user_id", userId)
    .eq("completed", true);

  if (error || !data) return 0;

  return data.reduce((total: number, set: any) => {
    if (set.weight && set.reps) {
      return total + set.weight * set.reps;
    }
    return total;
  }, 0);
}

async function countTotalSets(supabase: any, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("set_records")
    .select("id, session_exercises!inner(workout_sessions!inner(user_id))", {
      count: "exact",
      head: true,
    })
    .eq("session_exercises.workout_sessions.user_id", userId)
    .eq("completed", true);

  if (error) return 0;
  return count || 0;
}
