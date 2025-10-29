"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { WorkoutPlan, WorkoutExercise } from "@/types";

// Mock data for demonstration
const sampleWorkouts: WorkoutPlan[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    description: "Focus on bench press, shoulders, and triceps",
    exercises: [
      {
        id: "1",
        exerciseId: "bench-press",
        exerciseName: "Bench Press",
        sets: 3,
        reps: 10,
        weightType: "percentage",
        percentage: 75,
        restTime: 180,
        order: 1,
      },
      {
        id: "2", 
        exerciseId: "shoulder-shrug",
        exerciseName: "Shoulder Shrug",
        sets: 3,
        reps: 10,
        weightType: "fixed",
        weight: 135,
        restTime: 120,
        order: 2,
      },
      {
        id: "3",
        exerciseId: "tricep-extension",
        exerciseName: "Tricep Extension",
        sets: 3,
        reps: 8,
        weightType: "fixed",
        weight: 25,
        restTime: 90,
        order: 3,
      },
      {
        id: "4",
        exerciseId: "jump-squats",
        exerciseName: "Jump Squats",
        sets: 1,
        reps: 10,
        weightType: "bodyweight",
        restTime: 60,
        order: 4,
      },
    ],
    estimatedDuration: 45,
    createdBy: "coach1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockUsers = [
  { id: "1", name: "John Smith", role: "member" },
  { id: "2", name: "Sarah Wilson", role: "member" },
  { id: "3", name: "Mike Johnson", role: "member" },
];

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>(sampleWorkouts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    name: "",
    description: "",
    exercises: [],
    estimatedDuration: 30,
  });
  const [newExercise, setNewExercise] = useState<Partial<WorkoutExercise>>({
    exerciseName: "",
    sets: 3,
    reps: 10,
    weightType: "fixed",
    weight: 0,
    percentage: 75,
    restTime: 120,
  });

  if (!user || (user.role !== "admin" && user.role !== "coach")) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="card-primary text-center">
            <h2 className="text-heading-primary text-xl mb-4">
              Access Restricted
            </h2>
            <p className="text-body-secondary">
              Only coaches and admins can manage workouts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const addExercise = () => {
    if (!newExercise.exerciseName) return;

    const exercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: newExercise.exerciseName.toLowerCase().replace(/\s+/g, '-'),
      exerciseName: newExercise.exerciseName,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || 10,
      weightType: newExercise.weightType || "fixed",
      weight: newExercise.weight,
      percentage: newExercise.percentage,
      restTime: newExercise.restTime || 120,
      order: (newWorkout.exercises?.length || 0) + 1,
    };

    setNewWorkout({
      ...newWorkout,
      exercises: [...(newWorkout.exercises || []), exercise],
    });

    setNewExercise({
      exerciseName: "",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 0,
      percentage: 75,
      restTime: 120,
    });
  };

  const createWorkout = () => {
    if (!newWorkout.name || !newWorkout.exercises?.length) return;

    const workout: WorkoutPlan = {
      id: Date.now().toString(),
      name: newWorkout.name,
      description: newWorkout.description || "",
      exercises: newWorkout.exercises,
      estimatedDuration: newWorkout.estimatedDuration || 30,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkouts([...workouts, workout]);
    setNewWorkout({ name: "", description: "", exercises: [], estimatedDuration: 30 });
    setShowCreateForm(false);
  };

  const formatWeight = (exercise: WorkoutExercise) => {
    if (exercise.weightType === "bodyweight") return "Bodyweight";
    if (exercise.weightType === "percentage") return `${exercise.percentage}%`;
    return `${exercise.weight} lbs`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive section-spacing">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-heading-primary text-2xl sm:text-3xl">
                💪 Workout Management
              </h1>
              <p className="text-body-secondary mt-1">
                Create and assign workouts for your athletes
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <span className="workout-accent-strength">➕</span> Create Workout
            </button>
          </div>

          {/* Workouts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <div key={workout.id} className="card-primary">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-heading-secondary text-lg">
                    {workout.name}
                  </h3>
                  <span className="text-body-small px-2 py-1 bg-silver-200 rounded">
                    {workout.estimatedDuration}min
                  </span>
                </div>
                
                {workout.description && (
                  <p className="text-body-secondary mb-4 text-sm">
                    {workout.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-silver-100 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-body-primary font-medium text-sm">
                          {exercise.exerciseName}
                        </span>
                        <span className="text-body-small text-xs">
                          {exercise.sets}×{exercise.reps}
                        </span>
                      </div>
                      <div className="text-body-small text-xs mt-1">
                        {formatWeight(exercise)}
                        {exercise.restTime && ` • ${exercise.restTime}s rest`}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedWorkout(workout);
                      setShowAssignForm(true);
                    }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Assign
                  </button>
                  <button className="btn-primary flex-1 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create Workout Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-heading-primary text-xl mb-4">
                    Create New Workout
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-body-primary text-sm font-medium block mb-1">
                        Workout Name
                      </label>
                      <input
                        type="text"
                        value={newWorkout.name || ""}
                        onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                        className="w-full p-3 border border-silver-400 rounded-md"
                        placeholder="e.g., Upper Body Strength"
                      />
                    </div>

                    <div>
                      <label className="text-body-primary text-sm font-medium block mb-1">
                        Description
                      </label>
                      <textarea
                        value={newWorkout.description || ""}
                        onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                        className="w-full p-3 border border-silver-400 rounded-md"
                        placeholder="Brief description of the workout"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-body-primary text-sm font-medium block mb-1">
                        Estimated Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={newWorkout.estimatedDuration || 30}
                        onChange={(e) => setNewWorkout({...newWorkout, estimatedDuration: parseInt(e.target.value)})}
                        className="w-full p-3 border border-silver-400 rounded-md"
                        min="15"
                        max="180"
                      />
                    </div>
                  </div>

                  {/* Add Exercise Section */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="text-heading-secondary text-lg mb-3">Add Exercise</h3>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-body-primary text-sm font-medium block mb-1">
                          Exercise Name
                        </label>
                        <input
                          type="text"
                          value={newExercise.exerciseName || ""}
                          onChange={(e) => setNewExercise({...newExercise, exerciseName: e.target.value})}
                          className="w-full p-2 border border-silver-400 rounded-md text-sm"
                          placeholder="e.g., Bench Press"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-body-primary text-sm font-medium block mb-1">Sets</label>
                          <input
                            type="number"
                            value={newExercise.sets || 3}
                            onChange={(e) => setNewExercise({...newExercise, sets: parseInt(e.target.value)})}
                            className="w-full p-2 border border-silver-400 rounded-md text-sm"
                            min="1"
                            max="10"
                          />
                        </div>
                        <div>
                          <label className="text-body-primary text-sm font-medium block mb-1">Reps</label>
                          <input
                            type="number"
                            value={newExercise.reps || 10}
                            onChange={(e) => setNewExercise({...newExercise, reps: parseInt(e.target.value)})}
                            className="w-full p-2 border border-silver-400 rounded-md text-sm"
                            min="1"
                            max="50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-body-primary text-sm font-medium block mb-1">Weight Type</label>
                        <select
                          value={newExercise.weightType || "fixed"}
                          onChange={(e) => setNewExercise({...newExercise, weightType: e.target.value as "percentage" | "fixed" | "bodyweight"})}
                          className="w-full p-2 border border-silver-400 rounded-md text-sm"
                        >
                          <option value="fixed">Fixed Weight</option>
                          <option value="percentage">Percentage of 1RM</option>
                          <option value="bodyweight">Bodyweight</option>
                        </select>
                      </div>

                      {newExercise.weightType === "fixed" && (
                        <div>
                          <label className="text-body-primary text-sm font-medium block mb-1">Weight (lbs)</label>
                          <input
                            type="number"
                            value={newExercise.weight || 0}
                            onChange={(e) => setNewExercise({...newExercise, weight: parseInt(e.target.value)})}
                            className="w-full p-2 border border-silver-400 rounded-md text-sm"
                            min="0"
                          />
                        </div>
                      )}

                      {newExercise.weightType === "percentage" && (
                        <div>
                          <label className="text-body-primary text-sm font-medium block mb-1">Percentage of 1RM</label>
                          <input
                            type="number"
                            value={newExercise.percentage || 75}
                            onChange={(e) => setNewExercise({...newExercise, percentage: parseInt(e.target.value)})}
                            className="w-full p-2 border border-silver-400 rounded-md text-sm"
                            min="30"
                            max="100"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-body-primary text-sm font-medium block mb-1">Rest Time (seconds)</label>
                        <input
                          type="number"
                          value={newExercise.restTime || 120}
                          onChange={(e) => setNewExercise({...newExercise, restTime: parseInt(e.target.value)})}
                          className="w-full p-2 border border-silver-400 rounded-md text-sm"
                          min="30"
                          max="600"
                        />
                      </div>
                    </div>

                    <button
                      onClick={addExercise}
                      className="btn-secondary mt-3"
                      disabled={!newExercise.exerciseName}
                    >
                      Add Exercise
                    </button>
                  </div>

                  {/* Exercise List */}
                  {newWorkout.exercises && newWorkout.exercises.length > 0 && (
                    <div className="border-t pt-4 mb-6">
                      <h3 className="text-heading-secondary text-lg mb-3">Workout Exercises</h3>
                      <div className="space-y-2">
                        {newWorkout.exercises.map((exercise, index) => (
                          <div key={exercise.id} className="bg-silver-100 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-body-primary font-medium">
                                {index + 1}. {exercise.exerciseName}
                              </span>
                              <button
                                onClick={() => {
                                  const filtered = newWorkout.exercises?.filter(e => e.id !== exercise.id) || [];
                                  setNewWorkout({...newWorkout, exercises: filtered});
                                }}
                                className="text-accent-red hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="text-body-small mt-1">
                              {exercise.sets} sets × {exercise.reps} reps • {formatWeight(exercise)}
                              {exercise.restTime && ` • ${exercise.restTime}s rest`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createWorkout}
                      className="btn-primary flex-1"
                      disabled={!newWorkout.name || !newWorkout.exercises?.length}
                    >
                      Create Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assign Workout Modal */}
          {showAssignForm && selectedWorkout && (
            <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <h2 className="text-heading-primary text-xl mb-4">
                    Assign Workout: {selectedWorkout.name}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-body-primary text-sm font-medium block mb-2">
                        Select Athletes
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {mockUsers.filter(u => u.role === "member").map((member) => (
                          <label key={member.id} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-body-primary text-sm">{member.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-body-primary text-sm font-medium block mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-silver-400 rounded-md"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAssignForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button className="btn-primary flex-1">
                      Assign Workout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
