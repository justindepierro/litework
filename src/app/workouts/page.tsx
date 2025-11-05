"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRequireCoach } from "@/hooks/use-auth-guard";
import { useToast } from "@/components/ToastProvider";
import { WorkoutPlan, WorkoutExercise } from "@/types";
import { Dumbbell, Plus, Library, XCircle, ChevronDown, ChevronUp, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";
import {
  validateWorkout,
  canSaveWorkout,
  formatValidationErrors,
} from "@/lib/workout-validation";
import { WorkoutEditorErrorBoundary } from "@/components/WorkoutEditorErrorBoundary";

// Dynamic imports for large components
const ExerciseLibrary = lazy(() => import("@/components/ExerciseLibrary"));
const WorkoutEditor = lazy(() => import("@/components/WorkoutEditor"));

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
  const [error, setError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(
    null
  );
  const [creatingWorkout, setCreatingWorkout] = useState<boolean>(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
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

  // Load workouts from API
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await apiClient.getWorkouts()) as ApiResponse;

        if (response.success && response.data) {
          const apiResponse = response.data as { workouts?: WorkoutPlan[] };
          setWorkouts(apiResponse.workouts || []);
        } else {
          setError(
            typeof response.error === "string"
              ? response.error
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
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "coach")) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="card-primary text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-heading-primary text-xl mb-2">Access Denied</h2>
            <p className="text-body-secondary mb-4">
              Only coaches and admins can manage workouts.
            </p>
          </div>
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
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
                onClick={() => setCurrentView("workouts")}
              >
                <Dumbbell className="w-5 h-5 sm:w-4 sm:h-4 inline mr-2" />
                Workouts
              </button>
              <button
                className={`flex-1 sm:flex-none px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg text-base sm:text-sm font-medium transition-all touch-manipulation ${
                  currentView === "library"
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-blue-600 text-white hover:bg-blue-500"
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
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Enhanced loading state */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">
                  Loading workouts...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!loading && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-heading-secondary text-xl">
                  Your Workouts
                </h2>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setCreatingWorkout(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> Create Workout
                </button>
              </div>
            )}

            {/* Workouts Grid */}
            {!loading && (
              <div className="grid gap-4 md:grid-cols-2">
                {workouts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex justify-center mb-4">
                      <Dumbbell className="w-16 h-16 text-accent-blue" />
                    </div>
                    <h3 className="text-heading-secondary text-lg mb-2">
                      No workouts yet
                    </h3>
                    <p className="text-body-secondary mb-4">
                      Create your first workout to get started.
                    </p>
                    <button
                      className="btn-primary"
                      onClick={() => setCreatingWorkout(true)}
                    >
                      <Plus className="w-4 h-4" /> Create Your First Workout
                    </button>
                  </div>
                ) : (
                  workouts.map((workout) => {
                    // Check if this is a temporary (optimistic) workout
                    const isOptimistic = workout.id.startsWith("temp-");
                    const isExpanded = expandedWorkout === workout.id;
                    
                    return (
                      <div
                        key={workout.id}
                        className={`card-primary ${
                          isOptimistic ? "opacity-70 animate-pulse" : ""
                        }`}
                      >
                        {/* Header - Always visible, clickable to expand */}
                        <div 
                          className="flex justify-between items-start mb-3 cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg transition-colors"
                          onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-body-primary font-semibold">
                                {workout.name}
                                {isOptimistic && (
                                  <span className="ml-2 text-xs text-blue-600 font-normal">
                                    (Saving...)
                                  </span>
                                )}
                              </h3>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            {workout.description && (
                              <p className="text-body-small text-gray-600 mt-1">
                                {workout.description}
                              </p>
                            )}
                          </div>
                          <span className="text-body-small bg-gray-100 px-2 py-1 rounded ml-4">
                            {workout.estimatedDuration}min
                          </span>
                        </div>

                        {/* Exercise Preview or Full List */}
                        <div className="space-y-1 mb-4">
                          {isExpanded ? (
                            // Expanded view - show all exercises with full details
                            <>
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                Exercises ({workout.exercises.length})
                              </div>
                              {workout.exercises.map((exercise, index) => (
                                <div key={exercise.id} className="border-l-2 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
                                  <div className="font-medium text-body-small">
                                    {index + 1}. {exercise.exerciseName}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                                    <div>Sets: {exercise.sets} × Reps: {exercise.reps}</div>
                                    <div>Weight: {formatWeight(exercise)}</div>
                                    {exercise.restTime && (
                                      <div>Rest: {exercise.restTime}s</div>
                                    )}
                                    {exercise.tempo && (
                                      <div>Tempo: {exercise.tempo}</div>
                                    )}
                                    {exercise.notes && (
                                      <div className="italic">Note: {exercise.notes}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            // Collapsed view - show first 3 exercises
                            <>
                              {workout.exercises
                                .slice(0, 3)
                                .map((exercise, index) => (
                                  <div key={exercise.id} className="text-body-small">
                                    {index + 1}. {exercise.exerciseName} -{" "}
                                    {exercise.sets}×{exercise.reps} @{" "}
                                    {formatWeight(exercise)}
                                  </div>
                                ))}
                              {workout.exercises.length > 3 && (
                                <div className="text-body-small text-gray-500">
                                  +{workout.exercises.length - 3} more exercises
                                </div>
                              )}
                            </>
                          )}
                        </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkout(workout);
                          }}
                          className="btn-secondary flex-1"
                          disabled={isOptimistic}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkout(workout);
                            setShowAssignForm(true);
                          }}
                          className="btn-primary flex-1 flex items-center justify-center gap-1"
                          disabled={isOptimistic}
                        >
                          <Users className="w-4 h-4" />
                          Assign
                        </button>
                      </div>
                    </div>
                  );
                })
                )}
              </div>
            )}
          </>
        ) : (
          /* Exercise Library View */
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">
                  Loading exercise library...
                </div>
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

        {/* Assign Workout Modal */}
        {showAssignForm && selectedWorkout && (
          <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-heading-primary text-xl mb-4">
                  Assign Workout: {selectedWorkout.name}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-body-primary text-sm font-medium block mb-2">
                      Schedule Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-silver-400 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-body-primary text-sm font-medium block mb-2">
                      Select Athletes
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      <div className="text-body-secondary text-sm p-4 text-center">
                        Athlete selection will be implemented with user
                        management API
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAssignForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowAssignForm(false)}
                    className="btn-primary flex-1"
                  >
                    Assign Workout
                  </button>
                </div>
              </div>
            </div>
          </div>
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
              <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8">
                  <div className="text-lg text-gray-600">
                    Loading workout editor...
                  </div>
                </div>
              </div>
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
              console.log("[page.tsx] onChange ENTRY:", {
                creatingWorkout,
                editingWorkout: !!editingWorkout,
                updatedWorkoutName: updatedWorkout.name
              });
              
              // For creating new workouts
              if (creatingWorkout) {
                // Check if this is an explicit save request (user clicked "Save Workout" button)
                const workoutWithFlag = updatedWorkout as WorkoutPlan & { _shouldSave?: boolean };
                const shouldSave = workoutWithFlag._shouldSave;
                
                console.log("[page.tsx] onChange called:", { 
                  shouldSave, 
                  name: updatedWorkout.name,
                  exerciseCount: updatedWorkout.exercises?.length,
                  firstExercise: updatedWorkout.exercises?.[0]?.exerciseName
                });
                
                // ALWAYS update local state first (for UI reactivity)
                setNewWorkout(updatedWorkout);
                
                if (!shouldSave) {
                  // Just editing - update state only, don't save to API yet
                  console.log("[page.tsx] State updated, not saving to API yet");
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
                  console.warn("Workout validation warnings:", validationResult.warnings);
                }

                // Block save if there are critical errors
                if (!validationResult.isValid) {
                  const errorMessage = formatValidationErrors(validationResult);
                  showErrorToast("Please fix validation errors before saving");
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
                console.log("[page.tsx] EDITING existing workout");
                
                // Check if this is an explicit save request
                const workoutWithFlag = updatedWorkout as WorkoutPlan & { _shouldSave?: boolean };
                const shouldSave = workoutWithFlag._shouldSave;
                
                // ALWAYS update local state first
                setEditingWorkout(updatedWorkout as WorkoutPlan);
                const updatedWorkouts = workouts.map((w) =>
                  w.id === updatedWorkout.id ? updatedWorkout : w
                );
                setWorkouts(updatedWorkouts);
                
                if (!shouldSave) {
                  console.log("[page.tsx] Editing - state updated, not saving yet");
                  return;
                }
                
                // Remove the flag
                delete workoutWithFlag._shouldSave;
                
                console.log("[page.tsx] Saving edited workout to API");
                
                try {
                  const response = await apiClient.updateWorkout(updatedWorkout.id!, {
                    name: updatedWorkout.name,
                    description: updatedWorkout.description,
                    exercises: updatedWorkout.exercises,
                    groups: updatedWorkout.groups,
                    blockInstances: updatedWorkout.blockInstances,
                    estimatedDuration: updatedWorkout.estimatedDuration || 30,
                  }) as ApiResponse;

                  if (response.success && response.data) {
                    setEditingWorkout(null);
                    success("Workout updated successfully!");
                  } else {
                    const errorMsg =
                      typeof response.error === "string"
                        ? response.error
                        : "Failed to update workout";
                    showErrorToast(errorMsg);
                  }
                } catch (err) {
                  console.error("Error updating workout:", err);
                  showErrorToast("Failed to update workout");
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
