// Database Service Layer
// This replaces the mock database with real Supabase queries
// Provides the same interface for seamless transition

import { supabaseAdmin as supabase } from "./supabase-admin";
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

  // Transform snake_case to camelCase
  return (data || []).map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    sport: group.sport,
    category: group.category,
    coachId: group.coach_id,
    athleteIds: group.athlete_ids || [],
    color: group.color,
    createdAt: new Date(group.created_at),
    updatedAt: new Date(group.updated_at),
  }));
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

  // Transform snake_case to camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    sport: data.sport,
    category: data.category,
    coachId: data.coach_id,
    athleteIds: data.athlete_ids || [],
    color: data.color,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

export const createGroup = async (
  groupData: Omit<AthleteGroup, "id" | "createdAt" | "updatedAt">
): Promise<AthleteGroup | null> => {
  try {
    console.log(
      "[database-service] createGroup called with:",
      JSON.stringify(groupData)
    );

    // Transform camelCase to snake_case for database
    const dbData = {
      name: groupData.name,
      description: groupData.description,
      sport: groupData.sport,
      category: groupData.category,
      coach_id: groupData.coachId,
      athlete_ids: groupData.athleteIds,
      color: groupData.color,
    };

    console.log(
      "[database-service] Transformed to dbData:",
      JSON.stringify(dbData)
    );

    const { data, error } = await supabase
      .from("athlete_groups")
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error(
        "[database-service] Supabase error:",
        JSON.stringify(error)
      );
      return null;
    }

    console.log(
      "[database-service] Supabase returned data:",
      JSON.stringify(data)
    );

    // Transform snake_case back to camelCase
    const result = {
      id: data.id,
      name: data.name,
      description: data.description,
      sport: data.sport,
      category: data.category,
      coachId: data.coach_id,
      athleteIds: data.athlete_ids || [],
      color: data.color,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    console.log("[database-service] Returning result:", JSON.stringify(result));
    return result;
  } catch (err) {
    console.error("[database-service] Exception in createGroup:", err);
    console.error(
      "[database-service] Exception stack:",
      err instanceof Error ? err.stack : "No stack"
    );
    return null;
  }
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
  const { data: plans, error } = await supabase
    .from("workout_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workout plans:", error);
    return [];
  }

  if (!plans || plans.length === 0) {
    return [];
  }

  // Fetch exercises and groups for all plans
  const planIds = plans.map((p) => p.id);

  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select("*")
    .in("workout_plan_id", planIds)
    .order("order_index", { ascending: true });

  const { data: groups } = await supabase
    .from("workout_exercise_groups")
    .select("*")
    .in("workout_plan_id", planIds)
    .order("order_index", { ascending: true });

  const { data: blockInstances } = await supabase
    .from("workout_block_instances")
    .select("*")
    .in("workout_plan_id", planIds);

  // Combine plans with their exercises and groups
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    estimatedDuration: plan.estimated_duration,
    targetGroupId: plan.target_group_id,
    createdBy: plan.created_by,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    exercises: (exercises || [])
      .filter((ex) => ex.workout_plan_id === plan.id)
      .map((ex) => ({
        id: ex.id,
        exerciseId: ex.exercise_id,
        exerciseName: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        weightType: ex.weight_type,
        weight: ex.weight,
        weightMax: ex.weight_max,
        percentage: ex.percentage,
        percentageMax: ex.percentage_max,
        percentageBaseKPI: ex.percentage_base_kpi,
        tempo: ex.tempo,
        eachSide: ex.each_side,
        restTime: ex.rest_time,
        notes: ex.notes,
        order: ex.order_index,
        groupId: ex.group_id,
        blockInstanceId: ex.block_instance_id,
        substitutionReason: ex.substitution_reason,
        originalExercise: ex.original_exercise,
        progressionNotes: ex.progression_notes,
      })),
    groups: (groups || [])
      .filter((g) => g.workout_plan_id === plan.id)
      .map((g) => ({
        id: g.id,
        name: g.name,
        type: g.type,
        description: g.description,
        order: g.order_index,
        restBetweenRounds: g.rest_between_rounds,
        restBetweenExercises: g.rest_between_exercises,
        rounds: g.rounds,
        notes: g.notes,
        blockInstanceId: g.block_instance_id,
      })),
    blockInstances: (blockInstances || [])
      .filter((bi) => bi.workout_plan_id === plan.id)
      .map((bi) => ({
        id: bi.id,
        sourceBlockId: bi.source_block_id,
        sourceBlockName: bi.source_block_name,
        instanceName: bi.instance_name,
        notes: bi.notes,
        estimatedDuration: bi.estimated_duration,
        customizations: {
          modifiedExercises: bi.modified_exercises || [],
          addedExercises: bi.added_exercises || [],
          removedExercises: bi.removed_exercises || [],
          modifiedGroups: bi.modified_groups || [],
          addedGroups: bi.added_groups || [],
          removedGroups: bi.removed_groups || [],
        },
        createdAt: new Date(bi.created_at),
        updatedAt: new Date(bi.updated_at),
      })),
  }));
};

