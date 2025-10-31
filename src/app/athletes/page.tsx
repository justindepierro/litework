"use client";

import { useCoachGuard } from "@/hooks/use-auth-guard";
import { useState } from "react";
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
  Calendar,
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
} from "lucide-react";
import { User as UserType, AthleteKPI } from "@/types";
import { apiClient } from "@/lib/api-client";
import BulkOperationModal from "@/components/BulkOperationModal";
import BulkOperationHistory from "@/components/BulkOperationHistory";
import ProgressAnalytics from "@/components/ProgressAnalytics";

interface InviteForm {
  name: string;
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
    thisMonthWorkouts: number;
    totalPRs: number;
    recentPRs: number;
    lastWorkout: Date | null;
  };
  communication?: AthleteCommunication;
}

// Enhanced athlete data with communication features
const enhancedAthletes: EnhancedAthlete[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    role: "athlete" as const,
    groupIds: ["football-linemen"],
    status: "active",
    profileImage: null,
    bio: "Senior offensive lineman, team captain. Focused on strength and mobility training.",
    injuryStatus: undefined,
    lastActivity: new Date("2024-10-29"),
    stats: {
      totalWorkouts: 45,
      thisMonthWorkouts: 12,
      totalPRs: 8,
      recentPRs: 2,
      lastWorkout: new Date("2024-10-29"),
    },
    communication: {
      unreadMessages: 2,
      lastMessage: "Great job on the deadlift PRs! Keep it up!",
      lastMessageTime: new Date("2024-10-29T10:30:00"),
      notificationsEnabled: true,
      preferredContact: "app",
    },
    personalRecords: [
      {
        id: "kpi1",
        athleteId: "1",
        exerciseId: "bench",
        exerciseName: "Bench Press",
        currentPR: 285,
        dateAchieved: new Date("2024-10-15"),
        isActive: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-10-15"),
      },
      {
        id: "kpi2",
        athleteId: "1",
        exerciseId: "squat",
        exerciseName: "Back Squat",
        currentPR: 385,
        dateAchieved: new Date("2024-10-20"),
        isActive: true,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-10-20"),
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-29"),
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    role: "athlete" as const,
    groupIds: ["volleyball-girls"],
    status: "active",
    profileImage: null,
    bio: "Volleyball setter with focus on explosive power and agility.",
    injuryStatus: "minor",
    lastActivity: new Date("2024-10-28"),
    stats: {
      totalWorkouts: 38,
      thisMonthWorkouts: 10,
      totalPRs: 6,
      recentPRs: 1,
      lastWorkout: new Date("2024-10-28"),
    },
    communication: {
      unreadMessages: 0,
      lastMessage:
        "Thanks for adjusting my workout for the ankle. Feeling better!",
      lastMessageTime: new Date("2024-10-27T14:15:00"),
      notificationsEnabled: true,
      preferredContact: "email",
    },
    personalRecords: [
      {
        id: "kpi3",
        athleteId: "2",
        exerciseId: "vertical",
        exerciseName: "Vertical Jump",
        currentPR: 28,
        dateAchieved: new Date("2024-09-15"),
        isActive: true,
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-09-15"),
      },
    ],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-10-28"),
  },
  {
    id: "3",
    name: "Marcus Williams",
    email: "marcus.williams@email.com",
    role: "athlete" as const,
    groupIds: [],
    status: "invited",
    profileImage: null,
    bio: null,
    injuryStatus: undefined,
    lastActivity: null,
    stats: {
      totalWorkouts: 0,
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
      preferredContact: "app",
    },
    personalRecords: [],
    createdAt: new Date("2024-10-25"),
    updatedAt: new Date("2024-10-25"),
  },
];

export default function AthletesPage() {
  const { user, isLoading } = useCoachGuard();

  const [athletes, setAthletes] = useState<EnhancedAthlete[]>(enhancedAthletes);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] =
    useState<EnhancedAthlete | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [inviteForm, setInviteForm] = useState<InviteForm>({
    name: "",
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

  const handleSendInvite = async () => {
    if (!inviteForm.name || !inviteForm.email) return;

    try {
      const response = await apiClient.createAthleteInvite({
        name: inviteForm.name,
        email: inviteForm.email,
      });

      if (response.success) {
        // Add to local state with pending status
        const newAthlete: EnhancedAthlete = {
          id: Date.now().toString(),
          name: inviteForm.name,
          email: inviteForm.email,
          role: "athlete" as const,
          groupIds: inviteForm.groupId ? [inviteForm.groupId] : [],
          status: "invited",
          profileImage: null,
          bio: inviteForm.notes || null,
          injuryStatus: inviteForm.notes ? undefined : undefined,
          stats: {
            totalWorkouts: 0,
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
            preferredContact: "app",
          },
          personalRecords: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setAthletes([...athletes, newAthlete]);
        alert(`Invite sent successfully to ${inviteForm.email}!`);
        setInviteForm({ name: "", email: "", groupId: "", notes: "" });
        setShowInviteModal(false);
      } else {
        setError(response.error || "Failed to send invite");
      }
    } catch (err) {
      setError("Failed to send invite");
      console.error("Error sending invite:", err);
    }
  };

  const handleKPIManagement = (athlete: EnhancedAthlete) => {
    setSelectedAthlete(athlete);
    setShowKPIModal(true);
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
      alert(`Message sent to ${selectedAthlete.name}!`);
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
      console.log("Executing bulk operation:", operation);

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
      console.log("Bulk operation result:", result);

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

      alert(successMessage);

      // Refresh athletes list if needed
      // await fetchAthletes();
    } catch (error) {
      console.error("Bulk operation failed:", error);
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

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch =
      athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && athlete.status === "active") ||
      (statusFilter === "invited" && athlete.status === "invited") ||
      (statusFilter === "injured" && athlete.injuryStatus);
    return matchesSearch && matchesStatus;
  });

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
                {athletes.filter((a) => a.status === "active").length} Active
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-orange-50 rounded-xl sm:bg-transparent sm:p-0">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">
                {athletes.filter((a) => a.status === "invited").length} Pending
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
                {athletes.filter((a) => a.injuryStatus).length} Injured
              </span>
            </div>
          </div>

          {/* Mobile-Optimized Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center justify-center gap-3 px-6 py-4 sm:py-3 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span>Send Invite</span>
            </button>
          </div>
        </div>

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
        {filteredAthletes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group touch-manipulation"
              >
                {/* Mobile-Optimized Card Header */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg">
                          {athlete.name
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
                          {athlete.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(athlete.status, athlete.injuryStatus)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(
                              athlete.status,
                              athlete.injuryStatus
                            )}
                          </span>
                        </div>
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

                  {/* Invite Status for Pending */}
                  {athlete.status === "invited" && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Invite Pending
                        </span>
                      </div>
                      <p className="text-xs text-blue-700">
                        Sent {athlete.createdAt.toLocaleDateString()}
                      </p>
                      <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Resend Invite
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Actions with Communication Features */}
                <div className="px-6 pb-6">
                  {athlete.status === "active" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleMessageAthlete(athlete)}
                        className="btn-primary flex items-center justify-center gap-2 text-sm py-2"
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
                      <button className="btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <Calendar className="w-4 h-4" />
                        Assign
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button className="btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <RefreshCw className="w-4 h-4" />
                        Resend
                      </button>
                      <button className="btn-secondary flex items-center justify-center gap-2 text-sm py-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No athletes found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by sending invites to your athletes"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send First Invite
              </button>
            )}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter athlete's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="athlete@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Group (Optional)
                  </label>
                  <select
                    value={inviteForm.groupId}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, groupId: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">No group assigned</option>
                    <option value="football-linemen">Football Linemen</option>
                    <option value="volleyball-girls">Volleyball Girls</option>
                    <option value="cross-country">Cross Country</option>
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
                        How Invites Work
                      </h4>
                      <p className="text-sm text-blue-700">
                        The athlete will receive an email with a secure link to
                        create their account. No password needed from you!
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
                    disabled={!inviteForm.name || !inviteForm.email}
                  >
                    <Send className="w-4 h-4" />
                    Send Invite
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
                  Message {selectedAthlete.name}
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
                          ? `${selectedAthlete.name} prefers email communication. Consider checking the email option above.`
                          : `${selectedAthlete.name} prefers app notifications. They'll be notified in the app immediately.`}
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
                  Manage Personal Records - {selectedAthlete.name}
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
                  {selectedAthlete.name} - Progress Analytics
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
    </div>
  );
}
