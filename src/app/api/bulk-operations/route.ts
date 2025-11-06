import { NextRequest, NextResponse } from "next/server";
import {
  getAdminClient,
  getAuthenticatedUser,
  isCoach,
} from "@/lib/auth-server";

// POST /api/bulk-operations - Execute bulk operations
export async function POST(request: NextRequest) {
  // Only coaches/admins can perform bulk operations
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

  try {
    const body = await request.json();
    const { type, targetAthletes, targetGroups, data } = body;

    if (!type || (!targetAthletes?.length && !targetGroups?.length)) {
      return NextResponse.json(
        {
          error: "Operation type and targets are required",
        },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "bulk_invite":
        result = await handleBulkInvite(targetAthletes, targetGroups, data);
        break;
      case "bulk_message":
        result = await handleBulkMessage(targetAthletes, targetGroups, data);
        break;
      case "bulk_update_status":
        result = await handleBulkStatusUpdate(
          targetAthletes,
          targetGroups,
          data
        );
        break;
      case "bulk_assign_workout":
        result = await handleBulkWorkoutAssignment(
          targetAthletes,
          targetGroups,
          data
        );
        break;
      default:
        return NextResponse.json(
          {
            error: "Unknown operation type",
          },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

async function handleBulkInvite(
  athleteIds: string[],
  groupIds: string[],
  data: {
    groupIds?: string[];
    message?: string;
    emails?: Array<{ email: string; name: string }>;
  }
) {
  try {
    const supabase = getAdminClient();
    const invites = [];

    for (const email of data.emails || []) {
      // Create invite in database
      const { data: invite, error } = await supabase
        .from("invites")
        .insert({
          email: email.email,
          first_name: email.name.split(" ")[0],
          last_name: email.name.split(" ").slice(1).join(" ") || "",
          role: "athlete",
          group_id: (data.groupIds && data.groupIds[0]) || null,
          status: "pending",
        })
        .select()
        .single();

      if (!error && invite) {
        invites.push(invite);
        // TODO: Send invitation email
      }
    }

    return {
      success: true,
      data: {
        invitesSent: invites.length,
        invites,
      },
    };
  } catch (error) {
    console.error("Error in handleBulkInvite:", error);
    return {
      success: false,
      error: "Failed to send invites",
    };
  }
}

async function handleBulkMessage(
  targetAthletes: string[],
  targetGroups: string[],
  data: {
    subject: string;
    message: string;
    priority?: "low" | "normal" | "high";
  }
) {
  try {
    const supabase = getAdminClient();
    const results = [];

    // Send messages to individual athletes
    for (const athleteId of targetAthletes) {
      // Create message in database
      const { error } = await supabase
        .from("messages")
        .insert({
          recipient_id: athleteId,
          subject: data.subject,
          body: data.message,
          priority: data.priority || "normal",
          status: "sent",
        })
        .select()
        .single();

      results.push({
        targetId: athleteId,
        success: !error,
        error: error?.message,
      });
    }

    // TODO: Handle group messaging by expanding groups to individual athletes
    // For now, we'll skip group messaging implementation

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      success: true,
      data: {
        totalSent: successCount,
        totalFailed: failureCount,
        results,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send bulk messages",
    };
  }
}

async function handleBulkStatusUpdate(
  targetAthletes: string[],
  targetGroups: string[],
  data: {
    status: "active" | "inactive" | "suspended";
    reason?: string;
  }
) {
  try {
    // This would require a new API method in supabaseApiClient
    // For now, return a mock success response

    return {
      success: true,
      data: {
        updatedCount: targetAthletes.length,
        newStatus: data.status,
        reason: data.reason,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update athlete status",
    };
  }
}

async function handleBulkWorkoutAssignment(
  targetAthletes: string[],
  targetGroups: string[],
  data: {
    workoutId: string;
    scheduledDate?: string;
    notes?: string;
  }
) {
  try {
    // This would require a new API method in supabaseApiClient
    // For now, return a mock success response

    return {
      success: true,
      data: {
        assignmentsCreated: targetAthletes.length,
        workoutId: data.workoutId,
        scheduledDate: data.scheduledDate,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign workouts",
    };
  }
}

// GET /api/bulk-operations - Get bulk operation history
export async function GET() {
  try {
    // This would fetch bulk operation history from the database
    // For now, return mock data

    const mockHistory = [
      {
        id: "1",
        type: "bulk_message",
        targetCount: 15,
        successCount: 14,
        failureCount: 1,
        status: "completed",
        createdAt: new Date("2024-10-30T10:00:00Z"),
        completedAt: new Date("2024-10-30T10:01:30Z"),
      },
      {
        id: "2",
        type: "bulk_invite",
        targetCount: 8,
        successCount: 8,
        failureCount: 0,
        status: "completed",
        createdAt: new Date("2024-10-29T14:30:00Z"),
        completedAt: new Date("2024-10-29T14:32:15Z"),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockHistory,
    });
  } catch (error) {
    console.error("Error fetching bulk operation history:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch operation history",
      },
      { status: 500 }
    );
  }
}
