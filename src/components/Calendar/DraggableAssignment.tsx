"use client";

import { memo } from "react";
import { useDrag } from "react-dnd";
import { Body, Caption } from "@/components/ui/Typography";
import {
  Clock,
  MapPin,
  Users,
  MoveIcon,
  Dumbbell,
  CheckCircle,
} from "lucide-react";
import { WorkoutAssignment } from "@/types";
import {
  parseDate,
  isSameDay,
  isPast,
  formatTime12Hour,
} from "@/lib/date-utils";

interface DragItem {
  type: string;
  assignment: WorkoutAssignment;
}

const DRAG_TYPE = "WORKOUT_ASSIGNMENT";

const calendarText = {
  gridPrimary: "text-primary",
};

interface DraggableAssignmentProps {
  assignment: WorkoutAssignment;
  onClick: () => void;
  compact: boolean;
  isCoach: boolean;
}

function DraggableAssignmentComponent({
  assignment,
  onClick,
  compact,
  isCoach,
}: DraggableAssignmentProps) {
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
      className={`w-full text-left rounded-lg text-xs transition-all border-2 ${
        compact ? "p-1.5" : "p-2.5"
      } ${
        isCompleted
          ? "bg-linear-to-br from-accent-green-100 to-accent-emerald-100 border-accent-green-400 text-accent-green-900 shadow-md hover:shadow-xl hover:from-accent-green-200 hover:to-accent-emerald-200"
          : isOverdue
            ? "bg-linear-to-br from-accent-red-100 to-accent-orange-100 border-accent-red-400 text-accent-red-900 shadow-md hover:shadow-xl hover:from-accent-red-200 hover:to-accent-orange-200"
            : "bg-linear-to-br from-accent-blue-100 to-accent-cyan-100 border-accent-blue-400 text-accent-blue-900 shadow-md hover:shadow-xl hover:from-accent-blue-200 hover:to-accent-cyan-200"
      } hover:scale-[1.03] ${isDragging ? "opacity-50 cursor-move" : ""} ${
        isCoach ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div
        className={`flex items-center ${compact ? "gap-1" : "gap-2"} ${compact ? "" : "mb-1.5"}`}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            className={`shrink-0 ${compact ? "w-4 h-4" : "w-6 h-6"} rounded-full flex items-center justify-center shadow-md border-2 ${
              isCompleted
                ? "bg-linear-to-br from-accent-green-500 to-accent-emerald-500 border-accent-green-600"
                : isOverdue
                  ? "bg-linear-to-br from-accent-red-500 to-accent-orange-500 border-accent-red-600"
                  : "bg-linear-to-br from-accent-blue-500 to-accent-cyan-500 border-accent-blue-600"
            }`}
          >
            {isCompleted ? (
              <CheckCircle
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-inverse`}
              />
            ) : (
              <Dumbbell
                className={`${compact ? "w-2 h-2" : "w-3.5 h-3.5"} text-inverse`}
              />
            )}
          </div>
          <span
            className={`font-semibold ${calendarText.gridPrimary}`}
            style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: compact ? 2 : 3,
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
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary border border-subtle">
                <Users className="w-3 h-3 text-secondary" />
                <Body
                  as="span"
                  size="xs"
                  weight="semibold"
                  className="text-secondary"
                >
                  Group
                </Body>
              </div>
            </div>
          )}
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
                    <Body
                      as="span"
                      key={idx}
                      size="xs"
                      weight="medium"
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-secondary border border-subtle text-secondary"
                      title={name}
                    >
                      {displayName}
                    </Body>
                  );
                })}
                {assignment.athleteNames.length > 3 && (
                  <Caption className="inline-flex items-center px-1.5 py-0.5 rounded-full font-medium bg-secondary border border-subtle text-secondary">
                    +{assignment.athleteNames.length - 3}
                  </Caption>
                )}
              </div>
            )}
        </>
      )}
    </div>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const DraggableAssignment = memo(
  DraggableAssignmentComponent,
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.assignment.id === nextProps.assignment.id &&
      prevProps.assignment.workoutPlanName ===
        nextProps.assignment.workoutPlanName &&
      prevProps.assignment.status === nextProps.assignment.status &&
      prevProps.assignment.scheduledDate ===
        nextProps.assignment.scheduledDate &&
      prevProps.assignment.startTime === nextProps.assignment.startTime &&
      prevProps.assignment.location === nextProps.assignment.location &&
      prevProps.assignment.groupId === nextProps.assignment.groupId &&
      prevProps.assignment.athleteNames?.length ===
        nextProps.assignment.athleteNames?.length &&
      prevProps.compact === nextProps.compact &&
      prevProps.isCoach === nextProps.isCoach
    );
  }
);

export { DRAG_TYPE };
export type { DragItem };
