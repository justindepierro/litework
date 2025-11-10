import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAuthenticatedUser, isCoach } from "@/lib/auth-server";
import type {
  AthleteAssignedKPI,
  AthleteAssignedKPIWithDetails,
  BulkAssignKPIsRequest,
  BulkAssignKPIsResponse,
} from "@/types";

// ============================================================================
// GET /api/athlete-assigned-kpis
// List athlete KPI assignments
// Query params:
//   - athlete_id: Filter by athlete (optional)
//   - kpi_tag_id: Filter by KPI tag (optional)
//   - is_active: Filter by active status (default: true)
//   - with_details: Include full tag and athlete details (default: false)
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athlete_id");
    const kpiTagId = searchParams.get("kpi_tag_id");
    const isActive = searchParams.get("is_active") !== "false"; // Default true
    const withDetails = searchParams.get("with_details") === "true";

    const supabase = await createClient();

    if (withDetails) {
      // Use the view for full details
      let query = supabase
        .from("active_athlete_kpis")
        .select("*")
        .order("athlete_name", { ascending: true })
        .order("kpi_display_name", { ascending: true });

      if (athleteId) {
        query = query.eq("athlete_id", athleteId);
      }

      if (kpiTagId) {
        query = query.eq("kpi_tag_id", kpiTagId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return NextResponse.json({ data });
    } else {
      // Basic query on the table
      let query = supabase
        .from("athlete_assigned_kpis")
        .select("*")
        .eq("is_active", isActive)
        .order("assigned_at", { ascending: false });

      if (athleteId) {
        query = query.eq("athlete_id", athleteId);
      }

      if (kpiTagId) {
        query = query.eq("kpi_tag_id", kpiTagId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error("[GET /api/athlete-assigned-kpis] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch athlete KPI assignments",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/athlete-assigned-kpis
// Assign KPIs to athletes (supports bulk assignment)
// Body: BulkAssignKPIsRequest
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can assign KPIs
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can assign KPIs to athletes" },
        { status: 403 }
      );
    }

    const body: BulkAssignKPIsRequest = await request.json();
    const {
      athleteIds,
      kpiTagIds,
      assignedVia = "individual",
      targetValue,
      targetDate,
      notes,
    } = body;

    if (!athleteIds?.length || !kpiTagIds?.length) {
      return NextResponse.json(
        { error: "athleteIds and kpiTagIds are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Use the bulk_assign_kpis function
    const { data, error } = await supabase.rpc("bulk_assign_kpis", {
      p_athlete_ids: athleteIds,
      p_kpi_tag_ids: kpiTagIds,
      p_assigned_by: user.id,
      p_assigned_via: assignedVia,
      p_target_value: targetValue || null,
      p_target_date: targetDate || null,
      p_notes: notes || null,
    });

    if (error) throw error;

    const assignments = (data || []) as Array<{
      athlete_id: string;
      kpi_tag_id: string;
      assignment_id: string;
      was_already_assigned: boolean;
    }>;
    const totalAssigned = assignments.filter(
      (a) => !a.was_already_assigned
    ).length;
    const totalSkipped = assignments.filter(
      (a) => a.was_already_assigned
    ).length;

    const response: BulkAssignKPIsResponse = {
      success: true,
      assignments: assignments.map((a) => ({
        athleteId: a.athlete_id,
        kpiTagId: a.kpi_tag_id,
        assignmentId: a.assignment_id,
        wasAlreadyAssigned: a.was_already_assigned,
      })),
      totalAssigned,
      totalSkipped,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/athlete-assigned-kpis] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to assign KPIs to athletes",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/athlete-assigned-kpis?id={id}
// Update an athlete KPI assignment
// Body: Partial<AthleteAssignedKPI>
// ============================================================================
export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can update KPI assignments
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can update KPI assignments" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive, targetValue, targetDate, notes } = body;

    const supabase = await createClient();

    const updates: Partial<{
      is_active: boolean;
      target_value: number | null;
      target_date: string | null;
      notes: string | null;
    }> = {};
    if (isActive !== undefined) updates.is_active = isActive;
    if (targetValue !== undefined) updates.target_value = targetValue;
    if (targetDate !== undefined) updates.target_date = targetDate;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from("athlete_assigned_kpis")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[PATCH /api/athlete-assigned-kpis] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update athlete KPI assignment",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/athlete-assigned-kpis?id={id}
// Remove an athlete KPI assignment
// OR
// DELETE /api/athlete-assigned-kpis?athlete_id={id}&kpi_tag_id={id}
// Remove by athlete and KPI tag
// ============================================================================
export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    // Only coaches/admins can delete KPI assignments
    if (!isCoach(user)) {
      return NextResponse.json(
        { error: "Only coaches can remove KPI assignments" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const athleteId = searchParams.get("athlete_id");
    const kpiTagId = searchParams.get("kpi_tag_id");

    const supabase = await createClient();

    if (id) {
      // Delete by assignment ID
      const { error } = await supabase
        .from("athlete_assigned_kpis")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } else if (athleteId && kpiTagId) {
      // Delete by athlete and KPI tag
      const { error } = await supabase
        .from("athlete_assigned_kpis")
        .delete()
        .eq("athlete_id", athleteId)
        .eq("kpi_tag_id", kpiTagId);

      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: "Either id or (athlete_id + kpi_tag_id) is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/athlete-assigned-kpis] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove athlete KPI assignment",
      },
      { status: 500 }
    );
  }
}
