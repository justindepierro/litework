/**
 * Offline Status Banner
 *
 * Shows current network status and sync progress.
 * Displays at top of screen when offline or syncing.
 */

"use client";

import React from "react";
import { useNetwork } from "@/hooks/use-network";
import { useSync } from "@/hooks/use-sync";

export function OfflineStatusBanner() {
  const { isOnline } = useNetwork();
  const { status, progress, hasPendingSync } = useSync();

  // Don't show banner if online and nothing to sync
  if (isOnline && !hasPendingSync && status === "idle") {
    return null;
  }

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-3 text-center text-sm font-medium shadow-md safe-top">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span>
            You&apos;re offline. Your workout will sync when you&apos;re back
            online.
          </span>
        </div>
      </div>
    );
  }

  // Syncing banner
  if (status === "syncing" && progress) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-info text-info-foreground px-4 py-2 text-center text-sm font-medium shadow-md">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>
            Syncing... {progress.current} of {progress.total}
          </span>
        </div>
      </div>
    );
  }

  // Unsynced data banner (online but has pending sync)
  if (hasPendingSync && status === "idle") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium shadow-md">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            You have unsynced workout data. It will sync automatically.
          </span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Sync Status Indicator
 *
 * Small icon showing sync status in navigation or header.
 * Can be placed anywhere in the UI.
 */
export function SyncStatusIndicator() {
  const { isOnline } = useNetwork();
  const { status, hasPendingSync, stats } = useSync();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-warning" title="Offline">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="flex items-center gap-2 text-info" title="Syncing">
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="text-sm font-medium">Syncing</span>
      </div>
    );
  }

  if (hasPendingSync && stats) {
    const totalUnsynced =
      stats.unsyncedSessions + stats.unsyncedSets + stats.queuedOperations;
    return (
      <div
        className="flex items-center gap-2 text-warning"
        title={`${totalUnsynced} items to sync`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium">{totalUnsynced}</span>
      </div>
    );
  }

  // All synced
  return (
    <div className="flex items-center gap-2 text-success" title="All synced">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  );
}
