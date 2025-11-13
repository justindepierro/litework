import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Users,
  Activity,
  Trophy,
  TrendingUp,
  AlertCircle,
  User,
  Edit,
  MessageCircle,
  BarChart3,
  Target,
} from "lucide-react";
import {
  User as UserType,
  AthleteKPI,
  AthleteGroup,
  KPITag,
  AthleteAssignedKPI,
} from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";

interface AthleteDetailModalProps {
  athlete: UserType & {
    status?: string;
    profileImage?: string | null;
    bio?: string | null;
    injuryStatus?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    dateOfBirth?: Date;
    position?: string;
    sport?: string;
    joinDate?: Date;
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
      attendanceRate?: number;
      currentStreak?: number;
    };
  };
  groups?: AthleteGroup[];
  onClose: () => void;
  onEdit?: () => void;
  onMessage?: () => void;
  onViewProgress?: () => void;
  onResendInvite?: (inviteId: string) => Promise<void>;
}

export default function AthleteDetailModal({
  athlete,
  groups = [],
  onClose,
  onEdit,
  onMessage,
  onViewProgress,
  onResendInvite,
}: AthleteDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "prs" | "history">(
    "overview"
  );
  const [assignedKPIs, setAssignedKPIs] = useState<
    (AthleteAssignedKPI & { tag: KPITag })[]
  >([]);
  const [pendingGroupKPIs, setPendingGroupKPIs] = useState<KPITag[]>([]);
  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [resendingInvite, setResendingInvite] = useState(false);

  const isInvited = athlete.status === "invited";

  // Fetch assigned KPIs and group KPIs (for invited athletes)
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoadingKPIs(true);

        // Fetch athlete's assigned KPIs
        const response = await fetch(
          `/api/athlete-assigned-kpis?athlete_id=${athlete.id}&is_active=true&with_details=true`
        );
        if (response.ok) {
          const result = await response.json();
          console.log("[AthleteDetailModal] KPI response:", result);

          // API returns { data: [...] }
          const kpiData = result.data || result;

          // Transform view data to match expected format
          const transformed = kpiData.map((item: any) => ({
            id: item.assignment_id,
            athleteId: item.athlete_id,
            kpiTagId: item.kpi_tag_id,
            targetValue: item.target_value,
            targetDate: item.target_date,
            notes: item.notes,
            assignedVia: item.assigned_via,
            assignedAt: item.assigned_at,
            tag: {
              id: item.kpi_tag_id,
              name: item.kpi_name,
              displayName: item.kpi_display_name,
              color: item.kpi_color,
              kpiType: item.kpi_type,
            },
          }));

          console.log("[AthleteDetailModal] Transformed KPIs:", transformed);
          setAssignedKPIs(transformed);
        }

        // If athlete is invited, fetch group KPIs they will inherit
        if (athlete.status === "invited" && groups.length > 0) {
          const groupIds = groups.map((g) => g.id).filter(Boolean);
          if (groupIds.length > 0) {
            // Fetch KPIs assigned to these groups
            const groupKPIPromises = groupIds.map((groupId) =>
              fetch(
                `/api/athlete-assigned-kpis?assigned_via=group:${groupId}&is_active=true&with_details=true`
              )
                .then((res) => (res.ok ? res.json() : { data: [] }))
                .then((result) => result.data || [])
            );

            const groupKPIResults = await Promise.all(groupKPIPromises);
            const allGroupKPIs = groupKPIResults.flat();

            // Extract unique KPI tags
            const uniqueKPITags = new Map<string, KPITag>();
            allGroupKPIs.forEach((item: any) => {
              if (!uniqueKPITags.has(item.kpi_tag_id)) {
                uniqueKPITags.set(item.kpi_tag_id, {
                  id: item.kpi_tag_id,
                  name: item.kpi_name,
                  displayName: item.kpi_display_name,
                  color: item.kpi_color,
                  kpiType: item.kpi_type,
                  description: "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }
            });

            setPendingGroupKPIs(Array.from(uniqueKPITags.values()));
            console.log(
              "[AthleteDetailModal] Pending group KPIs:",
              Array.from(uniqueKPITags.values())
            );
          }
        }
      } catch (error) {
        console.error("Error fetching KPIs:", error);
      } finally {
        setLoadingKPIs(false);
      }
    };

    fetchKPIs();
  }, [athlete.id, athlete.status, groups]);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const completionRate =
    athlete.stats && athlete.stats.totalWorkouts > 0
      ? Math.round(
          (athlete.stats.completedWorkouts / athlete.stats.totalWorkouts) * 100
        )
      : 0;

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader
          title={`${athlete.firstName} ${athlete.lastName}`}
          subtitle={`${athlete.role} - ${athlete.status || "Active"}${athlete.injuryStatus ? ` (${athlete.injuryStatus})` : ""}`}
          onClose={onClose}
          icon={<User className="w-6 h-6 text-primary" />}
        />

        <ModalContent className="overflow-y-auto flex-1">
          {/* Profile Avatar & Status Badges */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 relative">
              {athlete.firstName?.[0]}
              {athlete.lastName?.[0]}
              {/* Status Indicator Dot */}
              <div
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: isInvited ? "#9CA3AF" : "#10B981" }}
                title={isInvited ? "Invited - Pending acceptance" : "Active"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Badge size="md">{athlete.role}</Badge>
                {athlete.status === "active" && (
                  <Badge variant="success" size="md">
                    <Activity className="w-3 h-3" />
                    Active
                  </Badge>
                )}
                {athlete.injuryStatus && (
                  <Badge variant="warning" size="md">
                    <AlertCircle className="w-3 h-3" />
                    {athlete.injuryStatus}
                  </Badge>
                )}
              </div>
              {/* Quick Actions */}
              <div className="flex gap-2">
                {/* Resend Invite - Only for invited athletes */}
                {isInvited && onResendInvite && athlete.inviteId && (
                  <button
                    onClick={async () => {
                      setResendingInvite(true);
                      try {
                        await onResendInvite(athlete.inviteId!);
                      } finally {
                        setResendingInvite(false);
                      }
                    }}
                    disabled={resendingInvite}
                    className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 disabled:bg-gray-400 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {resendingInvite ? "Sending..." : "Resend Invite"}
                  </button>
                )}

                {/* Message - Disabled for invited athletes */}
                {onMessage && (
                  <button
                    onClick={onMessage}
                    disabled={isInvited}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isInvited
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    title={
                      isInvited
                        ? "Cannot message invited athletes"
                        : "Send message"
                    }
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                )}

                {/* Progress - Disabled for invited athletes */}
                {onViewProgress && (
                  <button
                    onClick={onViewProgress}
                    disabled={isInvited}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      isInvited
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    title={
                      isInvited
                        ? "No progress data for invited athletes"
                        : "View progress"
                    }
                  >
                    <BarChart3 className="w-4 h-4" />
                    Progress
                  </button>
                )}

                {/* Edit - Always enabled */}
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("prs")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "prs"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Personal Records
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">
                          {isInvited && athlete.inviteEmail
                            ? athlete.inviteEmail
                            : athlete.email}
                        </p>
                        {isInvited && (
                          <p className="text-xs text-amber-600 mt-1">
                            Invitation sent to this email
                          </p>
                        )}
                      </div>
                    </div>
                    {athlete.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{athlete.phone}</p>
                        </div>
                      </div>
                    )}
                    {athlete.dateOfBirth && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">
                            {calculateAge(athlete.dateOfBirth)} years old
                          </p>
                        </div>
                      </div>
                    )}
                    {athlete.emergencyContact && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Emergency Contact
                          </p>
                          <p className="font-medium">
                            {athlete.emergencyContact}
                          </p>
                          {athlete.emergencyPhone && (
                            <p className="text-sm text-gray-600">
                              {athlete.emergencyPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sport & Position */}
                {(athlete.sport || athlete.position) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      Athletics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {athlete.sport && (
                        <div>
                          <p className="text-sm text-gray-600">Sport</p>
                          <p className="font-medium">{athlete.sport}</p>
                        </div>
                      )}
                      {athlete.position && (
                        <div>
                          <p className="text-sm text-gray-600">Position</p>
                          <p className="font-medium">{athlete.position}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned KPIs */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Key Performance Indicators
                  </h3>
                  {loadingKPIs ? (
                    <div className="text-sm text-gray-500">Loading KPIs...</div>
                  ) : assignedKPIs.length > 0 || pendingGroupKPIs.length > 0 ? (
                    <div className="space-y-4">
                      {/* Active KPIs */}
                      {assignedKPIs.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            {assignedKPIs.length} KPI
                            {assignedKPIs.length !== 1 ? "s" : ""} assigned
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {assignedKPIs.map((kpi) => (
                              <div
                                key={kpi.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-silver-300 shadow-sm"
                              >
                                <span
                                  className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                                  style={{ backgroundColor: kpi.tag.color }}
                                >
                                  {kpi.tag.displayName}
                                </span>
                                {kpi.targetValue && (
                                  <span className="text-xs font-medium text-gray-700">
                                    {kpi.targetValue}
                                    {kpi.targetDate && (
                                      <span className="text-gray-500 ml-1">
                                        by{" "}
                                        {new Date(
                                          kpi.targetDate
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Group KPIs (for invited athletes) */}
                      {pendingGroupKPIs.length > 0 && isInvited && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <p className="text-sm text-amber-800 font-medium">
                                Will automatically receive these KPIs when
                                invite is accepted
                              </p>
                              {groups.length > 0 && (
                                <p className="text-xs text-amber-700 mt-1">
                                  From groups:{" "}
                                  {groups.map((g) => g.name).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pendingGroupKPIs.map((tag) => (
                              <div
                                key={tag.id}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-dashed border-silver-400 shadow-sm"
                              >
                                <span
                                  className="px-2.5 py-0.5 rounded text-sm font-semibold text-white shrink-0 shadow-sm"
                                  style={{ backgroundColor: tag.color }}
                                >
                                  {tag.displayName}
                                </span>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                  Pending
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="No KPIs Assigned"
                      description="This athlete hasn't been assigned any KPIs yet."
                    />
                  )}
                </div>

                {/* Performance Stats */}
                {athlete.stats && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Performance Statistics
                    </h3>
                    {athlete.status === "invited" ? (
                      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-silver-400 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-1">
                          No Activity Yet
                        </p>
                        <p className="text-sm text-gray-500">
                          Stats will appear once this athlete accepts their
                          invite and completes workouts
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Total Workouts
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {athlete.stats.totalWorkouts}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {completionRate}%
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Personal Records
                          </p>
                          <p className="text-2xl font-bold text-purple-600">
                            {athlete.stats.totalPRs}
                          </p>
                        </div>
                        {athlete.stats.currentStreak !== undefined && (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Current Streak
                            </p>
                            <p className="text-2xl font-bold text-orange-600">
                              {athlete.stats.currentStreak} days
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bio / Notes */}
                {athlete.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notes</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {athlete.bio}
                    </p>
                  </div>
                )}

                {/* Groups */}
                {athlete.groupIds && athlete.groupIds.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Groups
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {athlete.groupIds.map((groupId) => {
                        const group = groups.find((g) => g.id === groupId);
                        return (
                          <Badge
                            key={groupId}
                            size="md"
                            style={{
                              backgroundColor: group?.color
                                ? `${group.color}20`
                                : undefined,
                              color: group?.color || undefined,
                            }}
                          >
                            {group?.name || groupId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "prs" && (
              <div>
                {athlete.personalRecords &&
                athlete.personalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {athlete.personalRecords.map((pr: AthleteKPI) => (
                      <div
                        key={pr.id}
                        className="rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {pr.exerciseName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Achieved on{" "}
                              {new Date(pr.dateAchieved).toLocaleDateString()}
                            </p>
                            {pr.notes && (
                              <p className="text-sm text-gray-700 mt-2">
                                {pr.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">
                              {pr.currentPR}
                            </p>
                            <p className="text-sm text-gray-600">lbs</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No personal records yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Workout history coming soon</p>
              </div>
            )}
          </div>
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}
