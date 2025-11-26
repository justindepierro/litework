"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import {
  Plus,
  Trash2,
  Edit3,
  Users,
  Zap,
  RotateCcw,
  Target,
  Dumbbell,
  ChevronDown,
  ChevronRight,
  Package,
  X,
  Eye,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/ToastProvider";
import {
  WorkoutPlan,
  WorkoutExercise,
  ExerciseGroup,
  WorkoutBlock,
  BlockInstance,
  KPITag,
} from "@/types";
import { apiClient } from "@/lib/api-client";
import ExerciseLibraryPanel from "./ExerciseLibraryPanel";
import { Badge } from "@/components/ui/Badge";
import BlockLibrary from "./BlockLibrary";
import BlockEditor from "./BlockEditor";
import BlockInstanceEditor from "./BlockInstanceEditor";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ExerciseItem } from "./workout-editor/ExerciseItem";
import { Label, Caption, Body, Heading } from "@/components/ui/Typography";
import { useExerciseOperations } from "@/hooks/useExerciseOperations";
import { useGroupOperations } from "@/hooks/useGroupOperations";
import { useExerciseSelection } from "@/hooks/useExerciseSelection";
import { useBlockOperations } from "@/hooks/useBlockOperations";
import { WorkoutEditorHeader, ActionToolbar } from "./WorkoutEditor/";
import { WorkoutPreview } from "./WorkoutEditor/WorkoutPreview";

interface WorkoutEditorProps {
  workout: WorkoutPlan;
  onChange: (workout: WorkoutPlan) => void;
  onClose: () => void;
}

// Block Instance Component - Shows blocks added to the workout
interface BlockInstanceItemProps {
  blockInstance: BlockInstance;
  exercises: WorkoutExercise[];
  groups: ExerciseGroup[];
  onCustomize: (blockInstance: BlockInstance) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: WorkoutExercise) => void;
  onMoveExercise: (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => void;
  onMoveExerciseToGroup: (exerciseId: string, targetGroupId?: string) => void;
  availableGroups: ExerciseGroup[];
  availableKPIs?: KPITag[];
  isLoadingKPIs?: boolean;
  onExerciseNameChange?: (name: string) => Promise<string>;
}