export const getWorkoutPlanById = async (
  id: string
): Promise<WorkoutPlan | null> => {
  const { data: plan, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching workout plan:", error);
    return null;
  }

  // Fetch exercises for this plan
  const { data: exercises } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_plan_id", id)
    .order("order_index", { ascending: true });

  // Fetch groups for this plan
  const { data: groups } = await supabase
    .from("workout_exercise_groups")
    .select("*")
    .eq("workout_plan_id", id)
    .order("order_index", { ascending: true });

  // Fetch block instances for this plan
  const { data: blockInstances } = await supabase
    .from("workout_block_instances")
    .select("*")
    .eq("workout_plan_id", id);

  return {
    ...plan,
    exercises: (exercises || []).map((ex) => ({
      id: ex.id,
      exerciseId: ex.exercise_id,
      exerciseName: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      weightType: ex.weight_type,
      weight: ex.weight,
      weightMax: ex.weight_max,
      percentage: ex.percentage,
      percentageMax: ex.percentage_max,
      percentageBaseKPI: ex.percentage_base_kpi,
      tempo: ex.tempo,
      eachSide: ex.each_side,
      restTime: ex.rest_time,
      notes: ex.notes,
      order: ex.order_index,
      groupId: ex.group_id,
      blockInstanceId: ex.block_instance_id,
      substitutionReason: ex.substitution_reason,
      originalExercise: ex.original_exercise,
      progressionNotes: ex.progression_notes,
    })),
    groups: (groups || []).map((g) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      description: g.description,
      order: g.order_index,
      restBetweenRounds: g.rest_between_rounds,
      restBetweenExercises: g.rest_between_exercises,
      rounds: g.rounds,
      notes: g.notes,
      blockInstanceId: g.block_instance_id,
    })),
    blockInstances: (blockInstances || []).map((bi) => ({
      id: bi.id,
      sourceBlockId: bi.source_block_id,
      sourceBlockName: bi.source_block_name,
      instanceName: bi.instance_name,
      notes: bi.notes,
      estimatedDuration: bi.estimated_duration,
      customizations: {
        modifiedExercises: bi.modified_exercises || [],
        addedExercises: bi.added_exercises || [],
        removedExercises: bi.removed_exercises || [],
        modifiedGroups: bi.modified_groups || [],
        addedGroups: bi.added_groups || [],
        removedGroups: bi.removed_groups || [],
      },
      createdAt: new Date(bi.created_at),
      updatedAt: new Date(bi.updated_at),
    })),
  };
};

