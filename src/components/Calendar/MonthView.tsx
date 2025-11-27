"use client";

import { memo } from "react";
import { WorkoutAssignment } from "@/types";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";
import { DraggableAssignment, DragItem } from "./DraggableAssignment";
import { DroppableDay } from "./DroppableDay";

const calendarText = {
  gridPrimary: "text-primary",
  gridMuted: "text-secondary",
};

interface MonthViewProps {
  currentDate: Date;
  monthDays: Date[];
  isToday: (date: Date) => boolean;
  getAssignmentsForDate: (date: Date) => WorkoutAssignment[];
  getAssignmentGroups: (
    assignment: WorkoutAssignment
  ) => Array<{ id: string; name: string; color: string }>;
  handleDrop: (item: DragItem, date: Date) => void;
  onDateClick?: (date: Date) => void;
  onAssignmentClick?: (assignment: WorkoutAssignment) => void;
  isCoach: boolean;
}

function MonthViewComponent({
  currentDate,
  monthDays,
  isToday,
  getAssignmentsForDate,
  getAssignmentGroups,
  handleDrop,
  onDateClick,
  onAssignmentClick,
  isCoach,
}: MonthViewProps) {
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
            className={`min-h-32 p-2.5 rounded-xl transition-all duration-300 flex flex-col border-2 ${
              isCurrentMonth
                ? `bg-linear-to-br from-white to-accent-blue-50/50 border-accent-blue-200 ${calendarText.gridPrimary} shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-accent-blue-400`
                : `bg-linear-to-br from-silver-50 to-silver-100 border-silver-300 ${calendarText.gridMuted}`
            } ${
              isTodayDate
                ? "border-accent-cyan-500 ring-4 ring-accent-cyan-200/50 ring-offset-2 bg-linear-to-br from-accent-cyan-50 via-accent-blue-50 to-accent-purple-50 shadow-2xl"
                : ""
            } ${isCoach ? "cursor-pointer" : ""}`}
          >
            {/* Date header - always visible */}
            <div className="flex justify-between items-center mb-2 shrink-0">
              <span
                className={`text-sm font-bold ${
                  isTodayDate
                    ? "bg-linear-to-r from-accent-cyan-600 to-accent-blue-600 bg-clip-text text-transparent"
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
}

// Memoize to prevent re-rendering when assignments haven't changed
export const MonthView = memo(MonthViewComponent, (prevProps, nextProps) => {
  // Only re-render if currentDate, isCoach changes, or monthDays array reference changes
  return (
    prevProps.currentDate.getTime() === nextProps.currentDate.getTime() &&
    prevProps.isCoach === nextProps.isCoach &&
    prevProps.monthDays === nextProps.monthDays
  );
});
