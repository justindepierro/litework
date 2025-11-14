import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import {
  getAllWorkoutPlans,
  createWorkoutPlanTransaction,
  updateWorkoutPlanTransaction,
} from "@/lib/database-service";
import { cachedResponse, CacheDurations } from "@/lib/api-cache-headers";
import {
  authenticationError,
} from "@/lib/api-errors";

// GET /api/workouts - Get workout plans
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return authenticationError(authError || undefined);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const onlyArchived = searchParams.get("onlyArchived") === "true";

    // Get all workout plans from database
    let allWorkoutPlans = await getAllWorkoutPlans();

    // Filter based on archived status
    if (onlyArchived) {
      allWorkoutPlans = allWorkoutPlans.filter((w) => w.archived === true);
    } else if (!includeArchived) {
      // By default, hide archived workouts
      allWorkoutPlans = allWorkoutPlans.filter((w) => w.archived !== true);
    }

    // Coaches/admins see all workouts, athletes see workouts for their groups
    if (isCoach(user)) {
      // Cache coach's workout list for 1 minute (workouts don't change very often)
      return cachedResponse(
        {
          success: true,
          data: { workouts: allWorkoutPlans },
        },
        CacheDurations.SHORT
      );
    } else {
      // For athletes, filter by target groups they belong to
      // This would require cross-referencing with user's groups
      return cachedResponse(
        {
          success: true,
          data: { workouts: allWorkoutPlans }, // For now, return all
        },
        CacheDurations.SHORT
      );
    }
  } catch (error) {
    console.error("Workouts GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Create new workout plan (coaches only)
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

    const {
      name,
      description,
      exercises,
      groups,
      blockInstances,
      estimatedDuration,
      targetGroupId,
    } = await request.json();

    if (!name || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "Workout name and exercises are required" },
        { status: 400 }
      );
    }

    // Validate each exercise has required fields
    const invalidExercise = exercises.find(
      (ex: {
        exerciseName?: string;
        sets?: number;
        reps?: number;
        weightType?: string;
      }) =>
        !ex.exerciseName ||
        typeof ex.exerciseName !== "string" ||
        ex.exerciseName.trim().length === 0 ||
        typeof ex.sets !== "number" ||
        ex.sets < 1 ||
        typeof ex.reps !== "number" ||
        ex.reps < 1 ||
        !ex.weightType ||
        !["fixed", "percentage", "bodyweight"].includes(ex.weightType)
    );

    if (invalidExercise) {
      return NextResponse.json(
        {
          error:
            "Invalid exercise data. Each exercise must have name, sets, reps, and valid weight type",
        },
        { status: 400 }
      );
    }

    // Create new workout plan in database (using transaction-safe function)
    const newWorkout = await createWorkoutPlanTransaction({
      name,
      description,
      exercises: exercises.map((ex, index: number) => ({
        ...ex,
        id: `ex-${Date.now()}-${index}`,
        order: index + 1,
      })),
      groups: groups || [], // Pass groups to database service
      blockInstances: blockInstances || [], // Pass block instances to database service
      estimatedDuration: estimatedDuration || 60,
      targetGroupId,
      createdBy: user.id,
    });

    if (!newWorkout) {
      return NextResponse.json(
        { error: "Failed to create workout plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { workout: newWorkout },
    });
  } catch (error) {
    console.error("Workouts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/workouts - Update existing workout plan (coaches only)
export async function PUT(request: NextRequest) {
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

    const {
      id,
      name,
      description,
      exercises,
      groups,
      blockInstances,
      estimatedDuration,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    if (!name || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "Workout name and exercises are required" },
        { status: 400 }
      );
    }

    // Validate each exercise has required fields
    const invalidExercise = exercises.find(
      (ex: {
        exerciseName?: string;
        sets?: number;
        reps?: number;
        weightType?: string;
      }) =>
        !ex.exerciseName ||
        typeof ex.exerciseName !== "string" ||
        ex.exerciseName.trim().length === 0 ||
        typeof ex.sets !== "number" ||
        ex.sets < 1 ||
        typeof ex.reps !== "number" ||
        ex.reps < 1 ||
        !ex.weightType ||
        !["fixed", "percentage", "bodyweight"].includes(ex.weightType)
    );

    if (invalidExercise) {
      return NextResponse.json(
        {
          error:
            "Invalid exercise data. Each exercise must have name, sets, reps, and valid weight type",
        },
        { status: 400 }
      );
    }

    // Update workout plan in database (using transaction-safe function)
    // [REMOVED] console.log("[PUT /api/workouts] Updating workout:", { id, name, description, estimatedDuration, hasExercises: exercises?.length > 0, hasGroups: groups?.length > 0, hasBlockInstances: blockInstances?.length > 0 });

    const updatedWorkout = await updateWorkoutPlanTransaction(id, {
      name,
      description,
      estimatedDuration: estimatedDuration || 60,
      exercises, // Fully handles exercises, groups, and block instances in transaction
      groups,
      blockInstances,
    });

    // [REMOVED] console.log("[PUT /api/workouts] Update result:", updatedWorkout);

    if (!updatedWorkout) {
      console.error(
        "[PUT /api/workouts] updateWorkoutPlan returned null for ID:",
        id
      );
      return NextResponse.json(
        {
          error: "Failed to update workout plan",
          details: "Database update operation failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { workout: updatedWorkout },
    });
  } catch (error) {
    console.error("Workouts PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
