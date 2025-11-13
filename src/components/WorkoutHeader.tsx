"use client";

import { useState, useEffect } from "react";
import { Clock, Menu } from "lucide-react";

interface WorkoutHeaderProps {
  workoutName: string;
  startedAt: string;
  totalExercises: number;
  completedExercises: number;
  onMenuClick: () => void;
}

export function WorkoutHeader({
  workoutName,
  startedAt,
  totalExercises,
  completedExercises,
  onMenuClick,
}: WorkoutHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [isMounted, setIsMounted] = useState(true);

  // Cleanup on unmount - only set false
  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  // Calculate elapsed time
  useEffect(() => {
    const startTime = new Date(startedAt).getTime();

    const updateElapsedTime = () => {
      if (!isMounted) return; // Don't update if unmounted

      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // seconds
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    // Update immediately
    updateElapsedTime();

    // Update every second
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [startedAt, isMounted]);

  // Calculate progress percentage
  const progressPercent =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b-2 border-silver-300 shadow-sm">
      <div className="px-4 py-3">
        {/* Top Row: Title and Menu */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900 truncate flex-1">
            {workoutName}
          </h1>
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Workout menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Bottom Row: Timer and Progress */}
        <div className="flex items-center justify-between text-sm">
          {/* Elapsed Timer */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{elapsedTime}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">
              {completedExercises}/{totalExercises} exercises
            </span>
            <span className="text-blue-600 font-bold">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar - Enhanced */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
