import { NextResponse } from "next/server";
import {
  getAdminClient,
  getAuthenticatedUser,
  isCoach,
} from "@/lib/auth-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only coaches/admins can update KPIs
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

  try {

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
  // Only coaches/admins can delete KPIs
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

  try {

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
