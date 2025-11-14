"use client";

import { useState } from "react";
import { User, WorkoutPlan, WorkoutAssignment } from "@/types";
import { useFormValidation } from "@/hooks/use-form-validation";
import { Users, Search, Check, X } from "lucide-react";
import WorkoutAssignmentForm from "./WorkoutAssignmentForm";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptySearch } from "@/components/ui/EmptyState";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface IndividualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: User[];
  workoutPlans: WorkoutPlan[];
  currentUserId?: string; // User ID of the coach assigning
  onAssignWorkout: (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => void;
}

export default function IndividualAssignmentModal({
  isOpen,
  onClose,
  athletes,
  workoutPlans,
  currentUserId,
  onAssignWorkout,
}: IndividualAssignmentModalProps) {
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldError,
    resetForm,
    isSubmitting,
  } = useFormValidation({
    initialValues: {
      workoutId: "",
      date: new Date(),
      startTime: "15:30",
      endTime: "16:30",
      location: "",
      notes: "",
    },
    validationRules: {
      workoutId: { required: "Please select a workout" },
      date: { required: "Please select a date" },
      startTime: { required: true },
      endTime: {
        required: true,
        custom: (value, allValues) => {
          const start = String(allValues.startTime || "");
          const end = String(value || "");
          if (start && end && start >= end) {
            return "End time must be after start time";
          }
          return undefined;
        },
      },
    },
    onSubmit: async (formValues) => {
      // Custom validation for athletes (not part of form values)
      if (selectedAthleteIds.length === 0) {
        setFieldError(
          "workoutId" as never,
          "Please select at least one athlete"
        );
        throw new Error("Please select at least one athlete");
      }

      const selectedWorkout = workoutPlans.find(
        (w) => w.id === formValues.workoutId
      );
      if (!selectedWorkout) return;

      // Create individual assignments for each selected athlete
      selectedAthleteIds.forEach((athleteId) => {
        const assignment: Omit<
          WorkoutAssignment,
          "id" | "createdAt" | "updatedAt"
        > = {
          workoutPlanId: formValues.workoutId,
          workoutPlanName: selectedWorkout.name,
          assignmentType: "individual",
          athleteId: athleteId,
          assignedBy: currentUserId || "unknown",
          assignedDate: new Date(),
          scheduledDate: formValues.date,
          startTime: formValues.startTime,
          endTime: formValues.endTime,
          status: "assigned",
          notes: formValues.notes || undefined,
        };

        onAssignWorkout(assignment);
      });

      // Reset form
      setSelectedAthleteIds([]);
      setSearchQuery("");
      resetForm();
      onClose();
    },
  });

  if (!isOpen) return null;

  const selectedWorkout = workoutPlans.find((w) => w.id === values.workoutId);

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
            <div>
              <WorkoutAssignmentForm
                selectedWorkoutId={values.workoutId}
                onWorkoutChange={(id) => handleChange("workoutId", id as never)}
                workoutPlans={workoutPlans}
                workoutError={errors.workoutId}
                selectedDate={values.date}
                onDateChange={(date) => handleChange("date", date as never)}
                startTime={values.startTime}
                onStartTimeChange={(time) =>
                  handleChange("startTime", time as never)
                }
                endTime={values.endTime}
                onEndTimeChange={(time) =>
                  handleChange("endTime", time as never)
                }
                timeError={errors.endTime}
                location={values.location}
                onLocationChange={(loc) =>
                  handleChange("location", loc as never)
                }
                notes={values.notes}
                onNotesChange={(notes) => handleChange("notes", notes as never)}
                showWorkoutPreview={true}
                notesPlaceholder="Any special instructions or coaching notes..."
                notesRows={4}
              />
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

              {selectedAthleteIds.length === 0 && errors.submit && (
                <p className="text-error text-sm mb-2">{errors.submit}</p>
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
                            ? "border-primary bg-[var(--color-semantic-info-lightest)]"
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
                <Alert
                  variant="info"
                  title={`Selected Athletes (${selectedAthletes.length})`}
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedAthletes.map((athlete) => (
                      <span
                        key={athlete.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-sm border border-[var(--color-semantic-info-light)]"
                      >
                        {athlete.fullName ||
                          `${athlete.firstName} ${athlete.lastName}`}
                        <button
                          type="button"
                          onClick={() => toggleAthlete(athlete.id)}
                          className="text-silver-600 hover:text-[var(--color-semantic-error-base)]"
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
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={
              selectedAthleteIds.length === 0 ||
              !values.workoutId ||
              isSubmitting
            }
            variant="primary"
            className="flex-1"
          >
            {isSubmitting
              ? "Assigning..."
              : `Assign to ${selectedAthleteIds.length || "0"} Athlete${selectedAthleteIds.length !== 1 ? "s" : ""}`}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
