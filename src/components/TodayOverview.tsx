"use client";

import { useState, useEffect, memo } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { formatTimeRange } from "@/lib/date-utils";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface TodayWorkout {
  id: string;
  workoutName: string;
  groupName: string;
  groupId?: string | null;
  groupColor?: string | null;
  athleteNames?: string[];
  isIndividual?: boolean;
  athleteCount: number;
  completedCount: number;
  startTime: string;
  endTime: string;
}

const TodayOverview = memo(function TodayOverview() {
  const [todayWorkouts, setTodayWorkouts] = useState<TodayWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSkeleton } = useMinimumLoadingTime(loading, 300);
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchTodayWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodayWorkouts = async () => {
    try {
      const { data, error } = await apiClient.requestWithResponse<{
        success: boolean;
        workouts: TodayWorkout[];
      }>("/analytics/today-schedule", {
        showErrorToast: false, // Silently handle errors
      });

      if (error) {
        console.error("Error fetching today's workouts:", error);
        return;
      }

      if (data?.success) {
        console.log("[TodayOverview] Received workouts:", data.workouts);
        console.log(
          "[TodayOverview] First workout detail:",
          JSON.stringify(data.workouts[0], null, 2)
        );
        setTodayWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error("Error fetching today's workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (showSkeleton) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-[var(--color-accent-orange)]" />
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Today&apos;s Schedule
          </h2>
        </div>
        <div className="space-y-3 flex-1">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-[var(--color-accent-orange)]" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Today&apos;s Schedule
        </h2>
      </div>

      {todayWorkouts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No workouts scheduled"
          description="There are no workouts scheduled for today. Assign workouts from the calendar to get started."
          size="sm"
        />
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {todayWorkouts.map((workout) => {
            const rate = completionRate(
              workout.completedCount,
              workout.athleteCount
            );
            return (
              <div
                key={workout.id}
                className="rounded-lg p-4 bg-gradient-to-br from-white to-blue-50/30 border border-blue-200 hover:border-blue-500 hover:shadow-lg hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">
                      {workout.workoutName}
                    </h3>
                    {/* Show athlete badges for individual assignments OR group name for group assignments */}
                    {workout.isIndividual &&
                    workout.athleteNames &&
                    workout.athleteNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {workout.athleteNames.map((name, idx) => {
                          const nameParts = name.trim().split(" ");
                          const firstName = nameParts[0] || "";
                          const lastName =
                            nameParts[nameParts.length - 1] || "";
                          const initial = firstName.charAt(0).toUpperCase();
                          const displayName = `${initial}. ${lastName}`;

                          return (
                            <span
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "0.25rem 0.625rem",
                                borderRadius: "9999px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                border: "1.5px solid #3b82f6",
                              }}
                            >
                              {displayName}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.25rem 0.625rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backgroundColor:
                              (workout.groupColor || "#3b82f6") + "20",
                            color: workout.groupColor || "#3b82f6",
                            border: `1.5px solid ${workout.groupColor || "#3b82f6"}`,
                          }}
                        >
                          <Users
                            style={{ width: "0.75rem", height: "0.75rem" }}
                          />
                          {workout.groupName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTimeRange(workout.startTime, workout.endTime)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Completion
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {workout.completedCount}/{workout.athleteCount} athletes (
                      {rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-silver-300)] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        rate === 100
                          ? "bg-[var(--color-semantic-success-base)]"
                          : rate >= 50
                            ? "bg-[var(--color-semantic-info-base)]"
                            : "bg-[var(--color-semantic-warning-base)]"
                      }`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>

                {rate === 100 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-semantic-success-dark)]">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">All athletes completed!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default TodayOverview;
