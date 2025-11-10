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
  Dumbbell,
  CheckCircle,
} from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { WorkoutAssignment, AthleteGroup } from "@/types";
import { parseDate, isSameDay, isPast, formatTime12Hour } from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";

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
  groups?: AthleteGroup[]; // Pass groups to show names in preview
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
  const scheduledDate = parseDate(assignment.scheduledDate);
  const now = new Date();
  const isOverdue =
    !isCompleted && isPast(scheduledDate) && !isSameDay(scheduledDate, now);

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
      className={`w-full text-left rounded-lg text-xs transition-all ${
        compact ? "p-1.5" : "p-2.5"
      } ${
        isCompleted
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900 shadow-sm hover:shadow-md"
          : isOverdue
            ? "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-900 shadow-sm hover:shadow-md"
            : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 shadow-sm hover:shadow-md"
      } hover:scale-[1.01] ${isDragging ? "opacity-50 cursor-move" : ""} ${
        isCoach ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div
        className={`flex items-center ${compact ? "gap-1" : "gap-2"} ${compact ? "" : "mb-1.5"}`}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            className={`shrink-0 ${compact ? "w-4 h-4" : "w-6 h-6"} rounded-full flex items-center justify-center shadow-sm ${
              isCompleted
                ? "bg-green-500"
                : isOverdue
                  ? "bg-red-500"
                  : "bg-blue-500"
            }`}
          >
            {isCompleted ? (
              <CheckCircle
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-white`}
              />
            ) : (
              <Dumbbell
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-white`}
              />
            )}
          </div>
          <span
            className={`font-semibold ${compact ? "text-xs" : "text-xs"} flex-1 min-w-0`}
            style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: compact ? 2 : 3, // 2 lines in compact, 3 in full
              WebkitBoxOrient: "vertical",
              lineHeight: compact ? "1.2" : "1.3",
            }}
            title={assignment.workoutPlanName || "Workout"}
          >
            {assignment.workoutPlanName || "Workout"}
          </span>
        </div>
        {isCoach && !compact && (
          <MoveIcon className="w-3 h-3 opacity-50 shrink-0" />
        )}
      </div>
      {!compact && (
        <>
          {assignment.startTime && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime12Hour(assignment.startTime)}</span>
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
    </div>
  );
}

// Droppable Calendar Day Component
function DroppableDay({
  date,
  children,
  onDrop,
  onClick,
  className,
  isCoach,
}: {
  date: Date;
  children: React.ReactNode;
  onDrop: (item: DragItem, date: Date) => void;
  onClick?: () => void;
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
      ? "ring-2 ring-accent-blue bg-info-lighter"
      : canDrop
        ? "hover:ring-1 hover:ring-info-light"
        : ""
    : "";

  return (
    <div
      ref={isCoach ? (drop as unknown as React.Ref<HTMLDivElement>) : undefined}
      onClick={onClick}
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
  groups = [],
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

  // Helper to get full group objects for an assignment (with colors)
  const getAssignmentGroups = (
    assignment: WorkoutAssignment
  ): Array<{ id: string; name: string; color: string }> => {
    if (!assignment.groupId) return [];
    const group = groups.find((g) => g.id === assignment.groupId);
    return group ? [{ id: group.id, name: group.name, color: group.color }] : [];
  };

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

  // Handle assignment drop
  const handleDrop = useCallback(
    (item: DragItem, newDate: Date) => {
      const assignment = item.assignment;
      const oldDate = parseDate(assignment.scheduledDate);

      console.log("[DROP] Drop detected:", {
        assignmentId: assignment.id,
        workoutName: assignment.workoutPlanName,
        oldDate: oldDate.toDateString(),
        newDate: newDate.toDateString(),
        isGroupAssignment: !!assignment.groupId,
      });

      // Don't do anything if dropped on same date
      if (isSameDay(oldDate, newDate)) {
        // [REMOVED] console.log("[DROP] Dropped on same date, ignoring");
        return;
      }

      // If it's a group assignment, show confirmation
      if (assignment.groupId && onAssignmentMove) {
        // [REMOVED] console.log("[DROP] Group assignment - showing confirmation modal");
        setPendingMove({ assignment, newDate });
        setShowMoveConfirmation(true);
      } else if (onAssignmentMove) {
        // [REMOVED] console.log("[DROP] Individual assignment - moving immediately");
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
            <DroppableDay
              key={index}
              date={date}
              onDrop={handleDrop}
              isCoach={isCoach}
              onClick={() => isCoach && onDateClick?.(date)}
              className={`min-h-32 p-2 rounded-xl transition-all duration-200 flex flex-col ${
                isCurrentMonth
                  ? "bg-white shadow-sm hover:shadow-md border border-gray-100"
                  : "bg-gray-50 text-gray-400 border border-gray-100"
              } ${isTodayDate ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 shadow-lg" : ""} ${
                isCoach ? "cursor-pointer" : ""
              }`}
            >
              {/* Date header - always visible */}
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <span
                  className={`text-sm font-bold ${
                    isTodayDate
                      ? "text-blue-600"
                      : isCurrentMonth
                        ? "text-gray-800"
                        : "text-gray-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                {isCoach && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick?.(date);
                    }}
                    className="text-accent-blue hover:text-accent-blue/80 w-5 h-5 flex items-center justify-center hover:bg-accent-blue/10 rounded transition-colors flex-shrink-0"
                    title="Assign workout"
                  >
                    <span className="text-base font-bold leading-none">+</span>
                  </button>
                )}
              </div>

              {/* Workouts - scrollable if needed */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 custom-scrollbar">
                {dayAssignments.map((assignment, idx) => (
                  <HoverCard
                    key={assignment.id}
                    trigger={
                      <DraggableAssignment
                        assignment={assignment}
                        onClick={() => onAssignmentClick?.(assignment)}
                        compact={true}
                        isCoach={isCoach}
                      />
                    }
                    content={
                      <WorkoutPreviewCard
                        workoutName={assignment.workoutPlanName || "Workout"}
                        workoutPlanId={assignment.workoutPlanId}
                        duration={assignment.startTime}
                        notes={assignment.notes}
                        assignedGroups={getAssignmentGroups(assignment)}
                      />
                    }
                    openDelay={150}
                    closeDelay={150}
                    offset={8}
                  />
                ))}
              </div>

              {/* Show count if more than visible */}
              {dayAssignments.length > 3 && (
                <div className="text-xs text-silver-600 text-center mt-1 flex-shrink-0 font-medium">
                  {dayAssignments.length} workouts
                </div>
              )}
            </DroppableDay>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    return (
      <div className="grid grid-cols-7 gap-3 p-2">
        {weekDays.map((date) => {
          const dayAssignments = getAssignmentsForDate(date);
          const isTodayDate = isToday(date);

          return (
            <DroppableDay
              key={date.toISOString()}
              date={date}
              onDrop={handleDrop}
              isCoach={isCoach}
              onClick={() => isCoach && onDateClick?.(date)}
              className={`rounded-xl p-3 transition-all duration-200 ${
                isTodayDate
                  ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 shadow-lg"
                  : "bg-white shadow-sm hover:shadow-md border border-gray-100"
              } ${isCoach ? "cursor-pointer" : ""}`}
            >
              <div className="text-center mb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-medium text-silver-700">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  {isCoach && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick?.(date);
                      }}
                      className="text-xs text-accent-blue hover:text-accent-blue/80 p-1 hover:bg-accent-blue/10 rounded transition-colors"
                      title="Assign workout"
                    >
                      <span className="text-lg leading-none">+</span>
                    </button>
                  )}
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
                {dayAssignments.map((assignment) => (
                  <HoverCard
                    key={assignment.id}
                    trigger={
                      <DraggableAssignment
                        assignment={assignment}
                        onClick={() => onAssignmentClick?.(assignment)}
                        compact={false}
                        isCoach={isCoach}
                      />
                    }
                    content={
                      <WorkoutPreviewCard
                        workoutName={assignment.workoutPlanName || "Workout"}
                        workoutPlanId={assignment.workoutPlanId}
                        duration={assignment.startTime}
                        notes={assignment.notes}
                        assignedGroups={getAssignmentGroups(assignment)}
                      />
                    }
                    openDelay={300}
                  />
                ))}
                {dayAssignments.length === 0 && (
                  <div className="text-center text-silver-600 text-sm py-4">
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
            <Card key={assignment.id} variant="default" padding="md">
              <HoverCard
                trigger={
                  <DraggableAssignment
                    assignment={assignment}
                    onClick={() => onAssignmentClick?.(assignment)}
                    compact={false}
                    isCoach={isCoach}
                  />
                }
                content={
                  <WorkoutPreviewCard
                    workoutName={assignment.workoutPlanName || "Workout"}
                    workoutPlanId={assignment.workoutPlanId}
                    duration={assignment.startTime}
                    notes={assignment.notes}
                    assignedGroups={getAssignmentGroups(assignment)}
                  />
                }
                openDelay={300}
              />
              {assignment.notes && (
                <div className="mt-3 p-2 bg-silver-200 rounded text-sm">
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
      </DroppableDay>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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

        {/* Info banner for coaches */}
        {isCoach && (
          <div className="mb-4 p-3 bg-info-lighter border border-info-light rounded-lg text-sm text-accent-blue">
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

      {/* Group Move Confirmation Modal */}
      {showMoveConfirmation && pendingMove && (
        <ModalBackdrop isOpen={showMoveConfirmation} onClose={handleCancelMove}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <ModalHeader
              title="Move Group Assignment?"
              icon={<Users className="w-6 h-6" />}
              onClose={handleCancelMove}
            />
            <ModalContent>
              <p className="text-gray-600 mb-6">
                This is a <strong>group assignment</strong>. Moving it will
                reschedule the workout for{" "}
                <strong>all athletes in the group</strong>.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
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
            </ModalContent>
            <ModalFooter align="right">
              <Button
                onClick={handleCancelMove}
                variant="secondary"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmGroupMove}
                variant="primary"
                className="px-4 py-2"
              >
                Move All
              </Button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      )}
    </DndProvider>
  );
}
