"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dumbbell, Users } from "lucide-react";

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
 * HoverCard Component - Professional, modern design
 */
export function HoverCard({
  trigger,
  content,
  openDelay = 200,
  closeDelay = 100,
  side = "right",
  offset = 16,
  maxWidth = 440,
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardWidth = maxWidth;
    const cardHeight = cardRef.current?.offsetHeight || 300;

    let top = 0;
    let left = 0;

    switch (side) {
      case "right":
        top = triggerRect.top;
        left = triggerRect.right + offset;
        break;
      case "top":
        top = triggerRect.top - cardHeight - offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + offset;
        left = triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
        break;
      case "left":
        top = triggerRect.top;
        left = triggerRect.left - cardWidth - offset;
        break;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

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
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    openTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => calculatePosition(), 100);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const card = isOpen && mounted ? (
    <div
      ref={cardRef}
      className={`fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-none
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
 * Professional Workout Preview Card
 * Clean, modern design with proper visual hierarchy
 */
export function WorkoutPreviewCard({
  workoutName,
  exerciseCount,
  duration,
  notes,
  workoutPlanId,
  assignedGroups,
}: {
  workoutName: string;
  exerciseCount?: number;
  duration?: string;
  notes?: string;
  workoutPlanId?: string;
  assignedGroups?: string[];
}) {
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const kpiExercises = exercises.filter((ex: any) => 
    ex.exerciseName?.toLowerCase().includes('squat') ||
    ex.exerciseName?.toLowerCase().includes('bench') ||
    ex.exerciseName?.toLowerCase().includes('deadlift') ||
    ex.exerciseName?.toLowerCase().includes('press') ||
    ex.isKPI
  );

  const groupedExercises = exercises.reduce((acc: any, ex: any) => {
    const groupId = ex.groupId || 'ungrouped';
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(ex);
    return acc;
  }, {});

  return (
    <div className="w-[400px]">
      {/* Header - Sleek gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-5 py-4">
        <h3 className="font-bold text-white text-lg leading-tight mb-1.5">{workoutName}</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-sm text-blue-50">
            <span className="font-semibold">{displayCount} exercises</span>
            {duration && (
              <>
                <span className="text-blue-300">•</span>
                <span>{duration}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Assigned Groups */}
        {assignedGroups && assignedGroups.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Assigned To
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assignedGroups.map((groupName, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold"
                >
                  <Users className="w-3 h-3" />
                  {groupName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        {!loading && kpiExercises.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Key Lifts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {kpiExercises.map((ex: any, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Dumbbell className="w-3 h-3" />
                  {ex.exerciseName}
                  {ex.sets && ex.reps && (
                    <span className="ml-0.5 opacity-90 font-medium">
                      {ex.sets}×{ex.reps}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Groups */}
        {!loading && groups.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Structure
            </div>
            <div className="space-y-2">
              {groups.map((group: any) => {
                const groupExercises = groupedExercises[group.id] || [];
                if (groupExercises.length === 0) return null;
                
                const configs = {
                  superset: { label: 'Superset', color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' },
                  circuit: { label: 'Circuit', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200' },
                  section: { label: 'Section', color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
                };
                
                const cfg = configs[group.groupType as keyof typeof configs] || configs.section;
                
                return (
                  <div key={group.id} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 bg-${cfg.color}-600 text-white rounded text-xs font-bold`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {groupExercises.length} {groupExercises.length === 1 ? 'exercise' : 'exercises'}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {groupExercises.slice(0, 3).map((ex: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium">{ex.exerciseName}</span>
                            {ex.sets && ex.reps && (
                              <span className="text-gray-500 ml-2 text-xs">
                                {ex.sets}×{ex.reps}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {groupExercises.length > 3 && (
                        <div className="text-xs text-gray-500 italic pl-4">
                          +{groupExercises.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ungrouped */}
        {!loading && groupedExercises.ungrouped && groupedExercises.ungrouped.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Additional
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
              {groupedExercises.ungrouped.slice(0, 4).map((ex: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium">{ex.exerciseName}</span>
                    {ex.sets && ex.reps && (
                      <span className="text-gray-500 ml-2 text-xs">
                        {ex.sets}×{ex.reps}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {groupedExercises.ungrouped.length > 4 && (
                <div className="text-xs text-gray-500 italic pl-4">
                  +{groupedExercises.ungrouped.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Coach Notes
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Other preview cards...
export function AthletePreviewCard({ name, group, lastWorkout, workoutsThisWeek, avatarUrl }: any) {
  return <div>Athlete Preview (placeholder)</div>;
}

export function ExercisePreviewCard({ name, category, description, muscleGroups, videoUrl }: any) {
  return <div>Exercise Preview (placeholder)</div>;
}
