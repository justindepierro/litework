"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncState } from "@/hooks/use-async-state";
import { apiClient } from "@/lib/api-client";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Display, Body } from "@/components/ui/Typography";

interface SyncStatus {
  profile: {
    synced: boolean;
    data: { name: string; role: string } | null;
  };
  groups: {
    synced: boolean;
    count: number;
    names: string[];
  };
  workouts: {
    synced: boolean;
    count: number;
    hasWorkouts: boolean;
  };
  kpis: {
    synced: boolean;
    count: number;
    hasKPIs: boolean;
  };
  complete: boolean;
}

export default function SetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const { error, setError } = useAsyncState();
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const checkSyncStatus = async () => {
      try {
        const { data, error: apiError } =
          await apiClient.requestWithResponse<SyncStatus>("/auth/sync-status");

        if (apiError || !data) {
          throw new Error(apiError || "Failed to check sync status");
        }

        setSyncStatus(data);

        // If sync is complete, redirect to dashboard after a brief moment
        if (data.complete) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          // Check again in 1 second if not complete
          setCheckCount((prev) => prev + 1);
          if (checkCount < 10) {
            // Max 10 attempts
            setTimeout(checkSyncStatus, 1000);
          } else {
            // After 10 seconds, assume sync is complete and redirect
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Error checking sync status:", err);
        setError("Something went wrong. Redirecting to dashboard...");
        // Even on error, redirect after a moment
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    };

    checkSyncStatus();
  }, [user, router, checkCount]);

  if (!syncStatus && !error) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-silver-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-accent-blue-100 mb-4">
              {syncStatus?.complete ? (
                <svg
                  className="h-10 w-10 text-accent-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-10 w-10 text-accent-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </div>
            <Display size="sm" className="mb-2">
              {syncStatus?.complete ? "All Set!" : "Setting Up Your Account"}
            </Display>
            <Body size="lg" variant="secondary">
              {syncStatus?.complete
                ? "Taking you to your dashboard..."
                : "Just a moment while we get everything ready..."}
            </Body>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-warning-lighter border border-warning-light rounded-lg">
              <Body size="sm" className="text-warning-dark">
                {error}
              </Body>
            </div>
          )}

          {/* Sync Progress */}
          {syncStatus && !error && (
            <div className="space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    syncStatus.profile.synced
                      ? "bg-success-lighter"
                      : "bg-silver-200"
                  }`}
                >
                  {syncStatus.profile.synced ? (
                    <svg
                      className="w-5 h-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-silver-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <Body size="base" className="font-medium">
                    Profile
                  </Body>
                  {syncStatus.profile.data && (
                    <Body className="text-sm" variant="secondary">
                      {syncStatus.profile.data.name}
                    </Body>
                  )}
                </div>
              </div>

              {/* Groups */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    syncStatus.groups.synced
                      ? "bg-success-lighter"
                      : "bg-silver-200"
                  }`}
                >
                  {syncStatus.groups.synced ? (
                    <svg
                      className="w-5 h-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-silver-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <Body size="base" className="font-medium">
                    Team Groups
                  </Body>
                  {syncStatus.groups.count > 0 ? (
                    <Body className="text-sm" variant="secondary">
                      {syncStatus.groups.names.join(", ")}
                    </Body>
                  ) : (
                    <Body className="text-sm" variant="secondary">
                      No groups yet
                    </Body>
                  )}
                </div>
              </div>

              {/* Workouts */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    syncStatus.workouts.synced
                      ? "bg-success-lighter"
                      : "bg-silver-200"
                  }`}
                >
                  {syncStatus.workouts.synced ? (
                    <svg
                      className="w-5 h-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-silver-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <Body size="base" className="font-medium">
                    Workouts
                  </Body>
                  {syncStatus.workouts.hasWorkouts ? (
                    <Body className="text-sm" variant="secondary">
                      {syncStatus.workouts.count} workout
                      {syncStatus.workouts.count !== 1 ? "s" : ""} assigned
                    </Body>
                  ) : (
                    <Body className="text-sm" variant="secondary">
                      Ready for assignments
                    </Body>
                  )}
                </div>
              </div>

              {/* KPIs */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    syncStatus.kpis.synced
                      ? "bg-success-lighter"
                      : "bg-silver-200"
                  }`}
                >
                  {syncStatus.kpis.synced ? (
                    <svg
                      className="w-5 h-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-silver-300 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <Body size="base" className="font-medium">
                    Performance Tracking
                  </Body>
                  {syncStatus.kpis.hasKPIs ? (
                    <Body className="text-sm" variant="secondary">
                      {syncStatus.kpis.count} metric
                      {syncStatus.kpis.count !== 1 ? "s" : ""} assigned
                    </Body>
                  ) : (
                    <Body className="text-sm" variant="secondary">
                      Ready to track
                    </Body>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {syncStatus && !syncStatus.complete && (
            <div className="mt-6">
              <div className="h-2 bg-silver-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-blue-600 transition-all duration-500 ease-out"
                  style={{
                    width: `${
                      ((syncStatus.profile.synced ? 1 : 0) +
                        (syncStatus.groups.synced ? 1 : 0) +
                        (syncStatus.workouts.synced ? 1 : 0) +
                        (syncStatus.kpis.synced ? 1 : 0)) *
                      25
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
