import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUser, isAdmin } from "@/lib/auth-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can only update their own profile (unless admin)
    if (user.id !== id && !isAdmin(user)) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can delete users
    const { user, error: authError } = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: authError || "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = getAdminClient();

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Insufficient permissions - Admin only" },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

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
