"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight, MoveIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

const calendarText = {
  headerPrimary: "text-primary",
  headerMuted: "text-secondary",
};

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "month" | "week" | "day";
  formatHeaderDate: () => string;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  setViewMode: (mode: "month" | "week" | "day") => void;
  isCoach: boolean;
}

function CalendarHeaderComponent({
  viewMode,
  formatHeaderDate,
  goToPrevious,
  goToNext,
  goToToday,
  setViewMode,
  isCoach,
}: CalendarHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-lg transition-all bg-linear-to-br from-accent-cyan-100 to-accent-blue-100 hover:from-accent-cyan-200 hover:to-accent-blue-200 border-2 border-accent-cyan-300 hover:border-accent-cyan-400 shadow-md hover:shadow-lg text-accent-blue-700 hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2"
            aria-label="Previous period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2
            className="text-xl font-bold bg-linear-to-r from-accent-cyan-600 via-accent-blue-600 to-accent-purple-600 bg-clip-text text-transparent min-w-64 text-center"
          >
            {formatHeaderDate()}
          </h2>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg transition-all bg-linear-to-br from-accent-blue-100 to-accent-purple-100 hover:from-accent-blue-200 hover:to-accent-purple-200 border-2 border-accent-blue-300 hover:border-accent-blue-400 shadow-md hover:shadow-lg text-accent-purple-700 hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2"
            aria-label="Next period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex items-center rounded-lg border-2 border-accent-blue-300 bg-linear-to-br from-white to-accent-blue-50 p-1 shadow-md">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "month"
                  ? "bg-linear-to-br from-accent-cyan-500 to-accent-blue-500 text-white shadow-lg scale-105 border-2 border-accent-blue-600"
                  : `text-accent-blue-600 hover:bg-accent-blue-100 border-2 border-transparent hover:scale-105`
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "week"
                  ? "bg-linear-to-br from-accent-blue-500 to-accent-purple-500 text-white shadow-lg scale-105 border-2 border-accent-purple-600"
                  : `text-accent-blue-600 hover:bg-accent-blue-100 border-2 border-transparent hover:scale-105`
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "day"
                  ? "bg-linear-to-br from-accent-purple-500 to-accent-pink-500 text-white shadow-lg scale-105 border-2 border-accent-pink-600"
                  : `text-accent-blue-600 hover:bg-accent-blue-100 border-2 border-transparent hover:scale-105`
              }`}
            >
              Day
            </button>
          </div>

          <Button
            onClick={goToToday}
            variant="secondary"
            size="sm"
            className="px-4 py-2 bg-linear-to-br from-accent-green-500 to-accent-emerald-500 hover:from-accent-green-600 hover:to-accent-emerald-600 text-white font-semibold shadow-md hover:shadow-lg border-2 border-accent-green-600 hover:border-accent-green-700"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Info banner for coaches */}
      {isCoach && (
        <div className="mb-4 p-4 bg-linear-to-br from-accent-cyan-100 via-accent-blue-100 to-accent-purple-100 border-2 border-accent-blue-300 rounded-xl text-sm shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-linear-to-br from-accent-cyan-500 to-accent-blue-500 rounded-lg shadow-md">
              <MoveIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-accent-blue-800">
              <strong className="text-accent-blue-900">Drag and drop</strong> to reschedule workouts. Group
              assignments will prompt for confirmation.
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export const CalendarHeader = memo(
  CalendarHeaderComponent,
  (prevProps, nextProps) => {
    // Only re-render if date, viewMode, or isCoach changes
    return (
      prevProps.currentDate.getTime() === nextProps.currentDate.getTime() &&
      prevProps.viewMode === nextProps.viewMode &&
      prevProps.isCoach === nextProps.isCoach
    );
  }
);
