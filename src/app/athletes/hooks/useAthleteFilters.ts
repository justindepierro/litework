import { useMemo } from "react";
import { User as UserType, AthleteKPI } from "@/types";

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
  personalRecords?: AthleteKPI[];
}

interface UseAthleteFiltersReturn {
  filteredAthletes: EnhancedAthlete[];
  athleteCounts: {
    active: number;
    invited: number;
    injured: number;
  };
}

/**
 * Custom hook for filtering and counting athletes
 * Memoizes filtered results to prevent unnecessary recalculations
 */
export function useAthleteFilters(
  athletes: EnhancedAthlete[],
  searchTerm: string,
  statusFilter: string
): UseAthleteFiltersReturn {
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

  return {
    filteredAthletes,
    athleteCounts,
  };
}
