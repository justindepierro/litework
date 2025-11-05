"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useRequireCoach } from "@/hooks/use-auth-guard";
import { useToast } from "@/components/ToastProvider";
import { WorkoutPlan, WorkoutExercise } from "@/types";
import { Dumbbell, Plus, Library, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/lib/api-response";

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
  const [currentView, setCurrentView] = useState<"workouts" | "library">(
    "workouts"
  );
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    name: "",
    description: "",
    exercises: [],
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
                  workouts.map((workout) => (
                    <div key={workout.id} className="card-primary">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-body-primary font-semibold">
                            {workout.name}
                          </h3>
                          <p className="text-body-small text-gray-600">
                            {workout.description}
                          </p>
                        </div>
                        <span className="text-body-small bg-gray-100 px-2 py-1 rounded">
                          {workout.estimatedDuration}min
                        </span>
                      </div>

                      <div className="space-y-1 mb-4">
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
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingWorkout(workout)}
                          className="btn-secondary flex-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWorkout(workout);
                            setShowAssignForm(true);
                          }}
                          className="btn-primary flex-1"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))
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
                estimatedDuration: newWorkout.estimatedDuration || 30,
                createdBy: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            }
            onChange={async (updatedWorkout) => {
              console.log("[WORKOUT SAVE DEBUG] onChange called", {
                creatingWorkout,
                updatedWorkout,
              });

              // For creating new workouts, save to API immediately
              if (creatingWorkout) {
                // Check if workout has required fields
                if (
                  !updatedWorkout.name ||
                  !updatedWorkout.exercises ||
                  updatedWorkout.exercises.length === 0
                ) {
                  console.log(
                    "[WORKOUT SAVE DEBUG] Missing required fields, updating local state only"
                  );
                  setNewWorkout(updatedWorkout);
                  return;
                }

                try {
                  console.log("[WORKOUT SAVE DEBUG] Calling API with:", {
                    name: updatedWorkout.name,
                    description: updatedWorkout.description,
                    exerciseCount: updatedWorkout.exercises.length,
                    estimatedDuration: updatedWorkout.estimatedDuration || 30,
                  });

                  const response = (await apiClient.createWorkout({
                    name: updatedWorkout.name,
                    description: updatedWorkout.description,
                    exercises: updatedWorkout.exercises,
                    estimatedDuration: updatedWorkout.estimatedDuration || 30,
                  })) as ApiResponse;

                  console.log("[WORKOUT SAVE DEBUG] API response:", response);

                  if (response.success && response.data) {
                    const apiResponse = response.data as {
                      workout?: WorkoutPlan;
                    };
                    const createdWorkout = apiResponse.workout;
                    if (createdWorkout) {
                      console.log(
                        "[WORKOUT SAVE DEBUG] Workout created successfully:",
                        createdWorkout
                      );
                      setWorkouts([...workouts, createdWorkout]);
                      success("Workout saved successfully!");

                      // Reset state and close modal
                      setCreatingWorkout(false);
                      setNewWorkout({
                        name: "",
                        description: "",
                        exercises: [],
                        estimatedDuration: 30,
                      });
                    } else {
                      console.error(
                        "[WORKOUT SAVE DEBUG] No workout in response"
                      );
                      showErrorToast("Failed to create workout");
                    }
                  } else {
                    const errorMsg =
                      typeof response.error === "string"
                        ? response.error
                        : "Failed to create workout";
                    console.error("[WORKOUT SAVE DEBUG] Save failed:", errorMsg);
                    showErrorToast(errorMsg);
                  }
                } catch (err) {
                  console.error("[WORKOUT SAVE DEBUG] Exception:", err);
                  showErrorToast("Failed to create workout");
                }
              } else {
                // For editing existing workouts, update local state
                const updatedWorkouts = workouts.map((w) =>
                  w.id === updatedWorkout.id ? updatedWorkout : w
                );
                setWorkouts(updatedWorkouts);
              }
            }}
            onClose={() => {
              console.log("[WORKOUT SAVE DEBUG] onClose called - just closing modal");
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
      )}
    </div>
  );
}
