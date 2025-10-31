import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";
import { verifyToken, canAssignWorkouts } from "@/lib/auth";

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

    // Only coaches/admins can create KPIs
    if (!canAssignWorkouts(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

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
        {
          success: false,
          error: "All KPI fields are required",
        },
        { status: 400 }
      );
    }

    const result = await supabaseApiClient.createKPI({
      athleteId,
      exerciseId,
      exerciseName,
      currentPR: parseFloat(currentPR),
      dateAchieved: new Date(dateAchieved),
      isActive: true,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { kpi: result.data },
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
