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
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-linear-to-br from-accent-cyan-100 to-accent-blue-100 border border-accent-cyan-300 rounded-xl shadow-sm hover:shadow-md transition-shadow sm:shadow-none sm:border-0 sm:bg-transparent sm:p-0">
        <Users className="h-5 w-5 text-accent-cyan-600" />
        <Body size="sm" weight="medium" className="text-accent-cyan-700">
          {athleteCounts.active} Active
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-linear-to-br from-accent-amber-100 to-accent-orange-100 border border-accent-amber-300 rounded-xl shadow-sm hover:shadow-md transition-shadow sm:shadow-none sm:border-0 sm:bg-transparent sm:p-0">
        <Clock className="h-5 w-5 text-accent-amber-600" />
        <Body size="sm" weight="medium" className="text-accent-amber-700">
          {athleteCounts.invited} Pending
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-linear-to-br from-accent-purple-100 to-accent-pink-100 border border-accent-purple-300 rounded-xl shadow-sm hover:shadow-md transition-shadow sm:shadow-none sm:border-0 sm:bg-transparent sm:p-0">
        <MessageCircle className="h-5 w-5 text-accent-purple-600" />
        <Body size="sm" weight="medium" className="text-accent-purple-700">
          {totalUnread} Unread
        </Body>
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-2 p-3 bg-linear-to-br from-accent-red-100 to-accent-orange-100 border border-accent-red-300 rounded-xl shadow-sm hover:shadow-md transition-shadow sm:shadow-none sm:border-0 sm:bg-transparent sm:p-0">
        <AlertCircle className="h-5 w-5 text-accent-red-600" />
        <Body size="sm" weight="medium" className="text-accent-red-700">
          {athleteCounts.injured} Injured
        </Body>
      </div>
    </div>
  );
}
