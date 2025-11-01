import { NextRequest, NextResponse } from "next/server";
import { getAdminClient, requireCoach } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    // Only coaches/admins can create KPIs
    await requireCoach();

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
