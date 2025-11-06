import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUser, isCoach } from "@/lib/auth-server";

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

    // For now, only support getting athletes
    const { data: athletes, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "athlete")
      .order("name");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { users: athletes },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and require coach/admin
    const { user, error: authenticationError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authenticationError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Create user with Supabase Admin
    const supabase = getAdminClient();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" ") || "",
        },
      });

    if (authError || !authData.user) {
      console.error("Error creating user:", authError);
      return NextResponse.json(
        {
          success: false,
          error: authError?.message || "Failed to create user",
        },
        { status: 500 }
      );
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || "",
        role: "athlete",
      })
      .select()
      .single();

    if (userError) {
      console.error("Error creating user profile:", userError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user profile",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 }
    );
  }
}
