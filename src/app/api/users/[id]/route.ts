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

    // Parse query params to determine delete type
    const url = new URL(request.url);
    const permanent = url.searchParams.get("permanent") === "true";
    const reason = url.searchParams.get("reason") || "No reason provided";

    if (permanent) {
      // HARD DELETE with CASCADE cleanup (requires confirmation)
      const confirmationCode = url.searchParams.get("confirm");

      if (confirmationCode !== id) {
        return NextResponse.json(
          {
            error:
              "Confirmation required. Set ?confirm={athleteId} to permanently delete.",
          },
          { status: 400 }
        );
      }

      // Call stored procedure for safe hard delete with cascade
      const { data, error } = await supabase.rpc("hard_delete_athlete", {
        athlete_id: id,
        deleted_by: user.id,
        deletion_reason: reason,
        confirmation_code: confirmationCode,
      });

      if (error) {
        console.error("Hard delete error:", error);
        throw error;
      }

      // Also delete from Supabase Auth
      try {
        await supabase.auth.admin.deleteUser(id);
      } catch (authError) {
        console.warn(
          "Could not delete from auth (user may not exist):",
          authError
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...data,
          type: "hard_delete",
          warning: "This action cannot be undone",
        },
      });
    } else {
      // SOFT DELETE (default, can be restored)
      const { data, error } = await supabase.rpc("soft_delete_athlete", {
        athlete_id: id,
        deleted_by: user.id,
        deletion_reason: reason,
      });

      if (error) {
        console.error("Soft delete error:", error);
        throw error;
      }

      return NextResponse.json({
        success: true,
        data: {
          ...data,
          type: "soft_delete",
          message:
            "Athlete has been archived and can be restored from the admin panel",
        },
      });
    }
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
        error:
          error instanceof Error ? error.message : "Failed to delete athlete",
      },
      { status: 500 }
    );
  }
}
