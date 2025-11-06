import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUser, isCoach } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    // Only coaches/admins can create KPIs
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

    const body = await request.json();
    const { athleteId, exerciseId, exerciseName, currentPR, dateAchieved } =
      body;

    if (
      !athleteId ||
      !exerciseId ||
      !exerciseName ||
      !currentPR ||
      !dateAchieved
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: kpi, error } = await supabase
      .from("athlete_kpis")
      .insert({
        athlete_id: athleteId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        current_pr: parseFloat(currentPR),
        date_achieved: new Date(dateAchieved).toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { kpi },
    });
  } catch (error) {
    console.error("Error creating KPI:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create KPI",
      },
      { status: 500 }
    );
  }
}
