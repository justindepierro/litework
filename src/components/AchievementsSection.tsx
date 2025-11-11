"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Heading, Body } from "@/components/ui/Typography";
import { AchievementBadge, LockedBadge } from "@/components/AchievementBadge";
import { Trophy, Lock } from "lucide-react";
import type { Achievement, AchievementType } from "@/lib/achievement-system";

interface AchievementsSectionProps {
  athleteId?: string; // Optional: for coaches viewing athlete profiles
  compact?: boolean; // Show fewer achievements
}

interface AchievementsData {
  earned: Achievement[];
  locked: Omit<Achievement, "id" | "earned_at">[];
  totalEarned: number;
  totalPossible: number;
}

export function AchievementsSection({
  athleteId,
  compact = false,
}: AchievementsSectionProps) {
  const [achievements, setAchievements] = useState<AchievementsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = athleteId
          ? new URLSearchParams({ athleteId })
          : new URLSearchParams();
        const response = await fetch(`/api/achievements?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch achievements");
        }

        setAchievements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [athleteId]);

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-primary" size={24} />
            <Heading level="h3">Achievements</Heading>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-primary" size={24} />
            <Heading level="h3">Achievements</Heading>
          </div>
          <Body variant="error">{error}</Body>
        </div>
      </Card>
    );
  }

  if (!achievements) return null;

  const { earned, locked, totalEarned, totalPossible } = achievements;
  const displayEarned = compact ? earned.slice(0, 3) : earned;
  const displayLocked = compact ? locked.slice(0, 3) : locked;

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-primary" size={24} />
            <div>
              <Heading level="h3">Achievements</Heading>
              <Body variant="secondary" size="sm">
                {totalEarned} of {totalPossible} earned
              </Body>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {Math.round((totalEarned / totalPossible) * 100)}%
            </div>
            <Body variant="tertiary" size="xs">
              Complete
            </Body>
          </div>
        </div>

        {/* Earned Achievements */}
        {earned.length > 0 && (
          <div className="mb-6">
            <Body
              variant="secondary"
              size="sm"
              className="mb-3 font-semibold uppercase tracking-wide"
            >
              Earned
            </Body>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {displayEarned.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="small"
                  showDate
                />
              ))}
              {compact && earned.length > 3 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-silver-100 rounded-full flex items-center justify-center">
                    <Body variant="secondary" className="font-semibold">
                      +{earned.length - 3}
                    </Body>
                  </div>
                  <Body variant="tertiary" size="xs" className="mt-2">
                    more
                  </Body>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-silver-400" size={16} />
              <Body
                variant="secondary"
                size="sm"
                className="font-semibold uppercase tracking-wide"
              >
                Locked
              </Body>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {displayLocked.map((achievement) => (
                <LockedBadge
                  key={achievement.type}
                  type={achievement.type as AchievementType}
                  size="small"
                />
              ))}
              {compact && locked.length > 3 && (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-silver-100 rounded-full flex items-center justify-center">
                    <Body variant="secondary" className="font-semibold">
                      +{locked.length - 3}
                    </Body>
                  </div>
                  <Body variant="tertiary" size="xs" className="mt-2">
                    more
                  </Body>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {earned.length === 0 && locked.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="mx-auto mb-3 text-silver-300" size={48} />
            <Body variant="secondary">No achievements yet</Body>
            <Body variant="tertiary" size="sm">
              Complete workouts to earn badges!
            </Body>
          </div>
        )}
      </div>
    </Card>
  );
}
