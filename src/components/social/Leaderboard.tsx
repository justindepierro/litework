"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  TrendingUp,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  athleteId: string;
  athleteName: string;
  athleteAvatar?: string;
  score: number;
  previousRank?: number;
}

interface LeaderboardProps {
  groupId?: string;
  type?:
    | "weekly_volume"
    | "monthly_volume"
    | "streak"
    | "pr_count"
    | "workout_count";
  period?: "weekly" | "monthly" | "all_time";
  limit?: number;
  className?: string;
}

export function Leaderboard({
  groupId,
  type = "weekly_volume",
  period = "weekly",
  limit = 10,
  className = "",
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(type);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (groupId) params.append("groupId", groupId);
      params.append("type", selectedType);
      params.append("period", selectedPeriod);
      params.append("limit", limit.toString());

      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      setEntries(data.entries);
      setError(null);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setIsLoading(false);
    }
  }, [groupId, selectedType, selectedPeriod, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[#FFD700]" />;
      case 2:
        return <Trophy className="w-5 h-5 text-[#C0C0C0]" />;
      case 3:
        return <Trophy className="w-5 h-5 text-[#CD7F32]" />;
      default:
        return null;
    }
  };

  const getRankChange = (entry: LeaderboardEntry) => {
    if (!entry.previousRank) return null;
    const change = entry.previousRank - entry.rank;

    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-success">
          <ChevronUp className="w-4 h-4" />
          <Caption className="font-medium">{change}</Caption>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-error">
          <ChevronDown className="w-4 h-4" />
          <Caption className="font-medium">{Math.abs(change)}</Caption>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-silver-400">
          <Minus className="w-4 h-4" />
        </div>
      );
    }
  };

  const getScoreLabel = () => {
    switch (selectedType) {
      case "weekly_volume":
      case "monthly_volume":
        return "Total Volume";
      case "streak":
        return "Day Streak";
      case "pr_count":
        return "PRs";
      case "workout_count":
        return "Workouts";
      default:
        return "Score";
    }
  };

  const formatScore = (score: number) => {
    if (selectedType === "weekly_volume" || selectedType === "monthly_volume") {
      return `${score.toLocaleString()} lbs`;
    }
    return score.toString();
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-silver-200 p-6 ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-silver-200 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-silver-200 rounded" />
                <div className="w-10 h-10 bg-silver-200 rounded-full" />
                <div className="flex-1 h-4 bg-silver-200 rounded" />
                <div className="w-16 h-4 bg-silver-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg border border-silver-200 p-6 text-center ${className}`}
      >
        <Caption variant="error">{error}</Caption>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-silver-200 ${className}`}
    >
      {/* Header with Controls */}
      <div className="p-6 border-b border-silver-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <Heading level="h3">Leaderboard</Heading>
          </div>
        </div>

        {/* Type Selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant={selectedType === "weekly_volume" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedType("weekly_volume")}
          >
            Volume
          </Button>
          <Button
            variant={selectedType === "streak" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedType("streak")}
          >
            Streak
          </Button>
          <Button
            variant={selectedType === "pr_count" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedType("pr_count")}
          >
            PRs
          </Button>
          <Button
            variant={selectedType === "workout_count" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedType("workout_count")}
          >
            Workouts
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "weekly" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("weekly")}
          >
            Weekly
          </Button>
          <Button
            variant={selectedPeriod === "monthly" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={selectedPeriod === "all_time" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedPeriod("all_time")}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Podium (Top 3) */}
      {entries.length >= 3 && (
        <div className="p-6 bg-gradient-to-br from-silver-50 to-white border-b border-silver-200">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd Place */}
            {entries[1] && (
              <div className="flex flex-col items-center w-24">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] flex items-center justify-center mb-2 relative">
                  {entries[1].athleteAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={entries[1].athleteAvatar}
                      alt={entries[1].athleteName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {entries[1].athleteName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C0C0C0] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                </div>
                <Caption className="font-medium text-center line-clamp-1">
                  {entries[1].athleteName.split(" ")[0]}
                </Caption>
                <Caption variant="muted">
                  {formatScore(entries[1].score)}
                </Caption>
              </div>
            )}

            {/* 1st Place */}
            {entries[0] && (
              <div className="flex flex-col items-center w-28">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center mb-2 relative shadow-lg">
                  {entries[0].athleteAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={entries[0].athleteAvatar}
                      alt={entries[0].athleteName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {entries[0].athleteName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Trophy className="w-6 h-6 text-[#FFD700] drop-shadow-md" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FFD700] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                </div>
                <Body className="font-bold text-center line-clamp-1">
                  {entries[0].athleteName.split(" ")[0]}
                </Body>
                <Caption className="font-medium text-primary">
                  {formatScore(entries[0].score)}
                </Caption>
              </div>
            )}

            {/* 3rd Place */}
            {entries[2] && (
              <div className="flex flex-col items-center w-24">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#CD7F32] to-[#B87333] flex items-center justify-center mb-2 relative">
                  {entries[2].athleteAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={entries[2].athleteAvatar}
                      alt={entries[2].athleteName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {entries[2].athleteName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#CD7F32] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                </div>
                <Caption className="font-medium text-center line-clamp-1">
                  {entries[2].athleteName.split(" ")[0]}
                </Caption>
                <Caption variant="muted">
                  {formatScore(entries[2].score)}
                </Caption>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="divide-y divide-silver-200">
        {entries.map((entry) => (
          <div
            key={entry.athleteId}
            className="flex items-center gap-4 p-4 hover:bg-silver-50 transition-colors"
          >
            {/* Rank */}
            <div className="w-8 flex items-center justify-center">
              {getRankIcon(entry.rank) || (
                <Body className="font-bold text-silver-500">{entry.rank}</Body>
              )}
            </div>

            {/* Avatar */}
            <div className="shrink-0">
              {entry.athleteAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={entry.athleteAvatar}
                  alt={entry.athleteName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {entry.athleteName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <Body className="font-medium line-clamp-1">
                {entry.athleteName}
              </Body>
            </div>

            {/* Rank Change */}
            <div className="w-12 flex justify-center">
              {getRankChange(entry)}
            </div>

            {/* Score */}
            <div className="text-right min-w-20">
              <Body className="font-bold">{formatScore(entry.score)}</Body>
              <Caption variant="muted">{getScoreLabel()}</Caption>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-silver-400 mx-auto mb-4" />
          <Heading level="h4" className="mb-2">
            No Rankings Yet
          </Heading>
          <Body variant="secondary">
            Complete workouts to appear on the leaderboard
          </Body>
        </div>
      )}
    </div>
  );
}
