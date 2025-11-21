import { useCallback } from "react";
import type { StepType, OperationType } from "./useBulkOperationState";

interface EnhancedAthlete {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  status: string;
  groupIds?: string[];
}

export interface BulkOperation {
  type: OperationType;
  targetAthletes: string[];
  targetGroups: string[];
  data: Record<string, unknown>;
}

interface UseBulkOperationHandlersProps {
  athletes: EnhancedAthlete[];
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  selectedAthletes: string[];
  setSelectedAthletes: (athletes: string[]) => void;
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
  expandedGroups: string[];
  setExpandedGroups: (groups: string[]) => void;
  operationType: OperationType;
  getCurrentOperationData: () => Record<string, unknown>;
  setOperationData: (data: Record<string, unknown>) => void;
  setIsExecuting: (executing: boolean) => void;
  setExecutionResults: (results: { success: boolean; error?: string; results?: unknown } | null) => void;
  onExecute: (operation: BulkOperation) => Promise<void>;
}

/**
 * Hook for managing BulkOperationModal handlers and operations
 * Handles selection toggles, step navigation, and execution logic
 */
export function useBulkOperationHandlers({
  athletes,
  currentStep,
  setCurrentStep,
  selectedAthletes,
  setSelectedAthletes,
  selectedGroups,
  setSelectedGroups,
  expandedGroups,
  setExpandedGroups,
  operationType,
  getCurrentOperationData,
  setOperationData,
  setIsExecuting,
  setExecutionResults,
  onExecute,
}: UseBulkOperationHandlersProps) {
  // Toggle individual athlete selection
  const toggleAthleteSelection = useCallback(
    (athleteId: string) => {
      setSelectedAthletes(
        selectedAthletes.includes(athleteId)
          ? selectedAthletes.filter((id) => id !== athleteId)
          : [...selectedAthletes, athleteId]
      );
    },
    [selectedAthletes, setSelectedAthletes]
  );

  // Toggle group selection
  const toggleGroupSelection = useCallback(
    (groupId: string) => {
      setSelectedGroups(
        selectedGroups.includes(groupId)
          ? selectedGroups.filter((id) => id !== groupId)
          : [...selectedGroups, groupId]
      );
    },
    [selectedGroups, setSelectedGroups]
  );

  // Toggle group expansion in UI
  const toggleGroupExpansion = useCallback(
    (groupId: string) => {
      setExpandedGroups(
        expandedGroups.includes(groupId)
          ? expandedGroups.filter((id) => id !== groupId)
          : [...expandedGroups, groupId]
      );
    },
    [expandedGroups, setExpandedGroups]
  );

  // Select all athletes
  const selectAllAthletes = useCallback(() => {
    const allAthleteIds = athletes.map((a) => a.id);
    setSelectedAthletes(allAthleteIds);
  }, [athletes, setSelectedAthletes]);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedAthletes([]);
    setSelectedGroups([]);
  }, [setSelectedAthletes, setSelectedGroups]);

  // Get athletes in a specific group
  const getAthletesInGroup = useCallback(
    (groupId: string) => {
      return athletes.filter((athlete) => athlete.groupIds?.includes(groupId));
    },
    [athletes]
  );

  // Get total count of selected targets
  const getTotalSelectedCount = useCallback(() => {
    const directAthletes = selectedAthletes.length;
    const groupAthletes = selectedGroups.reduce((count, groupId) => {
      return count + getAthletesInGroup(groupId).length;
    }, 0);
    return directAthletes + groupAthletes;
  }, [selectedAthletes, selectedGroups, getAthletesInGroup]);

  // Execute the bulk operation
  const executeOperation = useCallback(async () => {
    setCurrentStep("executing");
    setIsExecuting(true);

    const operation: BulkOperation = {
      type: operationType,
      targetAthletes: selectedAthletes,
      targetGroups: selectedGroups,
      data: getCurrentOperationData(),
    };

    try {
      await onExecute(operation);
      setExecutionResults({ success: true });
    } catch (error) {
      setExecutionResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [
    setCurrentStep,
    setIsExecuting,
    operationType,
    selectedAthletes,
    selectedGroups,
    getCurrentOperationData,
    onExecute,
    setExecutionResults,
  ]);

  // Navigate to next step in wizard
  const handleNextStep = useCallback(() => {
    if (currentStep === "select") {
      setCurrentStep("configure");
    } else if (currentStep === "configure") {
      // Prepare operation data based on type
      const data = getCurrentOperationData();
      setOperationData(data);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      executeOperation();
    }
  }, [currentStep, setCurrentStep, getCurrentOperationData, setOperationData, executeOperation]);

  // Navigate back to previous step
  const handlePreviousStep = useCallback(() => {
    if (currentStep === "configure") {
      setCurrentStep("select");
    } else if (currentStep === "confirm") {
      setCurrentStep("configure");
    }
  }, [currentStep, setCurrentStep]);

  return {
    toggleAthleteSelection,
    toggleGroupSelection,
    toggleGroupExpansion,
    selectAllAthletes,
    clearAllSelections,
    getAthletesInGroup,
    getTotalSelectedCount,
    handleNextStep,
    handlePreviousStep,
    executeOperation,
  };
}
