"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Flame, Dumbbell, TrendingUp, Trophy, Loader2 } from "lucide-react";

interface QuickStatsWidgetProps {
  athleteId?: string;
  className?: string;
}

interface QuickStats {
  currentStreak: number;
  workoutsThisWeek: number;
  totalVolumeThisWeek: number;
  recentPRs: number;
}

interface Trends {
  workoutsChange: number;
  volumeChange: number;
  volumeChangePercent: number;
}

export function QuickStatsWidget({
  athleteId,
  className = "",
}: QuickStatsWidgetProps) {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams();
        if (athleteId) {
          params.append("athleteId", athleteId);
        }

        const response = await fetch(`/api/analytics/quick-stats?${params}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setTrends(data.trends);
        }
      } catch (error) {
        console.error("Error fetching quick stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [athleteId]);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <div className={className}>
        <Heading level="h3" className="mb-4">
          Quick Stats
        </Heading>
        <Card variant="default" padding="lg">
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-silver-400" />
            <Body variant="secondary">No workout data yet</Body>
            <Caption variant="muted" className="mt-2">
              Complete your first workout to see stats here!
            </Caption>
          </div>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      icon: <Flame className="w-6 h-6" />,
      label: "Day Streak",
      value: stats.currentStreak,
      suffix: stats.currentStreak === 1 ? "day" : "days",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      label: "This Week",
      value: stats.workoutsThisWeek,
      suffix: stats.workoutsThisWeek === 1 ? "workout" : "workouts",
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: trends?.workoutsChange,
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Weekly Volume",
      value: Math.round(stats.totalVolumeThisWeek / 1000),
      suffix: "k lbs",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
      trend: trends?.volumeChangePercent,
      trendIsPercent: true,
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      label: "Recent PRs",
      value: stats.recentPRs,
      suffix: stats.recentPRs === 1 ? "PR" : "PRs",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className={className}>
      <Heading level="h3" className="mb-4">
        Quick Stats
      </Heading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card
            key={idx}
            variant="default"
            padding="md"
            className="relative overflow-hidden"
          >
            {/* Icon background */}
            <div
              className={`absolute top-2 right-2 w-12 h-12 rounded-full ${stat.bgColor} opacity-50`}
            />

            {/* Icon */}
            <div className={`${stat.color} mb-3 relative z-10`}>
              {stat.icon}
            </div>

            {/* Value */}
            <div className="relative z-10">
              <div className="flex items-baseline gap-1 mb-1">
                <Body className="text-2xl font-bold text-navy-900">
                  {stat.value}
                </Body>
                <Caption variant="muted">{stat.suffix}</Caption>
              </div>

              {/* Label and trend */}
              <div className="flex items-center justify-between">
                <Caption variant="muted">{stat.label}</Caption>
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <Caption
                    className={`font-semibold ${
                      stat.trend > 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {stat.trend > 0 ? "+" : ""}
                    {stat.trend}
                    {stat.trendIsPercent ? "%" : ""}
                  </Caption>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
