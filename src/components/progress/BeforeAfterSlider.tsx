"use client";

import React, { useState, useRef, useEffect } from "react";
import { Display, Body, Caption } from "@/components/ui/Typography";
import { format } from "date-fns";

interface BeforeAfterPhoto {
  id: string;
  imageUrl: string;
  photoDate: string;
  caption?: string;
  bodyweight?: number;
  bodyFatPercentage?: number;
}

interface BeforeAfterSliderProps {
  beforePhoto: BeforeAfterPhoto;
  afterPhoto: BeforeAfterPhoto;
  className?: string;
}

export function BeforeAfterSlider({
  beforePhoto,
  afterPhoto,
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isDragging]);

  const calculateChanges = () => {
    const weightChange =
      afterPhoto.bodyweight && beforePhoto.bodyweight
        ? afterPhoto.bodyweight - beforePhoto.bodyweight
        : null;

    const bfChange =
      afterPhoto.bodyFatPercentage && beforePhoto.bodyFatPercentage
        ? afterPhoto.bodyFatPercentage - beforePhoto.bodyFatPercentage
        : null;

    return { weightChange, bfChange };
  };

  const { weightChange, bfChange } = calculateChanges();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comparison Slider */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-lg cursor-ew-resize select-none"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* After Photo (Background) */}
        <div className="absolute inset-0">
          <img
            src={afterPhoto.imageUrl}
            alt="After"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-success/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
            After
          </div>
        </div>

        {/* Before Photo (Clipped) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforePhoto.imageUrl}
            alt="Before"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-silver-700/90 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Before
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-silver-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Range & Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <Caption variant="muted" className="mb-1">
            Before
          </Caption>
          <Body className="font-semibold">
            {format(new Date(beforePhoto.photoDate), "MMM d, yyyy")}
          </Body>
          {beforePhoto.bodyweight && (
            <Caption variant="muted">{beforePhoto.bodyweight} lbs</Caption>
          )}
        </div>

        <div className="flex flex-col items-center px-4">
          <svg
            className="w-6 h-6 text-primary mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          {weightChange !== null && (
            <Caption
              variant="muted"
              className={weightChange > 0 ? "text-success" : "text-error"}
            >
              {weightChange > 0 ? "+" : ""}
              {weightChange.toFixed(1)} lbs
            </Caption>
          )}
        </div>

        <div className="flex-1 text-right">
          <Caption variant="muted" className="mb-1">
            After
          </Caption>
          <Body className="font-semibold">
            {format(new Date(afterPhoto.photoDate), "MMM d, yyyy")}
          </Body>
          {afterPhoto.bodyweight && (
            <Caption variant="muted">{afterPhoto.bodyweight} lbs</Caption>
          )}
        </div>
      </div>

      {/* Body Fat Percentage Change */}
      {bfChange !== null && (
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <Caption variant="muted" className="mb-1">
            Body Fat Change
          </Caption>
          <Display
            size="sm"
            className={bfChange < 0 ? "text-success" : "text-error"}
          >
            {bfChange > 0 ? "+" : ""}
            {bfChange.toFixed(1)}%
          </Display>
        </div>
      )}

      {/* Captions */}
      {(beforePhoto.caption || afterPhoto.caption) && (
        <div className="space-y-2">
          {beforePhoto.caption && (
            <div>
              <Caption variant="muted" className="font-semibold mb-1">
                Before Note:
              </Caption>
              <Body variant="secondary">{beforePhoto.caption}</Body>
            </div>
          )}
          {afterPhoto.caption && (
            <div>
              <Caption variant="muted" className="font-semibold mb-1">
                After Note:
              </Caption>
              <Body variant="secondary">{afterPhoto.caption}</Body>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
