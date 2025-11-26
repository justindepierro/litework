import React, { useState, useEffect } from "react";
import { useAsyncState } from "@/hooks/use-async-state";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  MessageCircle,
  Send,
  Calendar,
  UserCheck,
  X,
} from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Heading, Body, Caption } from "@/components/ui/Typography";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";

interface BulkOperationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BulkOperation {
  id: string;
  type: string;
  targetCount: number;
  successCount: number;
  failureCount: number;
  status: "in_progress" | "completed" | "failed" | "cancelled";
  createdAt: Date;
  completedAt?: Date;
}

export default function BulkOperationHistory({
  isOpen,
  onClose,
}: BulkOperationHistoryProps) {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const { isLoading: loading, execute } = useAsyncState<void>();

  const fetchOperationHistory = () => {
    execute(async () => {
      const response = await fetch("/api/bulk-operations");
      if (response.ok) {
        const result = await response.json();
        setOperations(
          result.data.map(
            (op: {
              id: string;
              operation_type: string;
              target_count: number;
              success_count: number;
              failure_count: number;
              status: string;
              started_at: string;
              completed_at?: string;
            }) => ({
              ...op,
              createdAt: new Date(op.started_at),
              completedAt: op.completed_at
                ? new Date(op.completed_at)
                : undefined,
            })
          )
        );
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchOperationHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const getOperationIcon = (type: string) => {
    switch (type) {
      case "bulk_invite":
        return <Send className="w-5 h-5 text-primary" />;
      case "bulk_message":
        return <MessageCircle className="w-5 h-5 text-success" />;
      case "bulk_update_status":
        return <UserCheck className="w-5 h-5 text-accent-orange" />;
      case "bulk_assign_workout":
        return <Calendar className="w-5 h-5 text-accent-purple-500" />;
      default:
        return <Users className="w-5 h-5 text-neutral" />;
    }
  };

  const getOperationTitle = (type: string) => {
    switch (type) {
      case "bulk_invite":
        return "Bulk Invite";
      case "bulk_message":
        return "Bulk Message";
      case "bulk_update_status":
        return "Status Update";
      case "bulk_assign_workout":
        return "Workout Assignment";
      default:
        return "Unknown Operation";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-error" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-primary" />;
      case "cancelled":
        return <X className="w-5 h-5 text-neutral" />;
      default:
        return <Clock className="w-5 h-5 text-neutral" />;
    }
  };

  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "in_progress":
        return "info";
      case "cancelled":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return "In progress...";
    const durationMs = end.getTime() - start.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <ModalHeader
          title="Bulk Operations History"
          subtitle="Recent bulk operations and their status"
          onClose={onClose}
          icon={<Users className="w-6 h-6 text-primary" />}
        />

        <ModalContent>
          {/* Refresh button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={fetchOperationHistory}
              disabled={loading}
              className="p-2 hover:bg-silver-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw
                className={`w-5 h-5 text-neutral ${loading ? "animate-spin" : ""}`}
              />
              <Body size="sm" className="text-neutral-dark">
                Refresh
              </Body>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-neutral mx-auto mb-4 animate-spin" />
              <Body className="text-neutral-dark">
                Loading operation history...
              </Body>
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-silver-500 mx-auto mb-4" />
              <Heading level="h3" className="text-navy-900 mb-2">
                No Operations Yet
              </Heading>
              <Body className="text-neutral-dark">
                Your bulk operations will appear here once you start using them.
              </Body>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => (
                <div
                  key={operation.id}
                  className="rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-silver-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getOperationIcon(operation.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Heading level="h3" className="text-navy-900">
                            {getOperationTitle(operation.type)}
                          </Heading>
                          <Badge
                            variant={getStatusColor(operation.status)}
                            size="sm"
                          >
                            {operation.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-dark mb-3">
                          <div>
                            <Body size="sm" weight="medium" as="span">
                              Targets:
                            </Body>{" "}
                            {operation.targetCount}
                          </div>
                          <div>
                            <Body size="sm" weight="medium" as="span">
                              Success:
                            </Body>{" "}
                            {operation.successCount}
                          </div>
                          {operation.failureCount > 0 && (
                            <div>
                              <Body size="sm" weight="medium" as="span">
                                Failed:
                              </Body>{" "}
                              {operation.failureCount}
                            </div>
                          )}
                          <div>
                            <Body size="sm" weight="medium" as="span">
                              Duration:
                            </Body>{" "}
                            {formatDuration(
                              operation.createdAt,
                              operation.completedAt
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-neutral">
                          Started: {operation.createdAt.toLocaleString()}
                          {operation.completedAt && (
                            <span>
                              {" "}
                              • Completed:{" "}
                              {operation.completedAt.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {getStatusIcon(operation.status)}
                    </div>
                  </div>

                  {/* Progress bar for completed operations */}
                  {operation.status === "completed" &&
                    operation.targetCount > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-neutral-dark mb-1">
                          <span>Success Rate</span>
                          <span>
                            {Math.round(
                              (operation.successCount / operation.targetCount) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-silver-400 rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(operation.successCount / operation.targetCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}
