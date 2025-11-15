import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { authenticationError } from "@/lib/api-errors";

// GET /api/exercises/search?q=bench
// Protected: Requires authentication
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return authenticationError(authError || undefined);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    const supabase = await createClient();

    // Search exercises by name (case-insensitive, partial match)
    const { data: exercises, error } = await supabase
      .from("exercises")
      .select("id, name, description, video_url")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(limit);

    if (error) {
      console.error("Error searching exercises:", error);
      return NextResponse.json(
        { success: false, error: "Failed to search exercises", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exercises || [],
    });
  } catch (error) {
    console.error("Error in exercise search:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// POST /api/exercises/search - Create new exercise in library
// Protected: Requires authentication (coaches can create exercises)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return authenticationError(authError || undefined);
    }

    const body = await request.json();
    const { name, description, videoUrl } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from name (slug format)
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if exercise already exists
    const { data: existing } = await supabase
      .from("exercises")
      .select("id")
      .eq("id", id)
      .single();

    if (existing) {
      // Exercise already exists - return it
      return NextResponse.json({
        success: true,
        data: { id, name, alreadyExists: true },
        message: "Exercise already exists in library",
      });
    }

    // Create new exercise
    const { data: newExercise, error } = await supabase
      .from("exercises")
      .insert({
        id,
        name,
        description,
        video_url: videoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create exercise", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newExercise,
      message: "Exercise added to library",
    });
  } catch (error) {
    console.error("Error in exercise creation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
