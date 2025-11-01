import { NextRequest, NextResponse } from "next/server";
import {
  verifySupabaseAuth as verifyToken,
  canManageGroups,
} from "@/lib/supabase-auth";
import { getGroupById, updateGroup, deleteGroup } from "@/lib/database-service";

// PUT /api/groups/[id] - Update group (coaches only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get("authorization");
    const auth = await verifyToken(authHeader);

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

    // Check if group exists
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const updateData = await request.json();

    // Update group
    const updatedGroup = await updateGroup(groupId, {
      ...updateData,
      id: groupId, // Preserve ID
      coachId: existingGroup.coachId, // Preserve coach ownership
    });

    if (!updatedGroup) {
      return NextResponse.json(
        { error: "Failed to update group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      group: updatedGroup,
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
    const authHeader = request.headers.get("authorization");
    const auth = await verifyToken(authHeader);

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

    // Check if group exists
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Delete group
    const success = await deleteGroup(groupId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete group" },
        { status: 500 }
      );
    }

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
