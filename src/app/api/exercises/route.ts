import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  getAdminClient,
  requireCoach,
} from "@/lib/auth-server";
import { cachedResponse } from "@/lib/api-cache-headers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const muscleGroup = searchParams.get("muscleGroup");
    const equipment = searchParams.get("equipment");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Use our custom function to get exercises with details
    const { data: exercises, error } = await supabase
      .rpc("get_exercises_with_details", {
        category_filter: category ? category : null,
        muscle_group_filter: muscleGroup,
        equipment_filter: equipment,
        difficulty_filter: difficulty ? parseInt(difficulty) : null,
        search_term: search,
      })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching exercises:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get categories for filtering
    const { data: categories, error: categoriesError } = await supabase
      .from("exercise_categories")
      .select("*")
      .order("sort_order");

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    }

    // Get muscle groups for filtering
    const { data: muscleGroups, error: muscleGroupsError } = await supabase
      .from("muscle_groups")
      .select("*")
      .order("name");

    if (muscleGroupsError) {
      console.error("Error fetching muscle groups:", muscleGroupsError);
    }

    // Get equipment types for filtering
    const { data: equipmentTypes, error: equipmentError } = await supabase
      .from("equipment_types")
      .select("*")
      .order("name");

    if (equipmentError) {
      console.error("Error fetching equipment types:", equipmentError);
    }

    return cachedResponse(
      {
        exercises: exercises || [],
        categories: categories || [],
        muscleGroups: muscleGroups || [],
        equipmentTypes: equipmentTypes || [],
        pagination: {
          limit,
          offset,
          total: exercises?.length || 0,
        },
      },
      300, // Cache for 5 minutes (exercises don't change often)
      900 // Stale-while-revalidate for 15 minutes
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCoach();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches and admins can create exercises
    if (user.role !== "coach" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const supabase = getAdminClient();
    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      instructions,
      difficultyLevel,
      equipmentNeeded,
      isCompound,
      isBodyweight,
      isUnilateral,
      estimatedDurationMinutes,
      safetyNotes,
      videoUrl,
      imageUrl,
      tags,
      muscleGroups, // Array of {muscleGroupId, involvementType}
    } = body;

    // Create the exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .insert({
        name,
        description,
        category_id: categoryId,
        instructions: instructions || [],
        difficulty_level: difficultyLevel || 1,
        equipment_needed: equipmentNeeded || [],
        is_compound: isCompound || false,
        is_bodyweight: isBodyweight || false,
        is_unilateral: isUnilateral || false,
        estimated_duration_minutes: estimatedDurationMinutes || 5,
        safety_notes: safetyNotes,
        video_url: videoUrl,
        image_url: imageUrl,
        created_by: user.id,
        is_active: true,
        is_approved: user.role === "admin", // Auto-approve for admins
        tags: tags || [],
      })
      .select()
      .single();

    if (exerciseError) {
      console.error("Error creating exercise:", exerciseError);
      return NextResponse.json(
        { error: exerciseError.message },
        { status: 500 }
      );
    }

    // Add muscle group associations
    if (muscleGroups && muscleGroups.length > 0) {
      const muscleGroupInserts = muscleGroups.map(
        (mg: { muscleGroupId: string; involvementType?: string }) => ({
          exercise_id: exercise.id,
          muscle_group_id: mg.muscleGroupId,
          involvement_type: mg.involvementType || "primary",
        })
      );

      const { error: muscleGroupError } = await supabase
        .from("exercise_muscle_groups")
        .insert(muscleGroupInserts);

      if (muscleGroupError) {
        console.error("Error adding muscle groups:", muscleGroupError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
