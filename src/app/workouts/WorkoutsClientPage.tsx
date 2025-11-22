"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useRequireCoach } from "@/hooks/use-auth-guard";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { useToast } from "@/components/ToastProvider";
import { useWorkoutsPageState } from "@/hooks/useWorkoutsPageState";
import { useWorkoutsOperations } from "@/hooks/useWorkoutsOperations";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnimatedGrid } from "@/components/ui/AnimatedList";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { withPageErrorBoundary } from "@/components/ui/PageErrorBoundary";
import { Body, Heading, Caption } from "@/components/ui/Typography";
import {
  WorkoutPlan,
  WorkoutExercise,
  WorkoutAssignment,
  AthleteGroup,
  User as UserType,
} from "@/types";
import {
  Dumbbell,
  Plus,
  Library,
  XCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Archive,
  ArchiveRestore,
  User,
  Layers,
  Repeat,
} from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";
import { ExerciseGroupDisplay } from "@/components/ExerciseGroupDisplay";
import {
  validateWorkout,
  canSaveWorkout,
  formatValidationErrors,
} from "@/lib/workout-validation";
import { WorkoutEditorErrorBoundary } from "@/components/WorkoutEditorErrorBoundary";
import { WorkoutListSkeleton } from "@/components/skeletons";
import { EmptyWorkouts } from "@/components/ui/EmptyState";

// Dynamic imports for large components
const ExerciseLibrary = lazy(() => import("@/components/ExerciseLibrary"));
const WorkoutEditor = lazy(() => import("@/components/WorkoutEditor"));
const GroupAssignmentModal = lazy(
  () => import("@/components/GroupAssignmentModal")
);
const IndividualAssignmentModal = lazy(
  () => import("@/components/IndividualAssignmentModal")
);

// Exercise interface to match the one in ExerciseLibrary component
interface LibraryExercise {
  id: string;
  name: string;
  description: string;
  category_name: string;
  category_color: string;
  muscle_groups: Array<{ name: string; involvement: string }>;
  equipment_needed: string[];
  difficulty_level: number;
  is_compound: boolean;
  is_bodyweight: boolean;
  instructions: string[];
  video_url?: string;
  usage_count: number;
}

interface WorkoutsClientPageProps {
  initialWorkouts?: WorkoutPlan[];
  initialGroups?: AthleteGroup[];
  initialAthletes?: UserType[];
}

