"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import {
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  CheckCircle,
  Play,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { parseDate, isPast, formatTimeRange } from "@/lib/date-utils";
import { ExerciseGroupDisplay } from "./ExerciseGroupDisplay";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAsyncState } from "@/hooks/use-async-state";
import type { WorkoutAssignment, WorkoutPlan, ExerciseGroup } from "@/types";

interface WorkoutExercise {
  id: string;
  exercise_name?: string;
  exerciseName?: string;
  exercise_id?: string;
  exerciseId?: string;
  sets: number;
  reps: string | number;
  weight?: number | null;
  weight_type?: string;
  weightType?: string;
  weight_percentage?: number | null;
  weightPercentage?: number | null;
  rest_seconds?: number;
  restTime?: number;
  tempo?: string | null;
  notes?: string | null;
  order_index?: number;
  orderIndex?: number;
  group_id?: string | null;
  groupId?: string | null;
}

interface AssignmentDetail {
  id: string;
  athlete_id?: string;
  athleteId?: string;
  workout_plan_id?: string;
  workoutPlanId?: string;
  scheduled_date?: string | Date;
  scheduledDate?: string | Date;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  location?: string | null;
  coach_notes?: string | null;
  coachNotes?: string | null;
  notes?: string | null;
  status?: "assigned" | "completed" | "skipped";
  completed_at?: string | null;
  completedAt?: string | null;
  assigned_by?: string;
  assignedBy?: string;
  athlete?: {
    full_name?: string;
    fullName?: string;
  };
  assigned_by_user?: {
    full_name?: string;
    fullName?: string;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
  };
  assignedByUser?: {
    full_name?: string;
    fullName?: string;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
  };
  workout_plan?: {
    name?: string;
    description?: string | null;
    duration_minutes?: number | null;
    estimated_duration?: number | null;
    exercises?: WorkoutExercise[];
    groups?: ExerciseGroup[];
  };
  workoutPlan?: {
    name?: string;
    description?: string | null;
    duration_minutes?: number | null;
    estimatedDuration?: number | null;
    exercises?: WorkoutExercise[];
    groups?: ExerciseGroup[];
  };
  workoutPlanName?: string;
  assigned_group?: {
    name?: string;
    description?: string | null;
  };
  assignedGroup?: {
    name?: string;
    description?: string | null;
  };
}

interface WorkoutAssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  userRole: "coach" | "admin" | "athlete";
  onStartWorkout?: (assignmentId: string) => void;
  onEdit?: (assignmentId: string) => void;
  onDelete?: (assignmentId: string) => void;
}

