import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/auth/sync-status
 * Check account sync status for new users
 * Returns what data has been synced and what's pending
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    const supabase = createClient();

    try {
      // Check profile sync
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("id, first_name, last_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        return NextResponse.json(
          { error: "Failed to check profile sync" },
          { status: 500 }
        );
      }

      // Check group assignments
      const { data: groups, error: groupsError } = await supabase
        .from("athlete_groups")
        .select("id, name")
        .eq("athlete_id", user.id);

      if (groupsError) {
        return NextResponse.json(
          { error: "Failed to check group assignments" },
          { status: 500 }
        );
      }

      // Check workout assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("workout_assignments")
        .select("id, workout_plan_id")
        .eq("athlete_id", user.id)
        .limit(1);

      if (assignmentsError) {
        return NextResponse.json(
          { error: "Failed to check workout assignments" },
          { status: 500 }
        );
      }

      // Check KPI assignments
      const { data: kpis, error: kpisError } = await supabase
        .from("athlete_assigned_kpis")
        .select("id, kpi_name")
        .eq("athlete_id", user.id)
        .limit(1);

      if (kpisError) {
        return NextResponse.json(
          { error: "Failed to check KPI assignments" },
          { status: 500 }
        );
      }

      // Determine sync status
      const syncStatus = {
        profile: {
          synced: !!profile,
          data: profile
            ? {
                name: `${profile.first_name} ${profile.last_name}`,
                role: profile.role,
              }
            : null,
        },
        groups: {
          synced: true, // Groups sync is instant during invite acceptance
          count: groups?.length || 0,
          names: groups?.map((g) => g.name) || [],
        },
        workouts: {
          synced: true, // Workout assignments are instant
          count: assignments?.length || 0,
          hasWorkouts: (assignments?.length || 0) > 0,
        },
        kpis: {
          synced: true, // KPI assignments are instant
          count: kpis?.length || 0,
          hasKPIs: (kpis?.length || 0) > 0,
        },
        complete:
          !!profile &&
          (groups?.length || 0) >= 0 && // Allow 0 groups (not all athletes are in groups)
          true, // All sync operations are instant
      };

      return NextResponse.json(syncStatus);
    } catch (error) {
      console.error("Error checking sync status:", error);
      return NextResponse.json(
        { error: "Failed to check sync status" },
        { status: 500 }
      );
    }
  });
}
