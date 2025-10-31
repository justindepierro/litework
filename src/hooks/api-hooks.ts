import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { AthleteGroup, WorkoutPlan, WorkoutAssignment } from "@/types";
import { ApiResponse } from "@/lib/api-response";

// Custom hooks for API data
export function useGroups() {
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.getGroups()) as ApiResponse;
      if (response.success && response.data) {
        const data = response.data as { groups?: AthleteGroup[] };
        if (data.groups) {
          setGroups(data.groups);
        }
      } else {
        setError(
          typeof response.error === "string"
            ? response.error
            : "Failed to load groups"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return { groups, loading, error, refetch: loadGroups };
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.getWorkouts()) as ApiResponse;
      if (response.success && response.data) {
        const data = response.data as { workouts?: WorkoutPlan[] };
        if (data.workouts) {
          setWorkouts(data.workouts);
        }
      } else {
        setError(
          typeof response.error === "string"
            ? response.error
            : "Failed to load workouts"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  return { workouts, loading, error, refetch: loadWorkouts };
}

export function useAssignments(params?: {
  athleteId?: string;
  groupId?: string;
  date?: string;
}) {
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = (await apiClient.getAssignments(params)) as ApiResponse;
      if (response.success && response.data) {
        const data = response.data as { assignments?: WorkoutAssignment[] };
        if (data.assignments) {
          setAssignments(data.assignments);
        }
      } else {
        setError(
          typeof response.error === "string"
            ? response.error
            : "Failed to load assignments"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return { assignments, loading, error, refetch: loadAssignments };
}
