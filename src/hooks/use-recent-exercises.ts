import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "litework_recent_exercises";
const MAX_RECENT_ITEMS = 10;

interface Exercise {
  id: string;
  name: string;
  category?: string;
  description?: string;
  video_url?: string;
}

/**
 * Hook to manage recently used exercises in localStorage
 * Maintains a list of the last 10 exercises selected by the user
 *
 * @returns {
 *   recentExercises: Exercise[] - Array of recent exercises (newest first)
 *   addRecentExercise: (exercise: Exercise) => void - Add exercise to recent list
 *   clearRecentExercises: () => void - Clear all recent exercises
 * }
 *
 * @example
 * const { recentExercises, addRecentExercise } = useRecentExercises();
 *
 * // Add exercise when user selects it
 * addRecentExercise(exercise);
 *
 * // Display recent exercises
 * {recentExercises.map(ex => <div key={ex.id}>{ex.name}</div>)}
 */
export function useRecentExercises() {
  const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);

  // Load recent exercises from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentExercises(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading recent exercises:", error);
    }
  }, []);

  // Add exercise to recent list
  const addRecentExercise = useCallback((exercise: Exercise) => {
    setRecentExercises((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((ex) => ex.id !== exercise.id);

      // Add to front of list
      const updated = [exercise, ...filtered];

      // Keep only MAX_RECENT_ITEMS
      const limited = updated.slice(0, MAX_RECENT_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error("Error saving recent exercises:", error);
      }

      return limited;
    });
  }, []);

  // Clear all recent exercises
  const clearRecentExercises = useCallback(() => {
    setRecentExercises([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing recent exercises:", error);
    }
  }, []);

  return {
    recentExercises,
    addRecentExercise,
    clearRecentExercises,
  };
}
