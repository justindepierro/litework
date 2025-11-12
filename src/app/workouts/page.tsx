"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRequireCoach } from "@/hooks/use-auth-guard";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { useToast } from "@/components/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedGrid } from "@/components/ui/AnimatedList";
import { SkeletonCard } from "@/components/ui/Skeleton";
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

export default function WorkoutsPage() {
  const { user, isLoading: authLoading } = useRequireCoach();
  const { success, error: showErrorToast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add minimum loading time for smooth skeleton display
  const { showSkeleton: showAuthSkeleton } = useMinimumLoadingTime(authLoading, 300);
  const { showSkeleton: showWorkoutsSkeleton } = useMinimumLoadingTime(loading, 300);
  
  const [error, setError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showGroupAssignModal, setShowGroupAssignModal] = useState(false);
  const [showIndividualAssignModal, setShowIndividualAssignModal] =
    useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [creatingWorkout, setCreatingWorkout] = useState<boolean>(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [currentView, setCurrentView] = useState<"workouts" | "library">(
    "workouts"
  );
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    name: "",
    description: "",
    exercises: [],
    groups: [],
    blockInstances: [],
    estimatedDuration: 30,
  });

  // Assignment data - load when needed
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [athletes, setAthletes] = useState<UserType[]>([]);
  const [loadingAssignmentData, setLoadingAssignmentData] = useState(false);

  // Load assignment data when assign modal opens
  const loadAssignmentData = async () => {
    if (groups.length > 0 && athletes.length > 0) return; // Already loaded

    try {
      setLoadingAssignmentData(true);

      const [groupsRes, athletesRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/athletes"),
      ]);

      const [groupsData, athletesData] = await Promise.all([
        groupsRes.json(),
        athletesRes.json(),
      ]);

      if (groupsData.success) {
        // API returns { success, groups } for groups endpoint
        setGroups(groupsData.groups || []);
      }

      if (athletesData.success && athletesData.data) {
        // API returns { success, data: { athletes, invites } } for athletes endpoint
        setAthletes(athletesData.data.athletes || []);
      }
    } catch (err) {
      console.error("Failed to load assignment data:", err);
      showErrorToast("Failed to load groups and athletes");
    } finally {
      setLoadingAssignmentData(false);
    }
  };

  const handleOpenAssignModal = async (
    workout: WorkoutPlan,
    mode: "group" | "individual"
  ) => {
    setSelectedWorkout(workout);
    await loadAssignmentData();

    if (mode === "group") {
      setShowGroupAssignModal(true);
    } else {
      setShowIndividualAssignModal(true);
    }
  };

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment), // Send assignment directly, not wrapped in array
      });

      const data = await response.json();

      if (data.success) {
        success("Workout assigned successfully!");
        setShowGroupAssignModal(false);
        setShowIndividualAssignModal(false);
        setSelectedWorkout(null);
      } else {
        showErrorToast(data.error || "Failed to assign workout");
      }
    } catch (err) {
      console.error("Failed to assign workout:", err);
      showErrorToast("Failed to assign workout");
    }
  };

  // Load workouts from API
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query params based on showArchived state
        const queryParams = new URLSearchParams();
        if (showArchived) {
          queryParams.set("onlyArchived", "true");
        }

        const url = `/api/workouts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await fetch(url);
        const data = (await response.json()) as ApiResponse;

        if (data.success && data.data) {
          const apiResponse = data.data as { workouts?: WorkoutPlan[] };
          setWorkouts(apiResponse.workouts || []);
        } else {
          setError(
            typeof data.error === "string"
              ? data.error
              : "Failed to load workouts"
          );
        }
      } catch (err) {
        setError("Failed to load workouts");
        console.error("Error loading workouts:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWorkouts();
    }
  }, [user, showArchived]);

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
            <h2 className="text-heading-primary text-xl mb-2">Access Denied</h2>
            <p className="text-body-secondary mb-4">
              Only coaches and admins can manage workouts.
            </p>
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

  const handleArchiveToggle = async (
    workoutId: string,
    currentArchived: boolean
  ) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !currentArchived }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from current list (will be in opposite list now)
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        success(currentArchived ? "Workout restored" : "Workout archived");
      } else {
        showErrorToast(data.error || "Failed to update workout");
      }
    } catch (err) {
      console.error("Archive error:", err);
      showErrorToast("Failed to update workout");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced mobile-first header */}
      <div className="bg-gradient-primary text-white p-6 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Dumbbell className="w-10 h-10 sm:w-8 sm:h-8 mr-3" />
              <div>
                <h1 className="text-3xl sm:text-2xl font-bold">
                  Workout Management
                </h1>
                <p className="text-blue-100 text-base sm:text-sm mt-1">
                  Create and manage training plans
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg text-base sm:text-sm font-medium transition-all touch-manipulation ${
                  currentView === "workouts"
                    ? "bg-white text-accent-blue shadow-md"
                    : "bg-accent-blue text-white hover:bg-accent-blue/90"
                }`}
                onClick={() => setCurrentView("workouts")}
              >
                <Dumbbell className="w-5 h-5 sm:w-4 sm:h-4 inline mr-2" />
                Workouts
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg text-base sm:text-sm font-medium transition-all touch-manipulation ${
                  currentView === "library"
                    ? "bg-white text-accent-blue shadow-md"
                    : "bg-accent-blue text-white hover:bg-accent-blue/90"
                }`}
                onClick={() => setCurrentView("library")}
              >
                <Library className="w-5 h-5 sm:w-4 sm:h-4 inline mr-2" />
                Exercise Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced mobile-first content */}
      <div className="max-w-4xl mx-auto p-6 sm:p-4">
        {currentView === "workouts" ? (
          <>
            {/* Enhanced error state */}
            {error && (
              <Alert variant="error">
                <p className="font-medium">{error}</p>
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
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-heading-secondary text-xl">
                    {showArchived ? "Archived Workouts" : "Your Workouts"}
                  </h2>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCreatingWorkout(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Workout
                  </Button>
                </div>
                <Button
                  onClick={() => setShowArchived(!showArchived)}
                  variant="secondary"
                  className="w-full sm:w-auto self-start"
                  leftIcon={
                    showArchived ? (
                      <Dumbbell className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )
                  }
                >
                  {showArchived
                    ? "View Active Workouts"
                    : "View Archived Workouts"}
                </Button>
              </div>
            )}

            {/* Workouts Grid */}
            {!showWorkoutsSkeleton && (
              <AnimatedGrid columns={2} gap={4} delay={0.1} staggerDelay={0.05}>
                {workouts.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyWorkouts
                      onCreateWorkout={() => setCreatingWorkout(true)}
                    />
                  </div>
                ) : (
                  workouts.map((workout) => {
                    // Check if this is a temporary (optimistic) workout
                    const isOptimistic = workout.id.startsWith("temp-");
                    const isExpanded = expandedWorkout === workout.id;

                    return (
                      <Card
                        key={workout.id}
                        variant="default"
                        padding="md"
                        className={
                          isOptimistic ? "opacity-70 animate-pulse" : ""
                        }
                      >
                        {/* Header - Always visible, clickable to expand */}
                        <div
                          className="flex justify-between items-start mb-3 cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
                          onClick={() =>
                            setExpandedWorkout(isExpanded ? null : workout.id)
                          }
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-body-primary font-semibold">
                                {workout.name}
                                {isOptimistic && (
                                  <span className="ml-2 text-xs text-accent-blue font-normal">
                                    (Saving...)
                                  </span>
                                )}
                              </h3>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-silver-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-silver-600" />
                              )}
                            </div>
                            {workout.description && (
                              <p className="text-body-small text-silver-700 mt-1">
                                {workout.description}
                              </p>
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
                              <div className="text-xs font-semibold text-silver-600 uppercase mb-3">
                                Exercises ({workout.exercises.length})
                                {workout.groups &&
                                  workout.groups.length > 0 && (
                                    <span className="ml-2 text-accent-blue">
                                      • {workout.groups.length} group
                                      {workout.groups.length !== 1 ? "s" : ""}
                                    </span>
                                  )}
                              </div>
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
                                    <div
                                      key={exercise.id}
                                      className="text-body-small flex items-center gap-2"
                                    >
                                      <span>
                                        {index + 1}. {exercise.exerciseName} -{" "}
                                        {exercise.sets}×{exercise.reps} @{" "}
                                        {formatWeight(exercise)}
                                      </span>
                                      {group && (
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                            group.type === "superset"
                                              ? "bg-purple-100 text-purple-700"
                                              : group.type === "circuit"
                                                ? "bg-info-lighter text-accent-blue"
                                                : "bg-amber-100 text-amber-700"
                                          }`}
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
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              {workout.exercises.length > 3 && (
                                <div className="text-body-small text-silver-600">
                                  +{workout.exercises.length - 3} more exercises
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!showArchived && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingWorkout(workout);
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
                                  setSelectedWorkout(workout);
                                  setShowAssignForm(true);
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
                              handleArchiveToggle(
                                workout.id,
                                workout.archived || false
                              );
                            }}
                            className={`${showArchived ? "btn-primary flex-1" : "btn-secondary"} flex items-center justify-center gap-1`}
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
                                {showArchived && "Restore"}
                              </>
                            ) : (
                              <>
                                <Archive className="w-4 h-4" />
                              </>
                            )}
                          </button>
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
              onClose={() => setCurrentView("workouts")}
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
                  order: (newWorkout.exercises?.length || 0) + 1,
                };

                setNewWorkout({
                  ...newWorkout,
                  exercises: [...(newWorkout.exercises || []), workoutExercise],
                });
                setCurrentView("workouts");
              }}
            />
          </Suspense>
        )}

        {/* Assign Workout Modal - Choice between Group and Individual */}
        {showAssignForm && selectedWorkout && (
          <ModalBackdrop
            isOpen={showAssignForm}
            onClose={() => {
              setShowAssignForm(false);
              setSelectedWorkout(null);
            }}
          >
            <div className="bg-white rounded-lg max-w-md w-full">
              <ModalHeader
                title={`Assign Workout: ${selectedWorkout.name}`}
                subtitle="Choose how you'd like to assign this workout:"
                icon={<Users className="w-6 h-6" />}
                onClose={() => {
                  setShowAssignForm(false);
                  setSelectedWorkout(null);
                }}
              />
              <ModalContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowAssignForm(false);
                      handleOpenAssignModal(selectedWorkout, "group");
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
                      setShowAssignForm(false);
                      handleOpenAssignModal(selectedWorkout, "individual");
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
                    setShowAssignForm(false);
                    setSelectedWorkout(null);
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
        {showGroupAssignModal && selectedWorkout && (
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <div className="text-lg text-gray-700">Loading...</div>
                </div>
              </ModalBackdrop>
            }
          >
            <GroupAssignmentModal
              isOpen={showGroupAssignModal}
              onClose={() => {
                setShowGroupAssignModal(false);
                setSelectedWorkout(null);
              }}
              selectedDate={new Date()}
              groups={groups}
              workoutPlans={workouts}
              athletes={athletes}
              onAssignWorkout={handleAssignWorkout}
            />
          </Suspense>
        )}

        {/* Individual Assignment Modal */}
        {showIndividualAssignModal && selectedWorkout && (
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <div className="text-lg text-gray-700">Loading...</div>
                </div>
              </ModalBackdrop>
            }
          >
            <IndividualAssignmentModal
              isOpen={showIndividualAssignModal}
              onClose={() => {
                setShowIndividualAssignModal(false);
                setSelectedWorkout(null);
              }}
              athletes={athletes}
              workoutPlans={workouts}
              currentUserId={user?.id}
              onAssignWorkout={handleAssignWorkout}
            />
          </Suspense>
        )}
      </div>

      {/* Workout Editor Modal */}
      {(editingWorkout || creatingWorkout) && (
        <WorkoutEditorErrorBoundary
          workout={
            editingWorkout || {
              id: "new-workout",
              name: newWorkout.name || "",
              description: newWorkout.description || "",
              exercises: newWorkout.exercises || [],
              estimatedDuration: newWorkout.estimatedDuration || 30,
              createdBy: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          onRecover={(recoveredWorkout) => {
            // Recover workout from localStorage after error
            if (creatingWorkout) {
              setNewWorkout(recoveredWorkout);
            } else if (editingWorkout) {
              setEditingWorkout(recoveredWorkout as WorkoutPlan);
            }
          }}
        >
          <Suspense
            fallback={
              <ModalBackdrop isOpen={true} onClose={() => {}}>
                <div className="bg-white rounded-lg p-8">
                  <div className="text-lg text-gray-700">
                    Loading workout editor...
                  </div>
                </div>
              </ModalBackdrop>
            }
          >
            <WorkoutEditor
              workout={
                editingWorkout || {
                  id: "new-workout",
                  name: newWorkout.name || "",
                  description: newWorkout.description || "",
                  exercises: newWorkout.exercises || [],
                  groups: newWorkout.groups || [],
                  blockInstances: newWorkout.blockInstances || [],
                  estimatedDuration: newWorkout.estimatedDuration || 30,
                  createdBy: user.id,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
              }
              onChange={async (updatedWorkout) => {
                // For creating new workouts
                if (creatingWorkout) {
                  // Check if this is an explicit save request (user clicked "Save Workout" button)
                  const workoutWithFlag = updatedWorkout as WorkoutPlan & {
                    _shouldSave?: boolean;
                  };
                  const shouldSave = workoutWithFlag._shouldSave;

                  // ALWAYS update local state first (for UI reactivity)
                  setNewWorkout(updatedWorkout);

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
                  setWorkouts([...workouts, optimisticWorkout]);

                  // Close modal immediately for instant UX
                  setCreatingWorkout(false);
                  setNewWorkout({
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
                        setWorkouts((prevWorkouts) =>
                          prevWorkouts.map((w) =>
                            w.id === tempId ? createdWorkout : w
                          )
                        );
                        success("Workout saved successfully!");
                      } else {
                        // Rollback: Remove temporary workout
                        setWorkouts((prevWorkouts) =>
                          prevWorkouts.filter((w) => w.id !== tempId)
                        );
                        showErrorToast("Failed to create workout");
                      }
                    } else {
                      // Rollback: Remove temporary workout
                      setWorkouts((prevWorkouts) =>
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
                    setWorkouts((prevWorkouts) =>
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
                  setEditingWorkout(updatedWorkout as WorkoutPlan);
                  const updatedWorkouts = workouts.map((w) =>
                    w.id === updatedWorkout.id ? updatedWorkout : w
                  );
                  setWorkouts(updatedWorkouts);

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
                      setEditingWorkout(null);
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
                setEditingWorkout(null);
                setCreatingWorkout(false);
                setNewWorkout({
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
