/**
 * IndexedDB Schema for Offline Workout Data
 *
 * Database: LiteWorkDB
 * Version: 1
 *
 * Stores:
 * - sessions: Workout sessions with metadata
 * - exercises: Session exercises with targets
 * - sets: Completed set records
 * - sync_queue: Pending API operations to sync
 */

export interface IDBSession {
  id: string;
  workout_plan_id: string;
  assignment_id: string | null;
  athlete_id: string;
  workout_name: string;
  status: "active" | "paused" | "completed" | "abandoned";
  started_at: string;
  paused_at: string | null;
  completed_at: string | null;
  total_duration_seconds: number;
  current_exercise_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface IDBExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  weight_type: string;
  rest_time: number;
  notes: string | null;
  is_completed: boolean;
  sets_completed: number;
  created_at: string;
  synced: boolean;
}

export interface IDBSetRecord {
  id: string;
  session_id: string;
  session_exercise_id: string;
  set_number: number;
  reps_completed: number;
  weight_used: number | null;
  rpe: number | null;
  notes: string | null;
  completed_at: string;
  created_at: string;
  synced: boolean;
}

export interface IDBSyncQueueItem {
  id: string;
  operation_type: "create" | "update" | "delete";
  entity_type: "session" | "set" | "exercise";
  entity_id: string;
  payload: Record<string, unknown> | null;
  created_at: string;
  attempts: number;
  last_attempt: string | null;
  error: string | null;
}

// IndexedDB database name and version
export const DB_NAME = "LiteWorkDB";
export const DB_VERSION = 1;

// Store names
export const STORES = {
  SESSIONS: "sessions",
  EXERCISES: "exercises",
  SETS: "sets",
  SYNC_QUEUE: "sync_queue",
} as const;

/**
 * Initialize IndexedDB database with schema
 */
export function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionStore = db.createObjectStore(STORES.SESSIONS, {
          keyPath: "id",
        });
        sessionStore.createIndex("athlete_id", "athlete_id", { unique: false });
        sessionStore.createIndex("status", "status", { unique: false });
        sessionStore.createIndex("synced", "synced", { unique: false });
        sessionStore.createIndex("created_at", "created_at", { unique: false });
      }

      // Create exercises store
      if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
        const exerciseStore = db.createObjectStore(STORES.EXERCISES, {
          keyPath: "id",
        });
        exerciseStore.createIndex("session_id", "session_id", {
          unique: false,
        });
        exerciseStore.createIndex("synced", "synced", { unique: false });
      }

      // Create sets store
      if (!db.objectStoreNames.contains(STORES.SETS)) {
        const setStore = db.createObjectStore(STORES.SETS, { keyPath: "id" });
        setStore.createIndex("session_id", "session_id", { unique: false });
        setStore.createIndex("session_exercise_id", "session_exercise_id", {
          unique: false,
        });
        setStore.createIndex("synced", "synced", { unique: false });
        setStore.createIndex("completed_at", "completed_at", { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
        });
        syncStore.createIndex("created_at", "created_at", { unique: false });
        syncStore.createIndex("attempts", "attempts", { unique: false });
      }
    };
  });
}

/**
 * Get a transaction for a store
 */
export async function getTransaction(
  storeName: string,
  mode: IDBTransactionMode = "readonly"
): Promise<{
  db: IDBDatabase;
  transaction: IDBTransaction;
  store: IDBObjectStore;
}> {
  const db = await initializeDB();
  const transaction = db.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);
  return { db, transaction, store };
}

/**
 * Close database connection
 */
export async function closeDB(): Promise<void> {
  const db = await initializeDB();
  db.close();
}
