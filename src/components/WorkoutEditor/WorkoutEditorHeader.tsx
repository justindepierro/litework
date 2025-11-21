import React from "react";
import { Input } from "@/components/ui/Input";
import { WorkoutPlan } from "@/types";

interface WorkoutEditorHeaderProps {
  workout: WorkoutPlan;
  onChange: (workout: WorkoutPlan) => void;
  onClose: () => void;
}

/**
 * Header component for WorkoutEditor
 * Displays workout name input and close button
 */
export const WorkoutEditorHeader: React.FC<WorkoutEditorHeaderProps> = ({
  workout,
  onChange,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-6 border-b border-silver-200 bg-silver-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 pr-4">
          <Input
            label="Workout Name"
            type="text"
            value={workout.name || ""}
            onChange={(e) => {
              const newName = e.target.value;
              onChange({ ...workout, name: newName });
            }}
            placeholder="Enter workout name..."
            className="text-xl sm:text-lg font-bold"
            fullWidth
          />
        </div>
        <button
          onClick={onClose}
          className="text-silver-500 hover:text-silver-700 text-3xl sm:text-2xl w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl hover:bg-silver-100 transition-colors touch-manipulation shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
};
