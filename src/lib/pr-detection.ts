/**
 * PR (Personal Record) Detection Service
 *
 * Detects when an athlete achieves a personal record for:
 * - Weight lifted for a given rep range
 * - Total reps at a given weight
 * - Estimated 1RM improvements
 * - Volume PRs (sets x reps x weight)
 *
 * NOTE: PR detection temporarily disabled to avoid client-side database calls
 */

// import { createClient } from "@/lib/supabase-server";

export interface PRData {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  date: string;
}

export interface PRComparison {
  isPR: boolean;
  type: "weight" | "reps" | "1rm" | "volume" | null;
  improvement: number; // Percentage improvement
  previousBest: PRData | null;
  currentPerformance: {
    weight: number;
    reps: number;
    estimatedOneRM: number;
    volume: number;
  };
}

/**
 * Calculate estimated 1RM using Epley formula
 * Formula: weight × (1 + reps/30)
 */
export function calculateOneRM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate total volume (weight × reps)
 */
export function calculateVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Check if current set is a PR compared to athlete's history
 * TEMPORARILY DISABLED - Returns false to avoid client-side database calls
 */
export async function checkForPR(
  athleteId: string,
  exerciseId: string,
  weight: number,
  reps: number
): Promise<PRComparison> {
  // Temporarily disabled - return no PR
  return {
    isPR: false,
    type: null,
    improvement: 0,
    previousBest: null,
    currentPerformance: {
      weight,
      reps,
      estimatedOneRM: calculateOneRM(weight, reps),
      volume: calculateVolume(weight, reps),
    },
  };

  /* Database PR detection logic - disabled for now
  const supabase = await createClient();

  try {
    // Get athlete's previous best for this exercise
    const { data: previousSets, error } = await supabase
      .from("set_records")
      .select(
        `
        weight_used,
        reps_completed,
        completed_at,
        session_exercises!inner(
          exercise_id,
          exercises(name)
        ),
        workout_sessions!inner(
          athlete_id
        )
      `
      )
      .eq("workout_sessions.athlete_id", athleteId)
      .eq("session_exercises.exercise_id", exerciseId)
      .not("weight_used", "is", null)
      .order("completed_at", { ascending: false })
      .limit(100); // Look at last 100 sets

    if (error || !previousSets || previousSets.length === 0) {
      // First time doing this exercise - it's a PR by default!
      return {
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
      };
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
      const setWeight = set.weight_used || 0;
      const setReps = set.reps_completed;
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
          date: set.completed_at,
        };
      }

      if (setWeight > bestWeight) bestWeight = setWeight;
      if (setReps > bestReps) bestReps = setReps;
      if (setVolume > bestVolume) bestVolume = setVolume;
    });

    // Check for PR types
    if (currentOneRM > bestOneRM) {
      const improvement = ((currentOneRM - bestOneRM) / bestOneRM) * 100;
      return {
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
      };
    }

    if (weight > bestWeight) {
      const improvement = ((weight - bestWeight) / bestWeight) * 100;
      return {
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
      };
    }

    if (reps > bestReps && weight >= bestWeight * 0.9) {
      // Rep PR at similar weight (within 90%)
      const improvement = ((reps - bestReps) / bestReps) * 100;
      return {
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
      };
    }

    if (currentVolume > bestVolume) {
      const improvement = ((currentVolume - bestVolume) / bestVolume) * 100;
      return {
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
      };
    }

    // Not a PR
    return {
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
    };
  } catch (error) {
    console.error("Error checking for PR:", error);
    // On error, don't show PR to avoid false positives
    return {
      isPR: false,
      type: null,
      improvement: 0,
      previousBest: null,
      currentPerformance: {
        weight,
        reps,
        estimatedOneRM: calculateOneRM(weight, reps),
        volume: calculateVolume(weight, reps),
      },
    };
  }
  */
}

/**
 * Get PR badge color based on improvement percentage
 */
export function getPRBadgeColor(improvement: number): string {
  if (improvement >= 20) return "text-purple-600 bg-purple-100";
  if (improvement >= 10) return "text-yellow-600 bg-yellow-100";
  if (improvement >= 5) return "text-blue-600 bg-blue-100";
  return "text-green-600 bg-green-100";
}

/**
 * Format PR message for display
 */
export function formatPRMessage(comparison: PRComparison): string {
  if (!comparison.isPR) return "";

  const { type, improvement, currentPerformance } = comparison;

  switch (type) {
    case "1rm":
      return `New 1RM PR! Est. ${currentPerformance.estimatedOneRM}lbs (${improvement.toFixed(1)}% increase)`;
    case "weight":
      return `Weight PR! ${currentPerformance.weight}lbs x ${currentPerformance.reps} (${improvement.toFixed(1)}% heavier)`;
    case "reps":
      return `Rep PR! ${currentPerformance.reps} reps at ${currentPerformance.weight}lbs (${improvement.toFixed(1)}% more reps)`;
    case "volume":
      return `Volume PR! ${currentPerformance.volume}lbs total (${improvement.toFixed(1)}% more volume)`;
    default:
      return "Personal Record!";
  }
}
