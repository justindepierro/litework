/**
 * Date Utility Functions
 *
 * Centralized date handling to avoid timezone issues with PostgreSQL DATE columns.
 *
 * CRITICAL CONTEXT:
 * - PostgreSQL DATE columns store dates as YYYY-MM-DD strings (no time, no timezone)
 * - JavaScript new Date("2025-11-06") interprets as midnight UTC
 * - For EST (UTC-5), midnight UTC is 7pm on the PREVIOUS day
 * - This causes dates to shift by one day when displayed
 *
 * SOLUTION:
 * - Parse DATE strings in local timezone using Date constructor
 * - Use new Date(year, month-1, day) for date-only strings
 * - Use new Date(isoString) for timestamps with time
 */

/**
 * Parse a PostgreSQL DATE string (YYYY-MM-DD) in local timezone
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone at midnight
 *
 * @example
 * // Database has: "2025-11-06"
 * // Wrong: new Date("2025-11-06") → Nov 5 at 7pm EST
 * // Right: parseLocalDate("2025-11-06") → Nov 6 at 12am EST
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
}

/**
 * Format a Date object as YYYY-MM-DD for PostgreSQL DATE columns
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * formatDateOnly(new Date(2025, 10, 6)) → "2025-11-06"
 */
export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if a string is a date-only format (YYYY-MM-DD)
 *
 * @param str - String to check
 * @returns True if string matches YYYY-MM-DD format
 */
export function isDateOnlyString(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}

/**
 * Parse any date string or Date object safely
 *
 * Automatically detects if it's a DATE (YYYY-MM-DD) or TIMESTAMP (ISO string)
 * and parses accordingly to avoid timezone shifts.
 *
 * @param value - Date string or Date object
 * @returns Date object parsed correctly
 *
 * @example
 * parseDate("2025-11-06") → Nov 6 at 12am local
 * parseDate("2025-11-06T12:00:00Z") → Nov 6 at correct time for timezone
 */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  if (isDateOnlyString(value)) {
    return parseLocalDate(value);
  }

  return new Date(value);
}

/**
 * Format a Date object as ISO timestamp for PostgreSQL TIMESTAMP columns
 *
 * @param date - Date object to format
 * @returns ISO 8601 timestamp string
 *
 * @example
 * formatTimestamp(new Date()) → "2025-11-06T17:30:00.000Z"
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Check if two dates are the same day (ignoring time)
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the start of day (midnight) for a date
 *
 * @param date - Date to get start of day for
 * @returns New Date object at midnight
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of day (23:59:59.999) for a date
 *
 * @param date - Date to get end of day for
 * @returns New Date object at end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is in the past (before today)
 *
 * @param date - Date to check
 * @returns True if date is before today
 */
export function isPast(date: Date): boolean {
  return startOfDay(date) < startOfDay(new Date());
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is in the future (after today)
 *
 * @param date - Date to check
 * @returns True if date is after today
 */
export function isFuture(date: Date): boolean {
  return startOfDay(date) > startOfDay(new Date());
}

/**
 * Format a time string from 24-hour to 12-hour format
 *
 * @param timeStr - Time string in HH:MM:SS or HH:MM format (24-hour)
 * @returns Time string in 12-hour format with AM/PM
 *
 * @example
 * formatTime12Hour("16:30:00") → "4:30 PM"
 * formatTime12Hour("09:15:00") → "9:15 AM"
 * formatTime12Hour("00:00:00") → "12:00 AM"
 */
export function formatTime12Hour(timeStr: string): string {
  if (!timeStr) return "";

  const [hours24, minutes] = timeStr.split(":").map(Number);
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Format a time range from 24-hour to 12-hour format
 *
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @returns Formatted time range string
 *
 * @example
 * formatTimeRange("16:30:00", "17:00:00") → "4:30 PM - 5:00 PM"
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "";
  return `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`;
}
