/**
 * useAsyncState Hook
 * 
 * Manages async operation state (loading, error, data) with consistent patterns.
 * Eliminates boilerplate in 30+ components that manage loading/error states manually.
 * 
 * @example Basic usage
 * ```typescript
 * const { data, isLoading, error, execute } = useAsyncState<Exercise[]>();
 * 
 * const fetchExercises = () => execute(async () => {
 *   const response = await fetch('/api/exercises');
 *   return response.json();
 * });
 * ```
 * 
 * @example With error handling
 * ```typescript
 * const { data, isLoading, error, execute, reset } = useAsyncState<Workout>();
 * 
 * useEffect(() => {
 *   execute(async () => {
 *     const response = await fetch(`/api/workouts/${id}`);
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *   }).catch(() => {
 *     // Error already set in state
 *   });
 * }, [id]);
 * ```
 */

"use client";

import { useState, useCallback } from "react";

export interface UseAsyncStateReturn<T> {
  /** The data returned from the async operation */
  data: T | null;
  /** Whether the async operation is currently running */
  isLoading: boolean;
  /** Error message if the operation failed */
  error: string | null;
  /** Execute an async operation and manage its state */
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  /** Reset all state to initial values */
  reset: () => void;
  /** Manually set the error state */
  setError: (error: string | null) => void;
  /** Manually set the data state */
  setData: (data: T | null) => void;
  /** Manually set the loading state */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Hook to manage async operation state (loading, error, data)
 * 
 * Provides consistent error handling and loading state management
 * across all components that perform async operations.
 * 
 * @template T - The type of data returned by the async operation
 * @returns Object with data, loading state, error state, and control functions
 */
export function useAsyncState<T = unknown>(): UseAsyncStateReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute an async function and manage loading/error/data state
   * 
   * @param asyncFn - Async function to execute
   * @returns Promise that resolves to the data or null on error
   */
  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setError,
    setData,
    setIsLoading,
  };
}

/**
 * Hook variant with initial data
 * Useful when you have default/cached data to start with
 */
export function useAsyncStateWithInitial<T>(initialData: T): UseAsyncStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setError,
    setData,
    setIsLoading,
  };
}
