"use client";

import { useState } from "react";
import { User, WorkoutPlan, WorkoutAssignment } from "@/types";
import { Users, Search, Check, X } from "lucide-react";
import DateTimePicker from "./DateTimePicker";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptySearch } from "@/components/ui/EmptyState";
import { ModalBackdrop, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";

interface IndividualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: User[];
  workoutPlans: WorkoutPlan[];
  onAssignWorkout: (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => void;
}

export default function IndividualAssignmentModal({
  isOpen,
  onClose,
  athletes,
  workoutPlans,
  onAssignWorkout,
}: IndividualAssignmentModalProps) {
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("15:30");
  const [endTime, setEndTime] = useState("16:30");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const selectedWorkout = workoutPlans.find((w) => w.id === selectedWorkoutId);

  // Filter athletes by search query
  const filteredAthletes = athletes.filter((athlete) => {
    const fullName =
      athlete.fullName || `${athlete.firstName} ${athlete.lastName}`;
    const searchLower = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(searchLower) ||
      athlete.email.toLowerCase().includes(searchLower)
    );
  });

  const toggleAthlete = (athleteId: string) => {
    setSelectedAthleteIds((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
    // Clear error when user makes selection
    if (errors.athletes) {
      setErrors((prev) => ({ ...prev, athletes: "" }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedAthleteIds.length === filteredAthletes.length) {
      // Deselect all
      setSelectedAthleteIds([]);
    } else {
      // Select all filtered athletes
      setSelectedAthleteIds(filteredAthletes.map((a) => a.id));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedAthleteIds.length === 0) {
      newErrors.athletes = "Please select at least one athlete";
    }

    if (!selectedWorkoutId) {
      newErrors.workout = "Please select a workout";
    }

    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.time = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedWorkout) return;

    // Create individual assignments for each selected athlete
    selectedAthleteIds.forEach((athleteId) => {
      const assignment: Omit<
        WorkoutAssignment,
        "id" | "createdAt" | "updatedAt"
      > = {
        workoutPlanId: selectedWorkoutId,
        workoutPlanName: selectedWorkout.name,
        assignmentType: "individual",
        athleteId: athleteId,
        assignedBy: "coach1", // TODO: Get from auth context
        assignedDate: new Date(),
        scheduledDate: selectedDate,
        startTime,
        endTime,
        status: "assigned",
        notes: notes || undefined,
      };

      onAssignWorkout(assignment);
    });

    // Reset form
    setSelectedAthleteIds([]);
    setSelectedWorkoutId("");
    setSelectedDate(new Date());
    setStartTime("15:30");
    setEndTime("16:30");
    setLocation("");
    setNotes("");
    setErrors({});
    setSearchQuery("");

    onClose();
  };

  const selectedAthletes = athletes.filter((a) =>
    selectedAthleteIds.includes(a.id)
  );

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <ModalHeader
          title="Assign Workout to Athletes"
          subtitle="Select athletes and configure workout details"
          onClose={onClose}
          icon={<Users className="w-6 h-6 text-primary" />}
        />

        <ModalContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Workout & Schedule */}
            <div className="space-y-6">
              {/* Workout Selection */}
              <div>
                <label className="text-body-primary font-medium block mb-3">
                  Select Workout
                </label>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => {
                    setSelectedWorkoutId(e.target.value);
                    if (errors.workout) {
                      setErrors((prev) => ({ ...prev, workout: "" }));
                    }
                  }}
                  className={`w-full p-3 border rounded-md ${
                    errors.workout
                      ? "border-red-500 focus:ring-red-500"
                      : "border-silver-400 focus:ring-primary"
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Choose a workout...</option>
                  {workoutPlans.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.name} ({workout.estimatedDuration} min)
                    </option>
                  ))}
                </select>
                {errors.workout && (
                  <p className="text-red-500 text-sm mt-1">{errors.workout}</p>
                )}
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
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
              )}

              {/* Location */}
              <Input
                label="Location (optional)"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Main Gym, Weight Room"
                fullWidth
              />

              {/* Notes */}
              <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special instructions or coaching notes..."
                fullWidth
              />

              {/* Workout Preview */}
              {selectedWorkout && (
                <Card variant="default" padding="md">
                  <h3 className="text-heading-secondary text-lg mb-3">
                    Workout Preview
                  </h3>
                  <div className="space-y-2">
                    {selectedWorkout.exercises
                      .slice(0, 5)
                      .map((exercise, index) => (
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
                          </span>
                        </div>
                      ))}
                    {selectedWorkout.exercises.length > 5 && (
                      <div className="text-body-small text-silver-600 text-center pt-2">
                        +{selectedWorkout.exercises.length - 5} more exercises
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Athlete Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-body-primary font-medium">
                  <Users className="w-4 h-4 inline mr-2" />
                  Select Athletes
                  {selectedAthleteIds.length > 0 &&
                    ` (${selectedAthleteIds.length} selected)`}
                </label>
                {filteredAthletes.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedAthleteIds.length === filteredAthletes.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>

              {errors.athletes && (
                <p className="text-red-500 text-sm mb-2">{errors.athletes}</p>
              )}

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-silver-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search athletes..."
                  className="w-full pl-10 pr-4 py-2 border border-silver-400 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Athletes List */}
              <div className="space-y-2 max-h-96 overflow-y-auto border border-silver-300 rounded-md p-3">
                {filteredAthletes.length > 0 ? (
                  filteredAthletes.map((athlete) => {
                    const isSelected = selectedAthleteIds.includes(athlete.id);
                    const fullName =
                      athlete.fullName ||
                      `${athlete.firstName} ${athlete.lastName}`;

                    return (
                      <button
                        key={athlete.id}
                        type="button"
                        onClick={() => toggleAthlete(athlete.id)}
                        className={`w-full p-3 rounded-md border-2 transition-colors text-left ${
                          isSelected
                            ? "border-primary bg-blue-50"
                            : "border-silver-300 hover:border-silver-400 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-body-primary font-medium">
                              {fullName}
                            </div>
                            <div className="text-body-small text-silver-600">
                              {athlete.email}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : searchQuery ? (
                  <EmptySearch
                    searchTerm={searchQuery}
                    onClearSearch={() => setSearchQuery("")}
                  />
                ) : (
                  <div className="text-center py-8 text-body-secondary">
                    No athletes available
                  </div>
                )}
              </div>

              {/* Selected Athletes Summary */}
              {selectedAthletes.length > 0 && (
                <Alert variant="info" title={`Selected Athletes (${selectedAthletes.length})`}>
                  <div className="flex flex-wrap gap-2">
                    {selectedAthletes.map((athlete) => (
                      <span
                        key={athlete.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-sm border border-blue-300"
                      >
                        {athlete.fullName ||
                          `${athlete.firstName} ${athlete.lastName}`}
                        <button
                          type="button"
                          onClick={() => toggleAthlete(athlete.id)}
                          className="text-silver-600 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </Alert>
              )}
            </div>
          </div>
        </ModalContent>

        <ModalFooter align="between">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedAthleteIds.length === 0 || !selectedWorkoutId}
            variant="primary"
            className="flex-1"
          >
            Assign to {selectedAthleteIds.length || "0"} Athlete
            {selectedAthleteIds.length !== 1 ? "s" : ""}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
