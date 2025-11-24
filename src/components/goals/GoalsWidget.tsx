"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Target, CheckCircle2, Loader2 } from "lucide-react";

interface GoalsWidgetProps {
  athleteId?: string;
  limit?: number;
  showAddButton?: boolean;
  onAddClick?: () => void;
  className?: string;
}

interface Goal {
  id: string;
  goal_type: string;
  title: string;
  description?: string;
  progress_percentage: number;
  status: string;
  deadline?: string;
  exercise?: {
    id: string;
    name: string;
  };
  current_value: number;
  target_weight?: number;
  target_volume?: number;
  target_frequency?: number;
  target_streak?: number;
  target_bodyweight?: number;
}

export function GoalsWidget({
  athleteId,
  limit = 3,
  showAddButton = true,
  onAddClick,
  className = "",
}: GoalsWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const params = new URLSearchParams({
          status: "active",
        });
        if (athleteId) {
          params.append("athleteId", athleteId);
        }

        const response = await fetch(`/api/goals?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.goals) {
            setGoals(data.goals.slice(0, limit));
          }
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [athleteId, limit]);

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case "strength":
        return "💪";
      case "volume":
        return "📊";
      case "frequency":
        return "📅";
      case "streak":
        return "🔥";
      case "bodyweight":
        return "⚖️";
      default:
        return "🎯";
    }
  };

  const getTargetDisplay = (goal: Goal) => {
    switch (goal.goal_type) {
      case "strength":
        return `${goal.current_value || 0} / ${goal.target_weight} lbs`;
      case "volume":
        return `${Math.round((goal.current_value || 0) / 1000)}k / ${Math.round((goal.target_volume || 0) / 1000)}k lbs`;
      case "frequency":
        return `${goal.current_value || 0} / ${goal.target_frequency} workouts/week`;
      case "streak":
        return `${goal.current_value || 0} / ${goal.target_streak} days`;
      case "bodyweight":
        return `${goal.current_value || 0} / ${goal.target_bodyweight} lbs`;
      default:
        return `${goal.progress_percentage}%`;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    if (days <= 7) return `${days} days left`;
    return `${Math.round(days / 7)} weeks left`;
  };

  if (isLoading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">Your Goals</Heading>
          {showAddButton && onAddClick && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onAddClick}
            >
              Add Goal
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-4 text-silver-400" />
          <Body variant="secondary">No active goals</Body>
          <Caption variant="muted" className="mt-2">
            Set goals to track your progress and stay motivated!
          </Caption>
          {showAddButton && onAddClick && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onAddClick}
              className="mt-4"
            >
              Create Your First Goal
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3">Your Goals</Heading>
        {showAddButton && onAddClick && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onAddClick}
          >
            Add Goal
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <Card key={goal.id} variant="default" padding="md">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-2xl shrink-0">
                  {getGoalIcon(goal.goal_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <Body className="font-semibold text-navy-900 mb-1 truncate">
                    {goal.title}
                  </Body>
                  {goal.exercise && (
                    <Caption variant="muted" className="truncate">
                      {goal.exercise.name}
                    </Caption>
                  )}
                </div>
              </div>
              {goal.deadline && (
                <Badge
                  variant={
                    getDaysUntilDeadline(goal.deadline).includes("day")
                      ? "warning"
                      : "info"
                  }
                  size="sm"
                  className="shrink-0 ml-2"
                >
                  {getDaysUntilDeadline(goal.deadline)}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <Caption variant="muted">Progress</Caption>
                <Caption className="font-semibold text-primary">
                  {goal.progress_percentage}%
                </Caption>
              </div>
              <div className="h-2 bg-silver-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-cyan-500 transition-all duration-500"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>
            </div>

            {/* Target Display */}
            <div className="flex items-center justify-between">
              <Caption variant="muted">{getTargetDisplay(goal)}</Caption>
              {goal.progress_percentage >= 100 && (
                <CheckCircle2 className="w-5 h-5 text-success" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {goals.length >= limit && (
        <div className="mt-4 text-center">
          <Caption variant="muted">
            Showing {limit} of your active goals
          </Caption>
        </div>
      )}
    </div>
  );
}
