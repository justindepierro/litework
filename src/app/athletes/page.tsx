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
import { SkeletonCard } from "@/components/ui/Skeleton";
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

interface EnhancedAthlete extends UserType {
  status: "active" | "invited" | "inactive";
  profileImage?: string | null;
  bio?: string | null;
  injuryStatus?: string;
  lastActivity?: Date | null;
  inviteId?: string; // For invited athletes
  inviteEmail?: string; // Email from invites table
  stats?: {
    totalWorkouts: number;
    completedWorkouts: number;
    thisMonthWorkouts: number;
    totalPRs: number;
    recentPRs: number;
    lastWorkout: Date | null;
  };
  communication?: AthleteCommunication;
}

export default function AthletesPage() {
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

  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showEditAthleteModal, setShowEditAthleteModal] = useState(false);
  const [showIndividualAssignment, setShowIndividualAssignment] =
    useState(false);
  const [showKPIManagementModal, setShowKPIManagementModal] = useState(false);
  const [showBulkKPIAssignmentModal, setShowBulkKPIAssignmentModal] =
    useState(false);
  const [availableKPIs, setAvailableKPIs] = useState<KPITag[]>([]);
  const [editingKPI, setEditingKPI] = useState<KPITag | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AthleteGroup | null>(null);
  const [selectedAthlete, setSelectedAthlete] =
    useState<EnhancedAthlete | null>(null);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<AthleteGroup | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounce search term to prevent excessive filtering during typing
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [messageForm, setMessageForm] = useState<MessageForm>({
    recipientId: "",
    subject: "",
    message: "",
    priority: "normal",
    notifyViaEmail: false,
  });

  // Handle group deletion
  const handleDeleteGroup = async (groupId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Group",
      message:
        "Are you sure you want to delete this group? This action cannot be undone and will remove all athlete assignments.",
      onConfirm: async () => {
        try {
          await apiClient.deleteGroup(groupId);

          // Remove from local state
          setGroups(groups.filter((g) => g.id !== groupId));
          setOpenGroupMenuId(null);

          toast.success("Group deleted successfully");
        } catch (error) {
          console.error("Delete group error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete group";
          toast.error(errorMessage);
        }
      },
    });
  };

  // Handle group archiving
  const handleArchiveGroup = async (group: AthleteGroup) => {
    try {
      await apiClient.updateGroup(group.id, {
        ...group,
        archived: true,
      });

      // Reload groups to reflect changes
      await loadGroups();
      setOpenGroupMenuId(null);

      toast.success("Group archived successfully");
    } catch (error) {
      console.error("Archive group error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to archive group";
      toast.error(errorMessage);
    }
  };

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

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Workout assigned successfully!");
        setShowIndividualAssignment(false);
        setSelectedAthlete(null);
      } else {
        toast.error(data.error || "Failed to assign workout");
      }
    } catch (err) {
      console.error("Failed to assign workout:", err);
      toast.error("Failed to assign workout");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openGroupMenuId) {
        setOpenGroupMenuId(null);
      }
    };

    if (openGroupMenuId) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openGroupMenuId]);

  const handleSendInvite = async (inviteForm: InviteForm) => {
    // Only require first name and last name (email is optional)
    if (!inviteForm.firstName || !inviteForm.lastName) return;

    try {
      const response = (await apiClient.createAthleteInvite({
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email, // Can be empty string
        groupId: inviteForm.groupId || undefined, // Include groupId if provided
        notes: inviteForm.notes || undefined, // Include notes if provided
      })) as {
        success: boolean;
        error?: string;
        data?: {
          invite?: {
            id: string;
            first_name: string;
            last_name: string;
            email: string | null;
            group_ids?: string[];
            created_at: string;
          };
        };
        invite?: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          group_ids?: string[];
          created_at: string;
        };
      };

      if (response.success) {
        // Add the new invite to the athletes list immediately
        // API returns invite at top level
        const newInvite = response.invite || response.data?.invite;
        if (newInvite) {
          const newAthlete: EnhancedAthlete = {
            id: newInvite.id,
            firstName: newInvite.first_name || inviteForm.firstName,
            lastName: newInvite.last_name || inviteForm.lastName,
            fullName: `${newInvite.first_name || inviteForm.firstName} ${newInvite.last_name || inviteForm.lastName}`,
            email: newInvite.email || inviteForm.email || "",
            role: "athlete" as const,
            groupIds:
              newInvite.group_ids ||
              (inviteForm.groupId ? [inviteForm.groupId] : []),
            status: "invited" as const,
            profileImage: null,
            bio: null,
            injuryStatus: undefined,
            stats: {
              totalWorkouts: 0,
              completedWorkouts: 0,
              thisMonthWorkouts: 0,
              totalPRs: 0,
              recentPRs: 0,
              lastWorkout: null,
            },
            communication: {
              unreadMessages: 0,
              lastMessage: null,
              lastMessageTime: null,
              notificationsEnabled: true,
              preferredContact: "app" as const,
            },
            personalRecords: [],
            createdAt: new Date(newInvite.created_at || Date.now()),
            updatedAt: new Date(newInvite.created_at || Date.now()),
          };

          // Add to the top of the athletes list for immediate visibility
          setAthletes((prev) => [newAthlete, ...prev]);

          // Reload groups to show updated athlete count and membership
          await loadGroups();
        }

        const successMsg = inviteForm.email
          ? `Invite sent successfully to ${inviteForm.email}!`
          : `Athlete ${inviteForm.firstName} ${inviteForm.lastName} added successfully!`;
        toast.success(successMsg);
        setShowInviteModal(false);
        setError("");
      } else {
        const errorMsg =
          typeof response.error === "string"
            ? response.error
            : "Failed to send invite";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add athlete";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error adding athlete:", err);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    // [REMOVED] console.log("Resending invite:", inviteId);
    toast.info("Sending invitation email...");
    try {
      const response = (await apiClient.resendInvite(inviteId)) as {
        success: boolean;
        message?: string;
      };

      if (response.success) {
        toast.success("✅ Invitation email sent! Check your inbox.");
      } else {
        toast.error("Failed to resend invite");
      }
    } catch (err) {
      console.error("Error resending invite:", err);
      toast.error("Failed to resend invite");
    }
  };

  const handleCancelInvite = (inviteId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Invitation",
      message:
        "Are you sure you want to cancel this invitation? The athlete will not be able to accept it.",
      onConfirm: async () => {
        try {
          setConfirmModal({ ...confirmModal, isOpen: false });

          const response = (await apiClient.deleteInvite(inviteId)) as {
            success: boolean;
            message?: string;
            error?: string;
          };

          if (response.success) {
            // Remove from local state
            setAthletes((prev) => prev.filter((a) => a.id !== inviteId));
            // Reload groups to update counts
            await loadGroups();
            toast.success("Invitation cancelled successfully");
          } else {
            console.error("Delete failed:", response.error || response);
            toast.error(response.error || "Failed to cancel invitation");
          }
        } catch (err) {
          console.error("Error canceling invite:", err);
          toast.error(
            err instanceof Error ? err.message : "Failed to cancel invitation"
          );
        }
      },
    });
  };

  const handleUpdateEmail = async (email: string) => {
    if (!selectedAthlete || !email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = (await apiClient.updateInvite(selectedAthlete.id, {
        email: email,
      })) as {
        success: boolean;
        invite?: {
          email: string;
          status: string;
        };
        error?: string;
      };

      if (response.success && response.invite) {
        // Update local state with new email and status
        setAthletes((prev) =>
          prev.map((a) =>
            a.id === selectedAthlete.id
              ? {
                  ...a,
                  email: response.invite?.email || email,
                  status: "invited" as const, // Update status to invited
                }
              : a
          )
        );
        setShowEditEmailModal(false);
        toast.success(
          "Email updated successfully! You can now send the invite."
        );
      } else {
        toast.error(response.error || "Failed to update email");
      }
    } catch (err) {
      console.error("Error updating email:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update email"
      );
    }
  };

  const handleAddAthleteToGroup = async (
    groupId: string,
    athleteId: string
  ) => {
    try {
      const response = await fetch("/api/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          athleteIds: [athleteId],
        }),
      });

      const data = await response.json();

      if (data.success) {
        const group = groups.find((g) => g.id === groupId);
        const athlete = athletes.find((a) => a.id === athleteId);
        toast.success(
          `Added ${athlete?.firstName || "athlete"} to ${group?.name || "group"}`
        );
        loadGroups(); // Refresh groups
      } else {
        toast.error(data.error || "Failed to add to group");
      }
    } catch (error) {
      console.error("Error adding to group:", error);
      toast.error("Failed to add to group");
    }
  };

  const handleAnalytics = (athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowAnalyticsModal(true);
  };

  const handleAddKPI = async (kpiForm: KPIForm) => {
    if (!selectedAthlete || !kpiForm.kpiName || !kpiForm.value) return;

    const newKPI: AthleteKPI = {
      id: Date.now().toString(),
      athleteId: selectedAthlete.id,
      exerciseId: kpiForm.kpiName.toLowerCase().replace(/\s+/g, "-"),
      exerciseName: kpiForm.kpiName,
      currentPR: parseFloat(kpiForm.value),
      dateAchieved: new Date(kpiForm.dateSet),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update local state
    const updatedAthletes = athletes.map((athlete) =>
      athlete.id === selectedAthlete.id
        ? {
            ...athlete,
            personalRecords: [...(athlete.personalRecords || []), newKPI],
          }
        : athlete
    );

    setAthletes(updatedAthletes);
    setSelectedAthlete({
      ...selectedAthlete,
      personalRecords: [...(selectedAthlete.personalRecords || []), newKPI],
    });
  };

  const handleMessageAthlete = (athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setMessageForm({
      recipientId: athlete.id,
      subject: "",
      message: "",
      priority: "normal",
      notifyViaEmail: athlete.communication?.preferredContact === "email",
    });
    setShowMessageModal(true);
  };

  const handleSendMessage = async (messageForm: MessageForm) => {
    if (!messageForm.message || !selectedAthlete) return;

    try {
      // Here you would call your API to send the message
      // const response = await apiClient.sendMessage(messageForm);

      // For demo, we'll just update the local state
      const updatedAthletes = athletes.map((athlete) =>
        athlete.id === selectedAthlete.id
          ? {
              ...athlete,
              communication: {
                ...athlete.communication!,
                lastMessage: messageForm.message,
                lastMessageTime: new Date(),
              },
            }
          : athlete
      );

      setAthletes(updatedAthletes);
      toast.success(`Message sent to ${selectedAthlete.fullName}!`);
      setShowMessageModal(false);
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
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
    return <User className="h-4 w-4 text-silver-600" />;
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
  const handleCardClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowDetailModal(true);
  }, []);

  const handleMessageClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowMessageModal(true);
  }, []);

  const handleAssignWorkoutClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowIndividualAssignment(true);
  }, []);

  const handleManageKPIsClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowKPIModal(true);
  }, []);

  const handleViewAnalyticsClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowAnalyticsModal(true);
  }, []);

  const handleAddToGroupClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowAddToGroupModal(true);
  }, []);

  const handleEditEmailClick = useCallback((athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowEditEmailModal(true);
  }, []);

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
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
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Enhanced Mobile-Optimized Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-heading-primary text-2xl sm:text-3xl lg:text-4xl mb-3 font-bold">
              Team Athletes
            </h1>
            <p className="text-heading-secondary text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed mx-auto sm:mx-0">
              Manage your athletes with invite-based onboarding, performance
              tracking, and seamless communication
            </p>
          </div>

          {/* Mobile-Optimized Communication Stats */}
          <AthleteStats athleteCounts={athleteCounts} athletes={athletes} />

          {/* Mobile-Optimized Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => setShowHistoryModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg"
              leftIcon={<History className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              History
            </Button>
            <Button
              onClick={() => setShowBulkModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg"
              leftIcon={<Users className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Bulk Actions
            </Button>
            <Button
              onClick={() => setShowKPIManagementModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg bg-navy-50 hover:bg-navy-100 text-accent-orange border-navy-200"
              leftIcon={<Tag className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Create KPI
            </Button>
            <Button
              onClick={() => setShowBulkKPIAssignmentModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg bg-navy-50 hover:bg-navy-100 text-accent-blue border-navy-200"
              leftIcon={<Target className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Assign KPIs
            </Button>
            <Button
              onClick={() => setShowGroupFormModal(true)}
              variant="secondary"
              className="shadow-md hover:shadow-lg bg-navy-50 hover:bg-navy-100 text-accent-purple border-navy-200"
              leftIcon={<Users className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Add Group
            </Button>
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="primary"
              className="shadow-md hover:shadow-lg"
              leftIcon={<Plus className="w-5 h-5 sm:w-4 sm:h-4" />}
            >
              Add Athlete
            </Button>
          </div>
        </div>

        {/* Groups Section */}
        <GroupsSection
          groups={activeGroups}
          openGroupMenuId={openGroupMenuId}
          onOpenMenu={setOpenGroupMenuId}
          onEditGroup={(group) => {
            setEditingGroup(group);
            setShowGroupFormModal(true);
          }}
          onArchiveGroup={handleArchiveGroup}
          onDeleteGroup={handleDeleteGroup}
          onManageMembers={(group) => {
            setSelectedGroup(group);
            setShowManageGroupModal(true);
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
          {/* Add Athlete Placeholder Card */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-sm hover:shadow-xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:scale-[1.02] transition-all duration-200 group touch-manipulation cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 p-6"
          >
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-navy-900 mb-1">
                Add New Athlete
              </h3>
              <p className="text-sm text-blue-600 font-medium">
                Click to add athlete profile
              </p>
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
                onResendInvite={handleResendInvite}
                onCancelInvite={handleCancelInvite}
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
        {selectedAthlete && (
          <EditEmailModal
            isOpen={showEditEmailModal}
            onClose={() => setShowEditEmailModal(false)}
            athlete={selectedAthlete}
            initialEmail={selectedAthlete.email || ""}
            onUpdateEmail={handleUpdateEmail}
          />
        )}

        {/* Invite Modal */}
        {/* Invite Athlete Modal */}
        <InviteAthleteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleSendInvite}
          groups={groups}
          onCreateNewGroup={() => setShowGroupFormModal(true)}
        />

        {/* Message Modal */}
        {selectedAthlete && (
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            athlete={selectedAthlete}
            initialForm={messageForm}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* KPI Management Modal */}
        {selectedAthlete && (
          <KPIModal
            isOpen={showKPIModal}
            onClose={() => setShowKPIModal(false)}
            athlete={selectedAthlete}
            onAddKPI={handleAddKPI}
          />
        )}
      </div>

      {/* Bulk Operations Modal */}
      <BulkOperationModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        athletes={filteredAthletes}
        groups={mockGroups}
        onExecute={handleBulkOperation}
      />

      {/* Bulk Operations History Modal */}
      <BulkOperationHistory
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Progress Analytics Modal */}
      {showAnalyticsModal && selectedAthlete && (
        <ModalBackdrop
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <ModalHeader
              title={`${selectedAthlete.fullName} - Progress Analytics`}
              subtitle="Comprehensive performance tracking and insights"
              icon={<BarChart3 className="h-6 w-6" />}
              onClose={() => setShowAnalyticsModal(false)}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ProgressAnalytics athleteId={selectedAthlete.id} />
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* Athlete Detail Modal */}
      {showDetailModal && selectedAthlete && (
        <AthleteDetailModal
          athlete={selectedAthlete}
          groups={groups.filter((g) =>
            selectedAthlete.groupIds?.includes(g.id!)
          )}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAthlete(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditAthleteModal(true);
          }}
          onMessage={() => {
            setShowDetailModal(false);
            handleMessageAthlete(selectedAthlete);
          }}
          onViewProgress={() => {
            setShowDetailModal(false);
            handleAnalytics(selectedAthlete);
          }}
          onResendInvite={async (inviteId) => {
            await handleResendInvite(inviteId);
          }}
        />
      )}

      {/* Group Form Modal */}
      <GroupFormModal
        isOpen={showGroupFormModal}
        onClose={() => {
          setShowGroupFormModal(false);
          setEditingGroup(null);
        }}
        onSave={() => {
          // Refresh groups list so new group appears in invite modal
          loadGroups();
          setShowGroupFormModal(false);
          setEditingGroup(null);
        }}
        editingGroup={editingGroup}
        existingGroups={groups}
      />

      {/* Manage Group Members Modal */}
      {selectedGroup && (
        <ManageGroupMembersModal
          isOpen={showManageGroupModal}
          onClose={() => {
            setShowManageGroupModal(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          allAthletes={athletes}
          onMembersUpdated={() => {
            // Reload groups to update athlete counts
            loadGroups();
            // Close and reopen the modal to refresh with updated data
            setShowManageGroupModal(false);
            setTimeout(() => setShowManageGroupModal(true), 100);
          }}
        />
      )}

      {/* Add Athlete to Group Modal */}
      {/* Add to Group Modal */}
      {selectedAthlete && (
        <AddToGroupModal
          isOpen={showAddToGroupModal}
          onClose={() => setShowAddToGroupModal(false)}
          athlete={selectedAthlete}
          groups={groups}
          onAddToGroup={handleAddAthleteToGroup}
          onCreateGroup={() => setShowGroupFormModal(true)}
        />
      )}

      {/* Individual Assignment Modal */}
      {showIndividualAssignment && selectedAthlete && (
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
            isOpen={showIndividualAssignment}
            onClose={() => {
              setShowIndividualAssignment(false);
              setSelectedAthlete(null);
            }}
            athletes={[selectedAthlete]}
            workoutPlans={workoutPlans}
            currentUserId={user?.id}
            onAssignWorkout={handleAssignWorkout}
          />
        </Suspense>
      )}

      {/* KPI Management Modal */}
      {showKPIManagementModal && (
        <Suspense fallback={<SkeletonCard />}>
          <KPIManagementModal
            isOpen={showKPIManagementModal}
            onClose={() => {
              setShowKPIManagementModal(false);
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
              setShowKPIManagementModal(false);
              setEditingKPI(null);
            }}
            editingKPI={editingKPI}
          />
        </Suspense>
      )}

      {/* Bulk KPI Assignment Modal */}
      {showBulkKPIAssignmentModal && (
        <Suspense fallback={<SkeletonCard />}>
          <BulkKPIAssignmentModal
            isOpen={showBulkKPIAssignmentModal}
            onClose={() => setShowBulkKPIAssignmentModal(false)}
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
              setShowBulkKPIAssignmentModal(false);
            }}
            availableGroups={groups}
            availableAthletes={athletes.filter((a) => a.status === "active")}
            availableKPIs={availableKPIs}
          />
        </Suspense>
      )}

      {/* Athlete Edit Modal */}
      {showEditAthleteModal && selectedAthlete && (
        <Suspense fallback={<SkeletonCard />}>
          <AthleteEditModal
            athlete={selectedAthlete}
            onClose={() => {
              setShowEditAthleteModal(false);
            }}
            onSuccess={() => {
              setShowEditAthleteModal(false);
              loadAthletes(); // Refresh athlete data
              toast.success("Athlete profile updated successfully");
            }}
          />
        </Suspense>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
