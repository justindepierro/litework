"use client";

import { Users, Clock, MessageCircle, AlertCircle } from "lucide-react";

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
        <Users className="h-5 w-5 text-accent-blue" />
        <span className="text-sm font-medium">{athleteCounts.active} Active</span>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-orange-50 rounded-xl sm:bg-transparent sm:p-0">
        <Clock className="h-5 w-5 text-orange-600" />
        <span className="text-sm font-medium">
          {athleteCounts.invited} Pending
        </span>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-success-lighter rounded-xl sm:bg-transparent sm:p-0">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium">{totalUnread} Unread</span>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-yellow-50 rounded-xl sm:bg-transparent sm:p-0">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <span className="text-sm font-medium">
          {athleteCounts.injured} Injured
        </span>
      </div>
    </div>
  );
}
