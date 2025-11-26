"use client";

import { useState, useEffect } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { TrendingUp, Users, Award } from "lucide-react";
import { Body, Heading } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";

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
      <div className="bg-surface rounded-lg shadow-sm p-6 animate-pulse border border-primary">
        <div className="h-6 bg-secondary rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-secondary rounded"></div>
          <div className="h-16 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <GlassCard
      gradientAccent="green"
      padding="sm"
      className="h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-accent-green-600 shrink-0" />
        <Heading level="h4" className="text-navy-700">
          Group Performance
        </Heading>
      </div>

      {groupStats.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-navy-400 mx-auto mb-3" />
          <Body variant="secondary">No group data available</Body>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          {groupStats.map((group, index) => {
            // Vibrant colorful accent for each card based on index
            const accentColors = [
              {
                border: "border-accent-purple-400",
                bg: "bg-linear-to-br from-accent-purple-100 to-accent-purple-50",
                glow: "shadow-accent-purple-500/20",
                dotBg: "bg-accent-purple-400",
              },
              {
                border: "border-accent-blue-400",
                bg: "bg-linear-to-br from-accent-blue-100 to-accent-blue-50",
                glow: "shadow-accent-blue-500/20",
                dotBg: "bg-accent-blue-400",
              },
              {
                border: "border-accent-pink-400",
                bg: "bg-linear-to-br from-accent-pink-100 to-accent-pink-50",
                glow: "shadow-accent-pink-500/20",
                dotBg: "bg-accent-pink-400",
              },
              {
                border: "border-accent-cyan-400",
                bg: "bg-linear-to-br from-accent-cyan-100 to-accent-cyan-50",
                glow: "shadow-accent-cyan-500/20",
                dotBg: "bg-accent-cyan-400",
              },
              {
                border: "border-accent-orange-400",
                bg: "bg-linear-to-br from-accent-orange-100 to-accent-orange-50",
                glow: "shadow-accent-orange-500/20",
                dotBg: "bg-accent-orange-400",
              },
            ];
            const accent = accentColors[index % accentColors.length];

            return (
              <div
                key={group.id}
                className={`${accent.bg} border-2 ${accent.border} rounded-2xl p-4 hover:border-accent-green-500 hover:shadow-xl hover:${accent.glow} hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden`}
              >
                {/* Colorful accent dot in top-left */}
                <div
                  className={`absolute top-2 left-2 w-2 h-2 rounded-full ${accent.dotBg} shadow-md`}
                />

                {/* Header with group name and completion rate */}
                <div className="flex items-center justify-between mb-2 gap-2 pl-3">
                  <div className="flex-1 min-w-0">
                    <Heading
                      level="h4"
                      className="text-navy-700 text-sm truncate"
                    >
                      {group.groupName}
                    </Heading>
                    <div className="flex items-center gap-1.5 text-xs text-navy-600 mt-0.5">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <Body
                        as="span"
                        size="xs"
                        className="truncate text-navy-600"
                      >
                        {group.athleteCount} athletes
                      </Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Award
                      className={`w-5 h-5 drop-shadow-md shrink-0 ${
                        group.avgCompletionRate >= 90
                          ? "text-accent-green-500"
                          : group.avgCompletionRate >= 80
                            ? "text-accent-blue-500"
                            : "text-accent-amber-500"
                      }`}
                    />
                    <Body
                      as="span"
                      size="lg"
                      weight="bold"
                      className="text-navy-700 tabular-nums"
                    >
                      {group.avgCompletionRate}%
                    </Body>
                  </div>
                </div>

                {/* Stats row with colorful accent backgrounds */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div
                    className={`min-w-0 rounded-lg p-2 bg-white/60 border ${accent.border}`}
                  >
                    <Body
                      variant="secondary"
                      size="xs"
                      className="text-navy-600"
                    >
                      Completed
                    </Body>
                    <Body weight="semibold" className="text-navy-700 truncate">
                      {group.completedWorkouts} workouts
                    </Body>
                  </div>
                  <div
                    className={`min-w-0 rounded-lg p-2 bg-white/60 border ${accent.border}`}
                  >
                    <Body
                      variant="secondary"
                      size="xs"
                      className="text-navy-600"
                    >
                      Total Assigned
                    </Body>
                    <Body weight="semibold" className="text-navy-700 truncate">
                      {group.totalAssignments} workouts
                    </Body>
                  </div>
                </div>

                {/* Vibrant progress bar with gradient */}
                <div className="w-full">
                  <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                        group.avgCompletionRate >= 90
                          ? "bg-gradient-progress-green"
                          : group.avgCompletionRate >= 80
                            ? "bg-gradient-progress-blue"
                            : "bg-gradient-progress-amber"
                      }`}
                      style={{ width: `${group.avgCompletionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
