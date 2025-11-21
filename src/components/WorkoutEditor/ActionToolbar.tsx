import React from "react";
import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";
import { Plus, Package, Users, Zap } from "lucide-react";
import { WorkoutExercise } from "@/types";

interface ActionToolbarProps {
  // Selection state
  selectionMode: boolean;
  selectedCount: number;
  ungroupedExercisesCount: number;
  
  // Exercise operations
  onAddExercise: () => void;
  onAddBlock: () => void;
  onEnterSelectionMode: () => void;
  
  // Selection operations
  onSelectAll: () => void;
  onCreateGroup: () => void;
  onCancelSelection: () => void;
  
  // Save operations
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

/**
 * Toolbar component for WorkoutEditor
 * Handles action buttons and selection mode UI
 */
export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  selectionMode,
  selectedCount,
  ungroupedExercisesCount,
  onAddExercise,
  onAddBlock,
  onEnterSelectionMode,
  onSelectAll,
  onCreateGroup,
  onCancelSelection,
  onSave,
  isSaving,
  canSave,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-2 flex-wrap">
        {!selectionMode ? (
          <>
            <Button
              onClick={onAddBlock}
              variant="primary"
              leftIcon={<Package className="w-5 h-5 sm:w-4 sm:h-4" />}
              className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium bg-linear-to-r from-accent-purple-600 to-accent-blue-600 hover:from-accent-purple-700 hover:to-accent-blue-700"
            >
              Add Block
            </Button>

            <Button
              onClick={onAddExercise}
              variant="primary"
              leftIcon={<Plus className="w-5 h-5 sm:w-4 sm:h-4" />}
              className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
            >
              Add Exercise
            </Button>

            {ungroupedExercisesCount > 0 && (
              <Button
                onClick={onEnterSelectionMode}
                variant="success"
                leftIcon={<Users className="w-5 h-5 sm:w-4 sm:h-4" />}
              >
                Group Exercises
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="col-span-full bg-accent-blue-50 border-2 border-accent-blue-300 rounded-lg p-3">
              <Body size="sm" className="text-accent-blue-800 font-medium">
                {selectedCount === 0
                  ? "Select exercises to group together"
                  : `${selectedCount} exercise${selectedCount > 1 ? "s" : ""} selected`}
              </Body>
            </div>

            <Button
              onClick={onSelectAll}
              variant="secondary"
              className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
            >
              Select All
            </Button>

            <Button
              onClick={onCreateGroup}
              disabled={selectedCount < 2}
              variant="primary"
              leftIcon={<Zap className="w-5 h-5 sm:w-4 sm:h-4" />}
              className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
            >
              Create Group
            </Button>

            <Button onClick={onCancelSelection} variant="danger">
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Save Workout Button - Separate Row */}
      {!selectionMode && (
        <Button
          onClick={onSave}
          disabled={isSaving || !canSave}
          variant="primary"
          fullWidth
          className="py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-bold bg-linear-to-r from-success to-accent-green-600 hover:from-success hover:to-accent-green-700 border-2 border-success"
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            "Save Workout"
          )}
        </Button>
      )}
    </div>
  );
};
