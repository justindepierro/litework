import React from "react";
import { Heading } from "@/components/ui/Typography";
import { StepperInput } from "@/components/ui/StepperInput";
import { CheckCircle, Clock } from "lucide-react";
import { ExerciseProgress } from "@/types/session";

interface ExerciseCardProps {
  exercise: ExerciseProgress;
  weight: number;
  reps: number;
  rpe: number;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onRpeChange: (value: number) => void;
  onCompleteSet: () => void;
}

export const ExerciseCard = React.memo(function ExerciseCard({
  exercise,
  weight,
  reps,
  rpe,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onCompleteSet,
}: ExerciseCardProps) {
  const lastSet =
    exercise.set_records.length > 0
      ? exercise.set_records[exercise.set_records.length - 1]
      : null;

  const handleCopyLastSet = () => {
    if (!lastSet) return;
    if (lastSet.weight) onWeightChange(lastSet.weight);
    onRepsChange(lastSet.reps);
    if (lastSet.rpe) onRpeChange(lastSet.rpe);
  };

  return (
    <div className="shrink-0 bg-surface border-t-2 border-neutral-light shadow-2xl">
      <div className="px-4 py-4 pb-safe">
        {/* Active Exercise Summary Card */}
        <div className="mb-4 p-4 bg-gradient-subtle-blue border-2 border-accent-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Heading level="h3" className="flex-1 pr-2">
              {exercise.exercise_name}
            </Heading>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {exercise.sets_completed + 1}
              </div>
              <div className="text-xs text-secondary font-medium">
                of {exercise.sets_target}
              </div>
            </div>
          </div>

          {/* Target and Progress */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-lg">
              <span className="text-navy-600">Target:</span>
              <span className="font-semibold text-navy-700">
                {exercise.sets_target} × {exercise.reps_target}
                {exercise.weight_target &&
                  ` @ ${exercise.weight_target} lbs`}
              </span>
            </div>
            {exercise.rest_seconds > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-white/80 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-navy-600" />
                <span className="font-medium text-navy-600">
                  {exercise.rest_seconds}s
                </span>
              </div>
            )}
          </div>

          {/* Last Set Display + Quick Copy */}
          {lastSet && (
            <div className="mt-3">
              {/* Last Set Info */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wide">
                  Last Set
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-accent-blue-500">
                    {lastSet.weight || 0} lbs
                  </span>
                  <span className="text-navy-500">×</span>
                  <span className="font-bold text-navy-700">
                    {lastSet.reps} reps
                  </span>
                  {lastSet.rpe && (
                    <span className="text-xs font-medium text-brand px-1.5 py-0.5 bg-brand-lighter rounded">
                      RPE {lastSet.rpe}
                    </span>
                  )}
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyLastSet}
                className="w-full py-2 bg-white hover:bg-accent-blue-50 active:bg-accent-blue-100 border-2 border-accent-blue-200 text-accent-blue-700 rounded-lg font-medium text-sm active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span className="text-base">↻</span>
                <span>Copy to Inputs</span>
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Input Layout */}
        <div className="space-y-3 mb-4">
          {/* Weight and Reps side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <StepperInput
              label="Weight"
              value={weight}
              onChange={onWeightChange}
              step={5}
              min={0}
              unit="lbs"
            />
            <StepperInput
              label="Reps"
              value={reps}
              onChange={onRepsChange}
              step={1}
              min={0}
            />
          </div>

          {/* RPE full width below */}
          <StepperInput
            label="RPE (Effort)"
            value={rpe}
            onChange={onRpeChange}
            step={1}
            min={1}
            max={10}
          />
        </div>

        {/* Complete Set Button - Larger */}
        <button
          onClick={onCompleteSet}
          className="w-full py-5 bg-gradient-cta-blue text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          style={{ minHeight: "64px" }}
        >
          <CheckCircle className="w-7 h-7" />
          Complete Set
        </button>
      </div>
    </div>
  );
});
