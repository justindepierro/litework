"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Loader2 } from "lucide-react";

interface AchievementBadgeProps {
  athleteId?: string;
  limit?: number;
  showAll?: boolean;
  className?: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon?: string;
  earned_at: string;
  is_highlighted: boolean;
}

// Define achievement metadata
const ACHIEVEMENT_META: Record<
  string,
  {
    icon: string;
    color: string;
    bgColor: string;
  }
> = {
  first_workout: {
    icon: "🎉",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  workouts_10: {
    icon: "💪",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  workouts_25: {
    icon: "⚡",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  workouts_50: { icon: "🏋️", color: "text-primary", bgColor: "bg-primary/10" },
  workouts_100: { icon: "🏆", color: "text-warning", bgColor: "bg-warning/10" },
  streak_7: { icon: "🔥", color: "text-warning", bgColor: "bg-warning/10" },
  streak_30: { icon: "🔥", color: "text-warning", bgColor: "bg-warning/10" },
  streak_100: { icon: "🔥", color: "text-error", bgColor: "bg-error/10" },
  pr_first: { icon: "🎯", color: "text-success", bgColor: "bg-success/10" },
  pr_10: { icon: "🎖️", color: "text-success", bgColor: "bg-success/10" },
  pr_25: { icon: "🥇", color: "text-warning", bgColor: "bg-warning/10" },
  volume_milestone_100k: {
    icon: "📊",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  volume_milestone_250k: {
    icon: "📈",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  volume_milestone_500k: {
    icon: "🚀",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  goal_completed_first: {
    icon: "✅",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  goal_completed_5: {
    icon: "🎖️",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  elite_strength: {
    icon: "👑",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

export function AchievementBadges({
  athleteId,
  limit,
  showAll = false,
  className = "",
}: AchievementBadgeProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const params = new URLSearchParams();
        if (athleteId) {
          params.append("athleteId", athleteId);
        }

        const response = await fetch(`/api/achievements?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.achievements) {
            let achievementList = data.achievements;

            // Filter to highlighted if not showing all
            if (!showAll) {
              achievementList = achievementList.filter(
                (a: Achievement) => a.is_highlighted
              );
            }

            // Apply limit
            if (limit) {
              achievementList = achievementList.slice(0, limit);
            }

            setAchievements(achievementList);
          }
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [athleteId, limit, showAll]);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Heading level="h3" className="mb-4">
          Achievements
        </Heading>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-silver-400" />
          <Body variant="secondary">No achievements yet</Body>
          <Caption variant="muted" className="mt-2">
            Complete workouts and reach milestones to earn badges!
          </Caption>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Heading level="h3" className="mb-4">
        Achievements
      </Heading>

      {showAll ? (
        // Grid view for all achievements
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => {
            const meta = ACHIEVEMENT_META[achievement.achievement_type] || {
              icon: "🏆",
              color: "text-primary",
              bgColor: "bg-primary/10",
            };

            return (
              <Card
                key={achievement.id}
                variant="default"
                padding="md"
                className="text-center"
              >
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-full ${meta.bgColor} flex items-center justify-center text-2xl`}
                >
                  {meta.icon}
                </div>
                <Caption className="font-semibold text-navy-900 line-clamp-2">
                  {achievement.title}
                </Caption>
                <Caption variant="muted" className="text-xs mt-1">
                  {new Date(achievement.earned_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </Caption>
              </Card>
            );
          })}
        </div>
      ) : (
        // Compact list view for featured achievements
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => {
            const meta = ACHIEVEMENT_META[achievement.achievement_type] || {
              icon: "🏆",
              color: "text-primary",
              bgColor: "bg-primary/10",
            };

            return (
              <Badge
                key={achievement.id}
                variant="info"
                size="md"
                className={`${meta.bgColor} ${meta.color} border-none`}
              >
                <Body as="span" className="mr-1">
                  {meta.icon}
                </Body>
                {achievement.title}
              </Badge>
            );
          })}
        </div>
      )}

      {!showAll && achievements.length > 0 && (
        <Caption variant="muted" className="mt-3">
          Showing featured achievements
        </Caption>
      )}
    </div>
  );
}
