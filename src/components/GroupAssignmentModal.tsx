"use client";

import { useState } from "react";
import { AthleteGroup, WorkoutPlan, WorkoutAssignment, User } from "@/types";
import { X, Settings, Check } from "lucide-react";
import AthleteModificationModal from "./AthleteModificationModal";
import DateTimePicker from "./DateTimePicker";

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
  selectedDate: initialDate,
  groups,
  workoutPlans,
  athletes,
  onAssignWorkout,
}: GroupAssignmentModalProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [startTime, setStartTime] = useState("15:30");
  const [endTime, setEndTime] = useState("16:30");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [groupModifications, setGroupModifications] = useState<{
    [athleteId: string]: WorkoutModification[];
  }>({});

  if (!isOpen) return null;

  // Support both single and multi-select
  const selectedGroups = groups.filter((g) => selectedGroupIds.includes(g.id));
  const selectedWorkout = workoutPlans.find((w) => w.id === selectedWorkoutId);

  // Get all athletes from selected groups (deduplicated)
  const allAthleteIds = new Set<string>();
  selectedGroups.forEach((group) => {
    group.athleteIds.forEach((id) => allAthleteIds.add(id));
  });
  const groupAthletes = athletes.filter((a) => allAthleteIds.has(a.id));

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleAssign = () => {
    if (selectedGroupIds.length === 0 || !selectedWorkoutId || !selectedWorkout)
      return;

    // Create one assignment per group
    selectedGroupIds.forEach((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      const assignment: Omit<
        WorkoutAssignment,
        "id" | "createdAt" | "updatedAt"
      > = {
        workoutPlanId: selectedWorkoutId,
        workoutPlanName: selectedWorkout.name,
        assignmentType: "group",
        groupId: groupId,
        athleteIds: group.athleteIds || [],
        assignedBy: "coach1", // In real app, get from auth context
        assignedDate: new Date(),
        scheduledDate: selectedDate,
        status: "assigned",
        modifications: Object.values(groupModifications).flat(),
        startTime,
        endTime,
        location: location || undefined,
        notes: notes || undefined,
      };

      onAssignWorkout(assignment);
    });

    // Reset form
    setSelectedGroupIds([]);
    setSelectedWorkoutId("");
    setSelectedDate(initialDate);
    setStartTime("15:30");
    setEndTime("16:30");
    setLocation("");
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
                Assign Group Workout -{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
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
                  <label className="text-body-primary font-medium block mb-3">
                    Select Groups (Multiple)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-silver-400 rounded-md p-3">
                    {groups.length === 0 ? (
                      <p className="text-silver-600 text-sm">
                        No groups available
                      </p>
                    ) : (
                      groups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() => toggleGroup(group.id)}
                            className="w-5 h-5 text-accent-blue rounded focus:ring-2 focus:ring-accent-blue"
                          />
                          <span className="flex-1 text-body-primary">
                            {group.name}
                          </span>
                          <span className="text-silver-600 text-sm">
                            {group.athleteIds.length} athletes
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedGroupIds.length > 0 && (
                    <p className="text-sm text-accent-blue mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {selectedGroupIds.length} group
                      {selectedGroupIds.length > 1 ? "s" : ""} selected
                    </p>
                  )}
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

                {/* Date & Time Picker */}
                <DateTimePicker
                  selectedDate={selectedDate}
                  startTime={startTime}
                  endTime={endTime}
                  onDateChange={setSelectedDate}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  showTimePicker={true}
                />

                <div>
                  <label className="text-body-primary font-medium block mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Main Gym, Weight Room"
                    className="w-full p-3 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
                  Athletes
                  {selectedGroupIds.length > 0 &&
                    ` (${allAthleteIds.size} total)`}
                </h3>

                {selectedGroupIds.length > 0 && groupAthletes.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {groupAthletes.map((athlete) => {
                      const hasModifications =
                        groupModifications[athlete.id]?.length > 0;
                      return (
                        <div key={athlete.id} className="card-primary">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-body-primary font-medium">
                                {athlete.fullName}
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
                ) : selectedGroupIds.length > 0 ? (
                  <div className="text-center py-8 text-body-secondary">
                    No athletes found in selected groups.
                  </div>
                ) : (
                  <div className="text-center py-8 text-body-secondary">
                    Select one or more groups to see athletes.
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
                disabled={selectedGroupIds.length === 0 || !selectedWorkoutId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to{" "}
                {selectedGroupIds.length > 0
                  ? `${selectedGroupIds.length} Group${selectedGroupIds.length > 1 ? "s" : ""} (${allAthleteIds.size} athletes)`
                  : "Groups"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Modification Modal */}
      {showModificationModal &&
        selectedAthlete &&
        selectedGroupIds.length > 0 &&
        selectedWorkout && (
          <AthleteModificationModal
            isOpen={showModificationModal}
            onClose={() => setShowModificationModal(false)}
            athlete={selectedAthlete}
            group={selectedGroups[0]} // Use first group for context
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
