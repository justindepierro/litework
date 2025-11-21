import { useState, useCallback } from "react";

export type OperationType =
  | "bulk_invite"
  | "bulk_message"
  | "bulk_assign_workout"
  | "bulk_update_status";

export type StepType = "select" | "configure" | "confirm" | "executing";

export interface BulkInviteData {
  groupIds?: string[];
  message?: string;
}

export interface BulkMessageData {
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  notifyViaEmail: boolean;
}

export interface BulkStatusData {
  status: "active" | "inactive" | "suspended";
  reason?: string;
}

export interface BulkWorkoutData {
  workoutId: string;
  scheduledDate: string;
  notes?: string;
}

export interface ExecutionResults {
  success: boolean;
  error?: string;
  results?: unknown;
}

/**
 * Hook for managing BulkOperationModal state
 * Handles wizard steps, selections, operation data, and execution state
 */
export function useBulkOperationState() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<StepType>("select");
  const [operationType, setOperationType] = useState<OperationType>("bulk_invite");

  // Selection state
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Operation-specific form data
  const [inviteData, setInviteData] = useState<BulkInviteData>({
    groupIds: [],
    message: "",
  });

  const [messageData, setMessageData] = useState<BulkMessageData>({
    subject: "",
    message: "",
    priority: "normal",
    notifyViaEmail: false,
  });

  const [statusData, setStatusData] = useState<BulkStatusData>({
    status: "active",
    reason: "",
  });

  const [workoutData, setWorkoutData] = useState<BulkWorkoutData>({
    workoutId: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Execution state
  const [operationData, setOperationData] = useState<Record<string, unknown>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResults | null>(null);

  // Reset all state to initial values
  const resetState = useCallback(() => {
    setCurrentStep("select");
    setOperationType("bulk_invite");
    setSelectedAthletes([]);
    setSelectedGroups([]);
    setExpandedGroups([]);
    setInviteData({ groupIds: [], message: "" });
    setMessageData({
      subject: "",
      message: "",
      priority: "normal",
      notifyViaEmail: false,
    });
    setStatusData({ status: "active", reason: "" });
    setWorkoutData({
      workoutId: "",
      scheduledDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setOperationData({});
    setIsExecuting(false);
    setExecutionResults(null);
  }, []);

  // Get current operation data based on type
  const getCurrentOperationData = useCallback((): Record<string, unknown> => {
    switch (operationType) {
      case "bulk_invite":
        return { ...inviteData };
      case "bulk_message":
        return { ...messageData };
      case "bulk_update_status":
        return { ...statusData };
      case "bulk_assign_workout":
        return { ...workoutData };
      default:
        return {};
    }
  }, [operationType, inviteData, messageData, statusData, workoutData]);

  return {
    // Wizard state
    currentStep,
    setCurrentStep,
    operationType,
    setOperationType,

    // Selection state
    selectedAthletes,
    setSelectedAthletes,
    selectedGroups,
    setSelectedGroups,
    expandedGroups,
    setExpandedGroups,

    // Operation-specific data
    inviteData,
    setInviteData,
    messageData,
    setMessageData,
    statusData,
    setStatusData,
    workoutData,
    setWorkoutData,

    // Execution state
    operationData,
    setOperationData,
    isExecuting,
    setIsExecuting,
    executionResults,
    setExecutionResults,

    // Helpers
    resetState,
    getCurrentOperationData,
  };
}
