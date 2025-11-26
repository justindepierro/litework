"use client";

import { memo } from "react";
import { Clock, MapPin, Users, Calendar as CalendarIcon } from "lucide-react";
import { WorkoutAssignment } from "@/types";
import { Body } from "@/components/ui/Typography";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import { formatTime12Hour } from "@/lib/date-utils";
import { DraggableAssignment, DragItem } from "./DraggableAssignment";
import { DroppableDay } from "./DroppableDay";

const calendarText = {
  gridPrimary: "text-primary",
  gridMuted: "text-secondary",
  gridSubtle: "text-tertiary",
};

interface WeekViewProps {
  weekDays: Date[];
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

function WeekViewComponent({
  weekDays,
  isToday,
  getAssignmentsForDate,
  getAssignmentGroups,
  handleDrop,
  onDateClick,
  onAssignmentClick,
  isCoach,
}: WeekViewProps) {
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
                  ? `bg-accent-blue-50 border-accent-blue-300 ring-2 ring-accent-blue-200 ring-offset-1 shadow-lg ${calendarText.gridPrimary}`
                  : `bg-secondary border-subtle ${calendarText.gridPrimary} shadow-sm hover:shadow-md`
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
                      className="text-xs text-accent-blue-600 hover:text-accent-blue-700 p-1 hover:bg-accent-blue-50 rounded transition-colors"
                      title="Assign workout"
                    >
                      <Body as="span" size="lg" className="leading-none">
                        +
                      </Body>
                    </button>
                  )}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isTodayDate
                      ? "text-accent-blue-600"
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
                  ? `bg-accent-blue-50 border-accent-blue-300 ring-2 ring-accent-blue-200 ring-offset-1 shadow-lg ${calendarText.gridPrimary}`
                  : `bg-secondary border-subtle ${calendarText.gridPrimary} shadow-sm`
              } ${isCoach ? "cursor-pointer" : ""}`}
            >
              {/* Mobile day header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-3xl font-bold ${
                      isTodayDate
                        ? "text-accent-blue-600"
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
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-blue-600 text-inverse hover:bg-accent-blue-700 transition-colors touch-manipulation"
                    title="Assign workout"
                  >
                    <Body as="span" size="xl" weight="bold">
                      +
                    </Body>
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
                      className="p-3 bg-secondary rounded-lg shadow-sm hover:shadow-md hover:bg-tertiary transition-all touch-manipulation cursor-pointer"
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
                          <span>{formatTime12Hour(assignment.startTime)}</span>
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
                <div className={`text-center ${calendarText.gridSubtle} py-6`}>
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <Body size="sm">No workouts scheduled</Body>
                </div>
              )}
            </DroppableDay>
          );
        })}
      </div>
    </>
  );
}

// Memoize to prevent re-rendering when assignments haven't changed
export const WeekView = memo(WeekViewComponent, (prevProps, nextProps) => {
  // Only re-render if weekDays array reference or isCoach changes
  return (
    prevProps.weekDays === nextProps.weekDays &&
    prevProps.isCoach === nextProps.isCoach
  );
});
