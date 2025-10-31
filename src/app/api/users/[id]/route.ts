import { NextRequest, NextResponse } from "next/server";
import { supabaseApiClient } from "@/lib/supabase-client";
import { verifyToken, isAdmin } from "@/lib/auth";

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

    // Only admins can delete users
    if (!isAdmin(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await supabaseApiClient.deleteAthlete(id);

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
    console.error("Error deleting athlete:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete athlete",
      },
      { status: 500 }
    );
  }
}
