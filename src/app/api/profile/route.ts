/**
 * Profile Metrics API
 * Update user profile information and physical metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // ISO date string
  height_inches?: number;
  weight_lbs?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bio?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export async function GET() {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("users_with_metrics")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: transformToCamel(data),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const updatesInput = await request.json();
    const updates: ProfileUpdate = transformToSnake(updatesInput);

    // Validate data
    if (updates.height_inches !== undefined) {
      if (updates.height_inches < 36 || updates.height_inches > 96) {
        return NextResponse.json(
          {
            success: false,
            error: "Height must be between 36 and 96 inches (3-8 feet)",
          },
          { status: 400 }
        );
      }
    }

    if (updates.weight_lbs !== undefined) {
      if (updates.weight_lbs < 50 || updates.weight_lbs > 500) {
        return NextResponse.json(
          { success: false, error: "Weight must be between 50 and 500 lbs" },
          { status: 400 }
        );
      }
    }

    if (updates.date_of_birth) {
      const birthDate = new Date(updates.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 10 || age > 120) {
        return NextResponse.json(
          { success: false, error: "Age must be between 10 and 120 years" },
          { status: 400 }
        );
      }
    }

    // Update user record
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Fetch updated profile with calculated metrics
    const { data: profileData, error: fetchError } = await supabase
      .from("users_with_metrics")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      // Return basic data even if view fetch fails
      return NextResponse.json({
        success: true,
        profile: transformToCamel(data),
      });
    }

    return NextResponse.json({
      success: true,
      profile: transformToCamel(profileData),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
