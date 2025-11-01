import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireCoach } from "@/lib/auth-server";
import { WorkoutAssignment } from "@/types";
import {
  getAllAssignments,
  createAssignment,
  getAssignmentsByAthlete,
} from "@/lib/database-service";

// GET /api/assignments - Get assignments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const athleteId = url.searchParams.get("athleteId");
    const groupId = url.searchParams.get("groupId");
    const date = url.searchParams.get("date");

    let filteredAssignments: WorkoutAssignment[] = [];

    // Filter based on user role and query parameters
    if (user.role === "athlete") {
      // Athletes only see their own assignments
      filteredAssignments = await getAssignmentsByAthlete(user.id);
    } else {
      // Coaches can see all assignments
      const allAssignments = await getAllAssignments();
      filteredAssignments = allAssignments;

      // Filter by specific athlete if requested
      if (athleteId) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) =>
            assignment.athleteIds?.includes(athleteId) ||
            assignment.athleteId === athleteId
        );
      }

      // Filter by group if requested
      if (groupId) {
        filteredAssignments = filteredAssignments.filter(
          (assignment) => assignment.groupId === groupId
        );
      }
    }

    // Filter by date if requested
    if (date) {
      const targetDate = new Date(date);
      filteredAssignments = filteredAssignments.filter((assignment) => {
        const scheduledDate = new Date(assignment.scheduledDate);
        return scheduledDate.toDateString() === targetDate.toDateString();
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments,
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
    const user = await requireCoach();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const assignmentData = await request.json();

    if (!assignmentData.workoutPlanId || !assignmentData.scheduledDate) {
      return NextResponse.json(
        { error: "Workout plan ID and scheduled date are required" },
        { status: 400 }
      );
    }

    // Create new assignment in database
    const newAssignment = await createAssignment({
      ...assignmentData,
      assignedBy: user.id,
      scheduledDate: new Date(assignmentData.scheduledDate),
      status: "assigned",
    });

    if (!newAssignment) {
      return NextResponse.json(
        { error: "Failed to create assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newAssignment,
    });
  } catch (error) {
    console.error("Assignments POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
