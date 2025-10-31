import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
