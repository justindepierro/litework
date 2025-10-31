import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";
import { verifyToken, canAssignWorkouts } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can update KPIs
    if (!canAssignWorkouts(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const result = await supabaseApiClient.updateKPI(id, body);

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
    console.error("Error updating KPI:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update KPI",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can delete KPIs
    if (!canAssignWorkouts(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await supabaseApiClient.deleteKPI(id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { deleted: true },
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
    console.error("Error deleting KPI:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete KPI",
      },
      { status: 500 }
    );
  }
}
