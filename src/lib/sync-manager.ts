/**
 * Sync Manager for Offline Data Synchronization
 *
 * Handles syncing offline data to the server when network is available.
 * Manages sync queue, retry logic, conflict resolution, and automatic sync.
 */

import {
  getUnsyncedSessions,
  getUnsyncedSets,
  getSyncQueue,
  updateSyncQueueItem,
  removeSyncQueueItem,
  saveSession,
  saveSet,
  type IDBSetRecord,
  type IDBSyncQueueItem,
} from "./indexeddb-service";
import { networkService } from "./network-service";

// Sync configuration
const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  BATCH_SIZE: 10,
  AUTO_SYNC_INTERVAL_MS: 30000, // 30 seconds
};

type SyncStatus = "idle" | "syncing" | "error";
type SyncCallback = (
  status: SyncStatus,
  progress?: { current: number; total: number }
) => void;

class SyncManager {
  private syncCallbacks: Set<SyncCallback> = new Set();
  private isSyncing: boolean = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private networkListener: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  /**
   * Initialize sync manager
   */
  private initialize(): void {
    // Listen for network changes
    this.networkListener = networkService.addListener((isOnline) => {
      if (isOnline) {
        console.log("[Sync] Network restored - starting sync");
        this.sync();
      }
    });

    // Start auto-sync if online
    if (networkService.isOnline) {
      this.startAutoSync();
    }
  }

