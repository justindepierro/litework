import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";
import { verifyToken, canViewAllAthletes } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission to view all athletes
    if (!canViewAllAthletes(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // For now, only support getting athletes
    const result = await supabaseApiClient.getAthletes();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { users: result.data },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
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
    // Verify authentication
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can create users
    if (!canViewAllAthletes(auth.user)) {
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

    const result = await supabaseApiClient.createAthlete({
      name,
      email,
      password,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { user: result.data },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
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
