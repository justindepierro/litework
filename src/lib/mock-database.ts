// Centralized Mock Database
// This file consolidates all mock data from across the application
// In production, this will be replaced with real Supabase queries

import {
  User,
  AthleteGroup,
  WorkoutPlan,
  WorkoutAssignment,
  Exercise,
} from "@/types";

// ===========================
// USERS & ATHLETES
// ===========================

export const mockUsers: User[] = [
  {
    id: "1",
    email: "coach@litework.app",
    firstName: "Coach",
    lastName: "User",
    fullName: "Coach User",
    role: "coach",
    groupIds: [], // Coaches don't belong to groups
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-15"),
  },
  // Athletes will be added via the real database/API
];

// ===========================
// ATHLETE GROUPS
// ===========================

export const mockGroups: AthleteGroup[] = [
  // Groups will be created by coaches via the UI
];

// ===========================
// WORKOUT PLANS
// ===========================

export const mockWorkoutPlans: WorkoutPlan[] = [
  // Workout plans will be created by coaches via the WorkoutEditor
];

// ===========================
// WORKOUT ASSIGNMENTS
// ===========================

export const mockAssignments: WorkoutAssignment[] = [
  // Workout assignments will be created when coaches assign workouts to athletes/groups
];

// ===========================
// EXERCISE LIBRARY
// ===========================

export const mockExercises: Exercise[] = [
  {
    id: "bench-press",
    name: "Bench Press",
    category: "Chest",
    targetMuscleGroups: ["Chest", "Triceps", "Shoulders"],
    instructions: [
      "Lie flat on bench with feet firmly on floor",
      "Grip bar with hands slightly wider than shoulder width",
      "Lower bar to chest with control",
      "Press bar back up to starting position",
    ],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "squat",
    name: "Back Squat",
    category: "Legs",
    targetMuscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "bent-row",
    name: "Bent Over Row",
    category: "Back",
    targetMuscleGroups: ["Lats", "Rhomboids", "Rear Delts"],
    createdAt: new Date("2024-01-01"),
  },
];

// ===========================
// HELPER FUNCTIONS
// ===========================

// ===========================
// HELPER FUNCTIONS
// ===========================

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getGroupById = (id: string): AthleteGroup | undefined => {
  return mockGroups.find((group) => group.id === id);
};

export const getWorkoutById = (id: string): WorkoutPlan | undefined => {
  return mockWorkoutPlans.find((workout) => workout.id === id);
};

export const getAssignmentById = (
  id: string
): WorkoutAssignment | undefined => {
  return mockAssignments.find((assignment) => assignment.id === id);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return mockExercises.find((exercise) => exercise.id === id);
};

export const getGroupsByCoach = (coachId: string): AthleteGroup[] => {
  return mockGroups.filter((group) => group.coachId === coachId);
};

export const getAssignmentsByAthlete = (
  athleteId: string
): WorkoutAssignment[] => {
  return mockAssignments.filter(
    (assignment) =>
      assignment.athleteIds?.includes(athleteId) ||
      assignment.athleteId === athleteId
  );
};

export const getAssignmentsByGroup = (groupId: string): WorkoutAssignment[] => {
  return mockAssignments.filter((assignment) => assignment.groupId === groupId);
};

// ===========================
// DATA MANAGEMENT
// ===========================

// Add new entities (in production, these would be database operations)
export const addUser = (
  user: Omit<User, "id" | "createdAt" | "updatedAt">
): User => {
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUsers.push(newUser);
  return newUser;
};

export const addGroup = (
  group: Omit<AthleteGroup, "id" | "createdAt" | "updatedAt">
): AthleteGroup => {
  const newGroup: AthleteGroup = {
    ...group,
    id: `group-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockGroups.push(newGroup);
  return newGroup;
};

export const addWorkout = (
  workout: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">
): WorkoutPlan => {
  const newWorkout: WorkoutPlan = {
    ...workout,
    id: `workout-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockWorkoutPlans.push(newWorkout);
  return newWorkout;
};

export const addAssignment = (
  assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
): WorkoutAssignment => {
  const newAssignment: WorkoutAssignment = {
    ...assignment,
    id: `assignment-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockAssignments.push(newAssignment);
  return newAssignment;
};

// Update entities
export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const index = mockUsers.findIndex((user) => user.id === id);
  if (index === -1) return null;

  mockUsers[index] = {
    ...mockUsers[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockUsers[index];
};

export const updateGroup = (
  id: string,
  updates: Partial<AthleteGroup>
): AthleteGroup | null => {
  const index = mockGroups.findIndex((group) => group.id === id);
  if (index === -1) return null;

  mockGroups[index] = {
    ...mockGroups[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockGroups[index];
};

export const updateWorkout = (
  id: string,
  updates: Partial<WorkoutPlan>
): WorkoutPlan | null => {
  const index = mockWorkoutPlans.findIndex((workout) => workout.id === id);
  if (index === -1) return null;

  mockWorkoutPlans[index] = {
    ...mockWorkoutPlans[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockWorkoutPlans[index];
};

// Delete entities
export const deleteUser = (id: string): boolean => {
  const index = mockUsers.findIndex((user) => user.id === id);
  if (index === -1) return false;

  mockUsers.splice(index, 1);
  return true;
};

export const deleteGroup = (id: string): boolean => {
  const index = mockGroups.findIndex((group) => group.id === id);
  if (index === -1) return false;

  mockGroups.splice(index, 1);
  return true;
};

export const deleteWorkout = (id: string): boolean => {
  const index = mockWorkoutPlans.findIndex((workout) => workout.id === id);
  if (index === -1) return false;

  mockWorkoutPlans.splice(index, 1);
  return true;
};

export const deleteAssignment = (id: string): boolean => {
  const index = mockAssignments.findIndex((assignment) => assignment.id === id);
  if (index === -1) return false;

  mockAssignments.splice(index, 1);
  return true;
};
