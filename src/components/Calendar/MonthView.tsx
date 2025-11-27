"use client";

import { memo, useState } from "react";
import { WorkoutAssignment } from "@/types";
import { HoverCard, WorkoutPreviewCard } from "@/components/ui/HoverCard";
import { DraggableAssignment, DragItem } from "./DraggableAssignment";
import { DroppableDay } from "./DroppableDay";
import { ModalBackdrop, ModalHeader, ModalContent } from "@/components/ui/Modal";
import { Calendar, X, Dumbbell, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Body } from "@/components/ui/Typography";

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
  const [expandedDate, setExpandedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useState(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const handleDayClick = (date: Date, hasWorkouts: boolean) => {
    if (isMobile && hasWorkouts) {
      setExpandedDate(date);
    } else if (isCoach) {
      onDateClick?.(date);
    }
  };

  const expandedAssignments = expandedDate ? getAssignmentsForDate(expandedDate) : [];

  return (
    <>
    <div className="grid grid-cols-7 gap-1 md:gap-2 p-1 md:p-2">
      {/* Day headers */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
        <div
          key={day}
          className={`text-center font-semibold text-[10px] md:text-xs ${calendarText.gridMuted} uppercase tracking-wider py-2 md:py-3`}
        >
          <span className="hidden sm:inline">{day}</span>
          <span className="sm:hidden">{day.charAt(0)}</span>
        </div>
      ))}

      {/* Calendar days */}
      {monthDays.map((date, index) => {
        const dayAssignments = getAssignmentsForDate(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isTodayDate = isToday(date);
        const hasWorkouts = dayAssignments.length > 0;

        // Count workout statuses for mobile indicators
        const completedCount = dayAssignments.filter(a => a.status === 'completed').length;
        const overdueCount = dayAssignments.filter(a => {
          const scheduledDate = new Date(a.scheduledDate);
          const now = new Date();
          return a.status !== 'completed' && scheduledDate < now && scheduledDate.toDateString() !== now.toDateString();
        }).length;
        const assignedCount = dayAssignments.length - completedCount - overdueCount;

        return (
          <DroppableDay
            key={index}
            date={date}
            onDrop={handleDrop}
            isCoach={isCoach}
            onClick={() => handleDayClick(date, hasWorkouts)}
            className={`min-h-20 md:min-h-32 p-2 md:p-2.5 rounded-xl transition-all duration-300 flex flex-col border-2 ${
              isCurrentMonth
                ? `bg-linear-to-br from-white to-accent-blue-50/50 border-accent-blue-200 ${calendarText.gridPrimary} shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-accent-blue-400`
                : `bg-linear-to-br from-silver-50 to-silver-100 border-silver-300 ${calendarText.gridMuted}`
            } ${
              isTodayDate
                ? "border-accent-cyan-500 ring-2 md:ring-4 ring-accent-cyan-200/50 ring-offset-1 md:ring-offset-2 bg-linear-to-br from-accent-cyan-50 via-accent-blue-50 to-accent-purple-50 shadow-2xl"
                : ""
            } ${hasWorkouts || isCoach ? "cursor-pointer" : ""}`}
          >
            {/* Date header */}
            <div className="flex justify-between items-center mb-1 md:mb-2 shrink-0">
              <span
                className={`text-xs md:text-sm font-bold ${
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

            {/* Mobile: Show single colored badge based on priority status */}
            <div className="md:hidden flex-1 flex items-center justify-center">
              {hasWorkouts && (
                <div className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 ${
                  overdueCount > 0
                    ? "bg-linear-to-br from-accent-red-500 to-accent-orange-500 border-accent-red-600"
                    : assignedCount > 0
                      ? "bg-linear-to-br from-accent-blue-500 to-accent-cyan-500 border-accent-blue-600"
                      : "bg-linear-to-br from-accent-green-500 to-accent-emerald-500 border-accent-green-600"
                }`}>
                  <span className="text-[11px] font-bold text-white">
                    {dayAssignments.length}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop: Show full workout cards */}
            <div className="hidden md:block flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 custom-scrollbar">
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

            {/* Desktop: Show count if more than visible */}
            {dayAssignments.length > 3 && (
              <div
                className="hidden md:block text-xs text-secondary text-center mt-1 shrink-0 font-medium"
              >
                {dayAssignments.length} workouts
              </div>
            )}
          </DroppableDay>
        );
      })}
    </div>

    {/* Mobile Expanded Day Modal */}
    {isMobile && expandedDate && (
      <ModalBackdrop isOpen={true} onClose={() => setExpandedDate(null)}>
        <div className="bg-linear-to-br from-white to-accent-blue-50 rounded-2xl shadow-2xl w-full max-w-md mx-4 border-2 border-accent-blue-300">
          <ModalHeader
            title={expandedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
            icon={<Calendar className="w-6 h-6" />}
            onClose={() => setExpandedDate(null)}
          />
          <ModalContent className="p-4">
            {expandedAssignments.length > 0 ? (
              <div className="space-y-3">
                {expandedAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => {
                      onAssignmentClick?.(assignment);
                      setExpandedDate(null);
                    }}
                    className="cursor-pointer"
                  >
                    <DraggableAssignment
                      assignment={assignment}
                      onClick={() => {
                        onAssignmentClick?.(assignment);
                        setExpandedDate(null);
                      }}
                      compact={false}
                      isCoach={isCoach}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Body variant="secondary">No workouts scheduled for this day</Body>
              </div>
            )}
          </ModalContent>
        </div>
      </ModalBackdrop>
    )}
    </>
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
