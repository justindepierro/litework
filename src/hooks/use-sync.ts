/**
 * React Hook for Sync Status
 *
 * Provides sync status, statistics, and manual sync trigger for components.
 */

"use client";

import { useState, useEffect } from "react";
import { syncManager, type SyncStatus } from "@/lib/sync-manager";

interface UseSyncReturn {
  status: SyncStatus;
  progress: { current: number; total: number } | null;
  hasPendingSync: boolean;
  stats: {
    unsyncedSessions: number;
    unsyncedSets: number;
    queuedOperations: number;
  } | null;
  sync: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

/**
 * Hook to monitor sync status and trigger manual sync
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, hasPendingSync, sync } = useSync();
 *
 *   if (hasPendingSync) {
 *     return (
 *       <div>
 *         <p>You have unsynced data</p>
 *         <button onClick={sync}>Sync Now</button>
 *       </div>
 *     );
 *   }
 *
 *   return <div>All synced!</div>;
 * }
 * ```
 */
export function useSync(): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [stats, setStats] = useState<{
    unsyncedSessions: number;
    unsyncedSets: number;
    queuedOperations: number;
  } | null>(null);

  // Load initial sync stats
  const refreshStats = async (): Promise<void> => {
    const syncStats = await syncManager.getSyncStats();
    setStats(syncStats);

    const pending = await syncManager.hasPendingSync();
    setHasPendingSync(pending);
  };

  useEffect(() => {
    // Load initial stats async
    let mounted = true;

    const loadStats = async () => {
      if (!mounted) return;
      const syncStats = await syncManager.getSyncStats();
      const pending = await syncManager.hasPendingSync();

      if (mounted) {
        setStats(syncStats);
        setHasPendingSync(pending);
      }
    };

    loadStats();

    // Subscribe to sync status changes
    const unsubscribe = syncManager.addListener((newStatus, newProgress) => {
      if (!mounted) return;

      setStatus(newStatus);
      setProgress(newProgress || null);

      // Refresh stats when sync completes
      if (newStatus === "idle" || newStatus === "error") {
        loadStats();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const sync = async (): Promise<void> => {
    await syncManager.forcSync();
  };

  return {
    status,
    progress,
    hasPendingSync,
    stats,
    sync,
    refreshStats,
  };
}
