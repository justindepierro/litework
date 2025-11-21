"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect, lazy, Suspense } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { WorkoutAssignment, WorkoutPlan, AthleteGroup, User } from "@/types";
import { SkeletonStatCard, SkeletonCard } from "@/components/ui/Skeleton";
import { withPageErrorBoundary } from "@/components/ui/PageErrorBoundary";
import { Body, Caption, Display, Heading } from "@/components/ui/Typography";
import type {
  DashboardBootstrapData,
  DashboardStats,
} from "@/lib/dashboard-data";

// Lazy load ALL heavy components for better code splitting
const TodayOverview = lazy(() => import("@/components/TodayOverview"));
const QuickActions = lazy(() => import("@/components/QuickActions"));
const GroupCompletionStats = lazy(
  () => import("@/components/GroupCompletionStats")
);
const WorkoutAssignmentDetailModal = lazy(
  () => import("@/components/WorkoutAssignmentDetailModal")
);
const Calendar = lazy(() => import("@/components/Calendar"));
const GroupAssignmentModal = lazy(
  () => import("@/components/GroupAssignmentModal")
);
const IndividualAssignmentModal = lazy(
  () => import("@/components/IndividualAssignmentModal")
);

import {
  parseDate,
  isToday as checkIsToday,
  isFuture as checkIsFuture,
  formatTime12Hour,
  formatTimeRange,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { EnergySurface } from "@/components/ui/Card";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AnimatedList,
  AnimatedListItem,
  AnimatedGrid,
} from "@/components/ui/AnimatedList";
import {
  Trophy,
  Calendar as CalendarIcon,
  Eye,
  Dumbbell,
  Flame,
  Users,
  UserPlus,
  LayoutDashboard,
  Clock,
  MapPin,
  Settings,
} from "lucide-react";

interface DashboardClientPageProps {
  initialData: DashboardBootstrapData;
}

interface DashboardSectionHeadingProps {
  label: string;
  accentToken: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const DashboardSectionHeading = ({
  label,
  accentToken,
  icon,
  action,
}: DashboardSectionHeadingProps) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-6 w-1.5 rounded-full"
        style={{ background: accentToken }}
      />
      <div className="flex items-center gap-2">
        {icon && <span className="text-secondary">{icon}</span>}
        <Body
          size="sm"
          variant="secondary"
          weight="semibold"
          className="uppercase tracking-[0.4em]"
        >
          {label}
        </Body>
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

function DashboardPage({ initialData }: DashboardClientPageProps) {
  const DEFAULT_STATS: DashboardStats = {
    workoutsThisWeek: 0,
    personalRecords: 0,
    currentStreak: 0,
  };

  const {
    stats: initialStats,
    assignments: initialAssignments = [],
    workouts: initialWorkouts = [],
    groups: initialGroups = [],
    athletes: initialAthletes = [],
    coachWelcomeMessage: initialCoachMessage = null,
  } = initialData;

  const { user, isLoading } = useRequireAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(
    initialStats ?? DEFAULT_STATS
  );
  const [loadingStats, setLoadingStats] = useState(!initialStats);

  // Use minimum loading time to prevent jarring flashes
  const { showSkeleton: showStatsSkeleton } = useMinimumLoadingTime(
    loadingStats,
    300
  );

  const [coachWelcomeMessage, setCoachWelcomeMessage] = useState<string | null>(
    initialCoachMessage
  );

  // Assignment state
  const [assignments, setAssignments] =
    useState<WorkoutAssignment[]>(initialAssignments);
  const [workoutPlans, setWorkoutPlans] =
    useState<WorkoutPlan[]>(initialWorkouts);
  const [groups, setGroups] = useState<AthleteGroup[]>(initialGroups);
  const [athletes, setAthletes] = useState<User[]>(initialAthletes);
  const [loadingData, setLoadingData] = useState(false);

  // Use minimum loading time for assignments/calendar data
  const { showSkeleton: showDataSkeleton } = useMinimumLoadingTime(
    loadingData,
    300
  );

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
  const hasInitialAthleteAssignments = initialAssignments.length > 0;
  const hasInitialStats = Boolean(initialStats);
  const hasInitialCoachMessage = initialCoachMessage !== null;
  const hasInitialCoachPayload =
    isCoachOrAdmin &&
    (initialAssignments.length > 0 ||
      initialWorkouts.length > 0 ||
      initialGroups.length > 0 ||
      initialAthletes.length > 0);

  const todaysAssignments = assignments.filter((assignment) =>
    checkIsToday(parseDate(assignment.scheduledDate))
  );
  const upcomingAssignments = assignments.filter((assignment) => {
    const assignmentDate = parseDate(assignment.scheduledDate);
    return checkIsFuture(assignmentDate) && !checkIsToday(assignmentDate);
  });
  const hasTodaysAssignments = todaysAssignments.length > 0;
  const hasUpcomingAssignments = upcomingAssignments.length > 0;

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const gettingStartedSteps = [
    "Wait for your coach to assign your first workout",
    "Workouts will appear in your calendar below",
    "Tap Start Workout when you are ready to log your sets",
  ];

  // Fetch dashboard stats for athletes
  // NOTE: This bootstrap effect intentionally omits helper callbacks from the dependency array
  // to avoid re-running every time assignments refresh. We only want the first pass after
  // hydration, so suppress the exhaustive-deps rule for this block.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!user || user.role !== "athlete") {
      return;
    }

