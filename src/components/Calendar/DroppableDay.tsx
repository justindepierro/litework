"use client";

import { memo } from "react";
import { useDrop } from "react-dnd";
import { DRAG_TYPE, DragItem } from "./DraggableAssignment";

interface DroppableDayProps {
  date: Date;
  children: React.ReactNode;
  onDrop: (item: DragItem, date: Date) => void;
  onClick?: () => void;
  className: string;
  isCoach: boolean;
}

function DroppableDayComponent({
  date,
  children,
  onDrop,
  onClick,
  className,
  isCoach,
}: DroppableDayProps) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      canDrop: () => isCoach,
      drop: (item: DragItem) => onDrop(item, date),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, onDrop, isCoach]
  );

  const dropClassName = isCoach
    ? isOver && canDrop
      ? "ring-2 ring-accent-blue-500 bg-info-light"
      : canDrop
        ? "hover:ring-1 hover:ring-info-light"
        : ""
    : "";

  return (
    <div
      ref={isCoach ? (drop as unknown as React.Ref<HTMLDivElement>) : undefined}
      onClick={onClick}
      className={`${className} ${dropClassName}`}
    >
      {children}
    </div>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const DroppableDay = memo(
  DroppableDayComponent,
  (prevProps, nextProps) => {
    // Only re-render if date, className, or isCoach changes
    // Children changes will trigger re-render naturally
    return (
      prevProps.date.getTime() === nextProps.date.getTime() &&
      prevProps.className === nextProps.className &&
      prevProps.isCoach === nextProps.isCoach
    );
  }
);
