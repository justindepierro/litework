"use client";

import { useState, useEffect } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { TrendingUp, Users, Award } from "lucide-react";
import { Body } from "@/components/ui/Typography";

interface GroupStats {
  id: string;
  groupName: string;
  athleteCount: number;
  completedWorkouts: number;
  totalAssignments: number;
  avgCompletionRate: number;
}

export default function GroupCompletionStats() {
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const { isLoading: loading, execute } = useAsyncState<GroupStats[]>();
  const { error: toastError } = useToast();

  useEffect(() => {
    execute(async () => {
      const { data, error } = await apiClient.requestWithResponse<{
        success: boolean;
        groups: GroupStats[];
      }>("/analytics/group-stats", { toastError });

      if (error) {
        console.error("Failed to load group stats:", error);
        return [];
      }

      const stats = data?.groups || [];
      setGroupStats(stats);
      return stats;
    });
  }, [execute, toastError]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-(--bg-tertiary) rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-(--bg-tertiary) rounded"></div>
          <div className="h-16 bg-(--bg-tertiary) rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-(--status-success)" />
        <h2 className="text-xl font-bold text-(--text-primary)">
          Group Performance
        </h2>
      </div>

      {groupStats.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-(--text-tertiary) mx-auto mb-3" />
          <Body variant="secondary">No group data available</Body>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {groupStats.map((group) => (
            <div
              key={group.id}
              className="rounded-lg p-4 bg-gradient-to-br from-white to-green-50/30 border border-(--status-success-light) shadow-sm hover:shadow-lg hover:border-(--status-success-light) hover:scale-[1.02] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-(--text-primary) mb-1">
                    {group.groupName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-(--text-secondary)">
                    <Users className="w-4 h-4" />
                    <span>{group.athleteCount} athletes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award
                    className={`w-5 h-5 ${
                      group.avgCompletionRate >= 90
                        ? "text-(--status-success)"
                        : group.avgCompletionRate >= 80
                          ? "text-(--accent-blue-500)"
                          : "text-(--status-warning)"
                    }`}
                  />
                  <span className="text-2xl font-bold text-(--text-primary)">
                    {group.avgCompletionRate}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Body variant="secondary">Completed</Body>
                  <p className="font-semibold text-(--text-primary)">
                    {group.completedWorkouts} workouts
                  </p>
                </div>
                <div>
                  <Body variant="secondary">Total Assigned</Body>
                  <p className="font-semibold text-(--text-primary)">
                    {group.totalAssignments} workouts
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-(--bg-tertiary) rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      group.avgCompletionRate >= 90
                        ? "bg-(--status-success)"
                        : group.avgCompletionRate >= 80
                          ? "bg-(--accent-blue-500)"
                          : "bg-(--status-warning)"
                    }`}
                    style={{ width: `${group.avgCompletionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
