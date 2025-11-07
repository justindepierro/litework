"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { WorkoutAssignment } from "@/types";
import { parseDate, isSameDay, isPast } from "@/lib/date-utils";

interface AthleteCalendarProps {
  assignments: WorkoutAssignment[];
  onAssignmentClick?: (assignment: WorkoutAssignment) => void;
  onDateClick?: (date: Date) => void;
  viewMode?: "month" | "week" | "day";
  selectedDate?: Date;
}

export default function AthleteCalendar({
  assignments,
  onAssignmentClick,
  onDateClick,
  viewMode: initialViewMode = "month",
  selectedDate: initialDate,
}: AthleteCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">(
    initialViewMode
  );

  // Helper functions for date calculations
  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const startOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  // Get assignments for a specific date
  const getAssignmentsForDate = (date: Date): WorkoutAssignment[] => {
    return assignments.filter((assignment) => {
      const assignmentDate = parseDate(assignment.scheduledDate);
      return isSameDay(assignmentDate, date);
    });
  };

  // Generate calendar days for month view
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const startDay = startOfWeek(start);
    const days: Date[] = [];

    const day = new Date(startDay);
    // Generate 6 weeks (42 days) to fill calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Generate days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const days: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Navigation handlers
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for header
  const formatHeaderDate = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Render assignment card
  const renderAssignment = (
    assignment: WorkoutAssignment,
    compact: boolean = false
  ) => {
    const isCompleted = assignment.status === "completed";
    const scheduledDate = parseDate(assignment.scheduledDate);
    const now = new Date();
    const isOverdue =
      !isCompleted &&
      isPast(scheduledDate) &&
      !isSameDay(scheduledDate, now);

    return (
      <button
        key={assignment.id}
        onClick={() => onAssignmentClick?.(assignment)}
        className={`w-full text-left p-2 rounded text-xs transition-colors ${
          isCompleted
            ? "bg-green-50 border border-green-200 text-green-800"
            : isOverdue
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
        } hover:shadow-md`}
      >
        <div className="font-medium truncate">
          {assignment.workoutPlanName || "Workout"}
        </div>
        {!compact && (
          <>
            {assignment.startTime && (
              <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                <Clock className="w-3 h-3" />
                {assignment.startTime}
              </div>
            )}
            {assignment.location && (
              <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                <MapPin className="w-3 h-3" />
                {assignment.location}
              </div>
            )}
          </>
        )}
      </button>
    );
  };

  // Month View
  const renderMonthView = () => {
    const currentMonth = currentDate.getMonth();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-medium text-sm text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {monthDays.map((date, index) => {
          const dayAssignments = getAssignmentsForDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date)}
              className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                isCurrentMonth
                  ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  : "bg-gray-50 border-gray-100 text-gray-400"
              } ${isTodayDate ? "ring-2 ring-blue-500" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isTodayDate
                    ? "text-blue-600 font-bold"
                    : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayAssignments
                  .slice(0, 2)
                  .map((assignment) => renderAssignment(assignment, true))}
                {dayAssignments.length > 2 && (
                  <div className="text-xs text-gray-600 text-center">
                    +{dayAssignments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const dayAssignments = getAssignmentsForDate(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick?.(date)}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                isTodayDate
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-gray-600">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isTodayDate ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {dayAssignments.map((assignment) =>
                  renderAssignment(assignment, false)
                )}
                {dayAssignments.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-4">
                    No workouts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayAssignments = getAssignmentsForDate(currentDate);

    return (
      <div className="space-y-4">
        {dayAssignments.length > 0 ? (
          dayAssignments.map((assignment) => (
            <div key={assignment.id} className="card-primary">
              {renderAssignment(assignment, false)}
              {assignment.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Notes:</span> {assignment.notes}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No workouts scheduled for this day</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousPeriod}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 min-w-64 text-center">
            {formatHeaderDate()}
          </h2>
          <button
            onClick={goToNextPeriod}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "month"
                  ? "bg-white text-blue-600 font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "week"
                  ? "bg-white text-blue-600 font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "day"
                  ? "bg-white text-blue-600 font-medium shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={goToToday}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div>
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
          <span className="text-gray-600">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
          <span className="text-gray-600">Overdue</span>
        </div>
      </div>
    </div>
  );
}
