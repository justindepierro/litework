"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
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
import { parseDate, isToday, isPast } from "@/lib/date-utils";
import { ExerciseGroupDisplay } from "./ExerciseGroupDisplay";
import type { WorkoutExercise as WorkoutExerciseType, ExerciseGroup } from "@/types";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCoach = userRole === "coach" || userRole === "admin";

  // Helper functions to access fields regardless of naming convention
  const getScheduledDate = (a: AssignmentDetail | null) => 
    a?.scheduled_date || a?.scheduledDate;
  
  const getWorkoutName = (a: AssignmentDetail | null) => 
    a?.workoutPlanName || a?.workout_plan?.name || a?.workoutPlan?.name || 'Untitled Workout';
  
  const getWorkoutDescription = (a: AssignmentDetail | null) =>
    a?.workout_plan?.description || a?.workoutPlan?.description;
  
  const getWorkoutDuration = (a: AssignmentDetail | null) =>
    a?.workout_plan?.estimated_duration || a?.workoutPlan?.estimatedDuration || 
    a?.workout_plan?.duration_minutes || a?.workoutPlan?.duration_minutes;
  
  const getExercises = (a: AssignmentDetail | null) =>
    a?.workout_plan?.exercises || a?.workoutPlan?.exercises || [];
  
  const getGroups = (a: AssignmentDetail | null) =>
    a?.workout_plan?.groups || a?.workoutPlan?.groups || [];
  
  const getStartTime = (a: AssignmentDetail | null) =>
    a?.start_time || a?.startTime;
  
  const getEndTime = (a: AssignmentDetail | null) =>
    a?.end_time || a?.endTime;
  
  const getLocation = (a: AssignmentDetail | null) =>
    a?.location;
  
  const getNotes = (a: AssignmentDetail | null) =>
    a?.coach_notes || a?.coachNotes || a?.notes;
  
  const getAssignedBy = (a: AssignmentDetail | null) => {
    const user = a?.assigned_by_user || a?.assignedByUser;
    if (!user) return 'Unknown Coach';
    return user.full_name || user.fullName || 
           `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() ||
           'Unknown Coach';
  };
  
  const getGroupName = (a: AssignmentDetail | null) =>
    a?.assigned_group?.name || a?.assignedGroup?.name;

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/assignments/${assignmentId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAssignment(data.data);
      } else {
        setError(data.error || "Failed to load assignment");
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

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
    
    const scheduledDate = typeof dateValue === 'string' 
      ? parseDate(dateValue)
      : dateValue;
    
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
    
    const scheduledDate = typeof dateValue === 'string'
      ? parseDate(dateValue)
      : dateValue;

    if (isPast(scheduledDate)) {
      return "Overdue";
    }

    return "Assigned";
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignment details...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-red-600">Error</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : assignment ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getWorkoutName(assignment)}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColor === "green"
                        ? "bg-green-100 text-green-800"
                        : statusColor === "red"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
                {getWorkoutDescription(assignment) && (
                  <p className="text-gray-600">
                    {getWorkoutDescription(assignment)}
                  </p>
                )}
                {getGroupName(assignment) && (
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Group: {getGroupName(assignment)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 p-1 ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Assignment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Date:</span>
                <span>
                  {(() => {
                    const dateValue = getScheduledDate(assignment);
                    if (!dateValue) return 'No date set';
                    const date = typeof dateValue === 'string'
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
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>
                    {getStartTime(assignment)}
                    {getEndTime(assignment) && ` - ${getEndTime(assignment)}`}
                  </span>
                </div>
              )}

              {getLocation(assignment) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Location:</span>
                  <span>{getLocation(assignment)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Assigned by:</span>
                <span>{getAssignedBy(assignment)}</span>
              </div>

              {getWorkoutDuration(assignment) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Duration:</span>
                  <span>{getWorkoutDuration(assignment)} min</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {getNotes(assignment) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      Coach Notes
                    </h3>
                    <p className="text-blue-800">{getNotes(assignment)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workout Exercises with Groups */}
            {getExercises(assignment).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Workout ({getExercises(assignment).length} exercises)
                </h3>
                <ExerciseGroupDisplay
                  exercises={getExercises(assignment).map(ex => ({
                    id: ex.id,
                    exerciseId: ex.exercise_id || ex.exerciseId || ex.id,
                    exerciseName: ex.exercise_name || ex.exerciseName || 'Exercise',
                    sets: ex.sets,
                    reps: typeof ex.reps === 'string' ? parseInt(ex.reps) : ex.reps,
                    tempo: ex.tempo || undefined,
                    weightType: "fixed" as const,
                    weight: ex.weight || undefined,
                    percentage: ex.weight_percentage || ex.weightPercentage || undefined,
                    restTime: ex.rest_seconds || ex.restTime || undefined,
                    notes: ex.notes || undefined,
                    order: ex.order_index || ex.orderIndex || 0,
                    groupId: ex.group_id || ex.groupId || undefined,
                  }))}
                  groups={getGroups(assignment).map((g: {
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
                    restBetweenRounds: g.rest_between_rounds || g.restBetweenRounds || undefined,
                    restBetweenExercises: g.rest_between_exercises || g.restBetweenExercises || undefined,
                    rounds: g.rounds || undefined,
                    notes: g.notes || undefined,
                  }))}
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
                    <button
                      onClick={() => {
                        onStartWorkout?.(assignmentId);
                        onClose();
                      }}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start Workout
                    </button>
                  )}
                  {statusText === "Assigned" && (
                    <button
                      onClick={handleMarkComplete}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Complete
                    </button>
                  )}
                  {statusText === "Completed" && (
                    <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-green-800 font-medium">
                        Workout Completed!
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Coach Actions */}
              {isCoach && (
                <>
                  <button
                    onClick={() => {
                      onEdit?.(assignmentId);
                      onClose();
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Assignment
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-secondary text-red-600 hover:bg-red-50 border-red-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}

              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
