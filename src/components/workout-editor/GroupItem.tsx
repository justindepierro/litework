import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  X,
  Trash2,
  Users,
  RotateCcw,
  Zap,
  Layers,
} from "lucide-react";
import { ExerciseGroup, WorkoutExercise } from "@/types";
import ExerciseItem from "./ExerciseItem";

interface GroupItemProps {
  group: ExerciseGroup;
  exercises: WorkoutExercise[];
  onUpdateGroup: (group: ExerciseGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onUpdateExercise: (exercise: WorkoutExercise) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onMoveExerciseUp: (exerciseId: string) => void;
  onMoveExerciseDown: (exerciseId: string) => void;
  index: number;
}

const GroupItem: React.FC<GroupItemProps> = ({
  group,
  exercises,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateExercise,
  onDeleteExercise,
  onMoveExerciseUp,
  onMoveExerciseDown,
  index,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState(group);

  const groupExercises = exercises.filter((ex) => ex.groupId === group.id);

  const getGroupIcon = () => {
    switch (group.type) {
      case "superset":
        return <RotateCcw className="w-4 h-4" />;
      case "circuit":
        return <Zap className="w-4 h-4" />;
      case "section":
        return <Layers className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getGroupColor = () => {
    switch (group.type) {
      case "superset":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "circuit":
        return "text-green-600 bg-green-100 border-green-200";
      case "section":
        return "text-purple-600 bg-purple-100 border-purple-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const saveGroup = () => {
    onUpdateGroup(editedGroup);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedGroup(group);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-surface-primary border border-border-subtle rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-heading-primary font-medium">Edit Group</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={saveGroup}
              className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded-md transition-colors"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="p-2 text-text-secondary hover:bg-surface-secondary rounded-md transition-colors"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={editedGroup.name}
              onChange={(e) =>
                setEditedGroup({
                  ...editedGroup,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              placeholder="e.g., Upper Body Superset"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Group Type
            </label>
            <select
              value={editedGroup.type}
              onChange={(e) =>
                setEditedGroup({
                  ...editedGroup,
                  type: e.target.value as "superset" | "circuit" | "section",
                })
              }
              className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            >
              <option value="superset">Superset (2-4 exercises)</option>
              <option value="circuit">Circuit (5+ exercises)</option>
              <option value="section">Section (workout phase)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes (optional)
          </label>
          <textarea
            value={editedGroup.notes || ""}
            onChange={(e) =>
              setEditedGroup({
                ...editedGroup,
                notes: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-border-subtle rounded-md bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary resize-none"
            rows={2}
            placeholder="Special instructions for this group..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${getGroupColor()}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-2">
              {getGroupIcon()}
              <div>
                <h3 className="font-medium">
                  {group.name} ({group.type})
                </h3>
                <p className="text-sm opacity-75">
                  {groupExercises.length} exercise
                  {groupExercises.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-white/50 rounded-md transition-colors"
              title="Edit group"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteGroup(group.id)}
              className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600"
              title="Delete group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {group.notes && (
          <p className="mt-2 text-sm opacity-80 italic">{group.notes}</p>
        )}
      </div>

      {!isCollapsed && groupExercises.length > 0 && (
        <div className="border-t border-current/20 p-4 space-y-3">
          {groupExercises.map((exercise, exerciseIndex) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              onUpdate={onUpdateExercise}
              onDelete={onDeleteExercise}
              onMoveUp={onMoveExerciseUp}
              onMoveDown={onMoveExerciseDown}
              canMoveUp={exerciseIndex > 0}
              canMoveDown={exerciseIndex < groupExercises.length - 1}
              index={exerciseIndex}
              groupId={group.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupItem;
