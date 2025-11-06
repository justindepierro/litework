// API client utilities for frontend components

import { supabase } from "./supabase";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Required to send cookies with requests
    });

    if (!response.ok) {
      let errorData: { error?: string; details?: string } = {};
      let errorText = "";

      try {
        // Try to get the response text first
        errorText = await response.text();
        // Then try to parse it as JSON
        errorData = JSON.parse(errorText);
      } catch {
        // If JSON parsing fails, use the text as the error
        errorData = { error: errorText || "Unknown error" };
      }

      console.error("API request failed:", {
        url: `${this.baseUrl}${endpoint}`,
        method: options.method || "GET",
        status: response.status,
        statusText: response.statusText,
        errorData,
        rawResponse: errorText.substring(0, 500), // First 500 chars
      });

      throw new Error(
        errorData.error ||
          errorData.details ||
          errorText ||
          `API Error: ${response.status} ${response.statusText}`
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

  async updateWorkout(id: string, workoutData: Record<string, unknown>) {
    return this.request("/workouts", {
      method: "PUT",
      body: JSON.stringify({ id, ...workoutData }),
    });
  }

  // Exercises
  async getExercises() {
    return this.request("/exercises");
  }

  async findOrCreateExercise(exerciseData: {
    name: string;
    category?: string;
    muscleGroups?: Array<{ name: string; involvement: string }>;
    equipment?: string[];
  }) {
    return this.request("/exercises/find-or-create", {
      method: "POST",
      body: JSON.stringify(exerciseData),
    });
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

  // Users (Athletes)
  async getAthletes() {
    return this.request("/athletes");
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
    firstName: string;
    lastName: string;
    groupId?: string;
    notes?: string;
    bio?: string;
    dateOfBirth?: string;
    injuryStatus?: string;
  }) {
    return this.request("/invites", {
      method: "POST",
      body: JSON.stringify(inviteData),
    });
  }

  async deleteInvite(inviteId: string) {
    return this.request(`/invites/${inviteId}`, {
      method: "DELETE",
    });
  }

  async updateInvite(inviteId: string, data: { email: string }) {
    return this.request(`/invites/${inviteId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async resendInvite(inviteId: string) {
    return this.request(`/invites/${inviteId}`, {
      method: "PATCH",
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
