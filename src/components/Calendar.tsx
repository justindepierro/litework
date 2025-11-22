"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Users } from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { WorkoutAssignment, AthleteGroup } from "@/types";
import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";
import { useCalendarState } from "@/hooks/useCalendarState";
import { useCalendarHandlers } from "@/hooks/useCalendarHandlers";
import { CalendarHeader, MonthView, WeekView, DayView } from "./Calendar/";

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
  isCoach?: boolean;
  groups?: AthleteGroup[];
}

const calendarText = {
  gridMuted: "text-secondary",
};

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
  // Initialize calendar state
  const calendarState = useCalendarState(initialDate, initialViewMode);

  // Initialize calendar handlers
  const handlers = useCalendarHandlers({
    onAssignmentMove,
    isSameDay: calendarState.isSameDay,
    openMoveConfirmation: calendarState.openMoveConfirmation,
    closeMoveConfirmation: calendarState.closeMoveConfirmation,
    pendingMove: calendarState.pendingMove,
  });

  // Destructure for cleaner access
  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    showMoveConfirmation,
    pendingMove,
    goToToday,
    goToPrevious,
    goToNext,
    startOfMonth,
    startOfWeek,
    endOfWeek,
    isSameDay,
    isToday,
    monthDays,
    weekDays,
    getAssignmentsForDate: getAssignmentsForDateFn,
  } = calendarState;

  const { handleDrop, handleConfirmGroupMove, handleCancelMove } = handlers;

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

  // Wrapper for getAssignmentsForDate to inject assignments
  const getAssignmentsForDate = (date: Date) =>
    getAssignmentsForDateFn(assignments, date);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="rounded-xl shadow-lg p-4 border border-subtle bg-primary">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          formatHeaderDate={formatHeaderDate}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
          goToToday={goToToday}
          setViewMode={setViewMode}
          isCoach={isCoach}
        />

        {/* Calendar View */}
        <div>
          {viewMode === "month" && (
            <MonthView
              currentDate={currentDate}
              monthDays={monthDays}
              isToday={isToday}
              getAssignmentsForDate={getAssignmentsForDate}
              getAssignmentGroups={getAssignmentGroups}
              handleDrop={handleDrop}
              onDateClick={onDateClick}
              onAssignmentClick={onAssignmentClick}
              isCoach={isCoach}
            />
          )}
          {viewMode === "week" && (
            <WeekView
              weekDays={weekDays}
              isToday={isToday}
              getAssignmentsForDate={getAssignmentsForDate}
              getAssignmentGroups={getAssignmentGroups}
              handleDrop={handleDrop}
              onDateClick={onDateClick}
              onAssignmentClick={onAssignmentClick}
              isCoach={isCoach}
            />
          )}
          {viewMode === "day" && (
            <DayView
              currentDate={currentDate}
              getAssignmentsForDate={getAssignmentsForDate}
              getAssignmentGroups={getAssignmentGroups}
              handleDrop={handleDrop}
              onAssignmentClick={onAssignmentClick}
              isCoach={isCoach}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-subtle text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-accent-blue-50 to-accent-blue-100 shadow-sm border border-accent-blue-200" />
            <span className={calendarText.gridMuted}>Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-success-lighter to-accent-green-100 shadow-sm border border-success-light" />
            <span className={calendarText.gridMuted}>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-linear-to-br from-error-lighter to-accent-red-50 shadow-sm border border-error-light" />
            <span className={calendarText.gridMuted}>Overdue</span>
          </div>
        </div>
      </div>

      {/* Group Move Confirmation Modal */}
      {showMoveConfirmation && pendingMove && (
        <ModalBackdrop isOpen={showMoveConfirmation} onClose={handleCancelMove}>
          <div className="bg-primary rounded-lg shadow-xl max-w-md w-full">
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
              <div className="bg-secondary p-4 rounded-lg space-y-2 text-sm">
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
