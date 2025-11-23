"use client";

import { WorkoutPlan } from "@/types";
import DateTimePicker from "./DateTimePicker";
import { Card } from "@/components/ui/Card";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface WorkoutAssignmentFormProps {
  // Workout selection
  selectedWorkoutId: string;
  onWorkoutChange: (workoutId: string) => void;
  workoutPlans: WorkoutPlan[];
  workoutError?: string;

  // Date & Time
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  timeError?: string;

  // Optional fields
  location: string;
  onLocationChange: (location: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;

  // Display options
  showWorkoutPreview?: boolean;
  notesPlaceholder?: string;
  notesRows?: number;
}

export default function WorkoutAssignmentForm({
  selectedWorkoutId,
  onWorkoutChange,
  workoutPlans,
  workoutError,
  selectedDate,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  timeError,
  location,
  onLocationChange,
  notes,
  onNotesChange,
  showWorkoutPreview = true,
  notesPlaceholder = "Add notes or instructions...",
  notesRows = 3,
}: WorkoutAssignmentFormProps) {
  const selectedWorkout = workoutPlans.find((w) => w.id === selectedWorkoutId);

  return (
    <div className="space-y-6">
      {/* Workout Selection */}
      <div>
        <label className="block text-body-primary font-medium mb-2">
          Select Workout <span className="text-error">*</span>
        </label>
        <select
          value={selectedWorkoutId}
          onChange={(e) => onWorkoutChange(e.target.value)}
          className="w-full px-3 py-2 border border-silver-400 rounded-md bg-white text-body-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-required="true"
          aria-invalid={!!workoutError}
          aria-describedby={workoutError ? "workout-error" : undefined}
        >
          <option value="">Choose a workout...</option>
          {workoutPlans.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.name} ({workout.estimatedDuration} min)
            </option>
          ))}
        </select>
        {workoutError && (
          <Caption
            id="workout-error"
            variant="error"
            className="mt-1"
            role="alert"
          >
            {workoutError}
          </Caption>
        )}
      </div>

      {/* Date & Time Picker */}
      <div>
        <DateTimePicker
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={onDateChange}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
          showTimePicker={true}
        />
        {timeError && (
          <Caption variant="error" className="mt-1" role="alert">
            {timeError}
          </Caption>
        )}
      </div>

      {/* Location */}
      <div>
        <Input
          label="Location (optional)"
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="e.g., Weight Room, Field House"
        />
      </div>

      {/* Notes */}
      <div>
        <Textarea
          label="Session Notes (Optional)"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={notesRows}
          placeholder={notesPlaceholder}
        />
      </div>

      {/* Workout Preview */}
      {showWorkoutPreview && selectedWorkout && (
        <Card variant="default" padding="md">
          <Heading level="h3" className="mb-3">
            Workout Preview
          </Heading>
          <div className="space-y-2">
            {selectedWorkout.exercises.slice(0, 8).map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 text-sm"
              >
                <Caption variant="muted" className="w-6">
                  {index + 1}.
                </Caption>
                <Body className="flex-1">{exercise.exerciseName}</Body>
                <Caption variant="muted">
                  {exercise.sets}×{exercise.reps}
                  {exercise.weightType === "percentage" &&
                    exercise.percentage &&
                    ` @ ${exercise.percentage}%`}
                </Caption>
              </div>
            ))}
            {selectedWorkout.exercises.length > 8 && (
              <Body variant="secondary" className="text-center pt-2">
                +{selectedWorkout.exercises.length - 8} more exercises
              </Body>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