function WorkoutsPage({
  initialWorkouts = [],
  initialGroups = [],
  initialAthletes = [],
}: WorkoutsClientPageProps) {
  const { user, isLoading: authLoading } = useRequireCoach();
  const { success, error: showErrorToast } = useToast();

  // Use custom hooks for state management
  const state = useWorkoutsPageState(initialWorkouts);
  const operations = useWorkoutsOperations({
    setWorkouts: state.setWorkouts,
    setShowGroupAssignModal: state.setShowGroupAssignModal,
    setShowIndividualAssignModal: state.setShowIndividualAssignModal,
    setSelectedWorkout: state.setSelectedWorkout,
    onSuccess: success,
    onError: showErrorToast,
  });

  // Add minimum loading time for smooth skeleton display
  const { showSkeleton: showAuthSkeleton } = useMinimumLoadingTime(
    authLoading,
    300
  );
  const { showSkeleton: showWorkoutsSkeleton } = useMinimumLoadingTime(
    state.loading,
    300
  );

  const initialWorkoutsCount = initialWorkouts.length;
  const shouldSkipSkeletonRef = useRef(initialWorkoutsCount > 0);

  // Load workouts from API
  useEffect(() => {
    const loadWorkouts = async (showSkeleton: boolean) => {
      try {
        if (showSkeleton) {
          state.setLoading(true);
        }
        state.setError(null);

        // Build query params based on showArchived state
        const queryParams = new URLSearchParams();
        if (state.showArchived) {
          queryParams.set("onlyArchived", "true");
        }

        const url = `/api/workouts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await fetch(url);
        const data = (await response.json()) as ApiResponse;

        if (data.success && data.data) {
          const apiResponse = data.data as { workouts?: WorkoutPlan[] };
          state.setWorkouts(apiResponse.workouts || []);
        } else {
          state.setError(
            typeof data.error === "string"
              ? data.error
              : "Failed to load workouts"
          );
        }
      } catch (err) {
        state.setError("Failed to load workouts");
        console.error("Error loading workouts:", err);
      } finally {
        state.setLoading(false);
      }
    };

    if (user) {
      const shouldShowSkeleton = state.showArchived || !shouldSkipSkeletonRef.current;
      shouldSkipSkeletonRef.current = false;
      loadWorkouts(shouldShowSkeleton);
    }
  }, [user, state.showArchived, state]);

  if (showAuthSkeleton) {
    return (
      <div className="min-h-screen bg-white container-responsive section-spacing">
        <div className="max-w-7xl mx-auto">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "coach")) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card variant="default" padding="lg" className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-accent-red" />
            <Heading level="h2" className="mb-2">
              Access Denied
            </Heading>
            <Body variant="secondary" className="mb-4">
              Only coaches and admins can manage workouts.
            </Body>
          </Card>
        </div>
      </div>
    );
  }

  const formatWeight = (exercise: WorkoutExercise) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage")
      return `${exercise.percentage}% 1RM`;
    return `${exercise.weight} lbs`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced mobile-first header */}
      <div className="container-responsive p-6 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Workout Management"
            subtitle="Create and manage training plans"
            icon={<Dumbbell className="w-6 h-6" />}
            gradientVariant="primary"
            actions={
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant={state.currentView === "workouts" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => state.setCurrentView("workouts")}
                  leftIcon={<Dumbbell className="w-4 h-4" />}
                  className="flex-1 sm:flex-none"
                >
                  Workouts
                </Button>
                <Button
                  variant={state.currentView === "library" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => state.setCurrentView("library")}
                  leftIcon={<Library className="w-4 h-4" />}
                  className="flex-1 sm:flex-none"
                >
                  Exercise Library
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Enhanced mobile-first content */}
      <div className="max-w-4xl mx-auto p-6 sm:p-4">
        {state.currentView === "workouts" ? (
          <>
            {/* Enhanced error state */}
            {state.error && (
              <Alert variant="error">
                <p className="font-medium">{state.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-accent-red/90 transition-colors touch-manipulation"
                >
                  Try again
                </button>
              </Alert>
            )}

            {/* Loading state */}
            {showWorkoutsSkeleton && <WorkoutListSkeleton count={4} />}

            {/* Action Buttons */}
            {!showWorkoutsSkeleton && (
              <div className="bg-gradient-subtle-primary rounded-xl p-6 mb-6 border border-silver-200">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Heading level="h2" className="mb-1">
                        {state.showArchived ? "Archived Workouts" : "Your Workouts"}
                      </Heading>
                      <Body className="text-sm" variant="secondary">
                        {state.showArchived
                          ? "Previously archived training plans"
                          : "Create and manage your training programs"}
                      </Body>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        state.setCreatingWorkout(true);
                      }}
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="shrink-0"
                    >
                      Create Workout
                    </Button>
                  </div>
                  <Button
                    onClick={() => state.setShowArchived(!state.showArchived)}
                    variant="secondary"
                    className="w-full sm:w-auto self-start"
                    leftIcon={
                      state.showArchived ? (
                        <Dumbbell className="w-4 h-4" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )
                    }
                  >
                    {state.showArchived
                      ? "View Active Workouts"
                      : "View Archived Workouts"}
                  </Button>
                </div>
              </div>
            )}

            {/* Workouts Grid */}
            {!showWorkoutsSkeleton && (
              <AnimatedGrid columns={2} gap={4} delay={0.1} staggerDelay={0.05}>
                {state.workouts.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyWorkouts
                      onCreateWorkout={() => state.setCreatingWorkout(true)}
                    />
                  </div>
                ) : (
                  state.workouts.map((workout) => {
                    // Check if this is a temporary (optimistic) workout
                    const isOptimistic = workout.id.startsWith("temp-");
                    const isExpanded = state.expandedWorkout === workout.id;

                    return (
                      <Card
                        key={workout.id}
                        variant="default"
                        padding="none"
                        className={`relative overflow-hidden ${
                          isOptimistic ? "opacity-70 animate-pulse" : ""
                        } hover:shadow-lg transition-shadow`}
                      >
                        {/* Gradient Accent Bar - Inside Card */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-accent-primary" />

                        {/* Card Content with left padding to account for gradient bar */}
                        <div className="pl-6 pr-4 py-4">
                          {/* Header - Always visible, clickable to expand */}
                          <div
                            className="flex justify-between items-start mb-3 cursor-pointer hover:bg-(--interactive-hover) -m-4 p-4 rounded-lg transition-colors"
                            onClick={() =>
                              state.setExpandedWorkout(isExpanded ? null : workout.id)
                            }
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Heading level="h4" className="inline">
                                  {workout.name}
                                  {isOptimistic && (
                                    <Caption className="ml-2 text-accent-blue-600 font-normal inline">
                                      (Saving...)
                                    </Caption>
                                  )}
                                </Heading>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-navy-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-navy-600" />
                                )}
                              </div>
                              {workout.description && (
                                <Body
                                  className="text-sm mt-1"
                                  variant="secondary"
                                >
                                  {workout.description}
                                </Body>
                              )}
                            </div>
                            <Badge variant="neutral" size="sm" className="ml-4">
                              {workout.estimatedDuration}min
                            </Badge>
                          </div>

                          {/* Exercise Preview or Full List */}
                          <div className="space-y-1 mb-4">
                            {isExpanded ? (
                              // Expanded view - show all exercises with grouping
                              <>
                                <Caption
                                  variant="muted"
                                  className="font-bold uppercase mb-3"
                                >
                                  Exercises ({workout.exercises.length})
                                  {workout.groups &&
                                    workout.groups.length > 0 && (
                                      <span className="ml-2 text-accent-blue-600">
                                        • {workout.groups.length} group
                                        {workout.groups.length !== 1 ? "s" : ""}
                                      </span>
                                    )}
                                </Caption>
                                <ExerciseGroupDisplay
                                  exercises={workout.exercises}
                                  groups={workout.groups || []}
                                  showProgress={false}
                                />
                              </>
                            ) : (
                              // Collapsed view - show first 3 exercises with group indicators
                              <>
                                {workout.exercises
                                  .slice(0, 3)
                                  .map((exercise, index) => {
                                    const group = workout.groups?.find(
                                      (g) => g.id === exercise.groupId
                                    );
                                    return (
                                      <Body
                                        key={exercise.id}
                                        size="sm"
                                        className="flex items-center gap-2"
                                      >
                                        <span>
                                          {index + 1}. {exercise.exerciseName} -{" "}
                                          {exercise.sets}×{exercise.reps} @{" "}
                                          {formatWeight(exercise)}
                                        </span>
                                        {group && (
                                          <Badge
                                            size="sm"
                                            variant={
                                              group.type === "superset"
                                                ? "primary"
                                                : group.type === "circuit"
                                                  ? "info"
                                                  : "warning"
                                            }
                                          >
                                            {group.type === "superset" && (
                                              <Layers className="w-3 h-3 inline mr-1" />
                                            )}
                                            {group.type === "circuit" && (
                                              <Repeat className="w-3 h-3 inline mr-1" />
                                            )}
                                            {group.type === "section" && (
                                              <Dumbbell className="w-3 h-3 inline mr-1" />
                                            )}
                                            {group.type}
                                          </Badge>
                                        )}
                                      </Body>
                                    );
                                  })}
                                {workout.exercises.length > 3 && (
                                  <Body size="sm" variant="secondary">
                                    +{workout.exercises.length - 3} more
                                    exercises
                                  </Body>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {!state.showArchived && (
                              <>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    state.setEditingWorkout(workout);
                                  }}
                                  variant="secondary"
                                  className="flex-1"
                                  disabled={isOptimistic}
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    state.setSelectedWorkout(workout);
                                    state.setShowAssignForm(true);
                                  }}
                                  variant="primary"
                                  className="flex-1"
                                  disabled={isOptimistic}
                                  leftIcon={<Users className="w-4 h-4" />}
                                >
                                  Assign
                                </Button>
                              </>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                operations.handleArchiveToggle(
                                  workout.id,
                                  workout.archived || false
                                );
                              }}
                              className={`${state.showArchived ? "btn-primary flex-1" : "btn-secondary"} flex items-center justify-center gap-1`}
                              disabled={isOptimistic}
                              title={
                                workout.archived
                                  ? "Restore workout"
                                  : "Archive workout"
                              }
                            >
                              {workout.archived ? (
                                <>
                                  <ArchiveRestore className="w-4 h-4" />
                                  {state.showArchived && "Restore"}
                                </>
                              ) : (
                                <>
                                  <Archive className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </AnimatedGrid>
            )}
          </>
        ) : (
          /* Exercise Library View */
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <SkeletonCard />
              </div>
            }
          >
            <ExerciseLibrary
              isOpen={true}
              onClose={() => state.setCurrentView("workouts")}
              mode="browse"
              onAddToWorkout={(exercise: LibraryExercise) => {
                // When adding from library to a workout being created
                const workoutExercise: WorkoutExercise = {
                  id: Date.now().toString(),
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  sets: 3,
                  reps: 10,
                  weightType: "fixed",
                  weight: 0,
                  restTime: 120,
                  order: (state.newWorkout.exercises?.length || 0) + 1,
                };

                state.setNewWorkout({
                  ...state.newWorkout,
                  exercises: [...(state.newWorkout.exercises || []), workoutExercise],
                });
                state.setCurrentView("workouts");
              }}
            />
          </Suspense>
        )}

        {/* Assign Workout Modal - Choice between Group and Individual */}
        {state.showAssignForm && state.selectedWorkout && (
          <ModalBackdrop
            isOpen={state.showAssignForm}
            onClose={() => {
              state.closeAssignModals();
            }}
          >
            <div className="bg-white rounded-lg max-w-md w-full">
              <ModalHeader
                title={`Assign Workout: ${state.selectedWorkout.name}`}
                subtitle="Choose how you'd like to assign this workout:"
                icon={<Users className="w-6 h-6" />}
                onClose={() => {
                  state.closeAssignModals();
                }}
              />
              <ModalContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      state.setShowAssignForm(false);
                      operations.handleOpenAssignModal(state.selectedWorkout!, "group");
                    }}
                    variant="primary"
                    fullWidth
                    className="py-4"
                    leftIcon={<Users className="w-5 h-5" />}
                  >
                    <div className="text-left">
                      <div className="font-semibold">Assign to Group(s)</div>
                      <div className="text-sm opacity-90">
                        Assign to athlete groups with optional individual
                        modifications
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => {
                      state.setShowAssignForm(false);
                      operations.handleOpenAssignModal(state.selectedWorkout!, "individual");
                    }}
                    variant="secondary"
                    fullWidth
                    className="py-4"
                    leftIcon={<User className="w-5 h-5" />}
                  >
                    <div className="text-left">
                      <div className="font-semibold">
                        Assign to Individual Athletes
                      </div>
                      <div className="text-sm opacity-90">
                        Select specific athletes to assign this workout to
                      </div>
                    </div>
                  </Button>
                </div>
              </ModalContent>
              <ModalFooter align="right">
                <Button
                  onClick={() => {
                    state.closeAssignModals();
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </div>
          </ModalBackdrop>
        )}

        {/* Group Assignment Modal */}
        {state.showGroupAssignModal && state.selectedWorkout && (
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <Body size="lg" variant="secondary">
                    Loading...
                  </Body>
                </div>
              </ModalBackdrop>
            }
          >
            <GroupAssignmentModal
              isOpen={state.showGroupAssignModal}
              onClose={() => {
                state.closeAssignModals();
              }}
              selectedDate={new Date()}
              groups={operations.groups}
              workoutPlans={state.workouts}
              athletes={operations.athletes}
              onAssignWorkout={operations.handleAssignWorkout}
            />
          </Suspense>
        )}

        {/* Individual Assignment Modal */}
        {state.showIndividualAssignModal && state.selectedWorkout && (
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <Body size="lg" variant="secondary">
                    Loading...
                  </Body>
                </div>
              </ModalBackdrop>
            }
          >
            <IndividualAssignmentModal
              isOpen={state.showIndividualAssignModal}
              onClose={() => {
                state.closeAssignModals();
              }}
              athletes={operations.athletes}
              workoutPlans={state.workouts}
              currentUserId={user?.id}
              onAssignWorkout={operations.handleAssignWorkout}
            />
          </Suspense>
        )}
      </div>

      {/* Workout Editor Modal */}
      {(state.editingWorkout || state.creatingWorkout) && (
        <WorkoutEditorErrorBoundary
          workout={
            state.editingWorkout || {
              id: "new-workout",
              name: state.newWorkout.name || "",
              description: state.newWorkout.description || "",
              exercises: state.newWorkout.exercises || [],
              estimatedDuration: state.newWorkout.estimatedDuration || 30,
              createdBy: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          onRecover={(recoveredWorkout) => {
            // Recover workout from localStorage after error
            if (state.creatingWorkout) {
              state.setNewWorkout(recoveredWorkout);
            } else if (state.editingWorkout) {
              state.setEditingWorkout(recoveredWorkout as WorkoutPlan);
            }
          }}
        >
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <Body size="lg" variant="secondary">
                    Loading workout editor...
                  </Body>
                </div>
              </ModalBackdrop>
            }
          >
            <WorkoutEditor
              workout={
                state.editingWorkout || {
                  id: "new-workout",
                  name: state.newWorkout.name || "",
                  description: state.newWorkout.description || "",
                  exercises: state.newWorkout.exercises || [],
                  groups: state.newWorkout.groups || [],
                  blockInstances: state.newWorkout.blockInstances || [],
                  estimatedDuration: state.newWorkout.estimatedDuration || 30,
                  createdBy: user.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              }
              onChange={async (updatedWorkout) => {
                // For creating new workouts
                if (state.creatingWorkout) {
                  // Check if this is an explicit save request (user clicked "Save Workout" button)
                  const workoutWithFlag = updatedWorkout as WorkoutPlan & {
                    _shouldSave?: boolean;
                  };
                  const shouldSave = workoutWithFlag._shouldSave;

                  // ALWAYS update local state first (for UI reactivity)
                  state.setNewWorkout(updatedWorkout);

                  if (!shouldSave) {
                    // Just editing - update state only, don't save to API yet
                    return;
                  }

                  // Remove the flag before saving
                  delete workoutWithFlag._shouldSave;

                  // Validate workout before saving
                  const validationResult = validateWorkout(updatedWorkout);

                  // Check if workout can be saved (has minimum requirements)
                  if (!canSaveWorkout(updatedWorkout)) {
                    // Not ready to save yet - just update state and return
                    return;
                  }

                  // Show validation warnings to user (non-blocking)
                  if (validationResult.warnings.length > 0) {
                    console.warn(
                      "Workout validation warnings:",
                      validationResult.warnings
                    );
                  }

                  // Block save if there are critical errors
                  if (!validationResult.isValid) {
                    const errorMessage =
                      formatValidationErrors(validationResult);
                    showErrorToast(
                      "Please fix validation errors before saving"
                    );
                    console.error("Validation errors:\n", errorMessage);
                    return;
                  }

                  // OPTIMISTIC UPDATE: Add workout to list immediately with temporary ID
                  const tempId = `temp-${Date.now()}`;
                  const optimisticWorkout: WorkoutPlan = {
                    ...updatedWorkout,
                    id: tempId,
                    createdBy: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    exercises: updatedWorkout.exercises || [],
                    groups: updatedWorkout.groups || [],
                  } as WorkoutPlan;

                  // Show workout in list immediately (optimistic)
                  state.setWorkouts([...state.workouts, optimisticWorkout]);

                  // Close modal immediately for instant UX
                  state.setCreatingWorkout(false);
                  state.setNewWorkout({
                    name: "",
                    description: "",
                    exercises: [],
                    estimatedDuration: 30,
                  });

                  try {
                    const response = (await apiClient.createWorkout({
                      name: updatedWorkout.name,
                      description: updatedWorkout.description,
                      exercises: updatedWorkout.exercises,
                      groups: updatedWorkout.groups, // CRITICAL: Include groups!
                      estimatedDuration: updatedWorkout.estimatedDuration || 30,
                    })) as ApiResponse;

                    if (response.success && response.data) {
                      const apiResponse = response.data as {
                        workout?: WorkoutPlan;
                      };
                      const createdWorkout = apiResponse.workout;
                      if (createdWorkout) {
                        // Replace temporary workout with real one from API
                        state.setWorkouts((prevWorkouts) =>
                          prevWorkouts.map((w) =>
                            w.id === tempId ? createdWorkout : w
                          )
                        );
                        success("Workout saved successfully!");
                      } else {
                        // Rollback: Remove temporary workout
                        state.setWorkouts((prevWorkouts) =>
                          prevWorkouts.filter((w) => w.id !== tempId)
                        );
                        showErrorToast("Failed to create workout");
                      }
                    } else {
                      // Rollback: Remove temporary workout
                      state.setWorkouts((prevWorkouts) =>
                        prevWorkouts.filter((w) => w.id !== tempId)
                      );
                      const errorMsg =
                        typeof response.error === "string"
                          ? response.error
                          : "Failed to create workout";
                      showErrorToast(errorMsg);
                    }
                  } catch (err) {
                    // Rollback: Remove temporary workout
                    state.setWorkouts((prevWorkouts) =>
                      prevWorkouts.filter((w) => w.id !== tempId)
                    );
                    console.error("Error creating workout:", err);
                    showErrorToast("Failed to create workout");
                  }
                } else {
                  // For editing existing workouts
                  // [REMOVED] console.log("[page.tsx] EDITING existing workout");

                  // Check if this is an explicit save request
                  const workoutWithFlag = updatedWorkout as WorkoutPlan & {
                    _shouldSave?: boolean;
                  };
                  const shouldSave = workoutWithFlag._shouldSave;

                  // ALWAYS update local state first
                  state.setEditingWorkout(updatedWorkout as WorkoutPlan);
                  const updatedWorkouts = state.workouts.map((w) =>
                    w.id === updatedWorkout.id ? updatedWorkout : w
                  );
                  state.setWorkouts(updatedWorkouts);

                  if (!shouldSave) {
                    return;
                  }

                  // Remove the flag
                  delete workoutWithFlag._shouldSave;

                  // Safety check: Don't try to save temp workouts
                  if (updatedWorkout.id?.startsWith("temp-")) {
                    showErrorToast(
                      "Cannot save workout that is still being created. Please wait a moment."
                    );
                    return;
                  }

                  try {
                    const response = (await apiClient.updateWorkout(
                      updatedWorkout.id!,
                      {
                        name: updatedWorkout.name,
                        description: updatedWorkout.description,
                        exercises: updatedWorkout.exercises,
                        groups: updatedWorkout.groups,
                        blockInstances: updatedWorkout.blockInstances,
                        estimatedDuration:
                          updatedWorkout.estimatedDuration || 30,
                      }
                    )) as ApiResponse;

                    if (response.success && response.data) {
                      state.setEditingWorkout(null);
                      success("Workout updated successfully!");
                    } else {
                      const errorMsg =
                        typeof response.error === "string"
                          ? response.error
                          : "Failed to update workout";
                      console.error("Workout update failed:", response);
                      showErrorToast(errorMsg);
                    }
                  } catch (err) {
                    const errorMessage =
                      err instanceof Error
                        ? err.message
                        : "Failed to update workout";
                    console.error("Error updating workout:", {
                      error: err,
                      workoutId: updatedWorkout.id,
                      workoutName: updatedWorkout.name,
                    });
                    showErrorToast(errorMessage);
                  }
                }
              }}
              onClose={() => {
                // Reset state and close modal
                // Save is handled in onChange now
                state.setEditingWorkout(null);
                state.setCreatingWorkout(false);
                state.setNewWorkout({
                  name: "",
                  description: "",
                  exercises: [],
                  estimatedDuration: 30,
                });
              }}
            />
          </Suspense>
        </WorkoutEditorErrorBoundary>
      )}
    </div>
  );
}

export default withPageErrorBoundary(WorkoutsPage);
