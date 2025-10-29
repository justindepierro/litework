// Shared types for the workout tracking application

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "coach" | "member";
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  targetMuscleGroups: string[];
  instructions?: string[];
  createdAt: Date;
}

// Enhanced workout system for View/Live modes
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weightType: "percentage" | "fixed" | "bodyweight";
  weight?: number; // For fixed weight
  percentage?: number; // For percentage-based (e.g., 75% of 1RM)
  restTime?: number; // Rest time in seconds
  notes?: string;
  order: number; // Order in the workout
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // In minutes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Live mode tracking
export interface SetRecord {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeight: number;
  actualWeight: number;
  completed: boolean;
  restTimeUsed?: number;
  notes?: string;
  completedAt?: Date;
}

export interface ExerciseSession {
  id: string;
  workoutExerciseId: string;
  exerciseName: string;
  targetSets: number;
  completedSets: number;
  setRecords: SetRecord[];
  started: boolean;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  workoutPlanName: string;
  date: Date;
  mode: "view" | "live";
  exercises: ExerciseSession[];
  started: boolean;
  completed: boolean;
  totalDuration?: number; // In minutes
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  progressPercentage: number; // 0-100
}

// Assignment system
export interface WorkoutAssignment {
  id: string;
  workoutPlanId: string;
  userId: string;
  assignedBy: string;
  assignedDate: Date;
  scheduledDate: Date;
  dueDate?: Date;
  status: "assigned" | "started" | "completed" | "overdue";
  workoutSessionId?: string;
  notes?: string;
}

// Legacy types (keeping for backward compatibility)
export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  restTime?: number;
  notes?: string;
}

export interface Schedule {
  id: string;
  userId: string;
  workoutPlanId: string;
  date: Date;
  completed: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  exerciseId: string;
  date: Date;
  weight: number;
  reps: number;
  oneRepMax?: number;
}
