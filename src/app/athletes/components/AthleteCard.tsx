"use client";

import React, { memo } from "react";
import {
  MessageSquare,
  Dumbbell,
  Trophy,
  Target,
  Mail,
  Send,
  Zap,
  BarChart3,
  Users,
  Edit3,
  RefreshCw,
  X,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heading, Body } from "@/components/ui/Typography";
import { AthleteKPI as AthleteKPIType } from "@/types";
import { EnhancedAthlete } from "@/hooks/useAthletesOperations";

interface AthleteStats {
  totalWorkouts: number;
  completedWorkouts: number;
  thisMonthWorkouts: number;
  totalPRs: number;
  recentPRs: number;
  lastWorkout: Date | null;
}

interface AthleteCommunication {
  unreadMessages: number;
  lastMessage: string | null;
  lastMessageTime: Date | null;
  notificationsEnabled: boolean;
  preferredContact: "app" | "email" | "sms";
}

interface AthleteGroup {
  id: string;
  name: string;
  color?: string;
}

interface AthleteCardProps {
  athlete: EnhancedAthlete;
  groups: AthleteGroup[];
  onCardClick: (athlete: EnhancedAthlete) => void;
  onMessageClick: (athlete: EnhancedAthlete) => void;
  onAssignWorkout: (athlete: EnhancedAthlete) => void;
  onManageKPIs: (athlete: EnhancedAthlete) => void;
  onViewAnalytics: (athlete: EnhancedAthlete) => void;
  onAddToGroup: (athlete: EnhancedAthlete) => void;
  onEditEmail: (athlete: EnhancedAthlete) => void;
  onResendInvite: (athleteId: string) => void;
  onCancelInvite: (athleteId: string) => void;
  getStatusIcon: (status: string, injuryStatus?: string) => React.ReactElement;
  getStatusText: (status: string, injuryStatus?: string) => string;
}