export const createWorkoutPlan = async (
  workoutData: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutPlan | null> => {
  // Separate exercises, groups, and blocks from workout plan data
  const { exercises, groups, blockInstances, ...planData } = workoutData;

  // Transform camelCase to snake_case for database
  const dbPlanData = {
    name: planData.name,
    description: planData.description,
    estimated_duration: planData.estimatedDuration,
    target_group_id: planData.targetGroupId,
    created_by: planData.createdBy,
  };

  // 1. Insert workout plan metadata
  const { data: newPlan, error: planError } = await supabase
    .from("workout_plans")
    .insert([dbPlanData])
    .select()
    .single();

  if (planError) {
    console.error("Error creating workout plan:", planError);
    return null;
  }

  // 2. Insert exercises if provided
  if (exercises && exercises.length > 0) {
    const exercisesToInsert = exercises.map((ex) => ({
      workout_plan_id: newPlan.id,
      exercise_id: ex.exerciseId,
      exercise_name: ex.exerciseName,
      sets: ex.sets,
      reps: ex.reps,
      weight_type: ex.weightType,
      weight: ex.weight,
      weight_max: ex.weightMax,
      percentage: ex.percentage,
      percentage_max: ex.percentageMax,
      percentage_base_kpi: ex.percentageBaseKPI,
      tempo: ex.tempo,
      each_side: ex.eachSide,
      rest_time: ex.restTime,
      notes: ex.notes,
      order_index: ex.order,
      group_id: ex.groupId,
      block_instance_id: ex.blockInstanceId,
      substitution_reason: ex.substitutionReason,
      original_exercise: ex.originalExercise,
      progression_notes: ex.progressionNotes,
    }));

    const { error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(exercisesToInsert);

    if (exercisesError) {
      console.error("Error creating workout exercises:", exercisesError);
      // Continue anyway - plan was created
    }
  }

  // 3. Insert groups if provided
  if (groups && groups.length > 0) {
    const groupsToInsert = groups.map((group) => ({
      workout_plan_id: newPlan.id,
      name: group.name,
      type: group.type,
      description: group.description,
      order_index: group.order,
      rest_between_rounds: group.restBetweenRounds,
      rest_between_exercises: group.restBetweenExercises,
      rounds: group.rounds,
      notes: group.notes,
      block_instance_id: group.blockInstanceId,
    }));

    const { error: groupsError } = await supabase
      .from("workout_exercise_groups")
      .insert(groupsToInsert);

    if (groupsError) {
      console.error("Error creating workout groups:", groupsError);
      // Continue anyway - plan was created
    }
  }

  // 4. Insert block instances if provided
  if (blockInstances && blockInstances.length > 0) {
    const instancesToInsert = blockInstances.map((instance) => ({
      workout_plan_id: newPlan.id,
      source_block_id: instance.sourceBlockId,
      source_block_name: instance.sourceBlockName,
      instance_name: instance.instanceName,
      notes: instance.notes,
      estimated_duration: instance.estimatedDuration,
      modified_exercises: instance.customizations.modifiedExercises,
      added_exercises: instance.customizations.addedExercises,
      removed_exercises: instance.customizations.removedExercises,
      modified_groups: instance.customizations.modifiedGroups,
      added_groups: instance.customizations.addedGroups,
      removed_groups: instance.customizations.removedGroups,
    }));

    const { error: instancesError } = await supabase
      .from("workout_block_instances")
      .insert(instancesToInsert);

    if (instancesError) {
      console.error("Error creating block instances:", instancesError);
      // Continue anyway - plan was created
    }
  }

  // Return the complete workout plan with all data
  // Transform snake_case response back to camelCase
  return {
    id: newPlan.id,
    name: newPlan.name,
    description: newPlan.description,
    estimatedDuration: newPlan.estimated_duration,
    targetGroupId: newPlan.target_group_id,
    createdBy: newPlan.created_by,
    createdAt: new Date(newPlan.created_at),
    updatedAt: new Date(newPlan.updated_at),
    exercises: exercises || [],
    groups: groups || [],
    blockInstances: blockInstances || [],
  };
};

export const updateWorkoutPlan = async (
  id: string,
  updates: Partial<WorkoutPlan> & {
    exercises?: Array<Record<string, unknown>>;
    groups?: Array<Record<string, unknown>>;
    blockInstances?: Array<Record<string, unknown>>;
  }
): Promise<WorkoutPlan | null> => {
  console.log("[database-service] updateWorkoutPlan called:", { id, updates });

  // Extract exercises, groups, and blockInstances from updates
  const { exercises, groups, blockInstances, ...basicUpdates } = updates;

  // Update basic workout plan fields
  const { data, error } = await supabase
    .from("workout_plans")
    .update({ ...basicUpdates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[database-service] Error updating workout plan:", error);
    console.error("[database-service] Attempted to update ID:", id);
    return null;
  }

  // If exercises, groups, or blockInstances are provided, update them
  // Note: This is a simplified approach - in production, you'd want to:
  // 1. Delete existing exercises/groups/blocks for this workout
  // 2. Insert the new ones
  // For now, we just update the basic workout info
  if (exercises || groups || blockInstances) {
    console.log(
      "[database-service] Note: Full exercise/group/block update not yet implemented"
    );
    console.log("[database-service] Received:", {
      exercisesCount: exercises?.length,
      groupsCount: groups?.length,
      blockInstancesCount: blockInstances?.length,
    });
    // TODO: Implement full workout structure update
    // This requires updating workout_exercises, workout_exercise_groups, and workout_block_instances tables
  }

  console.log("[database-service] Successfully updated workout:", data);
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
