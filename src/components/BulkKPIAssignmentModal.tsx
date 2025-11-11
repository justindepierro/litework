"use client";

import { useState, useEffect } from "react";
import {
  AthleteGroup,
  User,
  KPITag,
  BulkAssignKPIsRequest,
  BulkAssignKPIsResponse,
} from "@/types";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { Button } from "@/components/ui/Button";
import { Body, Heading, Label } from "@/components/ui/Typography";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { useToast } from "@/components/ToastProvider";

interface BulkKPIAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: BulkAssignKPIsResponse) => void;
  availableGroups: AthleteGroup[];
  availableAthletes: User[];
  availableKPIs: KPITag[];
}

type Step = "select-athletes" | "select-kpis" | "set-targets";

export default function BulkKPIAssignmentModal({
  isOpen,
  onClose,
  onComplete,
  availableGroups,
  availableAthletes,
  availableKPIs,
}: BulkKPIAssignmentModalProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("select-athletes");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [selectedKPIIds, setSelectedKPIIds] = useState<string[]>([]);
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("select-athletes");
      setSelectedGroupIds([]);
      setSelectedAthleteIds([]);
      setSelectedKPIIds([]);
      setTargetValue("");
      setTargetDate("");
      setNotes("");
      setError("");
    }
  }, [isOpen]);

  // Collect all athlete IDs from selected groups and individuals
  // Only include athletes who have accepted invites (exist in availableAthletes)
  const getAllSelectedAthleteIds = (): string[] => {
    const athleteIdsFromGroups = availableGroups
      .filter((g) => selectedGroupIds.includes(g.id!))
      .flatMap((g) => g.athleteIds || []);

    const allIds = [
      ...new Set([...athleteIdsFromGroups, ...selectedAthleteIds]),
    ];

    // Filter out invited athletes who don't have user records yet
    const validAthleteIds = new Set(availableAthletes.map((a) => a.id));
    const validIds = allIds.filter((id) => validAthleteIds.has(id));

    // Debug logging
    if (selectedGroupIds.length > 0) {
      // [REMOVED] console.log("[KPI Assignment Debug]", { selectedGroupIds, athleteIdsFromGroups, availableAthletesCount: availableAthletes.length, allIdsCount: allIds.length, validIdsCount: validIds.length });
    }

    return validIds;
  };

  const handleNext = () => {
    if (currentStep === "select-athletes") {
      const selectedCount = selectedGroupIds.length + selectedAthleteIds.length;
      if (selectedCount === 0) {
        setError("Please select at least one athlete or group");
        return;
      }

      // Check if we have any valid (active) athletes
      const athleteCount = getAllSelectedAthleteIds().length;
      if (athleteCount === 0) {
        setError(
          "The selected groups contain only invited athletes. They will receive KPIs when they accept their invites. Please select groups with active athletes or continue anyway."
        );
        // Still allow proceeding - don't return here
      } else {
        setError("");
      }

      setCurrentStep("select-kpis");
    } else if (currentStep === "select-kpis") {
      if (selectedKPIIds.length === 0) {
        setError("Please select at least one KPI tag");
        return;
      }
      setError("");
      setCurrentStep("set-targets");
    }
  };

  const handleBack = () => {
    if (currentStep === "select-kpis") {
      setCurrentStep("select-athletes");
    } else if (currentStep === "set-targets") {
      setCurrentStep("select-kpis");
    }
  };

  const handleSubmit = async () => {
    const athleteIds = getAllSelectedAthleteIds();

    // Validate that user made selections (even if no active athletes)
    if (
      (selectedGroupIds.length === 0 && selectedAthleteIds.length === 0) ||
      selectedKPIIds.length === 0
    ) {
      setError("Please select athletes/groups and KPI tags");
      return;
    }

    // If no active athletes, show info and still complete (trigger will handle invited athletes)
    if (athleteIds.length === 0) {
      toast.info(
        "Selected groups contain only invited athletes. They will receive KPIs when they accept their invites."
      );
      onComplete({
        success: true,
        assignments: [],
        totalAssigned: 0,
        totalSkipped: 0,
      });
      handleClose();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Determine assignment source
      const assignedVia =
        selectedGroupIds.length > 0
          ? `group:${selectedGroupIds.join(",")}`
          : "individual";

      const payload: BulkAssignKPIsRequest = {
        athleteIds,
        kpiTagIds: selectedKPIIds,
        assignedVia,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        targetDate: targetDate || undefined, // Keep as string (YYYY-MM-DD)
        notes: notes.trim() || undefined,
      };

      const response = await fetch("/api/athlete-assigned-kpis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign KPIs");
      }

      const result: BulkAssignKPIsResponse = await response.json();

      // Success toast
      const { totalAssigned, totalSkipped } = result;
      if (totalAssigned > 0) {
        let message = `Successfully assigned KPIs to ${totalAssigned} athlete${totalAssigned === 1 ? "" : "s"}`;
        if (totalSkipped > 0) {
          message += ` (${totalSkipped} already assigned)`;
        }
        toast.success(message);
      } else if (totalSkipped > 0) {
        toast.info("All selected athletes already have these KPIs assigned");
      }

      onComplete(result);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Toggle group selection
  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Toggle individual athlete selection
  const toggleAthlete = (athleteId: string) => {
    setSelectedAthleteIds((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  // Toggle KPI selection
  const toggleKPI = (kpiId: string) => {
    setSelectedKPIIds((prev) =>
      prev.includes(kpiId)
        ? prev.filter((id) => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  if (!isOpen) return null;

  const totalAthletes = getAllSelectedAthleteIds().length;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title="Bulk Assign KPIs"
          icon={<Target className="w-6 h-6" />}
          onClose={handleClose}
        />

        <ModalContent>
          {error && (
            <div className="bg-error-100 border-2 border-error-500 text-error-700 px-4 py-3 rounded mb-4 font-medium">
              {error}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6 space-x-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === "select-athletes"
                  ? "bg-primary text-white"
                  : "bg-silver-200 text-charcoal-700"
              }`}
            >
              1. Athletes
            </div>
            <ChevronRight className="w-4 h-4 text-silver-400" />
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === "select-kpis"
                  ? "bg-primary text-white"
                  : "bg-silver-200 text-charcoal-700"
              }`}
            >
              2. KPIs
            </div>
            <ChevronRight className="w-4 h-4 text-silver-400" />
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentStep === "set-targets"
                  ? "bg-primary text-white"
                  : "bg-silver-200 text-charcoal-700"
              }`}
            >
              3. Targets
            </div>
          </div>

          {/* Step 1: Select Athletes */}
          {currentStep === "select-athletes" && (
            <div className="space-y-4">
              <Heading level="h3">Select Athletes or Groups</Heading>

              {/* Groups */}
              {availableGroups.length > 0 && (
                <div>
                  <Label>Groups</Label>
                  <div className="mt-2 space-y-2">
                    {availableGroups.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center p-3 border border-silver-300 rounded-lg cursor-pointer hover:bg-silver-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group.id!)}
                          onChange={() => toggleGroup(group.id!)}
                          className="mr-3 h-4 w-4 text-primary"
                        />
                        <div className="flex-1">
                          <Body className="font-medium">{group.name}</Body>
                          <Body variant="tertiary" className="text-sm">
                            {group.sport} • {group.athleteIds?.length || 0}{" "}
                            athletes
                          </Body>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Athletes */}
              {availableAthletes.length > 0 && (
                <div>
                  <Label>Individual Athletes</Label>
                  <div className="mt-2 max-h-64 overflow-y-auto space-y-1 border border-silver-300 rounded-lg p-2">
                    {availableAthletes.map((athlete) => (
                      <label
                        key={athlete.id}
                        className="flex items-center p-2 rounded hover:bg-silver-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAthleteIds.includes(athlete.id)}
                          onChange={() => toggleAthlete(athlete.id)}
                          className="mr-3 h-4 w-4 text-primary"
                        />
                        <Body>
                          {athlete.firstName} {athlete.lastName}
                        </Body>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {totalAthletes > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <Body>
                    <strong>{totalAthletes}</strong>{" "}
                    {totalAthletes === 1 ? "athlete" : "athletes"} selected
                  </Body>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select KPIs */}
          {currentStep === "select-kpis" && (
            <div className="space-y-4">
              <Heading level="h3">Select KPI Tags to Assign</Heading>
              <Body variant="tertiary">
                These KPIs will be assigned to all {totalAthletes} selected{" "}
                {totalAthletes === 1 ? "athlete" : "athletes"}
              </Body>

              <div className="grid grid-cols-2 gap-3">
                {availableKPIs.map((kpi) => (
                  <label
                    key={kpi.id}
                    className={`
                      flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedKPIIds.includes(kpi.id)
                          ? "border-primary bg-blue-50"
                          : "border-silver-300 hover:border-silver-400"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKPIIds.includes(kpi.id)}
                      onChange={() => toggleKPI(kpi.id)}
                      className="mr-3 h-4 w-4 text-primary"
                    />
                    <div className="flex-1">
                      <span
                        className="inline-block px-2 py-1 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: kpi.color }}
                      >
                        {kpi.displayName}
                      </span>
                      <Body variant="tertiary" className="text-xs mt-1">
                        {kpi.kpiType.replace("_", " ")}
                      </Body>
                    </div>
                  </label>
                ))}
              </div>

              {selectedKPIIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <Body>
                    <strong>{selectedKPIIds.length}</strong>{" "}
                    {selectedKPIIds.length === 1 ? "KPI" : "KPIs"} selected
                  </Body>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Set Targets (Optional) */}
          {currentStep === "set-targets" && (
            <div className="space-y-4">
              <Heading level="h3">Set Target Goals (Optional)</Heading>
              <Body variant="tertiary">
                These are optional. You can set individual targets later.
              </Body>

              <div className="grid grid-cols-2 gap-4">
                <FloatingLabelInput
                  label="Target Value"
                  type="number"
                  step="0.1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  disabled={isLoading}
                  fullWidth
                />
                <FloatingLabelInput
                  label="Target Date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isLoading}
                  fullWidth
                />
              </div>

              <FloatingLabelTextarea
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isLoading}
                fullWidth
              />

              {/* Summary */}
              <div className="bg-silver-100 rounded p-4 space-y-2">
                <Heading level="h4">Assignment Summary</Heading>
                <Body variant="secondary">
                  <strong>{totalAthletes}</strong> active{" "}
                  {totalAthletes === 1 ? "athlete" : "athletes"}
                </Body>
                {totalAthletes === 0 &&
                  (selectedGroupIds.length > 0 ||
                    selectedAthleteIds.length > 0) && (
                    <Body variant="tertiary" className="text-amber-600">
                      Selected groups contain only invited athletes. KPIs will
                      be assigned automatically when they accept their invites.
                    </Body>
                  )}
                <Body variant="secondary">
                  <strong>{selectedKPIIds.length}</strong>{" "}
                  {selectedKPIIds.length === 1 ? "KPI" : "KPIs"}
                </Body>
                <Body variant="secondary">
                  <strong>{totalAthletes * selectedKPIIds.length}</strong>{" "}
                  immediate assignments
                </Body>
              </div>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          {currentStep !== "select-athletes" && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {currentStep === "set-targets" ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Assigning..." : "Assign KPIs"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={
                isLoading ||
                (currentStep === "select-athletes" &&
                  selectedGroupIds.length === 0 &&
                  selectedAthleteIds.length === 0) ||
                (currentStep === "select-kpis" && selectedKPIIds.length === 0)
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
