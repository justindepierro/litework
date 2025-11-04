import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/exercises/find-or-create
// Finds an exercise by name or creates it if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { name, category, muscleGroups, equipment } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();

    // First, try to find existing exercise (case-insensitive)
    const { data: existingExercise } = await supabase
      .from("exercises")
      .select("*")
      .ilike("name", normalizedName)
      .single();

    if (existingExercise) {
      // Exercise exists - update analytics (using upsert for exercise_analytics)
      await supabase
        .from("exercise_analytics")
        .upsert(
          {
            exercise_id: existingExercise.id,
            usage_count: 1, // Will be incremented by the trigger
            last_used_at: new Date().toISOString(),
          },
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
    // Determine category based on name or use provided category
    const inferredCategory = category || inferCategory(normalizedName);
    const inferredMuscleGroups =
      muscleGroups || inferMuscleGroups(normalizedName);
    const inferredEquipment = equipment || inferEquipment(normalizedName);

    const { data: newExercise, error: createError } = await supabase
      .from("exercises")
      .insert({
        name: normalizedName,
        description: `Custom exercise: ${normalizedName}`,
        category_id: inferredCategory,
        equipment_needed: inferredEquipment,
        difficulty_level: 2, // Default to intermediate
        is_compound: false, // Will be updated by user if needed
        is_bodyweight: inferredEquipment.length === 0,
        instructions: [`Perform ${normalizedName} with proper form`],
        created_by: "id" in user ? user.id : null, // User ID if available
        is_active: true,
        is_approved: false, // User-created exercises need approval
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating exercise:", createError);
      return NextResponse.json(
        { success: false, error: "Failed to create exercise" },
        { status: 500 }
      );
    }

    // Create analytics entry for new exercise
    await supabase.from("exercise_analytics").insert({
      exercise_id: newExercise.id,
      usage_count: 1,
      last_used_at: new Date().toISOString(),
    });

    // Add muscle group associations if provided
    if (inferredMuscleGroups && inferredMuscleGroups.length > 0) {
      // Note: This assumes inferredMuscleGroups is an array of muscle group names or IDs
      // You may need to adjust based on the actual format
      const muscleGroupInserts = inferredMuscleGroups.map((mg: string) => ({
        exercise_id: newExercise.id,
        muscle_group_id: mg, // Assuming mg is a UUID
        involvement_type: "primary",
      }));

      await supabase
        .from("exercise_muscle_groups")
        .insert(muscleGroupInserts);
    }

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

// Helper functions to infer exercise metadata from name
function inferCategory(name: string): string {
  const lowerName = name.toLowerCase();

  // Category ID mappings (adjust based on your actual category IDs)
  if (
    lowerName.includes("squat") ||
    lowerName.includes("lunge") ||
    lowerName.includes("leg")
  ) {
    return "legs";
  }
  if (
    lowerName.includes("bench") ||
    lowerName.includes("chest") ||
    lowerName.includes("press") ||
    lowerName.includes("fly")
  ) {
    return "chest";
  }
  if (
    lowerName.includes("back") ||
    lowerName.includes("row") ||
    lowerName.includes("pull")
  ) {
    return "back";
  }
  if (
    lowerName.includes("shoulder") ||
    lowerName.includes("raise") ||
    lowerName.includes("overhead")
  ) {
    return "shoulders";
  }
  if (lowerName.includes("curl") || lowerName.includes("bicep")) {
    return "biceps";
  }
  if (lowerName.includes("tricep") || lowerName.includes("extension")) {
    return "triceps";
  }
  if (lowerName.includes("core") || lowerName.includes("plank")) {
    return "core";
  }

  return "other"; // Default category
}

function inferMuscleGroups(name: string): Array<{
  name: string;
  involvement: string;
}> {
  const lowerName = name.toLowerCase();
  const groups: Array<{ name: string; involvement: string }> = [];

  // Map common exercise names to muscle groups
  if (lowerName.includes("squat")) {
    groups.push({ name: "Quadriceps", involvement: "primary" });
    groups.push({ name: "Glutes", involvement: "secondary" });
  } else if (lowerName.includes("bench")) {
    groups.push({ name: "Chest", involvement: "primary" });
    groups.push({ name: "Triceps", involvement: "secondary" });
  } else if (lowerName.includes("deadlift")) {
    groups.push({ name: "Back", involvement: "primary" });
    groups.push({ name: "Hamstrings", involvement: "primary" });
  } else if (lowerName.includes("row")) {
    groups.push({ name: "Back", involvement: "primary" });
    groups.push({ name: "Biceps", involvement: "secondary" });
  } else if (lowerName.includes("curl")) {
    groups.push({ name: "Biceps", involvement: "primary" });
  } else if (lowerName.includes("press") && lowerName.includes("shoulder")) {
    groups.push({ name: "Shoulders", involvement: "primary" });
  }

  // Default if no matches
  if (groups.length === 0) {
    groups.push({ name: "Unknown", involvement: "primary" });
  }

  return groups;
}

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
