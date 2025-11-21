"use client";

import { memo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { WorkoutAssignment } from "@/types";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";
import { Card } from "@/components/ui/Card";
import { DraggableAssignment, DragItem } from "./DraggableAssignment";
import { DroppableDay } from "./DroppableDay";

const calendarText = {
  gridPrimary: "text-primary",
  gridMuted: "text-secondary",
  gridSubtle: "text-tertiary",
};

interface DayViewProps {
  currentDate: Date;
  getAssignmentsForDate: (date: Date) => WorkoutAssignment[];
  getAssignmentGroups: (
    assignment: WorkoutAssignment
  ) => Array<{ id: string; name: string; color: string }>;
  handleDrop: (item: DragItem, date: Date) => void;
  onAssignmentClick?: (assignment: WorkoutAssignment) => void;
  isCoach: boolean;
}

function DayViewComponent({
  currentDate,
  getAssignmentsForDate,
  getAssignmentGroups,
  handleDrop,
  onAssignmentClick,
  isCoach,
}: DayViewProps) {
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
                className={`mt-3 p-2 rounded text-sm bg-secondary ${calendarText.gridMuted}`}
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
}

// Memoize to prevent re-rendering when date hasn't changed
export const DayView = memo(
  DayViewComponent,
  (prevProps, nextProps) => {
    // Only re-render if currentDate or isCoach changes
    return (
      prevProps.currentDate.getTime() === nextProps.currentDate.getTime() &&
      prevProps.isCoach === nextProps.isCoach
    );
  }
);
