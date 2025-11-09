/**
 * Analytics Utility Functions
 * Shared logic for workout analytics calculations
 */

/**
 * Calculate the current workout streak for a user
 * A streak is the number of consecutive days with at least one workout
 *
 * @param completedDates - Array of Date objects or ISO date strings when workouts were completed
 * @returns Current streak count (number of consecutive days)
 *
 * @example
 * const dates = ["2025-11-08", "2025-11-07", "2025-11-06"];
 * const streak = calculateWorkoutStreak(dates); // Returns 3
 */
export function calculateWorkoutStreak(
  completedDates: (Date | string)[]
): number {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }

  // Convert all dates to midnight timestamps for consistent comparison
  const timestamps = completedDates.map((dateInput) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  // Remove duplicates and sort descending (most recent first)
  const uniqueDates = [...new Set(timestamps)].sort((a, b) => b - a);

  // Get today and yesterday timestamps
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

  // Streak must start with today or yesterday
  if (uniqueDates[0] !== todayTime && uniqueDates[0] !== yesterdayTime) {
    return 0;
  }

  // Count consecutive days
  let currentStreak = 1;
  let expectedDate = uniqueDates[0] - 24 * 60 * 60 * 1000;

  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === expectedDate) {
      currentStreak++;
      expectedDate -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  return currentStreak;
}

/**
 * Calculate both current and longest workout streaks
 * Used for more detailed analytics
 *
 * @param completedDates - Array of Date objects or ISO date strings
 * @param lookbackDays - How many days to analyze (default: 30)
 * @returns Object with currentStreak and longestStreak
 *
 * @example
 * const dates = ["2025-11-08", "2025-11-07", "2025-11-05", "2025-11-04"];
 * const streaks = calculateDetailedStreaks(dates);
 * // Returns { currentStreak: 2, longestStreak: 2 }
 */
export function calculateDetailedStreaks(
  completedDates: (Date | string)[],
  lookbackDays: number = 30
): { currentStreak: number; longestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Convert to date strings for comparison
  const workoutDates = completedDates.map((dateInput) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toDateString();
  });

  const uniqueWorkoutDates = [...new Set(workoutDates)];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();

  for (let i = 0; i < lookbackDays; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toDateString();

    if (uniqueWorkoutDates.includes(dateString)) {
      tempStreak++;
      // Current streak is the streak starting from today
      if (i === 0 || currentStreak > 0) {
        currentStreak = tempStreak;
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  // Final check for longest streak
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Calculate average workouts per week from completed dates
 *
 * @param completedDates - Array of Date objects or ISO date strings
 * @param periodDays - Period to analyze in days (default: 30)
 * @returns Average workouts per week
 */
export function calculateAvgWorkoutsPerWeek(
  completedDates: (Date | string)[],
  periodDays: number = 30
): number {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);

  const recentWorkouts = completedDates.filter((dateInput) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date >= cutoffDate;
  });

  const weeks = periodDays / 7;
  return parseFloat((recentWorkouts.length / weeks).toFixed(1));
}
