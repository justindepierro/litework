"use client";

import { useState } from "react";
import { AthleteGroup, WorkoutPlan, WorkoutAssignment, User } from "@/types";
import { X, Settings } from "lucide-react";
import AthleteModificationModal from "./AthleteModificationModal";

import { WorkoutModification } from "@/types";

interface GroupAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  groups: AthleteGroup[];
  workoutPlans: WorkoutPlan[];
  athletes: User[];
  onAssignWorkout: (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => void;
}

export default function GroupAssignmentModal({
  isOpen,
  onClose,
  selectedDate,
  groups,
  workoutPlans,
  athletes,
  onAssignWorkout,
}: GroupAssignmentModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [startTime, setStartTime] = useState("15:30");
  const [endTime, setEndTime] = useState("16:30");
  const [notes, setNotes] = useState("");
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [groupModifications, setGroupModifications] = useState<{
    [athleteId: string]: WorkoutModification[];
  }>({});

  if (!isOpen) return null;

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedWorkout = workoutPlans.find(
    (w) => w.id === selectedWorkoutId
  );
  const groupAthletes = selectedGroup
    ? athletes.filter((a) => selectedGroup.athleteIds.includes(a.id))
    : [];

  const handleAssign = () => {
    if (!selectedGroupId || !selectedWorkoutId || !selectedWorkout) return;

    const assignment: Omit<
      WorkoutAssignment,
      "id" | "createdAt" | "updatedAt"
    > = {
      workoutPlanId: selectedWorkoutId,
      workoutPlanName: selectedWorkout.name,
      assignmentType: "group",
      groupId: selectedGroupId,
      athleteIds: selectedGroup?.athleteIds || [],
      assignedBy: "coach1", // In real app, get from auth context
      assignedDate: new Date(),
      scheduledDate: selectedDate,
      status: "assigned",
      modifications: Object.values(groupModifications).flat(),
      startTime,
      endTime,
      notes: notes || undefined,
    };

    onAssignWorkout(assignment);

    // Reset form
    setSelectedGroupId("");
    setSelectedWorkoutId("");
    setStartTime("15:30");
    setEndTime("16:30");
    setNotes("");
    setGroupModifications({});

    onClose();
  };

  const openModificationModal = (athlete: User) => {
    setSelectedAthlete(athlete);
    setShowModificationModal(true);
  };

  const saveAthleteModifications = (
    athleteId: string,
    modifications: WorkoutModification[]
  ) => {
    setGroupModifications((prev) => ({
      ...prev,
      [athleteId]: modifications,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-heading-primary text-xl">
                Assign Group Workout - {selectedDate.toLocaleDateString()}
              </h2>
              <button
                onClick={onClose}
                className="text-silver-600 hover:text-navy-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Assignment Details */}
              <div className="space-y-6">
                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Select Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md"
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.athleteIds.length} athletes)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Select Workout
                  </label>
                  <select
                    value={selectedWorkoutId}
                    onChange={(e) => setSelectedWorkoutId(e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md"
                  >
                    <option value="">Choose a workout...</option>
                    {workoutPlans.map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name} ({workout.estimatedDuration} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Training Time
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-body-small block mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full p-3 border border-silver-400 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-body-small block mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full p-3 border border-silver-400 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Session Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-silver-400 rounded-md"
                    rows={3}
                    placeholder="Any special instructions, focus areas, or coaching notes..."
                  />
                </div>

                {selectedWorkout && (
                  <div className="card-secondary">
                    <h3 className="text-heading-secondary text-lg mb-3">
                      Workout Preview
                    </h3>
                    <div className="space-y-2">
                      {selectedWorkout.exercises.map((exercise, index) => (
                        <div
                          key={exercise.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="text-body-small w-6">
                            {index + 1}.
                          </span>
                          <span className="flex-1">
                            {exercise.exerciseName}
                          </span>
                          <span className="text-body-small">
                            {exercise.sets}×{exercise.reps}
                            {exercise.weightType === "percentage" &&
                              ` @ ${exercise.percentage}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Athletes & Modifications */}
              <div>
                <h3 className="text-heading-secondary text-lg mb-4">
                  Athletes & Individual Modifications
                </h3>

                {selectedGroup && groupAthletes.length > 0 ? (
                  <div className="space-y-3">
                    {groupAthletes.map((athlete) => {
                      const hasModifications =
                        groupModifications[athlete.id]?.length > 0;
                      return (
                        <div key={athlete.id} className="card-primary">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-body-primary font-medium">
                                {athlete.name}
                              </div>
                              <div className="text-body-small">
                                {athlete.email}
                              </div>
                              {hasModifications && (
                                <div className="text-xs text-accent-orange mt-1 flex items-center gap-1">
                                  <Settings className="w-3 h-3" />
                                  {groupModifications[athlete.id].length}{" "}
                                  modification(s)
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => openModificationModal(athlete)}
                              disabled={!selectedWorkout}
                              className={`btn-secondary text-sm px-3 py-1 ${
                                hasModifications
                                  ? "border-accent-orange text-accent-orange"
                                  : ""
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {hasModifications ? "Edit Mods" : "Modify"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedGroup ? (
                  <div className="text-center py-8 text-body-secondary">
                    No athletes found in this group.
                  </div>
                ) : (
                  <div className="text-center py-8 text-body-secondary">
                    Select a group to see athletes.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedGroupId || !selectedWorkoutId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to{" "}
                {selectedGroup
                  ? `${selectedGroup.name} (${groupAthletes.length})`
                  : "Group"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Modification Modal */}
      {showModificationModal &&
        selectedAthlete &&
        selectedGroup &&
        selectedWorkout && (
          <AthleteModificationModal
            isOpen={showModificationModal}
            onClose={() => setShowModificationModal(false)}
            athlete={selectedAthlete}
            group={selectedGroup}
            workoutPlan={selectedWorkout}
            existingModifications={groupModifications[selectedAthlete.id] || []}
            onSaveModifications={(modifications) => {
              saveAthleteModifications(selectedAthlete.id, modifications);
              setShowModificationModal(false);
            }}
          />
        )}
    </>
  );
}
