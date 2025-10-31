// Shared types for the workout tracking application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string; // Computed field: firstName + lastName
  role: "admin" | "coach" | "athlete";
  groupIds: string[]; // Groups this athlete belongs to
  coachId?: string; // Primary coach for this athlete
  dateOfBirth?: Date;
  injuryStatus?: string;
  personalRecords?: AthleteKPI[]; // Personal records for key lifts
  createdAt: Date;
  updatedAt: Date;
}

// KPI (Key Performance Indicator) for athlete personal records
export interface AthleteKPI {
  id: string;
  athleteId: string;
  exerciseId: string;
  exerciseName: string; // e.g., "Bench Press", "Squat", "Deadlift"
  currentPR: number; // Current personal record in lbs
  dateAchieved: Date;
  notes?: string;
  isActive: boolean; // Whether this KPI is actively tracked
  createdAt: Date;
  updatedAt: Date;
}

// Predefined KPI templates that coaches can enable for their athletes
export interface KPITemplate {
  id: string;
  name: string; // e.g., "Bench Press", "Back Squat", "Deadlift"
  exerciseId: string;
  category: "strength" | "power" | "endurance" | "other";
  description?: string;
  isDefault: boolean; // Whether this appears by default for new athletes
}

// Group management for organizing athletes
export interface AthleteGroup {
  id: string;
  name: string; // e.g., "Football Linemen", "Volleyball Girls"
  description?: string;
  sport: string; // e.g., "Football", "Volleyball", "Cross Country"
  category?: string; // e.g., "Linemen", "Receivers", "Girls", "Boys"
  coachId: string; // Coach who manages this group
  athleteIds: string[]; // Members of this group
  color: string; // For calendar display
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
  variations?: ExerciseVariation[]; // Alternative versions for modifications
  createdAt: Date;
}

export interface ExerciseVariation {
  id: string;
  name: string; // e.g., "Goblet Squat", "Box Squat"
  description: string;
  difficulty: "easier" | "same" | "harder";
  reason: string; // e.g., "injury modification", "beginner variation"
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
  percentageBaseKPI?: string; // KPI exercise ID to base percentage on (e.g., "bench-press")
  restTime?: number; // Rest time in seconds
  notes?: string;
  order: number; // Order in the workout
  variations?: ExerciseVariation[]; // Available modifications
  groupId?: string; // ID of the group this exercise belongs to
  substitutionReason?: string; // Reason for exercise substitution
  originalExercise?: string; // Original exercise name if substituted
  progressionNotes?: string; // Notes about progression suggestions
}

// Exercise grouping for workouts (supersets, circuits, etc.)
export interface ExerciseGroup {
  id: string;
  name: string;
  type: "superset" | "circuit" | "section";
  description?: string;
  order: number; // Order in the workout
  restBetweenRounds?: number; // Rest between rounds/sets (for circuits)
  rounds?: number; // Number of rounds (for circuits)
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  groups?: ExerciseGroup[]; // Groups for organizing exercises
  estimatedDuration: number; // In minutes
  targetGroupId?: string; // Group this workout is designed for
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Individual modifications to a group workout
export interface WorkoutModification {
  id: string;
  workoutExerciseId: string;
  athleteId: string;
  modificationType: "sets" | "reps" | "weight" | "exercise" | "rest";
  originalValue: string | number;
  modifiedValue: string | number;
  reason: string; // e.g., "returning from injury", "beginner level", "advanced athlete"
  customReason?: string; // For "other" reason type
  modifiedBy: string; // Coach who made the modification
  createdAt: Date;
}

// Enhanced assignment system
export interface WorkoutAssignment {
  id: string;
  workoutPlanId: string;
  workoutPlanName: string;
  assignmentType: "individual" | "group";

  // Individual assignment
  athleteId?: string;

  // Group assignment
  groupId?: string;
  athleteIds?: string[]; // All athletes who received this assignment

  assignedBy: string;
  assignedDate: Date;
  scheduledDate: Date;
  startTime?: string;
  endTime?: string;
  dueDate?: Date;
  status: "assigned" | "started" | "completed" | "overdue";

  // Individual modifications for each athlete
  modifications?: WorkoutModification[];

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar and scheduling
export interface CalendarEvent {
  id: string;
  type: "workout" | "rest" | "competition" | "meeting";
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;

  // Workout-specific
  workoutAssignmentId?: string;
  workoutPlanId?: string;

  // Participants
  athleteIds: string[];
  groupIds: string[];
  coachId: string;

  location?: string;
  notes?: string;
  color: string;
  createdAt: Date;
}

export interface WeeklySchedule {
  id: string;
  weekStartDate: Date; // Monday of the week
  coachId: string;
  groupId?: string; // If this is a group schedule
  events: CalendarEvent[];
  template?: boolean; // If this is a reusable template
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

  // Track if this exercise was modified for this athlete
  isModified: boolean;
  originalExerciseId?: string;
  modificationReason?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  workoutPlanName: string;
  workoutAssignmentId: string;
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

  // Track modifications applied to this session
  appliedModifications: WorkoutModification[];
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