  /**
   * Start automatic sync interval
   */
  private startAutoSync(): void {
    if (this.autoSyncInterval) return;

    this.autoSyncInterval = setInterval(() => {
      if (networkService.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, SYNC_CONFIG.AUTO_SYNC_INTERVAL_MS);
  }

  /**
   * Stop automatic sync interval
   */
  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /**
   * Notify sync callbacks
   */
  private notifyCallbacks(
    status: SyncStatus,
    progress?: { current: number; total: number }
  ): void {
    this.syncCallbacks.forEach((callback) => {
      try {
        callback(status, progress);
      } catch (error) {
        console.error("Error in sync callback:", error);
      }
    });
  }

  /**
   * Add a sync status listener
   */
  public addListener(callback: SyncCallback): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  /**
   * Main sync function - syncs all offline data
   */
  public async sync(): Promise<void> {
    // Skip if already syncing or offline
    if (this.isSyncing || !networkService.isOnline) {
      return;
    }

    this.isSyncing = true;
    this.notifyCallbacks("syncing");

    try {
      console.log("[Sync] Starting sync...");

      // Step 1: Sync sessions
      await this.syncSessions();

      // Step 2: Sync sets
      await this.syncSets();

      // Step 3: Process sync queue
      await this.processSyncQueue();

      console.log("✅ Sync completed successfully");
      this.notifyCallbacks("idle");
    } catch (error) {
      console.error("❌ Sync failed:", error);
      this.notifyCallbacks("error");
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync unsynced sessions to server
   */
  private async syncSessions(): Promise<void> {
    const unsyncedSessions = await getUnsyncedSessions();

    if (unsyncedSessions.length === 0) {
      console.log("[Sync] No sessions to sync");
      return;
    }
    console.log(`📤 Syncing ${unsyncedSessions.length} sessions`);

    for (let i = 0; i < unsyncedSessions.length; i++) {
      const session = unsyncedSessions[i];

      try {
        // Create or update session on server
        const response = await fetch(`/api/sessions/${session.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: session.id,
            athlete_id: session.athlete_id,
            workout_plan_id: session.workout_plan_id,
            assignment_id: session.assignment_id,
            status: session.status,
            started_at: session.started_at,
            completed_at: session.completed_at,
            notes: session.notes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync session: ${response.statusText}`);
        }

        // Mark as synced in IndexedDB
        await saveSession({ ...session, synced: true });

        this.notifyCallbacks("syncing", {
          current: i + 1,
          total: unsyncedSessions.length,
        });
      } catch (error) {
        console.error(`Failed to sync session ${session.id}:`, error);
        // Continue with next session
      }
    }
  }

  /**
   * Sync unsynced sets to server
   */
  private async syncSets(): Promise<void> {
    const unsyncedSets = await getUnsyncedSets();

    if (unsyncedSets.length === 0) {
      console.log("[Sync] No sets to sync");
      return;
    }
    console.log(`📤 Syncing ${unsyncedSets.length} sets`);

    // Batch sets by session for efficient API calls
    const setsBySession = unsyncedSets.reduce(
      (acc, set) => {
        if (!acc[set.session_id]) {
          acc[set.session_id] = [];
        }
        acc[set.session_id].push(set);
        return acc;
      },
      {} as Record<string, IDBSetRecord[]>
    );

    let processed = 0;
    const totalSets = unsyncedSets.length;

    for (const [sessionId, sets] of Object.entries(setsBySession)) {
      try {
        // Batch create sets for this session
        const response = await fetch(`/api/sessions/${sessionId}/sets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sets: sets.map((set) => ({
              id: set.id,
              session_id: set.session_id,
              session_exercise_id: set.session_exercise_id,
              set_number: set.set_number,
              weight: set.weight_used,
              reps: set.reps_completed,
              rpe: set.rpe,
              notes: set.notes,
              completed_at: set.completed_at,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to sync sets: ${response.statusText}`);
        }

        // Mark all sets as synced
        for (const set of sets) {
          await saveSet({ ...set, synced: true });
          processed++;
          this.notifyCallbacks("syncing", {
            current: processed,
            total: totalSets,
          });
        }
      } catch (error) {
        console.error(`Failed to sync sets for session ${sessionId}:`, error);
        // Continue with next batch
        processed += sets.length;
      }
    }
  }

  /**
   * Process items in sync queue
   */
  private async processSyncQueue(): Promise<void> {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      console.log("[Sync] Sync queue empty");
      return;
    }
    console.log(`📤 Processing ${queue.length} queued operations`);

    for (const item of queue) {
      // Skip if max retries exceeded
      if (item.attempts >= SYNC_CONFIG.MAX_RETRIES) {
        console.warn(
          `Max retries exceeded for ${item.operation_type} on ${item.entity_type}`
        );
        continue;
      }

      try {
        await this.processSyncQueueItem(item);
        await removeSyncQueueItem(item.id);
      } catch (error) {
        // Update retry count and error
        await updateSyncQueueItem(item.id, {
          attempts: item.attempts + 1,
          last_attempt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        });

        console.error(`Failed to process sync queue item ${item.id}:`, error);
      }
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncQueueItem(item: IDBSyncQueueItem): Promise<void> {
    const { operation_type, entity_type, entity_id, payload } = item;

    let url: string;
    let method: string;

    switch (operation_type) {
      case "create":
        url = `/api/${entity_type}s`;
        method = "POST";
        break;
      case "update":
        url = `/api/${entity_type}s/${entity_id}`;
        method = "PATCH";
        break;
      case "delete":
        url = `/api/${entity_type}s/${entity_id}`;
        method = "DELETE";
        break;
      default:
        throw new Error(`Unknown operation type: ${operation_type}`);
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
  }

  /**
   * Force immediate sync
   */
  public async forcSync(): Promise<void> {
    await this.sync();
  }

  /**
   * Check if there's data waiting to sync
   */
  public async hasPendingSync(): Promise<boolean> {
    const [unsyncedSessions, unsyncedSets, queue] = await Promise.all([
      getUnsyncedSessions(),
      getUnsyncedSets(),
      getSyncQueue(),
    ]);

    return (
      unsyncedSessions.length > 0 || unsyncedSets.length > 0 || queue.length > 0
    );
  }

  /**
   * Get sync statistics
   */
  public async getSyncStats(): Promise<{
    unsyncedSessions: number;
    unsyncedSets: number;
    queuedOperations: number;
  }> {
    const [unsyncedSessions, unsyncedSets, queue] = await Promise.all([
      getUnsyncedSessions(),
      getUnsyncedSets(),
      getSyncQueue(),
    ]);

    return {
      unsyncedSessions: unsyncedSessions.length,
      unsyncedSets: unsyncedSets.length,
      queuedOperations: queue.length,
    };
  }

  /**
   * Cleanup sync manager
   */
  public cleanup(): void {
    this.stopAutoSync();
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    this.syncCallbacks.clear();
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export class for testing
export { SyncManager };
export type { SyncStatus, SyncCallback };
