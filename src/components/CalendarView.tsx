"use client";

import { useState, useEffect } from "react";
import { AthleteGroup, WorkoutAssignment, User } from "@/types";
import GroupAssignmentModal from "./GroupAssignmentModal";
import GroupFormModal from "./GroupFormModal";
import { useGroups, useAssignments } from "@/hooks/api-hooks";
import { Calendar, Users, X, Plus } from "lucide-react";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AthleteGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
    console.log("Assigning workout:", assignment);
    // For now, just close the modal
    setShowAssignModal(false);
  };

  const handleGroupSave = async (group: AthleteGroup) => {
    console.log("Group saved:", group);
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
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-body-secondary">Loading calendar...</p>
          </div>
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
                <button
                  onClick={() => navigateMonth(-1)}
                  className="btn-secondary text-sm px-3 py-1"
                >
                  ←
                </button>
                <span className="text-heading-secondary text-lg min-w-[150px] text-center">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </span>
                <button
                  onClick={() => navigateMonth(1)}
                  className="btn-secondary text-sm px-3 py-1"
                >
                  →
                </button>
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

              <button
                onClick={() => setShowGroupModal(true)}
                className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Groups
              </button>
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
          <div className="card-primary overflow-hidden">
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
                    className={`min-h-[120px] p-2 border-b border-r border-silver-200 cursor-pointer hover:bg-silver-50 ${
                      !isCurrentMonthDay ? "bg-silver-100 text-silver-600" : ""
                    } ${isTodayDay ? "bg-accent-blue/10" : ""}`}
                    onClick={() => openAssignModal(day)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isTodayDay ? "text-accent-blue" : "text-body-primary"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {assignments.length > 0 && (
                        <span className="text-xs bg-accent-orange text-white px-1 rounded">
                          {assignments.length}
                        </span>
                      )}
                    </div>

                    {/* Assignments */}
                    <div className="space-y-1">
                      {assignments
                        .slice(0, 3)
                        .map((assignment: WorkoutAssignment) => {
                          const group = getGroupById(assignment.groupId || "");
                          return (
                            <div
                              key={assignment.id}
                              className="text-xs p-1 rounded truncate"
                              style={{
                                backgroundColor: group
                                  ? `${group.color}20`
                                  : "#f3f4f6",
                                borderLeft: `3px solid ${group?.color || "#9ca3af"}`,
                              }}
                              title={`${assignment.workoutPlanName} - ${group?.name}`}
                            >
                              <div className="font-medium truncate">
                                {assignment.workoutPlanName}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                {group?.name}
                              </div>
                            </div>
                          );
                        })}
                      {assignments.length > 3 && (
                        <div className="text-xs text-silver-600">
                          +{assignments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                      <div key={group.id} className="card-primary">
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
                          <button
                            className="btn-secondary flex-1 text-sm"
                            onClick={() => handleEditGroup(group)}
                          >
                            Edit Group
                          </button>
                          <button className="btn-primary flex-1 text-sm">
                            Assign Workout
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <button
                      className="btn-primary flex items-center gap-2"
                      onClick={handleCreateGroup}
                    >
                      <Plus className="w-4 h-4" /> Create New Group
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignment Modal */}
          {showAssignModal && selectedDate && (
            <GroupAssignmentModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              selectedDate={selectedDate}
              groups={groups}
              workoutPlans={[]}
              athletes={athletes}
              onAssignWorkout={handleAssignWorkout}
            />
          )}

          {/* Group Form Modal */}
          {showGroupFormModal && (
            <GroupFormModal
              isOpen={showGroupFormModal}
              onClose={() => setShowGroupFormModal(false)}
              editingGroup={editingGroup}
              existingGroups={groups}
              onSave={handleGroupSave}
            />
          )}
        </>
      )}
    </div>
  );
}
