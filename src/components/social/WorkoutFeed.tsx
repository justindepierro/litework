"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Activity, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface FeedItem {
  id: string;
  athleteId: string;
  activityType: "workout_completed" | "pr_achieved";
  activityData: {
    workoutName?: string;
    exerciseName?: string;
    weight?: number;
    reps?: number;
    improvement?: number;
  };
  timestamp: string;
  athleteName: string;
  athleteAvatar?: string;
}

interface WorkoutFeedProps {
  groupId?: string;
  limit?: number;
  className?: string;
}

export function WorkoutFeed({
  groupId,
  limit = 20,
  className = "",
}: WorkoutFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (groupId) params.append("groupId", groupId);
      params.append("limit", limit.toString());

      const response = await fetch(`/api/workout-feed?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch feed");

      const data = await response.json();
      setFeedItems(data.items);
      setError(null);
    } catch (err) {
      console.error("Feed fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, [groupId, limit]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-silver-200 p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-silver-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-silver-200 rounded w-1/3" />
                <div className="h-3 bg-silver-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Caption variant="error">{error}</Caption>
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Activity className="w-12 h-12 text-silver-400 mx-auto mb-4" />
        <Heading level="h4" className="mb-2">
          No Recent Activity
        </Heading>
        <Body variant="secondary">
          Complete workouts to see activity from your group members
        </Body>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {feedItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-silver-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="shrink-0">
              {item.athleteAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.athleteAvatar}
                  alt={item.athleteName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {item.athleteName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Body className="font-semibold">{item.athleteName}</Body>
                  <div className="flex items-center gap-2 mt-1">
                    {item.activityType === "workout_completed" ? (
                      <>
                        <Activity className="w-4 h-4 text-success shrink-0" />
                        <Caption variant="muted">
                          completed{" "}
                          <span className="font-medium text-charcoal">
                            {item.activityData.workoutName || "a workout"}
                          </span>
                        </Caption>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 text-warning shrink-0" />
                        <Caption variant="muted">
                          set a new PR on{" "}
                          <span className="font-medium text-charcoal">
                            {item.activityData.exerciseName}
                          </span>
                        </Caption>
                      </>
                    )}
                  </div>

                  {/* Activity Details */}
                  {item.activityType === "pr_achieved" &&
                    item.activityData.weight &&
                    item.activityData.reps && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5 text-warning" />
                        <Caption className="font-medium text-warning">
                          {item.activityData.weight} lbs ×{" "}
                          {item.activityData.reps} reps
                          {item.activityData.improvement && (
                            <span className="ml-1">
                              (+{item.activityData.improvement}%)
                            </span>
                          )}
                        </Caption>
                      </div>
                    )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-silver-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <Caption variant="muted">
                    {format(new Date(item.timestamp), "MMM d")}
                  </Caption>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
