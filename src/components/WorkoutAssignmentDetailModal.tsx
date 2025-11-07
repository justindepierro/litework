"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle,
  Play,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { parseDate, isToday, isPast } from "@/lib/date-utils";

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  weight: number | null;
  weight_percentage: number | null;
  rest_seconds: number;
  tempo: string | null;
  notes: string | null;
  order_index: number;
}

interface AssignmentDetail {
  id: string;
  athlete_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  coach_notes: string | null;
  status: "assigned" | "completed" | "skipped";
  completed_at: string | null;
  assigned_by: string;
  athlete: {
    full_name: string;
  };
  assigned_by_user: {
    full_name: string;
  };
  workout_plan: {
    name: string;
    description: string | null;
    duration_minutes: number | null;
    exercises: WorkoutExercise[];
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
    const scheduledDate = typeof assignment.scheduled_date === 'string' 
      ? parseDate(assignment.scheduled_date)
      : assignment.scheduled_date;
    
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
    const scheduledDate = typeof assignment.scheduled_date === 'string'
      ? parseDate(assignment.scheduled_date)
      : assignment.scheduled_date;

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
                    {assignment.workout_plan?.name || "Workout Assignment"}
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
                {assignment.workout_plan?.description && (
                  <p className="text-gray-600">
                    {assignment.workout_plan.description}
                  </p>
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
                    const date = typeof assignment.scheduled_date === 'string'
                      ? parseDate(assignment.scheduled_date)
                      : assignment.scheduled_date;
                    return date.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </span>
              </div>

              {assignment.start_time && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>
                    {assignment.start_time}
                    {assignment.end_time && ` - ${assignment.end_time}`}
                  </span>
                </div>
              )}

              {assignment.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Location:</span>
                  <span>{assignment.location}</span>
                </div>
              )}

              {assignment.assigned_by_user && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Assigned by:</span>
                  <span>{assignment.assigned_by_user.full_name}</span>
                </div>
              )}

              {assignment.workout_plan?.duration_minutes && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Duration:</span>
                  <span>{assignment.workout_plan.duration_minutes} min</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {assignment.coach_notes && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      Coach Notes
                    </h3>
                    <p className="text-blue-800">{assignment.coach_notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workout Exercises */}
            {assignment.workout_plan?.exercises &&
              assignment.workout_plan.exercises.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Exercises ({assignment.workout_plan.exercises.length})
                  </h3>
                  <div className="space-y-3">
                    {assignment.workout_plan.exercises.map(
                      (exercise: WorkoutExercise, index: number) => (
                        <div
                          key={exercise.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {exercise.exercise_name}
                              </h4>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {exercise.sets && (
                                  <span>
                                    <span className="font-medium">Sets:</span>{" "}
                                    {exercise.sets}
                                  </span>
                                )}
                                {exercise.reps && (
                                  <span>
                                    <span className="font-medium">Reps:</span>{" "}
                                    {exercise.reps}
                                  </span>
                                )}
                                {exercise.weight && (
                                  <span>
                                    <span className="font-medium">Weight:</span>{" "}
                                    {exercise.weight} lbs
                                  </span>
                                )}
                                {exercise.weight_percentage && (
                                  <span>
                                    <span className="font-medium">
                                      Intensity:
                                    </span>{" "}
                                    {exercise.weight_percentage}% 1RM
                                  </span>
                                )}
                                {exercise.rest_seconds && (
                                  <span>
                                    <span className="font-medium">Rest:</span>{" "}
                                    {exercise.rest_seconds}s
                                  </span>
                                )}
                              </div>
                              {exercise.notes && (
                                <p className="mt-2 text-sm text-gray-600 italic">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
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
