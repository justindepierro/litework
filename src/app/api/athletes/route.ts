import { NextResponse } from "next/server";
import {
  getAdminClient,
  getAuthenticatedUser,
  isCoach,
} from "@/lib/auth-server";

/**
 * GET /api/athletes - Get all athletes and pending invites
 * Returns both registered athletes and pending invites for coaches/admins
 */
export async function GET() {
  try {
    // Verify authentication and require coach/admin
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();

    // Fetch athletes (users with role 'athlete')
    const { data: athletes, error: athletesError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role, created_at, updated_at")
      .eq("role", "athlete")
      .order("first_name");

    if (athletesError) {
      console.error("Error fetching athletes:", athletesError);
      throw athletesError;
    }

    // Fetch pending invites (including draft invites without email)
    const { data: invites, error: invitesError } = await supabase
      .from("invites")
      .select(
        "id, first_name, last_name, email, status, created_at, expires_at, group_ids"
      )
      .in("status", ["pending", "draft"])
      .order("created_at", { ascending: false });

    if (invitesError) {
      console.error("Error fetching invites:", invitesError);
      // Don't fail if invites table doesn't exist yet
      return NextResponse.json({
        success: true,
        data: {
          athletes: athletes || [],
          invites: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        athletes: athletes || [],
        invites: invites || [],
      },
    });
  } catch (error) {
    console.error("Error fetching athletes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch athletes",
      },
      { status: 500 }
    );
  }
}
