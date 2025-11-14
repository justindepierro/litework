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
import { transformToCamel, transformToSnake } from "./case-transform";
import { devValidate, logValidationResults } from "./db-validation";
import { parseDate } from "./date-utils";

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

  // Transform snake_case to camelCase
  const users = (data || []).map((user) => transformToCamel<User>(user));

  // Validate transformations in development
  if (process.env.NODE_ENV === "development" && users.length > 0) {
    devValidate(users[0], "user", "getAllUsers");
  }

  return users;
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

  // Transform snake_case to camelCase
  return transformToCamel<User>(data);
};

export const createUser = async (
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User | null> => {
  // Transform camelCase to snake_case for database
  const dbData = transformToSnake(userData);

  const { data, error } = await supabase
    .from("users")
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  // Transform response back to camelCase
  return transformToCamel<User>(data);
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User | null> => {
  // Transform camelCase to snake_case for database
  const dbUpdates = transformToSnake({ ...updates, updatedAt: new Date() });

  const { data, error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  // Transform response back to camelCase
  return transformToCamel<User>(data);
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
    archived: group.archived || false,
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
    archived: data.archived || false,
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

    // [REMOVED] console.log("[database-service] Returning result:", JSON.stringify(result));
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
  // Transform camelCase to snake_case for database
  const dbUpdates = transformToSnake({ ...updates, updatedAt: new Date() });

  const { data, error } = await supabase
    .from("athlete_groups")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating group:", error);
    return null;
  }

  // Transform response back to camelCase
  return transformToCamel<AthleteGroup>(data);
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

  // Fetch KPI tags for all exercises
  const exerciseIds = exercises?.map((ex) => ex.id) || [];
  let exerciseKpiTags: Record<string, string[]> = {};

  if (exerciseIds.length > 0) {
    const { data: kpiTags } = await supabase
      .from("exercise_kpi_tags")
      .select("workout_exercise_id, kpi_tag_id")
      .in("workout_exercise_id", exerciseIds);

    // Group KPI tag IDs by exercise ID
    if (kpiTags) {
      exerciseKpiTags = kpiTags.reduce(
        (acc, tag) => {
          if (!acc[tag.workout_exercise_id]) {
            acc[tag.workout_exercise_id] = [];
          }
          acc[tag.workout_exercise_id].push(tag.kpi_tag_id);
          return acc;
        },
        {} as Record<string, string[]>
      );
    }
  }

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
    archived: plan.archived || false,
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
        videoUrl: ex.video_url, // Load YouTube video URL
        order: ex.order_index,
        groupId: ex.group_id,
        blockInstanceId: ex.block_instance_id,
        substitutionReason: ex.substitution_reason,
        originalExercise: ex.original_exercise,
        progressionNotes: ex.progression_notes,
        kpiTagIds: exerciseKpiTags[ex.id] || [],
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

  // Fetch KPI tags for all exercises in this plan
  const exerciseIds = exercises?.map((ex) => ex.id) || [];
  let exerciseKpiTags: Record<string, string[]> = {};

  if (exerciseIds.length > 0) {
    const { data: kpiTags } = await supabase
      .from("exercise_kpi_tags")
      .select("workout_exercise_id, kpi_tag_id")
      .in("workout_exercise_id", exerciseIds);

    // Group KPI tag IDs by exercise ID
    if (kpiTags) {
      exerciseKpiTags = kpiTags.reduce(
        (acc, tag) => {
          if (!acc[tag.workout_exercise_id]) {
            acc[tag.workout_exercise_id] = [];
          }
          acc[tag.workout_exercise_id].push(tag.kpi_tag_id);
          return acc;
        },
        {} as Record<string, string[]>
      );
    }
  }

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
    id: plan.id,
    name: plan.name,
    description: plan.description,
    estimatedDuration: plan.estimated_duration,
    targetGroupId: plan.target_group_id,
    createdBy: plan.created_by,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    archived: plan.archived || false,
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
      videoUrl: ex.video_url, // Load YouTube video URL
      order: ex.order_index,
      groupId: ex.group_id,
      blockInstanceId: ex.block_instance_id,
      substitutionReason: ex.substitution_reason,
      originalExercise: ex.original_exercise,
      progressionNotes: ex.progression_notes,
      kpiTagIds: exerciseKpiTags[ex.id] || [],
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

  // Validate and fix orphaned exercises (exercises with invalid groupIds)
  const groupIds = new Set((groups || []).map((g) => g.id));
  const orphanedExercises = (exercises || []).filter(
    (ex) => ex.group_id && !groupIds.has(ex.group_id)
  );

  if (orphanedExercises.length > 0) {
    console.warn(
      "[getWorkoutPlanById] Found orphaned exercises, clearing invalid groupIds:",
      orphanedExercises.map((ex) => ({
        id: ex.id,
        name: ex.exercise_name,
        invalidGroupId: ex.group_id,
      }))
    );

    // Update exercises in database to remove invalid groupIds
    const updatePromises = orphanedExercises.map((ex) =>
      supabase
        .from("workout_exercises")
        .update({ group_id: null })
        .eq("id", ex.id)
    );

    await Promise.all(updatePromises);

    // Also update the returned data structure
    const result = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      estimatedDuration: plan.estimated_duration,
      targetGroupId: plan.target_group_id,
      createdBy: plan.created_by,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
      archived: plan.archived || false,
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
        videoUrl: ex.video_url,
        order: ex.order_index,
        groupId:
          ex.group_id && groupIds.has(ex.group_id) ? ex.group_id : undefined, // Clear invalid groupIds
        blockInstanceId: ex.block_instance_id,
        substitutionReason: ex.substitution_reason,
        originalExercise: ex.original_exercise,
        progressionNotes: ex.progression_notes,
        kpiTagIds: exerciseKpiTags[ex.id] || [],
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

    return result;
  }

  // No orphaned exercises, return as-is
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    estimatedDuration: plan.estimated_duration,
    targetGroupId: plan.target_group_id,
    createdBy: plan.created_by,
    createdAt: new Date(plan.created_at),
    updatedAt: new Date(plan.updated_at),
    archived: plan.archived || false,
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
      videoUrl: ex.video_url,
      order: ex.order_index,
      groupId: ex.group_id,
      blockInstanceId: ex.block_instance_id,
      substitutionReason: ex.substitution_reason,
      originalExercise: ex.original_exercise,
      progressionNotes: ex.progression_notes,
      kpiTagIds: exerciseKpiTags[ex.id] || [],
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

/**
 * Transaction-safe workout plan creation using Supabase RPC function
 * Ensures all-or-nothing semantics for workout creation
 */
export const createWorkoutPlanTransaction = async (
  workoutData: Omit<WorkoutPlan, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutPlan | null> => {
  try {
    // Prepare exercises data for JSONB
    const exercisesJson = (workoutData.exercises || []).map((ex, index) => ({
      exercise_id: ex.exerciseId || null,
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
      video_url: ex.videoUrl,
      order_index: index,
      group_id: ex.groupId || null,
      block_instance_id: ex.blockInstanceId || null,
      substitution_reason: ex.substitutionReason,
      original_exercise: ex.originalExercise,
      progression_notes: ex.progressionNotes,
      kpi_tag_ids: ex.kpiTagIds || [],
    }));

    // Prepare groups data for JSONB
    const groupsJson = (workoutData.groups || []).map((group, index) => ({
      name: group.name,
      type: group.type,
      description: group.description,
      order_index: index,
      rest_between_rounds: group.restBetweenRounds,
      rest_between_exercises: group.restBetweenExercises,
      rounds: group.rounds,
      notes: group.notes,
      block_instance_id: group.blockInstanceId || null,
    }));

    // Prepare block instances data for JSONB
    const blockInstancesJson = (workoutData.blockInstances || []).map((bi) => ({
      source_block_id: bi.sourceBlockId,
      source_block_name: bi.sourceBlockName,
      instance_name: bi.instanceName,
      notes: bi.notes,
      estimated_duration: bi.estimatedDuration,
      modified_exercises: bi.customizations?.modifiedExercises || [],
      added_exercises: bi.customizations?.addedExercises || [],
      removed_exercises: bi.customizations?.removedExercises || [],
      modified_groups: bi.customizations?.modifiedGroups || [],
      added_groups: bi.customizations?.addedGroups || [],
      removed_groups: bi.customizations?.removedGroups || [],
    }));

    // Call RPC function
    const { data: planId, error } = await supabase.rpc(
      "create_workout_plan_transaction",
      {
        p_name: workoutData.name,
        p_description: workoutData.description,
        p_estimated_duration: workoutData.estimatedDuration,
        p_target_group_id: workoutData.targetGroupId || null,
        p_created_by: workoutData.createdBy,
        p_archived: workoutData.archived || false,
        p_exercises: exercisesJson,
        p_groups: groupsJson,
        p_block_instances: blockInstancesJson,
      }
    );

    if (error) {
      console.error("Error creating workout plan (transaction):", error);
      return null;
    }

    // Fetch and return the created workout
    if (planId) {
      return await getWorkoutPlanById(planId);
    }

    return null;
  } catch (error) {
    console.error("Error in createWorkoutPlanTransaction:", error);
    return null;
  }
};

/**
 * Transaction-safe workout plan update using Supabase RPC function
 * Ensures all-or-nothing semantics for workout updates
 */
export const updateWorkoutPlanTransaction = async (
  id: string,
  workoutData: Partial<WorkoutPlan>
): Promise<WorkoutPlan | null> => {
  try {
    // Get existing workout to merge with partial data
    const existingWorkout = await getWorkoutPlanById(id);
    if (!existingWorkout) {
      console.error("Workout plan not found:", id);
      return null;
    }

    // Merge existing with updates
    const mergedWorkout = { ...existingWorkout, ...workoutData };

    // Prepare exercises data for JSONB
    const exercisesJson = (mergedWorkout.exercises || []).map((ex, index) => ({
      exercise_id: ex.exerciseId || null,
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
      video_url: ex.videoUrl,
      order_index: index,
      group_id: ex.groupId || null,
      block_instance_id: ex.blockInstanceId || null,
      substitution_reason: ex.substitutionReason,
      original_exercise: ex.originalExercise,
      progression_notes: ex.progressionNotes,
      kpi_tag_ids: ex.kpiTagIds || [],
    }));

    // Prepare groups data for JSONB
    const groupsJson = (mergedWorkout.groups || []).map((group, index) => ({
      name: group.name,
      type: group.type,
      description: group.description,
      order_index: index,
      rest_between_rounds: group.restBetweenRounds,
      rest_between_exercises: group.restBetweenExercises,
      rounds: group.rounds,
      notes: group.notes,
      block_instance_id: group.blockInstanceId || null,
    }));

    // Prepare block instances data for JSONB
    const blockInstancesJson = (mergedWorkout.blockInstances || []).map(
      (bi) => ({
        source_block_id: bi.sourceBlockId,
        source_block_name: bi.sourceBlockName,
        instance_name: bi.instanceName,
        notes: bi.notes,
        estimated_duration: bi.estimatedDuration,
        modified_exercises: bi.customizations?.modifiedExercises || [],
        added_exercises: bi.customizations?.addedExercises || [],
        removed_exercises: bi.customizations?.removedExercises || [],
        modified_groups: bi.customizations?.modifiedGroups || [],
        added_groups: bi.customizations?.addedGroups || [],
        removed_groups: bi.customizations?.removedGroups || [],
      })
    );

    // Call RPC function
    const { error } = await supabase.rpc("update_workout_plan_transaction", {
      p_plan_id: id,
      p_name: mergedWorkout.name,
      p_description: mergedWorkout.description,
      p_estimated_duration: mergedWorkout.estimatedDuration,
      p_target_group_id: mergedWorkout.targetGroupId || null,
      p_archived: mergedWorkout.archived || false,
      p_exercises: exercisesJson,
      p_groups: groupsJson,
      p_block_instances: blockInstancesJson,
    });

    if (error) {
      console.error("Error updating workout plan (transaction):", error);
      return null;
    }

    // Fetch and return the updated workout
    return await getWorkoutPlanById(id);
  } catch (error) {
    console.error("Error in updateWorkoutPlanTransaction:", error);
    return null;
  }
};

/**
 * @deprecated Use createWorkoutPlanTransaction instead
 *
 * This function does not provide transaction safety and may leave orphaned data
 * on failure (e.g., workout plan created but exercises fail to insert).
 *
 * **Will be removed in v1.1.0**
 *
 * Migration:
 * ```typescript
 * // Old (deprecated):
 * const workout = await createWorkoutPlan(data);
 *
 * // New (transaction-safe):
 * const workout = await createWorkoutPlanTransaction(data);
 * ```
 *
 * @see createWorkoutPlanTransaction for the recommended transaction-safe version
 */
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

  // 2. Insert groups first and create ID mapping (groups must be inserted before exercises)
  const groupIdMapping: Record<string, string> = {}; // Maps temporary IDs to database UUIDs

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

    const { data: insertedGroups, error: groupsError } = await supabase
      .from("workout_exercise_groups")
      .insert(groupsToInsert)
      .select();

    if (groupsError) {
      console.error("Error creating workout groups:", groupsError);
      // Continue anyway - plan was created
    } else if (insertedGroups) {
      // Map temporary group IDs to database UUIDs
      groups.forEach((group, index) => {
        if (insertedGroups[index]) {
          groupIdMapping[group.id] = insertedGroups[index].id;
        }
      });
    }
  }

  // 3. Insert exercises with corrected group IDs
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
      video_url: ex.videoUrl, // Save YouTube video URL
      order_index: ex.order,
      // Map temporary group ID to database UUID
      group_id:
        ex.groupId && groupIdMapping[ex.groupId]
          ? groupIdMapping[ex.groupId]
          : ex.groupId,
      block_instance_id: ex.blockInstanceId,
      substitution_reason: ex.substitutionReason,
      original_exercise: ex.originalExercise,
      progression_notes: ex.progressionNotes,
    }));

    const { data: insertedExercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(exercisesToInsert)
      .select("id");

    if (exercisesError) {
      console.error("Error creating workout exercises:", exercisesError);
      // Continue anyway - plan was created
    } else if (insertedExercises) {
      // 3a. Insert KPI tags for exercises that have them
      const kpiTagsToInsert: Array<{
        workout_exercise_id: string;
        kpi_tag_id: string;
      }> = [];

      exercises.forEach((ex, index) => {
        if (
          ex.kpiTagIds &&
          ex.kpiTagIds.length > 0 &&
          insertedExercises[index]
        ) {
          ex.kpiTagIds.forEach((kpiTagId) => {
            kpiTagsToInsert.push({
              workout_exercise_id: insertedExercises[index].id,
              kpi_tag_id: kpiTagId,
            });
          });
        }
      });

      if (kpiTagsToInsert.length > 0) {
        const { error: kpiTagsError } = await supabase
          .from("exercise_kpi_tags")
          .insert(kpiTagsToInsert);

        if (kpiTagsError) {
          console.error("Error creating exercise KPI tags:", kpiTagsError);
          // Continue anyway - exercises were created
        }
      }
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

/**
 * @deprecated Use updateWorkoutPlanTransaction instead
 *
 * This function does not provide transaction safety and may leave orphaned or
 * inconsistent data on failure (e.g., exercises deleted but new ones fail to insert).
 *
 * **Will be removed in v1.1.0**
 *
 * Migration:
 * ```typescript
 * // Old (deprecated):
 * const workout = await updateWorkoutPlan(id, updates);
 *
 * // New (transaction-safe):
 * const workout = await updateWorkoutPlanTransaction(id, updates);
 * ```
 *
 * @see updateWorkoutPlanTransaction for the recommended transaction-safe version
 */
export const updateWorkoutPlan = async (
  id: string,
  updates: Partial<WorkoutPlan> & {
    exercises?: Array<Record<string, unknown>>;
    groups?: Array<Record<string, unknown>>;
    blockInstances?: Array<Record<string, unknown>>;
  }
): Promise<WorkoutPlan | null> => {
  // [REMOVED] console.log("[database-service] updateWorkoutPlan called:", { id, updates });

  // Extract exercises, groups, and blockInstances from updates
  const { exercises, groups, blockInstances, ...basicUpdates } = updates;

  // Transform camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (basicUpdates.name !== undefined) dbUpdates.name = basicUpdates.name;
  if (basicUpdates.description !== undefined)
    dbUpdates.description = basicUpdates.description;
  if (basicUpdates.estimatedDuration !== undefined)
    dbUpdates.estimated_duration = basicUpdates.estimatedDuration;
  if (basicUpdates.targetGroupId !== undefined)
    dbUpdates.target_group_id = basicUpdates.targetGroupId;

  // Update basic workout plan fields
  const { data, error } = await supabase
    .from("workout_plans")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[database-service] Error updating workout plan:", error);
    console.error("[database-service] Attempted to update ID:", id);
    return null;
  }

  // If exercises, groups, or blockInstances are provided, update them
  if (exercises || groups || blockInstances) {
    // 1. Delete existing data
    if (exercises) {
      await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_plan_id", id);
    }

    if (groups) {
      await supabase
        .from("workout_exercise_groups")
        .delete()
        .eq("workout_plan_id", id);
    }

    if (blockInstances) {
      await supabase
        .from("workout_block_instances")
        .delete()
        .eq("workout_plan_id", id);
    }

    // 2. Insert groups first and create ID mapping
    const groupIdMapping: Record<string, string> = {};

    if (groups && groups.length > 0) {
      const groupsToInsert = groups.map((group: Record<string, unknown>) => ({
        workout_plan_id: id,
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

      const { data: insertedGroups, error: groupsError } = await supabase
        .from("workout_exercise_groups")
        .insert(groupsToInsert)
        .select();

      if (groupsError) {
        console.error("Error updating workout groups:", groupsError);
      } else if (insertedGroups) {
        // Map temporary group IDs to database UUIDs
        groups.forEach((group: Record<string, unknown>, index) => {
          if (insertedGroups[index]) {
            groupIdMapping[group.id as string] = insertedGroups[index].id;
          }
        });
      }
    }

    // 3. Insert exercises with corrected group IDs
    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map(
        (ex: Record<string, unknown>) => ({
          workout_plan_id: id,
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
          video_url: ex.videoUrl, // Save YouTube video URL
          order_index: ex.order,
          // Map temporary group ID to database UUID
          group_id:
            ex.groupId && groupIdMapping[ex.groupId as string]
              ? groupIdMapping[ex.groupId as string]
              : ex.groupId,
          block_instance_id: ex.blockInstanceId,
          substitution_reason: ex.substitutionReason,
          original_exercise: ex.originalExercise,
          progression_notes: ex.progressionNotes,
        })
      );

      const { data: insertedExercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesToInsert)
        .select("id");

      if (exercisesError) {
        console.error("Error updating workout exercises:", exercisesError);
      } else if (insertedExercises) {
        // 3a. Delete existing KPI tags for this workout's exercises (already deleted with exercises above)
        // 3b. Insert KPI tags for exercises that have them
        const kpiTagsToInsert: Array<{
          workout_exercise_id: string;
          kpi_tag_id: string;
        }> = [];

        exercises.forEach((ex: Record<string, unknown>, index) => {
          const kpiTagIds = ex.kpiTagIds as string[] | undefined;
          if (kpiTagIds && kpiTagIds.length > 0 && insertedExercises[index]) {
            kpiTagIds.forEach((kpiTagId) => {
              kpiTagsToInsert.push({
                workout_exercise_id: insertedExercises[index].id,
                kpi_tag_id: kpiTagId,
              });
            });
          }
        });

        if (kpiTagsToInsert.length > 0) {
          const { error: kpiTagsError } = await supabase
            .from("exercise_kpi_tags")
            .insert(kpiTagsToInsert);

          if (kpiTagsError) {
            console.error("Error updating exercise KPI tags:", kpiTagsError);
          }
        }
      }
    }

    // 4. Insert block instances
    if (blockInstances && blockInstances.length > 0) {
      const instancesToInsert = blockInstances.map(
        (instance: Record<string, unknown>) => {
          const customizations = instance.customizations as
            | Record<string, unknown>
            | undefined;
          return {
            workout_plan_id: id,
            source_block_id: instance.sourceBlockId,
            source_block_name: instance.sourceBlockName,
            instance_name: instance.instanceName,
            notes: instance.notes,
            estimated_duration: instance.estimatedDuration,
            modified_exercises: customizations?.modifiedExercises,
            added_exercises: customizations?.addedExercises,
            removed_exercises: customizations?.removedExercises,
            modified_groups: customizations?.modifiedGroups,
            added_groups: customizations?.addedGroups,
            removed_groups: customizations?.removedGroups,
          };
        }
      );

      const { error: instancesError } = await supabase
        .from("workout_block_instances")
        .insert(instancesToInsert);

      if (instancesError) {
        console.error("Error updating block instances:", instancesError);
      }
    }
  }

  // [REMOVED] console.log("[database-service] Successfully updated workout:", data);

  // Transform snake_case response back to camelCase
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    estimatedDuration: data.estimated_duration,
    targetGroupId: data.target_group_id,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    exercises: exercises || [],
    groups: groups || [],
    blockInstances: blockInstances || [],
  };
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
    .select(
      `
      *,
      workout_plans!inner(name, description),
      users!workout_assignments_assigned_by_fkey(email, full_name),
      athlete_groups(name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  // Transform snake_case to camelCase with joined data
  const assignments = (await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data || []).map(async (assignment: Record<string, any>) => {
      // Fetch athlete names for individual assignments (not group assignments)
      let athleteNames: string[] = [];

      // Only fetch names if this is NOT a group assignment (assigned_to_group_id is null)
      if (
        !assignment.assigned_to_group_id &&
        assignment.athlete_ids &&
        Array.isArray(assignment.athlete_ids) &&
        assignment.athlete_ids.length > 0
      ) {
        const { data: athletes } = await supabase
          .from("users")
          .select("first_name, last_name")
          .in("id", assignment.athlete_ids);

        if (athletes && athletes.length > 0) {
          athleteNames = athletes.map(
            (a: { first_name: string; last_name: string }) =>
              `${a.first_name.charAt(0)}. ${a.last_name}`
          );

          // Log to debug
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Fetched ${athleteNames.length} athlete names:`,
              athleteNames
            );
          }
        }
      }

      return {
        id: assignment.id as string,
        workoutPlanId: assignment.workout_plan_id as string,
        workoutPlanName:
          (assignment.workout_plans?.name as string) ||
          assignment.workout_plan_name ||
          undefined,
        assignedBy: assignment.assigned_by as string,
        athleteId: (assignment.assigned_to_user_id as string) || undefined,
        athleteNames: athleteNames.length > 0 ? athleteNames : undefined,
        groupId: (assignment.assigned_to_group_id as string) || undefined,
        athleteIds: (assignment.athlete_ids as string[]) || [],
        scheduledDate: parseDate(assignment.scheduled_date as string),
        assignedDate: parseDate(
          (assignment.assigned_date || assignment.created_at) as string
        ),
        assignmentType: ((assignment.assignment_type as string) ||
          "individual") as "individual" | "group",
        status:
          (assignment.status as string) ||
          (assignment.completed ? "completed" : "assigned"),
        modifications: (assignment.modifications as unknown[]) || [],
        startTime: (assignment.start_time as string) || undefined,
        endTime: (assignment.end_time as string) || undefined,
        location: (assignment.location as string) || undefined,
        notes: (assignment.notes as string) || undefined,
        createdAt: new Date(assignment.created_at as string),
        updatedAt: new Date(assignment.updated_at as string),
      };
    })
  )) as WorkoutAssignment[];

  // Validate first assignment in development
  if (process.env.NODE_ENV === "development" && assignments.length > 0) {
    logValidationResults(
      assignments[0],
      "workoutAssignment",
      "getAllAssignments"
    );
  }

  return assignments;
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

  // Transform snake_case to camelCase
  return {
    id: data.id,
    workoutPlanId: data.workout_plan_id,
    workoutPlanName: data.workout_plan_name || undefined,
    assignedBy: data.assigned_by,
    athleteId: data.assigned_to_user_id || undefined,
    groupId: data.assigned_to_group_id || undefined,
    athleteIds: data.athlete_ids || [],
    scheduledDate: data.scheduled_date,
    assignedDate: data.assigned_date || data.created_at,
    assignmentType: data.assignment_type || "individual",
    status: data.status || (data.completed ? "completed" : "assigned"),
    modifications: data.modifications || [],
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined,
    location: data.location || undefined,
    notes: data.notes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const createAssignment = async (
  assignmentData: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
): Promise<WorkoutAssignment | null> => {
  // Map camelCase to snake_case for database
  // Start with ONLY the columns that exist in the current schema
  const dbData: Record<string, unknown> = {
    workout_plan_id: assignmentData.workoutPlanId,
    assigned_by: assignmentData.assignedBy,
    assigned_to_user_id: assignmentData.athleteId || null,
    assigned_to_group_id: assignmentData.groupId || null,
    scheduled_date: assignmentData.scheduledDate,
    notes: assignmentData.notes || null,
    completed: assignmentData.status === "completed" || false,
  };

  // Try to add new fields - if they don't exist, they'll be ignored
  try {
    if (assignmentData.workoutPlanName)
      dbData.workout_plan_name = assignmentData.workoutPlanName;
    if (assignmentData.athleteIds)
      dbData.athlete_ids = assignmentData.athleteIds;
    if (assignmentData.assignedDate)
      dbData.assigned_date = assignmentData.assignedDate;
    if (assignmentData.assignmentType)
      dbData.assignment_type = assignmentData.assignmentType;
    if (assignmentData.status) dbData.status = assignmentData.status;
    if (assignmentData.modifications)
      dbData.modifications = assignmentData.modifications;
    if (assignmentData.startTime) dbData.start_time = assignmentData.startTime;
    if (assignmentData.endTime) dbData.end_time = assignmentData.endTime;
    if (assignmentData.location) dbData.location = assignmentData.location;
  } catch {
    // [REMOVED] console.log("Some optional fields not available in schema yet");
  }

  const { data, error } = await supabase
    .from("workout_assignments")
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error("[Assignment] Error creating assignment:", error);
    console.error(
      "[Assignment] Attempted data:",
      JSON.stringify(dbData, null, 2)
    );
    return null;
  }

  // Transform snake_case response to camelCase
  return {
    id: data.id,
    workoutPlanId: data.workout_plan_id,
    workoutPlanName: data.workout_plan_name || undefined,
    assignedBy: data.assigned_by,
    athleteId: data.assigned_to_user_id || undefined,
    groupId: data.assigned_to_group_id || undefined,
    athleteIds: data.athlete_ids || [],
    scheduledDate: data.scheduled_date,
    assignedDate: data.assigned_date || data.created_at,
    assignmentType: data.assignment_type || "individual",
    status: data.status || (data.completed ? "completed" : "assigned"),
    modifications: data.modifications || [],
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined,
    location: data.location || undefined,
    notes: data.notes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateAssignment = async (
  id: string,
  updates: Partial<WorkoutAssignment>
): Promise<WorkoutAssignment | null> => {
  // Transform camelCase to snake_case for database
  const dbUpdates = transformToSnake({ ...updates, updatedAt: new Date() });

  const { data, error } = await supabase
    .from("workout_assignments")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating assignment:", error);
    return null;
  }

  // Transform response back to camelCase
  return {
    id: data.id,
    workoutPlanId: data.workout_plan_id,
    workoutPlanName: data.workout_plan_name || undefined,
    assignedBy: data.assigned_by,
    athleteId: data.assigned_to_user_id || undefined,
    groupId: data.assigned_to_group_id || undefined,
    athleteIds: data.athlete_ids || [],
    scheduledDate: data.scheduled_date,
    assignedDate: data.assigned_date || data.created_at,
    assignmentType: data.assignment_type || "individual",
    status: data.status || (data.completed ? "completed" : "assigned"),
    modifications: data.modifications || [],
    startTime: data.start_time || undefined,
    endTime: data.end_time || undefined,
    location: data.location || undefined,
    notes: data.notes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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

  // Transform snake_case to camelCase
  return (data || []).map((group) => transformToCamel<AthleteGroup>(group));
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

  // Transform snake_case to camelCase
  return (data || []).map((assignment) => ({
    id: assignment.id,
    workoutPlanId: assignment.workout_plan_id,
    workoutPlanName: assignment.workout_plan_name || undefined,
    assignedBy: assignment.assigned_by,
    athleteId: assignment.assigned_to_user_id || undefined,
    groupId: assignment.assigned_to_group_id || undefined,
    athleteIds: assignment.athlete_ids || [],
    scheduledDate: assignment.scheduled_date,
    assignedDate: assignment.assigned_date || assignment.created_at,
    assignmentType: assignment.assignment_type || "individual",
    status:
      assignment.status || (assignment.completed ? "completed" : "assigned"),
    modifications: assignment.modifications || [],
    startTime: assignment.start_time || undefined,
    endTime: assignment.end_time || undefined,
    location: assignment.location || undefined,
    notes: assignment.notes || undefined,
    createdAt: assignment.created_at,
    updatedAt: assignment.updated_at,
  }));
};

export const getAssignmentsByGroup = async (
  groupId: string
): Promise<WorkoutAssignment[]> => {
  const { data, error } = await supabase
    .from("workout_assignments")
    .select("*")
    .eq("assigned_to_group_id", groupId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Error fetching group assignments:", error);
    return [];
  }

  // Transform snake_case to camelCase
  return (data || []).map((assignment) => ({
    id: assignment.id,
    workoutPlanId: assignment.workout_plan_id,
    workoutPlanName: assignment.workout_plan_name || undefined,
    assignedBy: assignment.assigned_by,
    athleteId: assignment.assigned_to_user_id || undefined,
    groupId: assignment.assigned_to_group_id || undefined,
    athleteIds: assignment.athlete_ids || [],
    scheduledDate: assignment.scheduled_date,
    assignedDate: assignment.assigned_date || assignment.created_at,
    assignmentType: assignment.assignment_type || "individual",
    status:
      assignment.status || (assignment.completed ? "completed" : "assigned"),
    modifications: assignment.modifications || [],
    startTime: assignment.start_time || undefined,
    endTime: assignment.end_time || undefined,
    location: assignment.location || undefined,
    notes: assignment.notes || undefined,
    createdAt: assignment.created_at,
    updatedAt: assignment.updated_at,
  }));
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
