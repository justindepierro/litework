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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  parseDate,
  isToday as checkIsToday,
  isFuture as checkIsFuture,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Trophy,
  Calendar,
  Eye,
  Dumbbell,
  Hand,
  Flame,
  Users,
  UserPlus,
  Clock,
  MapPin,
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

      console.log("[Dashboard] Groups data:", groupsData);
      console.log("[Dashboard] Workouts data:", workoutsData);
      console.log("[Dashboard] Athletes data:", athletesData);

      if (assignmentsData.success && assignmentsData.data) {
        setAssignments(
          assignmentsData.data.assignments || assignmentsData.data || []
        );
      }

      if (workoutsData.success && workoutsData.data) {
        setWorkoutPlans(workoutsData.data.workouts || workoutsData.data || []);
      }

      // Groups API returns { success: true, groups: [...] }
      if (groupsData.success) {
        setGroups(groupsData.groups || []);
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
        body: JSON.stringify(assignment),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh assignments
        await fetchCoachData();
        // Show success message (could add toast notification here)
        // [REMOVED] console.log("Assignment created successfully!");
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
        // [REMOVED] console.log(data.message);
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
            <p className="text-silver-700 mt-2">
              {user.role === "admin" ? "Administrator" : "Coach"} Dashboard
            </p>
          </div>

          {/* Quick Actions Bar - Full Width */}
          <QuickActions />

          {/* Two-column layout for coaches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left column - Today */}
            <div className="lg:col-span-2">
              <TodayOverview />
            </div>

            {/* Right column - Stats */}
            <div className="lg:col-span-1">
              <GroupCompletionStats />
            </div>
          </div>

          {/* Full-width calendar */}
          <div>
            {/* Calendar with integrated header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {/* Calendar Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Team Schedule
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Manage workout assignments
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowIndividualAssignment(true);
                    }}
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Athlete
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowGroupAssignment(true);
                    }}
                    variant="primary"
                    size="sm"
                    leftIcon={<Users className="w-4 h-4" />}
                  >
                    Group
                  </Button>
                </div>
              </div>

              {loadingData ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" message="Loading calendar..." />
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
              currentUserId={user?.id}
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
              onEdit={() => {}}
              onDelete={handleDeleteAssignment}
            />
          )}
        </div>
      </div>
    );
  }

  // Athlete Dashboard - Mobile-Forward, Industry-Leading Design
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Sticky Action Bar - Thumb Zone Optimized */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-responsive px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Hi, {user.firstName}! 👋
              </h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <Link href="/workouts/live/new">
              <Button
                variant="primary"
                leftIcon={<Dumbbell className="w-4 h-4" />}
                className="rounded-full px-6 shadow-lg"
              >
                Start
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-responsive px-4 py-4 pb-24 max-w-2xl mx-auto space-y-4">
        {/* Quick Stats - Compact & Visual */}
        <div className="grid grid-cols-3 gap-3">
          <Card variant="default" padding="sm" className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2">
              <Dumbbell className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? (
                <div className="h-7 w-12 mx-auto animate-pulse bg-gray-200 rounded" />
              ) : (
                stats.workoutsThisWeek
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">This Week</div>
          </Card>

          <Card variant="default" padding="sm" className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? (
                <div className="h-7 w-12 mx-auto animate-pulse bg-gray-200 rounded" />
              ) : (
                stats.personalRecords
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">PRs</div>
          </Card>

          <Card variant="default" padding="sm" className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2">
              <Flame className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? (
                <div className="h-7 w-12 mx-auto animate-pulse bg-gray-200 rounded" />
              ) : (
                stats.currentStreak
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">Day Streak</div>
          </Card>
        </div>

        {/* Today's Workouts - Hero Section */}
        {user.role === "athlete" && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              Today&apos;s Workouts
            </h2>

            {assignments.filter((a) => {
              const assignmentDate = parseDate(a.scheduledDate);
              return checkIsToday(assignmentDate);
            }).length === 0 ? (
              <Card variant="default" padding="lg" className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Workouts Today
                </h3>
                <p className="text-sm text-gray-500">
                  Enjoy your rest day or check tomorrow&apos;s schedule
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {assignments
                  .filter((a) => {
                    const assignmentDate = parseDate(a.scheduledDate);
                    return checkIsToday(assignmentDate);
                  })
                  .map((assignment) => {
                    const assignmentId =
                      assignment.id ||
                      `${assignment.workoutPlanId}-${assignment.athleteId}`;

                    return (
                      <Card
                        key={assignmentId}
                        variant="interactive"
                        padding="md"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {assignment.workoutPlanName || "Workout"}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              {assignment.startTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {assignment.startTime}
                                </span>
                              )}
                              {assignment.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {assignment.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 ml-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <Dumbbell className="w-6 h-6 text-orange-600" />
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/workouts/live/${assignmentId}`}
                          className="block"
                        >
                          <Button
                            variant="primary"
                            fullWidth
                            leftIcon={<Dumbbell className="w-5 h-5" />}
                            className="h-12 text-base font-semibold rounded-xl"
                          >
                            Start Workout
                          </Button>
                        </Link>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* This Week's Schedule - Compact List */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            This Week
          </h2>

          <Card variant="default" padding="none" className="overflow-hidden">
            <DraggableAthleteCalendar
              assignments={assignments}
              onAssignmentClick={handleAssignmentClick}
              viewMode="week"
              isCoach={false}
            />
          </Card>
        </div>

        {/* Upcoming Workouts - Minimalist Cards */}
        {user.role === "athlete" && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500 rounded-full" />
              Coming Up
            </h2>

            {assignments.filter((a) => {
              const assignmentDate = parseDate(a.scheduledDate);
              return (
                checkIsFuture(assignmentDate) && !checkIsToday(assignmentDate)
              );
            }).length === 0 ? (
              <Card variant="default" padding="md" className="text-center">
                <p className="text-sm text-gray-500">
                  No upcoming workouts scheduled
                </p>
              </Card>
            ) : (
              <Card
                variant="default"
                padding="none"
                className="divide-y divide-gray-100"
              >
                {assignments
                  .filter((a) => {
                    const assignmentDate = parseDate(a.scheduledDate);
                    return (
                      checkIsFuture(assignmentDate) &&
                      !checkIsToday(assignmentDate)
                    );
                  })
                  .slice(0, 5)
                  .map((assignment) => {
                    const assignmentDate = parseDate(assignment.scheduledDate);
                    const assignmentId =
                      assignment.id ||
                      `${assignment.workoutPlanId}-${assignment.athleteId}`;

                    return (
                      <button
                        key={assignmentId}
                        onClick={() => handleAssignmentClick(assignment)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="shrink-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {assignment.workoutPlanName || "Workout"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {assignmentDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                              {assignment.startTime &&
                                ` • ${assignment.startTime}`}
                            </p>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400 shrink-0" />
                      </button>
                    );
                  })}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignmentId && (
        <WorkoutAssignmentDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          assignmentId={selectedAssignmentId}
          userRole={user?.role || "athlete"}
          onStartWorkout={handleStartWorkout}
          onEdit={() => {}}
          onDelete={handleDeleteAssignment}
        />
      )}
    </div>
  );
}
