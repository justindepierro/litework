"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import { apiClient } from "@/lib/api-client";
import type { 
  AthleteGroup, 
  WorkoutAssignment,
  AthleteKPI,
} from "@/types";

// Enhanced athlete type from AthletesPage
export interface EnhancedAthlete {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string; // Optional to match User type
  email: string;
  role: "athlete";
  groupIds?: string[];
  status: "active" | "invited" | "inactive";
  profileImage?: string | null;
  bio?: string | null;
  injuryStatus?: string;
  lastActivity?: Date | null;
  inviteId?: string;
  inviteEmail?: string;
  stats?: {
    totalWorkouts: number;
    completedWorkouts: number;
    thisMonthWorkouts: number;
    totalPRs: number;
    recentPRs: number;
    lastWorkout: Date | null;
  };
  communication?: {
    unreadMessages: number;
    lastMessage: string | null;
    lastMessageTime: Date | null;
    notificationsEnabled: boolean;
    preferredContact: "app" | "email" | "sms";
  };
  personalRecords?: AthleteKPI[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteForm {
  firstName: string;
  lastName: string;
  email?: string;
  groupId?: string;
  notes?: string;
}

export interface KPIForm {
  kpiName: string;
  value: string;
  dateSet: string;
}

export interface MessageForm {
  recipientId: string;
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  notifyViaEmail: boolean;
}

/**
 * Custom hook to manage athlete CRUD operations and business logic
 * Centralizes all data mutations for the Athletes page
 */
export function useAthletesOperations(
  athletes: EnhancedAthlete[],
  setAthletes: React.Dispatch<React.SetStateAction<EnhancedAthlete[]>>,
  groups: AthleteGroup[],
  setGroups: React.Dispatch<React.SetStateAction<AthleteGroup[]>>,
  loadGroups: () => Promise<void>
) {
  const toast = useToast();
  
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

  // Selected items state
  const [selectedAthlete, setSelectedAthlete] = useState<EnhancedAthlete | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AthleteGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<AthleteGroup | null>(null);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);

  // Handle sending athlete invite
  const handleSendInvite = useCallback(async (inviteForm: InviteForm) => {
    if (!inviteForm.firstName || !inviteForm.lastName) return;

    try {
      const response = await apiClient.createAthleteInvite({
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email || "",
        groupId: inviteForm.groupId || undefined,
        notes: inviteForm.notes || undefined,
      }) as {
        success: boolean;
        error?: string;
        data?: { invite?: any };
        invite?: any;
      };

      if (response.success) {
        const newInvite = response.invite || response.data?.invite;
        if (newInvite) {
          const newAthlete: EnhancedAthlete = {
            id: newInvite.id,
            firstName: newInvite.first_name || inviteForm.firstName,
            lastName: newInvite.last_name || inviteForm.lastName,
            fullName: `${newInvite.first_name || inviteForm.firstName} ${newInvite.last_name || inviteForm.lastName}`,
            email: newInvite.email || inviteForm.email || "",
            role: "athlete" as const,
            groupIds: newInvite.group_ids || (inviteForm.groupId ? [inviteForm.groupId] : []),
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

          setAthletes((prev) => [newAthlete, ...prev]);
          await loadGroups();
        }

        const successMsg = inviteForm.email
          ? `Invite sent successfully to ${inviteForm.email}!`
          : `Athlete ${inviteForm.firstName} ${inviteForm.lastName} added successfully!`;
        toast.success(successMsg);
        return { success: true };
      } else {
        const errorMsg = typeof response.error === "string" ? response.error : "Failed to send invite";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add athlete";
      toast.error(errorMsg);
      console.error("Error adding athlete:", err);
      return { success: false, error: errorMsg };
    }
  }, [setAthletes, loadGroups, toast]);

  // Handle resending invite
  const handleResendInvite = useCallback(async (inviteId: string) => {
    toast.info("Sending invitation email...");
    try {
      const response = await apiClient.resendInvite(inviteId) as { success: boolean; message?: string };

      if (response.success) {
        toast.success("✅ Invitation email sent! Check your inbox.");
      } else {
        toast.error("Failed to resend invite");
      }
    } catch (err) {
      console.error("Error resending invite:", err);
      toast.error("Failed to resend invite");
    }
  }, [toast]);

  // Handle canceling invite
  const handleCancelInvite = useCallback((inviteId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Invitation",
      message: "Are you sure you want to cancel this invitation? The athlete will not be able to accept it.",
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));

          const response = await apiClient.deleteInvite(inviteId) as {
            success: boolean;
            message?: string;
            error?: string;
          };

          if (response.success) {
            setAthletes((prev) => prev.filter((a) => a.id !== inviteId));
            await loadGroups();
            toast.success("Invitation cancelled successfully");
          } else {
            console.error("Delete failed:", response.error || response);
            toast.error(response.error || "Failed to cancel invitation");
          }
        } catch (err) {
          console.error("Error canceling invite:", err);
          toast.error(err instanceof Error ? err.message : "Failed to cancel invitation");
        }
      },
    });
  }, [setAthletes, loadGroups, toast]);

  // Handle updating athlete email
  const handleUpdateEmail = useCallback(async (email: string) => {
    if (!selectedAthlete || !email) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await apiClient.updateInvite(selectedAthlete.id, { email }) as {
        success: boolean;
        invite?: { email: string; status: string };
        error?: string;
      };

      if (response.success && response.invite) {
        setAthletes((prev) =>
          prev.map((a) =>
            a.id === selectedAthlete.id
              ? { ...a, email: response.invite?.email || email, status: "invited" as const }
              : a
          )
        );
        toast.success("Email updated successfully! You can now send the invite.");
        return { success: true };
      } else {
        toast.error(response.error || "Failed to update email");
        return { success: false };
      }
    } catch (err) {
      console.error("Error updating email:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update email");
      return { success: false };
    }
  }, [selectedAthlete, setAthletes, toast]);

  // Handle adding athlete to group
  const handleAddAthleteToGroup = useCallback(async (groupId: string, athleteId: string) => {
    try {
      const response = await fetch("/api/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, athleteIds: [athleteId] }),
      });

      const data = await response.json();

      if (data.success) {
        const group = groups.find((g) => g.id === groupId);
        const athlete = athletes.find((a) => a.id === athleteId);
        toast.success(`Added ${athlete?.firstName || "athlete"} to ${group?.name || "group"}`);
        loadGroups();
      } else {
        toast.error(data.error || "Failed to add to group");
      }
    } catch (error) {
      console.error("Error adding to group:", error);
      toast.error("Failed to add to group");
    }
  }, [athletes, groups, loadGroups, toast]);

  // Handle adding KPI
  const handleAddKPI = useCallback(async (kpiForm: KPIForm) => {
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

    const updatedAthletes = athletes.map((athlete) =>
      athlete.id === selectedAthlete.id
        ? { ...athlete, personalRecords: [...(athlete.personalRecords || []), newKPI] }
        : athlete
    );

    setAthletes(updatedAthletes);
    setSelectedAthlete({
      ...selectedAthlete,
      personalRecords: [...(selectedAthlete.personalRecords || []), newKPI],
    });
  }, [selectedAthlete, athletes, setAthletes]);

  // Handle sending message
  const handleSendMessage = useCallback(async (messageForm: MessageForm) => {
    if (!messageForm.message || !selectedAthlete) return;

    try {
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
      setSelectedAthlete({
        ...selectedAthlete,
        communication: {
          ...selectedAthlete.communication!,
          lastMessage: messageForm.message,
          lastMessageTime: new Date(),
        },
      });

      toast.success("Message sent successfully!");
      return { success: true };
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      return { success: false };
    }
  }, [selectedAthlete, athletes, setAthletes, toast]);

  // Handle assigning workout
  const handleAssignWorkout = useCallback(async (
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
        return { success: true };
      } else {
        toast.error(data.error || "Failed to assign workout");
        return { success: false };
      }
    } catch (err) {
      console.error("Failed to assign workout:", err);
      toast.error("Failed to assign workout");
      return { success: false };
    }
  }, [toast]);

  // Handle deleting group
  const handleDeleteGroup = useCallback(async (groupId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Group",
      message: "Are you sure you want to delete this group? This action cannot be undone and will remove all athlete assignments.",
      onConfirm: async () => {
        try {
          await apiClient.deleteGroup(groupId);
          setGroups(groups.filter((g) => g.id !== groupId));
          setOpenGroupMenuId(null);
          toast.success("Group deleted successfully");
        } catch (error) {
          console.error("Delete group error:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to delete group";
          toast.error(errorMessage);
        }
      },
    });
  }, [groups, setGroups, toast]);

  // Handle archiving group
  const handleArchiveGroup = useCallback(async (group: AthleteGroup) => {
    try {
      await apiClient.updateGroup(group.id, { ...group, archived: true });
      await loadGroups();
      setOpenGroupMenuId(null);
      toast.success("Group archived successfully");
    } catch (error) {
      console.error("Archive group error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to archive group";
      toast.error(errorMessage);
    }
  }, [loadGroups, toast]);

  return {
    // State
    confirmModal,
    setConfirmModal,
    selectedAthlete,
    setSelectedAthlete,
    selectedGroup,
    setSelectedGroup,
    editingGroup,
    setEditingGroup,
    openGroupMenuId,
    setOpenGroupMenuId,
    
    // Operations
    handleSendInvite,
    handleResendInvite,
    handleCancelInvite,
    handleUpdateEmail,
    handleAddAthleteToGroup,
    handleAddKPI,
    handleSendMessage,
    handleAssignWorkout,
    handleDeleteGroup,
    handleArchiveGroup,
  };
}
