"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Dumbbell, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface RecentWorkoutsProps {
  athleteId?: string;
  limit?: number;
  className?: string;
}

interface WorkoutSession {
  id: string;
  workout_plan_id: string;
  completed_at: string;
  workout_plan: {
    name: string;
  };
  exerciseCount: number;
  totalVolume: number;
  duration: number | null;
}

export function RecentWorkouts({
  athleteId,
  limit = 3,
  className = "",
}: RecentWorkoutsProps) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      try {
        const params = new URLSearchParams({
          status: "completed",
          limit: limit.toString(),
          sort: "completed_at",
          order: "desc",
        });
        if (athleteId) {
          params.append("athleteId", athleteId);
        }

        const response = await fetch(`/api/workout-sessions?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.sessions) {
            // Calculate stats for each workout
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const workoutsWithStats = data.sessions.map((session: any) => {
              let totalVolume = 0;
              let exerciseCount = 0;

              if (session.session_exercises) {
                exerciseCount = session.session_exercises.length;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.session_exercises.forEach((exercise: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  exercise.set_records?.forEach((set: any) => {
                    if (set.weight && set.reps) {
                      totalVolume += set.weight * set.reps;
                    }
                  });
                });
              }

              return {
                id: session.id,
                workout_plan_id: session.workout_plan_id,
                completed_at: session.completed_at,
                workout_plan: session.workout_plan || {
                  name: "Unknown Workout",
                },
                exerciseCount,
                totalVolume,
                duration: session.duration || null,
              };
            });

            setWorkouts(workoutsWithStats);
          }
        }
      } catch (error) {
        console.error("Error fetching recent workouts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentWorkouts();
  }, [athleteId, limit]);

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <Heading level="h3" className="mb-4">
          Recent Workouts
        </Heading>
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-silver-400" />
          <Body variant="secondary">No completed workouts yet</Body>
          <Caption variant="muted" className="mt-2">
            Complete your first workout to see it here!
          </Caption>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3">Recent Workouts</Heading>
        <Link href="/history">
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {workouts.map((workout) => {
          const completedDate = new Date(workout.completed_at);
          const daysAgo = Math.floor(
            (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          let timeAgo = "";
          if (daysAgo === 0) {
            timeAgo = "Today";
          } else if (daysAgo === 1) {
            timeAgo = "Yesterday";
          } else if (daysAgo < 7) {
            timeAgo = `${daysAgo} days ago`;
          } else {
            timeAgo = completedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }

          return (
            <Link
              key={workout.id}
              href={`/workouts/view/${workout.workout_plan_id}`}
            >
              <Card
                variant="default"
                padding="md"
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Workout name */}
                    <Body className="font-semibold text-navy-900 mb-1 truncate">
                      {workout.workout_plan.name}
                    </Body>

                    {/* Date and time */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-silver-500" />
                      <Caption variant="muted">{timeAgo}</Caption>
                      {workout.duration && (
                        <>
                          <span className="text-silver-400">•</span>
                          <Caption variant="muted">
                            {Math.round(workout.duration / 60)} min
                          </Caption>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                      <Badge variant="info" size="sm">
                        {workout.exerciseCount} exercise
                        {workout.exerciseCount !== 1 ? "s" : ""}
                      </Badge>
                      <Caption variant="muted">
                        {Math.round(workout.totalVolume / 1000)}k lbs volume
                      </Caption>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-silver-400 shrink-0 ml-2" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
