import React, { useState } from "react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import {
  Send,
  MessageCircle,
  UserCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface EnhancedAthlete {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  status: string;
  groupIds?: string[];
}

interface Group {
  id: string;
  name: string;
}

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: EnhancedAthlete[];
  groups: Group[];
  onExecute: (operation: BulkOperation) => Promise<void>;
}

interface BulkOperation {
  type:
    | "bulk_invite"
    | "bulk_message"
    | "bulk_assign_workout"
    | "bulk_update_status";
  targetAthletes: string[];
  targetGroups: string[];
  data: Record<string, unknown>;
}

interface BulkInviteData {
  groupIds?: string[];
  message?: string;
}

interface BulkMessageData {
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  notifyViaEmail: boolean;
}

interface BulkStatusData {
  status: "active" | "inactive" | "suspended";
  reason?: string;
}

interface BulkWorkoutData {
  workoutId: string;
  scheduledDate: string;
  notes?: string;
}

export default function BulkOperationModal({
  isOpen,
  onClose,
  athletes,
  groups,
  onExecute,
}: BulkOperationModalProps) {
  const [currentStep, setCurrentStep] = useState<
    "select" | "configure" | "confirm" | "executing"
  >("select");
  const [operationType, setOperationType] =
    useState<BulkOperation["type"]>("bulk_invite");
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [operationData, setOperationData] = useState<Record<string, unknown>>(
    {}
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<{
    success: boolean;
    error?: string;
    results?: unknown;
  } | null>(null);

  // Bulk invite form data
  const [inviteData, setInviteData] = useState<BulkInviteData>({
    groupIds: [],
    message: "",
  });

  // Bulk message form data
  const [messageData, setMessageData] = useState<BulkMessageData>({
    subject: "",
    message: "",
    priority: "normal",
    notifyViaEmail: false,
  });

  // Bulk status update data
  const [statusData, setStatusData] = useState<BulkStatusData>({
    status: "active",
    reason: "",
  });

  // Bulk workout assignment data
  const [workoutData, setWorkoutData] = useState<BulkWorkoutData>({
    workoutId: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  if (!isOpen) return null;

  const resetModal = () => {
    setCurrentStep("select");
    setSelectedAthletes([]);
    setSelectedGroups([]);
    setOperationData({});
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
    setIsExecuting(false);
    setExecutionResults(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId)
        ? prev.filter((id) => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const selectAllAthletes = () => {
    const allAthleteIds = athletes.map((a) => a.id);
    setSelectedAthletes(allAthleteIds);
  };

  const clearAllSelections = () => {
    setSelectedAthletes([]);
    setSelectedGroups([]);
  };

  const getAthletesInGroup = (groupId: string) => {
    return athletes.filter((athlete) => athlete.groupIds?.includes(groupId));
  };

  const getTotalSelectedCount = () => {
    const directAthletes = selectedAthletes.length;
    const groupAthletes = selectedGroups.reduce((count, groupId) => {
      return count + getAthletesInGroup(groupId).length;
    }, 0);
    return directAthletes + groupAthletes;
  };

  const handleNextStep = () => {
    if (currentStep === "select") {
      setCurrentStep("configure");
    } else if (currentStep === "configure") {
      // Prepare operation data based on type
      let data: Record<string, unknown>;
      switch (operationType) {
        case "bulk_invite":
          data = { ...inviteData };
          break;
        case "bulk_message":
          data = { ...messageData };
          break;
        case "bulk_update_status":
          data = { ...statusData };
          break;
        case "bulk_assign_workout":
          data = { ...workoutData };
          break;
        default:
          data = {};
      }
      setOperationData(data);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      executeOperation();
    }
  };

  const executeOperation = async () => {
    setCurrentStep("executing");
    setIsExecuting(true);

    const operation: BulkOperation = {
      type: operationType,
      targetAthletes: selectedAthletes,
      targetGroups: selectedGroups,
      data: operationData,
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
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "select":
        return (
          <div className="space-y-6">
            {/* Operation Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Operation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOperationType("bulk_invite")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    operationType === "bulk_invite"
                      ? "border-blue-500 bg-blue-50"
                      : "border-silver-400 hover:border-primary"
                  }`}
                >
                  <Send className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="font-medium">Bulk Invite</div>
                  <div className="text-sm text-gray-600">
                    Send invites to multiple people
                  </div>
                </button>

                <button
                  onClick={() => setOperationType("bulk_message")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    operationType === "bulk_message"
                      ? "border-blue-500 bg-blue-50"
                      : "border-silver-400 hover:border-primary"
                  }`}
                >
                  <MessageCircle className="w-5 h-5 text-green-600 mb-2" />
                  <div className="font-medium">Bulk Message</div>
                  <div className="text-sm text-gray-600">
                    Send messages to athletes
                  </div>
                </button>

                <button
                  onClick={() => setOperationType("bulk_update_status")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    operationType === "bulk_update_status"
                      ? "border-blue-500 bg-blue-50"
                      : "border-silver-400 hover:border-primary"
                  }`}
                >
                  <UserCheck className="w-5 h-5 text-orange-600 mb-2" />
                  <div className="font-medium">Update Status</div>
                  <div className="text-sm text-gray-600">
                    Change athlete status
                  </div>
                </button>

                <button
                  onClick={() => setOperationType("bulk_assign_workout")}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    operationType === "bulk_assign_workout"
                      ? "border-blue-500 bg-blue-50"
                      : "border-silver-400 hover:border-primary"
                  }`}
                >
                  <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="font-medium">Assign Workout</div>
                  <div className="text-sm text-gray-600">
                    Assign workouts to groups
                  </div>
                </button>
              </div>
            </div>

            {/* Target Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Targets ({getTotalSelectedCount()} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllAthletes}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Groups Section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Groups
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-lg shadow-sm"
                    >
                      <div className="flex items-center p-3">
                        <button
                          onClick={() => toggleGroupExpansion(group.id)}
                          className="mr-2"
                        >
                          {expandedGroups.includes(group.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleGroupSelection(group.id)}
                          className="flex items-center flex-1"
                        >
                          {selectedGroups.includes(group.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 mr-3" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-gray-600">
                              {getAthletesInGroup(group.id).length} athletes
                            </div>
                          </div>
                        </button>
                      </div>

                      {expandedGroups.includes(group.id) && (
                        <div className="px-6 pb-3 space-y-1">
                          {getAthletesInGroup(group.id).map((athlete) => (
                            <div
                              key={athlete.id}
                              className="text-sm text-gray-600"
                            >
                              • {athlete.fullName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Athletes Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Individual Athletes
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {athletes.map((athlete) => (
                    <div
                      key={athlete.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <button
                        onClick={() => toggleAthleteSelection(athlete.id)}
                        className="flex items-center flex-1"
                      >
                        {selectedAthletes.includes(athlete.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">{athlete.fullName}</div>
                          <div className="text-sm text-gray-600">
                            {athlete.email}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "configure":
        return renderConfigurationForm();

      case "confirm":
        return renderConfirmationStep();

      case "executing":
        return renderExecutionStep();

      default:
        return null;
    }
  };

  const renderConfigurationForm = () => {
    switch (operationType) {
      case "bulk_invite":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Groups (Optional)
              </label>
              <div className="space-y-2">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={inviteData.groupIds?.includes(group.id)}
                      onChange={(e) => {
                        const groupIds = inviteData.groupIds || [];
                        setInviteData({
                          ...inviteData,
                          groupIds: e.target.checked
                            ? [...groupIds, group.id]
                            : groupIds.filter((id) => id !== group.id),
                        });
                      }}
                      className="mr-3"
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              label="Custom Message (Optional)"
              value={inviteData.message}
              onChange={(e) =>
                setInviteData({ ...inviteData, message: e.target.value })
              }
              rows={4}
              placeholder="Add a personal message to the invite email..."
              fullWidth
            />
          </div>
        );

      case "bulk_message":
        return (
          <div className="space-y-4">
            <Input
              label="Subject"
              type="text"
              value={messageData.subject}
              onChange={(e) =>
                setMessageData({ ...messageData, subject: e.target.value })
              }
              placeholder="Message subject..."
              fullWidth
            />

            <Textarea
              label="Message *"
              value={messageData.message}
              onChange={(e) =>
                setMessageData({ ...messageData, message: e.target.value })
              }
              rows={6}
              placeholder="Type your message here..."
              required
              fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={messageData.priority}
                onChange={(e) =>
                  setMessageData({
                    ...messageData,
                    priority: e.target.value as "low" | "normal" | "high",
                  })
                }
                options={[
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                ]}
                fullWidth
              />

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={messageData.notifyViaEmail}
                    onChange={(e) =>
                      setMessageData({
                        ...messageData,
                        notifyViaEmail: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Also send via email</span>
                </label>
              </div>
            </div>
          </div>
        );

      case "bulk_update_status":
        return (
          <div className="space-y-4">
            <Select
              label="New Status *"
              value={statusData.status}
              onChange={(e) =>
                setStatusData({
                  ...statusData,
                  status: e.target.value as "active" | "inactive" | "suspended",
                })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
              required
              fullWidth
            />

            <Textarea
              label="Reason (Optional)"
              value={statusData.reason}
              onChange={(e) =>
                setStatusData({ ...statusData, reason: e.target.value })
              }
              rows={3}
              placeholder="Reason for status change..."
              fullWidth
            />
          </div>
        );

      case "bulk_assign_workout":
        return (
          <div className="space-y-4">
            <Select
              label="Workout Plan *"
              value={workoutData.workoutId}
              onChange={(e) =>
                setWorkoutData({ ...workoutData, workoutId: e.target.value })
              }
              options={[
                { value: "", label: "Select a workout plan..." },
                { value: "upper-body", label: "Upper Body Strength" },
                { value: "lower-body", label: "Lower Body Power" },
                { value: "conditioning", label: "Conditioning Circuit" },
              ]}
              required
              fullWidth
            />

            <Input
              label="Scheduled Date *"
              type="date"
              value={workoutData.scheduledDate}
              onChange={(e) =>
                setWorkoutData({
                  ...workoutData,
                  scheduledDate: e.target.value,
                })
              }
              required
              fullWidth
            />

            <Textarea
              label="Notes (Optional)"
              value={workoutData.notes}
              onChange={(e) =>
                setWorkoutData({ ...workoutData, notes: e.target.value })
              }
              rows={3}
              placeholder="Assignment notes..."
              fullWidth
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderConfirmationStep = () => {
    const operationTitles = {
      bulk_invite: "Bulk Invite Athletes",
      bulk_message: "Send Bulk Message",
      bulk_update_status: "Update Athlete Status",
      bulk_assign_workout: "Assign Workout to Athletes",
    };

    return (
      <div className="space-y-6">
        <Alert variant="warning" title="Confirm Bulk Operation">
          Please review the details below before proceeding. This action will
          affect {getTotalSelectedCount()} athletes.
        </Alert>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {operationTitles[operationType]}
          </h3>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="font-medium">Targets: </span>
              <span>{getTotalSelectedCount()} athletes</span>
              {selectedGroups.length > 0 && (
                <span className="text-sm text-gray-600">
                  {" "}
                  ({selectedGroups.length} groups, {selectedAthletes.length}{" "}
                  individuals)
                </span>
              )}
            </div>

            {operationType === "bulk_message" && (
              <>
                <div>
                  <span className="font-medium">Subject: </span>
                  <span>{messageData.subject || "No subject"}</span>
                </div>
                <div>
                  <span className="font-medium">Priority: </span>
                  <span className="capitalize">{messageData.priority}</span>
                </div>
                <div>
                  <span className="font-medium">Message: </span>
                  <div className="mt-1 p-2 bg-white rounded border text-sm">
                    {messageData.message}
                  </div>
                </div>
              </>
            )}

            {operationType === "bulk_update_status" && (
              <>
                <div>
                  <span className="font-medium">New Status: </span>
                  <span className="capitalize">{statusData.status}</span>
                </div>
                {statusData.reason && (
                  <div>
                    <span className="font-medium">Reason: </span>
                    <span>{statusData.reason}</span>
                  </div>
                )}
              </>
            )}

            {operationType === "bulk_assign_workout" && (
              <>
                <div>
                  <span className="font-medium">Workout: </span>
                  <span>{workoutData.workoutId}</span>
                </div>
                <div>
                  <span className="font-medium">Date: </span>
                  <span>
                    {new Date(workoutData.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                {workoutData.notes && (
                  <div>
                    <span className="font-medium">Notes: </span>
                    <span>{workoutData.notes}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExecutionStep = () => {
    if (isExecuting) {
      return (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Processing Operation
          </h3>
          <p className="text-gray-600">
            Please wait while we process your bulk operation...
          </p>
        </div>
      );
    }

    if (executionResults) {
      return (
        <div className="text-center py-8">
          {executionResults.success ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Operation Completed
              </h3>
              <p className="text-gray-600">
                Your bulk operation has been completed successfully.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Operation Failed
              </h3>
              <p className="text-gray-600 mb-4">
                There was an error processing your request:
              </p>
              <Alert variant="error">{executionResults.error}</Alert>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (currentStep === "select") {
      return getTotalSelectedCount() > 0;
    }
    if (currentStep === "configure") {
      switch (operationType) {
        case "bulk_message":
          return messageData.message.trim().length > 0;
        case "bulk_assign_workout":
          return workoutData.workoutId && workoutData.scheduledDate;
        default:
          return true;
      }
    }
    return true;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "select":
        return "Select Operation & Targets";
      case "configure":
        return "Configure Operation";
      case "confirm":
        return "Confirm Operation";
      case "executing":
        return "Executing Operation";
      default:
        return "";
    }
  };

  const getActionButtonText = () => {
    switch (currentStep) {
      case "select":
        return "Next: Configure";
      case "configure":
        return "Next: Review";
      case "confirm":
        return "Execute Operation";
      default:
        return "Next";
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <ModalHeader
          title="Bulk Operations"
          subtitle={getStepTitle()}
          onClose={onClose}
        />
        <ModalContent>
          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-silver-200 border-b border-silver-300">
            <div className="flex items-center space-x-4">
              {["select", "configure", "confirm", "executing"].map(
                (step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step
                          ? "bg-blue-600 text-white"
                          : index <
                              [
                                "select",
                                "configure",
                                "confirm",
                                "executing",
                              ].indexOf(currentStep)
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          index <
                          [
                            "select",
                            "configure",
                            "confirm",
                            "executing",
                          ].indexOf(currentStep)
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderStepContent()}
          </div>
        </ModalContent>

        {/* Footer */}
        {currentStep !== "executing" && (
          <ModalFooter align="between">
            <Button
              onClick={
                currentStep === "select"
                  ? handleClose
                  : () =>
                      setCurrentStep(
                        currentStep === "configure" ? "select" : "configure"
                      )
              }
              variant="secondary"
            >
              {currentStep === "select" ? "Cancel" : "Back"}
            </Button>

            {currentStep !== "confirm" || !executionResults ? (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed()}
                variant="primary"
              >
                {getActionButtonText()}
              </Button>
            ) : (
              <Button onClick={handleClose} variant="primary">
                Close
              </Button>
            )}
          </ModalFooter>
        )}
      </div>
    </ModalBackdrop>
  );
}
