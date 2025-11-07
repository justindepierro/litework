import { NextRequest, NextResponse } from "next/server";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";
import {
  getAuthenticatedUser,
  getAdminClient,
  isCoach,
  isAdmin,
} from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athleteId");
    const timeframe =
      (searchParams.get("timeframe") as "1m" | "3m" | "6m" | "1y") || "3m";
    const type =
      (searchParams.get("type") as
        | "overview"
        | "strength"
        | "volume"
        | "consistency") || "overview";

    // supabase is already imported

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Base query conditions
    let targetUserId = user?.id;

    // If athleteId is specified and user is coach/admin, analyze that athlete
    if (athleteId && user && isCoach(user)) {
      // Verify coach has access to this athlete
      const { data: athlete } = await supabase
        .from("users")
        .select("id, coach_id")
        .eq("id", athleteId)
        .single();

      if (!athlete || (athlete.coach_id !== user?.id && !isAdmin(user))) {
        return NextResponse.json(
          { error: "Access denied to athlete data" },
          { status: 403 }
        );
      }

      targetUserId = athleteId;
    }

    const analyticsData: Record<string, unknown> = {};

    if (type === "overview" || type === "strength") {
      // Get workout sessions and progress data
      const { data: workoutSessions } = await supabase
        .from("workout_sessions")
        .select(
          `
          id,
          started_at,
          completed_at,
          total_sets,
          total_volume,
          workout_exercises (
            exercise_id,
            sets_completed,
            target_weight,
            target_reps,
            workout_exercise_sets (
              weight_used,
              reps_completed
            )
          )
        `
        )
        .eq("user_id", targetUserId)
        .gte("started_at", startDate.toISOString())
        .order("started_at", { ascending: true });

      // Get personal records (KPIs)
      const { data: personalRecords } = await supabase
        .from("athlete_kpis")
        .select("*")
        .eq("athlete_id", targetUserId)
        .eq("is_active", true);

      // Process overview statistics
      if (type === "overview") {
        const totalWorkouts = workoutSessions?.length || 0;
        const totalDays = Math.max(
          1,
          Math.ceil(
            (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        const weeksInPeriod = Math.max(1, Math.ceil(totalDays / 7));

        // Calculate workout frequency data
        const workoutsByWeek = new Map<string, number>();
        workoutSessions?.forEach(
          (session: {
            started_at: string;
            total_volume?: number;
            workout_exercises?: Record<string, unknown>[];
          }) => {
            const sessionDate = new Date(session.started_at);
            const weekStart = new Date(sessionDate);
            weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
            const weekKey = weekStart.toISOString().split("T")[0];
            workoutsByWeek.set(weekKey, (workoutsByWeek.get(weekKey) || 0) + 1);
          }
        );

        const workoutFrequency = Array.from(workoutsByWeek.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, workouts], index) => ({
            week: `Week ${index + 1}`,
            workouts,
            goal: 3, // Default goal of 3 workouts per week
          }));

        // Calculate consistency score
        const goalWorkoutsPerWeek = 3;
        const actualWorkoutsPerWeek = totalWorkouts / weeksInPeriod;
        const consistencyScore = Math.min(
          100,
          (actualWorkoutsPerWeek / goalWorkoutsPerWeek) * 100
        );

        // Calculate total volume trend
        const totalVolume =
          workoutSessions?.reduce(
            (sum, session) => sum + (session.total_volume || 0),
            0
          ) || 0;

        analyticsData.overview = {
          totalWorkouts,
          avgWorkoutsPerWeek: Math.round(actualWorkoutsPerWeek * 10) / 10,
          consistencyScore: Math.round(consistencyScore),
          totalVolume: Math.round(totalVolume),
          workoutFrequency,
          personalRecords: personalRecords?.length || 0,
        };
      }

      // Process strength progression data
      if (type === "strength") {
        const strengthProgress = new Map<string, Record<string, unknown>[]>();

        workoutSessions?.forEach((session) => {
          session.workout_exercises?.forEach((exercise) => {
            const exerciseId = exercise.exercise_id;
            if (!strengthProgress.has(exerciseId)) {
              strengthProgress.set(exerciseId, []);
            }

            // Calculate max weight for this session
            const maxWeight =
              exercise.workout_exercise_sets?.reduce(
                (max, set) => Math.max(max, set.weight_used || 0),
                0
              ) || 0;

            // Estimate 1RM using Epley formula: weight * (1 + reps/30)
            const maxReps =
              exercise.workout_exercise_sets?.reduce(
                (max, set) => Math.max(max, set.reps_completed || 0),
                0
              ) || 1;
            const estimated1RM = maxWeight * (1 + maxReps / 30);

            strengthProgress.get(exerciseId)!.push({
              date: session.started_at,
              weight: maxWeight,
              reps: maxReps,
              estimated1RM: Math.round(estimated1RM),
              volume:
                exercise.workout_exercise_sets?.reduce(
                  (sum, set) =>
                    sum + (set.weight_used || 0) * (set.reps_completed || 0),
                  0
                ) || 0,
            });
          });
        });

        // Convert to array format and get exercise names
        const { data: exercises } = await supabase
          .from("exercises")
          .select("id, name")
          .in("id", Array.from(strengthProgress.keys()));

        const exerciseMap = new Map(
          exercises?.map((ex) => [ex.id, ex.name]) || []
        );

        analyticsData.strength = Array.from(strengthProgress.entries()).map(
          ([exerciseId, data]) => ({
            exerciseId,
            exerciseName:
              exerciseMap.get(exerciseId) || `Exercise ${exerciseId}`,
            data: data.sort(
              (a, b) =>
                new Date((a as { date: string }).date).getTime() -
                new Date((b as { date: string }).date).getTime()
            ),
          })
        );
      }
    }

    if (type === "volume") {
      // Get volume analytics from progress_analytics table
      const { data: volumeAnalytics } = await supabase
        .from("progress_analytics")
        .select("*")
        .eq("user_id", targetUserId)
        .gte("period_start", startDate.toISOString().split("T")[0])
        .order("period_start", { ascending: true });

      analyticsData.volume =
        volumeAnalytics?.map((period) => ({
          period: period.period_start,
          totalVolume: period.total_volume,
          totalSets: period.total_sets,
          avgVolume: Math.round(
            (period.total_volume || 0) / Math.max(1, period.total_workouts)
          ),
        })) || [];
    }

    if (type === "consistency") {
      // Get activity log for consistency analysis
      const { data: activityLog } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("action_type", "workout_completed")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      // Calculate streaks and consistency patterns
      const workoutDates =
        activityLog?.map((log) => new Date(log.created_at).toDateString()) ||
        [];
      const uniqueWorkoutDates = [...new Set(workoutDates)];

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();

        if (uniqueWorkoutDates.includes(dateString)) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }

      analyticsData.consistency = {
        currentStreak,
        longestStreak: Math.max(longestStreak, tempStreak),
        workoutDates: uniqueWorkoutDates,
        avgWorkoutsPerWeek:
          uniqueWorkoutDates.length /
          Math.max(
            1,
            Math.ceil(
              (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
            )
          ),
      };
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint for generating analytics reports
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
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { athleteIds, reportType, timeframe } = body;

    const supabase = getAdminClient();

    // Generate bulk analytics report
    const reportData = await Promise.all(
      athleteIds.map(async (athleteId: string) => {
        // Verify access to athlete
        const { data: athlete } = await supabase
          .from("users")
          .select("id, first_name, last_name, coach_id")
          .eq("id", athleteId)
          .single();

        if (
          !athlete ||
          (athlete.coach_id !== user.id && user.role !== "admin")
        ) {
          return null;
        }

        // Get basic analytics for each athlete
        const startDate = new Date();
        switch (timeframe) {
          case "1m":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "3m":
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case "6m":
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case "1y":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }

        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("id, total_volume, started_at")
          .eq("user_id", athleteId)
          .gte("started_at", startDate.toISOString());

        interface SessionData {
          total_volume?: number;
        }

        return {
          athleteId,
          athleteName: `${athlete.first_name} ${athlete.last_name}`,
          totalWorkouts: sessions?.length || 0,
          totalVolume:
            sessions?.reduce(
              (sum: number, s: SessionData) => sum + (s.total_volume || 0),
              0
            ) || 0,
          avgVolume: sessions?.length
            ? Math.round(
                sessions.reduce(
                  (sum: number, s: SessionData) => sum + (s.total_volume || 0),
                  0
                ) / sessions.length
              )
            : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        timeframe,
        athletes: reportData.filter(Boolean),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
