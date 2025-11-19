/**
 * Achievement Badge System
 *
 * Tracks and awards badges for workout milestones
 * - Workout streaks (3, 7, 30 days)
 * - Volume milestones (10K, 50K, 100K lbs)
 * - Set milestones (100th, 500th, 1000th set)
 * - First achievements (first workout, first PR)
 */

import { createClient } from "@/lib/supabase-server";

export type AchievementType =
  | "first_workout"
  | "first_pr"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "volume_10k"
  | "volume_50k"
  | "volume_100k"
  | "sets_100"
  | "sets_500"
  | "sets_1000";

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at?: string;
}

// Achievement definitions
export const ACHIEVEMENTS: Record<
  AchievementType,
  Omit<Achievement, "id" | "earned_at">
> = {
  first_workout: {
    type: "first_workout",
    name: "First Workout",
    description: "Completed your first workout session",
    icon: "Target",
    color: "bg-blue-500",
  },
  first_pr: {
    type: "first_pr",
    name: "First PR",
    description: "Achieved your first personal record",
    icon: "Trophy",
    color: "bg-warning",
  },
  streak_3: {
    type: "streak_3",
    name: "3-Day Streak",
    description: "Worked out for 3 consecutive days",
    icon: "Flame",
    color: "bg-warning",
  },
  streak_7: {
    type: "streak_7",
    name: "Week Warrior",
    description: "Worked out for 7 consecutive days",
    icon: "Zap",
    color: "bg-warning",
  },
  streak_30: {
    type: "streak_30",
    name: "Monthly Champion",
    description: "Worked out for 30 consecutive days",
    icon: "Crown",
    color: "bg-accent",
  },
  volume_10k: {
    type: "volume_10k",
    name: "10K Club",
    description: "Lifted 10,000 total pounds",
    icon: "Dumbbell",
    color: "bg-success",
  },
  volume_50k: {
    type: "volume_50k",
    name: "50K Club",
    description: "Lifted 50,000 total pounds",
    icon: "Dumbbell",
    color: "bg-success",
  },
  volume_100k: {
    type: "volume_100k",
    name: "100K Club",
    description: "Lifted 100,000 total pounds",
    icon: "Dumbbell",
    color: "bg-success",
  },
  sets_100: {
    type: "sets_100",
    name: "Century Mark",
    description: "Completed 100 total sets",
    icon: "BarChart3",
    color: "bg-info",
  },
  sets_500: {
    type: "sets_500",
    name: "500 Club",
    description: "Completed 500 total sets",
    icon: "BarChart3",
    color: "bg-info",
  },
  sets_1000: {
    type: "sets_1000",
    name: "Thousand Strong",
    description: "Completed 1,000 total sets",
    icon: "BarChart3",
    color: "bg-info",
  },
};

/**
 * Check if user has earned a specific achievement
 */
export async function hasAchievement(
  userId: string,
  achievementType: AchievementType
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("athlete_achievements")
    .select("id")
    .eq("athlete_id", userId)
    .eq("achievement_type", achievementType)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Achievements] Error checking achievement:", error);
    return false;
  }

  return !!data;
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(
  userId: string,
  achievementType: AchievementType
): Promise<Achievement | null> {
  // Check if already earned
  const alreadyEarned = await hasAchievement(userId, achievementType);
  if (alreadyEarned) {
    return null;
  }

  const supabase = await createClient();

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
    console.error("[Achievements] Error awarding achievement:", error);
    return null;
  }

  const achievementDef = ACHIEVEMENTS[achievementType];
  return {
    id: data.id,
    ...achievementDef,
    earned_at: data.earned_at,
  };
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(
  userId: string
): Promise<Achievement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("athlete_achievements")
    .select("*")
    .eq("athlete_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("[Achievements] Error fetching achievements:", error);
    return [];
  }

  return data.map((record) => ({
    id: record.id,
    ...ACHIEVEMENTS[record.achievement_type as AchievementType],
    earned_at: record.earned_at,
  }));
}

/**
 * Calculate current workout streak for a user
 */
