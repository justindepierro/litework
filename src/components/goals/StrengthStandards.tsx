"use client";

import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface StrengthStandardsProps {
  athleteId?: string;
  exerciseId?: string;
  className?: string;
}

interface Standard {
  level: string;
  weight: number;
  color: string;
  bgColor: string;
}

// Simplified strength standards (ExRx-inspired)
// In production, fetch from strength_standards table or API
const STRENGTH_STANDARDS: Record<
  string,
  { bodyweightMultiplier: Record<string, number> }
> = {
  "Back Squat": {
    bodyweightMultiplier: {
      untrained: 0.5,
      novice: 0.75,
      intermediate: 1.25,
      advanced: 1.75,
      elite: 2.25,
    },
  },
  "Bench Press": {
    bodyweightMultiplier: {
      untrained: 0.4,
      novice: 0.6,
      intermediate: 1.0,
      advanced: 1.5,
      elite: 1.9,
    },
  },
  Deadlift: {
    bodyweightMultiplier: {
      untrained: 0.75,
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: 2.5,
    },
  },
};

export function StrengthStandards({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  athleteId: _athleteId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exerciseId: _exerciseId,
  className = "",
}: StrengthStandardsProps) {
  // Mock data - in production, fetch from API
  // TODO: Use athleteId and exerciseId to fetch real data
  const currentWeight = 225; // Current 1RM
  const bodyweight = 185; // Athlete bodyweight
  const exerciseName = "Bench Press";

  const standards = STRENGTH_STANDARDS[exerciseName];
  if (!standards) {
    return null;
  }

  const levels: Standard[] = [
    {
      level: "Untrained",
      weight: Math.round(bodyweight * standards.bodyweightMultiplier.untrained),
      color: "text-silver-600",
      bgColor: "bg-silver-200",
    },
    {
      level: "Novice",
      weight: Math.round(bodyweight * standards.bodyweightMultiplier.novice),
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      level: "Intermediate",
      weight: Math.round(
        bodyweight * standards.bodyweightMultiplier.intermediate
      ),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      level: "Advanced",
      weight: Math.round(bodyweight * standards.bodyweightMultiplier.advanced),
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      level: "Elite",
      weight: Math.round(bodyweight * standards.bodyweightMultiplier.elite),
      color: "text-error",
      bgColor: "bg-error/10",
    },
  ];

  // Determine current level
  let currentLevel = "Untrained";
  for (let i = levels.length - 1; i >= 0; i--) {
    if (currentWeight >= levels[i].weight) {
      currentLevel = levels[i].level;
      break;
    }
  }

  // Find next milestone
  const currentLevelIndex = levels.findIndex((l) => l.level === currentLevel);
  const nextLevel = levels[currentLevelIndex + 1];
  const progressToNext = nextLevel
    ? Math.round(
        ((currentWeight - levels[currentLevelIndex].weight) /
          (nextLevel.weight - levels[currentLevelIndex].weight)) *
          100
      )
    : 100;

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="mb-6">
        <Heading level="h3" className="mb-1">
          Strength Standards
        </Heading>
        <Caption variant="muted">
          {exerciseName} • {bodyweight} lbs bodyweight
        </Caption>
      </div>

      {/* Current Level Badge */}
      <div className="mb-6 p-4 bg-primary/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <Body className="font-semibold text-navy-900">
              Current Level: {currentLevel}
            </Body>
          </div>
          <Badge variant="info" size="md">
            {currentWeight} lbs
          </Badge>
        </div>

        {nextLevel && (
          <>
            <Caption variant="muted" className="mb-2">
              {progressToNext}% to {nextLevel.level} ({nextLevel.weight} lbs)
            </Caption>
            <div className="h-2 bg-silver-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-cyan-500 transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Standards List */}
      <div className="space-y-2">
        {levels.map((standard) => {
          const isCurrentLevel = standard.level === currentLevel;
          const isAchieved = currentWeight >= standard.weight;
          const isNextTarget = nextLevel?.level === standard.level;

          return (
            <div
              key={standard.level}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isCurrentLevel
                  ? standard.bgColor
                  : isAchieved
                    ? "bg-success/5"
                    : "bg-silver-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {isAchieved ? (
                  <TrendingUp className={`w-5 h-5 ${standard.color}`} />
                ) : (
                  <TrendingDown className="w-5 h-5 text-silver-400" />
                )}
                <div>
                  <Body
                    className={`font-semibold ${
                      isCurrentLevel ? standard.color : "text-navy-900"
                    }`}
                  >
                    {standard.level}
                  </Body>
                  {isCurrentLevel && (
                    <Caption className="text-primary">Your Level</Caption>
                  )}
                  {isNextTarget && !isCurrentLevel && (
                    <Caption variant="muted">Next Goal</Caption>
                  )}
                </div>
              </div>
              <Body
                className={`font-semibold ${
                  isAchieved ? standard.color : "text-silver-500"
                }`}
              >
                {standard.weight} lbs
              </Body>
            </div>
          );
        })}
      </div>

      <Caption variant="muted" className="mt-4 text-center">
        Standards based on ExRx guidelines
      </Caption>
    </Card>
  );
}
