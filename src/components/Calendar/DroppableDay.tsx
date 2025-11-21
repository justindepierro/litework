"use client";

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

export function DroppableDay({
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
