import { NextResponse } from "next/server";
import {
  getAdminClient,
  getAuthenticatedUser,
  isAdmin,
  isCoach,
} from "@/lib/auth-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = getAdminClient();

    // Fetch target user to check permissions
    const { data: targetUser, error: fetchError } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Permission check: users can edit themselves, coaches can edit athletes, admins can edit anyone
    const canEdit =
      user.id === id ||
      (isCoach(user) && targetUser.role === "athlete") ||
      isAdmin(user);

    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      dateOfBirth,
      injuryStatus,
      groupIds,
      coachId,
      bio,
      phone,
      emergencyContact,
      emergencyPhone,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, string | string[] | null> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (injuryStatus !== undefined) updateData.injury_status = injuryStatus;
    if (groupIds !== undefined) updateData.group_ids = groupIds;
    if (coachId !== undefined) updateData.coach_id = coachId;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone_number = phone;
    if (emergencyContact !== undefined)
      updateData.emergency_contact_name = emergencyContact;
    if (emergencyPhone !== undefined)
      updateData.emergency_contact_phone = emergencyPhone;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can delete users
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = getAdminClient();

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Insufficient permissions - Admin only" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.error("Error deleting athlete:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete athlete",
      },
      { status: 500 }
    );
  }
}
