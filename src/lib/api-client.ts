// API client utilities for frontend components

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    this.token = null;

    // Try to get token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth-token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{ token?: string; user?: unknown }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.removeToken();
    return { success: true };
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
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience hooks for React components
export function useApiClient() {
  return apiClient;
}
