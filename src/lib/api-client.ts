// API client utilities for frontend components

import { supabase } from "./supabase";

/**
 * API Request Options
 */
export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  /**
   * Request body (will be JSON stringified automatically)
   */
  body?: unknown;

  /**
   * Show error toast notification on failure
   * Note: Toast function must be passed explicitly as API client can't access React hooks
   * @default false
   */
  showErrorToast?: boolean;

  /**
   * Toast function (from useToast hook)
   */
  toastError?: (message: string) => void;

  /**
   * Custom error message to display
   * @default null (uses API error message)
   */
  customErrorMessage?: string;

  /**
   * Request timeout in milliseconds
   * @default 10000 (10 seconds)
   */
  timeout?: number;

  /**
   * Skip JSON parsing (for non-JSON responses)
   * @default false
   */
  skipJsonParse?: boolean;
}

/**
 * Standardized API Response
 */
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Default request timeout (10 seconds)
 */
const DEFAULT_TIMEOUT = 10000;

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
   * Make an authenticated API request with enhanced error handling
   * Returns Promise<ApiResponse<T>> with data, error, and success fields
   *
   * Features:
   * - Automatic timeout management
   * - Consistent error handling
   * - Optional toast notifications
   * - Development logging
   * - Type-safe responses
   */
  async requestWithResponse<T>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      showErrorToast = false,
      toastError,
      customErrorMessage,
      timeout = DEFAULT_TIMEOUT,
      skipJsonParse = false,
      body,
      ...fetchOptions
    } = options;

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Setup timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
        signal: controller.signal,
        body: body ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);

      // Log in development
      if (process.env.NODE_ENV === "development") {
        const duration = Date.now() - startTime;
        console.log(
          `[API] ${fetchOptions.method || "GET"} ${endpoint} - ${response.status} (${duration}ms)`
        );
      }

      // Handle authentication errors
      if (response.status === 401) {
        const message =
          customErrorMessage || "Authentication required. Please sign in.";

        if (showErrorToast && toastError) {
          toastError(message);
        }

        return {
          data: null,
          error: message,
          success: false,
        };
      }

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        let errorText = "";

        try {
          errorText = await response.text();
          if (errorText) {
            errorData = JSON.parse(errorText);
          }
        } catch {
          errorData = { error: errorText || "Unknown error" };
        }

        const message =
          customErrorMessage ||
          (errorData.error as string) ||
          (errorData.details as string) ||
          (errorData.message as string) ||
          errorText ||
          `Request failed: ${response.status} ${response.statusText}`;

        // Log errors in development, but filter out expected failures
        if (process.env.NODE_ENV === "development") {
          // Skip logging for expected auth/routing errors
          const isExpectedError =
            response.status === 401 || // Unauthenticated
            response.status === 404 || // Not found
            errorText?.includes("<!DOCTYPE"); // HTML response (404 page)

          if (!isExpectedError) {
            console.error("[API] Request failed:", {
              url: `${this.baseUrl}${endpoint}`,
              method: fetchOptions.method || "GET",
              status: response.status,
              statusText: response.statusText,
              errorData,
              rawResponse: errorText
                ? errorText.substring(0, 500)
                : "No response",
            });
          }
        }

        if (showErrorToast && toastError) {
          toastError(message);
        }

        return {
          data: null,
          error: message,
          success: false,
        };
      }

      // Parse successful response
      let data: T | null = null;

      if (!skipJsonParse) {
        try {
          data = await response.json();
        } catch {
          const message = "Invalid response format";

          if (showErrorToast && toastError) {
            toastError(message);
          }

          return {
            data: null,
            error: message,
            success: false,
          };
        }
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      // Handle network errors and timeouts
      let message = customErrorMessage || "Request failed";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = `Request timeout after ${timeout}ms`;
        } else if (err.message.includes("Failed to fetch")) {
          message = "Network error. Please check your connection.";
        } else {
          message = customErrorMessage || err.message;
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.error(
          `[API] Error ${fetchOptions.method || "GET"} ${endpoint}:`,
          err
        );
      }

      if (showErrorToast && toastError) {
        toastError(message);
      }

      return {
        data: null,
        error: message,
        success: false,
      };
    }
  }

  /**
   * Legacy request method - throws on error
   * Keep for backwards compatibility with existing code
   */
  private async request<T>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const response = await this.requestWithResponse<T>(endpoint, options);

    if (!response.success || response.data === null) {
      throw new Error(response.error || "Request failed");
    }

    return response.data;
  }

  // Groups
  async getGroups() {
    return this.request("/groups");
  }

  async createGroup(groupData: Record<string, unknown>) {
    return this.request("/groups", {
      method: "POST",
      body: groupData,
    });
  }

  async updateGroup(groupId: string, updateData: Record<string, unknown>) {
    return this.request(`/groups/${groupId}`, {
      method: "PUT",
      body: updateData,
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
      body: workoutData,
    });
  }

  async updateWorkout(id: string, workoutData: Record<string, unknown>) {
    return this.request("/workouts", {
      method: "PUT",
      body: { id, ...workoutData },
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
      body: exerciseData,
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
      body: assignmentData,
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
      body: athleteData,
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
      body: kpiData,
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
      body: kpiData,
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
      body: inviteData,
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
      body: data, // Let requestWithResponse handle JSON.stringify
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
      body: { inviteCode, password },
    });
  }

  async deleteAthlete(athleteId: string) {
    return this.request(`/users/${athleteId}`, {
      method: "DELETE",
    });
  }

  // Enhanced Methods (with ApiResponse wrapper)
  // These methods return the full ApiResponse<T> for better error handling
  // Use these for new code or when migrating existing code

  /**
   * Get groups with enhanced response handling
   * @param toastError - Optional callback for error toast notifications
   */
  async getGroupsWithResponse(toastError?: (message: string) => void) {
    return this.requestWithResponse<{ groups: unknown[] }>("/groups", {
      showErrorToast: true,
      toastError,
    });
  }

  /**
   * Create group with enhanced response handling
   */
  async createGroupWithResponse(
    groupData: unknown,
    toastError?: (message: string) => void
  ) {
    return this.requestWithResponse("/groups", {
      method: "POST",
      body: groupData,
      showErrorToast: true,
      toastError,
    });
  }

  /**
   * Get workouts with enhanced response handling
   */
  async getWorkoutsWithResponse(toastError?: (message: string) => void) {
    return this.requestWithResponse<unknown[]>("/workouts", {
      showErrorToast: true,
      toastError,
    });
  }

  /**
   * Create workout with enhanced response handling
   */
  async createWorkoutWithResponse(
    workoutData: unknown,
    toastError?: (message: string) => void
  ) {
    return this.requestWithResponse("/workouts", {
      method: "POST",
      body: workoutData,
      showErrorToast: true,
      toastError,
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience hooks for React components
export function useApiClient() {
  return apiClient;
}