function AthleteCard({
  athlete,
  groups,
  onCardClick,
  onMessageClick,
  onAssignWorkout,
  onManageKPIs,
  onViewAnalytics,
  onAddToGroup,
  onEditEmail,
  onResendInvite,
  onCancelInvite,
  getStatusIcon,
  getStatusText,
}: AthleteCardProps) {
  return (
    <div
      onClick={() => onCardClick(athlete)}
      className="bg-linear-to-br from-white to-silver-50 rounded-xl shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 group touch-manipulation cursor-pointer relative overflow-hidden border-2 border-silver-300 hover:border-accent-blue-400"
    >
      {/* Animated colorful gradient accent bar at top */}
      <div className="h-2 bg-linear-to-r from-accent-orange-400 via-accent-purple-500 to-accent-cyan-500 animate-gradient-x" />

      {/* Mobile-Optimized Card Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-br from-accent-orange-500 to-accent-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-xl ring-2 ring-accent-pink-300 group-hover:ring-4 group-hover:ring-accent-pink-400 transition-all">
                {(athlete.fullName || "")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              {/* Communication indicator */}
              {athlete.communication?.unreadMessages &&
                athlete.communication.unreadMessages > 0 && (
                  <div className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {athlete.communication.unreadMessages}
                  </div>
                )}
            </div>
            <div>
              <Heading level="h3" className="text-lg mb-1">
                {athlete.fullName}
              </Heading>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {getStatusIcon(athlete.status, athlete.injuryStatus)}
                <Body variant="secondary" className="text-sm">
                  {getStatusText(athlete.status, athlete.injuryStatus)}
                </Body>

                {/* Group badges */}
                {athlete.groupIds &&
                  athlete.groupIds.length > 0 &&
                  athlete.groupIds.map((groupId) => {
                    const group = groups.find((g) => g.id === groupId);
                    if (!group) return null;
                    return (
                      <Badge
                        key={groupId}
                        variant="neutral"
                        className="text-xs"
                        gradient
                        style={{
                          backgroundColor: group.color
                            ? `${group.color}20`
                            : undefined,
                          borderColor: group.color,
                        }}
                      >
                        {group.name}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="relative">
            <button className="p-2 hover:bg-surface-hover rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4 text-secondary" />
            </button>
          </div>
        </div>

        {/* Last Communication */}
        {athlete.communication?.lastMessage && (
          <div className="mb-4 p-3 bg-(--accent-purple-50) rounded-lg border-2 border-(--accent-purple-200)">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-(--accent-purple-600) shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <Body variant="primary" className="text-sm line-clamp-2">
                  {athlete.communication.lastMessage}
                </Body>
                <Body
                  variant="secondary"
                  className="text-xs mt-1 text-(--accent-purple-700)"
                >
                  {athlete.communication.lastMessageTime?.toLocaleDateString()}{" "}
                  at{" "}
                  {athlete.communication.lastMessageTime?.toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </Body>
              </div>
            </div>
          </div>
        )}

        {/* Bio/Notes */}
        {athlete.bio && (
          <Body variant="secondary" className="text-sm mb-4 line-clamp-2">
            {athlete.bio}
          </Body>
        )}

        {/* Performance Stats */}
        {athlete.status === "active" && athlete.stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-linear-to-br from-accent-orange-100 to-accent-orange-50 border-2 border-accent-orange-400 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Dumbbell className="h-5 w-5 text-accent-orange-600" />
                <Body
                  variant="primary"
                  className="font-bold text-lg text-accent-orange-700"
                >
                  {athlete.stats.thisMonthWorkouts}
                </Body>
              </div>
              <Body variant="secondary" className="text-xs font-medium text-accent-orange-700">
                This Month
              </Body>
            </div>
            <div className="p-3 bg-linear-to-br from-accent-purple-100 to-accent-purple-50 border-2 border-accent-purple-400 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-5 w-5 text-accent-purple-600" />
                <Body
                  variant="primary"
                  className="font-bold text-lg text-accent-purple-700"
                >
                  {athlete.stats.recentPRs}
                </Body>
              </div>
              <Body variant="secondary" className="text-xs font-medium text-accent-purple-700">
                Recent PRs
              </Body>
            </div>
          </div>
        )}

        {/* Personal Records Preview */}
        {athlete.personalRecords && athlete.personalRecords.length > 0 && (
          <div className="mb-4 p-3 bg-(--status-success-light) rounded-lg border border-(--status-success)">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-(--status-success)" />
              <Body
                variant="primary"
                className="text-sm font-medium text-(--status-success)"
              >
                Top PRs
              </Body>
            </div>
            <div className="space-y-1">
              {athlete.personalRecords.slice(0, 2).map((pr: AthleteKPIType) => (
                <div
                  key={pr.id}
                  className="flex justify-between items-center text-sm"
                >
                  <Body variant="secondary">{pr.exerciseName}:</Body>
                  <Body
                    variant="primary"
                    className="font-medium text-(--status-success)"
                  >
                    {pr.currentPR} lbs
                  </Body>
                </div>
              ))}
              {athlete.personalRecords.length > 2 && (
                <Body
                  variant="secondary"
                  className="text-xs text-(--status-success)"
                >
                  +{athlete.personalRecords.length - 2} more
                </Body>
              )}
            </div>
          </div>
        )}

        {/* Email Missing Reminder */}
        {!athlete.email && athlete.status === "invited" && (
          <div className="mb-4 p-3 bg-(--accent-orange-50) rounded-lg border-2 border-(--accent-orange-200)">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-(--accent-orange-600) shrink-0 mt-0.5" />
              <div>
                <Body
                  variant="primary"
                  className="text-sm font-medium text-(--accent-orange-900)"
                >
                  Email Required
                </Body>
                <Body
                  variant="secondary"
                  className="text-xs text-(--accent-orange-700) mt-0.5"
                >
                  Add an email address to send invitation
                </Body>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {athlete.status === "active" ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageClick(athlete);
                }}
                variant="secondary"
                size="sm"
                className="bg-linear-to-br from-accent-purple-100 to-accent-purple-50 border-accent-purple-400 hover:border-accent-purple-500 text-accent-purple-700 hover:shadow-md"
                leftIcon={<Send className="w-4 h-4 text-accent-purple-600" />}
              >
                Message
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignWorkout(athlete);
                }}
                variant="primary"
                size="sm"
                className="bg-linear-to-br from-accent-orange-500 to-accent-pink-500 hover:from-accent-orange-600 hover:to-accent-pink-600 shadow-md hover:shadow-lg"
                leftIcon={<Dumbbell className="w-4 h-4" />}
              >
                Assign
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageKPIs(athlete);
                }}
                variant="secondary"
                size="sm"
                className="bg-linear-to-br from-accent-amber-100 to-accent-amber-50 border-accent-amber-400 hover:border-accent-amber-500 text-accent-amber-700 hover:shadow-md"
                leftIcon={<Zap className="w-4 h-4 text-accent-amber-600" />}
              >
                Manage PRs
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAnalytics(athlete);
                }}
                variant="secondary"
                size="sm"
                className="bg-linear-to-br from-accent-cyan-100 to-accent-cyan-50 border-accent-cyan-400 hover:border-accent-cyan-500 text-accent-cyan-700 hover:shadow-md"
                leftIcon={<BarChart3 className="w-4 h-4 text-accent-cyan-600" />}
              >
                Progress
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToGroup(athlete);
                }}
                variant="secondary"
                size="sm"
                className="bg-linear-to-br from-accent-green-100 to-accent-green-50 border-accent-green-400 hover:border-accent-green-500 text-accent-green-700 hover:shadow-md col-span-2"
                leftIcon={<Users className="w-4 h-4 text-accent-green-600" />}
              >
                Add to Group
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditEmail(athlete);
                  }}
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  {athlete.email ? "Edit Email" : "Add Email"}
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onResendInvite(athlete.id);
                  }}
                  variant="secondary"
                  size="sm"
                  disabled={!athlete.email}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  title={
                    !athlete.email
                      ? "Add email first to send invite"
                      : "Resend invitation email"
                  }
                >
                  Resend
                </Button>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancelInvite(athlete.id);
                }}
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancel Invite
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize with custom comparison
export default memo(AthleteCard, (prevProps, nextProps) => {
  // Re-render if athlete data changed
  if (prevProps.athlete.id !== nextProps.athlete.id) return false;
  if (prevProps.athlete.status !== nextProps.athlete.status) return false;
  if (prevProps.athlete.email !== nextProps.athlete.email) return false;
  if (
    JSON.stringify(prevProps.athlete.stats) !==
    JSON.stringify(nextProps.athlete.stats)
  )
    return false;
  if (
    JSON.stringify(prevProps.athlete.communication) !==
    JSON.stringify(nextProps.athlete.communication)
  )
    return false;
  if (
    JSON.stringify(prevProps.athlete.groupIds) !==
    JSON.stringify(nextProps.athlete.groupIds)
  )
    return false;

  // Re-render if groups changed (for badge display)
  if (prevProps.groups.length !== nextProps.groups.length) return false;

  // Don't re-render if only callbacks changed (they should be stable with useCallback)
  return true;
});