    if (!hasInitialStats) {
      fetchDashboardStats();
    }

    if (!hasInitialAthleteAssignments) {
      fetchAthleteAssignments();
    }

    if (!hasInitialCoachMessage) {
      fetchCoachWelcomeMessage();
    }
  }, [
    user,
    hasInitialStats,
    hasInitialAthleteAssignments,
    hasInitialCoachMessage,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Fetch assignment data for coaches
  useEffect(() => {
    if (user && isCoachOrAdmin && !hasInitialCoachPayload) {
      fetchCoachData();
    }
  }, [user, isCoachOrAdmin, hasInitialCoachPayload]);

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

  const fetchCoachWelcomeMessage = async () => {
    try {
      // Get the athlete's coach ID from their first assignment
      if (assignments.length > 0 && assignments[0].assignedBy) {
        const response = await fetch(
          `/api/coach/settings/public?coachId=${assignments[0].assignedBy}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to fetch coach welcome message:",
            response.status,
            response.statusText,
            errorText
          );
          return;
        }

        const data = await response.json();

        if (data.success && data.settings?.welcome_message) {
          setCoachWelcomeMessage(data.settings.welcome_message);
        } else if (!data.success && data.error) {
          console.warn("Coach welcome message unavailable:", data.error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coach welcome message:", error);
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
        const assignments =
          assignmentsData.data.assignments || assignmentsData.data || [];
        setAssignments(assignments);
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
    router.push(`/workouts/live/${assignmentId}`);
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
      <div className="min-h-screen px-4 py-6 bg-linear-to-br from-accent-orange-50 via-accent-pink-50 to-accent-purple-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Header - Glass Material with Vibrant Gradient */}
          <GlassCard gradientAccent="primary">
            {/* Header with title and settings */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-accent-orange-500" />
                <div>
                  <Display size="sm" className="text-navy-700">
                    Welcome back, {user.fullName}! 👋
                  </Display>
                  <Caption variant="muted" className="mt-0.5">
                    {user.role === "admin" ? "Administrator" : "Coach"}{" "}
                    Dashboard
                  </Caption>
                </div>
              </div>
              <Link href="/profile" className="shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4 shrink-0" />}
                  className="glass hover:glass-thick transition-all duration-300"
                >
                  <span className="hidden sm:inline whitespace-nowrap">
                    Settings
                  </span>
                  <span className="sm:hidden whitespace-nowrap">Settings</span>
                </Button>
              </Link>
            </div>

            {/* Quick Actions integrated into header */}
            <div className="pt-4 border-t border-white/20">
              <QuickActions />
            </div>
          </GlassCard>

          {/* Two-column layout for coaches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left column - Today */}
            <div className="lg:col-span-2">
              <Suspense fallback={<SkeletonCard className="h-64" />}>
                <TodayOverview />
              </Suspense>
            </div>

            {/* Right column - Stats */}
            <div className="lg:col-span-1">
              <Suspense fallback={<SkeletonCard className="h-64" />}>
                <GroupCompletionStats />
              </Suspense>
            </div>
          </div>

          {/* Full-width calendar */}
          <div className="relative">
            <GlassCard gradientAccent="tertiary" padding="none">
              {/* Calendar Header */}
              <div className="px-6 py-5 flex flex-col gap-4 border-b border-white/20 md:flex-row md:items-center md:justify-between bg-linear-to-r from-white/50 to-white/30">
                <div>
                  <Heading level="h3" className="text-navy-700">
                    Team Schedule
                  </Heading>
                  <Body size="sm" variant="secondary" className="mt-1">
                    Manage workout assignments
                  </Body>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowIndividualAssignment(true);
                    }}
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserPlus className="w-4 h-4 shrink-0" />}
                    className="shrink-0 min-w-[100px] whitespace-nowrap"
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
                    leftIcon={<Users className="w-4 h-4 shrink-0" />}
                    className="shrink-0 min-w-[100px] whitespace-nowrap"
                  >
                    Group
                  </Button>
                </div>
              </div>

              {showDataSkeleton ? (
                <div className="p-8">
                  <SkeletonCard className="h-96" />
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="p-8">
                      <SkeletonCard className="h-96" />
                    </div>
                  }
                >
                  <div className="p-1">
                    <Calendar
                      assignments={assignments}
                      onAssignmentClick={handleAssignmentClick}
                      onDateClick={handleDateClick}
                      onAssignmentMove={handleAssignmentMove}
                      viewMode="month"
                      isCoach={true}
                      groups={groups}
                    />
                  </div>
                </Suspense>
              )}
            </GlassCard>
          </div>

          {/* Assignment Modals */}
          {showGroupAssignment && (
            <Suspense fallback={<SkeletonCard className="h-96" />}>
              <GroupAssignmentModal
                isOpen={showGroupAssignment}
                onClose={() => setShowGroupAssignment(false)}
                selectedDate={selectedDate}
                groups={groups}
                workoutPlans={workoutPlans}
                athletes={athletes}
                onAssignWorkout={handleAssignWorkout}
              />
            </Suspense>
          )}

          {showIndividualAssignment && (
            <Suspense fallback={<SkeletonCard className="h-96" />}>
              <IndividualAssignmentModal
                isOpen={showIndividualAssignment}
                onClose={() => setShowIndividualAssignment(false)}
                athletes={athletes}
                workoutPlans={workoutPlans}
                currentUserId={user?.id}
                onAssignWorkout={handleAssignWorkout}
              />
            </Suspense>
          )}

          {/* Assignment Detail Modal */}
          {selectedAssignmentId && (
            <Suspense fallback={null}>
              <WorkoutAssignmentDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetailModal}
                assignmentId={selectedAssignmentId}
                userRole={user?.role || "athlete"}
                onStartWorkout={handleStartWorkout}
                onEdit={() => {}}
                onDelete={handleDeleteAssignment}
              />
            </Suspense>
          )}
        </div>
      </div>
    );
  }

  // Athlete Dashboard - Mobile-Forward, Industry-Leading Design
  return (
    <div className="min-h-screen bg-linear-to-br from-accent-blue-50 via-accent-cyan-50 to-accent-green-50">
      {/* Glass Header with Gradient Accent */}
      <div className="sticky top-0 z-50 border-b border-white/20 shadow-lg glass-thick backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent-blue-500 via-accent-cyan-500 to-accent-green-500" />
        <div className="container-responsive px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Caption variant="muted" className="truncate">
              {todayLabel}
            </Caption>
            <Heading level="h3" className="mt-1 truncate">
              Hi, {user.firstName}! 👋
            </Heading>
          </div>
          <Link href="/profile" className="shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="glass hover:glass-thick transition-all duration-300 whitespace-nowrap"
            >
              Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="container-responsive px-4 py-5 pb-24 max-w-2xl mx-auto space-y-6">
        {/* Today Section */}
        {user.role === "athlete" && (
          <section>
            <DashboardSectionHeading
              label="Today's Workouts"
              accentToken="var(--color-accent-orange-500)"
              icon={<Dumbbell className="w-4 h-4" />}
            />

            {hasTodaysAssignments ? (
              <AnimatedList className="space-y-4" staggerDelay={0.08}>
                {todaysAssignments.map((assignment) => {
                  const assignmentId =
                    assignment.id ||
                    `${assignment.workoutPlanId}-${assignment.athleteId}`;

                  return (
                    <AnimatedListItem key={assignmentId}>
                      <Card
                        variant="hero"
                        surface="strength"
                        padding="none"
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-5">
                          <Body
                            size="xs"
                            variant="inverse"
                            weight="semibold"
                            className="uppercase tracking-[0.35em] mb-2"
                          >
                            Today&apos;s Workout
                          </Body>
                          <Heading level="h3" variant="inverse">
                            {assignment.workoutPlanName || "Workout"}
                          </Heading>
                          <div className="mt-3 flex flex-wrap items-center gap-4">
                            {assignment.startTime && (
                              <Body
                                size="sm"
                                variant="inverse"
                                className="flex items-center gap-1.5"
                              >
                                <Clock className="w-4 h-4" />
                                {assignment.endTime
                                  ? formatTimeRange(
                                      assignment.startTime,
                                      assignment.endTime
                                    )
                                  : formatTime12Hour(assignment.startTime)}
                              </Body>
                            )}
                            {assignment.location && (
                              <Body
                                size="sm"
                                variant="inverse"
                                className="flex items-center gap-1.5"
                              >
                                <MapPin className="w-4 h-4" />
                                {assignment.location}
                              </Body>
                            )}
                          </div>
                        </div>
                        <div className="px-6 pb-6 bg-white/10 backdrop-blur-sm border-t border-white/20">
                          <Link
                            href={`/workouts/live/${assignmentId}`}
                            className="block"
                          >
                            <Button
                              variant="primary"
                              fullWidth
                              leftIcon={<Dumbbell className="w-6 h-6" />}
                              className="h-14 text-lg font-semibold"
                            >
                              Start Workout
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </AnimatedListItem>
                  );
                })}
              </AnimatedList>
            ) : (
              <div className="relative glass-thick backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden p-8">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-accent-cyan-500 to-accent-blue-600 opacity-90" />

                {/* Content */}
                <div className="relative text-center space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <CalendarIcon className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                  <Heading level="h3" className="text-white drop-shadow-md">
                    No Workouts Today
                  </Heading>
                  <Body className="text-white/90">
                    {assignments.length === 0
                      ? "Your coach will assign workouts soon. Check back later or reach out to your coach."
                      : "Enjoy your rest day! Check your schedule below for upcoming workouts."}
                  </Body>
                  {assignments.length === 0 && (
                    <div className="space-y-4 text-left">
                      {coachWelcomeMessage && (
                        <div className="rounded-2xl border border-white/30 p-4 glass backdrop-blur-md bg-white/10">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 bg-white/20 backdrop-blur-sm">
                              <Users className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                            <div className="flex-1">
                              <Heading
                                level="h6"
                                className="text-sm mb-1 text-white drop-shadow-md"
                              >
                                Message from Your Coach
                              </Heading>
                              <Body
                                size="sm"
                                className="whitespace-pre-wrap text-white/90"
                              >
                                {coachWelcomeMessage}
                              </Body>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="rounded-2xl border border-white/30 p-4 space-y-3 glass backdrop-blur-md bg-white/10">
                        <Heading
                          level="h6"
                          className="text-sm text-white drop-shadow-md"
                        >
                          Getting Started
                        </Heading>
                        <div className="space-y-2">
                          {gettingStartedSteps.map((step, index) => (
                            <div className="flex items-start gap-3" key={step}>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/40 text-white">
                                {index + 1}
                              </div>
                              <Body size="sm" className="text-white/90">
                                {step}
                              </Body>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Quick Stats */}
        <section>
          <DashboardSectionHeading
            label="Your Progress"
            accentToken="var(--color-accent-green-500)"
            icon={<Flame className="w-4 h-4" />}
          />
          <AnimatedGrid columns={3} gap={4} delay={0.2}>
            <StatCard
              icon={<Dumbbell className="w-5 h-5" />}
              value={stats.workoutsThisWeek}
              label="This Week"
              loading={showStatsSkeleton}
              trend="up"
            />

            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              value={stats.personalRecords}
              label="PRs"
              loading={showStatsSkeleton}
              trend="neutral"
            />

            <StatCard
              icon={<Flame className="w-5 h-5" />}
              value={stats.currentStreak}
              label="Day Streak"
              loading={showStatsSkeleton}
              trend="up"
            />
          </AnimatedGrid>
        </section>

        {/* This Week's Schedule */}
        <section>
          <DashboardSectionHeading
            label="This Week"
            accentToken="var(--color-accent-blue-500)"
            icon={<CalendarIcon className="w-4 h-4" />}
          />
          <Card
            variant="elevated"
            padding="none"
            className="overflow-hidden border shadow-sm"
          >
            <Calendar
              assignments={assignments}
              onAssignmentClick={handleAssignmentClick}
              viewMode="week"
              isCoach={false}
            />
          </Card>
        </section>

        {/* Upcoming Workouts */}
        {user.role === "athlete" && (
          <section>
            <DashboardSectionHeading
              label="Coming Up"
              accentToken="var(--color-accent-purple-500)"
              icon={<CalendarIcon className="w-4 h-4" />}
            />

            {hasUpcomingAssignments ? (
              <AnimatedList className="space-y-3">
                {upcomingAssignments.slice(0, 5).map((assignment) => {
                  const assignmentDate = parseDate(assignment.scheduledDate);
                  const assignmentId =
                    assignment.id ||
                    `${assignment.workoutPlanId}-${assignment.athleteId}`;

                  return (
                    <AnimatedListItem key={assignmentId}>
                      <GlassCard
                        variant="default"
                        padding="md"
                        className="hover:border-accent-purple-400 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                        onClick={() => handleAssignmentClick(assignment)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleAssignmentClick(assignment);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full shrink-0 bg-linear-to-br from-accent-purple-500 to-accent-pink-500 border border-white/20 shadow-lg">
                            <CalendarIcon className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Heading
                              level="h5"
                              className="truncate text-base text-navy-700"
                            >
                              {assignment.workoutPlanName || "Workout"}
                            </Heading>
                            <Caption variant="muted">
                              {assignmentDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                              {assignment.startTime &&
                                ` • ${formatTime12Hour(assignment.startTime)}`}
                            </Caption>
                          </div>
                          <Eye className="w-5 h-5 text-accent-purple-500" />
                        </div>
                      </GlassCard>
                    </AnimatedListItem>
                  );
                })}
              </AnimatedList>
            ) : (
              <GlassCard padding="lg" className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-accent-purple-500 to-accent-pink-500 border border-white/20 shadow-lg">
                  <CalendarIcon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <Heading level="h4" className="mt-3 text-lg text-navy-700">
                  No Upcoming Workouts
                </Heading>
                <Body size="sm" variant="secondary" className="mt-1">
                  {assignments.length === 0
                    ? "Your training schedule will appear here once your coach assigns workouts."
                    : "All caught up! Your coach will add more workouts soon."}
                </Body>
              </GlassCard>
            )}
          </section>
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

// StatCard Component with count-up animation and vibrant gradient overlays
interface StatCardProps {
  icon?: React.ReactNode;
  value: number;
  label: string;
  loading: boolean;
  trend?: "up" | "down" | "neutral";
}

function StatCard({
  icon,
  value,
  label,
  loading,
  trend = "neutral",
}: StatCardProps) {
  const count = useCountUp(value, {
    duration: 1200,
    delay: 100,
    start: !loading,
  });

  const trendGradients = {
    up: "from-accent-green-500 to-accent-emerald-600",
    down: "from-accent-blue-500 to-accent-indigo-600",
    neutral: "from-accent-purple-500 to-accent-pink-600",
  };

  if (loading) {
    return <SkeletonStatCard />;
  }

  return (
    <div className="relative glass-thick backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.02] transition-all duration-300">
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${trendGradients[trend]} opacity-90`}
      />

      {/* Content */}
      <div className="relative text-center p-4">
        {icon && (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-3 bg-white/20 backdrop-blur-sm">
            <div className="text-white drop-shadow-md">{icon}</div>
          </div>
        )}
        <Display
          size="md"
          as="p"
          className="tabular-nums text-white drop-shadow-md"
        >
          {count}
        </Display>
        <Body size="sm" weight="medium" className="mt-2 text-white/90">
          {label}
        </Body>
      </div>
    </div>
  );
}

export default withPageErrorBoundary(DashboardPage);
