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

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  restTime?: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId?: string;
  date: Date;
  sets: WorkoutSet[];
  duration?: number;
  notes?: string;
  completed: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    restTime?: number;
  }[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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
