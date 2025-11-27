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
import { Body, Caption } from "@/components/ui/Typography";
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
      <div className="rounded-xl shadow-lg p-6 border-2 border-accent-blue-200 bg-linear-to-br from-white via-accent-blue-50/30 to-accent-purple-50/30">
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
        <div className="flex items-center gap-6 mt-6 pt-5 border-t-2 border-accent-blue-200 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-accent-blue-400 to-accent-cyan-500 shadow-md border-2 border-accent-blue-500" />
            <Caption className="font-semibold text-accent-blue-700">Assigned</Caption>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-accent-green-400 to-accent-emerald-500 shadow-md border-2 border-accent-green-500" />
            <Caption className="font-semibold text-accent-green-700">Completed</Caption>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-linear-to-br from-accent-red-400 to-accent-orange-500 shadow-md border-2 border-accent-red-500" />
            <Caption className="font-semibold text-accent-red-700">Overdue</Caption>
          </div>
        </div>
      </div>

      {/* Group Move Confirmation Modal */}
      {showMoveConfirmation && pendingMove && (
        <ModalBackdrop isOpen={showMoveConfirmation} onClose={handleCancelMove}>
          <div className="bg-linear-to-br from-white to-accent-purple-50 rounded-2xl shadow-2xl max-w-md w-full border-2 border-accent-purple-300">
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
              <div className="bg-linear-to-br from-accent-purple-100 to-accent-blue-100 p-4 rounded-xl border-2 border-accent-purple-300 shadow-md space-y-2 text-sm">
                <div>
                  <Body size="sm" weight="medium" as="span" className="text-accent-purple-900">
                    Workout:
                  </Body>{" "}
                  <span className="text-accent-purple-700">{pendingMove.assignment.workoutPlanName}</span>
                </div>
                <div>
                  <Body size="sm" weight="medium" as="span" className="text-accent-purple-900">
                    New Date:
                  </Body>{" "}
                  <span className="text-accent-purple-700">{pendingMove.newDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}</span>
                </div>
              </div>
            </ModalContent>
            <ModalFooter align="right">
              <Button
                onClick={handleCancelMove}
                variant="secondary"
                className="px-4 py-2 bg-linear-to-br from-silver-100 to-silver-50 hover:from-silver-200 hover:to-silver-100 border-2 border-silver-300 hover:border-silver-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmGroupMove}
                variant="primary"
                className="px-4 py-2 bg-linear-to-br from-accent-purple-500 to-accent-blue-500 hover:from-accent-purple-600 hover:to-accent-blue-600 shadow-lg hover:shadow-xl"
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
