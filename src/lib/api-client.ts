// API client utilities for frontend components

import { supabase } from "./supabase";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  /**
   * Get the current Supabase auth token
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Groups
  async getGroups() {
    return this.request("/groups");
  }

  async createGroup(groupData: Record<string, unknown>) {
    return this.request("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(groupId: string, updateData: Record<string, unknown>) {
    return this.request(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async deleteGroup(groupId: string) {
    return this.request(`/groups/${groupId}`, {
      method: "DELETE",
    });
  }

  // Workouts
  async getWorkouts() {
    return this.request("/workouts");
  }

  async createWorkout(workoutData: Record<string, unknown>) {
    return this.request("/workouts", {
      method: "POST",
      body: JSON.stringify(workoutData),
    });
  }

  // Exercises
  async getExercises() {
    return this.request("/exercises");
  }

  // Assignments
  async getAssignments(params?: {
    athleteId?: string;
    groupId?: string;
    date?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.athleteId) searchParams.set("athleteId", params.athleteId);
    if (params?.groupId) searchParams.set("groupId", params.groupId);
    if (params?.date) searchParams.set("date", params.date);

    const endpoint = `/assignments${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return this.request(endpoint);
  }

  async createAssignment(assignmentData: Record<string, unknown>) {
    return this.request("/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
  }

  // Demo credentials
  async getDemoCredentials() {
    return this.request("/auth/login", { method: "GET" });
  }

  // Users (Athletes)
  async getAthletes() {
    return this.request("/users");
  }

  async createAthlete(athleteData: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(athleteData),
    });
  }

  // KPIs
  async createKPI(kpiData: {
    athleteId: string;
    exerciseId: string;
    exerciseName: string;
    currentPR: number;
    dateAchieved: string;
  }) {
    return this.request("/kpis", {
      method: "POST",
      body: JSON.stringify(kpiData),
    });
  }

  async updateKPI(
    kpiId: string,
    kpiData: {
      exerciseName?: string;
      currentPR?: number;
      dateAchieved?: string;
      notes?: string;
    }
  ) {
    return this.request(`/kpis/${kpiId}`, {
      method: "PUT",
      body: JSON.stringify(kpiData),
    });
  }

  async deleteKPI(kpiId: string) {
    return this.request(`/kpis/${kpiId}`, {
      method: "DELETE",
    });
  }

  // Athlete Invites
  async createAthleteInvite(inviteData: {
    email: string;
    name: string;
    groupIds?: string[];
  }) {
    return this.request("/invites", {
      method: "POST",
      body: JSON.stringify(inviteData),
    });
  }

  async validateInvite(inviteCode: string) {
    return this.request(`/invites/validate/${inviteCode}`);
  }

  async acceptInvite(inviteCode: string, password: string) {
    return this.request("/invites/accept", {
      method: "POST",
      body: JSON.stringify({ inviteCode, password }),
    });
  }

  async deleteAthlete(athleteId: string) {
    return this.request(`/users/${athleteId}`, {
      method: "DELETE",
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience hooks for React components
export function useApiClient() {
  return apiClient;
}
