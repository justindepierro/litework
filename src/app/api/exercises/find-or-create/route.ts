import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/exercises/find-or-create
// Finds an exercise by name or creates it if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { name, equipment } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();

    // First, try to find existing exercise (case-insensitive)
    const { data: existingExerciseRaw } = await supabase
      .from("exercises")
      .select("*")
      .ilike("name", normalizedName)
      .single();

    if (existingExerciseRaw) {
      const existingExercise = transformToCamel(existingExerciseRaw);

      // Exercise exists - update analytics (using upsert for exercise_analytics)
      await supabase.from("exercise_analytics").upsert(
        transformToSnake({
          exerciseId: existingExercise.id,
          usageCount: 1, // Will be incremented by the trigger
          lastUsedAt: new Date().toISOString(),
        }),
        {
          onConflict: "exercise_id",
          ignoreDuplicates: false,
        }
      );

      return NextResponse.json({
        success: true,
        exercise: existingExercise,
        created: false,
      });
    }

    // Exercise doesn't exist - create it
    // For user-created exercises, we'll leave category_id as null
    // since we don't have a simple way to map string categories to UUIDs
    const inferredEquipment = equipment || inferEquipment(normalizedName);

    const { data: newExerciseRaw, error: createError } = await supabase
      .from("exercises")
      .insert(
        transformToSnake({
          name: normalizedName,
          description: `Custom exercise: ${normalizedName}`,
          categoryId: null, // User-created exercises don't have a category initially
          equipmentNeeded: inferredEquipment,
          difficultyLevel: 2, // Default to intermediate
          isCompound: false, // Will be updated by user if needed
          isBodyweight: inferredEquipment.length === 0,
          instructions: [`Perform ${normalizedName} with proper form`],
          createdBy: "id" in user ? user.id : null, // User ID if available
          isActive: true,
          isApproved: false, // User-created exercises need approval
        })
      )
      .select()
      .single();

    if (createError) {
      console.error("Error creating exercise:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create exercise" },
        { status: 500 }
      );
    }

    const newExercise = transformToCamel(newExerciseRaw);

    // Create analytics entry for new exercise
    await supabase.from("exercise_analytics").insert(
      transformToSnake({
        exerciseId: newExercise.id,
        usageCount: 1,
        lastUsedAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      exercise: newExercise,
      created: true,
    });
  } catch (error) {
    console.error("Error in find-or-create exercise:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to infer equipment from exercise name
function inferEquipment(name: string): string[] {
  const lowerName = name.toLowerCase();
  const equipment: string[] = [];

  if (lowerName.includes("barbell")) equipment.push("Barbell");
  if (lowerName.includes("dumbbell") || lowerName.includes("db"))
    equipment.push("Dumbbells");
  if (lowerName.includes("cable")) equipment.push("Cable Machine");
  if (lowerName.includes("machine")) equipment.push("Machine");
  if (lowerName.includes("kettlebell")) equipment.push("Kettlebell");
  if (lowerName.includes("band")) equipment.push("Resistance Band");
  if (lowerName.includes("trx")) equipment.push("TRX");

  // Check for bodyweight indicators
  if (
    equipment.length === 0 &&
    (lowerName.includes("push-up") ||
      lowerName.includes("pull-up") ||
      lowerName.includes("plank") ||
      lowerName.includes("bodyweight"))
  ) {
    return []; // Empty array indicates bodyweight
  }

  return equipment.length > 0 ? equipment : ["Unknown"];
}
