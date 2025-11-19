"use client";

import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect, lazy, Suspense } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { WorkoutAssignment, AthleteGroup, WorkoutPlan, User } from "@/types";
import Calendar from "@/components/Calendar";
import WorkoutAssignmentDetailModal from "@/components/WorkoutAssignmentDetailModal";
import { parseDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { withPageErrorBoundary } from "@/components/ui/PageErrorBoundary";
import { Body } from "@/components/ui/Typography";

// Lazy load heavy modal components
const GroupAssignmentModal = lazy(
  () => import("@/components/GroupAssignmentModal")
);

export default withPageErrorBoundary(function SchedulePage() {
  const { user, isLoading } = useRequireAuth();
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  // Assignment modal state
  const [showGroupAssignment, setShowGroupAssignment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);

  // Check if user is a coach or admin (can drag-and-drop)
  const isCoachUser = user
    ? user.role === "coach" || user.role === "admin"
    : false;

  useEffect(() => {
    if (user) {
      fetchAssignments();
      if (isCoachUser) {
        fetchCoachData();
      }
    }
  }, [user, isCoachUser]);

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

  const fetchCoachData = async () => {
    try {
      const [groupsRes, workoutsRes, athletesRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/workouts"),
        fetch("/api/users?role=athlete"),
      ]);

      const [groupsData, workoutsData, athletesData] = await Promise.all([
        groupsRes.json(),
        workoutsRes.json(),
        athletesRes.json(),
      ]);

      // Groups API returns { success: true, groups: [...] }
      if (groupsData.success) setGroups(groupsData.groups || []);
      // Workouts API returns { success: true, data: { workouts: [...] } }
      if (workoutsData.success)
        setWorkoutPlans(workoutsData.data?.workouts || []);
      // Users API returns { success: true, data: [...] }
      if (athletesData.success) setAthletes(athletesData.data || []);
    } catch (error) {
      console.error("Failed to fetch coach data:", error);
    }
  };

  const handleAssignmentMove = async (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => {
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
    // Open group assignment modal for the selected date
    setSelectedDate(date);
    setShowGroupAssignment(true);
  };

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });

      const data = await response.json();
      if (data.success) {
        await fetchAssignments(); // Refresh the assignments list
        setShowGroupAssignment(false);
      } else {
        alert(data.error || "Failed to create assignment");
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
      alert("Failed to create assignment. Please try again.");
    }
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
        <div className="mb-6">
          <PageHeader
            title="Schedule"
            subtitle="View and manage your workout schedule"
            icon={<CalendarIcon className="w-6 h-6" />}
            gradientVariant="primary"
            actions={
              isCoachUser ? (
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  variant="primary"
                  leftIcon={<Plus className="w-5 h-5" />}
                  className="py-3 px-4 rounded-xl font-medium"
                >
                  Assign Workout
                </Button>
              ) : undefined
            }
          />
        </div>

        {/* Draggable Calendar */}
        <div className="bg-white rounded-lg shadow-sm">
          {loadingAssignments ? (
            <div className="p-12 text-center">
              <LoadingSpinner size="lg" message="Loading schedule..." />
            </div>
          ) : (
            <Calendar
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
          <Alert
            variant="info"
            icon={<CalendarIcon />}
            title="Drag and Drop to Reschedule"
            className="mt-6"
          >
            <Body className="text-sm">
              Click and drag workouts to different dates to reschedule them.
              Group assignments will prompt for confirmation before moving all
              athletes.
            </Body>
          </Alert>
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

      {/* Group Assignment Modal */}
      {showGroupAssignment && (
        <Suspense fallback={<LoadingSpinner />}>
          <GroupAssignmentModal
            isOpen={showGroupAssignment}
            onClose={() => setShowGroupAssignment(false)}
            selectedDate={selectedDate}
            groups={groups}
            workoutPlans={workoutPlans}
            athletes={athletes}
            currentUserId={user?.id}
            onAssignWorkout={handleAssignWorkout}
          />
        </Suspense>
      )}
    </div>
  );
}, "Schedule");
