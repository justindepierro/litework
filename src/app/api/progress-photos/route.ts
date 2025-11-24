import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase-server";

/**
 * GET /api/progress-photos
 * Fetch athlete's progress photos
 * Query params: athleteId (optional, coach only), limit, beforeAfterOnly
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const athleteId = searchParams.get("athleteId") || user.id;
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const beforeAfterOnly = searchParams.get("beforeAfterOnly") === "true";

      // Check permissions
      if (
        athleteId !== user.id &&
        user.role !== "coach" &&
        user.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "Unauthorized to view photos" },
          { status: 403 }
        );
      }

      const supabase = createClient();

      let query = supabase
        .from("progress_photos")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("photo_date", { ascending: false });

      if (beforeAfterOnly) {
        query = query.or("is_before_photo.eq.true,is_after_photo.eq.true");
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: photos, error } = await query;

      if (error) {
        console.error("Error fetching progress photos:", error);
        return NextResponse.json(
          { error: "Failed to fetch photos" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, photos });
    } catch (error) {
      console.error("Error in progress-photos GET endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * POST /api/progress-photos
 * Upload a new progress photo
 * Note: Actual file upload should go through Supabase Storage first
 */
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const {
        imageUrl,
        thumbnailUrl,
        caption,
        photoDate,
        bodyweight,
        bodyFatPercentage,
        isBeforePhoto,
        isAfterPhoto,
        linkedPhotoId,
        visibility,
        fileSize,
        mimeType,
      } = body;

      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image URL is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      const photoData = {
        athlete_id: user.id,
        image_url: imageUrl,
        thumbnail_url: thumbnailUrl || null,
        caption: caption || null,
        photo_date: photoDate || new Date().toISOString().split("T")[0],
        bodyweight: bodyweight || null,
        body_fat_percentage: bodyFatPercentage || null,
        is_before_photo: isBeforePhoto || false,
        is_after_photo: isAfterPhoto || false,
        linked_photo_id: linkedPhotoId || null,
        visibility: visibility || "private",
        file_size_bytes: fileSize || null,
        mime_type: mimeType || null,
        upload_source: "web",
      };

      const { data: photo, error } = await supabase
        .from("progress_photos")
        .insert(photoData)
        .select()
        .single();

      if (error) {
        console.error("Error uploading progress photo:", error);
        return NextResponse.json(
          { error: "Failed to upload photo" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, photo }, { status: 201 });
    } catch (error) {
      console.error("Error in progress-photos POST endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * PUT /api/progress-photos
 * Update photo details (caption, visibility, measurements, etc.)
 */
export async function PUT(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const body = await request.json();
      const { photoId, ...updates } = body;

      if (!photoId) {
        return NextResponse.json(
          { error: "Photo ID is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // Verify ownership
      const { data: existingPhoto, error: fetchError } = await supabase
        .from("progress_photos")
        .select("athlete_id")
        .eq("id", photoId)
        .single();

      if (fetchError || !existingPhoto) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }

      if (existingPhoto.athlete_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to update this photo" },
          { status: 403 }
        );
      }

      const { data: photo, error } = await supabase
        .from("progress_photos")
        .update(updates)
        .eq("id", photoId)
        .select()
        .single();

      if (error) {
        console.error("Error updating progress photo:", error);
        return NextResponse.json(
          { error: "Failed to update photo" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, photo });
    } catch (error) {
      console.error("Error in progress-photos PUT endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/progress-photos
 * Delete a progress photo
 */
export async function DELETE(request: NextRequest) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const photoId = searchParams.get("photoId");

      if (!photoId) {
        return NextResponse.json(
          { error: "Photo ID is required" },
          { status: 400 }
        );
      }

      const supabase = createClient();

      // Verify ownership
      const { data: existingPhoto, error: fetchError } = await supabase
        .from("progress_photos")
        .select("athlete_id, image_url")
        .eq("id", photoId)
        .single();

      if (fetchError || !existingPhoto) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }

      if (existingPhoto.athlete_id !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to delete this photo" },
          { status: 403 }
        );
      }

      // TODO: Delete from Supabase Storage
      // const storageClient = createStorageClient();
      // await storageClient.from('progress-photos').remove([existingPhoto.image_url]);

      const { error } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photoId);

      if (error) {
        console.error("Error deleting progress photo:", error);
        return NextResponse.json(
          { error: "Failed to delete photo" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error in progress-photos DELETE endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
