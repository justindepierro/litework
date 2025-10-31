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
    name: "Coach Sarah",
    role: "coach",
    groupIds: [], // Coaches don't belong to groups
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "2",
    email: "john@litework.app",
    name: "John Smith",
    role: "athlete",
    groupIds: ["football-linemen"],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: "3",
    email: "mike@litework.app",
    name: "Mike Johnson",
    role: "athlete",
    groupIds: ["football-linemen"],
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-10-18"),
  },
  {
    id: "4",
    email: "sarah@litework.app",
    name: "Sarah Wilson",
    role: "athlete",
    groupIds: ["volleyball-girls"],
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-10-22"),
  },
  {
    id: "5",
    email: "emma@litework.app",
    name: "Emma Davis",
    role: "athlete",
    groupIds: ["volleyball-girls"],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-10-25"),
  },
];

// ===========================
// ATHLETE GROUPS
// ===========================

export const mockGroups: AthleteGroup[] = [
  {
    id: "1",
    name: "Football Linemen",
    description: "Offensive and defensive linemen",
    sport: "Football",
    category: "Linemen",
    coachId: "1",
    athleteIds: ["2", "4"],
    color: "#ff6b35",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "2",
    name: "Football Receivers",
    description: "Wide receivers and tight ends",
    sport: "Football",
    category: "Receivers",
    coachId: "1",
    athleteIds: [],
    color: "#00d4aa",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "3",
    name: "Volleyball Girls",
    description: "Varsity volleyball team",
    sport: "Volleyball",
    category: "Varsity",
    coachId: "1",
    athleteIds: ["3", "5"],
    color: "#8b5cf6",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-10-20"),
  },
];

// ===========================
// WORKOUT PLANS
// ===========================

export const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    description: "Focus on bench press, rows, and shoulder development",
    exercises: [
      {
        id: "1",
        exerciseId: "bench-press",
        exerciseName: "Bench Press",
        sets: 3,
        reps: 8,
        weightType: "percentage",
        percentage: 80,
        restTime: 180,
        order: 1,
      },
      {
        id: "2",
        exerciseId: "bent-row",
        exerciseName: "Bent Over Row",
        sets: 3,
        reps: 8,
        weightType: "percentage",
        percentage: 75,
        restTime: 150,
        order: 2,
      },
      {
        id: "3",
        exerciseId: "shoulder-press",
        exerciseName: "Shoulder Press",
        sets: 3,
        reps: 10,
        weightType: "percentage",
        percentage: 70,
        restTime: 120,
        order: 3,
      },
    ],
    estimatedDuration: 45,
    targetGroupId: "1",
    createdBy: "1",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "2",
    name: "Lower Body Power",
    description: "Explosive movements for athletic development",
    exercises: [
      {
        id: "4",
        exerciseId: "squat",
        exerciseName: "Back Squat",
        sets: 4,
        reps: 5,
        weightType: "percentage",
        percentage: 85,
        restTime: 240,
        order: 1,
      },
      {
        id: "5",
        exerciseId: "jump-squat",
        exerciseName: "Jump Squats",
        sets: 3,
        reps: 10,
        weightType: "bodyweight",
        restTime: 60,
        order: 2,
      },
    ],
    estimatedDuration: 30,
    targetGroupId: "3",
    createdBy: "1",
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-20"),
  },
];

// ===========================
// WORKOUT ASSIGNMENTS
// ===========================

export const mockAssignments: WorkoutAssignment[] = [
  {
    id: "1",
    workoutPlanId: "1",
    workoutPlanName: "Upper Body Strength",
    assignmentType: "group",
    groupId: "1",
    athleteIds: ["2", "4"],
    assignedBy: "1",
    assignedDate: new Date("2024-10-25"),
    scheduledDate: new Date("2024-10-30"),
    startTime: "15:30",
    endTime: "16:30",
    status: "assigned",
    modifications: [],
    notes: "Focus on proper form",
    createdAt: new Date("2024-10-25"),
    updatedAt: new Date("2024-10-25"),
  },
  {
    id: "2",
    workoutPlanId: "2",
    workoutPlanName: "Lower Body Power",
    assignmentType: "group",
    groupId: "3",
    athleteIds: ["3", "5"],
    assignedBy: "1",
    assignedDate: new Date("2024-10-26"),
    scheduledDate: new Date("2024-10-31"),
    startTime: "14:00",
    endTime: "14:45",
    status: "assigned",
    modifications: [],
    notes: "Focus on explosive movements",
    createdAt: new Date("2024-10-26"),
    updatedAt: new Date("2024-10-26"),
  },
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
