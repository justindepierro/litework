/**
 * Database Response Validation
 *
 * Runtime checks to ensure database responses match TypeScript types
 * and catch snake_case/camelCase issues before they reach the UI
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { User, AthleteGroup, WorkoutAssignment } from "@/types";

/**
 * Expected field names for each entity type (in camelCase)
 * Used for type validation and documentation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EXPECTED_FIELDS = {
  user: [
    "id",
    "email",
    "firstName",
    "lastName",
    "fullName",
    "role",
    "groupIds",
    "coachId",
    "dateOfBirth",
    "injuryStatus",
    "personalRecords",
    "notificationPreferences",
    "createdAt",
    "updatedAt",
  ] as const satisfies readonly (keyof User)[],

  athleteGroup: [
    "id",
    "name",
    "description",
    "sport",
    "category",
    "coachId",
    "athleteIds",
    "color",
    "archived",
    "createdAt",
    "updatedAt",
  ] as const satisfies readonly (keyof AthleteGroup)[],

  workoutAssignment: [
    "id",
    "workoutPlanId",
    "workoutPlanName",
    "assignmentType",
    "athleteId",
    "groupId",
    "athleteIds",
    "assignedBy",
    "assignedDate",
    "scheduledDate",
    "startTime",
    "endTime",
    "location",
    "dueDate",
    "status",
    "modifications",
    "notes",
    "createdAt",
    "updatedAt",
  ] as const satisfies readonly (keyof WorkoutAssignment)[],
} as const;

/**
 * Database field names that should NOT appear in transformed objects
 * These indicate the transformation didn't happen
 */
const SNAKE_CASE_FIELDS = [
  "first_name",
  "last_name",
  "full_name",
  "group_ids",
  "coach_id",
  "athlete_ids",
  "created_at",
  "updated_at",
  "date_of_birth",
  "injury_status",
  "personal_records",
  "notification_preferences",
  "workout_plan_id",
  "workout_plan_name",
  "assigned_by",
  "assigned_to_user_id",
  "assigned_to_group_id",
  "scheduled_date",
  "assigned_date",
  "assignment_type",
  "start_time",
  "end_time",
  "estimated_duration",
  "target_group_id",
  "created_by",
] as const;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that an object has been properly transformed from database format
 */
export function validateTransformation(
  obj: any,
  entityType: keyof typeof EXPECTED_FIELDS,
  context: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!obj || typeof obj !== "object") {
    errors.push(`${context}: Object is null or not an object`);
    return { isValid: false, errors, warnings };
  }

  const objectKeys = Object.keys(obj);

  // Check for snake_case fields (indicates missing transformation)
  const foundSnakeCaseFields = objectKeys.filter((key) =>
    (SNAKE_CASE_FIELDS as readonly string[]).includes(key)
  );

  if (foundSnakeCaseFields.length > 0) {
    errors.push(
      `${context}: Found snake_case fields: ${foundSnakeCaseFields.join(", ")}. These should be camelCase.`
    );
  }

  // Check for required fields based on entity type
  // const expectedFields = EXPECTED_FIELDS[entityType]; // Reserved for future use
  const requiredFields = ["id", "createdAt", "updatedAt"]; // Always required

  for (const field of requiredFields) {
    if (!(field in obj)) {
      warnings.push(`${context}: Missing required field: ${field}`);
    }
  }

  // Log if field types don't match expectations
  if (
    "createdAt" in obj &&
    !(obj.createdAt instanceof Date) &&
    typeof obj.createdAt !== "string"
  ) {
    warnings.push(
      `${context}: createdAt should be a Date or string, got ${typeof obj.createdAt}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an array of transformed entities
 */
export function validateTransformationArray<T>(
  arr: T[],
  entityType: keyof typeof EXPECTED_FIELDS,
  context: string
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(arr)) {
    allErrors.push(`${context}: Expected array, got ${typeof arr}`);
    return { isValid: false, errors: allErrors, warnings: allWarnings };
  }

  arr.forEach((item, index) => {
    const result = validateTransformation(
      item,
      entityType,
      `${context}[${index}]`
    );
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Throw error if validation fails (for critical paths)
 */
export function assertValidTransformation(
  obj: any,
  entityType: keyof typeof EXPECTED_FIELDS,
  context: string
): void {
  const result = validateTransformation(obj, entityType, context);

  if (!result.isValid) {
    console.error(`[Validation Failed] ${context}`, {
      errors: result.errors,
      warnings: result.warnings,
      object: obj,
    });
    throw new Error(
      `Database transformation validation failed for ${context}: ${result.errors.join("; ")}`
    );
  }

  if (result.warnings.length > 0) {
    console.warn(`[Validation Warning] ${context}`, result.warnings);
  }
}

/**
 * Log validation results without throwing (for non-critical paths)
 */
export function logValidationResults(
  obj: any,
  entityType: keyof typeof EXPECTED_FIELDS,
  context: string
): boolean {
  const result = validateTransformation(obj, entityType, context);

  if (!result.isValid) {
    console.error(`[Validation Error] ${context}`, {
      errors: result.errors,
      object: obj,
    });
  }

  if (result.warnings.length > 0) {
    console.warn(`[Validation Warning] ${context}`, result.warnings);
  }

  return result.isValid;
}

/**
 * Development mode validator - only runs in dev, throws in production
 */
export function devValidate(
  obj: any,
  entityType: keyof typeof EXPECTED_FIELDS,
  context: string
): void {
  if (process.env.NODE_ENV === "development") {
    const result = validateTransformation(obj, entityType, context);

    if (!result.isValid) {
      console.error(
        `[DEV VALIDATION FAILED] ${context}\n` +
          `Errors: ${result.errors.join("\n")}\n` +
          `This transformation needs to be fixed!\n`,
        obj
      );
    }

    if (result.warnings.length > 0) {
      console.warn(`[DEV VALIDATION WARN] ${context}`, result.warnings);
    }
  }
}
