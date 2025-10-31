import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// POST /api/invites/accept - Accept invitation and create athlete account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, password } = body;

    if (!inviteCode || !password) {
      return NextResponse.json(
        { error: "Invitation code and password are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Find and validate invitation
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("*")
      .eq("id", inviteCode)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", invite.email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user account via Supabase Auth
    const { data: authData, error: signUpError } =
      await supabase.auth.signUp({
        email: invite.email.toLowerCase(),
        password,
        options: {
          data: {
            name: invite.name,
            role: invite.role || "athlete",
          },
        },
      });

    if (signUpError || !authData.user) {
      console.error("Error creating user account:", signUpError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Create user profile in users table
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: invite.email.toLowerCase(),
      name: invite.name,
      role: invite.role || "athlete",
      group_ids: invite.group_id ? [invite.group_id] : [],
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Update invitation status
    await supabase
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", inviteCode);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: invite.name,
      },
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
