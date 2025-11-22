import { useState, useCallback, useMemo } from "react";
import type { WorkoutAssignment } from "@/types";
import { parseDate } from "@/lib/date-utils";

export type ViewMode = "month" | "week" | "day";

interface PendingMove {
  assignment: WorkoutAssignment;
  newDate: Date;
}

/**
 * Hook for managing Calendar state
 * Handles date navigation, view mode, and move confirmation state
 */
export function useCalendarState(
  initialDate?: Date,
  initialViewMode: ViewMode = "month"
) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);

  // Date navigation helpers
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() - 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(prev.getDate() + 7);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  }, [viewMode]);

  // Move confirmation handlers
  const openMoveConfirmation = useCallback(
    (assignment: WorkoutAssignment, newDate: Date) => {
      setPendingMove({ assignment, newDate });
      setShowMoveConfirmation(true);
    },
    []
  );

  const closeMoveConfirmation = useCallback(() => {
    setShowMoveConfirmation(false);
    setPendingMove(null);
  }, []);

  // Date calculation helpers
  const startOfMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }, []);

  const startOfWeek = useCallback((date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }, []);

  const endOfWeek = useCallback(
    (date: Date) => {
      const start = startOfWeek(date);
      return new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6
      );
    },
    [startOfWeek]
  );

  const isSameDay = useCallback((date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }, []);

  const isToday = useCallback(
    (date: Date) => {
      return isSameDay(date, new Date());
    },
    [isSameDay]
  );

  // Generate calendar days
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
  }, [currentDate, startOfMonth, startOfWeek]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const days: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate, startOfWeek]);

  // Get assignments for a specific date
  const getAssignmentsForDate = useCallback(
    (assignments: WorkoutAssignment[], date: Date): WorkoutAssignment[] => {
      return assignments.filter((assignment) => {
        const assignmentDate = parseDate(assignment.scheduledDate);
        return isSameDay(assignmentDate, date);
      });
    },
    [isSameDay]
  );

  return {
    // State
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    showMoveConfirmation,
    pendingMove,

    // Navigation
    goToToday,
    goToPrevious,
    goToNext,

    // Move confirmation
    openMoveConfirmation,
    closeMoveConfirmation,

    // Date helpers
    startOfMonth,
    startOfWeek,
    endOfWeek,
    isSameDay,
    isToday,

    // Calendar data
    monthDays,
    weekDays,
    getAssignmentsForDate,
  };
}
