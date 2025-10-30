import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canAssignWorkouts, canViewAllAthletes } from "@/lib/auth";
import { WorkoutPlan } from "@/types";

// Mock workout plans database
const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    description: "Focus on bench press, rows, and shoulder development",
    exercises: [
      {
        id: "1",
        exerciseId: "bench-press",
        exerciseName: "Bench Press",
        sets: 3,
        reps: 8,
        weightType: "percentage",
        percentage: 80,
        restTime: 180,
        order: 1,
      },
      {
        id: "2",
        exerciseId: "bent-row",
        exerciseName: "Bent Over Row",
        sets: 3,
        reps: 8,
        weightType: "percentage",
        percentage: 75,
        restTime: 150,
        order: 2,
      },
      {
        id: "3",
        exerciseId: "shoulder-press",
        exerciseName: "Overhead Press",
        sets: 3,
        reps: 10,
        weightType: "percentage",
        percentage: 70,
        restTime: 120,
        order: 3,
      },
    ],
    estimatedDuration: 45,
    targetGroupId: "1",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Lower Body Power",
    description: "Explosive leg development with squats and deadlifts",
    exercises: [
      {
        id: "4",
        exerciseId: "squat",
        exerciseName: "Back Squat",
        sets: 5,
        reps: 5,
        weightType: "percentage",
        percentage: 85,
        restTime: 240,
        order: 1,
      },
      {
        id: "5",
        exerciseId: "deadlift",
        exerciseName: "Deadlift",
        sets: 3,
        reps: 5,
        weightType: "percentage",
        percentage: 80,
        restTime: 300,
        order: 2,
      },
    ],
    estimatedDuration: 60,
    targetGroupId: "1",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Volleyball Conditioning",
    description: "Sport-specific training for volleyball players",
    exercises: [
      {
        id: "6",
        exerciseId: "jump-squat",
        exerciseName: "Jump Squats",
        sets: 4,
        reps: 8,
        weightType: "bodyweight",
        restTime: 90,
        order: 1,
      },
      {
        id: "7",
        exerciseId: "push-up",
        exerciseName: "Push-ups",
        sets: 3,
        reps: 12,
        weightType: "bodyweight",
        restTime: 60,
        order: 2,
      },
    ],
    estimatedDuration: 30,
    targetGroupId: "3",
    createdBy: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/workouts - Get workout plans
export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Coaches see all workouts, athletes see workouts for their groups
    if (canViewAllAthletes(auth.user)) {
      return NextResponse.json({
        success: true,
        workouts: mockWorkoutPlans,
      });
    } else {
      // For athletes, filter by target groups they belong to
      // This would require cross-referencing with user's groups
      return NextResponse.json({
        success: true,
        workouts: mockWorkoutPlans, // For now, return all
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
    const auth = verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    if (!canAssignWorkouts(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { name, description, exercises, estimatedDuration, targetGroupId } =
      await request.json();

    if (!name || !exercises || !Array.isArray(exercises)) {
      return NextResponse.json(
        { error: "Name and exercises are required" },
        { status: 400 }
      );
    }

    const newWorkout: WorkoutPlan = {
      id: `workout-${Date.now()}`,
      name,
      description,
      exercises: exercises.map((ex, index: number) => ({
        ...ex,
        id: `ex-${Date.now()}-${index}`,
        order: index + 1,
      })),
      estimatedDuration: estimatedDuration || 60,
      targetGroupId,
      createdBy: auth.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to database
    mockWorkoutPlans.push(newWorkout);

    return NextResponse.json({
      success: true,
      workout: newWorkout,
    });
  } catch (error) {
    console.error("Workouts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
