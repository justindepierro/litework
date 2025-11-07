// Session storage utilities for persisting workout sessions
import {
  WorkoutSession,
  SESSION_STORAGE_KEY,
  OFFLINE_QUEUE_KEY,
} from "@/types/session";

/**
 * Save active session to localStorage
 */
export function saveSession(session: WorkoutSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session to localStorage:", error);
  }
}

/**
 * Load active session from localStorage
 */
export function loadSession(): WorkoutSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as WorkoutSession;

    // Validate session is not too old (e.g., > 24 hours)
    const startedAt = new Date(session.started_at);
    const now = new Date();
    const hoursSinceStart =
      (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceStart > 24) {
      // Session is stale, clear it
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to load session from localStorage:", error);
    return null;
  }
}

/**
 * Clear active session from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session from localStorage:", error);
  }
}

/**
 * Update session in localStorage (for auto-save)
 */
export function updateStoredSession(updates: Partial<WorkoutSession>): void {
  try {
    const stored = loadSession();
    if (!stored) return;

    const updated = { ...stored, ...updates };
    saveSession(updated);
  } catch (error) {
    console.error("Failed to update stored session:", error);
  }
}

/**
 * Calculate total duration excluding paused time
 */
export function calculateSessionDuration(session: WorkoutSession): number {
  const start = new Date(session.started_at);
  const end = session.completed_at
    ? new Date(session.completed_at)
    : new Date();

  const duration = (end.getTime() - start.getTime()) / 1000; // seconds

  // TODO: Track pause durations and subtract them
  // For now, just return elapsed time

  return Math.floor(duration);
}

/**
 * Queue an API call for offline sync
 */
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: unknown;
  timestamp: string;
}

export function queueOfflineRequest(
  request: Omit<QueuedRequest, "id" | "timestamp">
): void {
  try {
    const queue = getOfflineQueue();
    const queuedRequest: QueuedRequest = {
      ...request,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    queue.push(queuedRequest);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to queue offline request:", error);
  }
}

/**
 * Get queued offline requests
 */
export function getOfflineQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get offline queue:", error);
    return [];
  }
}

/**
 * Remove a request from the offline queue
 */
export function removeFromQueue(requestId: string): void {
  try {
    const queue = getOfflineQueue();
    const filtered = queue.filter((req) => req.id !== requestId);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove from queue:", error);
  }
}

/**
 * Clear the entire offline queue
 */
export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error("Failed to clear offline queue:", error);
  }
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
