"use client";

import { WorkoutPlan } from "@/types";
import DateTimePicker from "./DateTimePicker";
import { Select } from "@/components/ui/Input";
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { Card } from "@/components/ui/Card";

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
        <Select
          label="Select Workout"
          value={selectedWorkoutId}
          onChange={(e) => onWorkoutChange(e.target.value)}
          options={[
            { value: "", label: "Choose a workout..." },
            ...workoutPlans.map((workout) => ({
              value: workout.id,
              label: `${workout.name} (${workout.estimatedDuration} min)`,
            })),
          ]}
          fullWidth
        />
        {workoutError && (
          <p className="text-red-500 text-sm mt-1">{workoutError}</p>
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
        {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
      </div>

      {/* Location */}
      <FloatingLabelInput
        label="Location (optional)"
        type="text"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        fullWidth
      />

      {/* Notes */}
      <FloatingLabelTextarea
        label="Session Notes (Optional)"
        placeholder={notesPlaceholder}
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={notesRows}
        fullWidth
      />

      {/* Workout Preview */}
      {showWorkoutPreview && selectedWorkout && (
        <Card variant="default" padding="md">
          <h3 className="text-heading-secondary text-lg mb-3">
            Workout Preview
          </h3>
          <div className="space-y-2">
            {selectedWorkout.exercises.slice(0, 8).map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 text-sm"
              >
                <span className="text-body-small w-6">{index + 1}.</span>
                <span className="flex-1">{exercise.exerciseName}</span>
                <span className="text-body-small">
                  {exercise.sets}×{exercise.reps}
                  {exercise.weightType === "percentage" &&
                    exercise.percentage &&
                    ` @ ${exercise.percentage}%`}
                </span>
              </div>
            ))}
            {selectedWorkout.exercises.length > 8 && (
              <div className="text-body-small text-silver-600 text-center pt-2">
                +{selectedWorkout.exercises.length - 8} more exercises
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
