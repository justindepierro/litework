"use client";

import { useRequireCoach } from "@/hooks/use-auth-guard";
import {
  useState,
  useEffect,
  lazy,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { Button } from "@/components/ui/Button";
import { AnimatedGrid } from "@/components/ui/AnimatedList";
import { withPageErrorBoundary } from "@/components/ui/PageErrorBoundary";
import {
  User,
  Plus,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  History,
  Target,
  Tag,
} from "lucide-react";
import { ModalBackdrop, ModalHeader } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Body } from "@/components/ui/Typography";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  User as UserType,
  AthleteKPI,
  AthleteGroup,
  WorkoutAssignment,
  KPITag,
  BulkAssignKPIsResponse,
} from "@/types";
import { apiClient } from "@/lib/api-client";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { log } from "@/lib/dev-logger";
import { EmptySearch } from "@/components/ui/EmptyState";
import InviteAthleteModal, {
  InviteForm,
} from "./components/modals/InviteAthleteModal";
import KPIModal, { KPIForm } from "./components/modals/KPIModal";
import MessageModal, { MessageForm } from "./components/modals/MessageModal";
import EditEmailModal from "./components/modals/EditEmailModal";
import AddToGroupModal from "./components/modals/AddToGroupModal";
import AthleteCard from "./components/AthleteCard";
import AthleteStats from "./components/AthleteStats";
import SearchAndFilters from "./components/SearchAndFilters";
import GroupsSection from "./components/GroupsSection";
import { useAthleteData } from "./hooks/useAthleteData";
import { useAthleteFilters } from "./hooks/useAthleteFilters";
import { useAthletesModals } from "@/hooks/useAthletesModals";
import {
  useAthletesOperations,
  type EnhancedAthlete as EnhancedAthleteType,
} from "@/hooks/useAthletesOperations";

// Dynamic imports for large components
const GroupFormModal = lazy(() => import("@/components/GroupFormModal"));
const ManageGroupMembersModal = lazy(
  () => import("@/components/ManageGroupMembersModal")
);
const BulkOperationModal = lazy(
  () => import("@/components/BulkOperationModal")
);
const BulkOperationHistory = lazy(
  () => import("@/components/BulkOperationHistory")
);
const ProgressAnalytics = lazy(() => import("@/components/ProgressAnalytics"));
const AthleteDetailModal = lazy(
  () => import("@/components/AthleteDetailModal")
);
const IndividualAssignmentModal = lazy(
  () => import("@/components/IndividualAssignmentModal")
);
const KPIManagementModal = lazy(
  () => import("@/components/KPIManagementModal")
);
const BulkKPIAssignmentModal = lazy(
  () => import("@/components/BulkKPIAssignmentModal")
);
const AthleteEditModal = lazy(() => import("@/components/AthleteEditModal"));

interface AthleteCommunication {
  unreadMessages: number;
  lastMessage: string | null;
  lastMessageTime: Date | null;
  notificationsEnabled: boolean;
  preferredContact: "app" | "email" | "sms";
}

// Re-export EnhancedAthlete type from operations hook
type EnhancedAthlete = EnhancedAthleteType;

