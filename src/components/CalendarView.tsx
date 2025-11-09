"use client";

import { useState, useEffect, lazy, Suspense, memo } from "react";
import { useRouter } from "next/navigation";
import { AthleteGroup, WorkoutAssignment, User } from "@/types";
import { useGroups, useAssignments } from "@/hooks/api-hooks";
import { Calendar, Users, X, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for heavy modals
const GroupFormModal = lazy(() => import("./GroupFormModal"));
const GroupAssignmentModal = lazy(() => import("./GroupAssignmentModal"));

const CalendarView = memo(function CalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AthleteGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<WorkoutAssignment | null>(null);
  const [athletes, setAthletes] = useState<User[]>([]);

  // API hooks
  const {
    groups,
    isLoading: groupsLoading,
    refetch: refetchGroups,
  } = useGroups();
  const { assignments, isLoading: assignmentsLoading } = useAssignments();

  // Load athletes data
  useEffect(() => {
    const loadAthletes = async () => {
      // TODO: Load athletes from API
      // For now, set empty array
      setAthletes([]);
    };

    loadAthletes();
  }, []);

  const isLoading = groupsLoading || assignmentsLoading;

  const handleAssignWorkout = (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    // In a real app, this would make an API call to save the assignment
    // [REMOVED] console.log("Assigning workout:", assignment);
    // For now, just close the modal
    setShowAssignModal(false);
  };

  const handleGroupSave = async (group: AthleteGroup) => {
    // [REMOVED] console.log("Group saved:", group);
    // Refetch groups to update the list
    refetchGroups();
    setShowGroupFormModal(false);
    setEditingGroup(null);
  };

  const handleEditGroup = (group: AthleteGroup) => {
    setEditingGroup(group);
    setShowGroupFormModal(true);
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupFormModal(true);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDateCheck = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      days.push(new Date(currentDateCheck));
      currentDateCheck.setDate(currentDateCheck.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((assignment: WorkoutAssignment) => {
      // Ensure scheduledDate is a Date object (it might come as a string from API)
      const scheduledDate =
        assignment.scheduledDate instanceof Date
          ? assignment.scheduledDate
          : new Date(assignment.scheduledDate);

      return (
        scheduledDate.toDateString() === date.toDateString() &&
        (selectedGroup === "all" || assignment.groupId === selectedGroup)
      );
    });
  };

  const getGroupById = (groupId: string) => {
    return groups.find((g: AthleteGroup) => g.id === groupId);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const openAssignModal = (date: Date) => {
    setSelectedDate(date);
    setShowAssignModal(true);
  };

  return (
    <div className="bg-white">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="md" message="Loading calendar..." />
        </div>
      ) : (
        <>
          {/* Header with Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-heading-primary text-xl sm:text-2xl flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent-blue" />
                Training Calendar
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigateMonth(-1)}
                  variant="secondary"
                  size="sm"
                  className="px-3 py-1"
                >
                  ←
                </Button>
                <span className="text-heading-secondary text-lg min-w-[150px] text-center">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </span>
                <Button
                  onClick={() => navigateMonth(1)}
                  variant="secondary"
                  size="sm"
                  className="px-3 py-1"
                >
                  →
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Group Filter */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="p-2 border border-silver-400 rounded-md text-sm"
              >
                <option value="all">All Groups</option>
                {groups.map((group: AthleteGroup) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => setShowGroupModal(true)}
                variant="secondary"
                leftIcon={<Users className="w-4 h-4" />}
                size="sm"
                className="px-4 py-2"
              >
                Manage Groups
              </Button>
            </div>
          </div>

          {/* Group Legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {groups.map((group: AthleteGroup) => (
              <div key={group.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                ></div>
                <span className="text-body-small">{group.name}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <Card variant="default" padding="none" className="overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-silver-100">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-body-primary font-medium text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const assignments = getAssignmentsForDate(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-b border-r border-silver-200 ${
                      !isCurrentMonthDay ? "bg-silver-100 text-silver-600" : ""
                    } ${isTodayDay ? "bg-accent-blue/10" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isTodayDay ? "text-accent-blue" : "text-body-primary"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      <div className="flex items-center gap-1">
                        {assignments.length > 0 && (
                          <span className="text-xs bg-accent-orange text-white px-1 rounded">
                            {assignments.length}
                          </span>
                        )}
                        {assignments.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignModal(day);
                            }}
                            className="text-xs text-accent-blue hover:text-accent-blue/80 p-1"
                            title="Assign workout"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="space-y-1">
                      {assignments
                        .slice(0, 3)
                        .map((assignment: WorkoutAssignment) => {
                          const group = getGroupById(assignment.groupId || "");
                          const isPastOrToday = day <= new Date();

                          return (
                            <div
                              key={assignment.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssignment(assignment);
                              }}
                              className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                backgroundColor: group
                                  ? `${group.color}20`
                                  : "#f3f4f6",
                                borderLeft: `3px solid ${group?.color || "#9ca3af"}`,
                              }}
                              title={`${assignment.workoutPlanName} - ${group?.name}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {assignment.workoutPlanName}
                                  </div>
                                  <div className="text-xs opacity-75 truncate">
                                    {group?.name}
                                  </div>
                                </div>
                                {isPastOrToday && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/workouts/live/${assignment.id}`
                                      );
                                    }}
                                    className="shrink-0 p-1 bg-accent-blue text-white rounded hover:bg-accent-blue/90"
                                    title="Start workout"
                                  >
                                    <Play className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {assignments.length > 3 && (
                        <div
                          className="text-xs text-silver-600 cursor-pointer hover:text-accent-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssignment(assignments[0]);
                          }}
                        >
                          +{assignments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Group Management Modal */}
          {showGroupModal && (
            <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-heading-primary text-xl">
                      Manage Athlete Groups
                    </h2>
                    <button
                      onClick={() => setShowGroupModal(false)}
                      className="text-silver-600 hover:text-navy-600 p-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {groups.map((group) => (
                      <Card key={group.id} variant="default" padding="md">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: group.color }}
                          ></div>
                          <div>
                            <h3 className="text-heading-secondary text-lg">
                              {group.name}
                            </h3>
                            <p className="text-body-small">
                              {group.sport} • {group.description}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-body-small font-medium mb-2">
                            Athletes ({group.athleteIds.length})
                          </div>
                          <div className="space-y-1">
                            {group.athleteIds.map((athleteId) => {
                              const athlete = athletes.find(
                                (a: User) => a.id === athleteId
                              );
                              return athlete ? (
                                <div
                                  key={athleteId}
                                  className="text-body-small bg-silver-100 px-2 py-1 rounded"
                                >
                                  {athlete.fullName}
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={() => handleEditGroup(group)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit Group
                          </Button>
                          <Button
                            className="flex-1"
                            variant="primary"
                            size="sm"
                          >
                            Assign Workout
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={handleCreateGroup}
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create New Group
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Modal */}
          {showAssignModal && selectedDate && (
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <GroupAssignmentModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                selectedDate={selectedDate}
                groups={groups}
                workoutPlans={[]}
                athletes={athletes}
                onAssignWorkout={handleAssignWorkout}
              />
            </Suspense>
          )}

          {/* Group Form Modal */}
          {showGroupFormModal && (
            <Suspense
              fallback={
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <GroupFormModal
                isOpen={showGroupFormModal}
                onClose={() => setShowGroupFormModal(false)}
                editingGroup={editingGroup}
                existingGroups={groups}
                onSave={handleGroupSave}
              />
            </Suspense>
          )}

          {/* Assignment Details Modal */}
          {selectedAssignment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAssignment.workoutPlanName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getGroupById(selectedAssignment.groupId || "")?.name ||
                        "Individual"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Scheduled:{" "}
                    </span>
                    <span className="text-sm text-gray-900">
                      {new Date(
                        selectedAssignment.scheduledDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedAssignment.startTime && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Time:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedAssignment.startTime}
                        {selectedAssignment.endTime &&
                          ` - ${selectedAssignment.endTime}`}
                      </span>
                    </div>
                  )}
                  {selectedAssignment.location && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Location:{" "}
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedAssignment.location}
                      </span>
                    </div>
                  )}
                  {selectedAssignment.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-1">
                        Notes:
                      </span>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedAssignment.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/workouts/live/${selectedAssignment.id}`)
                    }
                    className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 font-medium flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Workout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default CalendarView;
