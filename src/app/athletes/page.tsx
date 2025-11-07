"use client";

import { useRequireCoach } from "@/hooks/use-auth-guard";
import { useState, useEffect, lazy, useMemo, Suspense } from "react";
import {
  User,
  Trophy,
  Plus,
  BarChart3,
  Zap,
  X,
  Target,
  Trash2,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Users,
  Search,
  MoreVertical,
  MessageSquare,
  Dumbbell,
  History,
  Edit3,
  Archive,
} from "lucide-react";
import {
  User as UserType,
  AthleteKPI,
  AthleteGroup,
  WorkoutPlan,
  WorkoutAssignment,
} from "@/types";
import { apiClient } from "@/lib/api-client";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import { log } from "@/lib/dev-logger";

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

interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  groupId?: string;
  notes?: string;
}

interface KPIForm {
  kpiName: string;
  value: string;
  dateSet: string;
}

interface MessageForm {
  recipientId: string;
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  notifyViaEmail: boolean;
}

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

// Enhanced athlete data - now empty, will be loaded from API
const enhancedAthletes: EnhancedAthlete[] = [];

export default function AthletesPage() {
  const { isLoading, user } = useRequireCoach();
  const toast = useToast();

  const [athletes, setAthletes] = useState<EnhancedAthlete[]>(enhancedAthletes);
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
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
  const [showIndividualAssignment, setShowIndividualAssignment] =
    useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AthleteGroup | null>(null);
  const [selectedAthlete, setSelectedAthlete] =
    useState<EnhancedAthlete | null>(null);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<AthleteGroup | null>(null);
  const [editEmailForm, setEditEmailForm] = useState({
    email: "",
  });

  // Assignment data
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

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

  const [inviteForm, setInviteForm] = useState<InviteForm>({
    firstName: "",
    lastName: "",
    email: "",
    groupId: "",
    notes: "",
  });

  const [kpiForm, setKPIForm] = useState<KPIForm>({
    kpiName: "",
    value: "",
    dateSet: new Date().toISOString().split("T")[0],
  });

  const [messageForm, setMessageForm] = useState<MessageForm>({
    recipientId: "",
    subject: "",
    message: "",
    priority: "normal",
    notifyViaEmail: false,
  });

  // Load groups on mount
  const loadGroups = async () => {
    try {
      const response = (await apiClient.getGroups()) as {
        groups: AthleteGroup[];
      };
      setGroups(response.groups || []);
    } catch (err) {
      console.error("Failed to load groups:", err);
    }
  };

  // Load athletes and invites
  const loadAthletes = async () => {
    try {
      const response = (await apiClient.getAthletes()) as {
        success: boolean;
        data: {
          athletes: Array<{
            id: string;
            first_name: string;
            last_name: string;
            email: string;
            role: string;
            created_at: string;
          }>;
          invites: Array<{
            id: string;
            first_name: string;
            last_name: string;
            email: string | null;
            status: string;
            created_at: string;
            group_ids?: string[];
          }>;
        };
      };

      if (response.success) {
        // Convert API athletes to EnhancedAthlete format
        const loadedAthletes: EnhancedAthlete[] = [
          // Map registered athletes
          ...response.data.athletes.map((athlete) => ({
            id: athlete.id,
            firstName: athlete.first_name,
            lastName: athlete.last_name,
            fullName: `${athlete.first_name} ${athlete.last_name}`,
            email: athlete.email,
            role: "athlete" as const,
            groupIds: [],
            status: "active" as const,
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
            createdAt: new Date(athlete.created_at),
            updatedAt: new Date(athlete.created_at),
          })),
          // Map pending invites (including drafts)
          ...response.data.invites.map((invite) => ({
            id: invite.id,
            firstName: invite.first_name,
            lastName: invite.last_name,
            fullName: `${invite.first_name} ${invite.last_name}`,
            email: invite.email || "",
            role: "athlete" as const,
            groupIds: invite.group_ids || [],
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
            createdAt: new Date(invite.created_at),
            updatedAt: new Date(invite.created_at),
          })),
        ];

        setAthletes(loadedAthletes);
      }
    } catch (err) {
      console.error("Failed to load athletes:", err);
      // Fall back to mock data if API fails
      setAthletes(enhancedAthletes);
    }
  };

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
    // Only load data after auth is verified
    if (!isLoading && user) {
      loadGroups();
      loadAthletes();
      loadWorkoutPlans();
    }
  }, [isLoading, user]);

  const loadWorkoutPlans = async () => {
    try {
      const response = await fetch("/api/workouts");
      const data = await response.json();

      if (data.success && data.data) {
        setWorkoutPlans(data.data.workouts || data.data || []);
      }
    } catch (err) {
      console.error("Failed to load workout plans:", err);
    }
  };

  const handleAssignWorkout = async (
    assignment: Omit<WorkoutAssignment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: [assignment] }),
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

  const handleSendInvite = async () => {
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

          console.log(
            "✅ New athlete added:",
            newAthlete.id,
            "Groups:",
            newAthlete.groupIds
          );
        }

        const successMsg = inviteForm.email
          ? `Invite sent successfully to ${inviteForm.email}!`
          : `Athlete ${inviteForm.firstName} ${inviteForm.lastName} added successfully!`;
        toast.success(successMsg);
        setInviteForm({
          firstName: "",
          lastName: "",
          email: "",
          groupId: "",
          notes: "",
        });
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
    console.log("Resending invite:", inviteId);
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

  const handleKPIManagement = (athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowKPIModal(true);
  };

  const handleUpdateEmail = async () => {
    if (!selectedAthlete || !editEmailForm.email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = (await apiClient.updateInvite(selectedAthlete.id, {
        email: editEmailForm.email,
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
                  email: response.invite?.email || editEmailForm.email,
                  status: "invited" as const, // Update status to invited
                }
              : a
          )
        );
        setShowEditEmailModal(false);
        setEditEmailForm({ email: "" });
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

  const handleAnalytics = (athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowAnalyticsModal(true);
  };

  const handleAddKPI = async () => {
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
    setKPIForm({
      kpiName: "",
      value: "",
      dateSet: new Date().toISOString().split("T")[0],
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

  const handleSendMessage = async () => {
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
      setMessageForm({
        recipientId: "",
        subject: "",
        message: "",
        priority: "normal",
        notifyViaEmail: false,
      });
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
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (status === "active")
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "invited")
      return <Clock className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (status: string, injuryStatus?: string | null) => {
    if (injuryStatus) return "Injured";
    if (status === "active") return "Active";
    if (status === "invited") return "Invited";
    return "Unknown";
  };

  // Memoize filtered athletes to prevent recalculation on every render
  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const matchesSearch =
        athlete.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && athlete.status === "active") ||
        (statusFilter === "invited" && athlete.status === "invited") ||
        (statusFilter === "injured" && athlete.injuryStatus);
      return matchesSearch && matchesStatus;
    });
  }, [athletes, searchTerm, statusFilter]);

  // Memoize counts to prevent recalculation
  const athleteCounts = useMemo(
    () => ({
      active: athletes.filter((a) => a.status === "active").length,
      invited: athletes.filter((a) => a.status === "invited").length,
      injured: athletes.filter((a) => a.injuryStatus).length,
    }),
    [athletes]
  );

  // Memoize active groups
  const activeGroups = useMemo(
    () => groups.filter((g) => !g.archived),
    [groups]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6">
            <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-blue-50 rounded-xl sm:bg-transparent sm:p-0">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">
                {athleteCounts.active} Active
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-orange-50 rounded-xl sm:bg-transparent sm:p-0">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">
                {athleteCounts.invited} Pending
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-green-50 rounded-xl sm:bg-transparent sm:p-0">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">
                {athletes.reduce(
                  (acc, a) => acc + (a.communication?.unreadMessages || 0),
                  0
                )}{" "}
                Unread
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-yellow-50 rounded-xl sm:bg-transparent sm:p-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">
                {athleteCounts.injured} Injured
              </span>
            </div>
          </div>

          {/* Mobile-Optimized Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="btn-secondary flex items-center justify-center gap-3 px-6 py-4 sm:py-3 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation"
            >
              <History className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>History</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="btn-secondary flex items-center justify-center gap-3 px-6 py-4 sm:py-3 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation"
            >
              <Users className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Bulk Actions</span>
            </button>
            <button
              onClick={() => setShowGroupFormModal(true)}
              className="btn-secondary flex items-center justify-center gap-3 px-6 py-4 sm:py-3 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            >
              <Users className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Add Group</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center justify-center gap-3 px-6 py-4 sm:py-3 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Add Athlete</span>
            </button>
          </div>
        </div>

        {/* Groups Section */}
        {activeGroups.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Groups ({activeGroups.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeGroups.map((group) => {
                // Get athlete count directly from group's athleteIds array
                const athleteCount = group.athleteIds?.length || 0;

                return (
                  <div
                    key={group.id}
                    className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg relative"
                  >
                    {/* 3-dot menu */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenGroupMenuId(
                            openGroupMenuId === group.id ? null : group.id
                          );
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Group menu"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Dropdown menu */}
                      {openGroupMenuId === group.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingGroup(group);
                              setShowGroupFormModal(true);
                              setOpenGroupMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Group
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveGroup(group);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                          >
                            <Archive className="w-4 h-4" />
                            Archive Group
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Group
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Group content (clickable to manage members) */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2 pr-8">
                        <h4 className="font-semibold text-gray-900">
                          {group.name}
                        </h4>
                        {group.color && (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                        )}
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowManageGroupModal(true);
                          }}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label={`Manage ${group.name} members`}
                        >
                          <Users className="w-4 h-4" />
                          <span>
                            {athleteCount} athlete
                            {athleteCount !== 1 ? "s" : ""}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowManageGroupModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
                          aria-label="Add athletes to group"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile-Optimized Search and Filters */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 sm:py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {["all", "active", "invited"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-4 sm:py-3 text-sm font-medium rounded-xl transition-all touch-manipulation ${
                  statusFilter === status
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Athletes Grid - Mobile Optimized Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Add Athlete Placeholder Card */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border-2 border-dashed border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all duration-200 group touch-manipulation cursor-pointer min-h-[280px] flex flex-col items-center justify-center gap-4 p-6 hover:from-blue-100 hover:to-blue-200"
          >
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">
                Add New Athlete
              </h3>
              <p className="text-sm text-blue-600">
                Click to add athlete profile
              </p>
            </div>
          </button>

          {filteredAthletes.length > 0 &&
            filteredAthletes.map((athlete) => (
              <div
                key={athlete.id}
                onClick={() => {
                  setSelectedAthlete(athlete);
                  setShowDetailModal(true);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group touch-manipulation cursor-pointer"
              >
                {/* Mobile-Optimized Card Header */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg">
                          {(athlete.fullName || "")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        {/* Communication indicator */}
                        {athlete.communication?.unreadMessages &&
                          athlete.communication.unreadMessages > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {athlete.communication.unreadMessages}
                            </div>
                          )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {athlete.fullName}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {getStatusIcon(athlete.status, athlete.injuryStatus)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(
                              athlete.status,
                              athlete.injuryStatus
                            )}
                          </span>

                          {/* Group badges - show groups this athlete belongs to */}
                          {athlete.groupIds &&
                            athlete.groupIds.length > 0 &&
                            athlete.groupIds.map((groupId) => {
                              const group = groups.find(
                                (g) => g.id === groupId
                              );
                              if (!group) return null;
                              return (
                                <span
                                  key={group.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: group.color }}
                                  title={group.name}
                                >
                                  <Users className="w-3 h-3" />
                                  {group.name}
                                </span>
                              );
                            })}
                        </div>

                        {/* Email Address Display */}
                        {athlete.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="truncate">{athlete.email}</span>
                          </div>
                        )}
                        {!athlete.email && athlete.status === "invited" && (
                          <div className="flex items-center gap-1 text-sm text-orange-600 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              No email - Add to send invite
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Last Communication */}
                  {athlete.communication?.lastMessage && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-blue-900 line-clamp-2">
                            {athlete.communication.lastMessage}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {athlete.communication.lastMessageTime?.toLocaleDateString()}{" "}
                            at{" "}
                            {athlete.communication.lastMessageTime?.toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio/Notes */}
                  {athlete.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {athlete.bio}
                    </p>
                  )}

                  {/* Performance Stats - Only for active athletes */}
                  {athlete.status === "active" && athlete.stats && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Dumbbell className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {athlete.stats.thisMonthWorkouts}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">This Month</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-gray-900">
                            {athlete.stats.recentPRs}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Recent PRs</p>
                      </div>
                    </div>
                  )}

                  {/* Personal Records Preview */}
                  {athlete.personalRecords &&
                    athlete.personalRecords.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Top PRs
                          </span>
                        </div>
                        <div className="space-y-1">
                          {athlete.personalRecords
                            .slice(0, 2)
                            .map((pr: AthleteKPI) => (
                              <div
                                key={pr.id}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-600">
                                  {pr.exerciseName}:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {pr.currentPR} lbs
                                </span>
                              </div>
                            ))}
                          {athlete.personalRecords.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{athlete.personalRecords.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Email Missing Reminder */}
                  {!athlete.email && athlete.status === "invited" && (
                    <div
                      className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">
                          Email Required to Send Invite
                        </span>
                      </div>
                      <p className="text-xs text-amber-700 mb-2">
                        Add an email address to send the invitation
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: Open edit modal to add email
                          alert(
                            "Edit athlete feature coming soon - add email via detail modal"
                          );
                        }}
                        className="text-xs text-amber-600 hover:text-amber-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        Add Email Address
                      </button>
                    </div>
                  )}

                  {/* Invite Status for Pending */}
                  {athlete.status === "invited" && athlete.email && (
                    <div
                      className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Invite Pending
                        </span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Sent {athlete.createdAt.toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "BUTTON CLICKED - Resending invite:",
                              athlete.id
                            );
                            handleResendInvite(athlete.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Resend Invite
                        </button>
                        <span className="text-xs text-gray-400">•</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(
                              "❌ BUTTON CLICKED - Canceling invite:",
                              athlete.id
                            );
                            handleCancelInvite(athlete.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions with Communication Features */}
                <div className="px-6 pb-6">
                  {athlete.status === "active" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedAthlete(athlete);
                          setShowIndividualAssignment(true);
                        }}
                        className="btn-primary flex items-center justify-center gap-2 text-sm py-2 col-span-2"
                        title="Assign a workout to this athlete"
                      >
                        <Dumbbell className="w-4 h-4" />
                        Assign Workout
                      </button>
                      <button
                        onClick={() => handleMessageAthlete(athlete)}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => handleKPIManagement(athlete)}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <Zap className="w-4 h-4" />
                        Manage PRs
                      </button>
                      <button
                        onClick={() => handleAnalytics(athlete)}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Progress
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAthlete(athlete);
                          setShowAddToGroupModal(true);
                        }}
                        className="btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <Users className="w-4 h-4" />
                        Add to Group
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedAthlete(athlete);
                            setEditEmailForm({ email: athlete.email || "" });
                            setShowEditEmailModal(true);
                          }}
                          className="btn-primary flex items-center justify-center gap-2 text-sm py-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          {athlete.email ? "Edit Email" : "Add Email"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleResendInvite(athlete.id);
                          }}
                          className="btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                          disabled={!athlete.email}
                          title={
                            !athlete.email
                              ? "Add email first to send invite"
                              : "Resend invitation email"
                          }
                        >
                          <RefreshCw className="w-4 h-4" />
                          Resend
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelInvite(athlete.id);
                        }}
                        className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel Invite
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Empty State - Only show if no athletes at all */}
        {filteredAthletes.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No athletes found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Click the 'Add Athlete' card above to get started"}
            </p>
          </div>
        )}

        {/* Edit Email Modal */}
        {showEditEmailModal && selectedAthlete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedAthlete.email ? "Edit" : "Add"} Email Address
                </h2>
                <button
                  onClick={() => {
                    setShowEditEmailModal(false);
                    setEditEmailForm({ email: "" });
                  }}
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Athlete
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedAthlete.fullName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editEmailForm.email}
                    onChange={(e) =>
                      setEditEmailForm({ email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="athlete@email.com"
                    autoFocus
                  />
                  {selectedAthlete.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      Current: {selectedAthlete.email}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Ready to Send Invite
                      </h4>
                      <p className="text-sm text-blue-700">
                        After updating the email, you can use the
                        &ldquo;Resend&rdquo; button to send the invitation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditEmailModal(false);
                      setEditEmailForm({ email: "" });
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEmail}
                    className="flex-1 btn-primary"
                    disabled={!editEmailForm.email}
                  >
                    {selectedAthlete.email ? "Update" : "Add"} Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Invite New Athlete
                </h2>
                <button onClick={() => setShowInviteModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={inviteForm.firstName}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={inviteForm.lastName}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="athlete@email.com (can add later)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to add athlete profile without sending invite
                    yet
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Group (Optional)
                  </label>
                  <select
                    value={inviteForm.groupId}
                    onChange={(e) => {
                      if (e.target.value === "CREATE_NEW") {
                        setShowGroupFormModal(true);
                      } else {
                        setInviteForm({
                          ...inviteForm,
                          groupId: e.target.value,
                        });
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">No group assigned</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                    <option
                      value="CREATE_NEW"
                      className="font-semibold text-blue-600"
                    >
                      + Create New Group
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={inviteForm.notes}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, notes: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about this athlete..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        How It Works
                      </h4>
                      <p className="text-sm text-blue-700">
                        {inviteForm.email
                          ? "The athlete will receive an email with a secure link to create their account."
                          : "Add athlete profile now, then add email later to send the invite."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    disabled={!inviteForm.firstName || !inviteForm.lastName}
                  >
                    <Send className="w-4 h-4" />
                    {inviteForm.email ? "Send Invite" : "Add Athlete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && selectedAthlete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Message {selectedAthlete.fullName}
                </h2>
                <button onClick={() => setShowMessageModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) =>
                      setMessageForm({
                        ...messageForm,
                        subject: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter message subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={messageForm.message}
                    onChange={(e) =>
                      setMessageForm({
                        ...messageForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) =>
                        setMessageForm({
                          ...messageForm,
                          priority: e.target.value as "low" | "normal" | "high",
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={messageForm.notifyViaEmail}
                        onChange={(e) =>
                          setMessageForm({
                            ...messageForm,
                            notifyViaEmail: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Also send via email
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-1">
                        Communication Tip
                      </h4>
                      <p className="text-sm text-green-700">
                        {selectedAthlete.communication?.preferredContact ===
                        "email"
                          ? `${selectedAthlete.fullName} prefers email communication. Consider checking the email option above.`
                          : `${selectedAthlete.fullName} prefers app notifications. They'll be notified in the app immediately.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    disabled={!messageForm.message}
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Management Modal */}
        {showKPIModal && selectedAthlete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Personal Records - {selectedAthlete.fullName}
                </h2>
                <button onClick={() => setShowKPIModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Add New Personal Record
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise Name
                    </label>
                    <input
                      type="text"
                      value={kpiForm.kpiName}
                      onChange={(e) =>
                        setKPIForm({ ...kpiForm, kpiName: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Bench Press"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={kpiForm.value}
                      onChange={(e) =>
                        setKPIForm({ ...kpiForm, value: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="225"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Achieved
                    </label>
                    <input
                      type="date"
                      value={kpiForm.dateSet}
                      onChange={(e) =>
                        setKPIForm({ ...kpiForm, dateSet: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddKPI}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                      disabled={!kpiForm.kpiName || !kpiForm.value}
                    >
                      <Plus className="w-4 h-4" />
                      Add PR
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Current Personal Records (
                  {selectedAthlete.personalRecords?.length || 0})
                </h3>
                {selectedAthlete.personalRecords?.length ? (
                  <div className="space-y-3">
                    {selectedAthlete.personalRecords.map((kpi: AthleteKPI) => (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {kpi.exerciseName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {kpi.currentPR} lbs •{" "}
                              {kpi.dateAchieved.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No personal records yet. Add some PRs to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  {selectedAthlete.fullName} - Progress Analytics
                </h2>
                <p className="text-gray-600 mt-1">
                  Comprehensive performance tracking and insights
                </p>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ProgressAnalytics athleteId={selectedAthlete.id} />
            </div>
          </div>
        </div>
      )}

      {/* Athlete Detail Modal */}
      {showDetailModal && selectedAthlete && (
        <AthleteDetailModal
          athlete={selectedAthlete}
          groups={groups}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAthlete(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            // TODO: Open edit modal
          }}
          onMessage={() => {
            setShowDetailModal(false);
            handleMessageAthlete(selectedAthlete);
          }}
          onViewProgress={() => {
            setShowDetailModal(false);
            handleAnalytics(selectedAthlete);
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
        onSave={(group) => {
          // Refresh groups list
          loadGroups();
          // After creating the group, select it in the invite form
          setInviteForm({ ...inviteForm, groupId: group.id });
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
      {showAddToGroupModal && selectedAthlete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Add {selectedAthlete.firstName} to Group
              </h2>
              <button
                onClick={() => {
                  setShowAddToGroupModal(false);
                  setSelectedAthlete(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No groups available</p>
                  <button
                    onClick={() => {
                      setShowAddToGroupModal(false);
                      setShowGroupFormModal(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Group
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => {
                    const isInGroup = group.athleteIds?.includes(
                      selectedAthlete.id
                    );
                    return (
                      <button
                        key={group.id}
                        onClick={async () => {
                          if (isInGroup) {
                            toast.info(
                              `${selectedAthlete.firstName} is already in ${group.name}`
                            );
                            return;
                          }

                          try {
                            const response = await fetch(
                              "/api/groups/members",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  groupId: group.id,
                                  athleteIds: [selectedAthlete.id],
                                }),
                              }
                            );

                            const data = await response.json();

                            if (data.success) {
                              toast.success(
                                `Added ${selectedAthlete.firstName} to ${group.name}`
                              );
                              loadGroups(); // Refresh groups
                              setShowAddToGroupModal(false);
                              setSelectedAthlete(null);
                            } else {
                              toast.error(
                                data.error || "Failed to add to group"
                              );
                            }
                          } catch (error) {
                            console.error("Error adding to group:", error);
                            toast.error("Failed to add to group");
                          }
                        }}
                        disabled={isInGroup}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isInGroup
                            ? "border-green-200 bg-green-50 cursor-default"
                            : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {group.name}
                              {isInGroup && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            {group.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {group.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {group.athleteIds?.length || 0} athletes
                            </p>
                          </div>
                          {group.color && (
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: group.color }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Assignment Modal */}
      {showIndividualAssignment && selectedAthlete && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center">
              <div className="text-white">Loading...</div>
            </div>
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
            onAssignWorkout={handleAssignWorkout}
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
