"use client";

import Link from "next/link";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect } from "react";
import DraggableAthleteCalendar from "@/components/DraggableAthleteCalendar";
import TodayOverview from "@/components/TodayOverview";
import QuickActions from "@/components/QuickActions";
import GroupCompletionStats from "@/components/GroupCompletionStats";
import GroupAssignmentModal from "@/components/GroupAssignmentModal";
import IndividualAssignmentModal from "@/components/IndividualAssignmentModal";
import WorkoutAssignmentDetailModal from "@/components/WorkoutAssignmentDetailModal";
import { WorkoutAssignment, WorkoutPlan, AthleteGroup, User } from "@/types";
import {
  TrendingUp,
  ClipboardList,
  Trophy,
  Calendar,
  Eye,
  Dumbbell,
  Hand,
  Flame,
  Users,
  UserPlus,
} from "lucide-react";

interface DashboardStats {
  workoutsThisWeek: number;
  personalRecords: number;
  currentStreak: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const [stats, setStats] = useState<DashboardStats>({
    workoutsThisWeek: 0,
    personalRecords: 0,
    currentStreak: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Assignment state
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modal state
  const [showGroupAssignment, setShowGroupAssignment] = useState(false);
  const [showIndividualAssignment, setShowIndividualAssignment] =
    useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  const isCoachOrAdmin = user?.role === "coach" || user?.role === "admin";

  // Fetch dashboard stats for athletes
  useEffect(() => {
    if (user && user.role === "athlete") {
      fetchDashboardStats();
      fetchAthleteAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch assignment data for coaches
  useEffect(() => {
    if (user && isCoachOrAdmin) {
      fetchCoachData();
    }
  }, [user, isCoachOrAdmin]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch("/api/analytics/dashboard-stats");
      const data = await response.json();

      if (data.success) {
        setStats({
          workoutsThisWeek: data.stats.workoutsThisWeek || 0,
          personalRecords: data.stats.personalRecords || 0,
          currentStreak: data.stats.currentStreak || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAthleteAssignments = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/assignments?athleteId=${user?.id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setAssignments(data.data.assignments || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch athlete assignments:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCoachData = async () => {
    try {
      setLoadingData(true);

      // Fetch assignments, workouts, groups, and athletes in parallel
      const [assignmentsRes, workoutsRes, groupsRes, athletesRes] =
        await Promise.all([
          fetch("/api/assignments"),
          fetch("/api/workouts"),
          fetch("/api/groups"),
          fetch("/api/athletes"),
        ]);

      const [assignmentsData, workoutsData, groupsData, athletesData] =
        await Promise.all([
          assignmentsRes.json(),
          workoutsRes.json(),
          groupsRes.json(),
          athletesRes.json(),
        ]);

      if (assignmentsData.success && assignmentsData.data) {
        setAssignments(
          assignmentsData.data.assignments || assignmentsData.data || []
        );
      }

      if (workoutsData.success && workoutsData.data) {
        setWorkoutPlans(workoutsData.data.workouts || workoutsData.data || []);
      }

      if (groupsData.success && groupsData.data) {
        setGroups(groupsData.data.groups || groupsData.data || []);
      }

      if (athletesData.success && athletesData.data) {
        setAthletes(athletesData.data.athletes || athletesData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch coach data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: [assignment] }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh assignments
        await fetchCoachData();
        // Show success message (could add toast notification here)
        console.log("Assignment created successfully!");
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowGroupAssignment(true);
  };

  const handleAssignmentClick = (assignment: WorkoutAssignment) => {
    setSelectedAssignmentId(assignment.id);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAssignmentId(null);
  };

  const handleStartWorkout = (assignmentId: string) => {
    // Navigate to workout live mode
    window.location.href = `/workout/live/${assignmentId}`;
  };

  const handleEditAssignment = (assignmentId: string) => {
    // TODO: Open edit modal or navigate to edit page
    console.log("Edit assignment:", assignmentId);
    handleCloseDetailModal();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        handleCloseDetailModal();
        // Refresh assignments
        if (isCoachOrAdmin) {
          fetchCoachData();
        } else {
          fetchAthleteAssignments();
        }
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const handleAssignmentMove = async (
    assignmentId: string,
    newDate: Date,
    isGroupAssignment: boolean
  ) => {
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

      if (data.success) {
        // Refresh assignments to show new date
        if (isCoachOrAdmin) {
          await fetchCoachData();
        } else {
          await fetchAthleteAssignments();
        }
        console.log(data.message);
      } else {
        console.error("Failed to reschedule:", data.error);
        alert("Failed to reschedule workout. Please try again.");
      }
    } catch (error) {
      console.error("Error rescheduling assignment:", error);
      alert("An error occurred while rescheduling. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Coach/Admin Dashboard
  if (isCoachOrAdmin) {
    return (
      <div className="container-responsive min-h-screen bg-gradient-primary px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center sm:text-left mb-8">
            <h1 className="text-heading-primary text-3xl sm:text-2xl mb-2 font-bold">
              Welcome back,
            </h1>
            <p className="text-heading-accent text-2xl sm:text-xl font-bold flex items-center gap-2">
              {user.fullName}! <Hand className="w-6 h-6" />
            </p>
            <p className="text-gray-600 mt-2">
              {user.role === "admin" ? "Administrator" : "Coach"} Dashboard
            </p>
          </div>

          {/* Two-column layout for coaches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left column - Today & Actions */}
            <div className="lg:col-span-2 space-y-6">
              <TodayOverview />
              <QuickActions />
            </div>

            {/* Right column - Stats */}
            <div className="lg:col-span-1">
              <GroupCompletionStats />
            </div>
          </div>

          {/* Full-width calendar with assignment buttons */}
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowIndividualAssignment(true);
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Assign to Athlete
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowGroupAssignment(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Assign to Group
              </button>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-sm">
              {loadingData ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading calendar...</p>
                </div>
              ) : (
                <DraggableAthleteCalendar
                  assignments={assignments}
                  onAssignmentClick={handleAssignmentClick}
                  onDateClick={handleDateClick}
                  onAssignmentMove={handleAssignmentMove}
                  viewMode="month"
                  isCoach={true}
                />
              )}
            </div>
          </div>

          {/* Assignment Modals */}
          {showGroupAssignment && (
            <GroupAssignmentModal
              isOpen={showGroupAssignment}
              onClose={() => setShowGroupAssignment(false)}
              selectedDate={selectedDate}
              groups={groups}
              workoutPlans={workoutPlans}
              athletes={athletes}
              onAssignWorkout={handleAssignWorkout}
            />
          )}

          {showIndividualAssignment && (
            <IndividualAssignmentModal
              isOpen={showIndividualAssignment}
              onClose={() => setShowIndividualAssignment(false)}
              athletes={athletes}
              workoutPlans={workoutPlans}
              onAssignWorkout={handleAssignWorkout}
            />
          )}

          {/* Assignment Detail Modal */}
          {selectedAssignmentId && (
            <WorkoutAssignmentDetailModal
              isOpen={showDetailModal}
              onClose={handleCloseDetailModal}
              assignmentId={selectedAssignmentId}
              userRole={user?.role || "athlete"}
              onStartWorkout={handleStartWorkout}
              onEdit={handleEditAssignment}
              onDelete={handleDeleteAssignment}
            />
          )}
        </div>
      </div>
    );
  }

  // Athlete Dashboard (existing code)

  return (
    <div className="container-responsive min-h-screen bg-gradient-primary px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced mobile-first welcome header */}
        <div className="text-center sm:text-left mb-8">
          <h1 className="text-heading-primary text-3xl sm:text-2xl mb-2 font-bold">
            Welcome back,
          </h1>
          <p className="text-heading-accent text-2xl sm:text-xl font-bold flex items-center gap-2">
            {user.fullName}! <Hand className="w-6 h-6" />
          </p>
        </div>

        {/* Enhanced mobile-first stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="card-stat rounded-2xl border-2 border-orange-200 bg-orange-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-orange bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 sm:w-6 sm:h-6 text-accent-orange" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-orange-700">
                  This Week
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-orange-800">
                  {loadingStats ? (
                    <div className="animate-pulse h-8 w-16 bg-orange-200 rounded"></div>
                  ) : (
                    `${stats.workoutsThisWeek} workout${stats.workoutsThisWeek !== 1 ? "s" : ""}`
                  )}
                </dd>
              </div>
            </div>
          </div>

          <div className="card-stat rounded-2xl border-2 border-green-200 bg-green-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-green bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 sm:w-6 sm:h-6 text-accent-green" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-green-700">
                  Personal Records
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-green-800">
                  {loadingStats ? (
                    <div className="animate-pulse h-8 w-12 bg-green-200 rounded"></div>
                  ) : (
                    stats.personalRecords
                  )}
                </dd>
              </div>
            </div>
          </div>

          <div className="card-stat sm:col-span-2 lg:col-span-1 rounded-2xl border-2 border-red-200 bg-red-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-red bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Flame className="w-7 h-7 sm:w-6 sm:h-6 text-accent-red" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-red-700">
                  Streak Days
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-red-800">
                  {loadingStats ? (
                    <div className="animate-pulse h-8 w-12 bg-red-200 rounded"></div>
                  ) : (
                    stats.currentStreak
                  )}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Athlete Calendar View - Shows only their assignments */}
        <div className="mb-8">
          <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
            <Calendar className="w-6 h-6" /> Your Schedule
          </h2>
          <DraggableAthleteCalendar
            assignments={assignments}
            onAssignmentClick={handleAssignmentClick}
            viewMode="week"
            isCoach={false}
          />
        </div>

        {/* Enhanced assigned workouts for athletes */}
        {user.role === "athlete" && (
          <div className="mb-8">
            <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
              <ClipboardList className="w-6 h-6" /> Your Assigned Workouts
            </h2>
            {loadingData ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading workouts...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  No Workouts Assigned Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Your coach will assign workouts that will appear here.
                </p>
                <Link
                  href="/workouts"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Browse Workout Library
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.slice(0, 6).map((assignment) => {
                  const scheduledDate = new Date(assignment.scheduledDate);
                  const isToday =
                    scheduledDate.toDateString() === new Date().toDateString();
                  const isPast = scheduledDate < new Date() && !isToday;
                  const isFuture = scheduledDate > new Date();

                  return (
                    <div
                      key={assignment.id}
                      className={`card-primary rounded-lg border-2 p-4 ${
                        isToday
                          ? "border-accent-blue bg-blue-50"
                          : isPast
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-200"
                      }`}
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {assignment.workoutPlanName}
                          </h3>
                          {isToday && (
                            <span className="text-xs bg-accent-blue text-white px-2 py-1 rounded">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {scheduledDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        {assignment.startTime && (
                          <p className="text-sm text-gray-600">
                            {assignment.startTime}
                            {assignment.endTime && ` - ${assignment.endTime}`}
                          </p>
                        )}
                        {assignment.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span>📍</span> {assignment.location}
                          </p>
                        )}
                      </div>

                      {(isToday || isPast) && (
                        <Link
                          href={`/workouts/live/${assignment.id}`}
                          className="w-full btn-primary flex items-center justify-center gap-2 py-2"
                        >
                          <Dumbbell className="w-4 h-4" />
                          {isPast ? "Start Workout" : "Start Now"}
                        </Link>
                      )}

                      {isFuture && (
                        <button
                          onClick={() => handleAssignmentClick(assignment)}
                          className="w-full btn-secondary flex items-center justify-center gap-2 py-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Enhanced recent activity - mobile optimized */}
        <div className="mb-8">
          <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
            <TrendingUp className="w-6 h-6" /> Recent Activity
          </h2>
          <div className="card-primary rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
            {/* No recent activity yet - will be loaded from API */}
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray-400">
                Your workout progress and achievements will appear here.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced upcoming workouts - mobile optimized */}
        {user.role === "athlete" && (
          <div className="mb-8">
            <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
              <Calendar className="h-6 w-6 text-blue-600" />
              Upcoming Workouts
            </h2>
            <div className="card-primary rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
              {/* No upcoming workouts - will be loaded from API */}
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  No Upcoming Workouts
                </h3>
                <p className="text-gray-400">
                  Future workout assignments will appear here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced mobile floating action button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/workout/new"
            className="flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 bg-linear-to-br from-accent-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
          >
            <span className="text-2xl sm:text-xl font-bold">+</span>
          </Link>
        </div>

        {/* Assignment Detail Modal */}
        {selectedAssignmentId && (
          <WorkoutAssignmentDetailModal
            isOpen={showDetailModal}
            onClose={handleCloseDetailModal}
            assignmentId={selectedAssignmentId}
            userRole={user?.role || "athlete"}
            onStartWorkout={handleStartWorkout}
            onEdit={handleEditAssignment}
            onDelete={handleDeleteAssignment}
          />
        )}
      </div>
    </div>
  );
}
