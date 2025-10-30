// Mock progress and analytics data
import { ProgressEntry } from "@/types";

// Generate mock progress data for different exercises and athletes
export const generateMockProgressData = (): ProgressEntry[] => {
  const exercises = [
    { id: "1", name: "Bench Press" },
    { id: "2", name: "Squats" },
    { id: "3", name: "Deadlifts" },
    { id: "4", name: "Overhead Press" },
    { id: "5", name: "Pull-ups" },
  ];

  const athletes = [
    { id: "2", name: "John Smith" },
    { id: "3", name: "Mike Johnson" },
    { id: "4", name: "Sarah Wilson" },
    { id: "5", name: "Emma Davis" },
  ];

  const progressData: ProgressEntry[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6); // 6 months of data

  athletes.forEach((athlete) => {
    exercises.forEach((exercise) => {
      // Generate 12-24 entries over 6 months for each athlete/exercise combo
      const numEntries = Math.floor(Math.random() * 12) + 12;

      for (let i = 0; i < numEntries; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 14 + Math.floor(Math.random() * 7)); // Roughly every 2 weeks with some variance

        // Progressive weight increase with some variance
        const baseWeight = getBaseWeight(exercise.name);
        const progression = 1 + i * 0.03; // 3% increase per session on average
        const variance = 0.9 + Math.random() * 0.2; // ±10% variance
        const weight = Math.round(baseWeight * progression * variance);

        // Reps typically 8-12 for strength training
        const reps = Math.floor(Math.random() * 5) + 8;

        // Calculate estimated 1RM using Epley formula
        const oneRepMax = Math.round(weight * (1 + reps / 30));

        progressData.push({
          id: `${athlete.id}-${exercise.id}-${i}`,
          userId: athlete.id,
          exerciseId: exercise.id,
          date,
          weight,
          reps,
          oneRepMax,
        });
      }
    });
  });

  return progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
};

function getBaseWeight(exerciseName: string): number {
  const baseWeights: Record<string, number> = {
    "Bench Press": 135,
    Squats: 185,
    Deadlifts: 225,
    "Overhead Press": 95,
    "Pull-ups": 0, // Bodyweight
  };
  return baseWeights[exerciseName] || 100;
}

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
  // Workout frequency data (last 12 weeks)
  const workoutFrequency: WorkoutFrequency[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    const weekString = `${date.getMonth() + 1}/${date.getDate()}`;

    workoutFrequency.push({
      week: weekString,
      workouts: Math.floor(Math.random() * 3) + 2, // 2-4 workouts per week
      goal: 3,
    });
  }

  // Strength progress for key exercises
  const strengthProgress: StrengthProgress[] = [
    {
      exercise: "Bench Press",
      currentMax: 185,
      previousMax: 170,
      improvement: 8.8,
    },
    {
      exercise: "Squats",
      currentMax: 225,
      previousMax: 205,
      improvement: 9.8,
    },
    {
      exercise: "Deadlifts",
      currentMax: 275,
      previousMax: 250,
      improvement: 10.0,
    },
    {
      exercise: "Overhead Press",
      currentMax: 135,
      previousMax: 125,
      improvement: 8.0,
    },
  ];

  // Group performance data
  const groupPerformance: GroupPerformance[] = [
    {
      groupName: "Football Linemen",
      averageImprovement: 12.5,
      totalWorkouts: 156,
      consistencyScore: 87,
    },
    {
      groupName: "Volleyball Girls",
      averageImprovement: 15.2,
      totalWorkouts: 142,
      consistencyScore: 92,
    },
    {
      groupName: "Cross Country Boys",
      averageImprovement: 8.7,
      totalWorkouts: 189,
      consistencyScore: 95,
    },
    {
      groupName: "Football Receivers",
      averageImprovement: 11.3,
      totalWorkouts: 134,
      consistencyScore: 82,
    },
  ];

  // Athlete rankings
  const athleteRankings: AthleteRanking[] = [
    {
      athleteId: "4",
      athleteName: "Sarah Wilson",
      totalScore: 94,
      strengthScore: 92,
      consistencyScore: 96,
      improvementScore: 94,
    },
    {
      athleteId: "5",
      athleteName: "Emma Davis",
      totalScore: 91,
      strengthScore: 89,
      consistencyScore: 94,
      improvementScore: 90,
    },
    {
      athleteId: "2",
      athleteName: "John Smith",
      totalScore: 88,
      strengthScore: 91,
      consistencyScore: 85,
      improvementScore: 88,
    },
    {
      athleteId: "3",
      athleteName: "Mike Johnson",
      totalScore: 85,
      strengthScore: 87,
      consistencyScore: 82,
      improvementScore: 86,
    },
  ];

  return {
    workoutFrequency,
    strengthProgress,
    groupPerformance,
    athleteRankings,
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
