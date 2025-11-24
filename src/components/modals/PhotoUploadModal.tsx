"use client";

import React, { useState, useRef, useCallback } from "react";
import { Heading, Body, Caption, Label } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (photoId: string) => void;
  athleteId: string;
}

interface PhotoFormData {
  imageFile: File | null;
  caption: string;
  photoDate: string;
  bodyweight: string;
  bodyFatPercentage: string;
  isBeforePhoto: boolean;
  isAfterPhoto: boolean;
  linkedPhotoId: string;
  visibility: "private" | "coaches" | "group" | "public";
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
}: PhotoUploadModalProps) {
  const [formData, setFormData] = useState<PhotoFormData>({
    imageFile: null,
    caption: "",
    photoDate: new Date().toISOString().split("T")[0],
    bodyweight: "",
    bodyFatPercentage: "",
    isBeforePhoto: false,
    isAfterPhoto: false,
    linkedPhotoId: "",
    visibility: "private",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setFormData((prev) => ({ ...prev, imageFile: file }));
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (!formData.imageFile) {
      setError("Please select an image");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // TODO: Upload to Supabase Storage
      // For now, we'll simulate the upload with a placeholder URL
      const placeholderUrl = URL.createObjectURL(formData.imageFile);

      const response = await fetch("/api/progress-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: placeholderUrl, // Replace with actual Supabase Storage URL
          caption: formData.caption || null,
          photoDate: formData.photoDate,
          bodyweight: formData.bodyweight
            ? parseFloat(formData.bodyweight)
            : null,
          bodyFatPercentage: formData.bodyFatPercentage
            ? parseFloat(formData.bodyFatPercentage)
            : null,
          isBeforePhoto: formData.isBeforePhoto,
          isAfterPhoto: formData.isAfterPhoto,
          linkedPhotoId: formData.linkedPhotoId || null,
          visibility: formData.visibility,
          fileSize: formData.imageFile.size,
          mimeType: formData.imageFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();

      if (onUploadComplete) {
        onUploadComplete(data.photo.id);
      }

      // Reset form
      setFormData({
        imageFile: null,
        caption: "",
        photoDate: new Date().toISOString().split("T")[0],
        bodyweight: "",
        bodyFatPercentage: "",
        isBeforePhoto: false,
        isAfterPhoto: false,
        linkedPhotoId: "",
        visibility: "private",
      });
      setPreview(null);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title="Upload Progress Photo"
          subtitle="Track your transformation with before and after photos"
          icon={<Upload className="w-5 h-5" />}
          onClose={onClose}
        />

        <ModalContent>
          <div className="space-y-6">
            {/* File Upload Area */}
            <div>
              <Label>Photo</Label>
              {!preview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    mt-2 border-2 border-dashed rounded-lg p-8 text-center
                    transition-colors cursor-pointer
                    ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-silver-300 hover:border-primary/50 hover:bg-silver-50"
                    }
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-silver-400 mx-auto mb-4" />
                  <Heading level="h4" className="mb-2">
                    Drop your photo here
                  </Heading>
                  <Body variant="secondary" className="mb-4">
                    or click to browse (max 10MB)
                  </Body>
                  <Button variant="secondary" size="sm">
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="mt-2 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-error/90 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {error && (
                <Caption variant="error" className="mt-2">
                  {error}
                </Caption>
              )}
            </div>

            {/* Photo Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={formData.photoDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    photoDate: e.target.value,
                  }))
                }
              />

              <div>
                <Label>Visibility</Label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      visibility: e.target.value as PhotoFormData["visibility"],
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-silver-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="private">Private (only me)</option>
                  <option value="coaches">Coaches can see</option>
                  <option value="group">My group can see</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bodyweight (lbs)"
                type="number"
                step="0.1"
                value={formData.bodyweight}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bodyweight: e.target.value,
                  }))
                }
                placeholder="Optional"
              />

              <Input
                label="Body Fat %"
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bodyFatPercentage: e.target.value,
                  }))
                }
                placeholder="Optional"
              />
            </div>

            {/* Caption */}
            <Textarea
              label="Caption"
              value={formData.caption}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, caption: e.target.value }))
              }
              placeholder="Add notes about this photo..."
              rows={3}
            />

            {/* Before/After */}
            <div>
              <Label>Photo Type</Label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBeforePhoto}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isBeforePhoto: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary border-silver-300 rounded focus:ring-primary"
                  />
                  <Body>Before Photo</Body>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAfterPhoto}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAfterPhoto: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary border-silver-300 rounded focus:ring-primary"
                  />
                  <Body>After Photo</Body>
                </label>
              </div>
              <Caption variant="muted" className="mt-1">
                Mark photos to create before/after comparisons
              </Caption>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.imageFile || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
