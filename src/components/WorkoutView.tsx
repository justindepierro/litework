"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, WorkoutPlan } from "@/types";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import {
  Dumbbell,
  Calendar,
  Clock,
  Target,
  Weight,
  Check,
  Rocket,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface WorkoutViewProps {
  sessionId: string;
}

function WorkoutView({ sessionId }: WorkoutViewProps) {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workout session from API
  useEffect(() => {
    const loadWorkoutSession = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implement actual API call to fetch workout session
        // const response = await apiClient.getWorkoutSession(sessionId);
        // if (response.success && response.data) {
        //   setWorkout(response.data.workout);
        //   setWorkoutPlan(response.data.workoutPlan);
        // } else {
        //   setError(response.error || "Failed to load workout");
        // }

        // For now, just set null until API is implemented
        setWorkout(null);
        setWorkoutPlan(null);
        setError("No workout session found. Please check back later.");
      } catch (err) {
        setError("Failed to load workout session");
        console.error("Error loading workout session:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && user) {
      loadWorkoutSession();
    }
  }, [sessionId, user]);

  const formatWeight = (exercise: {
    weightType: string;
    percentage?: number;
    weight?: number;
  }) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage")
      return `${exercise.percentage}% of 1RM`;
    return `${exercise.weight} lbs`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-heading-primary">
          Please log in to view your workout.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="md" message="Loading workout..." />
      </div>
    );
  }

  if (error || !workout || !workoutPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Workout Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "The requested workout session could not be found."}
          </p>
          <Link href="/dashboard">
            <Button variant="primary" className="px-6 py-3 rounded-xl">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Mobile-optimized header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-heading-primary text-3xl sm:text-2xl flex items-center justify-center sm:justify-start gap-3 mb-3 font-bold">
                <Dumbbell className="w-8 h-8 sm:w-7 sm:h-7 text-accent-orange" />
                {workoutPlan.name}
              </h1>
              <p className="text-body-secondary text-lg sm:text-base leading-relaxed mb-4">
                {workoutPlan.description}
              </p>

              {/* Enhanced mobile workout info */}
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-body-small">
                  <Calendar className="w-5 h-5 text-accent-blue" />
                  <span className="font-medium">
                    {workout.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-body-small">
                  <Clock className="w-5 h-5 text-accent-green" />
                  <span className="font-medium">
                    ~{workoutPlan.estimatedDuration} min
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-body-small">
                  <Target className="w-5 h-5 text-accent-purple" />
                  <span className="font-medium">
                    {workoutPlan.exercises.length} exercises
                  </span>
                </div>
              </div>
            </div>

            {/* Large mobile-friendly start button */}
            <Link href={`/workouts/live/${sessionId}`}>
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Rocket className="w-6 h-6" />}
                className="sm:w-auto text-xl px-8 py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl"
              >
                Start Live Workout
              </Button>
            </Link>
          </div>

          {/* Enhanced mobile progress overview */}
          <Card
            variant="hero"
            padding="lg"
            className="mb-8 rounded-2xl border-2 border-gray-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-heading-secondary text-xl font-bold">
                Progress Overview
              </h2>
              <span className="text-body-small px-4 py-2 bg-accent-green bg-opacity-10 text-accent-green rounded-xl font-bold border border-accent-green">
                {workout.progressPercentage}% Complete
              </span>
            </div>

            {/* Enhanced progress bar */}
            <div className="w-full bg-silver-300 rounded-full h-4 mb-6 shadow-inner">
              <div
                className="bg-linear-to-r from-accent-green to-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${workout.progressPercentage}%` }}
              ></div>
            </div>

            {/* Mobile-optimized stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-heading-primary text-2xl sm:text-xl font-bold text-green-800">
                  {workout.exercises.filter((e) => e.completed).length}
                </div>
                <div className="text-body-small font-medium text-green-600 mt-1">
                  Completed
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-heading-primary text-2xl sm:text-xl font-bold text-blue-800">
                  {workout.exercises.length}
                </div>
                <div className="text-body-small font-medium text-blue-600 mt-1">
                  Total Exercises
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="text-heading-primary text-2xl sm:text-xl font-bold text-purple-800">
                  {workout.exercises.reduce(
                    (acc, e) => acc + e.completedSets,
                    0
                  )}
                </div>
                <div className="text-body-small font-medium text-purple-600 mt-1">
                  Sets Done
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-heading-primary text-2xl sm:text-xl font-bold text-orange-800">
                  {workout.exercises.reduce((acc, e) => acc + e.targetSets, 0)}
                </div>
                <div className="text-body-small font-medium text-orange-600 mt-1">
                  Total Sets
                </div>
              </div>
            </div>
          </Card>

          {/* Mobile-optimized exercise list */}
          <div className="space-y-6">
            <h2 className="text-heading-secondary text-2xl sm:text-xl font-bold text-center sm:text-left">
              Workout Exercises
            </h2>

            {workoutPlan.exercises.map((exercise, index) => {
              const sessionExercise = workout.exercises.find(
                (e) => e.workoutExerciseId === exercise.id
              );
              const isCompleted = sessionExercise?.completed || false;

              return (
                <Card
                  key={exercise.id}
                  variant="interactive"
                  padding="md"
                  className={`rounded-2xl border-2 transition-all touch-manipulation ${
                    isCompleted
                      ? "border-accent-green bg-green-50 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Enhanced exercise header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-start gap-4 w-full sm:w-auto">
                      <div
                        className={`w-12 h-12 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-base font-bold shadow-md ${
                          isCompleted
                            ? "bg-accent-green text-white"
                            : "bg-linear-to-br from-gray-200 to-gray-300 text-navy-700"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 sm:w-5 sm:h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-heading-secondary text-xl sm:text-lg font-bold mb-2">
                          {exercise.exerciseName}
                        </h3>

                        {/* Mobile-friendly exercise details */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-body-small bg-blue-50 rounded-lg px-3 py-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                              {exercise.sets} sets × {exercise.reps} reps
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-body-small bg-orange-50 rounded-lg px-3 py-2">
                            <Weight className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">
                              {formatWeight(exercise)}
                            </span>
                          </div>
                          {exercise.restTime && (
                            <div className="flex items-center gap-2 text-body-small bg-green-50 rounded-lg px-3 py-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="font-medium">
                                {formatTime(exercise.restTime)} rest
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-200 rounded-xl text-accent-green font-bold">
                        <Check className="w-5 h-5" />
                        <span>Complete</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced set breakdown for mobile */}
                  <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: exercise.sets }, (_, setIndex) => {
                      const setRecord = sessionExercise?.setRecords.find(
                        (r) => r.setNumber === setIndex + 1
                      );
                      const isSetComplete = setRecord?.completed || false;

                      return (
                        <div
                          key={setIndex}
                          className={`p-4 rounded-xl border-2 transition-all touch-manipulation ${
                            isSetComplete
                              ? "border-accent-green bg-green-50 shadow-md"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-body-primary font-bold">
                              Set {setIndex + 1}
                            </span>
                            {isSetComplete && (
                              <Check className="w-4 h-4 text-accent-green" />
                            )}
                          </div>
                          <div className="text-body-small text-sm mb-1">
                            <strong>Target:</strong> {exercise.reps} reps @{" "}
                            {formatWeight(exercise)}
                          </div>
                          {setRecord && (
                            <div className="text-body-small text-sm font-medium text-accent-green">
                              <strong>Actual:</strong> {setRecord.actualReps}{" "}
                              reps @ {setRecord.actualWeight} lbs
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Exercise notes with better mobile formatting */}
                  {exercise.notes && (
                    <Alert variant="info" title="Exercise Notes">
                      {exercise.notes}
                    </Alert>
                  )}

                  {/* YouTube Demo Video */}
                  {"videoUrl" in exercise && exercise.videoUrl && (
                    <div className="mt-6">
                      <YouTubeEmbed url={exercise.videoUrl as string} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Enhanced mobile action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
            <Link href="/dashboard">
              <Button
                variant="secondary"
                className="py-4 px-6 rounded-xl font-medium order-2 sm:order-1"
              >
                ← Back to Dashboard
              </Button>
            </Link>
            <Link href={`/workouts/live/${sessionId}`}>
              <Button
                variant="primary"
                leftIcon={<Rocket className="w-6 h-6" />}
                className="text-xl px-8 py-5 rounded-2xl font-bold shadow-lg hover:shadow-xl order-1 sm:order-2"
              >
                Start Live Workout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(WorkoutView);