export default withPageErrorBoundary(function AthletesPage() {
  const { isLoading, user } = useRequireCoach();
  const toast = useToast();

  // Use custom hooks for data management
  const {
    athletes,
    groups,
    workoutPlans,
    loadAthletes,
    loadGroups,
    setAthletes,
    setGroups,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useAthleteData(user as any, isLoading);

  // Add minimum loading time for smooth skeleton display
  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);

  // Use modal management hook
  const modals = useAthletesModals();

  // Use operations hook
  const operations = useAthletesOperations(
    athletes,
    setAthletes,
    groups,
    setGroups,
    loadGroups
  );

  // Local UI state
  const [error, setError] = useState<string | null>(null);
  const [availableKPIs, setAvailableKPIs] = useState<KPITag[]>([]);
  const [editingKPI, setEditingKPI] = useState<KPITag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [messageForm, setMessageForm] = useState<MessageForm>({
    recipientId: "",
    subject: "",
    message: "",
    priority: "normal",
    notifyViaEmail: false,
  });

  // Operations are now handled by useAthletesOperations hook

  // Load groups when component mounts
  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load available KPI tags
  useEffect(() => {
    const loadKPIs = async () => {
      try {
        const response = await fetch("/api/kpi-tags");
        if (response.ok) {
          const result = await response.json();
          setAvailableKPIs(result.data || []);
        }
      } catch (error) {
        console.error("Failed to load KPI tags:", error);
      }
    };

    if (!isLoading) {
      loadKPIs();
    }
  }, [isLoading]);

  // Handler functions now in operations hook

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (operations.openGroupMenuId) {
        operations.setOpenGroupMenuId(null);
      }
    };

    if (operations.openGroupMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [operations.openGroupMenuId, operations.setOpenGroupMenuId]);

  // Wrapper handlers for UI actions (using operations hook)
  const handleAnalytics = (athlete: EnhancedAthlete) => {
    operations.setSelectedAthlete(athlete);
    modals.setShowAnalyticsModal(true);
  };

  const handleMessageAthlete = (athlete: EnhancedAthlete) => {
    operations.setSelectedAthlete(athlete);
    setMessageForm({
      recipientId: athlete.id,
      subject: "",
      message: "",
      priority: "normal",
      notifyViaEmail: athlete.communication?.preferredContact === "email",
    });
    modals.setShowMessageModal(true);
  };

  // Wrappers for operations that need modal state updates
  const handleSendInvite = async (inviteForm: InviteForm) => {
    const result = await operations.handleSendInvite(inviteForm);
    if (result?.success) {
      modals.setShowInviteModal(false);
      setError("");
    }
  };

  const handleUpdateEmail = async (email: string) => {
    const result = await operations.handleUpdateEmail(email);
    if (result?.success) {
      modals.setShowEditEmailModal(false);
    }
  };

  const handleSendMessage = async (messageForm: MessageForm) => {
    const result = await operations.handleSendMessage(messageForm);
    if (result?.success) {
      modals.setShowMessageModal(false);
    }
  };

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    const result = await operations.handleAssignWorkout(assignment);
    if (result?.success) {
      modals.setShowIndividualAssignment(false);
      operations.setSelectedAthlete(null);
    }
  };

  const handleBulkOperation = async (operation: {
    type: string;
    targetAthletes: string[];
    targetGroups: string[];
    data: Record<string, unknown>;
  }) => {
    try {
      log.debug("Executing bulk operation:", operation);

      // Call the bulk operations API
      const response = await fetch("/api/bulk-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute bulk operation");
      }

      const result = await response.json();
      log.debug("Bulk operation result:", result);

      // Show success message based on operation type
      let successMessage = "";
      switch (operation.type) {
        case "bulk_invite":
          successMessage = `Successfully sent ${result.data.invitesSent} invites`;
          break;
        case "bulk_message":
          successMessage = `Successfully sent ${result.data.totalSent} messages`;
          break;
        case "bulk_update_status":
          successMessage = `Successfully updated ${result.data.updatedCount} athletes`;
          break;
        case "bulk_assign_workout":
          successMessage = `Successfully assigned workout to ${result.data.assignmentsCreated} athletes`;
          break;
        default:
          successMessage = "Bulk operation completed successfully";
      }

      toast.success(successMessage);

      // Refresh athletes list if needed
      // await fetchAthletes();
    } catch (error) {
      console.error("Bulk operation failed:", error);
      toast.error("Bulk operation failed. Please try again.");
      throw error;
    }
  };

  // Mock groups data for bulk operations
  const mockGroups = [
    { id: "football-linemen", name: "Football Linemen", athleteCount: 8 },
    { id: "volleyball-girls", name: "Volleyball Girls", athleteCount: 12 },
    { id: "cross-country", name: "Cross Country", athleteCount: 15 },
  ];

  const getStatusIcon = (status: string, injuryStatus?: string | null) => {
    if (injuryStatus)
      return <AlertCircle className="h-4 w-4 text-accent-yellow" />;
    if (status === "active")
      return <CheckCircle className="h-4 w-4 text-accent-green" />;
    if (status === "invited")
      return <Clock className="h-4 w-4 text-accent-blue" />;
    return <User className="h-4 w-4 text-secondary" />;
  };

  const getStatusText = (status: string, injuryStatus?: string | null) => {
    if (injuryStatus) return "Injured";
    if (status === "active") return "Active";
    if (status === "invited") return "Invited";
    return "Unknown";
  };

  // Use filtering hook
  const { filteredAthletes, athleteCounts } = useAthleteFilters(
    athletes,
    debouncedSearchTerm,
    statusFilter
  );

  // Memoize active groups
  const activeGroups = useMemo(
    () => groups.filter((g) => !g.archived),
    [groups]
  );

  // Memoize athlete card callbacks for performance
  const handleCardClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowDetailModal(true);
    },
    [operations, modals]
  );

  const handleMessageClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowMessageModal(true);
    },
    [operations, modals]
  );

  const handleAssignWorkoutClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowIndividualAssignment(true);
    },
    [operations, modals]
  );

  const handleManageKPIsClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowKPIModal(true);
    },
    [operations, modals]
  );

  const handleViewAnalyticsClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowAnalyticsModal(true);
    },
    [operations, modals]
  );

  const handleAddToGroupClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowAddToGroupModal(true);
    },
    [operations, modals]
  );

  const handleEditEmailClick = useCallback(
    (athlete: EnhancedAthlete) => {
      operations.setSelectedAthlete(athlete);
      modals.setShowEditEmailModal(true);
    },
    [operations, modals]
  );

  if (showSkeleton) {
    return (
      <div className="min-h-screen container-responsive section-spacing">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Enhanced Mobile-Optimized Header */}
        <div className="flex flex-col gap-6 mb-8">
          <PageHeader
            title="Team Athletes"
            subtitle="Manage your athletes with invite-based onboarding, performance tracking, and seamless communication"
            icon={<Users className="w-6 h-6" />}
            gradientVariant="primary"
          />

          {/* Mobile-Optimized Communication Stats */}
          <AthleteStats athleteCounts={athleteCounts} athletes={athletes} />

          {/* Mobile-Optimized Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => modals.setShowHistoryModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg border-accent-light hover:border-accent transition-colors"
              leftIcon={
                <History className="w-5 h-5 sm:w-4 sm:h-4 text-accent-purple" />
              }
            >
              History
            </Button>
            <Button
              onClick={() => modals.setShowBulkModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg border-primary-light hover:border-primary transition-colors"
              leftIcon={
                <Users className="w-5 h-5 sm:w-4 sm:h-4 text-accent-blue" />
              }
            >
              Bulk Actions
            </Button>
            <Button
              onClick={() => modals.setShowKPIManagementModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg border-warning-light hover:border-warning bg-warning-lightest hover:bg-warning-light transition-colors"
              leftIcon={
                <Tag className="w-5 h-5 sm:w-4 sm:h-4 text-accent-orange" />
              }
            >
              <span className="text-warning-dark">Create KPI</span>
            </Button>
            <Button
              onClick={() => modals.setShowBulkKPIAssignmentModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg border-success-light hover:border-success bg-success-lightest hover:bg-success-light transition-colors"
              leftIcon={
                <Target className="w-5 h-5 sm:w-4 sm:h-4 text-accent-green" />
              }
            >
              <span className="text-success-dark">Assign KPIs</span>
            </Button>
            <Button
              onClick={() => modals.setShowGroupFormModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg border-accent-light hover:border-accent bg-accent-lightest hover:bg-accent-light transition-colors"
              leftIcon={
                <Users className="w-5 h-5 sm:w-4 sm:h-4 text-accent-pink" />
              }
            >
              <span className="text-accent-dark">Add Group</span>
            </Button>
            <Button
              onClick={() => modals.setShowInviteModal(true)}
              variant="primary"
              className="shadow-lg hover:shadow-xl bg-gradient-accent-primary hover:opacity-90 transition-opacity"
              leftIcon={<Plus className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Add Athlete
            </Button>
          </div>
        </div>

        {/* Groups Section */}
        <GroupsSection
          groups={activeGroups}
          openGroupMenuId={operations.openGroupMenuId}
          onOpenMenu={operations.setOpenGroupMenuId}
          onEditGroup={(group) => {
            operations.setEditingGroup(group);
            modals.setShowGroupFormModal(true);
          }}
          onArchiveGroup={operations.handleArchiveGroup}
          onDeleteGroup={operations.handleDeleteGroup}
          onManageMembers={(group) => {
            operations.setSelectedGroup(group);
            modals.setShowManageGroupModal(true);
          }}
        />

        {/* Mobile-Optimized Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Athletes Grid - Mobile Optimized Cards */}
        <AnimatedGrid columns={3} gap={6} delay={0.1} staggerDelay={0.06}>
          {/* Add Athlete Placeholder Card - Colorful & Energetic */}
          <button
            onClick={() => modals.setShowInviteModal(true)}
            className="relative bg-white rounded-xl shadow-sm hover:shadow-lg border-2 border-dashed border-silver-300 hover:border-warning hover:scale-[1.02] transition-all duration-200 group touch-manipulation cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 p-6"
            aria-label="Add new athlete"
          >
            {/* Colorful accent bar - only on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-accent-primary rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Centered content */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-accent-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-(--text-primary) mb-1">
                  Add New Athlete
                </h3>
                <Body className="text-sm" variant="secondary">
                  Click to add athlete profile
                </Body>
              </div>
            </div>
          </button>

          {filteredAthletes.length > 0 &&
            filteredAthletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                groups={groups}
                onCardClick={handleCardClick}
                onMessageClick={handleMessageClick}
                onAssignWorkout={handleAssignWorkoutClick}
                onManageKPIs={handleManageKPIsClick}
                onViewAnalytics={handleViewAnalyticsClick}
                onAddToGroup={handleAddToGroupClick}
                onEditEmail={handleEditEmailClick}
                onResendInvite={operations.handleResendInvite}
                onCancelInvite={operations.handleCancelInvite}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}
        </AnimatedGrid>

        {/* Empty State - Only show if no athletes at all */}
        {filteredAthletes.length === 0 && (
          <EmptySearch
            searchTerm={searchTerm || "filtered"}
            onClearSearch={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          />
        )}

        {/* Edit Email Modal */}
        {/* Edit Email Modal */}
        {operations.selectedAthlete && (
          <EditEmailModal
            isOpen={modals.showEditEmailModal}
            onClose={() => modals.setShowEditEmailModal(false)}
            athlete={operations.selectedAthlete}
            initialEmail={operations.selectedAthlete.email || ""}
            onUpdateEmail={handleUpdateEmail}
          />
        )}

        {/* Invite Modal */}
        {/* Invite Athlete Modal */}
        <InviteAthleteModal
          isOpen={modals.showInviteModal}
          onClose={() => modals.setShowInviteModal(false)}
          onInvite={handleSendInvite}
          groups={groups}
          onCreateNewGroup={() => modals.setShowGroupFormModal(true)}
        />

        {/* Message Modal */}
        {operations.selectedAthlete && (
          <MessageModal
            isOpen={modals.showMessageModal}
            onClose={() => modals.setShowMessageModal(false)}
            athlete={operations.selectedAthlete}
            initialForm={messageForm}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* KPI Management Modal */}
        {operations.selectedAthlete && (
          <KPIModal
            isOpen={modals.showKPIModal}
            onClose={() => modals.setShowKPIModal(false)}
            athlete={operations.selectedAthlete}
            onAddKPI={operations.handleAddKPI}
          />
        )}
      </div>

      {/* Bulk Operations Modal */}
      <BulkOperationModal
        isOpen={modals.showBulkModal}
        onClose={() => modals.setShowBulkModal(false)}
        athletes={filteredAthletes}
        groups={mockGroups}
        onExecute={handleBulkOperation}
      />

      {/* Bulk Operations History Modal */}
      <BulkOperationHistory
        isOpen={modals.showHistoryModal}
        onClose={() => modals.setShowHistoryModal(false)}
      />

      {/* Progress Analytics Modal */}
      {modals.showAnalyticsModal && operations.selectedAthlete && (
        <ModalBackdrop
          isOpen={modals.showAnalyticsModal}
          onClose={() => modals.setShowAnalyticsModal(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <ModalHeader
              title={`${operations.selectedAthlete.fullName} - Progress Analytics`}
              subtitle="Comprehensive performance tracking and insights"
              icon={<BarChart3 className="h-6 w-6" />}
              onClose={() => modals.setShowAnalyticsModal(false)}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ProgressAnalytics athleteId={operations.selectedAthlete.id} />
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Athlete Detail Modal */}
      {modals.showDetailModal && operations.selectedAthlete && (
        <AthleteDetailModal
          athlete={operations.selectedAthlete}
          groups={groups.filter((g) =>
            operations.selectedAthlete?.groupIds?.includes(g.id!)
          )}
          onClose={() => {
            modals.setShowDetailModal(false);
            operations.setSelectedAthlete(null);
          }}
          onEdit={() => {
            modals.setShowDetailModal(false);
            modals.setShowEditAthleteModal(true);
          }}
          onMessage={() => {
            modals.setShowDetailModal(false);
            handleMessageAthlete(operations.selectedAthlete!);
          }}
          onViewProgress={() => {
            modals.setShowDetailModal(false);
            handleAnalytics(operations.selectedAthlete!);
          }}
          onResendInvite={async (inviteId) => {
            await operations.handleResendInvite(inviteId);
          }}
        />
      )}

      {/* Group Form Modal */}
      <GroupFormModal
        isOpen={modals.showGroupFormModal}
        onClose={() => {
          modals.setShowGroupFormModal(false);
          operations.setEditingGroup(null);
        }}
        onSave={() => {
          // Refresh groups list so new group appears in invite modal
          loadGroups();
          modals.setShowGroupFormModal(false);
          operations.setEditingGroup(null);
        }}
        editingGroup={operations.editingGroup}
        existingGroups={groups}
      />

      {/* Manage Group Members Modal */}
      {operations.selectedGroup && (
        <ManageGroupMembersModal
          isOpen={modals.showManageGroupModal}
          onClose={() => {
            modals.setShowManageGroupModal(false);
            operations.setSelectedGroup(null);
          }}
          group={operations.selectedGroup}
          allAthletes={athletes}
          onMembersUpdated={() => {
            // Reload groups to update athlete counts
            loadGroups();
            // Close and reopen the modal to refresh with updated data
            modals.setShowManageGroupModal(false);
            setTimeout(() => modals.setShowManageGroupModal(true), 100);
          }}
        />
      )}

      {/* Add Athlete to Group Modal */}
      {/* Add to Group Modal */}
      {operations.selectedAthlete && (
        <AddToGroupModal
          isOpen={modals.showAddToGroupModal}
          onClose={() => modals.setShowAddToGroupModal(false)}
          athlete={operations.selectedAthlete}
          groups={groups}
          onAddToGroup={operations.handleAddAthleteToGroup}
          onCreateGroup={() => modals.setShowGroupFormModal(true)}
        />
      )}

      {/* Individual Assignment Modal */}
      {modals.showIndividualAssignment && operations.selectedAthlete && (
        <Suspense
          fallback={
            <ModalBackdrop isOpen={true} onClose={() => {}}>
              <div className="bg-white rounded-lg p-8">
                <SkeletonCard />
              </div>
            </ModalBackdrop>
          }
        >
          <IndividualAssignmentModal
            isOpen={modals.showIndividualAssignment}
            onClose={() => {
              modals.setShowIndividualAssignment(false);
              operations.setSelectedAthlete(null);
            }}
            athletes={[operations.selectedAthlete]}
            workoutPlans={workoutPlans}
            currentUserId={user?.id}
            onAssignWorkout={handleAssignWorkout}
          />
        </Suspense>
      )}

      {/* KPI Management Modal */}
      {modals.showKPIManagementModal && (
        <Suspense fallback={<SkeletonCard />}>
          <KPIManagementModal
            isOpen={modals.showKPIManagementModal}
            onClose={() => {
              modals.setShowKPIManagementModal(false);
              setEditingKPI(null);
            }}
            onSave={(kpi: KPITag) => {
              // Add or update KPI in local state
              if (editingKPI) {
                setAvailableKPIs(
                  availableKPIs.map((k) => (k.id === kpi.id ? kpi : k))
                );
                toast.success("KPI updated successfully");
              } else {
                setAvailableKPIs([...availableKPIs, kpi]);
                toast.success("KPI created successfully");
              }
              modals.setShowKPIManagementModal(false);
              setEditingKPI(null);
            }}
            editingKPI={editingKPI}
          />
        </Suspense>
      )}

      {/* Bulk KPI Assignment Modal */}
      {modals.showBulkKPIAssignmentModal && (
        <Suspense fallback={<SkeletonCard />}>
          <BulkKPIAssignmentModal
            isOpen={modals.showBulkKPIAssignmentModal}
            onClose={() => modals.setShowBulkKPIAssignmentModal(false)}
            onComplete={(result: BulkAssignKPIsResponse) => {
              const { totalAssigned, totalSkipped } = result;

              if (totalAssigned > 0) {
                let message = `Successfully assigned KPIs to ${totalAssigned} active athlete${totalAssigned === 1 ? "" : "s"}`;
                if (totalSkipped > 0) {
                  message += ` (${totalSkipped} already assigned)`;
                }
                message += `. Invited athletes will receive KPIs automatically when they accept.`;
                toast.success(message);
              } else if (totalSkipped > 0) {
                toast.info(
                  "All active athletes already have these KPIs assigned. Invited athletes will receive them when they accept."
                );
              } else {
                toast.info(
                  "Selected group contains only invited athletes. They will receive KPIs when they accept their invites."
                );
              }
              modals.setShowBulkKPIAssignmentModal(false);
            }}
            availableGroups={groups}
            availableAthletes={athletes.filter((a) => a.status === "active")}
            availableKPIs={availableKPIs}
          />
        </Suspense>
      )}

      {/* Athlete Edit Modal */}
      {modals.showEditAthleteModal && operations.selectedAthlete && (
        <Suspense fallback={<SkeletonCard />}>
          <AthleteEditModal
            athlete={operations.selectedAthlete}
            onClose={() => {
              modals.setShowEditAthleteModal(false);
            }}
            onSuccess={() => {
              modals.setShowEditAthleteModal(false);
              loadAthletes(); // Refresh athlete data
              toast.success("Athlete profile updated successfully");
            }}
          />
        </Suspense>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={operations.confirmModal.isOpen}
        title={operations.confirmModal.title}
        message={operations.confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={operations.confirmModal.onConfirm}
        onCancel={() =>
          operations.setConfirmModal({
            ...operations.confirmModal,
            isOpen: false,
          })
        }
      />
    </div>
  );
}, "Athletes");
