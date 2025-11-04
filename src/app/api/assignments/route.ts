import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireCoach } from "@/lib/auth-server";
import { WorkoutAssignment } from "@/types";
import {
  getAllAssignments,
  createAssignment,
  getAssignmentsByAthlete,
} from "@/lib/database-service";
import { notifyWorkoutAssignment } from "@/lib/unified-notification-service";
import { createClient } from "@supabase/supabase-js";
import { cachedResponse } from "@/lib/api-cache-headers";

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

    return cachedResponse(
      {
        success: true,
        data: filteredAssignments,
      },
      30, // Cache for 30s (assignments change frequently)
      120 // Stale-while-revalidate for 2 minutes
    );
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

    // Send notifications to assigned athletes (async, don't wait)
    sendAssignmentNotifications(newAssignment, assignmentData).catch(
      (err: Error) => {
        console.error("Failed to send assignment notifications:", err);
        // Don't fail the request if notifications fail
      }
    );

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

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Send notifications to athletes when workout is assigned
 */
async function sendAssignmentNotifications(
  assignment: WorkoutAssignment,
  assignmentData: {
    athleteIds?: string[];
    athleteId?: string;
    workoutPlanName?: string;
    groupId?: string;
  }
): Promise<void> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get list of athlete IDs to notify
    const athleteIds =
      assignmentData.athleteIds ||
      (assignmentData.athleteId ? [assignmentData.athleteId] : []);

    if (athleteIds.length === 0) {
      console.log("No athletes to notify for assignment");
      return;
    }

    // Fetch athlete details from database
    const { data: athletes, error } = await supabase
      .from("users")
      .select("id, email, name")
      .in("id", athleteIds);

    if (error || !athletes || athletes.length === 0) {
      console.error("Failed to fetch athletes for notifications:", error);
      return;
    }

    // Format scheduled date
    const scheduledDate = new Date(assignment.scheduledDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    // Get workout name
    const workoutName = assignmentData.workoutPlanName || "New Workout";

    // Generate workout URL
    const workoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/workouts/view/${assignment.id}`;

    // Send notification to each athlete
    const notificationPromises = athletes.map((athlete) =>
      notifyWorkoutAssignment(
        {
          userId: athlete.id,
          email: athlete.email,
          name: athlete.name || "Athlete",
        },
        workoutName,
        scheduledDate,
        workoutUrl
      )
    );

    const results = await Promise.allSettled(notificationPromises);

    // Log results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(
      `✅ Sent ${successful} assignment notifications, ${failed} failed`
    );
  } catch (error) {
    console.error("Error in sendAssignmentNotifications:", error);
    throw error;
  }
}
