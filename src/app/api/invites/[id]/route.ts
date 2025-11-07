import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  getAdminClient,
  isCoach,
  isAdmin,
} from "@/lib/auth-server";
import { sendEmailNotification } from "@/lib/email-service";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

// GET /api/invites/[id] - Fetch invitation details (public endpoint for signup)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;
    const supabase = getAdminClient();

    // Fetch invite data
    const { data: invite, error } = await supabase
      .from("invites")
      .select("id, email, first_name, last_name, role, expires_at, status")
      .eq("id", inviteId)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 } // 410 Gone
      );
    }

    // Check if invite is still pending
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation is no longer valid" },
        { status: 410 }
      );
    }

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

// DELETE /api/invites/[id] - Cancel/delete an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can delete invitations
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can delete invitations" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();

    // Verify the invite belongs to this coach (or user is admin)
    const { data: invite } = await supabase
      .from("invites")
      .select("id, invited_by")
      .eq("id", inviteId)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check ownership (admins can delete any invite)
    if (!isAdmin(user) && invite.invited_by !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own invitations" },
        { status: 403 }
      );
    }

    // Get invite details to find associated groups
    const { data: fullInvite } = await supabase
      .from("invites")
      .select("id, group_ids")
      .eq("id", inviteId)
      .single();

    // Remove invite from any groups it was added to
    if (fullInvite?.group_ids && fullInvite.group_ids.length > 0) {
      for (const groupId of fullInvite.group_ids) {
        try {
          const { data: group } = await supabase
            .from("athlete_groups")
            .select("athlete_ids")
            .eq("id", groupId)
            .single();

          if (group) {
            const updatedAthleteIds = group.athlete_ids.filter(
              (id: string) => id !== inviteId
            );
            await supabase
              .from("athlete_groups")
              .update({ athlete_ids: updatedAthleteIds })
              .eq("id", groupId);
          }
        } catch (err) {
          console.error(`Failed to remove invite from group ${groupId}:`, err);
        }
      }
    }

    // Delete the invite
    const { error: deleteError } = await supabase
      .from("invites")
      .delete()
      .eq("id", inviteId);

    if (deleteError) {
      console.error("Error deleting invite:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/invites/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/invites/[id] - Update invitation email
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can update invitations
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can update invitations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Verify the invite belongs to this coach (or user is admin)
    const { data: invite } = await supabase
      .from("invites")
      .select("id, invited_by, status, expires_at")
      .eq("id", inviteId)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check ownership (admins can update any invite)
    if (!isAdmin(user) && invite.invited_by !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own invitations" },
        { status: 403 }
      );
    }

    // Can only update pending invites (not accepted, expired, or cancelled)
    if (
      invite.status === "accepted" ||
      invite.status === "expired" ||
      invite.status === "cancelled"
    ) {
      return NextResponse.json(
        { error: `Cannot update ${invite.status} invitations` },
        { status: 400 }
      );
    }

    // Update the invite with new email
    const updateData: Record<string, string> = {
      email,
      status: "pending", // Set to pending once email is added
      updated_at: new Date().toISOString(),
    };

    // If the invite didn't have an expiry date (draft invite), set it now
    if (!invite.expires_at || invite.status === "draft") {
      updateData.expires_at = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    const { data: updatedInvite, error: updateError } = await supabase
      .from("invites")
      .update(updateData)
      .eq("id", inviteId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating invite email:", updateError);
      return NextResponse.json(
        { error: "Failed to update invitation email" },
        { status: 500 }
      );
    }

    // Send the invitation email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/signup?invite=${inviteId}`;

      await sendEmailNotification({
        to: email.toLowerCase(),
        subject: "You're invited to join LiteWork!",
        category: "invite",
        templateData: {
          userName: `${updatedInvite.first_name} ${updatedInvite.last_name}`,
          title: "Join LiteWork",
          message:
            "Your coach has invited you to join LiteWork, the complete workout tracking platform for weight lifting athletes.",
          actionUrl: inviteUrl,
          actionText: "Accept Invitation",
          details: [
            { label: "Invited By", value: user.email || "Your Coach" },
            {
              label: "Expires",
              value: new Date(updatedInvite.expires_at).toLocaleDateString(),
            },
          ],
          footer: "This invitation will expire in 7 days.",
        },
      });
      console.log(`✅ Invitation email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the request if email fails, but log it
      return NextResponse.json({
        success: true,
        invite: updatedInvite,
        message: "Email updated but notification failed to send",
        warning: "Email delivery failed",
      });
    }

    return NextResponse.json({
      success: true,
      invite: updatedInvite,
      message: "Email updated and invitation sent successfully",
    });
  } catch (error) {
    console.error("Error in PUT /api/invites/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/invites/[id] - Update invitation (resend or mark as accepted)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inviteId } = await params;

    // Try to parse body, but handle empty body for resend requests
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { status } = body;

    // If marking as accepted, allow without auth (during signup)
    if (status === "accepted") {
      const supabase = getAdminClient();

      const { error: updateError } = await supabase
        .from("invites")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", inviteId);

      if (updateError) {
        console.error("Error marking invite as accepted:", updateError);
        return NextResponse.json(
          { error: "Failed to update invitation" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Invitation accepted",
      });
    }

    // For resending (no status provided), require authentication
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can resend invitations
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can resend invitations" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();

    // Verify the invite belongs to this coach (or user is admin)
    const { data: invite } = await supabase
      .from("invites")
      .select("id, invited_by, email, status")
      .eq("id", inviteId)
      .single();

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check ownership (admins can resend any invite)
    if (!isAdmin(user) && invite.invited_by !== user.id) {
      return NextResponse.json(
        { error: "You can only resend your own invitations" },
        { status: 403 }
      );
    }

    // Can only resend pending invites
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Can only resend pending invitations" },
        { status: 400 }
      );
    }

    // Update the expiry date to 7 days from now
    const { data: updatedInvite, error: updateError } = await supabase
      .from("invites")
      .update({
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inviteId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating invite:", updateError);
      return NextResponse.json(
        { error: "Failed to resend invitation" },
        { status: 500 }
      );
    }

    // Resend invitation email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/signup?invite=${updatedInvite.id}`;

      console.log("Attempting to send email to:", updatedInvite.email);
      console.log("Resend API Key present:", !!process.env.RESEND_API_KEY);

      const emailResult = await sendEmailNotification({
        to: updatedInvite.email,
        subject: "Reminder: You're invited to join LiteWork!",
        category: "invite",
        templateData: {
          userName: `${updatedInvite.first_name} ${updatedInvite.last_name}`,
          title: "Join LiteWork",
          message:
            "This is a friendly reminder that your coach has invited you to join LiteWork. Don't miss out on tracking your progress and hitting new PRs!",
          actionUrl: inviteUrl,
          actionText: "Accept Invitation",
          details: [
            {
              label: "New Expiry Date",
              value: new Date(updatedInvite.expires_at).toLocaleDateString(),
            },
          ],
        },
      });

      if (emailResult.success) {
        console.log(
          `✅ Invitation reminder email sent to ${updatedInvite.email}`
        );
      } else {
        console.error(`❌ Failed to send email: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send reminder email:", emailError);
      // Don't fail the request if email fails - invite is still updated
    }

    return NextResponse.json({
      success: true,
      invite: updatedInvite,
      message: "Invitation resent and expiry extended by 7 days",
    });
  } catch (error) {
    console.error("Error in PATCH /api/invites/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
