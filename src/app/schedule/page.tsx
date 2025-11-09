"use client";

import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { WorkoutAssignment } from "@/types";
import DraggableAthleteCalendar from "@/components/DraggableAthleteCalendar";
import WorkoutAssignmentDetailModal from "@/components/WorkoutAssignmentDetailModal";
import { parseDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";

export default function SchedulePage() {
  const { user, isLoading } = useRequireAuth();
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  // Check if user is a coach or admin (can drag-and-drop)
  const isCoachUser = user
    ? user.role === "coach" || user.role === "admin"
    : false;

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await fetch("/api/assignments");
      const data = await response.json();

      if (data.success) {
        // Convert string dates to Date objects using centralized utility
        const assignmentsWithDates = (data.data || []).map(
          (assignment: Record<string, unknown>) => ({
            ...assignment,
            scheduledDate: parseDate(assignment.scheduledDate as string),
            assignedDate: parseDate(assignment.assignedDate as string),
            createdAt: new Date(assignment.createdAt as string),
            updatedAt: new Date(assignment.updatedAt as string),
            dueDate: assignment.dueDate
              ? parseDate(assignment.dueDate as string)
              : undefined,
          })
        ) as WorkoutAssignment[];
        setAssignments(assignmentsWithDates);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignmentMove = async (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => {
    console.log("[SCHEDULE] Moving assignment:", {
      assignmentId,
      newDate: newDate.toDateString(),
      isGroupAssignment,
    });

    // Optimistic update - update UI immediately before API call
    const updatedAssignments = assignments.map((assignment) => {
      if (assignment.id === assignmentId) {
        return { ...assignment, scheduledDate: newDate };
      }
      return assignment;
    });
    setAssignments(updatedAssignments);

    try {
      const response = await fetch("/api/assignments/reschedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          newDate: newDate.toISOString(),
          moveGroup: isGroupAssignment,
        }),
      });

      const data = await response.json();
      // [REMOVED] console.log("[SCHEDULE] Reschedule response:", data);

      if (data.success) {
        // [REMOVED] console.log("[SCHEDULE] Successfully rescheduled");
        // Don't refetch - optimistic update already applied
        // await fetchAssignments();
      } else {
        console.error("[SCHEDULE] Failed to reschedule:", data);
        // Revert optimistic update on failure
        await fetchAssignments(); // Refetch to get correct state
        alert(data.error || data.message || "Failed to reschedule workout");
      }
    } catch (error) {
      console.error("[SCHEDULE] Error rescheduling assignment:", error);
      // Revert optimistic update on error
      await fetchAssignments(); // Refetch to get correct state
      alert("Failed to reschedule workout. Please try again.");
    }
  };

  const handleAssignmentClick = (assignment: WorkoutAssignment) => {
    // Open the modal to show workout details
    setSelectedAssignmentId(assignment.id);
  };

  const handleDateClick = (date: Date) => {
    // Store selected date for future functionality (e.g., creating assignments)
    // [REMOVED] console.log("Date clicked:", date);
    // You can open a modal to create new assignments on this date
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-heading-primary text-3xl sm:text-2xl font-bold">
              Schedule
            </h1>
            <p className="text-heading-secondary text-base sm:text-sm mt-1">
              View and manage your workout schedule
            </p>
          </div>
          {isCoachUser && (
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              className="py-3 px-4 rounded-xl font-medium"
            >
              Assign Workout
            </Button>
          )}
        </div>

        {/* Draggable Calendar */}
        <div className="bg-white rounded-lg shadow-sm">
          {loadingAssignments ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading schedule...</p>
            </div>
          ) : (
            <DraggableAthleteCalendar
              assignments={assignments}
              onAssignmentClick={handleAssignmentClick}
              onDateClick={handleDateClick}
              onAssignmentMove={handleAssignmentMove}
              viewMode="month"
              isCoach={isCoachUser}
            />
          )}
        </div>

        {/* Quick Actions for Coaches */}
        {isCoachUser && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Drag and Drop to Reschedule
                </h3>
                <p className="text-sm text-blue-800">
                  Click and drag workouts to different dates to reschedule them.
                  Group assignments will prompt for confirmation before moving
                  all athletes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workout Detail Modal */}
      {selectedAssignmentId && (
        <WorkoutAssignmentDetailModal
          isOpen={true}
          assignmentId={selectedAssignmentId}
          onClose={() => setSelectedAssignmentId(null)}
          userRole={user?.role || "athlete"}
        />
      )}
    </div>
  );
}
