// Database Service Layer
// This replaces the mock database with real Supabase queries
// Provides the same interface for seamless transition

import { supabase } from "./supabase";
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

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data || [];
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
};

export const createUser = async (
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return data;
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data;
};

// ===========================
// ATHLETE GROUPS
// ===========================

export const getAllGroups = async (): Promise<AthleteGroup[]> => {
  const { data, error } = await supabase
    .from("athlete_groups")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching groups:", error);
    return [];
  }

  return data || [];
};

export const getGroupById = async (
  id: string
): Promise<AthleteGroup | null> => {
  const { data, error } = await supabase
    .from("athlete_groups")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching group:", error);
    return null;
  }

  return data;
};

export const createGroup = async (
  groupData: Omit<AthleteGroup, "id" | "createdAt" | "updatedAt">
): Promise<AthleteGroup | null> => {
  const { data, error } = await supabase
    .from("athlete_groups")
    .insert([groupData])
    .select()
    .single();

  if (error) {
    console.error("Error creating group:", error);
    return null;
  }

  return data;
};

export const updateGroup = async (
  id: string,
  updates: Partial<AthleteGroup>
): Promise<AthleteGroup | null> => {
  const { data, error } = await supabase
    .from("athlete_groups")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating group:", error);
    return null;
  }

  return data;
};

export const deleteGroup = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("athlete_groups").delete().eq("id", id);

  if (error) {
    console.error("Error deleting group:", error);
    return false;
  }

  return true;
};

// ===========================
// EXERCISES
// ===========================

export const getAllExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }

  return data || [];
};

export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching exercise:", error);
    return null;
  }

  return data;
};

export const createExercise = async (
  exerciseData: Omit<Exercise, "id" | "createdAt">
): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from("exercises")
    .insert([exerciseData])
    .select()
    .single();

  if (error) {
    console.error("Error creating exercise:", error);
    return null;
  }

  return data;
};

// ===========================
// WORKOUT PLANS
// ===========================

export const getAllWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workout plans:", error);
    return [];
  }

  return data || [];
};

export const getWorkoutPlanById = async (
  id: string
): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching workout plan:", error);
    return null;
  }

  return data;
};

export const createWorkoutPlan = async (
  workoutData: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from("workout_plans")
    .insert([workoutData])
    .select()
    .single();

  if (error) {
    console.error("Error creating workout plan:", error);
    return null;
  }

  return data;
};

export const updateWorkoutPlan = async (
  id: string,
  updates: Partial<WorkoutPlan>
): Promise<WorkoutPlan | null> => {
  const { data, error } = await supabase
    .from("workout_plans")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating workout plan:", error);
    return null;
  }

  return data;
};

export const deleteWorkoutPlan = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("workout_plans").delete().eq("id", id);

  if (error) {
    console.error("Error deleting workout plan:", error);
    return false;
  }

  return true;
};

// ===========================
// WORKOUT ASSIGNMENTS
// ===========================

export const getAllAssignments = async (): Promise<WorkoutAssignment[]> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return data || [];
};

export const getAssignmentById = async (
  id: string
): Promise<WorkoutAssignment | null> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching assignment:", error);
    return null;
  }

  return data;
};

export const createAssignment = async (
  assignmentData: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutAssignment | null> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .insert([assignmentData])
    .select()
    .single();

  if (error) {
    console.error("Error creating assignment:", error);
    return null;
  }

  return data;
};

export const updateAssignment = async (
  id: string,
  updates: Partial<WorkoutAssignment>
): Promise<WorkoutAssignment | null> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating assignment:", error);
    return null;
  }

  return data;
};

// ===========================
// HELPER FUNCTIONS (maintaining compatibility)
// ===========================

export const getGroupsByCoach = async (
  coachId: string
): Promise<AthleteGroup[]> => {
  const { data, error } = await supabase
    .from("athlete_groups")
    .select("*")
    .eq("coach_id", coachId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching coach groups:", error);
    return [];
  }

  return data || [];
};

export const getAssignmentsByAthlete = async (
  athleteId: string
): Promise<WorkoutAssignment[]> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("*")
    .contains("athlete_ids", [athleteId])
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching athlete assignments:", error);
    return [];
  }

  return data || [];
};

export const getAssignmentsByGroup = async (
  groupId: string
): Promise<WorkoutAssignment[]> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("*")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching group assignments:", error);
    return [];
  }

  return data || [];
};

// Backward compatibility aliases
export const addUser = createUser;
export const addGroup = createGroup;
export const addWorkout = createWorkoutPlan;
export const addAssignment = createAssignment;
export const getWorkoutById = getWorkoutPlanById;
export const mockUsers = getAllUsers;
export const mockGroups = getAllGroups;
export const mockWorkoutPlans = getAllWorkoutPlans;
export const mockAssignments = getAllAssignments;
export const mockExercises = getAllExercises;
