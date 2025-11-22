"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect, lazy, Suspense } from "react";
import { useCountUp } from "@/hooks/use-count-up";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useDashboardOperations } from "@/hooks/useDashboardOperations";
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

function DashboardClientPageComponent({
  initialData,
}: DashboardClientPageProps) {
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

  // Initialize dashboard state
  const state = useDashboardState({
    initialStats,
    initialAssignments,
    initialWorkouts,
    initialGroups,
    initialAthletes,
    initialCoachMessage,
  });

  // Use minimum loading time to prevent jarring flashes
  const { showSkeleton: showStatsSkeleton } = useMinimumLoadingTime(
    state.loadingStats,
    300
  );

  // Use minimum loading time for assignments/calendar data
  const { showSkeleton: showDataSkeleton } = useMinimumLoadingTime(
    state.loadingData,
    300
  );

  const isCoachOrAdmin = user?.role === "coach" || user?.role === "admin";

  // Initialize dashboard operations
  const operations = useDashboardOperations({
    userId: user?.id,
    isCoachOrAdmin,
    assignments: state.assignments,
    setStats: state.setStats,
    setLoadingStats: state.setLoadingStats,
    setAssignments: state.setAssignments,
    setWorkoutPlans: state.setWorkoutPlans,
    setGroups: state.setGroups,
    setAthletes: state.setAthletes,
    setLoadingData: state.setLoadingData,
    setCoachWelcomeMessage: state.setCoachWelcomeMessage,
    setShowGroupAssignment: state.setShowGroupAssignment,
    setShowIndividualAssignment: state.setShowIndividualAssignment,
    setSelectedDate: state.setSelectedDate,
    setSelectedAssignmentId: state.setSelectedAssignmentId,
    setShowDetailModal: state.setShowDetailModal,
    closeDetailModal: state.closeDetailModal,
  });

  const hasInitialAthleteAssignments = initialAssignments.length > 0;
  const hasInitialStats = Boolean(initialStats);
  const hasInitialCoachMessage = initialCoachMessage !== null;
  const hasInitialCoachPayload =
    isCoachOrAdmin &&
    (initialAssignments.length > 0 ||
      initialWorkouts.length > 0 ||
      initialGroups.length > 0 ||
      initialAthletes.length > 0);

  const todaysAssignments = state.assignments.filter((assignment) =>
    checkIsToday(parseDate(assignment.scheduledDate))
  );
  const upcomingAssignments = state.assignments.filter((assignment) => {
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
      operations.fetchDashboardStats();
    }

    if (!hasInitialAthleteAssignments) {
      operations.fetchAthleteAssignments();
    }

    if (!hasInitialCoachMessage) {
      operations.fetchCoachWelcomeMessage();
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
      operations.fetchCoachData();
    }
  }, [user, isCoachOrAdmin, hasInitialCoachPayload]);

  const handleStartWorkout = (assignmentId: string) => {
    router.push(`/workouts/live/${assignmentId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 to-purple-50">
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
      <div className="min-h-screen px-4 py-6 bg-linear-to-br from-accent-blue-50 via-accent-purple-50 to-accent-pink-50">
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
                    onClick={operations.handleIndividualAssignClick}
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserPlus className="w-4 h-4 shrink-0" />}
                    className="shrink-0 min-w-[100px] whitespace-nowrap"
                  >
                    Athlete
                  </Button>
                  <Button
                    onClick={operations.handleGroupAssignClick}
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
                      assignments={state.assignments}
                      onAssignmentClick={operations.handleAssignmentClick}
                      onDateClick={operations.handleDateClick}
                      onAssignmentMove={operations.handleAssignmentMove}
                      viewMode="month"
                      isCoach={true}
                      groups={state.groups}
                    />
                  </div>
                </Suspense>
              )}
            </GlassCard>
          </div>

          {/* Assignment Modals */}
          {state.showGroupAssignment && (
            <Suspense fallback={null}>
              <GroupAssignmentModal
                isOpen={state.showGroupAssignment}
                onClose={() => state.setShowGroupAssignment(false)}
                selectedDate={state.selectedDate}
                groups={state.groups}
                workoutPlans={state.workoutPlans}
                athletes={state.athletes}
                onAssignWorkout={operations.handleAssignWorkout}
              />
            </Suspense>
          )}

          {state.showIndividualAssignment && (
            <Suspense fallback={<SkeletonCard className="h-96" />}>
              <IndividualAssignmentModal
                isOpen={state.showIndividualAssignment}
                onClose={() => state.setShowIndividualAssignment(false)}
                athletes={state.athletes}
                workoutPlans={state.workoutPlans}
                currentUserId={user?.id}
                onAssignWorkout={operations.handleAssignWorkout}
              />
            </Suspense>
          )}

          {/* Assignment Detail Modal */}
          {state.selectedAssignmentId && (
            <Suspense fallback={null}>
              <WorkoutAssignmentDetailModal
                isOpen={state.showDetailModal}
                onClose={state.closeDetailModal}
                assignmentId={state.selectedAssignmentId}
                userRole={user?.role || "athlete"}
                onStartWorkout={handleStartWorkout}
                onEdit={() => {}}
                onDelete={operations.handleDeleteAssignment}
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
                    {state.assignments.length === 0
                      ? "Your coach will assign workouts soon. Check back later or reach out to your coach."
                      : "Enjoy your rest day! Check your schedule below for upcoming workouts."}
                  </Body>
                  {state.assignments.length === 0 && (
                    <div className="space-y-4 text-left">
                      {state.coachWelcomeMessage && (
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
                                {state.coachWelcomeMessage}
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
              value={state.stats.workoutsThisWeek}
              label="This Week"
              loading={showStatsSkeleton}
              trend="up"
            />

            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              value={state.stats.personalRecords}
              label="PRs"
              loading={showStatsSkeleton}
              trend="neutral"
            />

            <StatCard
              icon={<Flame className="w-5 h-5" />}
              value={state.stats.currentStreak}
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
              assignments={state.assignments}
              onAssignmentClick={operations.handleAssignmentClick}
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
                        onClick={() =>
                          operations.handleAssignmentClick(assignment)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            operations.handleAssignmentClick(assignment);
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
                  {state.assignments.length === 0
                    ? "Your training schedule will appear here once your coach assigns workouts."
                    : "All caught up! Your coach will add more workouts soon."}
                </Body>
              </GlassCard>
            )}
          </section>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {state.selectedAssignmentId && (
        <WorkoutAssignmentDetailModal
          isOpen={state.showDetailModal}
          onClose={state.closeDetailModal}
          assignmentId={state.selectedAssignmentId}
          userRole={user?.role || "athlete"}
          onStartWorkout={handleStartWorkout}
          onEdit={() => {}}
          onDelete={operations.handleDeleteAssignment}
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

export default withPageErrorBoundary(DashboardClientPageComponent, "Dashboard");
