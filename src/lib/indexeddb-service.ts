/**
 * IndexedDB Service for Offline Data Storage
 *
 * Provides CRUD operations for sessions, exercises, sets, and sync queue.
 * Handles offline data persistence and sync queue management.
 */

import {
  initializeDB,
  getTransaction,
  STORES,
  IDBSession,
  IDBExercise,
  IDBSetRecord,
  IDBSyncQueueItem,
} from "./indexeddb-schema";

// Re-export types for use in other modules
export type { IDBSession, IDBExercise, IDBSetRecord, IDBSyncQueueItem };

// ==================== SESSION OPERATIONS ====================

/**
 * Save a session to IndexedDB
 */
export async function saveSession(session: IDBSession): Promise<void> {
  const { store } = await getTransaction(STORES.SESSIONS, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.put({
      ...session,
      updated_at: new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save session"));
  });
}

/**
 * Get a session from IndexedDB by ID
 */
export async function getSession(
  sessionId: string
): Promise<IDBSession | null> {
  const { store } = await getTransaction(STORES.SESSIONS, "readonly");

  return new Promise((resolve, reject) => {
    const request = store.get(sessionId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Failed to get session"));
  });
}

/**
 * Get all sessions for an athlete
 */
export async function getSessionsByAthlete(
  athleteId: string
): Promise<IDBSession[]> {
  const { store } = await getTransaction(STORES.SESSIONS, "readonly");
  const index = store.index("athlete_id");

  return new Promise((resolve, reject) => {
    const request = index.getAll(athleteId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Failed to get sessions"));
  });
}

/**
 * Get unsynced sessions
 */
export async function getUnsyncedSessions(): Promise<IDBSession[]> {
  const { store } = await getTransaction(STORES.SESSIONS, "readonly");
  const index = store.index("synced");

  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    const results: IDBSession[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
        .result;
      if (cursor) {
        if (cursor.value.synced === false) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () =>
      reject(new Error("Failed to get unsynced sessions"));
  });
}

/**
 * Delete a session from IndexedDB
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const { store } = await getTransaction(STORES.SESSIONS, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.delete(sessionId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete session"));
  });
}

// ==================== EXERCISE OPERATIONS ====================

/**
 * Save an exercise to IndexedDB
 */
export async function saveExercise(exercise: IDBExercise): Promise<void> {
  const { store } = await getTransaction(STORES.EXERCISES, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.put(exercise);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save exercise"));
  });
}

/**
 * Save multiple exercises to IndexedDB
 */
export async function saveExercises(exercises: IDBExercise[]): Promise<void> {
  const { store, transaction } = await getTransaction(
    STORES.EXERCISES,
    "readwrite"
  );

  return new Promise((resolve, reject) => {
    exercises.forEach((exercise) => {
      store.put(exercise);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Failed to save exercises"));
  });
}

/**
 * Get exercises for a session
 */
export async function getExercisesBySession(
  sessionId: string
): Promise<IDBExercise[]> {
  const { store } = await getTransaction(STORES.EXERCISES, "readonly");
  const index = store.index("session_id");

  return new Promise((resolve, reject) => {
    const request = index.getAll(sessionId);

    request.onsuccess = () => {
      const exercises = request.result || [];
      // Sort by order_index
      exercises.sort((a, b) => a.order_index - b.order_index);
      resolve(exercises);
    };
    request.onerror = () => reject(new Error("Failed to get exercises"));
  });
}

// ==================== SET OPERATIONS ====================

/**
 * Save a set record to IndexedDB
 */
export async function saveSet(set: IDBSetRecord): Promise<void> {
  const { store } = await getTransaction(STORES.SETS, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.put({
      ...set,
      created_at: set.created_at || new Date().toISOString(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to save set"));
  });
}

/**
 * Get sets for a session
 */
export async function getSetsBySession(
  sessionId: string
): Promise<IDBSetRecord[]> {
  const { store } = await getTransaction(STORES.SETS, "readonly");
  const index = store.index("session_id");

  return new Promise((resolve, reject) => {
    const request = index.getAll(sessionId);

    request.onsuccess = () => {
      const sets = request.result || [];
      // Sort by completed_at
      sets.sort((a, b) => a.completed_at.localeCompare(b.completed_at));
      resolve(sets);
    };
    request.onerror = () => reject(new Error("Failed to get sets"));
  });
}

/**
 * Get sets for a specific exercise
 */
export async function getSetsByExercise(
  sessionExerciseId: string
): Promise<IDBSetRecord[]> {
  const { store } = await getTransaction(STORES.SETS, "readonly");
  const index = store.index("session_exercise_id");

  return new Promise((resolve, reject) => {
    const request = index.getAll(sessionExerciseId);

    request.onsuccess = () => {
      const sets = request.result || [];
      // Sort by set_number
      sets.sort((a, b) => a.set_number - b.set_number);
      resolve(sets);
    };
    request.onerror = () => reject(new Error("Failed to get sets"));
  });
}

/**
 * Get unsynced sets
 */
export async function getUnsyncedSets(): Promise<IDBSetRecord[]> {
  const { store } = await getTransaction(STORES.SETS, "readonly");
  const index = store.index("synced");

  return new Promise((resolve, reject) => {
    const request = index.openCursor();
    const results: IDBSetRecord[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>)
        .result;
      if (cursor) {
        if (cursor.value.synced === false) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(new Error("Failed to get unsynced sets"));
  });
}

// ==================== SYNC QUEUE OPERATIONS ====================

/**
 * Add an operation to the sync queue
 */
export async function addToSyncQueue(
  item: Omit<
    IDBSyncQueueItem,
    "id" | "created_at" | "attempts" | "last_attempt" | "error"
  >
): Promise<void> {
  const { store } = await getTransaction(STORES.SYNC_QUEUE, "readwrite");

  const queueItem: IDBSyncQueueItem = {
    ...item,
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    attempts: 0,
    last_attempt: null,
    error: null,
  };

  return new Promise((resolve, reject) => {
    const request = store.put(queueItem);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to add to sync queue"));
  });
}

/**
 * Get all pending sync queue items
 */
export async function getSyncQueue(): Promise<IDBSyncQueueItem[]> {
  const { store } = await getTransaction(STORES.SYNC_QUEUE, "readonly");

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result || [];
      // Sort by created_at
      items.sort((a, b) => a.created_at.localeCompare(b.created_at));
      resolve(items);
    };
    request.onerror = () => reject(new Error("Failed to get sync queue"));
  });
}

/**
 * Update a sync queue item (for retry attempts)
 */
export async function updateSyncQueueItem(
  id: string,
  updates: Partial<IDBSyncQueueItem>
): Promise<void> {
  const { store } = await getTransaction(STORES.SYNC_QUEUE, "readwrite");

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (!item) {
        reject(new Error("Sync queue item not found"));
        return;
      }

      const updatedItem = { ...item, ...updates };
      const putRequest = store.put(updatedItem);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () =>
        reject(new Error("Failed to update sync queue item"));
    };

    getRequest.onerror = () =>
      reject(new Error("Failed to get sync queue item"));
  });
}

/**
 * Remove an item from the sync queue
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  const { store } = await getTransaction(STORES.SYNC_QUEUE, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error("Failed to remove sync queue item"));
  });
}

/**
 * Clear all data from IndexedDB (for logout/reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await initializeDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [STORES.SESSIONS, STORES.EXERCISES, STORES.SETS, STORES.SYNC_QUEUE],
      "readwrite"
    );

    transaction.objectStore(STORES.SESSIONS).clear();
    transaction.objectStore(STORES.EXERCISES).clear();
    transaction.objectStore(STORES.SETS).clear();
    transaction.objectStore(STORES.SYNC_QUEUE).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Failed to clear data"));
  });
}
