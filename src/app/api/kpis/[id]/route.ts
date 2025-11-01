import { NextResponse } from "next/server";
import { getAdminClient, requireCoach } from "@/lib/auth-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only coaches/admins can update KPIs
    await requireCoach();

    const { id } = await params;
    const body = await request.json();
    const supabase = getAdminClient();

    const { data: kpi, error } = await supabase
      .from("athlete_kpis")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { kpi },
    });
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only coaches/admins can delete KPIs
    await requireCoach();

    const { id } = await params;
    const supabase = getAdminClient();

    const { error } = await supabase.from("athlete_kpis").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
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
