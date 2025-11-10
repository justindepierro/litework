"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Dumbbell, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { KPITagBadge } from "@/components/ui/KPITagBadge";

interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: "top" | "bottom" | "left" | "right";
  offset?: number;
  maxWidth?: number;
  disabled?: boolean;
  className?: string;
}

interface WorkoutPreviewCardProps {
  workoutName: string;
  exerciseCount?: number;
  duration?: string;
  notes?: string;
  workoutPlanId: string;
  assignedGroups?: string[];
}

interface KPITag {
  id: string;
  name: string;
  displayName: string;
  color: string;
}

interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets?: number;
  reps?: string;
  weight?: string;
  weightUnit?: string;
  tempo?: string;
  groupId?: string | null;
}

interface ExerciseGroup {
  id: string;
  groupType: "superset" | "circuit" | "section";
  sets?: number;
  orderIndex: number;
}

interface WorkoutDetails {
  exercises: WorkoutExercise[];
  groups: ExerciseGroup[];
  kpiTags?: KPITag[];
}

export function HoverCard({
  trigger,
  content,
  openDelay = 200,
  closeDelay = 100,
  side = "right",
  offset = 8,
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

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !cardRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const cardWidth = cardRect.width || maxWidth;
    const cardHeight = cardRect.height || 400;

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
      top = Math.max(padding, viewportHeight - cardHeight - padding);
    }

    setPosition({ top, left });
  }, [side, offset, maxWidth]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, openDelay);
  }, [disabled, openDelay]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  }, [disabled, closeDelay]);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => calculatePosition(), 50);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [isOpen, calculatePosition]);

  const card = isOpen && mounted ? (
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        top: position.top + "px",
        left: position.left + "px",
        maxWidth: maxWidth + "px",
        zIndex: 99999,
        backgroundColor: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
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
        style={{ display: "inline-block" }}
      >
        {trigger}
      </div>
      {mounted && createPortal(card, document.body)}
    </>
  );
}

export function WorkoutPreviewCard({
  workoutName,
  exerciseCount,
  duration,
  notes,
  workoutPlanId,
  assignedGroups = [],
}: WorkoutPreviewCardProps) {
  const [loading, setLoading] = useState(true);
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);

  useEffect(() => {
    if (!workoutPlanId) return;

    setLoading(true);

    Promise.all([
      fetch("/api/workouts/" + workoutPlanId).then((r) => r.json()),
      fetch("/api/kpi-tags").then((r) => r.json()),
    ])
      .then(([workoutData, kpiData]) => {
        if (workoutData.success) {
          setWorkoutDetails({
            exercises: workoutData.data.exercises || [],
            groups: workoutData.data.groups || [],
            kpiTags: kpiData.success ? kpiData.data : [],
          });
        }
      })
      .catch((err) => console.error("Failed to fetch workout details:", err))
      .finally(() => setLoading(false));
  }, [workoutPlanId]);

  const exercises = workoutDetails?.exercises || [];
  const groups = workoutDetails?.groups || [];
  const kpiTags = workoutDetails?.kpiTags || [];
  const displayCount = exercises.length || exerciseCount || 0;

  const getKpiForExercise = (exerciseName: string): KPITag | null => {
    const nameLower = exerciseName.toLowerCase();
    for (const tag of kpiTags) {
      const tagNameLower = tag.name.toLowerCase();
      const tagDisplayLower = tag.displayName.toLowerCase();
      if (nameLower.includes(tagDisplayLower) || nameLower.includes(tagNameLower)) {
        return tag;
      }
    }
    return null;
  };

  const kpiExercises = exercises.filter((ex) => getKpiForExercise(ex.exerciseName));

  const groupedExercises = exercises.reduce((acc, ex) => {
    const groupId = ex.groupId || "ungrouped";
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push(ex);
    return acc;
  }, {} as Record<string, WorkoutExercise[]>);

  const getGroupConfig = (groupType: string) => {
    const configs = {
      superset: { label: "Superset", bg: "#faf5ff", border: "#e9d5ff", badge: "#9333ea" },
      circuit: { label: "Circuit", bg: "#fff7ed", border: "#fed7aa", badge: "#ea580c" },
      section: { label: "Section", bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb" },
    };
    return configs[groupType as keyof typeof configs] || configs.section;
  };

  return (
    <div style={{ width: "400px" }}>
      <div
        style={{
          background: "linear-gradient(to bottom right, #2563eb, #1e40af, #4338ca)",
          padding: "1.25rem",
          color: "white",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "bold",
            marginBottom: "0.375rem",
            lineHeight: "1.4",
          }}
        >
          {workoutName}
        </h3>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
            <span>Loading...</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem" }}>
            <span style={{ fontWeight: "600" }}>{displayCount} exercises</span>
            {duration && (
              <>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>•</span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{duration}</span>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {assignedGroups.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Assigned To
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {assignedGroups.map((groupName, idx) => (
                <Badge key={idx} variant="primary" size="sm">
                  <Users className="w-3 h-3" />
                  {groupName}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {!loading && kpiExercises.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Key Lifts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {kpiExercises.map((ex, idx) => {
                const kpiTag = getKpiForExercise(ex.exerciseName);
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      backgroundColor: "#f9fafb",
                      borderRadius: "0.5rem",
                      padding: "0.5rem 0.75rem",
                    }}
                  >
                    <Dumbbell style={{ width: "1rem", height: "1rem", color: "#9ca3af" }} />
                    <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827", flex: "1" }}>
                      {ex.exerciseName}
                    </span>
                    {kpiTag && (
                      <KPITagBadge
                        name={kpiTag.name}
                        displayName={kpiTag.displayName}
                        color={kpiTag.color}
                        size="sm"
                        showTooltip={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!loading && groups.length > 0 && (
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Structure
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {groups.map((group) => {
                const groupExercises = groupedExercises[group.id] || [];
                if (groupExercises.length === 0) return null;
                const cfg = getGroupConfig(group.groupType);
                return (
                  <div
                    key={group.id}
                    style={{
                      backgroundColor: cfg.bg,
                      border: "1px solid " + cfg.border,
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          style={{
                            padding: "0.125rem 0.5rem",
                            backgroundColor: cfg.badge,
                            color: "white",
                            borderRadius: "0.25rem",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          {cfg.label}
                        </span>
                        {group.sets && group.sets > 1 && (
                          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#4b5563" }}>
                            {group.sets} {group.groupType === "circuit" ? "rounds" : "sets"}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "#6b7280" }}>
                        {groupExercises.length} {groupExercises.length === 1 ? "exercise" : "exercises"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {groupExercises.map((ex, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            fontSize: "0.875rem",
                            backgroundColor: "white",
                            borderRadius: "0.25rem",
                            padding: "0.375rem 0.5rem",
                          }}
                        >
                          <span style={{ marginTop: "0.125rem", fontWeight: "bold", color: "#9ca3af" }}>
                            {idx + 1}.
                          </span>
                          <div style={{ flex: "1", minWidth: "0" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.5rem",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: "500",
                                  color: "#111827",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ex.exerciseName}
                              </span>
                              {ex.sets && ex.reps && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color: "#4b5563",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {ex.sets}×{ex.reps}
                                </span>
                              )}
                            </div>
                            {ex.weight && (
                              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
                                {ex.weight} {ex.weightUnit || "lbs"}
                              </div>
                            )}
                            {ex.tempo && (
                              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Tempo: {ex.tempo}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {notes && (
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Coach Notes
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#374151",
                backgroundColor: "#f9fafb",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
            >
              {notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
