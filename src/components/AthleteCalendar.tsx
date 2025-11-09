"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Dumbbell,
  CheckCircle,
} from "lucide-react";
import { WorkoutAssignment } from "@/types";
import { parseDate, isSameDay, isPast } from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
      !isCompleted && isPast(scheduledDate) && !isSameDay(scheduledDate, now);

    return (
      <button
        key={assignment.id}
        onClick={() => onAssignmentClick?.(assignment)}
        className={`w-full text-left p-3 rounded-lg text-xs transition-all shadow-sm ${
          isCompleted
            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-900"
            : isOverdue
              ? "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-900"
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-info-light text-navy-900"
        } hover:shadow-lg hover:scale-[1.02]`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
              isCompleted
                ? "bg-green-500"
                : isOverdue
                  ? "bg-accent-red"
                  : "bg-accent-blue"
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-white" />
            ) : (
              <Dumbbell className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="font-semibold truncate text-sm">
            {assignment.workoutPlanName || "Workout"}
          </div>
        </div>
        {!compact && (
          <>
            {assignment.startTime && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{assignment.startTime}</span>
              </div>
            )}
            {assignment.location && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{assignment.location}</span>
              </div>
            )}
            {assignment.groupId && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white bg-opacity-60 rounded-full">
                  <Users className="w-3 h-3" />
                  <span className="text-xs font-semibold">Group</span>
                </div>
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
      <div className="grid grid-cols-7 gap-2 p-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-semibold text-xs text-gray-500 uppercase tracking-wider py-3"
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
              className={`min-h-24 p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isCurrentMonth
                  ? "bg-white shadow-sm hover:shadow-md hover:scale-[1.02] border border-gray-100"
                  : "bg-gray-50 text-gray-400 border border-gray-100"
              } ${isTodayDate ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 shadow-lg" : ""}`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${
                  isTodayDate
                    ? "text-blue-600 text-lg"
                    : isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1.5">
                {dayAssignments
                  .slice(0, 2)
                  .map((assignment) => renderAssignment(assignment, true))}
                {dayAssignments.length > 2 && (
                  <div className="text-xs text-silver-700 text-center">
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
                  ? "ring-2 ring-accent-blue bg-info-lighter"
                  : "bg-white hover:bg-silver-200"
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-sm font-medium text-silver-700">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isTodayDate ? "text-accent-blue" : "text-navy-900"
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
                  <div className="text-center text-silver-600 text-sm py-4">
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
            <Card key={assignment.id} variant="default" padding="md">
              {renderAssignment(assignment, false)}
              {assignment.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Notes:</span> {assignment.notes}
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-silver-600">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No workouts scheduled for this day</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousPeriod}
            className="p-2 hover:bg-silver-200 rounded-lg transition-colors"
            aria-label="Previous period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-navy-900 min-w-64 text-center">
            {formatHeaderDate()}
          </h2>
          <button
            onClick={goToNextPeriod}
            className="p-2 hover:bg-silver-200 rounded-lg transition-colors"
            aria-label="Next period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex bg-silver-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "month"
                  ? "bg-white text-accent-blue font-medium shadow-sm"
                  : "text-silver-700 hover:text-navy-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "week"
                  ? "bg-white text-accent-blue font-medium shadow-sm"
                  : "text-silver-700 hover:text-navy-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "day"
                  ? "bg-white text-accent-blue font-medium shadow-sm"
                  : "text-silver-700 hover:text-navy-900"
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

      {/* Calendar View */}
      <div>
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-info-lighter border border-info-light" />
          <span className="text-silver-700">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success-lighter border border-success-light" />
          <span className="text-silver-700">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-error-lighter border border-error-light" />
          <span className="text-silver-700">Overdue</span>
        </div>
      </div>
    </div>
  );
}
