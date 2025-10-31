import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canManageGroups, canViewAllAthletes } from "@/lib/auth";
import { AthleteGroup } from "@/types";
import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "@/lib/database-service";

// GET /api/groups - Get all groups (coaches) or user's groups (athletes)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Get all groups from database
    const allGroups = await getAllGroups();

    // Coaches can see all groups, athletes only see their groups
    if (canViewAllAthletes(auth.user)) {
      return NextResponse.json({
        success: true,
        groups: allGroups,
      });
    } else {
      // For athletes, filter by their groupIds
      const userGroups = allGroups.filter((group) =>
        group.athleteIds.includes(auth.user!.userId)
      );

      return NextResponse.json({
        success: true,
        groups: userGroups,
      });
    }
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create new group (coaches only)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    if (!canManageGroups(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { name, description, sport, category, color, athleteIds } =
      await request.json();

    if (!name || !sport) {
      return NextResponse.json(
        { error: "Name and sport are required" },
        { status: 400 }
      );
    }

    const newGroup = await createGroup({
      name,
      description,
      sport,
      category,
      coachId: auth.user.userId,
      athleteIds: athleteIds || [],
      color: color || "#3b82f6",
    });

    if (!newGroup) {
      return NextResponse.json(
        { error: "Failed to create group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group: newGroup,
    });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
