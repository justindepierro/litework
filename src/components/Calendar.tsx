"use client";

import { useState, useMemo, useCallback, CSSProperties } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
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
import {
  parseDate,
  isSameDay,
  isPast,
  formatTime12Hour,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import { Body } from "@/components/ui/Typography";

interface CalendarProps {
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

const calendarText = {
  headerPrimary: "text-(--calendar-header-text)",
  headerMuted: "text-(--calendar-header-muted)",
  gridPrimary: "text-(--calendar-grid-text)",
  gridMuted: "text-(--calendar-grid-muted)",
  gridSubtle: "text-(--calendar-grid-subtle)",
};

const calendarThemeVars: CSSProperties = {
  color: "var(--color-text-primary)",
  "--calendar-header-text": "var(--color-text-primary)",
  "--calendar-header-muted": "var(--color-text-secondary)",
  "--calendar-grid-text": "var(--color-text-primary)",
  "--calendar-grid-muted": "var(--color-text-secondary)",
  "--calendar-grid-subtle": "var(--color-text-tertiary)",
};

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
      className={`w-full text-left rounded-lg text-xs transition-all border ${
        compact ? "p-1.5" : "p-2.5"
      } ${
        isCompleted
          ? "bg-(--color-success-light) border-(--status-success) text-(--color-success-darkest) shadow-sm hover:shadow-md"
          : isOverdue
            ? "bg-(--color-error-light) border-(--status-error) text-(--color-error-darkest) shadow-sm hover:shadow-md"
            : "bg-(--color-info-lightest) border-(--accent-blue-200) text-(--color-info-dark) shadow-sm hover:shadow-md"
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
                ? "bg-(--status-success)"
                : isOverdue
                  ? "bg-(--status-error)"
                  : "bg-(--accent-blue-500)"
            }`}
          >
            {isCompleted ? (
              <CheckCircle
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-(--text-inverse)`}
              />
            ) : (
              <Dumbbell
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-(--text-inverse)`}
              />
            )}
          </div>
          <span
            className={`font-semibold ${calendarText.gridPrimary}`}
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
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--bg-secondary) border border-(--border-subtle)">
                <Users className="w-3 h-3 text-(--text-secondary)" />
                <span className="text-xs font-semibold text-(--text-secondary)">
                  Group
                </span>
              </div>
            </div>
          )}
          {/* Show athlete badges for individual assignments */}
          {!assignment.groupId &&
            assignment.athleteNames &&
            assignment.athleteNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {assignment.athleteNames.slice(0, 3).map((name, idx) => {
                  const nameParts = name.trim().split(" ");
                  const firstName = nameParts[0] || "";
                  const lastName = nameParts[nameParts.length - 1] || "";
                  const initial = firstName.charAt(0).toUpperCase();
                  const displayName = `${initial}. ${lastName}`;

                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-(--bg-secondary) border border-(--border-subtle) text-(--text-secondary)"
                      title={name}
                    >
                      {displayName}
                    </span>
                  );
                })}
                {assignment.athleteNames.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-(--bg-secondary) border border-(--border-subtle) text-(--text-secondary)">
                    +{assignment.athleteNames.length - 3}
                  </span>
                )}
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
      ? "ring-2 ring-(--accent-blue-500) bg-(--color-info-lighter)"
      : canDrop
        ? "hover:ring-1 hover:ring-(--color-info-light)"
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

