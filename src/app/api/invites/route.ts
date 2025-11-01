import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getAdminClient } from "@/lib/auth-server";

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
    const { firstName, lastName, email, groupId } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

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

    // Create invitation record
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .insert({
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        invited_by: user.id,
        role: "athlete",
        group_id: groupId || null,
        status: "pending",
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invite:", inviteError);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invite,
      message: "Invitation created successfully",
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
