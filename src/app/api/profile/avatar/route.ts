/**
 * Profile Picture Upload API
 * Handles avatar uploads to Supabase Storage
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/auth-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old avatar if exists
    const { data: userData } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (userData?.avatar_url) {
      const oldPath = userData.avatar_url.split("/").pop();
      if (oldPath) {
        await supabase.storage.from("avatars").remove([`avatars/${oldPath}`]);
      }
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user record with new avatar URL
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get current avatar URL
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData?.avatar_url) {
      return NextResponse.json(
        { success: false, error: "No avatar to delete" },
        { status: 404 }
      );
    }

    // Extract filename from URL
    const fileName = userData.avatar_url.split("/").pop();
    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Invalid avatar URL" },
        { status: 400 }
      );
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([`avatars/${fileName}`]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
    }

    // Update user record to remove avatar URL
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
