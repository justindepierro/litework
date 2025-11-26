"use client";

import { Users, Clock, MessageCircle, AlertCircle } from "lucide-react";
import { Body } from "@/components/ui/Typography";

interface AthleteCounts {
  active: number;
  invited: number;
  injured: number;
}

interface AthleteCommunication {
  unreadMessages: number;
}

interface Athlete {
  communication?: AthleteCommunication;
}

interface AthleteStatsProps {
  athleteCounts: AthleteCounts;
  athletes: Athlete[];
}

/**
 * AthleteStats Component
 * Displays key athlete statistics in a mobile-optimized grid
 */
export default function AthleteStats({
  athleteCounts,
  athletes,
}: AthleteStatsProps) {
  const totalUnread = athletes.reduce(
    (acc, a) => acc + (a.communication?.unreadMessages || 0),
    0
  );

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6">
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-info-lighter rounded-xl sm:bg-transparent sm:p-0">
        <Users className="h-5 w-5 text-info" />
        <Body size="sm" weight="medium">
          {athleteCounts.active} Active
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-warning-lighter rounded-xl sm:bg-transparent sm:p-0">
        <Clock className="h-5 w-5 text-warning" />
        <Body size="sm" weight="medium">
          {athleteCounts.invited} Pending
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-success-lighter rounded-xl sm:bg-transparent sm:p-0">
        <MessageCircle className="h-5 w-5 text-success" />
        <Body size="sm" weight="medium">
          {totalUnread} Unread
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-warning-lighter rounded-xl sm:bg-transparent sm:p-0">
        <AlertCircle className="h-5 w-5 text-warning" />
        <Body size="sm" weight="medium">
          {athleteCounts.injured} Injured
        </Body>
      </div>
    </div>
  );
}
