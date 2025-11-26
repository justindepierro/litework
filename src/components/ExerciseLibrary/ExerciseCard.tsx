"use client";

import { memo } from "react";
import { Star, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import type { Exercise } from "@/hooks/useExerciseLibraryState";

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (exercise: Exercise) => void;
  getDifficultyColor: (level: number) => string;
  getDifficultyLabel: (level: number) => string;
}

function ExerciseCardComponent({
  exercise,
  isSelected,
  onSelect,
  getDifficultyColor,
  getDifficultyLabel,
}: ExerciseCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "border-(--accent-blue-500) bg-(--accent-blue-50)"
          : "border-silver-300 hover:border-silver-400"
      }`}
      onClick={() => onSelect(exercise)}
    >
      {/* Exercise Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Heading level="h3" className="mb-1">
            {exercise.name}
          </Heading>
          <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-secondary)">
            <Badge
              style={{
                backgroundColor: exercise.category_color,
                color: "white",
              }}
              size="sm"
            >
              {exercise.category_name}
            </Badge>
            <Caption className={getDifficultyColor(exercise.difficulty_level)}>
              {getDifficultyLabel(exercise.difficulty_level)}
            </Caption>
          </div>
        </div>
        {exercise.usage_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-(--text-secondary)">
            <Star className="w-3 h-3" />
            <span>{exercise.usage_count}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {exercise.description && (
        <Body size="sm" variant="secondary" className="mb-3 line-clamp-2">
          {exercise.description}
        </Body>
      )}

      {/* Muscle Groups */}
      {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.muscle_groups.slice(0, 3).map((muscle, idx) => (
            <Caption
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-(--bg-tertiary) text-(--text-secondary)"
            >
              <Target className="w-3 h-3 mr-1" />
              {muscle.name}
            </Caption>
          ))}
          {exercise.muscle_groups.length > 3 && (
            <Caption className="inline-flex items-center px-2 py-0.5 rounded-full bg-(--bg-tertiary) text-(--text-secondary)">
              +{exercise.muscle_groups.length - 3} more
            </Caption>
          )}
        </div>
      )}

      {/* Equipment & Attributes */}
      <div className="flex flex-wrap items-center gap-2">
        {exercise.is_compound && (
          <Caption className="inline-flex items-center px-2 py-1 rounded bg-(--status-info-light) text-(--status-info)">
            <Zap className="w-3 h-3 mr-1" />
            Compound
          </Caption>
        )}
        {exercise.is_bodyweight && (
          <Caption className="inline-flex items-center px-2 py-1 rounded bg-(--status-success-light) text-(--status-success)">
            Bodyweight
          </Caption>
        )}
        {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
          <Caption variant="muted">
            {exercise.equipment_needed.slice(0, 2).join(", ")}
            {exercise.equipment_needed.length > 2 &&
              ` +${exercise.equipment_needed.length - 2}`}
          </Caption>
        )}
      </div>
    </div>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export const ExerciseCard = memo(
  ExerciseCardComponent,
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.exercise.id === nextProps.exercise.id &&
      prevProps.exercise.usage_count === nextProps.exercise.usage_count &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);
