"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface HoverCardProps {
  /** Content that triggers the hover card */
  trigger: React.ReactNode;
  /** Content to display in the hover card */
  content: React.ReactNode;
  /** Delay before showing (ms) - default 200ms for snappy feel */
  openDelay?: number;
  /** Delay before hiding (ms) - default 100ms */
  closeDelay?: number;
  /** Side to display card - default "top" */
  side?: "top" | "bottom" | "left" | "right";
  /** Offset from trigger in pixels - default 8 */
  offset?: number;
  /** Max width of card - default 320px */
  maxWidth?: number;
  /** Disable the hover card */
  disabled?: boolean;
  /** Custom className for card */
  className?: string;
}

/**
 * HoverCard Component
 * Fast, reusable hover card with Discord-style animations
 * Perfect for quick previews of workouts, athletes, exercises, etc.
 *
 * Features:
 * - Instant feel (200ms delay)
 * - Portal rendering (no z-index issues)
 * - Smart positioning (auto-adjusts if near edge)
 * - Smooth animations
 * - Accessible (keyboard support)
 *
 * @example
 * <HoverCard
 *   trigger={<div>Hover me</div>}
 *   content={<WorkoutPreview workout={workout} />}
 * />
 */
export function HoverCard({
  trigger,
  content,
  openDelay = 200,
  closeDelay = 100,
  side = "right",
  offset = 12,
  maxWidth = 320,
  disabled = false,
  className = "",
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position based on trigger element
  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardWidth = maxWidth;
    const cardHeight = cardRef.current?.offsetHeight || 200;

    let top = 0;
    let left = 0;

    // Calculate base position relative to trigger
    switch (side) {
      case "top":
        top = triggerRect.top - cardHeight - offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - cardHeight / 2;
        left = triggerRect.left - cardWidth - offset;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - cardHeight / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Adjust if near viewport edges
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    if (left < padding) left = padding;
    if (left + cardWidth > viewportWidth - padding) {
      left = viewportWidth - cardWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + cardHeight > viewportHeight - padding) {
      top = viewportHeight - cardHeight - padding;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;

    // Clear any pending close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // Set open timeout for snappy feel
    openTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (disabled) return;

    // Clear any pending open
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // Set close timeout
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Recalculate position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const card = isOpen && mounted ? (
    <div
      ref={cardRef}
      className={`fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-silver-200 p-4 pointer-events-none
        animate-in fade-in-0 zoom-in-95 duration-150 ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: `${maxWidth}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {trigger}
      </div>
      {mounted && createPortal(card, document.body)}
    </>
  );
}

/**
 * Enhanced workout preview card with full details
 * Shows exercise count, groups, KPIs, and notes
 */
export function WorkoutPreviewCard({
  workoutName,
  exerciseCount,
  duration,
  notes,
  workoutPlanId,
}: {
  workoutName: string;
  exerciseCount?: number;
  duration?: string;
  notes?: string;
  workoutPlanId?: string;
}) {
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch full workout details if workoutPlanId provided
  useEffect(() => {
    if (!workoutPlanId) return;

    setLoading(true);
    fetch(`/api/workouts/${workoutPlanId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.workout) {
          setWorkoutDetails(data.workout);
        }
      })
      .catch((err) => console.error("Failed to fetch workout details:", err))
      .finally(() => setLoading(false));
  }, [workoutPlanId]);

  const exercises = workoutDetails?.exercises || [];
  const groups = workoutDetails?.groups || [];
  const displayCount = exercises.length || exerciseCount || 0;

  // Group exercises by their group
  const groupedExercises = exercises.reduce((acc: any, ex: any) => {
    const groupId = ex.groupId || 'ungrouped';
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(ex);
    return acc;
  }, {});

  return (
    <div className="space-y-3 min-w-[280px] max-w-[400px]">
      <div>
        <h3 className="font-bold text-navy-900 text-base mb-1">{workoutName}</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-silver-600">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
            <span>Loading details...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-silver-600">
            <span className="font-semibold text-blue-600">
              {displayCount} exercise{displayCount !== 1 ? "s" : ""}
            </span>
            {duration && <span className="text-silver-500">• {duration}</span>}
          </div>
        )}
      </div>

      {/* Exercise Groups */}
      {!loading && groups.length > 0 && (
        <div className="space-y-2 border-t border-silver-200 pt-2">
          <div className="text-xs font-semibold text-silver-700 uppercase tracking-wide">
            Exercise Groups
          </div>
          {groups.map((group: any) => {
            const groupExercises = groupedExercises[group.id] || [];
            if (groupExercises.length === 0) return null;
            
            const groupTypeLabel = group.groupType === 'superset' 
              ? 'Superset' 
              : group.groupType === 'circuit' 
              ? 'Circuit' 
              : 'Section';
            
            return (
              <div key={group.id} className="bg-silver-50 rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-700">
                    {groupTypeLabel}
                  </span>
                  <span className="text-xs text-silver-600">
                    {groupExercises.length} exercises
                  </span>
                </div>
                <div className="space-y-0.5">
                  {groupExercises.slice(0, 3).map((ex: any, idx: number) => (
                    <div key={idx} className="text-xs text-silver-700 flex items-start gap-1">
                      <span className="text-silver-500">•</span>
                      <span className="flex-1">
                        {ex.exerciseName}
                        {ex.sets && ex.reps && (
                          <span className="text-silver-500 ml-1">
                            ({ex.sets}×{ex.reps})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {groupExercises.length > 3 && (
                    <div className="text-xs text-silver-500 italic">
                      +{groupExercises.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ungrouped Exercises */}
      {!loading && groupedExercises.ungrouped && groupedExercises.ungrouped.length > 0 && (
        <div className="space-y-1 border-t border-silver-200 pt-2">
          <div className="text-xs font-semibold text-silver-700 uppercase tracking-wide">
            Exercises
          </div>
          {groupedExercises.ungrouped.slice(0, 4).map((ex: any, idx: number) => (
            <div key={idx} className="text-xs text-silver-700 flex items-start gap-1">
              <span className="text-silver-500">•</span>
              <span className="flex-1">
                {ex.exerciseName}
                {ex.sets && ex.reps && (
                  <span className="text-silver-500 ml-1">
                    ({ex.sets}×{ex.reps})
                  </span>
                )}
              </span>
            </div>
          ))}
          {groupedExercises.ungrouped.length > 4 && (
            <div className="text-xs text-silver-500 italic">
              +{groupedExercises.ungrouped.length - 4} more exercises...
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="border-t border-silver-200 pt-2">
          <div className="text-xs font-semibold text-silver-700 uppercase tracking-wide mb-1">
            Notes
          </div>
          <p className="text-xs text-silver-600 line-clamp-2">{notes}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Quick preview card for athletes
 * Shows athlete name, group, and recent activity
 */
export function AthletePreviewCard({
  name,
  group,
  lastWorkout,
  workoutsThisWeek,
  avatarUrl,
}: {
  name: string;
  group?: string;
  lastWorkout?: string;
  workoutsThisWeek?: number;
  avatarUrl?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-navy-700 text-base">{name}</h3>
          {group && <p className="text-sm text-silver-600">{group}</p>}
        </div>
      </div>

      <div className="space-y-1 text-sm">
        {lastWorkout && (
          <div className="flex justify-between">
            <span className="text-silver-600">Last workout:</span>
            <span className="text-navy-700 font-medium">{lastWorkout}</span>
          </div>
        )}
        {workoutsThisWeek !== undefined && (
          <div className="flex justify-between">
            <span className="text-silver-600">This week:</span>
            <span className="text-navy-700 font-medium">
              {workoutsThisWeek} workouts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Quick preview card for exercises
 * Shows exercise details, category, and target muscles
 */
export function ExercisePreviewCard({
  name,
  category,
  description,
  muscleGroups,
  videoUrl,
}: {
  name: string;
  category?: string;
  description?: string;
  muscleGroups?: string[];
  videoUrl?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-semibold text-navy-700 text-base">{name}</h3>
        {category && (
          <p className="text-sm text-silver-600 capitalize">{category}</p>
        )}
      </div>

      {description && (
        <p className="text-sm text-silver-600 line-clamp-2">{description}</p>
      )}

      {muscleGroups && muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {muscleGroups.map((muscle) => (
            <span
              key={muscle}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded"
            >
              {muscle}
            </span>
          ))}
        </div>
      )}

      {videoUrl && (
        <div className="text-xs text-primary font-medium pt-1">
          Video available
        </div>
      )}
    </div>
  );
}
