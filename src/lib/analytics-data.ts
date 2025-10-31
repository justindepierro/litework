// Mock progress and analytics data
import { ProgressEntry } from "@/types";

// Generate mock progress data for different exercises and athletes
export const generateMockProgressData = (): ProgressEntry[] => {
  // Return empty array - real data will come from the database
  return [];
};

// Helper functions for analytics calculations

// Analytics data types
export interface WorkoutFrequency {
  week: string;
  workouts: number;
  goal: number;
}

export interface StrengthProgress {
  exercise: string;
  currentMax: number;
  previousMax: number;
  improvement: number;
}

export interface GroupPerformance {
  groupName: string;
  averageImprovement: number;
  totalWorkouts: number;
  consistencyScore: number;
}

export interface AthleteRanking {
  athleteId: string;
  athleteName: string;
  totalScore: number;
  strengthScore: number;
  consistencyScore: number;
  improvementScore: number;
}

// Generate mock analytics data
export const generateMockAnalytics = () => {
  // Return empty data - real analytics will come from the database
  return {
    workoutFrequency: [],
    strengthProgress: [],
    groupPerformance: [],
    athleteRankings: [],
  };
};

// Helper functions for analytics calculations
export const calculateOneRepMax = (weight: number, reps: number): number => {
  // Epley formula: 1RM = weight * (1 + reps/30)
  return Math.round(weight * (1 + reps / 30));
};

export const calculateVolumeLoad = (
  sets: number,
  reps: number,
  weight: number
): number => {
  return sets * reps * weight;
};

export const calculateIntensity = (
  workingWeight: number,
  oneRepMax: number
): number => {
  return Math.round((workingWeight / oneRepMax) * 100);
};

export const getProgressTrend = (
  data: ProgressEntry[]
): "increasing" | "decreasing" | "stable" => {
  if (data.length < 2) return "stable";

  const recent = data.slice(-3);
  const older = data.slice(-6, -3);

  const recentAvg =
    recent.reduce((sum, entry) => sum + (entry.oneRepMax || 0), 0) /
    recent.length;
  const olderAvg =
    older.length > 0
      ? older.reduce((sum, entry) => sum + (entry.oneRepMax || 0), 0) /
        older.length
      : recentAvg;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 2) return "increasing";
  if (change < -2) return "decreasing";
  return "stable";
};

export const mockProgressData = generateMockProgressData();
export const mockAnalytics = generateMockAnalytics();
