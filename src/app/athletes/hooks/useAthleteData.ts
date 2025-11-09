import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { AthleteGroup, WorkoutPlan, User as UserType, AthleteKPI } from "@/types";

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

interface UseAthleteDataReturn {
  athletes: EnhancedAthlete[];
  groups: AthleteGroup[];
  workoutPlans: WorkoutPlan[];
  loadAthletes: () => Promise<void>;
  loadGroups: () => Promise<void>;
  loadWorkoutPlans: () => Promise<void>;
  setAthletes: React.Dispatch<React.SetStateAction<EnhancedAthlete[]>>;
  setGroups: React.Dispatch<React.SetStateAction<AthleteGroup[]>>;
}

/**
 * Custom hook for managing athlete data loading and state
 * Handles loading athletes, groups, and workout plans from API
 */
export function useAthleteData(
  user: UserType | null,
  isAuthLoading: boolean
): UseAthleteDataReturn {
  const [athletes, setAthletes] = useState<EnhancedAthlete[]>([]);
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  // Load groups
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
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            createdAt: string;
          }>;
          invites: Array<{
            id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            status: string;
            createdAt: string;
            groupIds?: string[];
          }>;
        };
      };

      if (response.success) {
        // Convert API athletes to EnhancedAthlete format
        const loadedAthletes: EnhancedAthlete[] = [
          // Map registered athletes
          ...response.data.athletes.map((athlete) => ({
            id: athlete.id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            fullName: `${athlete.firstName} ${athlete.lastName}`,
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
            createdAt: new Date(athlete.createdAt),
            updatedAt: new Date(athlete.createdAt),
          })),
          // Map pending invites (including drafts)
          ...response.data.invites.map((invite) => ({
            id: invite.id,
            firstName: invite.firstName,
            lastName: invite.lastName,
            fullName: `${invite.firstName} ${invite.lastName}`,
            email: invite.email || "",
            role: "athlete" as const,
            groupIds: invite.groupIds || [],
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
            createdAt: new Date(invite.createdAt),
            updatedAt: new Date(invite.createdAt),
          })),
        ];

        setAthletes(loadedAthletes);
      }
    } catch (err) {
      console.error("Failed to load athletes:", err);
    }
  };

  // Load workout plans
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

  // Load all data when component mounts and auth is ready
  useEffect(() => {
    if (!isAuthLoading && user) {
      // Load data asynchronously
      const loadData = async () => {
        await Promise.all([loadGroups(), loadAthletes(), loadWorkoutPlans()]);
      };
      
      loadData();
    }
  }, [isAuthLoading, user]);

  return {
    athletes,
    groups,
    workoutPlans,
    loadAthletes,
    loadGroups,
    loadWorkoutPlans,
    setAthletes,
    setGroups,
  };
}