const BlockInstanceItem = React.memo<BlockInstanceItemProps>(
  ({
    blockInstance,
    exercises,
    groups,
    onCustomize,
    onDeleteExercise,
    onUpdateExercise,
    onMoveExercise,
    onMoveExerciseToGroup,
    availableGroups,
    availableKPIs = [],
    isLoadingKPIs = false,
    onExerciseNameChange,
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const blockExercises = exercises.filter(
      (ex) => ex.blockInstanceId === blockInstance.id && !ex.groupId
    );
    const blockGroups = groups.filter(
      (g) => g.blockInstanceId === blockInstance.id
    );

    const hasCustomizations =
      blockInstance.customizations.modifiedExercises.length > 0 ||
      blockInstance.customizations.addedExercises.length > 0 ||
      blockInstance.customizations.removedExercises.length > 0;

    return (
      <div className="border-2 border-accent-purple-300 rounded-lg bg-accent-purple-50/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
              className="p-1 text-silver-500 hover:text-accent-purple-600"
              aria-label={isCollapsed ? "Expand block" : "Collapse block"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            <Package className="w-4 h-4 text-accent-purple-600" />

            <div className="flex-1">
              <Body weight="medium">
                {blockInstance.instanceName || blockInstance.sourceBlockName}
              </Body>
              <Caption variant="muted">
                Block Template
                {hasCustomizations && (
                  <Badge variant="info" size="sm" className="ml-2">
                    Customized
                  </Badge>
                )}
              </Caption>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onCustomize(blockInstance)}
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="bg-accent-purple-600 hover:bg-accent-purple-700"
            >
              Customize
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="ml-6 space-y-3 mt-3 border-l-2 border-accent-purple-200 pl-4">
            {blockInstance.notes && (
              <Body
                variant="secondary"
                size="sm"
                className="italic bg-white/50 p-2 rounded"
              >
                {blockInstance.notes}
              </Body>
            )}

            {/* Block exercises (ungrouped) */}
            {blockExercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={0}
                onUpdate={onUpdateExercise}
                onDelete={onDeleteExercise}
                onMoveUp={() => onMoveExercise(exercise.id, "up")}
                onMoveDown={() => onMoveExercise(exercise.id, "down")}
                onMoveToGroup={(groupId) =>
                  onMoveExerciseToGroup(exercise.id, groupId)
                }
                availableGroups={availableGroups}
                availableKPIs={availableKPIs}
                isLoadingKPIs={isLoadingKPIs}
                canMoveUp={false}
                canMoveDown={false}
                onExerciseNameChange={onExerciseNameChange}
              />
            ))}

            {/* Block groups */}
            {blockGroups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                exercises={exercises}
                onUpdateGroup={() => {}}
                onDeleteGroup={() => {}}
                onUpdateExercise={onUpdateExercise}
                onDeleteExercise={onDeleteExercise}
                onMoveExercise={onMoveExercise}
                onMoveExerciseToGroup={onMoveExerciseToGroup}
                availableGroups={availableGroups}
                availableKPIs={availableKPIs}
                isLoadingKPIs={isLoadingKPIs}
                onExerciseNameChange={onExerciseNameChange}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

// Sortable Exercise Item Wrapper for drag-and-drop
interface SortableExerciseItemProps {
  exercise: WorkoutExercise;
  index: number;
  onUpdate: (exercise: WorkoutExercise) => void;
  onDelete: (exerciseId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToGroup: (groupId?: string) => void;
  availableGroups: ExerciseGroup[];
  availableKPIs?: KPITag[];
  isLoadingKPIs?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onExerciseNameChange?: (name: string) => Promise<string>;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (exerciseId: string) => void;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-silver-400 hover:text-silver-600 transition-colors rounded-lg hover:bg-silver-100"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <ExerciseItem {...props} />
        </div>
      </div>
    </div>
  );
};

// Exercise Group Component
interface GroupItemProps {
  group: ExerciseGroup;
  exercises: WorkoutExercise[];
  onUpdateGroup: (group: ExerciseGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateExercise: (exercise: WorkoutExercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveExercise: (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => void;
  onMoveExerciseToGroup: (exerciseId: string, targetGroupId?: string) => void;
  availableGroups: ExerciseGroup[];
  availableKPIs?: KPITag[];
  isLoadingKPIs?: boolean;
  onExerciseNameChange?: (name: string) => Promise<string>;
}

const GroupItem = React.memo<GroupItemProps>(
  ({
    group,
    exercises,
    onUpdateGroup,
    onDeleteGroup,
    onUpdateExercise,
    onDeleteExercise,
    onMoveExercise,
    onMoveExerciseToGroup,
    availableGroups,
    availableKPIs = [],
    isLoadingKPIs = false,
    onExerciseNameChange,
  }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedGroup, setEditedGroup] = useState(group);

    const groupExercises = exercises.filter((ex) => ex.groupId === group.id);

    const getGroupIcon = () => {
      switch (group.type) {
        case "superset":
          return <Zap className="w-4 h-4" />;
        case "circuit":
          return <RotateCcw className="w-4 h-4" />;
        case "section":
          return <Target className="w-4 h-4" />;
        default:
          return <Users className="w-4 h-4" />;
      }
    };

    const getGroupColor = () => {
      switch (group.type) {
        case "superset":
          return "border-accent-orange bg-accent-orange/5";
        case "circuit":
          return "border-accent-blue bg-accent-blue/5";
        case "section":
          return "border-accent-green bg-accent-green/5";
        default:
          return "border-silver-300 bg-silver-50";
      }
    };

    const saveGroup = () => {
      onUpdateGroup(editedGroup);
      setIsEditing(false);
    };

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-4 ${getGroupColor()}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
              className="p-1 text-silver-500 hover:text-accent-blue"
              aria-label={isCollapsed ? "Expand group" : "Collapse group"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {getGroupIcon()}

            {isEditing ? (
              <div className="flex flex-col space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={editedGroup.name}
                    onChange={(e) =>
                      setEditedGroup({ ...editedGroup, name: e.target.value })
                    }
                    placeholder="Group name"
                    inputSize="sm"
                    className="flex-1"
                  />
                  <Select
                    value={editedGroup.type}
                    onChange={(e) =>
                      setEditedGroup({
                        ...editedGroup,
                        type: e.target.value as
                          | "superset"
                          | "circuit"
                          | "section",
                      })
                    }
                    options={[
                      { value: "section", label: "Section" },
                      { value: "superset", label: "Superset" },
                      { value: "circuit", label: "Circuit" },
                    ]}
                    selectSize="sm"
                    className="w-auto"
                  />
                </div>

                {/* Rest Intervals */}
                <div className="flex items-center space-x-2 text-xs">
                  {(editedGroup.type === "circuit" ||
                    editedGroup.type === "superset") && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Caption variant="muted">
                          Rest between exercises:
                        </Caption>
                        <Input
                          type="number"
                          value={editedGroup.restBetweenExercises || ""}
                          onChange={(e) =>
                            setEditedGroup({
                              ...editedGroup,
                              restBetweenExercises:
                                parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="0"
                          min="0"
                          inputSize="sm"
                          className="w-16"
                        />
                        <Caption variant="muted">sec</Caption>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Caption variant="muted">Rest between rounds:</Caption>
                        <Input
                          type="number"
                          value={editedGroup.restBetweenRounds || ""}
                          onChange={(e) =>
                            setEditedGroup({
                              ...editedGroup,
                              restBetweenRounds:
                                parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="60"
                          min="0"
                          inputSize="sm"
                          className="w-16"
                        />
                        <Caption variant="muted">sec</Caption>
                      </div>
                    </>
                  )}

                  {editedGroup.type === "circuit" && (
                    <div className="flex items-center space-x-1">
                      <Caption variant="muted">Rounds:</Caption>
                      <Input
                        type="number"
                        value={editedGroup.rounds || ""}
                        onChange={(e) =>
                          setEditedGroup({
                            ...editedGroup,
                            rounds: parseInt(e.target.value) || undefined,
                          })
                        }
                        placeholder="3"
                        min="1"
                        inputSize="sm"
                        className="w-12"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={saveGroup}
                    variant="primary"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    size="sm"
                    className="text-xs px-2 py-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Heading level="h3">{group.name}</Heading>
                  <Caption variant="muted" className="capitalize">
                    ({group.type} - {groupExercises.length} exercises)
                  </Caption>
                </div>

                {/* Display rest intervals */}
                {(group.restBetweenExercises ||
                  group.restBetweenRounds ||
                  group.rounds) && (
                  <Caption
                    variant="muted"
                    className="flex items-center space-x-3"
                  >
                    {group.restBetweenExercises !== undefined && (
                      <span>Rest between: {group.restBetweenExercises}s</span>
                    )}
                    {group.restBetweenRounds !== undefined && (
                      <span>Rest after round: {group.restBetweenRounds}s</span>
                    )}
                    {group.rounds !== undefined && (
                      <span>{group.rounds} rounds</span>
                    )}
                  </Caption>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="ghost"
              size="sm"
              className="p-1 text-silver-500 hover:text-accent-blue"
              aria-label="Edit group"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onDeleteGroup(group.id)}
              variant="ghost"
              size="sm"
              className="p-1 text-silver-500 hover:text-accent-red-600"
              aria-label="Delete group"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="space-y-2">
            {groupExercises.map((exercise, index) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                groupId={group.id}
                onUpdate={onUpdateExercise}
                onDelete={onDeleteExercise}
                onMoveUp={() => onMoveExercise(exercise.id, "up", group.id)}
                onMoveDown={() => onMoveExercise(exercise.id, "down", group.id)}
                onMoveToGroup={onMoveExerciseToGroup.bind(null, exercise.id)}
                availableGroups={availableGroups.filter(
                  (g) => g.id !== group.id
                )}
                availableKPIs={availableKPIs}
                isLoadingKPIs={isLoadingKPIs}
                canMoveUp={index > 0}
                canMoveDown={index < groupExercises.length - 1}
                onExerciseNameChange={onExerciseNameChange}
              />
            ))}

            {groupExercises.length === 0 && (
              <Body
                variant="secondary"
                size="sm"
                className="text-center py-4 border-2 border-dashed border-silver-300 rounded-lg"
              >
                No exercises in this {group.type} yet
              </Body>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Group Creation Modal Component
interface GroupCreationModalProps {
  selectedCount: number;
  onClose: () => void;
  onCreateGroup: (
    groupType: "superset" | "circuit" | "section",
    rounds?: number,
    restBetweenExercises?: number,
    restBetweenRounds?: number
  ) => void;
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  selectedCount,
  onClose,
  onCreateGroup,
}) => {
  const [groupType, setGroupType] = useState<
    "superset" | "circuit" | "section"
  >("superset");
  const [rounds, setRounds] = useState<number | undefined>(undefined);
  const [restBetweenExercises, setRestBetweenExercises] = useState<
    number | undefined
  >(undefined);
  const [restBetweenRounds, setRestBetweenRounds] = useState<
    number | undefined
  >(undefined);

  const handleSubmit = () => {
    onCreateGroup(
      groupType,
      groupType === "circuit" ? rounds : undefined,
      restBetweenExercises,
      groupType === "circuit" ? restBetweenRounds : undefined
    );
  };

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <ModalHeader
          title={`Create Group from ${selectedCount} Exercises`}
          icon={<Users className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          <div className="space-y-6">
            {/* Group Type Selection */}
            <div>
              <Label className="block mb-3">Group Type</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setGroupType("superset")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    groupType === "superset"
                      ? "border-accent-blue-500 bg-accent-blue-50 text-accent-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <Body size="sm" weight="medium">
                    Superset
                  </Body>
                  <Caption variant="muted" className="mt-1">
                    2-4 exercises
                  </Caption>
                </button>

                <button
                  onClick={() => setGroupType("circuit")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    groupType === "circuit"
                      ? "border-accent-blue-500 bg-accent-blue-50 text-accent-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <RotateCcw className="w-6 h-6 mx-auto mb-2" />
                  <Body size="sm" weight="medium">
                    Circuit
                  </Body>
                  <Caption variant="muted" className="mt-1">
                    Multiple rounds
                  </Caption>
                </button>

                <button
                  onClick={() => setGroupType("section")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    groupType === "section"
                      ? "border-accent-blue-500 bg-accent-blue-50 text-accent-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <Target className="w-6 h-6 mx-auto mb-2" />
                  <Body size="sm" weight="medium">
                    Section
                  </Body>
                  <Caption variant="muted" className="mt-1">
                    Workout phase
                  </Caption>
                </button>
              </div>
            </div>

            {/* Rest Between Exercises */}
            <div>
              <Label className="block mb-2">
                Rest Between Exercises (seconds)
              </Label>
              <Input
                type="number"
                value={restBetweenExercises ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setRestBetweenExercises(
                    value === "" ? undefined : parseInt(value)
                  );
                }}
                placeholder="30"
                min="0"
                step="15"
                fullWidth
                selectOnFocus
              />
            </div>

            {/* Circuit-specific settings */}
            {groupType === "circuit" && (
              <>
                <div>
                  <Label className="block mb-2">Number of Rounds</Label>
                  <Input
                    type="number"
                    value={rounds ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRounds(value === "" ? undefined : parseInt(value));
                    }}
                    placeholder="3"
                    min="1"
                    max="10"
                    fullWidth
                    selectOnFocus
                  />
                </div>

                <div>
                  <Label className="block mb-2">
                    Rest Between Rounds (seconds)
                  </Label>
                  <Input
                    type="number"
                    value={restBetweenRounds ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRestBetweenRounds(
                        value === "" ? undefined : parseInt(value)
                      );
                    }}
                    placeholder="90"
                    min="0"
                    step="15"
                    fullWidth
                    selectOnFocus
                  />
                </div>
              </>
            )}
          </div>
        </ModalContent>
        <ModalFooter align="between">
          <Button onClick={onClose} variant="secondary" fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" fullWidth>
            Create Group
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
};

// Main Workout Editor Component
const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  workout,
  onChange,
  onClose,
}) => {
  // Toast notifications
  const toast = useToast();

  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);

  // KPI tags state
  const [availableKPIs, setAvailableKPIs] = useState<KPITag[]>([]);
  const [isLoadingKPIs, setIsLoadingKPIs] = useState(true);

  // State for saving
  const [isSaving, setIsSaving] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<WorkoutPlan[]>([workout]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update workout data - single source of truth through onChange
  const updateWorkout = useCallback(
    (updatedWorkout: WorkoutPlan) => {
      onChange(updatedWorkout);
      setHasUnsavedChanges(true);

      // Add to history for undo/redo
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(updatedWorkout);
        // Limit history to last 50 changes
        return newHistory.slice(-50);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [onChange, historyIndex]
  );

  // Initialize operation hooks
  const exerciseOps = useExerciseOperations(workout, updateWorkout);
  const groupOps = useGroupOperations(workout, updateWorkout);
  const selectionOps = useExerciseSelection();
  const blockOps = useBlockOperations(workout, updateWorkout);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
      toast.info("Undo applied");
    }
  }, [historyIndex, history, onChange, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
      toast.info("Redo applied");
    }
  }, [historyIndex, history, onChange, toast]);

  // Save workout to library
  const saveWorkout = async () => {
    if (!workout.name?.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    setIsSaving(true);
    toast.info("Saving workout...");

    try {
      // Auto-create any exercises that still have placeholder IDs
      const updatedExercises = await Promise.all(
        workout.exercises.map(async (ex) => {
          if (
            !ex.exerciseId ||
            ex.exerciseId.trim() === "" ||
            ex.exerciseId === "new-exercise"
          ) {
            // Create exercise in library
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[WorkoutEditor] Creating exercise in library: ${ex.exerciseName}`
              );
            }
            try {
              const response = await fetch("/api/exercises/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: ex.exerciseName.trim(),
                  category: "strength",
                }),
              });

              const data = await response.json();

              if (data.success && data.data) {
                return {
                  ...ex,
                  exerciseId: data.data.id,
                  exerciseName: data.data.name,
                };
              } else {
                throw new Error(data.error || "Failed to create exercise");
              }
            } catch (error) {
              throw error;
            }
          }
          return ex;
        })
      );

      // Update workout with new exercise IDs
      const workoutToSave = {
        ...workout,
        exercises: updatedExercises,
        name: workout.name.trim(),
        updatedAt: new Date(),
        _shouldSave: true, // Flag to tell parent to save to API
      } as WorkoutPlan & { _shouldSave: boolean };

      // Update the parent component's workout
      // This will trigger the parent's onChange which should handle the save
      onChange(workoutToSave);

      toast.success("Workout saved successfully!");
      setHasUnsavedChanges(false);
      // DON'T close here - let the parent handle closing after successful save
      // onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save workout. Please try again."
      );
      setIsSaving(false);
    }
  };

  // Fetch available KPI tags
  useEffect(() => {
    const fetchKPIs = async () => {
      setIsLoadingKPIs(true);
      try {
        const response = await fetch("/api/kpi-tags");
        if (response.ok) {
          const result = await response.json();
          setAvailableKPIs(result.data || []);
        }
      } catch (error) {
        console.error("[WorkoutEditor] Failed to fetch KPIs:", error);
        toast.error("Failed to load KPI tags");
      } finally {
        setIsLoadingKPIs(false);
      }
    };
    fetchKPIs();
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + S - Save
      if (modKey && e.key === "s") {
        e.preventDefault();
        saveWorkout();
        return;
      }

      // Cmd/Ctrl + E - Add Exercise
      if (modKey && e.key === "e") {
        e.preventDefault();
        exerciseOps.addExercise();
        toast.info("Exercise added");
        return;
      }

      // Cmd/Ctrl + B - Add Block
      if (modKey && e.key === "b") {
        e.preventDefault();
        blockOps.setShowBlockLibrary(true);
        return;
      }

      // Cmd/Ctrl + Z - Undo
      if (modKey && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if (modKey && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl + / - Show keyboard shortcuts
      if (modKey && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveWorkout, exerciseOps, blockOps, undo, redo, toast]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-add exercise to library when name is set/changed (with debouncing)
  const handleExerciseNameChange = useCallback(
    async (exerciseName: string): Promise<string> => {
      if (!exerciseName || exerciseName.trim().length === 0) {
        return "new-exercise";
      }

      try {
        const response = await apiClient.findOrCreateExercise({
          name: exerciseName.trim(),
        });

        if (response && typeof response === "object" && "success" in response) {
          const apiResponse = response as {
            success: boolean;
            exercise?: { id: string };
            created?: boolean;
          };

          if (apiResponse.success && apiResponse.exercise) {
            // Return the exercise ID from the library
            return apiResponse.exercise.id;
          }
        }
      } catch (error) {
        console.error("Failed to add exercise to library:", error);
        // Don't block the user if API fails, just use a generated ID
      }

      // Fallback to generated ID if API call fails
      return `custom-${exerciseName.toLowerCase().replace(/\s+/g, "-")}`;
    },
    []
  );

  // Memoize expensive computations
  const ungroupedExercises = useMemo(
    () => workout.exercises.filter((ex) => !ex.groupId),
    [workout.exercises]
  );

  // Handle drag end for exercise reordering
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = workout.exercises.findIndex((ex) => ex.id === active.id);
      const newIndex = workout.exercises.findIndex((ex) => ex.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedExercises = arrayMove(
          workout.exercises,
          oldIndex,
          newIndex
        );
        updateWorkout({
          ...workout,
          exercises: reorderedExercises,
        });
        toast.info("Exercise reordered");
      }
    },
    [workout, updateWorkout, toast]
  );

  // Wrapper for group creation that also handles modal and selection
  const handleCreateGroup = (
    groupType: "superset" | "circuit" | "section",
    rounds?: number,
    restBetweenExercises?: number,
    restBetweenRounds?: number
  ) => {
    if (selectionOps.selectedExerciseIds.size === 0) return;

    groupOps.createGroup(
      Array.from(selectionOps.selectedExerciseIds),
      groupType,
      rounds,
      restBetweenExercises,
      restBetweenRounds
    );

    selectionOps.clearSelection();
    setShowGroupModal(false);
  };

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-lg w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        {/* Main workout editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <WorkoutEditorHeader
            workout={workout}
            onChange={onChange}
            onClose={onClose}
          />

          {/* Action Toolbar */}
          <div className="p-4 sm:p-6 border-b border-silver-200 bg-silver-50">
            <ActionToolbar
              selectionMode={selectionOps.selectionMode}
              selectedCount={selectionOps.selectedExerciseIds.size}
              ungroupedExercisesCount={
                ungroupedExercises.filter((ex) => !ex.blockInstanceId).length
              }
              onAddExercise={exerciseOps.addExercise}
              onAddBlock={() => blockOps.setShowBlockLibrary(true)}
              onEnterSelectionMode={selectionOps.enterSelectionMode}
              onSelectAll={() =>
                selectionOps.selectAllExercises(
                  workout.exercises
                    .filter((ex) => !ex.groupId && !ex.blockInstanceId)
                    .map((ex) => ex.id)
                )
              }
              onCreateGroup={() => setShowGroupModal(true)}
              onCancelSelection={selectionOps.clearSelection}
              onSave={saveWorkout}
              isSaving={isSaving}
              canSave={!!workout.name?.trim()}
              onUndo={undo}
              onRedo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
              onShowPreview={() => setShowPreview(true)}
            />
          </div>

          {/* Enhanced mobile content area */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const exerciseData = e.dataTransfer.getData("exercise");
                if (exerciseData) {
                  const exercise = JSON.parse(exerciseData);
                  exerciseOps.addExerciseFromLibrary(exercise);
                }
              } catch (error) {
                if (process.env.NODE_ENV === "development") {
                  console.error("Error adding exercise:", error);
                }
                toast.error("Failed to add exercise. Please try again.");
              }
            }}
          >
            <div className="space-y-6 sm:space-y-4">
              {/* Block Instances */}
              {workout.blockInstances?.map((blockInstance) => (
                <BlockInstanceItem
                  key={blockInstance.id}
                  blockInstance={blockInstance}
                  exercises={workout.exercises}
                  groups={workout.groups || []}
                  onCustomize={blockOps.setEditingBlockInstance}
                  onDeleteExercise={exerciseOps.deleteExercise}
                  onUpdateExercise={exerciseOps.updateExercise}
                  onMoveExercise={exerciseOps.moveExercise}
                  onMoveExerciseToGroup={exerciseOps.moveExerciseToGroup}
                  availableGroups={workout.groups || []}
                  availableKPIs={availableKPIs}
                  isLoadingKPIs={isLoadingKPIs}
                  onExerciseNameChange={handleExerciseNameChange}
                />
              ))}

              {/* Ungrouped Exercises (not in blocks) - with drag-and-drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={ungroupedExercises
                    .filter((ex) => !ex.blockInstanceId)
                    .map((ex) => ex.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {ungroupedExercises
                    .filter((ex) => !ex.blockInstanceId)
                    .map((exercise, index) => (
                      <SortableExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        index={index}
                        onUpdate={exerciseOps.updateExercise}
                        onDelete={exerciseOps.deleteExercise}
                        onMoveUp={() =>
                          exerciseOps.moveExercise(exercise.id, "up")
                        }
                        onMoveDown={() =>
                          exerciseOps.moveExercise(exercise.id, "down")
                        }
                        onMoveToGroup={exerciseOps.moveExerciseToGroup.bind(
                          null,
                          exercise.id
                        )}
                        availableGroups={workout.groups || []}
                        availableKPIs={availableKPIs}
                        isLoadingKPIs={isLoadingKPIs}
                        canMoveUp={index > 0}
                        canMoveDown={index < ungroupedExercises.length - 1}
                        onExerciseNameChange={handleExerciseNameChange}
                        selectionMode={selectionOps.selectionMode}
                        isSelected={selectionOps.selectedExerciseIds.has(
                          exercise.id
                        )}
                        onToggleSelection={selectionOps.toggleExerciseSelection}
                      />
                    ))}
                </SortableContext>
              </DndContext>

              {/* Exercise Groups (not in blocks) */}
              {workout.groups
                ?.filter((g) => !g.blockInstanceId)
                .map((group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    exercises={workout.exercises}
                    onUpdateGroup={groupOps.updateGroup}
                    onDeleteGroup={groupOps.deleteGroup}
                    onUpdateExercise={exerciseOps.updateExercise}
                    onDeleteExercise={exerciseOps.deleteExercise}
                    onMoveExercise={exerciseOps.moveExercise}
                    onMoveExerciseToGroup={exerciseOps.moveExerciseToGroup}
                    availableGroups={workout.groups || []}
                    availableKPIs={availableKPIs}
                    isLoadingKPIs={isLoadingKPIs}
                    onExerciseNameChange={handleExerciseNameChange}
                  />
                ))}

              {/* Enhanced mobile empty state */}
              {ungroupedExercises.length === 0 &&
                (!workout.groups || workout.groups.length === 0) && (
                  <div className="text-center py-16 sm:py-12">
                    <Dumbbell className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-4 text-silver-400" />
                    <Body size="lg" weight="medium" className="mb-2">
                      No exercises added yet
                    </Body>
                    <Body
                      variant="secondary"
                      className="leading-relaxed max-w-md mx-auto mb-4"
                    >
                      Click &quot;Add Exercise&quot; to start building your
                      workout, or use &quot;Add Block&quot; to insert pre-built
                      workout templates
                    </Body>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Exercise Library Panel - Right Side */}
        <ExerciseLibraryPanel onDragStart={() => {}} />
      </div>

      {/* Modals */}
      <BlockLibrary
        isOpen={blockOps.showBlockLibrary}
        onClose={() => blockOps.setShowBlockLibrary(false)}
        onSelectBlock={blockOps.insertBlock}
        onCreateBlock={() => {
          blockOps.setShowBlockLibrary(false);
          blockOps.setShowBlockEditor(true);
        }}
        selectedBlocks={
          workout.blockInstances?.map((bi) => bi.sourceBlockId) || []
        }
      />

      {/* Block Editor Modal */}
      <BlockEditor
        isOpen={blockOps.showBlockEditor}
        onClose={() => blockOps.setShowBlockEditor(false)}
        onSave={blockOps.handleSaveBlock}
      />

      {/* Block Instance Editor Modal */}
      {blockOps.editingBlockInstance && (
        <BlockInstanceEditor
          isOpen={!!blockOps.editingBlockInstance}
          onClose={() => blockOps.setEditingBlockInstance(null)}
          blockInstance={blockOps.editingBlockInstance}
          workout={workout}
          onSave={blockOps.handleSaveBlockInstance}
        />
      )}

      {/* Group Creation Modal */}
      {showGroupModal && (
        <GroupCreationModal
          selectedCount={selectionOps.selectedExerciseIds.size}
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ModalBackdrop isOpen={true} onClose={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl sm:rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <ModalHeader
              title="Workout Preview"
              icon={<Eye className="w-6 h-6" />}
              onClose={() => setShowPreview(false)}
            />
            <ModalContent>
              <WorkoutPreview workout={workout} />
            </ModalContent>
            <ModalFooter>
              <Button
                onClick={() => setShowPreview(false)}
                variant="secondary"
                fullWidth
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  saveWorkout();
                }}
                disabled={isSaving || !workout.name?.trim()}
                variant="primary"
                fullWidth
              >
                Save Workout
              </Button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <ModalBackdrop
          isOpen={true}
          onClose={() => setShowKeyboardShortcuts(false)}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <ModalHeader
              title="Keyboard Shortcuts"
              icon={<Target className="w-6 h-6" />}
              onClose={() => setShowKeyboardShortcuts(false)}
            />
            <ModalContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Body weight="medium">Save Workout</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ S
                    </kbd>
                  </Body>

                  <Body weight="medium">Add Exercise</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ E
                    </kbd>
                  </Body>

                  <Body weight="medium">Add Block</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ B
                    </kbd>
                  </Body>

                  <Body weight="medium">Undo</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ Z
                    </kbd>
                  </Body>

                  <Body weight="medium">Redo</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ ⇧ Z
                    </kbd>
                  </Body>

                  <Body weight="medium">Show Shortcuts</Body>
                  <Body className="text-right">
                    <kbd className="px-2 py-1 bg-silver-100 rounded text-sm">
                      ⌘ /
                    </kbd>
                  </Body>
                </div>
                <Caption variant="muted" className="text-center">
                  On Windows/Linux, use Ctrl instead of ⌘
                </Caption>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button
                onClick={() => setShowKeyboardShortcuts(false)}
                variant="primary"
                fullWidth
              >
                Got it!
              </Button>
            </ModalFooter>
          </div>
        </ModalBackdrop>
      )}
    </ModalBackdrop>
  );
};

export default WorkoutEditor;
