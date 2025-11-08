/**
 * Optimistic UI Utilities
 * Provides instant feedback for mutations before server response
 */

import { mutate } from "swr";

/**
 * Optimistic update options
 */
interface OptimisticUpdateOptions<T> {
  /**
   * SWR cache key to update
   */
  key: string | string[];
  /**
   * Function to optimistically update the data
   */
  updateFn: (currentData: T | undefined) => T;
  /**
   * Mutation function that performs the actual API call
   */
  mutationFn: () => Promise<unknown>;
  /**
   * Optional success callback
   */
  onSuccess?: (data: unknown) => void;
  /**
   * Optional error callback (reverts optimistic update)
   */
  onError?: (error: Error) => void;
  /**
   * Whether to revalidate after mutation completes (default: true)
   */
  revalidate?: boolean;
  /**
   * Rollback on error (default: true)
   */
  rollbackOnError?: boolean;
}

/**
 * Perform an optimistic update that instantly updates the UI before the server responds
 *
 * @example
 * await optimisticUpdate({
 *   key: '/api/workouts',
 *   updateFn: (workouts) => [...workouts, newWorkout],
 *   mutationFn: () => fetch('/api/workouts', { method: 'POST', body: JSON.stringify(newWorkout) })
 * });
 */
export async function optimisticUpdate<T>({
  key,
  updateFn,
  mutationFn,
  onSuccess,
  onError,
  revalidate = true,
  rollbackOnError = true,
}: OptimisticUpdateOptions<T>): Promise<void> {
  // Get current data for potential rollback
  const previousData = await mutate(key, undefined, { revalidate: false });

  try {
    // Optimistically update the cache
    await mutate(key, updateFn, { revalidate: false });

    // Perform the actual mutation
    const result = await mutationFn();

    // Revalidate to get server state
    if (revalidate) {
      await mutate(key);
    }

    // Call success callback
    if (onSuccess) {
      onSuccess(result);
    }
  } catch (error) {
    // Rollback on error
    if (rollbackOnError && previousData !== undefined) {
      await mutate(key, previousData, { revalidate: false });
    }

    // Call error callback
    if (onError && error instanceof Error) {
      onError(error);
    }

    throw error;
  }
}

/**
 * Helper for optimistically adding an item to a list
 */
export function optimisticAdd<T>(
  key: string,
  newItem: T,
  mutationFn: () => Promise<unknown>,
  options?: Partial<OptimisticUpdateOptions<T[]>>
) {
  return optimisticUpdate({
    key,
    updateFn: (currentData: T[] | undefined) => [
      ...(currentData || []),
      newItem,
    ],
    mutationFn,
    ...options,
  });
}

/**
 * Helper for optimistically updating an item in a list
 */
export function optimisticUpdateItem<T extends { id: string }>(
  key: string,
  itemId: string,
  updates: Partial<T>,
  mutationFn: () => Promise<unknown>,
  options?: Partial<OptimisticUpdateOptions<T[]>>
) {
  return optimisticUpdate({
    key,
    updateFn: (currentData: T[] | undefined) =>
      (currentData || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    mutationFn,
    ...options,
  });
}

/**
 * Helper for optimistically removing an item from a list
 */
export function optimisticRemove<T extends { id: string }>(
  key: string,
  itemId: string,
  mutationFn: () => Promise<unknown>,
  options?: Partial<OptimisticUpdateOptions<T[]>>
) {
  return optimisticUpdate({
    key,
    updateFn: (currentData: T[] | undefined) =>
      (currentData || []).filter((item) => item.id !== itemId),
    mutationFn,
    ...options,
  });
}

/**
 * Optimistic workout save
 */
export function optimisticWorkoutSave<T extends { id: string }>(
  workout: T,
  mutationFn: () => Promise<unknown>
) {
  return optimisticUpdateItem(
    "/api/workouts",
    workout.id,
    workout,
    mutationFn,
    {
      onSuccess: () => {
        // Invalidate related caches
        mutate("/api/assignments");
        mutate("/api/analytics/dashboard-stats");
      },
    }
  );
}

/**
 * Optimistic set completion
 */
export function optimisticSetComplete<T extends Record<string, unknown>>(
  sessionId: string,
  setData: T,
  mutationFn: () => Promise<unknown>
) {
  return optimisticUpdate({
    key: `/api/sessions/${sessionId}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFn: (session: any) => ({
      ...session,
      sets: [...(session?.sets || []), setData],
      updatedAt: new Date().toISOString(),
    }),
    mutationFn,
    onSuccess: () => {
      // Invalidate progress caches
      mutate("/api/progress");
      mutate("/api/analytics/dashboard-stats");
    },
  });
}

/**
 * Optimistic assignment status update
 */
export function optimisticAssignmentStatus(
  assignmentId: string,
  status: "pending" | "in_progress" | "completed" | "skipped",
  mutationFn: () => Promise<unknown>
) {
  return optimisticUpdateItem<{ id: string; status: string }>(
    "/api/assignments",
    assignmentId,
    { status },
    mutationFn
  );
}

/**
 * Optimistic group member add
 */
export function optimisticGroupMemberAdd(
  groupId: string,
  athleteId: string,
  mutationFn: () => Promise<unknown>
) {
  return optimisticUpdate({
    key: `/api/groups/members?groupId=${groupId}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFn: (members: any[] | undefined) => [
      ...(members || []),
      { id: athleteId, addedAt: new Date().toISOString() },
    ],
    mutationFn,
  });
}

/**
 * Batch optimistic updates
 * For operations that affect multiple caches
 */
export async function batchOptimisticUpdates(
  updates: Array<{
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  }>,
  mutationFn: () => Promise<unknown>,
  options?: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  // Save all previous data for rollback
  const previousData = await Promise.all(
    updates.map((update) => mutate(update.key, undefined, { revalidate: false }))
  );

  try {
    // Apply all optimistic updates
    await Promise.all(
      updates.map((update) =>
        mutate(update.key, update.data, { revalidate: false })
      )
    );

    // Perform the mutation
    await mutationFn();

    // Revalidate all keys
    await Promise.all(updates.map((update) => mutate(update.key)));

    if (options?.onSuccess) {
      options.onSuccess();
    }
  } catch (error) {
    // Rollback all updates
    await Promise.all(
      updates.map((update, index) =>
        mutate(update.key, previousData[index], { revalidate: false })
      )
    );

    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }

    throw error;
  }
}

/**
 * Create a debounced optimistic update
 * Useful for search inputs, filters, etc.
 */
export function createDebouncedOptimistic<T>(
  options: OptimisticUpdateOptions<T>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<void>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          await optimisticUpdate(options);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}
