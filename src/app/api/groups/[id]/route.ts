import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canManageGroups } from "@/lib/auth";

// Mock groups database - same as in route.ts (in production, this would be shared)
const mockGroups = [
  {
    id: "1",
    name: "Football Linemen",
    description: "Offensive and defensive linemen",
    sport: "Football",
    category: "Linemen",
    coachId: "1",
    athleteIds: ["2", "4"],
    color: "#ff6b35",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Football Receivers",
    description: "Wide receivers and tight ends",
    sport: "Football",
    category: "Receivers",
    coachId: "1",
    athleteIds: [],
    color: "#00d4aa",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Volleyball Girls",
    description: "Girls varsity volleyball team",
    sport: "Volleyball",
    category: "Girls",
    coachId: "1",
    athleteIds: ["3"],
    color: "#8b5cf6",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Cross Country Boys",
    description: "Boys cross country team",
    sport: "Cross Country",
    category: "Boys",
    coachId: "1",
    athleteIds: [],
    color: "#3b82f6",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// PUT /api/groups/[id] - Update group (coaches only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const auth = verifyToken(request);

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

    const groupId = id;
    const groupIndex = mockGroups.findIndex((g) => g.id === groupId);

    if (groupIndex === -1) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const updateData = await request.json();
    const existingGroup = mockGroups[groupIndex];

    // Update group
    mockGroups[groupIndex] = {
      ...existingGroup,
      ...updateData,
      id: groupId, // Preserve ID
      coachId: existingGroup.coachId, // Preserve coach ownership
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      group: mockGroups[groupIndex],
    });
  } catch (error) {
    console.error("Group PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete group (coaches only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = verifyToken(request);

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

    const groupId = id;
    const groupIndex = mockGroups.findIndex((g) => g.id === groupId);

    if (groupIndex === -1) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Remove group
    mockGroups.splice(groupIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Group DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
