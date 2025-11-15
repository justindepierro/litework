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
import { Button } from "@/components/ui/Button";
import { Heading, Body, Caption } from "@/components/ui/Typography";
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold shrink-0 relative">
              {athlete.firstName?.[0]}
              {athlete.lastName?.[0]}
              {/* Status Indicator Dot */}
              <div
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: isInvited ? "#9CA3AF" : "#10B981" }}
                title={isInvited ? "Invited - Pending acceptance" : "Active"}
                aria-label={
                  isInvited ? "Invited - Pending acceptance" : "Active"
                }
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
              <div className="flex gap-2 flex-wrap">
                {/* Resend Invite - Only for invited athletes */}
                {isInvited && onResendInvite && athlete.inviteId && (
                  <Button
                    onClick={async () => {
                      setResendingInvite(true);
                      try {
                        await onResendInvite(athlete.inviteId!);
                      } finally {
                        setResendingInvite(false);
                      }
                    }}
                    disabled={resendingInvite}
                    variant="secondary"
                    className="bg-warning hover:bg-warning-dark text-white"
                    leftIcon={<Mail className="w-4 h-4" />}
                    aria-label={
                      resendingInvite
                        ? "Sending invitation..."
                        : "Resend invitation email"
                    }
                  >
                    {resendingInvite ? "Sending..." : "Resend Invite"}
                  </Button>
                )}

                {/* Message - Disabled for invited athletes */}
                {onMessage && (
                  <Button
                    onClick={onMessage}
                    disabled={isInvited}
                    variant="primary"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    title={
                      isInvited
                        ? "Cannot message invited athletes"
                        : "Send message"
                    }
                    aria-label={
                      isInvited
                        ? "Cannot message invited athletes"
                        : "Send message to athlete"
                    }
                  >
                    Message
                  </Button>
                )}

                {/* Progress - Disabled for invited athletes */}
                {onViewProgress && (
                  <Button
                    onClick={onViewProgress}
                    disabled={isInvited}
                    variant="primary"
                    leftIcon={<BarChart3 className="w-4 h-4" />}
                    title={
                      isInvited
                        ? "No progress data for invited athletes"
                        : "View progress"
                    }
                    aria-label={
                      isInvited
                        ? "No progress data available"
                        : "View athlete progress"
                    }
                  >
                    Progress
                  </Button>
                )}

                {/* Edit - Always enabled */}
                {onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="primary"
                    leftIcon={<Edit className="w-4 h-4" />}
                    aria-label="Edit athlete profile"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="border-b border-silver-300"
            role="tablist"
            aria-label="Athlete information tabs"
          >
            <div className="flex">
              <button
                role="tab"
                aria-selected={activeTab === "overview"}
                aria-controls="overview-panel"
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body-secondary hover:text-heading-primary"
                }`}
              >
                Overview
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "prs"}
                aria-controls="prs-panel"
                onClick={() => setActiveTab("prs")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "prs"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body-secondary hover:text-heading-primary"
                }`}
              >
                Personal Records
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "history"}
                aria-controls="history-panel"
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "history"
                    ? "border-b-2 border-primary text-primary"
                    : "text-body-secondary hover:text-heading-primary"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "overview" && (
              <div
                role="tabpanel"
                id="overview-panel"
                aria-labelledby="overview-tab"
                className="space-y-6"
              >
                {/* Contact Information */}
                <div>
                  <Heading level="h3" className="mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Contact Information
                  </Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-steel-400 mt-0.5" />
                      <div>
                        <Caption variant="muted" className="mb-1">
                          Email
                        </Caption>
                        <Body variant="primary" weight="medium">
                          {isInvited && athlete.inviteEmail
                            ? athlete.inviteEmail
                            : athlete.email}
                        </Body>
                        {isInvited && (
                          <Body
                            variant="secondary"
                            className="text-xs text-warning mt-1"
                          >
                            Invitation sent to this email
                          </Body>
                        )}
                      </div>
                    </div>
                    {athlete.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-steel-400 mt-0.5" />
                        <div>
                          <Caption variant="muted" className="mb-1">
                            Phone
                          </Caption>
                          <Body variant="primary" weight="medium">
                            {athlete.phone}
                          </Body>
                        </div>
                      </div>
                    )}
                    {athlete.dateOfBirth && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-steel-400 mt-0.5" />
                        <div>
                          <Caption variant="muted" className="mb-1">
                            Age
                          </Caption>
                          <Body variant="primary" weight="medium">
                            {calculateAge(athlete.dateOfBirth)} years old
                          </Body>
                        </div>
                      </div>
                    )}
                    {athlete.emergencyContact && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-steel-400 mt-0.5" />
                        <div>
                          <Caption variant="muted" className="mb-1">
                            Emergency Contact
                          </Caption>
                          <Body variant="primary" weight="medium">
                            {athlete.emergencyContact}
                          </Body>
                          {athlete.emergencyPhone && (
                            <Body variant="secondary" className="text-sm">
                              {athlete.emergencyPhone}
                            </Body>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sport & Position */}
                {(athlete.sport || athlete.position) && (
                  <div>
                    <Heading
                      level="h3"
                      className="mb-4 flex items-center gap-2"
                    >
                      <Trophy className="w-5 h-5 text-primary" />
                      Athletics
                    </Heading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {athlete.sport && (
                        <div>
                          <Caption variant="muted" className="mb-1">
                            Sport
                          </Caption>
                          <Body variant="primary" weight="medium">
                            {athlete.sport}
                          </Body>
                        </div>
                      )}
                      {athlete.position && (
                        <div>
                          <Caption variant="muted" className="mb-1">
                            Position
                          </Caption>
                          <Body variant="primary" weight="medium">
                            {athlete.position}
                          </Body>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned KPIs */}
                <div>
                  <Heading level="h3" className="mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Key Performance Indicators
                  </Heading>
                  {loadingKPIs ? (
                    <Body variant="secondary" className="text-sm">
                      Loading KPIs...
                    </Body>
                  ) : assignedKPIs.length > 0 || pendingGroupKPIs.length > 0 ? (
                    <div className="space-y-4">
                      {/* Active KPIs */}
                      {assignedKPIs.length > 0 && (
                        <div>
                          <Caption variant="muted" className="mb-2">
                            {assignedKPIs.length} KPI
                            {assignedKPIs.length !== 1 ? "s" : ""} assigned
                          </Caption>
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
                                  <span className="text-xs font-medium text-(--text-secondary)">
                                    {kpi.targetValue}
                                    {kpi.targetDate && (
                                      <span className="text-(--text-tertiary) ml-1">
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
                          <div className="flex items-center gap-2 p-3 bg-(--status-warning-light) border border-amber-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-(--status-warning) shrink-0" />
                            <div>
                              <p className="text-sm text-(--status-warning) font-medium">
                                Will automatically receive these KPIs when
                                invite is accepted
                              </p>
                              {groups.length > 0 && (
                                <p className="text-xs text-(--status-warning) mt-1">
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
                                <span className="text-xs text-(--text-tertiary) font-medium uppercase tracking-wide">
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
                    <Heading
                      level="h3"
                      className="mb-4 flex items-center gap-2"
                    >
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Performance Statistics
                    </Heading>
                    {athlete.status === "invited" ? (
                      <div className="p-6 bg-silver-100 rounded-lg border-2 border-dashed border-silver-400 text-center">
                        <Calendar className="w-12 h-12 text-steel-400 mx-auto mb-3" />
                        <Body
                          variant="primary"
                          weight="medium"
                          className="mb-1"
                        >
                          No Activity Yet
                        </Body>
                        <Body variant="secondary" className="text-sm">
                          Stats will appear once this athlete accepts their
                          invite and completes workouts
                        </Body>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-primary-lighter p-4 rounded-lg">
                          <Caption variant="muted" className="mb-1">
                            Total Workouts
                          </Caption>
                          <Body
                            variant="primary"
                            weight="bold"
                            className="text-2xl text-primary"
                          >
                            {athlete.stats.totalWorkouts}
                          </Body>
                        </div>
                        <div className="bg-success-lighter p-4 rounded-lg">
                          <Caption variant="muted" className="mb-1">
                            Completion Rate
                          </Caption>
                          <Body
                            variant="primary"
                            weight="bold"
                            className="text-2xl text-success"
                          >
                            {completionRate}%
                          </Body>
                        </div>
                        <div className="bg-accent-lighter p-4 rounded-lg">
                          <Caption variant="muted" className="mb-1">
                            Personal Records
                          </Caption>
                          <Body
                            variant="primary"
                            weight="bold"
                            className="text-2xl text-accent"
                          >
                            {athlete.stats.totalPRs}
                          </Body>
                        </div>
                        {athlete.stats.currentStreak !== undefined && (
                          <div className="bg-warning-lighter p-4 rounded-lg">
                            <Caption variant="muted" className="mb-1">
                              Current Streak
                            </Caption>
                            <Body
                              variant="primary"
                              weight="bold"
                              className="text-2xl text-warning"
                            >
                              {athlete.stats.currentStreak} days
                            </Body>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Bio / Notes */}
                {athlete.bio && (
                  <div>
                    <Heading level="h3" className="mb-4">
                      Notes
                    </Heading>
                    <Body variant="primary" className="whitespace-pre-wrap">
                      {athlete.bio}
                    </Body>
                  </div>
                )}

                {/* Groups */}
                {athlete.groupIds && athlete.groupIds.length > 0 && (
                  <div>
                    <Heading
                      level="h3"
                      className="mb-4 flex items-center gap-2"
                    >
                      <Users className="w-5 h-5 text-primary" />
                      Groups
                    </Heading>
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
              <div role="tabpanel" id="prs-panel" aria-labelledby="prs-tab">
                {athlete.personalRecords &&
                athlete.personalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {athlete.personalRecords.map((pr: AthleteKPI) => (
                      <div
                        key={pr.id}
                        className="rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-silver-100 transition-all border border-silver-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Heading level="h4" className="mb-1">
                              {pr.exerciseName}
                            </Heading>
                            <Caption variant="muted" className="mb-2">
                              Achieved on{" "}
                              {new Date(pr.dateAchieved).toLocaleDateString()}
                            </Caption>
                            {pr.notes && (
                              <Body variant="secondary" className="mt-2">
                                {pr.notes}
                              </Body>
                            )}
                          </div>
                          <div className="text-right">
                            <Body
                              variant="primary"
                              weight="bold"
                              className="text-3xl text-primary"
                            >
                              {pr.currentPR}
                            </Body>
                            <Caption variant="muted">lbs</Caption>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-steel-300 mx-auto mb-4" />
                    <Body variant="secondary">No personal records yet</Body>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div
                role="tabpanel"
                id="history-panel"
                aria-labelledby="history-tab"
                className="text-center py-12"
              >
                <Calendar className="w-16 h-16 text-steel-300 mx-auto mb-4" />
                <Body variant="secondary">Workout history coming soon</Body>
              </div>
            )}
          </div>
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}
