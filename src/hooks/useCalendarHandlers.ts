import { useCallback } from "react";
import type { WorkoutAssignment } from "@/types";
import { parseDate } from "@/lib/date-utils";

interface DragItem {
  type: string;
  assignment: WorkoutAssignment;
}

interface UseCalendarHandlersProps {
  onAssignmentMove?: (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => Promise<void>;
  isSameDay: (date1: Date, date2: Date) => boolean;
  openMoveConfirmation: (assignment: WorkoutAssignment, newDate: Date) => void;
  closeMoveConfirmation: () => void;
  pendingMove: { assignment: WorkoutAssignment; newDate: Date } | null;
}

/**
 * Hook for managing Calendar event handlers
 * Handles drag-and-drop operations and assignment moves
 */
export function useCalendarHandlers({
  onAssignmentMove,
  isSameDay,
  openMoveConfirmation,
  closeMoveConfirmation,
  pendingMove,
}: UseCalendarHandlersProps) {
  // Handle assignment drop
  const handleDrop = useCallback(
    (item: DragItem, newDate: Date) => {
      const assignment = item.assignment;
      const oldDate = parseDate(assignment.scheduledDate);

      // Don't do anything if dropped on same date
      if (isSameDay(oldDate, newDate)) {
        return;
      }

      // If it's a group assignment, show confirmation
      if (assignment.groupId && onAssignmentMove) {
        openMoveConfirmation(assignment, newDate);
      } else if (onAssignmentMove) {
        // Individual assignment - move immediately
        onAssignmentMove(assignment.id, newDate, false);
      } else {
        console.warn("[DROP] onAssignmentMove callback is not provided");
      }
    },
    [onAssignmentMove, isSameDay, openMoveConfirmation]
  );

  // Confirm group move
  const handleConfirmGroupMove = useCallback(() => {
    if (pendingMove && onAssignmentMove) {
      onAssignmentMove(
        pendingMove.assignment.id,
        pendingMove.newDate,
        true // isGroupAssignment
      );
      closeMoveConfirmation();
    }
  }, [pendingMove, onAssignmentMove, closeMoveConfirmation]);

  // Cancel move
  const handleCancelMove = useCallback(() => {
    closeMoveConfirmation();
  }, [closeMoveConfirmation]);

  return {
    handleDrop,
    handleConfirmGroupMove,
    handleCancelMove,
  };
}
