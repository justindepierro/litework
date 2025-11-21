"use client";

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

export function CalendarHeader({
  currentDate,
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
            className={`p-2 rounded-lg transition-colors ${calendarText.headerPrimary} hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2`}
            aria-label="Previous period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2
            className={`text-xl font-semibold ${calendarText.headerPrimary} min-w-64 text-center`}
          >
            {formatHeaderDate()}
          </h2>
          <button
            onClick={goToNext}
            className={`p-2 rounded-lg transition-colors ${calendarText.headerPrimary} hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2`}
            aria-label="Next period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex items-center rounded-lg border border-subtle bg-tertiary p-1 shadow-sm">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "month"
                  ? "bg-accent-blue-50 text-accent-blue-700 font-medium shadow-sm border border-accent-blue-200"
                  : `${calendarText.headerMuted} hover:text-primary border border-transparent`
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "week"
                  ? "bg-accent-blue-50 text-accent-blue-700 font-medium shadow-sm border border-accent-blue-200"
                  : `${calendarText.headerMuted} hover:text-primary border border-transparent`
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue-500 focus-visible:ring-offset-2 ${
                viewMode === "day"
                  ? "bg-accent-blue-50 text-accent-blue-700 font-medium shadow-sm border border-accent-blue-200"
                  : `${calendarText.headerMuted} hover:text-primary border border-transparent`
              }`}
            >
              Day
            </button>
          </div>

          <Button
            onClick={goToToday}
            variant="secondary"
            size="sm"
            className="px-4 py-2"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Info banner for coaches */}
      {isCoach && (
        <div className="mb-4 p-3 bg-linear-to-br from-accent-blue-50 to-accent-indigo-50 border border-accent-blue-200 rounded-lg text-sm text-accent-blue-700 shadow-sm">
          <div className="flex items-center gap-2">
            <MoveIcon className="w-4 h-4" />
            <span>
              <strong>Drag and drop</strong> to reschedule workouts. Group
              assignments will prompt for confirmation.
            </span>
          </div>
        </div>
      )}
    </>
  );
}
