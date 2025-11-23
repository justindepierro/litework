"use client";

import React, { useState, useEffect } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import { Package, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Label, Caption } from "@/components/ui/Typography";
import {
  WorkoutExercise,
  ExerciseGroup,
  BlockInstance,
  WorkoutBlock,
} from "@/types";

interface BlockInstanceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  blockInstance: BlockInstance;
  workout: {
    exercises: WorkoutExercise[];
    groups?: ExerciseGroup[];
  };
  onSave: (
    updatedExercises: WorkoutExercise[],
    updatedGroups: ExerciseGroup[],
    updatedInstance: BlockInstance
  ) => void;
}

export default function BlockInstanceEditor({
  isOpen,
  onClose,
  blockInstance,
  workout,
  onSave,
}: BlockInstanceEditorProps) {
  const [instanceName, setInstanceName] = useState(
    blockInstance.instanceName || blockInstance.sourceBlockName
  );
  const [notes, setNotes] = useState(blockInstance.notes || "");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [sourceBlock, setSourceBlock] = useState<WorkoutBlock | null>(null);
  const { isLoading: isLoadingTemplate, execute } = useAsyncState<void>();

  // Load exercises and groups for this block instance
  useEffect(() => {
    if (isOpen) {
      const instanceExercises = workout.exercises.filter(
        (ex) => ex.blockInstanceId === blockInstance.id
      );
      const instanceGroups = (workout.groups || []).filter(
        (g) => g.blockInstanceId === blockInstance.id
      );

      setExercises(instanceExercises);
      setGroups(instanceGroups);
      setInstanceName(
        blockInstance.instanceName || blockInstance.sourceBlockName
      );
      setNotes(blockInstance.notes || "");
    }
  }, [isOpen, blockInstance, workout]);

  // Load source block template for reset functionality
  useEffect(() => {
    if (isOpen && blockInstance.sourceBlockId) {
      execute(async () => {
        const response = await fetch(
          `/api/blocks/${blockInstance.sourceBlockId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSourceBlock(data.block);
        }
      });
    }
  }, [isOpen, blockInstance.sourceBlockId, execute]);

  const resetToTemplate = () => {
    if (!sourceBlock) return;

    const confirmed = window.confirm(
      "Reset this block to the original template? All customizations will be lost."
    );

    if (!confirmed) return;

    // Generate new IDs but keep the block instance ID
    const timestamp = Date.now();
    const maxOrder = Math.max(
      ...workout.exercises
        .filter((ex) => ex.blockInstanceId !== blockInstance.id)
        .map((ex) => ex.order),
      0
    );
    const maxGroupOrder = Math.max(
      ...(workout.groups || [])
        .filter((g) => g.blockInstanceId !== blockInstance.id)
        .map((g) => g.order),
      0
    );

    // Clone template exercises
    const resetExercises = sourceBlock.exercises.map((ex, index) => ({
      ...ex,
      id: `${timestamp}-reset-ex-${index}`,
      order: maxOrder + index + 1,
      groupId: ex.groupId
        ? `${timestamp}-reset-group-${ex.groupId}`
        : undefined,
      blockInstanceId: blockInstance.id,
    }));

    // Clone template groups
    const resetGroups = (sourceBlock.groups || []).map((group, index) => ({
      ...group,
      id: `${timestamp}-reset-group-${group.id}`,
      order: maxGroupOrder + index + 1,
      blockInstanceId: blockInstance.id,
    }));

    setExercises(resetExercises);
    setGroups(resetGroups);
    setInstanceName(sourceBlock.name);
    setNotes("");
  };

  const handleSave = () => {
    // Track customizations
    const originalExercises = workout.exercises.filter(
      (ex) => ex.blockInstanceId === blockInstance.id
    );
    const originalGroups = (workout.groups || []).filter(
      (g) => g.blockInstanceId === blockInstance.id
    );

    // Find what changed
    const modifiedExercises = exercises
      .filter((ex) => {
        const original = originalExercises.find((o) => o.id === ex.id);
        return original && JSON.stringify(original) !== JSON.stringify(ex);
      })
      .map((ex) => ex.id);

    const addedExercises = exercises
      .filter((ex) => !originalExercises.find((o) => o.id === ex.id))
      .map((ex) => ex.id);

    const removedExercises = originalExercises
      .filter((ex) => !exercises.find((e) => e.id === ex.id))
      .map((ex) => ex.id);

    const modifiedGroups = groups
      .filter((g) => {
        const original = originalGroups.find((o) => o.id === g.id);
        return original && JSON.stringify(original) !== JSON.stringify(g);
      })
      .map((g) => g.id);

    const addedGroups = groups
      .filter((g) => !originalGroups.find((o) => o.id === g.id))
      .map((g) => g.id);

    const removedGroups = originalGroups
      .filter((g) => !groups.find((gr) => gr.id === g.id))
      .map((g) => g.id);

    // Update block instance
    const updatedInstance: BlockInstance = {
      ...blockInstance,
      instanceName:
        instanceName !== blockInstance.sourceBlockName
          ? instanceName
          : undefined,
      notes,
      customizations: {
        modifiedExercises,
        addedExercises,
        removedExercises,
        modifiedGroups,
        addedGroups,
        removedGroups,
      },
      estimatedDuration: exercises.reduce((sum, ex) => {
        const exerciseTime =
          (ex.sets * ex.reps * 3 + (ex.restTime || 0) * ex.sets) / 60;
        return sum + exerciseTime;
      }, 0),
      updatedAt: new Date(),
    };

    onSave(exercises, groups, updatedInstance);
    onClose();
  };

  if (!isOpen) return null;

  const hasCustomizations =
    blockInstance.customizations.modifiedExercises.length > 0 ||
    blockInstance.customizations.addedExercises.length > 0 ||
    blockInstance.customizations.removedExercises.length > 0 ||
    blockInstance.customizations.modifiedGroups.length > 0 ||
    blockInstance.customizations.addedGroups.length > 0 ||
    blockInstance.customizations.removedGroups.length > 0;

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader
          title="Customize Block Instance"
          subtitle={`Template: ${blockInstance.sourceBlockName}`}
          onClose={onClose}
          icon={<Package className="w-5 h-5 text-accent-blue-600" />}
        />

        <ModalContent>
          {/* Info Banner */}
          {hasCustomizations && (
            <Alert variant="info" title="This block has been customized">
              Changes made here only affect this workout. The original template
              remains unchanged.
            </Alert>
          )}

          {/* Instance Name */}
          <div>
            <Input
              label="Instance Name (Optional)"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder={blockInstance.sourceBlockName}
              helperText='Give this instance a custom name (e.g., "Week 3 Progression" or "Beginner Variation")'
            />
          </div>

          {/* Notes */}
          <div>
            <Textarea
              label="Instance Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this specific instance..."
              rows={3}
            />
          </div>

          {/* Exercise Customization Summary */}
          <div className="bg-silver-50 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-silver-900 mb-3">Block Contents</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-silver-600">Exercises:</span>
                <span className="font-medium text-silver-900">
                  {exercises.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-600">Groups:</span>
                <span className="font-medium text-silver-900">
                  {groups.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-600">Estimated Duration:</span>
                <span className="font-medium text-silver-900">
                  {Math.round(
                    exercises.reduce((sum, ex) => {
                      const exerciseTime =
                        (ex.sets * ex.reps * 3 + (ex.restTime || 0) * ex.sets) /
                        60;
                      return sum + exerciseTime;
                    }, 0)
                  )}{" "}
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={resetToTemplate}
              disabled={isLoadingTemplate || !sourceBlock}
              variant="secondary"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset to Template
            </Button>
          </div>

          {/* Note about full editing */}
          <Alert variant="warning">
            <strong>Note:</strong> To modify individual exercises, sets, reps,
            or weights, close this dialog and edit the exercises directly in the
            workout editor. Changes will be tracked automatically.
          </Alert>
        </ModalContent>

        <ModalFooter align="between">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
