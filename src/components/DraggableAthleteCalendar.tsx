"use client";

import { useState, useMemo, useCallback } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  MoveIcon,
} from "lucide-react";
import { WorkoutAssignment } from "@/types";

interface DraggableAthleteCalendarProps {
  assignments: WorkoutAssignment[];
  onAssignmentClick?: (assignment: WorkoutAssignment) => void;
  onDateClick?: (date: Date) => void;
  onAssignmentMove?: (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => Promise<void>;
  viewMode?: "month" | "week" | "day";
  selectedDate?: Date;
  isCoach?: boolean; // Enable drag-and-drop for coaches only
}

interface DragItem {
  type: string;
  assignment: WorkoutAssignment;
}

const DRAG_TYPE = "WORKOUT_ASSIGNMENT";

// Draggable Assignment Component
function DraggableAssignment({
  assignment,
  onClick,
  compact,
  isCoach,
}: {
  assignment: WorkoutAssignment;
  onClick: () => void;
  compact: boolean;
  isCoach: boolean;
}) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { type: DRAG_TYPE, assignment },
      canDrag: isCoach,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const didDrop = monitor.didDrop();
        console.log("[DRAG] Drag ended:", {
          workoutName: assignment.workoutPlanName,
          didDrop,
          dropResult: monitor.getDropResult(),
        });
      },
    }),
    [assignment, isCoach]
  );

  const isCompleted = assignment.status === "completed";
  const isOverdue =
    !isCompleted &&
    new Date(assignment.scheduledDate) < new Date() &&
    !isSameDay(new Date(assignment.scheduledDate), new Date());

  // Helper function
  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  return (
    <div
      ref={isCoach ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className={`w-full text-left p-2 rounded text-xs transition-all ${
        isCompleted
          ? "bg-green-50 border border-green-200 text-green-800"
          : isOverdue
            ? "bg-red-50 border border-red-200 text-red-800"
            : "bg-blue-50 border border-blue-200 text-blue-800"
      } hover:shadow-md ${isDragging ? "opacity-50 cursor-move" : ""} ${
        isCoach ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="font-medium truncate flex-1">
          {assignment.workoutPlanName || "Workout"}
        </div>
        {isCoach && <MoveIcon className="w-3 h-3 opacity-50 shrink-0" />}
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
          {assignment.groupId && (
            <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
              <Users className="w-3 h-3" />
              Group
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Droppable Calendar Day Component
function DroppableDay({
  date,
  children,
  onDrop,
  className,
  isCoach,
}: {
  date: Date;
  children: React.ReactNode;
  onDrop: (item: DragItem, date: Date) => void;
  className: string;
  isCoach: boolean;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      canDrop: () => isCoach,
      drop: (item: DragItem) => onDrop(item, date),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, onDrop, isCoach]
  );

  const dropClassName = isCoach
    ? isOver && canDrop
      ? "ring-2 ring-blue-500 bg-blue-50"
      : canDrop
        ? "hover:ring-1 hover:ring-blue-300"
        : ""
    : "";

  return (
    <div
      ref={isCoach ? (drop as unknown as React.Ref<HTMLDivElement>) : undefined}
      className={`${className} ${dropClassName}`}
    >
      {children}
    </div>
  );
}

export default function DraggableAthleteCalendar({
  assignments,
  onAssignmentClick,
  onDateClick,
  onAssignmentMove,
  viewMode: initialViewMode = "month",
  selectedDate: initialDate,
  isCoach = false,
}: DraggableAthleteCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">(
    initialViewMode
  );
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    assignment: WorkoutAssignment;
    newDate: Date;
  } | null>(null);

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
      const assignmentDate = new Date(assignment.scheduledDate);
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

  // Handle assignment drop
  const handleDrop = useCallback(
    (item: DragItem, newDate: Date) => {
      const assignment = item.assignment;
      const oldDate = new Date(assignment.scheduledDate);

      console.log("[DROP] Drop detected:", {
        assignmentId: assignment.id,
        workoutName: assignment.workoutPlanName,
        oldDate: oldDate.toDateString(),
        newDate: newDate.toDateString(),
        isGroupAssignment: !!assignment.groupId,
      });

      // Don't do anything if dropped on same date
      if (isSameDay(oldDate, newDate)) {
        console.log("[DROP] Dropped on same date, ignoring");
        return;
      }

      // If it's a group assignment, show confirmation
      if (assignment.groupId && onAssignmentMove) {
        console.log("[DROP] Group assignment - showing confirmation modal");
        setPendingMove({ assignment, newDate });
        setShowMoveConfirmation(true);
      } else if (onAssignmentMove) {
        console.log("[DROP] Individual assignment - moving immediately");
        // Individual assignment - move immediately
        onAssignmentMove(assignment.id, newDate, false);
      } else {
        console.warn("[DROP] onAssignmentMove callback is not provided");
      }
    },
    [onAssignmentMove]
  );

  // Confirm group move
  const handleConfirmGroupMove = useCallback(() => {
    if (pendingMove && onAssignmentMove) {
      onAssignmentMove(
        pendingMove.assignment.id,
        pendingMove.newDate,
        true // Move all in group
      );
      setShowMoveConfirmation(false);
      setPendingMove(null);
    }
  }, [pendingMove, onAssignmentMove]);

  // Cancel group move
  const handleCancelMove = useCallback(() => {
    setShowMoveConfirmation(false);
    setPendingMove(null);
  }, []);

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
            <DroppableDay
              key={index}
              date={date}
              onDrop={handleDrop}
              isCoach={isCoach}
              className={`min-h-24 p-2 border rounded-lg transition-all ${
                isCurrentMonth
                  ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  : "bg-gray-50 border-gray-100 text-gray-400"
              } ${isTodayDate ? "ring-2 ring-blue-500" : ""} ${
                isCoach ? "cursor-pointer" : ""
              }`}
            >
              <div
                onClick={() => onDateClick?.(date)}
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
                {dayAssignments.slice(0, 2).map((assignment) => (
                  <DraggableAssignment
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick?.(assignment)}
                    compact={true}
                    isCoach={isCoach}
                  />
                ))}
                {dayAssignments.length > 2 && (
                  <div className="text-xs text-gray-600 text-center">
                    +{dayAssignments.length - 2} more
                  </div>
                )}
              </div>
            </DroppableDay>
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
            <DroppableDay
              key={date.toISOString()}
              date={date}
              onDrop={handleDrop}
              isCoach={isCoach}
              className={`border rounded-lg p-3 transition-all ${
                isTodayDate
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "bg-white hover:bg-gray-50"
              } ${isCoach ? "cursor-pointer" : ""}`}
            >
              <div
                onClick={() => onDateClick?.(date)}
                className="text-center mb-3"
              >
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
                {dayAssignments.map((assignment) => (
                  <DraggableAssignment
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => onAssignmentClick?.(assignment)}
                    compact={false}
                    isCoach={isCoach}
                  />
                ))}
                {dayAssignments.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-4">
                    No workouts
                  </div>
                )}
              </div>
            </DroppableDay>
          );
        })}
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayAssignments = getAssignmentsForDate(currentDate);

    return (
      <DroppableDay
        date={currentDate}
        onDrop={handleDrop}
        isCoach={isCoach}
        className="space-y-4"
      >
        {dayAssignments.length > 0 ? (
          dayAssignments.map((assignment) => (
            <div key={assignment.id} className="card-primary">
              <DraggableAssignment
                assignment={assignment}
                onClick={() => onAssignmentClick?.(assignment)}
                compact={false}
                isCoach={isCoach}
              />
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
      </DroppableDay>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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

        {/* Info banner for coaches */}
        {isCoach && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <MoveIcon className="w-4 h-4" />
              <span>
                <strong>Drag and drop</strong> to reschedule workouts. Group
                assignments will prompt for confirmation.
              </span>
            </div>
          </div>
        )}

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

      {/* Group Move Confirmation Modal */}
      {showMoveConfirmation && pendingMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Move Group Assignment?
            </h3>
            <p className="text-gray-600 mb-6">
              This is a <strong>group assignment</strong>. Moving it will
              reschedule the workout for{" "}
              <strong>all athletes in the group</strong>.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 text-sm">
              <div>
                <span className="font-medium">Workout:</span>{" "}
                {pendingMove.assignment.workoutPlanName}
              </div>
              <div>
                <span className="font-medium">New Date:</span>{" "}
                {pendingMove.newDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelMove}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGroupMove}
                className="btn-primary px-4 py-2"
              >
                Move All
              </button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
}
