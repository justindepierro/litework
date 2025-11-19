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
} from "lucide-react";
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
import { Label } from "@/components/ui/Typography";

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
  onExerciseNameChange?: (name: string) => Promise<string>;
}

const BlockInstanceItem: React.FC<BlockInstanceItemProps> = ({
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
    <div className="border-2 border-(--accent-purple-300) rounded-lg bg-(--accent-purple-50)/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-silver-500 hover:text-(--accent-purple-600)"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <Package className="w-4 h-4 text-(--accent-purple-600)" />

          <div className="flex-1">
            <div className="font-medium text-silver-900">
              {blockInstance.instanceName || blockInstance.sourceBlockName}
            </div>
            <div className="text-xs text-silver-500">
              Block Template
              {hasCustomizations && (
                <Badge variant="info" size="sm" className="ml-2">
                  Customized
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCustomize(blockInstance)}
            className="px-3 py-1.5 text-sm bg-(--accent-purple-600) text-white rounded-lg hover:bg-(--accent-purple-700) transition-colors flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="ml-6 space-y-3 mt-3 border-l-2 border-(--accent-purple-200) pl-4">
          {blockInstance.notes && (
            <div className="text-sm text-silver-600 italic bg-white/50 p-2 rounded">
              {blockInstance.notes}
            </div>
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
              onExerciseNameChange={onExerciseNameChange}
            />
          ))}
        </div>
      )}
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
  onExerciseNameChange?: (name: string) => Promise<string>;
}

