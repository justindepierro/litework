"use client";

import { useDrag } from "react-dnd";
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

export function DraggableAssignment({
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
      className={`w-full text-left rounded-lg text-xs transition-all border ${
        compact ? "p-1.5" : "p-2.5"
      } ${
        isCompleted
          ? "bg-success-light border-success text-success-darkest shadow-sm hover:shadow-md"
          : isOverdue
            ? "bg-error-light border-error text-error-darkest shadow-sm hover:shadow-md"
            : "bg-info-light border-accent-blue-200 text-info-dark shadow-sm hover:shadow-md"
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
                ? "bg-success"
                : isOverdue
                  ? "bg-error"
                  : "bg-accent-blue-500"
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
                <span className="text-xs font-semibold text-secondary">
                  Group
                </span>
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
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary border border-subtle text-secondary"
                      title={name}
                    >
                      {displayName}
                    </span>
                  );
                })}
                {assignment.athleteNames.length > 3 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary border border-subtle text-secondary">
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

export { DRAG_TYPE };
export type { DragItem };
