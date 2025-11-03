import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getAdminClient } from "@/lib/auth-server";
import { sendEmailNotification } from "@/lib/email-service";

// Type for invite insert data
interface InviteInsertData {
  email: string | null;
  first_name: string;
  last_name: string;
  invited_by: string;
  role: string;
  status: "pending" | "draft";
  expires_at: string | null;
  group_id?: string;
  group_ids?: string[];
  notes?: string;
  bio?: string;
  date_of_birth?: string;
  injury_status?: string;
}

// POST /api/invites - Create athlete invitation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coaches and admins can invite athletes
    if (user.role !== "coach" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only coaches can invite athletes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, groupId, notes, bio, dateOfBirth, injuryStatus } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Only check for existing user/invite if email is provided
    if (email) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Check if there's already a pending invite for this email
      const { data: existingInvite } = await supabase
        .from("invites")
        .select("id, email, status, expires_at")
        .eq("email", email.toLowerCase())
        .eq("status", "pending")
        .single();

      if (existingInvite) {
        // Check if invite is still valid (not expired)
        const expiresAt = new Date(existingInvite.expires_at);
        if (expiresAt > new Date()) {
          return NextResponse.json(
            {
              error: "An active invitation for this email already exists",
              existingInvite: existingInvite,
            },
            { status: 400 }
          );
        }
        // If expired, we'll create a new one (old one will be overridden)
      }
    }

    // Create invitation record
    const insertData: InviteInsertData = {
      email: email ? email.toLowerCase() : null,
      first_name: firstName,
      last_name: lastName,
      invited_by: user.id,
      role: "athlete",
      status: email ? "pending" : "draft",
      expires_at: email
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    };

    // Add group assignment - support both old and new schema
    if (groupId) {
      insertData.group_id = groupId; // Legacy single group
      insertData.group_ids = [groupId]; // New array format
    }

    // Add profile data if provided (from profile transfer migration)
    if (notes) insertData.notes = notes;
    if (bio) insertData.bio = bio;
    if (dateOfBirth) insertData.date_of_birth = dateOfBirth;
    if (injuryStatus) insertData.injury_status = injuryStatus;

    console.log("Creating invite with data:", {
      ...insertData,
      email: insertData.email ? "***" : null,
    });

    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .insert(insertData)
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invite:", inviteError);
      console.error("Insert data was:", insertData);
      return NextResponse.json(
        { 
          error: "Failed to create invitation",
          details: inviteError.message,
          code: inviteError.code
        },
        { status: 500 }
      );
    }

    // If groupId was provided, add the invite to the group's athleteIds array
    if (groupId) {
      try {
        // Get current group
        const { data: group, error: groupError } = await supabase
          .from("athlete_groups")
          .select("athlete_ids")
          .eq("id", groupId)
          .single();

        if (!groupError && group) {
          // Add invite ID to group's athlete_ids array
          const currentAthleteIds = group.athlete_ids || [];
          const updatedAthleteIds = Array.from(
            new Set([...currentAthleteIds, invite.id])
          );

          await supabase
            .from("athlete_groups")
            .update({ athlete_ids: updatedAthleteIds })
            .eq("id", groupId);

          console.log(`✅ Added invite ${invite.id} to group ${groupId}`);
        }
      } catch (groupError) {
        console.error("❌ Failed to add invite to group:", groupError);
        // Don't fail the request - invite is still created
      }
    }

    // Send invitation email only if email is provided
    if (email) {
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const inviteUrl = `${appUrl}/signup?invite=${invite.id}`;

        await sendEmailNotification({
          to: email.toLowerCase(),
          subject: "You're invited to join LiteWork!",
          category: "invite",
          templateData: {
            userName: `${firstName} ${lastName}`,
            title: "Join LiteWork",
            message:
              "Your coach has invited you to join LiteWork, the complete workout tracking platform for weight lifting athletes.",
            actionUrl: inviteUrl,
            actionText: "Accept Invitation",
            details: [
              { label: "Invited By", value: user.email || "Your Coach" },
              {
                label: "Expires",
                value: new Date(invite.expires_at).toLocaleDateString(),
              },
            ],
          },
        });

        console.log(`✅ Invitation email sent to ${email}`);
      } catch (emailError) {
        console.error("❌ Failed to send invitation email:", emailError);
        // Don't fail the request if email fails - invite is still created
      }
    }

    return NextResponse.json({
      success: true,
      invite,
      message: email
        ? "Invitation created and email sent successfully"
        : "Athlete profile created (add email to send invite)",
    });
  } catch (error) {
    console.error("Error in POST /api/invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/invites - Get all invitations (for coaches)
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only coaches and admins can view invitations
    if (user.role !== "coach" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only coaches can view invitations" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();

    const { data: invites, error } = await supabase
      .from("invites")
      .select("*")
      .eq("invited_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invites:", error);
      return NextResponse.json(
        { error: "Failed to fetch invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites: invites || [] });
  } catch (error) {
    console.error("Error in GET /api/invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
