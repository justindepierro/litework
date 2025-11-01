import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireCoach } from "@/lib/auth-server";
import { getAllWorkoutPlans, createWorkoutPlan } from "@/lib/database-service";

// GET /api/workouts - Get workout plans
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all workout plans from database
    const allWorkoutPlans = await getAllWorkoutPlans();

    // Coaches/admins see all workouts, athletes see workouts for their groups
    if (user.role === "coach" || user.role === "admin") {
      return NextResponse.json({
        success: true,
        data: { workouts: allWorkoutPlans },
      });
    } else {
      // For athletes, filter by target groups they belong to
      // This would require cross-referencing with user's groups
      return NextResponse.json({
        success: true,
        data: { workouts: allWorkoutPlans }, // For now, return all
      });
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
    const user = await requireCoach();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, description, exercises, estimatedDuration, targetGroupId } =
      await request.json();

    if (!name || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "Workout name and exercises are required" },
        { status: 400 }
      );
    }

    // Create new workout plan in database
    const newWorkout = await createWorkoutPlan({
      name,
      description,
      exercises: exercises.map((ex, index: number) => ({
        ...ex,
        id: `ex-${Date.now()}-${index}`,
        order: index + 1,
      })),
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
      data: newWorkout,
    });
  } catch (error) {
    console.error("Workouts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
