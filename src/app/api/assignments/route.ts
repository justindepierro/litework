import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canAssignWorkouts, isAthlete } from "@/lib/auth";
import { WorkoutAssignment } from "@/types";

// Mock assignments database
const mockAssignments: WorkoutAssignment[] = [
  {
    id: "1",
    workoutPlanId: "1",
    workoutPlanName: "Upper Body Strength",
    assignmentType: "group",
    groupId: "1",
    athleteIds: ["2", "4"],
    assignedBy: "1",
    assignedDate: new Date(),
    scheduledDate: new Date(),
    startTime: "15:30",
    endTime: "16:30",
    status: "assigned",
    modifications: [],
    notes: "Focus on proper form",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/assignments - Get assignments
export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const athleteId = url.searchParams.get("athleteId");
    const groupId = url.searchParams.get("groupId");
    const date = url.searchParams.get("date");

    let filteredAssignments = mockAssignments;

    // Filter based on user role and query parameters
    if (isAthlete(auth.user)) {
      // Athletes only see their own assignments
      filteredAssignments = mockAssignments.filter(
        (assignment) =>
          assignment.athleteIds?.includes(auth.user!.userId) ||
          assignment.athleteId === auth.user!.userId
      );
    } else {
      // Coaches can filter by various parameters
      if (athleteId) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) =>
            assignment.athleteIds?.includes(athleteId) ||
            assignment.athleteId === athleteId
        );
      }

      if (groupId) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) => assignment.groupId === groupId
        );
      }
    }

    if (date) {
      const targetDate = new Date(date);
      filteredAssignments = filteredAssignments.filter(
        (assignment) =>
          assignment.scheduledDate.toDateString() === targetDate.toDateString()
      );
    }

    return NextResponse.json({
      success: true,
      assignments: filteredAssignments,
    });
  } catch (error) {
    console.error("Assignments GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create new assignment (coaches only)
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

    const assignmentData = await request.json();

    if (!assignmentData.workoutPlanId || !assignmentData.scheduledDate) {
      return NextResponse.json(
        { error: "Workout plan ID and scheduled date are required" },
        { status: 400 }
      );
    }

    const newAssignment: WorkoutAssignment = {
      id: `assignment-${Date.now()}`,
      ...assignmentData,
      assignedBy: auth.user.userId,
      assignedDate: new Date(),
      scheduledDate: new Date(assignmentData.scheduledDate),
      status: "assigned",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to database
    mockAssignments.push(newAssignment);

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Assignments POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
