import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canManageGroups } from "@/lib/auth";
import { 
  mockGroups, 
  getGroupById, 
  updateGroup, 
  deleteGroup 
} from "@/lib/mock-database";

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
