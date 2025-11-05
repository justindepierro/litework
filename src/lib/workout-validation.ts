/**
 * Workout Validation Utilities
 * 
 * Client-side validation for workout data to provide instant feedback
 * and reduce unnecessary API calls. Validates structure, required fields,
 * and business logic constraints.
 */

import { WorkoutPlan, WorkoutExercise, ExerciseGroup } from "@/types";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a complete workout plan
 */
export function validateWorkout(workout: Partial<WorkoutPlan>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!workout.name || workout.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Workout name is required",
      severity: "error",
    });
  }

  if (workout.name && workout.name.trim().length < 3) {
    warnings.push({
      field: "name",
      message: "Workout name should be at least 3 characters",
      severity: "warning",
    });
  }

  if (workout.name && workout.name.length > 100) {
    errors.push({
      field: "name",
      message: "Workout name must be 100 characters or less",
      severity: "error",
    });
  }

  // Exercises validation
  if (!workout.exercises || workout.exercises.length === 0) {
    errors.push({
      field: "exercises",
      message: "At least one exercise is required",
      severity: "error",
    });
  } else {
    // Validate each exercise
    workout.exercises.forEach((exercise, index) => {
      const exerciseErrors = validateExercise(exercise, index);
      errors.push(...exerciseErrors.errors);
      warnings.push(...exerciseErrors.warnings);
    });
  }

  // Estimated duration validation
  if (workout.estimatedDuration !== undefined) {
    if (workout.estimatedDuration < 5) {
      warnings.push({
        field: "estimatedDuration",
        message: "Workout duration seems very short (less than 5 minutes)",
        severity: "warning",
      });
    }
    if (workout.estimatedDuration > 180) {
      warnings.push({
        field: "estimatedDuration",
        message: "Workout duration seems very long (over 3 hours)",
        severity: "warning",
      });
    }
  }

  // Groups validation
  if (workout.groups && workout.groups.length > 0) {
    workout.groups.forEach((group, index) => {
      const groupErrors = validateGroup(group, index, workout.exercises || []);
      errors.push(...groupErrors.errors);
      warnings.push(...groupErrors.warnings);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single exercise
 */
export function validateExercise(
  exercise: WorkoutExercise,
  index: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const position = index + 1;

  // Exercise name
  if (!exercise.exerciseName || exercise.exerciseName.trim().length === 0) {
    errors.push({
      field: `exercises[${index}].exerciseName`,
      message: `Exercise ${position}: Name is required`,
      severity: "error",
    });
  }

  // Sets validation
  if (exercise.sets === undefined || exercise.sets === null) {
    errors.push({
      field: `exercises[${index}].sets`,
      message: `Exercise ${position}: Number of sets is required`,
      severity: "error",
    });
  } else if (exercise.sets < 1) {
    errors.push({
      field: `exercises[${index}].sets`,
      message: `Exercise ${position}: Must have at least 1 set`,
      severity: "error",
    });
  } else if (exercise.sets > 20) {
    warnings.push({
      field: `exercises[${index}].sets`,
      message: `Exercise ${position}: ${exercise.sets} sets is unusually high`,
      severity: "warning",
    });
  }

  // Reps validation
  if (exercise.reps) {
    const repsNum = typeof exercise.reps === "string" ? parseInt(exercise.reps) : exercise.reps;
    
    if (isNaN(repsNum)) {
      // Allow rep ranges like "8-12" or "AMRAP"
      const repsStr = String(exercise.reps);
      if (!repsStr.match(/^\d+-\d+$|^AMRAP$/i)) {
        warnings.push({
          field: `exercises[${index}].reps`,
          message: `Exercise ${position}: Reps format unclear. Use numbers, ranges (8-12), or AMRAP`,
          severity: "warning",
        });
      }
    } else {
      if (repsNum < 1) {
        errors.push({
          field: `exercises[${index}].reps`,
          message: `Exercise ${position}: Must have at least 1 rep`,
          severity: "error",
        });
      } else if (repsNum > 100) {
        warnings.push({
          field: `exercises[${index}].reps`,
          message: `Exercise ${position}: ${repsNum} reps is unusually high`,
          severity: "warning",
        });
      }
    }
  }

  // Weight validation
  if (exercise.weightType === "fixed" && exercise.weight !== undefined) {
    if (exercise.weight < 0) {
      errors.push({
        field: `exercises[${index}].weight`,
        message: `Exercise ${position}: Weight cannot be negative`,
        severity: "error",
      });
    }
    if (exercise.weight > 1000) {
      warnings.push({
        field: `exercises[${index}].weight`,
        message: `Exercise ${position}: ${exercise.weight} lbs is extremely heavy`,
        severity: "warning",
      });
    }
  }

  // Percentage validation
  if (exercise.weightType === "percentage" && exercise.percentage !== undefined) {
    if (exercise.percentage < 0 || exercise.percentage > 200) {
      errors.push({
        field: `exercises[${index}].percentage`,
        message: `Exercise ${position}: Percentage must be between 0-200%`,
        severity: "error",
      });
    }
    
    // Check for percentage base KPI
    if (!exercise.percentageBaseKPI) {
      warnings.push({
        field: `exercises[${index}].percentageBaseKPI`,
        message: `Exercise ${position}: Percentage-based weight needs a base KPI (e.g., "1RM Squat")`,
        severity: "warning",
      });
    }
  }

  // Tempo validation
  if (exercise.tempo) {
    // Tempo format should be like "3-1-2-0" (eccentric-pause-concentric-pause)
    const tempoPattern = /^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}$/;
    if (!tempoPattern.test(exercise.tempo)) {
      warnings.push({
        field: `exercises[${index}].tempo`,
        message: `Exercise ${position}: Tempo format should be "eccentric-pause-concentric-pause" (e.g., "3-1-2-0")`,
        severity: "warning",
      });
    }
  }

  // Rest time validation
  if (exercise.restTime !== undefined && exercise.restTime !== null) {
    if (exercise.restTime < 0) {
      errors.push({
        field: `exercises[${index}].restTime`,
        message: `Exercise ${position}: Rest time cannot be negative`,
        severity: "error",
      });
    }
    if (exercise.restTime > 600) {
      warnings.push({
        field: `exercises[${index}].restTime`,
        message: `Exercise ${position}: ${exercise.restTime} seconds rest is unusually long (over 10 minutes)`,
        severity: "warning",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate an exercise group (superset, circuit, etc.)
 */
export function validateGroup(
  group: ExerciseGroup,
  index: number,
  allExercises: WorkoutExercise[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const position = index + 1;

  // Group name
  if (!group.name || group.name.trim().length === 0) {
    warnings.push({
      field: `groups[${index}].name`,
      message: `Group ${position}: Name is recommended for clarity`,
      severity: "warning",
    });
  }

  // Group type
  const validTypes = ["superset", "circuit", "section"];
  if (!group.type || !validTypes.includes(group.type)) {
    errors.push({
      field: `groups[${index}].type`,
      message: `Group ${position}: Type must be one of: ${validTypes.join(", ")}`,
      severity: "error",
    });
  }

  // Check that group has exercises
  const groupExercises = allExercises.filter((ex) => ex.groupId === group.id);
  
  if (groupExercises.length === 0) {
    warnings.push({
      field: `groups[${index}].exercises`,
      message: `Group ${position} "${group.name}": Has no exercises assigned`,
      severity: "warning",
    });
  }

  // Superset-specific validation
  if (group.type === "superset") {
    if (groupExercises.length < 2) {
      warnings.push({
        field: `groups[${index}].exercises`,
        message: `Group ${position} "${group.name}": Supersets typically have 2-4 exercises`,
        severity: "warning",
      });
    }
    if (groupExercises.length > 4) {
      warnings.push({
        field: `groups[${index}].exercises`,
        message: `Group ${position} "${group.name}": ${groupExercises.length} exercises is more like a circuit than a superset`,
        severity: "warning",
      });
    }
  }

  // Circuit-specific validation
  if (group.type === "circuit") {
    if (groupExercises.length < 3) {
      warnings.push({
        field: `groups[${index}].exercises`,
        message: `Group ${position} "${group.name}": Circuits typically have 3+ exercises`,
        severity: "warning",
      });
    }

    if (group.rounds !== undefined && group.rounds < 1) {
      errors.push({
        field: `groups[${index}].rounds`,
        message: `Group ${position} "${group.name}": Must have at least 1 round`,
        severity: "error",
      });
    }
  }

  // Rest time validation
  if (group.restBetweenRounds !== undefined && group.restBetweenRounds < 0) {
    errors.push({
      field: `groups[${index}].restBetweenRounds`,
      message: `Group ${position} "${group.name}": Rest between rounds cannot be negative`,
      severity: "error",
    });
  }

  if (group.restBetweenExercises !== undefined && group.restBetweenExercises < 0) {
    errors.push({
      field: `groups[${index}].restBetweenExercises`,
      message: `Group ${position} "${group.name}": Rest between exercises cannot be negative`,
      severity: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Quick validation - just check if workout is saveable
 */
export function canSaveWorkout(workout: Partial<WorkoutPlan>): boolean {
  // Must have a name with at least 3 characters
  if (!workout.name || workout.name.trim().length < 3) {
    return false;
  }

  // Must have at least one exercise
  if (!workout.exercises || workout.exercises.length === 0) {
    return false;
  }

  // Check each exercise has minimum required fields
  return workout.exercises.every((ex) => {
    // Must have exercise name
    if (!ex.exerciseName || ex.exerciseName.trim().length === 0) {
      return false;
    }

    // Must have sets (greater than 0)
    if (ex.sets === undefined || ex.sets === null || ex.sets < 1) {
      return false;
    }

    // Reps are optional (some exercises use time, AMRAP, etc.)
    // So we don't validate reps here

    return true;
  });
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push("Errors:");
    result.errors.forEach((error) => {
      messages.push(`  • ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    if (messages.length > 0) messages.push("");
    messages.push("Warnings:");
    result.warnings.forEach((warning) => {
      messages.push(`  • ${warning.message}`);
    });
  }

  return messages.join("\n");
}

/**
 * Get only critical errors (blocking save)
 */
export function getCriticalErrors(result: ValidationResult): ValidationError[] {
  return result.errors;
}

/**
 * Check if workout meets minimum requirements for saving
 */
export function getMinimumRequirements(workout: Partial<WorkoutPlan>): string[] {
  const missing: string[] = [];

  if (!workout.name || workout.name.trim().length === 0) {
    missing.push("Workout name");
  }

  if (!workout.exercises || workout.exercises.length === 0) {
    missing.push("At least one exercise");
  } else {
    const invalidExercises = workout.exercises.filter(
      (ex) =>
        !ex.exerciseName ||
        ex.sets === undefined ||
        ex.sets < 1
    );
    
    if (invalidExercises.length > 0) {
      missing.push(`${invalidExercises.length} exercise(s) missing name or sets`);
    }
  }

  return missing;
}
