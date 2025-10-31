import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use Supabase authentication
    const result = await supabaseApiClient.signIn(email, password);

    if (result.success && result.data?.user) {
      // Get user profile from our users table
      const profileResult = await supabaseApiClient.getCurrentUser();

      if (profileResult.success && profileResult.data) {
        // Create a local JWT token with our expected structure
        const tokenPayload = {
          userId: profileResult.data.id,
          email: profileResult.data.email,
          role: profileResult.data.role,
        };

        const localToken = jwt.sign(tokenPayload, JWT_SECRET, {
          expiresIn: "24h",
        });

        return NextResponse.json({
          success: true,
          token: localToken,
          user: profileResult.data,
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Failed to get user profile" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to provide demo credentials for testing
export async function GET() {
  return NextResponse.json({
    demoCredentials: [
      {
        role: "coach",
        email: "jdepierro@burkecatholic.org",
        password: "TempPassword123!",
        description: "Full access to all features (Coach Justin DePierro)",
      },
    ],
  });
}