export default function WorkoutAssignmentDetailModal({
  isOpen,
  onClose,
  assignmentId,
  userRole,
  onStartWorkout,
  onEdit,
  onDelete,
}: WorkoutAssignmentDetailModalProps) {
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const { isLoading: loading, error, execute } = useAsyncState<AssignmentDetail>();

  const isCoach = userRole === "coach" || userRole === "admin";

  // Helper functions to access fields regardless of naming convention
  const getScheduledDate = (a: AssignmentDetail | null) =>
    a?.scheduled_date || a?.scheduledDate;

  const getWorkoutName = (a: AssignmentDetail | null) =>
    a?.workoutPlanName ||
    a?.workout_plan?.name ||
    a?.workoutPlan?.name ||
    "Untitled Workout";

  const getWorkoutDescription = (a: AssignmentDetail | null) =>
    a?.workout_plan?.description || a?.workoutPlan?.description;

  const getWorkoutDuration = (a: AssignmentDetail | null) =>
    a?.workout_plan?.estimated_duration ||
    a?.workoutPlan?.estimatedDuration ||
    a?.workout_plan?.duration_minutes ||
    a?.workoutPlan?.duration_minutes;

  const getExercises = (a: AssignmentDetail | null) =>
    a?.workout_plan?.exercises || a?.workoutPlan?.exercises || [];

  const getGroups = (a: AssignmentDetail | null) =>
    a?.workout_plan?.groups || a?.workoutPlan?.groups || [];

  const getStartTime = (a: AssignmentDetail | null) =>
    a?.start_time || a?.startTime;

  const getEndTime = (a: AssignmentDetail | null) => a?.end_time || a?.endTime;

  const getLocation = (a: AssignmentDetail | null) => a?.location;

  const getNotes = (a: AssignmentDetail | null) =>
    a?.coach_notes || a?.coachNotes || a?.notes;

  const getAssignedBy = (a: AssignmentDetail | null) => {
    const user = a?.assigned_by_user || a?.assignedByUser;
    if (!user) return "Unknown Coach";
    return (
      user.full_name ||
      user.fullName ||
      `${user.first_name || user.firstName || ""} ${user.last_name || user.lastName || ""}`.trim() ||
      "Unknown Coach"
    );
  };

  const getGroupName = (a: AssignmentDetail | null) =>
    a?.assigned_group?.name || a?.assignedGroup?.name;

  const fetchAssignment = useCallback(() => 
    execute(async () => {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAssignment(data.data);
        return data.data;
      } else {
        throw new Error(data.error || "Failed to load assignment");
      }
    }), [assignmentId, execute]);

  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchAssignment();
    }
  }, [isOpen, assignmentId, fetchAssignment]);

  const handleMarkComplete = async () => {
    if (!assignment) return;

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setAssignment({
          ...assignment,
          status: "completed",
          completed_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error marking complete:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete?.(assignmentId);
        onClose();
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = () => {
    if (!assignment) return "gray";

    if (assignment.status === "completed") {
      return "green";
    }

    // Handle both string and Date types for scheduled_date
    const dateValue = getScheduledDate(assignment);
    if (!dateValue) return "blue";

    const scheduledDate =
      typeof dateValue === "string" ? parseDate(dateValue) : dateValue;

    if (isPast(scheduledDate)) {
      return "red"; // Overdue
    }

    return "blue"; // Pending
  };

  const getStatusText = () => {
    if (!assignment) return "";

    if (assignment.status === "completed") {
      return "Completed";
    }

    // Handle both string and Date types for scheduled_date
    const dateValue = getScheduledDate(assignment);
    if (!dateValue) return "Assigned";

    const scheduledDate =
      typeof dateValue === "string" ? parseDate(dateValue) : dateValue;

    if (isPast(scheduledDate)) {
      return "Overdue";
    }

    return "Assigned";
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="lg" message="Loading assignment details..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ModalHeader title="Error" onClose={onClose} />
            <ModalContent>
              <p className="text-[var(--color-text-secondary)]">{error}</p>
            </ModalContent>
          </div>
        ) : assignment ? (
          <>
            <ModalHeader title={getWorkoutName(assignment)} onClose={onClose} />
            <ModalContent>
              <div className="mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColor === "green"
                      ? "bg-[var(--color-semantic-success-lightest)] text-[var(--color-semantic-success-dark)]"
                      : statusColor === "red"
                        ? "bg-[var(--color-semantic-error-lightest)] text-[var(--color-semantic-error-dark)]"
                        : "bg-[var(--color-semantic-info-lightest)] text-[var(--color-semantic-info-dark)]"
                  }`}
                >
                  {statusText}
                </span>
                {getWorkoutDescription(assignment) && (
                  <p className="text-[var(--color-text-secondary)] mt-2">
                    {getWorkoutDescription(assignment)}
                  </p>
                )}
                {getGroupName(assignment) && (
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Group: {getGroupName(assignment)}
                    </span>
                  </div>
                )}
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-[var(--color-silver-200)] rounded-lg">
                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <Calendar className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                  <span className="font-medium">Date:</span>
                  <span>
                    {(() => {
                      const dateValue = getScheduledDate(assignment);
                      if (!dateValue) return "No date set";
                      const date =
                        typeof dateValue === "string"
                          ? parseDate(dateValue)
                          : dateValue;
                      return date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    })()}
                  </span>
                </div>

                {getStartTime(assignment) && (
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Clock className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {getEndTime(assignment)
                        ? formatTimeRange(
                            getStartTime(assignment)!,
                            getEndTime(assignment)!
                          )
                        : formatTimeRange(
                            getStartTime(assignment)!,
                            getStartTime(assignment)!
                          ).split(" - ")[0]}
                    </span>
                  </div>
                )}

                {getLocation(assignment) && (
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <MapPin className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    <span className="font-medium">Location:</span>
                    <span>{getLocation(assignment)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <User className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                  <span className="font-medium">Assigned by:</span>
                  <span>{getAssignedBy(assignment)}</span>
                </div>

                {getWorkoutDuration(assignment) && (
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <Clock className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                    <span className="font-medium">Duration:</span>
                    <span>{getWorkoutDuration(assignment)} min</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {getNotes(assignment) && (
                <Alert variant="info" title="Coach Notes" icon={<FileText />}>
                  {getNotes(assignment)}
                </Alert>
              )}

              {/* Workout Exercises with Groups */}
              {getExercises(assignment).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Workout ({getExercises(assignment).length} exercises)
                  </h3>
                  <ExerciseGroupDisplay
                    exercises={getExercises(assignment).map((ex) => ({
                      id: ex.id,
                      exerciseId: ex.exercise_id || ex.exerciseId || ex.id,
                      exerciseName:
                        ex.exercise_name || ex.exerciseName || "Exercise",
                      sets: ex.sets,
                      reps:
                        typeof ex.reps === "string"
                          ? parseInt(ex.reps)
                          : ex.reps,
                      tempo: ex.tempo || undefined,
                      weightType: "fixed" as const,
                      weight: ex.weight || undefined,
                      percentage:
                        ex.weight_percentage ||
                        ex.weightPercentage ||
                        undefined,
                      restTime: ex.rest_seconds || ex.restTime || undefined,
                      notes: ex.notes || undefined,
                      order: ex.order_index || ex.orderIndex || 0,
                      groupId: ex.group_id || ex.groupId || undefined,
                    }))}
                    groups={getGroups(assignment).map(
                      (g: {
                        id: string;
                        name: string;
                        type: string;
                        description?: string | null;
                        order_index?: number;
                        orderIndex?: number;
                        rest_between_rounds?: number | null;
                        restBetweenRounds?: number | null;
                        rest_between_exercises?: number | null;
                        restBetweenExercises?: number | null;
                        rounds?: number | null;
                        notes?: string | null;
                      }) => ({
                        id: g.id,
                        name: g.name,
                        type: g.type as "superset" | "circuit" | "section",
                        description: g.description || undefined,
                        order: g.order_index || g.orderIndex || 0,
                        restBetweenRounds:
                          g.rest_between_rounds ||
                          g.restBetweenRounds ||
                          undefined,
                        restBetweenExercises:
                          g.rest_between_exercises ||
                          g.restBetweenExercises ||
                          undefined,
                        rounds: g.rounds || undefined,
                        notes: g.notes || undefined,
                      })
                    )}
                    showProgress={false}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                {/* Athlete Actions */}
                {!isCoach && (
                  <>
                    {statusText === "Assigned" && (
                      <Button
                        onClick={() => {
                          onStartWorkout?.(assignmentId);
                          onClose();
                        }}
                        variant="primary"
                        leftIcon={<Play className="w-5 h-5" />}
                        className="flex-1"
                      >
                        Start Workout
                      </Button>
                    )}
                    {statusText === "Assigned" && (
                      <Button
                        onClick={handleMarkComplete}
                        variant="secondary"
                        leftIcon={<CheckCircle className="w-5 h-5" />}
                        className="flex-1"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {statusText === "Completed" && (
                      <div className="flex-1 p-3 bg-success-lighter border border-success-light rounded-lg text-center">
                        <CheckCircle className="w-6 h-6 text-success mx-auto mb-1" />
                        <p className="text-success-dark font-medium">
                          Workout Completed!
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Coach Actions */}
                {isCoach && (
                  <>
                    <Button
                      onClick={() => {
                        onEdit?.(assignmentId);
                        onClose();
                      }}
                      variant="secondary"
                      leftIcon={<Edit className="w-4 h-4" />}
                    >
                      Edit Assignment
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="secondary"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="text-error hover:bg-error-lighter border-error-light"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </ModalContent>
            <ModalFooter align="between">
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </div>
    </ModalBackdrop>
  );
}
