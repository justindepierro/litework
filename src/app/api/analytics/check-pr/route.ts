import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { getAdminClient } from "@/lib/auth-server";
import {
  calculateOneRM,
  calculateVolume,
  type PRData,
} from "@/lib/pr-detection";

/**
 * Check for Personal Records (PRs)
 * POST /api/analytics/check-pr
 *
 * Body: { exerciseId: string, weight: number, reps: number }
 * Returns: PRComparison object with isPR flag and details
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { exerciseId, weight, reps } = body;

      // Validate inputs
      if (
        !exerciseId ||
        typeof weight !== "number" ||
        typeof reps !== "number"
      ) {
        return NextResponse.json(
          {
            error:
              "Missing or invalid parameters: exerciseId, weight, reps required",
          },
          { status: 400 }
        );
      }

      if (weight <= 0 || reps <= 0) {
        return NextResponse.json(
          { error: "Weight and reps must be positive numbers" },
          { status: 400 }
        );
      }

      const supabase = getAdminClient();
      const athleteId = user.id;

      // Get athlete's previous best for this exercise
      const { data: previousSets, error } = await supabase
        .from("set_records")
        .select(
          `
          weight,
          reps,
          created_at,
          session_exercises!inner(
            exercise_id,
            exercises(name)
          ),
          workout_sessions!inner(
            user_id
          )
        `
        )
        .eq("workout_sessions.user_id", athleteId)
        .eq("session_exercises.exercise_id", exerciseId)
        .not("weight", "is", null)
        .not("reps", "is", null)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(100); // Look at last 100 sets

      if (error) {
        console.error("Error fetching previous sets:", error);
        return NextResponse.json(
          { error: "Failed to fetch PR history" },
          { status: 500 }
        );
      }

      // First time doing this exercise - it's a PR by default!
      if (!previousSets || previousSets.length === 0) {
        return NextResponse.json({
          isPR: true,
          type: "1rm",
          improvement: 100,
          previousBest: null,
          currentPerformance: {
            weight,
            reps,
            estimatedOneRM: calculateOneRM(weight, reps),
            volume: calculateVolume(weight, reps),
          },
        });
      }

      // Calculate current performance
      const currentOneRM = calculateOneRM(weight, reps);
      const currentVolume = calculateVolume(weight, reps);

      // Find best previous performances
      let bestOneRM = 0;
      let bestWeight = 0;
      let bestReps = 0;
      let bestVolume = 0;
      let bestOneRMSet: PRData | null = null;

      previousSets.forEach((set) => {
        const setWeight = set.weight || 0;
        const setReps = set.reps || 0;
        const setOneRM = calculateOneRM(setWeight, setReps);
        const setVolume = calculateVolume(setWeight, setReps);

        if (setOneRM > bestOneRM) {
          bestOneRM = setOneRM;
          const sessionExercise = set.session_exercises as unknown as {
            exercises: { name: string };
          };
          bestOneRMSet = {
            exerciseId,
            exerciseName: sessionExercise?.exercises?.name || "Unknown",
            weight: setWeight,
            reps: setReps,
            estimatedOneRM: setOneRM,
            date: set.created_at,
          };
        }

        if (setWeight > bestWeight) bestWeight = setWeight;
        if (setReps > bestReps) bestReps = setReps;
        if (setVolume > bestVolume) bestVolume = setVolume;
      });

      // Check for PR types
      if (currentOneRM > bestOneRM) {
        const improvement = ((currentOneRM - bestOneRM) / bestOneRM) * 100;
        return NextResponse.json({
          isPR: true,
          type: "1rm",
          improvement,
          previousBest: bestOneRMSet,
          currentPerformance: {
            weight,
            reps,
            estimatedOneRM: currentOneRM,
            volume: currentVolume,
          },
        });
      }

      if (weight > bestWeight) {
        const improvement = ((weight - bestWeight) / bestWeight) * 100;
        return NextResponse.json({
          isPR: true,
          type: "weight",
          improvement,
          previousBest: bestOneRMSet,
          currentPerformance: {
            weight,
            reps,
            estimatedOneRM: currentOneRM,
            volume: currentVolume,
          },
        });
      }

      if (reps > bestReps && weight >= bestWeight * 0.9) {
        // Rep PR at similar weight (within 90%)
        const improvement = ((reps - bestReps) / bestReps) * 100;
        return NextResponse.json({
          isPR: true,
          type: "reps",
          improvement,
          previousBest: bestOneRMSet,
          currentPerformance: {
            weight,
            reps,
            estimatedOneRM: currentOneRM,
            volume: currentVolume,
          },
        });
      }

      if (currentVolume > bestVolume) {
        const improvement = ((currentVolume - bestVolume) / bestVolume) * 100;
        return NextResponse.json({
          isPR: true,
          type: "volume",
          improvement,
          previousBest: bestOneRMSet,
          currentPerformance: {
            weight,
            reps,
            estimatedOneRM: currentOneRM,
            volume: currentVolume,
          },
        });
      }

      // Not a PR
      return NextResponse.json({
        isPR: false,
        type: null,
        improvement: 0,
        previousBest: bestOneRMSet,
        currentPerformance: {
          weight,
          reps,
          estimatedOneRM: currentOneRM,
          volume: currentVolume,
        },
      });
    } catch (error) {
      console.error("Error checking for PR:", error);
      return NextResponse.json(
        { error: "Failed to check for PR" },
        { status: 500 }
      );
    }
  });
}