export async function calculateStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  // Get all completed workout sessions, ordered by date
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("completed_at")
    .eq("athlete_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's a workout today or yesterday
  const lastWorkout = new Date(data[0].completed_at);
  lastWorkout.setHours(0, 0, 0, 0);

  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastWorkout > 1) {
    // Streak is broken
    return 0;
  }

  // Count consecutive days
  const workoutDates = new Set(
    data.map((session) => {
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

/**
 * Calculate total volume lifted by a user (in pounds)
 */
export async function calculateTotalVolume(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("set_records")
    .select(
      "weight, reps, session_exercises!inner(workout_sessions!inner(athlete_id))"
    )
    .eq("session_exercises.workout_sessions.athlete_id", userId);

  if (error || !data) {
    console.error("[Achievements] Error calculating volume:", error);
    return 0;
  }

  let totalVolume = 0;
  for (const set of data) {
    if (set.weight && set.reps) {
      totalVolume += set.weight * set.reps;
    }
  }

  return totalVolume;
}

/**
 * Count total sets completed by a user
 */
export async function countTotalSets(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("set_records")
    .select("*", { count: "exact", head: true })
    .eq("session_exercises.workout_sessions.athlete_id", userId);

  if (error) {
    console.error("[Achievements] Error counting sets:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Check and award achievements after a workout session
 */
export async function checkSessionAchievements(
  userId: string
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  // Check for first workout
  const supabase = await createClient();
  const { count: sessionCount } = await supabase
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("athlete_id", userId)
    .eq("status", "completed");

  if (sessionCount === 1) {
    const achievement = await awardAchievement(userId, "first_workout");
    if (achievement) newAchievements.push(achievement);
  }

  // Check for streak achievements
  const streak = await calculateStreak(userId);
  if (streak >= 3 && !(await hasAchievement(userId, "streak_3"))) {
    const achievement = await awardAchievement(userId, "streak_3");
    if (achievement) newAchievements.push(achievement);
  }
  if (streak >= 7 && !(await hasAchievement(userId, "streak_7"))) {
    const achievement = await awardAchievement(userId, "streak_7");
    if (achievement) newAchievements.push(achievement);
  }
  if (streak >= 30 && !(await hasAchievement(userId, "streak_30"))) {
    const achievement = await awardAchievement(userId, "streak_30");
    if (achievement) newAchievements.push(achievement);
  }

  // Check for volume achievements
  const totalVolume = await calculateTotalVolume(userId);
  if (totalVolume >= 10000 && !(await hasAchievement(userId, "volume_10k"))) {
    const achievement = await awardAchievement(userId, "volume_10k");
    if (achievement) newAchievements.push(achievement);
  }
  if (totalVolume >= 50000 && !(await hasAchievement(userId, "volume_50k"))) {
    const achievement = await awardAchievement(userId, "volume_50k");
    if (achievement) newAchievements.push(achievement);
  }
  if (totalVolume >= 100000 && !(await hasAchievement(userId, "volume_100k"))) {
    const achievement = await awardAchievement(userId, "volume_100k");
    if (achievement) newAchievements.push(achievement);
  }

  // Check for set count achievements
  const totalSets = await countTotalSets(userId);
  if (totalSets >= 100 && !(await hasAchievement(userId, "sets_100"))) {
    const achievement = await awardAchievement(userId, "sets_100");
    if (achievement) newAchievements.push(achievement);
  }
  if (totalSets >= 500 && !(await hasAchievement(userId, "sets_500"))) {
    const achievement = await awardAchievement(userId, "sets_500");
    if (achievement) newAchievements.push(achievement);
  }
  if (totalSets >= 1000 && !(await hasAchievement(userId, "sets_1000"))) {
    const achievement = await awardAchievement(userId, "sets_1000");
    if (achievement) newAchievements.push(achievement);
  }

  return newAchievements;
}

/**
 * Award first PR achievement
 */
export async function awardFirstPR(
  userId: string
): Promise<Achievement | null> {
  return awardAchievement(userId, "first_pr");
}
