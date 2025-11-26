"use client";

import React from "react";
import { WorkoutPlan, WorkoutExercise, ExerciseGroup } from "@/types";
import {
  Display,
  Heading,
  Body,
  Caption,
  Label,
} from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import {
  Dumbbell,
  Zap,
  RotateCcw,
  Target,
  Package,
  Clock,
  Hash,
  Weight,
} from "lucide-react";

interface WorkoutPreviewProps {
  workout: WorkoutPlan;
}

export const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout }) => {
  const ungroupedExercises = workout.exercises.filter((ex) => !ex.groupId);
  const groups = workout.groups || [];

  const getGroupIcon = (type: string) => {
    switch (type) {
      case "superset":
        return <Zap className="w-4 h-4" />;
      case "circuit":
        return <RotateCcw className="w-4 h-4" />;
      case "section":
        return <Target className="w-4 h-4" />;
      default:
        return <Dumbbell className="w-4 h-4" />;
    }
  };

  const renderExerciseDetails = (exercise: WorkoutExercise) => {
    const details: string[] = [];

    if (exercise.sets) details.push(`${exercise.sets} sets`);
    if (exercise.reps) details.push(`${exercise.reps} reps`);
    if (exercise.weight) details.push(`${exercise.weight} lbs`);
    if (exercise.restTime) details.push(`${exercise.restTime}s rest`);

    return details.length > 0 ? details.join(" • ") : "Not specified";
  };

  const renderBlockInstance = (blockInstanceId: string) => {
    const blockInstance = workout.blockInstances?.find(
      (b) => b.id === blockInstanceId
    );
    if (!blockInstance) return null;

    const blockExercises = workout.exercises.filter(
      (ex) => ex.blockInstanceId === blockInstanceId && !ex.groupId
    );
    const blockGroups = groups.filter(
      (g) => g.blockInstanceId === blockInstanceId
    );

    return (
      <div
        key={blockInstanceId}
        className="border-2 border-accent-purple-300 rounded-lg bg-accent-purple-50/50 p-4 mb-4"
      >
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-5 h-5 text-accent-purple-600" />
          <Heading level="h4">
            {blockInstance.instanceName || blockInstance.sourceBlockName}
          </Heading>
        </div>

        {blockInstance.notes && (
          <Body variant="secondary" size="sm" className="italic mb-3 pl-7">
            {blockInstance.notes}
          </Body>
        )}

        <div className="pl-7 space-y-3">
          {blockExercises.map((ex, idx) => (
            <div
              key={ex.id}
              className="bg-white rounded-lg p-3 border border-silver-200"
            >
              <div className="flex items-start space-x-3">
                <Caption variant="muted" className="mt-1">
                  {idx + 1}.
                </Caption>
                <div className="flex-1">
                  <Body weight="medium">{ex.exerciseName}</Body>
                  <Caption variant="muted" className="mt-1">
                    {renderExerciseDetails(ex)}
                  </Caption>
                  {ex.notes && (
                    <Caption variant="muted" className="italic mt-1">
                      Note: {ex.notes}
                    </Caption>
                  )}
                  {ex.kpiTagIds && ex.kpiTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ex.kpiTagIds.map((tagId: string) => (
                        <Badge key={tagId} variant="info" size="sm">
                          {tagId}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {blockGroups.map((group) => renderGroup(group))}
        </div>
      </div>
    );
  };

  const renderGroup = (group: ExerciseGroup) => {
    const groupExercises = workout.exercises.filter(
      (ex) => ex.groupId === group.id
    );

    return (
      <div
        key={group.id}
        className="border-2 border-accent-blue-300 rounded-lg bg-accent-blue-50/50 p-4 mb-3"
      >
        <div className="flex items-center space-x-2 mb-3">
          {getGroupIcon(group.type)}
          <Heading level="h4">{group.name}</Heading>
          <Badge
            variant={
              group.type === "superset"
                ? "warning"
                : group.type === "circuit"
                  ? "success"
                  : "info"
            }
            size="sm"
          >
            {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
          </Badge>
        </div>

        {group.notes && (
          <Body variant="secondary" size="sm" className="italic mb-3 pl-7">
            {group.notes}
          </Body>
        )}

        <div className="pl-7 space-y-2">
          {groupExercises.map((ex, idx) => (
            <div
              key={ex.id}
              className="bg-white rounded-lg p-3 border border-silver-200"
            >
              <div className="flex items-start space-x-3">
                <Caption variant="muted" className="mt-1">
                  {String.fromCharCode(65 + idx)}.
                </Caption>
                <div className="flex-1">
                  <Body weight="medium">{ex.exerciseName}</Body>
                  <Caption variant="muted" className="mt-1">
                    {renderExerciseDetails(ex)}
                  </Caption>
                  {ex.notes && (
                    <Caption variant="muted" className="italic mt-1">
                      Note: {ex.notes}
                    </Caption>
                  )}
                  {ex.kpiTagIds && ex.kpiTagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ex.kpiTagIds.map((tagId: string) => (
                        <Badge key={tagId} variant="info" size="sm">
                          {tagId}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Group-level rest info */}
        <div className="pl-7 mt-3 flex flex-wrap gap-3">
          {group.rounds && (
            <div className="flex items-center space-x-1">
              <RotateCcw className="w-3.5 h-3.5 text-silver-500" />
              <Caption variant="muted">{group.rounds} rounds</Caption>
            </div>
          )}
          {group.restBetweenExercises && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-silver-500" />
              <Caption variant="muted">
                {group.restBetweenExercises}s between exercises
              </Caption>
            </div>
          )}
          {group.restBetweenRounds && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-silver-500" />
              <Caption variant="muted">
                {group.restBetweenRounds}s between rounds
              </Caption>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get unique block instances
  const blockInstanceIds = Array.from(
    new Set(
      workout.exercises
        .filter((ex) => ex.blockInstanceId)
        .map((ex) => ex.blockInstanceId!)
    )
  );

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
      {/* Workout Header */}
      <div className="border-b border-silver-200 pb-4">
        <Display size="sm">{workout.name || "Untitled Workout"}</Display>
        {workout.description && (
          <Body variant="secondary" className="mt-2">
            {workout.description}
          </Body>
        )}
      </div>

      {/* Block Instances */}
      {blockInstanceIds.map((blockInstanceId) =>
        renderBlockInstance(blockInstanceId)
      )}

      {/* Grouped Exercises (not in blocks) */}
      {groups
        .filter((g) => !g.blockInstanceId)
        .map((group) => renderGroup(group))}

      {/* Ungrouped Exercises (not in blocks or groups) */}
      {ungroupedExercises
        .filter((ex) => !ex.blockInstanceId)
        .map((ex, idx) => (
          <div
            key={ex.id}
            className="bg-white rounded-lg p-4 border border-silver-200"
          >
            <div className="flex items-start space-x-3">
              <Caption variant="muted" className="mt-1">
                {idx + 1}.
              </Caption>
              <div className="flex-1">
                <Body weight="medium">{ex.exerciseName}</Body>
                <Caption variant="muted" className="mt-1">
                  {renderExerciseDetails(ex)}
                </Caption>
                {ex.notes && (
                  <Caption variant="muted" className="italic mt-1">
                    Note: {ex.notes}
                  </Caption>
                )}
                {ex.kpiTagIds && ex.kpiTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ex.kpiTagIds.map((tagId: string) => (
                      <Badge key={tagId} variant="info" size="sm">
                        {tagId}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

      {/* Empty State */}
      {workout.exercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 mx-auto text-silver-400 mb-3" />
          <Body variant="secondary">No exercises added yet</Body>
        </div>
      )}
    </div>
  );
};
