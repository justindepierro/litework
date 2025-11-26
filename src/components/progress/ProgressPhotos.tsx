"use client";

import React, { useState, useEffect } from "react";
import { Display, Heading, Body, Caption } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { PhotoUploadModal } from "@/components/modals/PhotoUploadModal";
import { format } from "date-fns";

interface ProgressPhoto {
  id: string;
  athleteId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  photoDate: string;
  bodyweight?: number;
  bodyFatPercentage?: number;
  isBeforePhoto: boolean;
  isAfterPhoto: boolean;
  linkedPhotoId?: string;
  visibility: "private" | "coaches" | "group" | "public";
  createdAt: string;
}

interface ProgressPhotosProps {
  athleteId: string;
  showUpload?: boolean;
  viewMode?: "grid" | "timeline" | "comparison";
  className?: string;
}

export function ProgressPhotos({
  athleteId,
  showUpload = true,
  viewMode = "grid",
  className = "",
}: ProgressPhotosProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState(viewMode);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchPhotos = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/progress-photos?athleteId=${athleteId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch progress photos");
      }

      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error("Error fetching progress photos:", err);
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setIsLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = () => {
    setIsUploadModalOpen(false);
    fetchPhotos(); // Refresh photos after upload
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(`/api/progress-photos?photoId=${photoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error("Error deleting photo:", err);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const findBeforeAfterPairs = () => {
    const pairs: Array<{ before: ProgressPhoto; after: ProgressPhoto }> = [];

    photos.forEach((photo) => {
      if (photo.isAfterPhoto && photo.linkedPhotoId) {
        const beforePhoto = photos.find((p) => p.id === photo.linkedPhotoId);
        if (beforePhoto) {
          pairs.push({ before: beforePhoto, after: photo });
        }
      }
    });

    return pairs;
  };

  const renderGridView = () => {
    if (photos.length === 0) {
      return (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-silver-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <Heading level="h3" className="mb-2">
            No Progress Photos Yet
          </Heading>
          <Body variant="secondary" className="mb-4">
            Track your transformation with before and after photos
          </Body>
          {showUpload && (
            <Button variant="primary" onClick={handleUploadClick}>
              Upload First Photo
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-lg overflow-hidden bg-silver-200 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl || photo.imageUrl}
              alt={photo.caption || `Photo from ${photo.photoDate}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
              <Caption className="text-white text-center mb-2">
                {format(new Date(photo.photoDate), "MMM d, yyyy")}
              </Caption>
              {photo.bodyweight && (
                <Caption className="text-white/80 mb-2">
                  {photo.bodyweight} lbs
                </Caption>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-2 bg-error/90 text-white rounded-full hover:bg-error transition-colors"
                  title="Delete photo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Badges */}
            {(photo.isBeforePhoto || photo.isAfterPhoto) && (
              <div className="absolute top-2 left-2 flex gap-2">
                {photo.isBeforePhoto && (
                  <Caption className="bg-silver-700/90 text-white px-2 py-1 rounded-full font-semibold">
                    Before
                  </Caption>
                )}
                {photo.isAfterPhoto && (
                  <Caption className="bg-success/90 text-white px-2 py-1 rounded-full font-semibold">
                    After
                  </Caption>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderComparisonView = () => {
    const pairs = findBeforeAfterPairs();

    if (pairs.length === 0) {
      return (
        <div className="text-center py-12">
          <Heading level="h3" className="mb-2">
            No Before/After Pairs Yet
          </Heading>
          <Body variant="secondary">
            Upload and link before/after photos to create comparisons
          </Body>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {pairs.map((pair) => (
          <BeforeAfterSlider
            key={`${pair.before.id}-${pair.after.id}`}
            beforePhoto={{
              id: pair.before.id,
              imageUrl: pair.before.imageUrl,
              photoDate: pair.before.photoDate,
              caption: pair.before.caption,
              bodyweight: pair.before.bodyweight,
              bodyFatPercentage: pair.before.bodyFatPercentage,
            }}
            afterPhoto={{
              id: pair.after.id,
              imageUrl: pair.after.imageUrl,
              photoDate: pair.after.photoDate,
              caption: pair.after.caption,
              bodyweight: pair.after.bodyweight,
              bodyFatPercentage: pair.after.bodyFatPercentage,
            }}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Body variant="secondary" className="text-error">
          {error}
        </Body>
        <Button variant="secondary" onClick={fetchPhotos} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Display size="sm">Progress Photos</Display>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-silver-200 rounded-lg p-1">
            <button
              onClick={() => setSelectedView("grid")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedView === "grid"
                  ? "bg-white text-primary shadow-sm"
                  : "text-silver-600 hover:text-silver-900"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setSelectedView("comparison")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedView === "comparison"
                  ? "bg-white text-primary shadow-sm"
                  : "text-silver-600 hover:text-silver-900"
              }`}
            >
              Compare
            </button>
          </div>

          {showUpload && (
            <Button variant="primary" onClick={handleUploadClick} size="sm">
              Upload Photo
            </Button>
          )}
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        athleteId={athleteId}
      />

      {/* Content */}
      {selectedView === "grid" ? renderGridView() : renderComparisonView()}
    </div>
  );
}