export default function Calendar({
  assignments,
  onAssignmentClick,
  onDateClick,
  onAssignmentMove,
  viewMode: initialViewMode = "month",
  selectedDate: initialDate,
  isCoach = false,
  groups = [],
}: CalendarProps) {
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
    return group
      ? [{ id: group.id, name: group.name, color: group.color }]
      : [];
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

      // [REMOVED] console.log("[DROP] Drop detected:", { assignmentId: assignment.id, workoutName: assignment.workoutPlanName, oldDate: oldDate.toDateString(), newDate: newDate.toDateString(), isGroupAssignment: !!assignment.groupId });

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
            className={`text-center font-semibold text-xs ${calendarText.gridMuted} uppercase tracking-wider py-3`}
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
              className={`min-h-32 p-2 rounded-xl transition-all duration-200 flex flex-col border ${
                isCurrentMonth
                  ? `bg-(--bg-secondary) border-(--border-subtle) ${calendarText.gridPrimary} shadow-sm hover:shadow-md hover:scale-[1.01]`
                  : `bg-(--bg-tertiary) border-(--border-subtle) ${calendarText.gridMuted}`
              } ${
                isTodayDate
                  ? "border-(--accent-blue-400) ring-2 ring-(--accent-blue-200) ring-offset-1 bg-(--accent-blue-50) shadow-lg"
                  : ""
              } ${isCoach ? "cursor-pointer" : ""}`}
            >
              {/* Date header - always visible */}
              <div className="flex justify-between items-center mb-2 shrink-0">
                <span
                  className={`text-sm font-bold ${
                    isTodayDate
                      ? "text-(--accent-blue-600)"
                      : isCurrentMonth
                        ? calendarText.gridPrimary
                        : calendarText.gridMuted
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Workouts - scrollable if needed */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 custom-scrollbar">
                {dayAssignments.map((assignment) => (
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
                        athleteNames={assignment.athleteNames}
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
                <div
                  className={`text-xs ${calendarText.gridMuted} text-center mt-1 shrink-0 font-medium`}
                >
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
      <>
        {/* Desktop: 7-column grid */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-3 p-2">
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
                className={`rounded-xl p-3 transition-all duration-200 border ${
                  isTodayDate
                    ? `bg-(--accent-blue-50) border-(--accent-blue-300) ring-2 ring-(--accent-blue-200) ring-offset-1 shadow-lg ${calendarText.gridPrimary}`
                    : `bg-(--bg-secondary) border-(--border-subtle) ${calendarText.gridPrimary} shadow-sm hover:shadow-md`
                } ${isCoach ? "cursor-pointer" : ""}`}
              >
                <div className="text-center mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div
                      className={`text-sm font-medium ${calendarText.gridMuted}`}
                    >
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    {isCoach && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateClick?.(date);
                        }}
                        className="text-xs text-(--accent-blue-600) hover:text-(--accent-blue-700) p-1 hover:bg-(--accent-blue-50) rounded transition-colors"
                        title="Assign workout"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      isTodayDate
                        ? "text-(--accent-blue-600)"
                        : calendarText.gridPrimary
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
                          athleteNames={assignment.athleteNames}
                        />
                      }
                      openDelay={300}
                    />
                  ))}
                  {dayAssignments.length === 0 && (
                    <div
                      className={`text-center ${calendarText.gridSubtle} text-sm py-4`}
                    >
                      No workouts
                    </div>
                  )}
                </div>
              </DroppableDay>
            );
          })}
        </div>

        {/* Mobile: Vertical list with expanded day cards */}
        <div className="sm:hidden space-y-3 p-3">
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
                className={`rounded-xl p-4 transition-all duration-200 border ${
                  isTodayDate
                    ? `bg-(--accent-blue-50) border-(--accent-blue-300) ring-2 ring-(--accent-blue-200) ring-offset-1 shadow-lg ${calendarText.gridPrimary}`
                    : `bg-(--bg-secondary) border-(--border-subtle) ${calendarText.gridPrimary} shadow-sm`
                } ${isCoach ? "cursor-pointer" : ""}`}
              >
                {/* Mobile day header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-(--border-subtle)">
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl font-bold ${
                        isTodayDate
                          ? "text-(--accent-blue-600)"
                          : calendarText.gridPrimary
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div>
                      <div
                        className={`text-base font-semibold ${calendarText.gridPrimary}`}
                      >
                        {date.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className={`text-sm ${calendarText.gridMuted}`}>
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  {isCoach && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick?.(date);
                      }}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-(--accent-blue-600) text-(--text-inverse) hover:bg-(--accent-blue-700) transition-colors touch-manipulation"
                      title="Assign workout"
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                  )}
                </div>

                {/* Workout list */}
                {dayAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        onClick={() => onAssignmentClick?.(assignment)}
                        className="p-3 bg-(--bg-secondary) rounded-lg shadow-sm hover:shadow-md hover:bg-(--bg-tertiary) transition-all touch-manipulation cursor-pointer"
                      >
                        <div
                          className={`font-semibold ${calendarText.gridPrimary} mb-1`}
                        >
                          {assignment.workoutPlanName || "Workout"}
                        </div>
                        {assignment.startTime && (
                          <div
                            className={`flex items-center gap-1.5 text-xs ${calendarText.gridMuted}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {formatTime12Hour(assignment.startTime)}
                            </span>
                          </div>
                        )}
                        {assignment.location && (
                          <div
                            className={`flex items-center gap-1.5 text-xs ${calendarText.gridMuted} mt-1`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{assignment.location}</span>
                          </div>
                        )}
                        {/* Show athlete badges for individual assignments */}
                        {!assignment.groupId &&
                          assignment.athleteNames &&
                          assignment.athleteNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {assignment.athleteNames.map((name, idx) => (
                                <Badge
                                  key={idx}
                                  variant="primary"
                                  size="sm"
                                  title={name}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        {assignment.groupId && (
                          <div className="flex items-center gap-1 mt-2">
                            <Users
                              className={`w-3 h-3 ${calendarText.gridMuted}`}
                            />
                            <span
                              className={`text-xs ${calendarText.gridMuted} font-medium`}
                            >
                              Group
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-center ${calendarText.gridSubtle} py-6`}
                  >
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No workouts scheduled</p>
                  </div>
                )}
              </DroppableDay>
            );
          })}
        </div>
      </>
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
                    athleteNames={assignment.athleteNames}
                  />
                }
                openDelay={300}
              />
              {assignment.notes && (
                <div
                  className={`mt-3 p-2 rounded text-sm bg-(--bg-secondary) ${calendarText.gridMuted}`}
                >
                  <span className={`font-medium ${calendarText.gridPrimary}`}>
                    Notes:
                  </span>{" "}
                  {assignment.notes}
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className={`text-center py-12 ${calendarText.gridSubtle}`}>
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No workouts scheduled for this day</p>
          </div>
        )}
      </DroppableDay>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="rounded-xl shadow-lg p-4 border border-(--border-subtle) bg-(--bg-primary)"
        style={calendarThemeVars}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousPeriod}
              className={`p-2 rounded-lg transition-colors ${calendarText.headerPrimary} hover:bg-(--bg-tertiary) focus-visible:ring-2 focus-visible:ring-(--accent-blue-500) focus-visible:ring-offset-2`}
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
              onClick={goToNextPeriod}
              className={`p-2 rounded-lg transition-colors ${calendarText.headerPrimary} hover:bg-(--bg-tertiary) focus-visible:ring-2 focus-visible:ring-(--accent-blue-500) focus-visible:ring-offset-2`}
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode selector */}
            <div className="flex items-center rounded-lg border border-(--border-subtle) bg-(--bg-tertiary) p-1 shadow-sm">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--accent-blue-500) focus-visible:ring-offset-2 ${
                  viewMode === "month"
                    ? "bg-(--accent-blue-50) text-(--accent-blue-700) font-medium shadow-sm border border-(--accent-blue-200)"
                    : `${calendarText.headerMuted} hover:text-(--calendar-header-text) border border-transparent`
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--accent-blue-500) focus-visible:ring-offset-2 ${
                  viewMode === "week"
                    ? "bg-(--accent-blue-50) text-(--accent-blue-700) font-medium shadow-sm border border-(--accent-blue-200)"
                    : `${calendarText.headerMuted} hover:text-(--calendar-header-text) border border-transparent`
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:ring-(--accent-blue-500) focus-visible:ring-offset-2 ${
                  viewMode === "day"
                    ? "bg-(--accent-blue-50) text-(--accent-blue-700) font-medium shadow-sm border border-(--accent-blue-200)"
                    : `${calendarText.headerMuted} hover:text-(--calendar-header-text) border border-transparent`
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
          <div className="mb-4 p-3 bg-linear-to-br from-(--accent-blue-50) to-(--accent-indigo-50) border border-(--accent-blue-200) rounded-lg text-sm text-(--accent-blue-700) shadow-sm">
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
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-(--border-subtle) text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-(--accent-blue-50) to-(--accent-blue-100) shadow-sm border border-(--accent-blue-200)" />
            <span className={calendarText.gridMuted}>Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-(--status-success-light) to-(--accent-green-100) shadow-sm border border-(--status-success-light)" />
            <span className={calendarText.gridMuted}>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-(--status-error-light) to-(--accent-red-50) shadow-sm border border-(--status-error-light)" />
            <span className={calendarText.gridMuted}>Overdue</span>
          </div>
        </div>
      </div>

      {/* Group Move Confirmation Modal */}
      {showMoveConfirmation && pendingMove && (
        <ModalBackdrop isOpen={showMoveConfirmation} onClose={handleCancelMove}>
          <div className="bg-(--bg-primary) rounded-lg shadow-xl max-w-md w-full">
            <ModalHeader
              title="Move Group Assignment?"
              icon={<Users className="w-6 h-6" />}
              onClose={handleCancelMove}
            />
            <ModalContent>
              <Body variant="secondary" className="mb-6">
                This is a <strong>group assignment</strong>. Moving it will
                reschedule the workout for{" "}
                <strong>all athletes in the group</strong>.
              </Body>
              <div className="bg-(--bg-secondary) p-4 rounded-lg space-y-2 text-sm">
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
