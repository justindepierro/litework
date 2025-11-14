"use client";

import { useState, useEffect } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { TrendingUp, Users, Award } from "lucide-react";

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
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">Group Performance</h2>
      </div>

      {groupStats.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No group data available</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {groupStats.map((group) => (
            <div
              key={group.id}
              className="rounded-lg p-4 bg-linear-to-br from-white to-green-50/30 border border-green-200 shadow-sm hover:shadow-lg hover:border-green-300 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {group.groupName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{group.athleteCount} athletes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award
                    className={`w-5 h-5 ${
                      group.avgCompletionRate >= 90
                        ? "text-green-500"
                        : group.avgCompletionRate >= 80
                          ? "text-blue-500"
                          : "text-amber-500"
                    }`}
                  />
                  <span className="text-2xl font-bold text-gray-900">
                    {group.avgCompletionRate}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-semibold text-gray-900">
                    {group.completedWorkouts} workouts
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Assigned</p>
                  <p className="font-semibold text-gray-900">
                    {group.totalAssignments} workouts
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      group.avgCompletionRate >= 90
                        ? "bg-green-500"
                        : group.avgCompletionRate >= 80
                          ? "bg-blue-500"
                          : "bg-amber-500"
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
