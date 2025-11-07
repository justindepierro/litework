/**
 * Case Transformation Utilities
 * 
 * Handles conversion between snake_case (database) and camelCase (frontend)
 * with TypeScript validation to prevent field mapping errors.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase recursively
 */
export function transformToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformToCamel) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = transformToCamel(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}

/**
 * Transform object keys from camelCase to snake_case recursively
 */
export function transformToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformToSnake) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = transformToSnake(obj[key]);
      return acc;
    }, {} as any) as T;
  }

  return obj;
}

/**
 * Type-safe field mapper for common database tables
 */
export const DB_FIELD_MAPS = {
  users: {
    first_name: 'firstName',
    last_name: 'lastName',
    full_name: 'fullName',
    date_of_birth: 'dateOfBirth',
    injury_status: 'injuryStatus',
    personal_records: 'personalRecords',
    notification_preferences: 'notificationPreferences',
    group_ids: 'groupIds',
    coach_id: 'coachId',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  },
  athlete_groups: {
    coach_id: 'coachId',
    athlete_ids: 'athleteIds',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  },
  workout_plans: {
    estimated_duration: 'estimatedDuration',
    target_group_id: 'targetGroupId',
    created_by: 'createdBy',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  },
  workout_exercises: {
    workout_plan_id: 'workoutPlanId',
    exercise_id: 'exerciseId',
    exercise_name: 'exerciseName',
    weight_type: 'weightType',
    weight_max: 'weightMax',
    percentage_max: 'percentageMax',
    percentage_base_kpi: 'percentageBaseKPI',
    each_side: 'eachSide',
    rest_time: 'restTime',
    order_index: 'order',
    group_id: 'groupId',
    block_instance_id: 'blockInstanceId',
    substitution_reason: 'substitutionReason',
    original_exercise: 'originalExercise',
    progression_notes: 'progressionNotes',
  },
  workout_exercise_groups: {
    workout_plan_id: 'workoutPlanId',
    order_index: 'order',
    rest_between_rounds: 'restBetweenRounds',
    rest_between_exercises: 'restBetweenExercises',
    block_instance_id: 'blockInstanceId',
  },
  workout_assignments: {
    workout_plan_id: 'workoutPlanId',
    workout_plan_name: 'workoutPlanName',
    assigned_by: 'assignedBy',
    assigned_to_user_id: 'athleteId',
    assigned_to_group_id: 'groupId',
    athlete_ids: 'athleteIds',
    scheduled_date: 'scheduledDate',
    assigned_date: 'assignedDate',
    assignment_type: 'assignmentType',
    start_time: 'startTime',
    end_time: 'endTime',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  },
  athlete_kpis: {
    athlete_id: 'athleteId',
    exercise_id: 'exerciseId',
    exercise_name: 'exerciseName',
    current_pr: 'currentPR',
    date_achieved: 'dateAchieved',
    is_active: 'isActive',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  },
} as const;

/**
 * Validate that database response matches expected TypeScript type
 * Logs warnings for missing or unexpected fields
 */
export function validateDbResponse<T>(
  data: any,
  expectedFields: (keyof T)[],
  tableName: string
): void {
  if (!data || typeof data !== 'object') {
    return;
  }

  const dataKeys = Object.keys(data);
  const expectedKeys = expectedFields.map(String);

  // Check for missing expected fields
  const missingFields = expectedKeys.filter(key => !(key in data));
  if (missingFields.length > 0) {
    console.warn(
      `[${tableName}] Response missing expected fields:`,
      missingFields
    );
  }

  // Check for unexpected fields (might indicate schema changes)
  const unexpectedFields = dataKeys.filter(key => !expectedKeys.includes(key));
  if (unexpectedFields.length > 0) {
    console.info(
      `[${tableName}] Response contains unexpected fields (possible schema update):`,
      unexpectedFields
    );
  }
}

/**
 * Transform database date strings to Date objects
 */
export function transformDates<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of dateFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field] as string) as any;
    }
  }
  
  return result;
}

/**
 * Safe field mapping with fallback values
 */
export function mapField<T>(
  value: T | null | undefined,
  fallback: T
): T {
  return value ?? fallback;
}

/**
 * Build a type-safe transformer for a specific table
 */
export function createTransformer<TInput, TOutput>(
  fieldMap: Record<string, string>,
  dateFields: string[] = []
) {
  return (input: TInput): TOutput => {
    const result: any = {};
    
    for (const [dbKey, appKey] of Object.entries(fieldMap)) {
      const value = (input as any)[dbKey];
      
      if (dateFields.includes(appKey) && value) {
        result[appKey] = new Date(value);
      } else {
        result[appKey] = value;
      }
    }
    
    // Copy any fields not in the map (like 'id', 'name', etc.)
    for (const [key, value] of Object.entries(input as any)) {
      if (!fieldMap[key] && !(key in result)) {
        result[key] = value;
      }
    }
    
    return result as TOutput;
  };
}