const GroupItem: React.FC<GroupItemProps> = ({
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
    <div className={`border-2 border-dashed rounded-lg p-4 ${getGroupColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-silver-500 hover:text-accent-blue"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

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
                      <span className="text-(--text-secondary)">
                        Rest between exercises:
                      </span>
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
                      <span className="text-(--text-secondary)">sec</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-(--text-secondary)">
                        Rest between rounds:
                      </span>
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
                      <span className="text-(--text-secondary)">sec</span>
                    </div>
                  </>
                )}

                {editedGroup.type === "circuit" && (
                  <div className="flex items-center space-x-1">
                    <span className="text-(--text-secondary)">Rounds:</span>
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
                <h3 className="font-medium text-heading-primary">
                  {group.name}
                </h3>
                <span className="text-xs text-body-secondary capitalize">
                  ({group.type} - {groupExercises.length} exercises)
                </span>
              </div>

              {/* Display rest intervals */}
              {(group.restBetweenExercises ||
                group.restBetweenRounds ||
                group.rounds) && (
                <div className="flex items-center space-x-3 text-xs text-(--text-secondary)">
                  {group.restBetweenExercises !== undefined && (
                    <span>Rest between: {group.restBetweenExercises}s</span>
                  )}
                  {group.restBetweenRounds !== undefined && (
                    <span>Rest after round: {group.restBetweenRounds}s</span>
                  )}
                  {group.rounds !== undefined && (
                    <span>{group.rounds} rounds</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-silver-500 hover:text-accent-blue"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="p-1 text-silver-500 hover:text-(--status-error)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
              availableGroups={availableGroups.filter((g) => g.id !== group.id)}
              availableKPIs={availableKPIs}
              canMoveUp={index > 0}
              canMoveDown={index < groupExercises.length - 1}
              onExerciseNameChange={onExerciseNameChange}
            />
          ))}

          {groupExercises.length === 0 && (
            <div className="text-center text-body-secondary text-sm py-4 border-2 border-dashed border-silver-300 rounded-lg">
              No exercises in this {group.type} yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
                      ? "border-blue-500 bg-blue-50 text-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Superset</div>
                  <div className="text-xs text-(--text-tertiary) mt-1">
                    2-4 exercises
                  </div>
                </button>

                <button
                  onClick={() => setGroupType("circuit")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    groupType === "circuit"
                      ? "border-blue-500 bg-blue-50 text-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <RotateCcw className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Circuit</div>
                  <div className="text-xs text-(--text-tertiary) mt-1">
                    Multiple rounds
                  </div>
                </button>

                <button
                  onClick={() => setGroupType("section")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    groupType === "section"
                      ? "border-blue-500 bg-blue-50 text-blue-500"
                      : "border-silver-400 hover:border-silver-500"
                  }`}
                >
                  <Target className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Section</div>
                  <div className="text-xs text-(--text-tertiary) mt-1">
                    Workout phase
                  </div>
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
  // UI-only state (not part of workout data)
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [editingBlockInstance, setEditingBlockInstance] =
    useState<BlockInstance | null>(null);

  // Multi-select state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(
    new Set()
  );
  const [showGroupModal, setShowGroupModal] = useState(false);

  // KPI tags state
  const [availableKPIs, setAvailableKPIs] = useState<KPITag[]>([]);

  // Fetch available KPI tags
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await fetch("/api/kpi-tags");
        if (response.ok) {
          const result = await response.json();
          setAvailableKPIs(result.data || []);
        }
      } catch (error) {
        console.error("[WorkoutEditor] Failed to fetch KPIs:", error);
      }
    };
    fetchKPIs();
  }, []);

  // Update workout data - single source of truth through onChange
  const updateWorkout = useCallback(
    (updatedWorkout: WorkoutPlan) => {
      console.log("[WorkoutEditor] updateWorkout called:", {
        name: updatedWorkout.name,
        exerciseCount: updatedWorkout.exercises?.length,
        exercises: updatedWorkout.exercises?.map((ex) => ({
          id: ex.id,
          name: ex.exerciseName,
        })),
      });

      // No need to override name - it's already in updatedWorkout
      // [REMOVED] console.log("[WorkoutEditor] Calling parent onChange with workout");
      onChange(updatedWorkout);
    },
    [onChange]
  );

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

  // Add new exercise
  const addExercise = () => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: "new-exercise",
      exerciseName: "New Exercise",
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 0,
      restTime: 120,
      order: workout.exercises.length + 1,
    };

    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });
  };

  // Add exercise from library (drag-and-drop)
  const addExerciseFromLibrary = (libraryExercise: {
    id: string;
    name: string;
    video_url?: string;
  }) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: libraryExercise.id,
      exerciseName: libraryExercise.name,
      sets: 3,
      reps: 10,
      weightType: "fixed",
      weight: 0,
      restTime: 120,
      order: workout.exercises.length + 1,
      videoUrl: libraryExercise.video_url,
    };

    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });
  };

  // Update exercise
  const updateExercise = (updatedExercise: WorkoutExercise) => {
    console.log("[WorkoutEditor] updateExercise called:", {
      id: updatedExercise.id,
      name: updatedExercise.exerciseName,
      currentExercises: workout.exercises.length,
    });

    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );

    console.log(
      "[WorkoutEditor] Updated exercises array:",
      updatedExercises.map((ex) => ({
        id: ex.id,
        name: ex.exerciseName,
      }))
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Delete exercise
  const deleteExercise = (exerciseId: string) => {
    const updatedExercises = workout.exercises.filter(
      (ex) => ex.id !== exerciseId
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Update group
  const updateGroup = (updatedGroup: ExerciseGroup) => {
    const updatedGroups = (workout.groups || []).map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group
    );

    updateWorkout({
      ...workout,
      groups: updatedGroups,
    });
  };

  // Delete group
  const deleteGroup = (groupId: string) => {
    const updatedGroups = (workout.groups || []).filter(
      (group) => group.id !== groupId
    );

    // Move exercises out of the deleted group
    const updatedExercises = workout.exercises.map((ex) =>
      ex.groupId === groupId ? { ...ex, groupId: undefined } : ex
    );

    updateWorkout({
      ...workout,
      groups: updatedGroups,
      exercises: updatedExercises,
    });
  };

  // Multi-select functions
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExerciseIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const selectAllExercises = () => {
    const ungroupedIds = workout.exercises
      .filter((ex) => !ex.groupId && !ex.blockInstanceId)
      .map((ex) => ex.id);
    setSelectedExerciseIds(new Set(ungroupedIds));
  };

  const clearSelection = () => {
    setSelectedExerciseIds(new Set());
    setSelectionMode(false);
  };

  const groupSelectedExercises = (
    groupType: "superset" | "circuit" | "section",
    rounds?: number,
    restBetweenExercises?: number,
    restBetweenRounds?: number
  ) => {
    if (selectedExerciseIds.size === 0) return;

    const newGroupId = Date.now().toString();
    const groupNumber = (workout.groups?.length || 0) + 1;
    const newGroup: ExerciseGroup = {
      id: newGroupId,
      name: `Group ${groupNumber}`,
      type: groupType,
      order: groupNumber,
      rounds: rounds,
      restBetweenExercises: restBetweenExercises,
      restBetweenRounds: restBetweenRounds,
    };

    // Move selected exercises into the new group
    const updatedExercises = workout.exercises.map((ex) =>
      selectedExerciseIds.has(ex.id) ? { ...ex, groupId: newGroupId } : ex
    );

    updateWorkout({
      ...workout,
      groups: [...(workout.groups || []), newGroup],
      exercises: updatedExercises,
    });

    clearSelection();
    setShowGroupModal(false);
  };

  // Move exercise up or down
  const moveExercise = (
    exerciseId: string,
    direction: "up" | "down",
    groupId?: string
  ) => {
    const relevantExercises = groupId
      ? workout.exercises.filter((ex) => ex.groupId === groupId)
      : workout.exercises.filter((ex) => !ex.groupId);

    const exerciseIndex = relevantExercises.findIndex(
      (ex) => ex.id === exerciseId
    );
    if (exerciseIndex === -1) return;

    const newIndex = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    if (newIndex < 0 || newIndex >= relevantExercises.length) return;

    // Create new exercise array with reordered items
    const updatedExercises = [...workout.exercises];
    const exerciseToMove = updatedExercises.find((ex) => ex.id === exerciseId);
    const exerciseToSwap = updatedExercises.find(
      (ex) => ex.id === relevantExercises[newIndex].id
    );

    if (exerciseToMove && exerciseToSwap) {
      const tempOrder = exerciseToMove.order;
      exerciseToMove.order = exerciseToSwap.order;
      exerciseToSwap.order = tempOrder;
    }

    updateWorkout({
      ...workout,
      exercises: updatedExercises.sort((a, b) => a.order - b.order),
    });
  };

  // Move exercise to different group
  const moveExerciseToGroup = (exerciseId: string, targetGroupId?: string) => {
    const updatedExercises = workout.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, groupId: targetGroupId } : ex
    );

    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Insert a workout block
  const insertBlock = (block: WorkoutBlock) => {
    // Generate unique IDs for this block instance
    const timestamp = Date.now();
    const blockInstanceId = `block-instance-${timestamp}`;

    const maxOrder = Math.max(...workout.exercises.map((ex) => ex.order), 0);
    const maxGroupOrder = Math.max(
      ...(workout.groups || []).map((g) => g.order),
      0
    );

    // Clone exercises with new IDs, updated order, and block instance tracking
    const newExercises = block.exercises.map((ex, index) => ({
      ...ex,
      id: `${timestamp}-ex-${index}`,
      order: maxOrder + index + 1,
      groupId: ex.groupId ? `${timestamp}-group-${ex.groupId}` : undefined,
      blockInstanceId, // Track which instance this exercise belongs to
    }));

    // Clone groups with new IDs, updated order, and block instance tracking
    const newGroups = (block.groups || []).map((group, index) => ({
      ...group,
      id: `${timestamp}-group-${group.id}`,
      order: maxGroupOrder + index + 1,
      blockInstanceId, // Track which instance this group belongs to
    }));

    // Create the block instance metadata
    const blockInstance: BlockInstance = {
      id: blockInstanceId,
      sourceBlockId: block.id,
      sourceBlockName: block.name,
      customizations: {
        modifiedExercises: [],
        addedExercises: [],
        removedExercises: [],
        modifiedGroups: [],
        addedGroups: [],
        removedGroups: [],
      },
      estimatedDuration: block.estimatedDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update the workout with the new block instance
    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, ...newExercises],
      groups: [...(workout.groups || []), ...newGroups],
      blockInstances: [...(workout.blockInstances || []), blockInstance],
      estimatedDuration: workout.estimatedDuration + block.estimatedDuration,
    });

    // Close the block library
    setShowBlockLibrary(false);
  };

  // Handle saving a new block
  const handleSaveBlock = async (
    blockData: Omit<
      WorkoutBlock,
      "id" | "createdAt" | "updatedAt" | "usageCount" | "lastUsed"
    >
  ) => {
    try {
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(blockData),
      });

      if (!response.ok) {
        throw new Error("Failed to create block");
      }

      const data = await response.json();

      // Optionally close the editor and show success message
      setShowBlockEditor(false);

      // Could add a toast notification here
      // [REMOVED] console.log("Block created successfully:", data.block);

      return data.block;
    } catch (error) {
      console.error("Error saving block:", error);
      throw error;
    }
  };

  // Handle block instance updates
  const handleSaveBlockInstance = (
    updatedExercises: WorkoutExercise[],
    updatedGroups: ExerciseGroup[],
    updatedInstance: BlockInstance
  ) => {
    // Replace exercises for this block instance
    const otherExercises = workout.exercises.filter(
      (ex) => ex.blockInstanceId !== updatedInstance.id
    );
    const otherGroups = (workout.groups || []).filter(
      (g) => g.blockInstanceId !== updatedInstance.id
    );

    // Replace block instance
    const otherInstances = (workout.blockInstances || []).filter(
      (bi) => bi.id !== updatedInstance.id
    );

    updateWorkout({
      ...workout,
      exercises: [...otherExercises, ...updatedExercises],
      groups: [...otherGroups, ...updatedGroups],
      blockInstances: [...otherInstances, updatedInstance],
    });
  };

  // State for saving
  const [isSaving, setIsSaving] = useState(false);

  // Save workout to library
  const saveWorkout = async () => {
    if (!workout.name?.trim()) {
      alert("Please enter a workout name");
      return;
    }

    setIsSaving(true);

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
            console.log(
              `[WorkoutEditor] Creating exercise in library: ${ex.exerciseName}`
            );
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
                console.log(
                  `[WorkoutEditor] Exercise created with ID: ${data.data.id}`
                );
                return {
                  ...ex,
                  exerciseId: data.data.id,
                  exerciseName: data.data.name,
                };
              } else {
                console.error(
                  `[WorkoutEditor] Failed to create exercise: ${data.error}`
                );
                throw new Error(data.error || "Failed to create exercise");
              }
            } catch (error) {
              console.error("[WorkoutEditor] Error creating exercise:", error);
              throw error;
            }
          }
          return ex;
        })
      );

      console.log(
        `[WorkoutEditor] All exercises processed. Saving workout with ${updatedExercises.length} exercises`
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

      // DON'T close here - let the parent handle closing after successful save
      // onClose();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-lg w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        {/* Main workout editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced mobile header */}
          <div className="p-4 sm:p-6 border-b border-silver-200 bg-(--bg-secondary)">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 pr-4">
                <Input
                  label="Workout Name"
                  type="text"
                  value={workout.name || ""}
                  onChange={(e) => {
                    const newName = e.target.value;
                    // Directly update workout state
                    onChange({ ...workout, name: newName });
                  }}
                  placeholder="Enter workout name..."
                  className="text-xl sm:text-lg font-bold"
                  fullWidth
                />
              </div>
              <button
                onClick={onClose}
                className="text-silver-500 hover:text-silver-700 text-3xl sm:text-2xl w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl hover:bg-(--interactive-hover) transition-colors touch-manipulation shrink-0"
              >
                ×
              </button>
            </div>

            {/* Enhanced mobile action buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-2 flex-wrap">
                {!selectionMode ? (
                  <>
                    <Button
                      onClick={() => setShowBlockLibrary(true)}
                      variant="primary"
                      leftIcon={<Package className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Add Block
                    </Button>

                    <Button
                      onClick={addExercise}
                      variant="primary"
                      leftIcon={<Plus className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Add Exercise
                    </Button>

                    {ungroupedExercises.filter((ex) => !ex.blockInstanceId)
                      .length > 0 && (
                      <Button
                        onClick={() => setSelectionMode(true)}
                        variant="success"
                        leftIcon={<Users className="w-5 h-5 sm:w-4 sm:h-4" />}
                      >
                        Group Exercises
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="col-span-full bg-(--accent-blue-100) border-2 border-(--accent-blue-400) rounded-lg p-3 text-sm text-(--accent-blue-900) font-medium">
                      {selectedExerciseIds.size === 0
                        ? "Select exercises to group together"
                        : `${selectedExerciseIds.size} exercise${selectedExerciseIds.size > 1 ? "s" : ""} selected`}
                    </div>

                    <Button
                      onClick={selectAllExercises}
                      variant="secondary"
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Select All
                    </Button>

                    <Button
                      onClick={() => setShowGroupModal(true)}
                      disabled={selectedExerciseIds.size < 2}
                      variant="primary"
                      leftIcon={<Zap className="w-5 h-5 sm:w-4 sm:h-4" />}
                      className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
                    >
                      Create Group
                    </Button>

                    <Button onClick={clearSelection} variant="danger">
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* Save Workout Button - Separate Row */}
              {!selectionMode && (
                <Button
                  onClick={saveWorkout}
                  disabled={isSaving || !workout.name?.trim()}
                  variant="primary"
                  fullWidth
                  className="py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-bold bg-gradient-to-r from-(--status-success) to-(--accent-emerald-600) hover:from-(--status-success) hover:to-(--accent-emerald-700) border-2 border-(--status-success)"
                >
                  {isSaving ? "Saving..." : "Save Workout"}
                </Button>
              )}
            </div>
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
                  addExerciseFromLibrary(exercise);
                }
              } catch (error) {
                console.error("Error adding exercise:", error);
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
                  onCustomize={setEditingBlockInstance}
                  onDeleteExercise={deleteExercise}
                  onUpdateExercise={updateExercise}
                  onMoveExercise={moveExercise}
                  onMoveExerciseToGroup={moveExerciseToGroup}
                  availableGroups={workout.groups || []}
                  availableKPIs={availableKPIs}
                  onExerciseNameChange={handleExerciseNameChange}
                />
              ))}

              {/* Ungrouped Exercises (not in blocks) */}
              {ungroupedExercises
                .filter((ex) => !ex.blockInstanceId)
                .map((exercise, index) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onUpdate={updateExercise}
                    onDelete={deleteExercise}
                    onMoveUp={() => moveExercise(exercise.id, "up")}
                    onMoveDown={() => moveExercise(exercise.id, "down")}
                    onMoveToGroup={moveExerciseToGroup.bind(null, exercise.id)}
                    availableGroups={workout.groups || []}
                    availableKPIs={availableKPIs}
                    canMoveUp={index > 0}
                    canMoveDown={index < ungroupedExercises.length - 1}
                    onExerciseNameChange={handleExerciseNameChange}
                    selectionMode={selectionMode}
                    isSelected={selectedExerciseIds.has(exercise.id)}
                    onToggleSelection={toggleExerciseSelection}
                  />
                ))}

              {/* Exercise Groups (not in blocks) */}
              {workout.groups
                ?.filter((g) => !g.blockInstanceId)
                .map((group) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    exercises={workout.exercises}
                    onUpdateGroup={updateGroup}
                    onDeleteGroup={deleteGroup}
                    onUpdateExercise={updateExercise}
                    onDeleteExercise={deleteExercise}
                    onMoveExercise={moveExercise}
                    onMoveExerciseToGroup={moveExerciseToGroup}
                    availableGroups={workout.groups || []}
                    availableKPIs={availableKPIs}
                    onExerciseNameChange={handleExerciseNameChange}
                  />
                ))}

              {/* Enhanced mobile empty state */}
              {ungroupedExercises.length === 0 &&
                (!workout.groups || workout.groups.length === 0) && (
                  <div className="text-center text-body-secondary py-16 sm:py-12">
                    <Dumbbell className="w-16 h-16 sm:w-12 sm:h-12 mx-auto mb-6 sm:mb-4 text-silver-400" />
                    <p className="text-xl sm:text-lg font-medium mb-2">
                      No exercises added yet
                    </p>
                    <p className="text-base sm:text-sm leading-relaxed max-w-md mx-auto mb-4">
                      Click &quot;Add Exercise&quot; to start building your
                      workout, or use &quot;Add Block&quot; to insert pre-built
                      workout templates
                    </p>
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
        isOpen={showBlockLibrary}
        onClose={() => setShowBlockLibrary(false)}
        onSelectBlock={insertBlock}
        onCreateBlock={() => {
          setShowBlockLibrary(false);
          setShowBlockEditor(true);
        }}
        selectedBlocks={
          workout.blockInstances?.map((bi) => bi.sourceBlockId) || []
        }
      />

      {/* Block Editor Modal */}
      <BlockEditor
        isOpen={showBlockEditor}
        onClose={() => setShowBlockEditor(false)}
        onSave={handleSaveBlock}
      />

      {/* Block Instance Editor Modal */}
      {editingBlockInstance && (
        <BlockInstanceEditor
          isOpen={!!editingBlockInstance}
          onClose={() => setEditingBlockInstance(null)}
          blockInstance={editingBlockInstance}
          workout={workout}
          onSave={handleSaveBlockInstance}
        />
      )}

      {/* Group Creation Modal */}
      {showGroupModal && (
        <GroupCreationModal
          selectedCount={selectedExerciseIds.size}
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={groupSelectedExercises}
        />
      )}
    </ModalBackdrop>
  );
};

export default WorkoutEditor;
