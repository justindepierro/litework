"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  WorkoutSession,
  SessionState,
  SessionAction,
  SetRecord,
} from "@/types/session";
import {
  saveSession as saveSessionLocal,
  loadSession,
  clearSession,
  calculateSessionDuration,
} from "@/lib/session-storage";
import {
  saveSession as saveSessionIDB,
  saveSet as saveSetIDB,
  saveExercises as saveExercisesIDB,
  type IDBSession,
  type IDBExercise,
  type IDBSetRecord,
} from "@/lib/indexeddb-service";
import { networkService } from "@/lib/network-service";
import { syncManager } from "@/lib/sync-manager";

// Helper function to convert WorkoutSession to IDBSession
function toIDBSession(session: WorkoutSession): IDBSession {
  return {
    id: session.id,
    workout_plan_id: session.workout_plan_id,
    assignment_id: session.assignment_id,
    athlete_id: session.athlete_id,
    workout_name: session.workout_name,
    status: session.status,
    started_at: session.started_at,
    paused_at: session.paused_at,
    completed_at: session.completed_at,
    total_duration_seconds: session.total_duration_seconds,
    current_exercise_index: session.current_exercise_index,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced: false, // Always false initially
  };
}

// Helper function to convert session exercises to IDBExercise[]
function toIDBExercises(session: WorkoutSession): IDBExercise[] {
  return session.exercises.map((exercise, index) => ({
    id: exercise.session_exercise_id,
    session_id: session.id,
    exercise_id: exercise.exercise_id,
    exercise_name: exercise.exercise_name,
    order_index: exercise.order_index || index,
    target_sets: exercise.sets_target,
    target_reps: parseInt(exercise.reps_target) || 0,
    target_weight: exercise.weight_target || 0,
    weight_type: exercise.weight_percentage ? "percentage" : "absolute",
    rest_time: exercise.rest_seconds,
    notes: exercise.notes,
    is_completed: exercise.completed || false,
    sets_completed: exercise.sets_completed,
    created_at: new Date().toISOString(),
    synced: false,
  }));
}

// Helper function to save session to both localStorage and IndexedDB
async function persistSession(session: WorkoutSession): Promise<void> {
  // Save to localStorage for immediate access
  saveSessionLocal(session);

  // Save to IndexedDB for offline support
  try {
    await saveSessionIDB(toIDBSession(session));
    await saveExercisesIDB(toIDBExercises(session));
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
}

// Initial state
const initialState: SessionState = {
  session: null,
  isLoading: false,
  error: null,
};

// Reducer for session state management
function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        session: action.payload,
        error: null,
      };

    case "PAUSE_SESSION":
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          status: "paused",
          paused_at: new Date().toISOString(),
        },
      };

    case "RESUME_SESSION":
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          status: "active",
          paused_at: null,
        },
      };

    case "COMPLETE_SESSION":
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          status: "completed",
          completed_at: new Date().toISOString(),
          total_duration_seconds: calculateSessionDuration(state.session),
        },
      };

    case "UPDATE_EXERCISE_INDEX":
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          current_exercise_index: action.payload,
        },
      };

    case "ADD_SET_RECORD": {
      if (!state.session) return state;
      const { exerciseIndex, setRecord } = action.payload;
      const exercises = [...state.session.exercises];

      if (exercises[exerciseIndex]) {
        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          set_records: [...exercises[exerciseIndex].set_records, setRecord],
          sets_completed: exercises[exerciseIndex].sets_completed + 1,
        };
      }

      return {
        ...state,
        session: {
          ...state.session,
          exercises,
        },
      };
    }

    case "COMPLETE_EXERCISE": {
      if (!state.session) return state;
      const exercises = [...state.session.exercises];

      if (exercises[action.payload]) {
        exercises[action.payload] = {
          ...exercises[action.payload],
          completed: true,
        };
      }

      return {
        ...state,
        session: {
          ...state.session,
          exercises,
        },
      };
    }

    case "UPDATE_SESSION":
      if (!state.session) return state;
      return {
        ...state,
        session: {
          ...state.session,
          ...action.payload,
        },
      };

    case "CLEAR_SESSION":
      return {
        ...state,
        session: null,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// Context type
interface WorkoutSessionContextType extends SessionState {
  startSession: (session: WorkoutSession) => void;
  loadSessionById: (sessionId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  abandonSession: () => Promise<void>;
  updateExerciseIndex: (index: number) => void;
  addSetRecord: (exerciseIndex: number, setRecord: SetRecord) => void;
  deleteSet: (exerciseIndex: number, setId: string) => Promise<void>;
  completeExercise: (exerciseIndex: number) => void;
  clearCurrentSession: () => void;
  saveCurrentSession: () => void;
}

const WorkoutSessionContext = createContext<
  WorkoutSessionContextType | undefined
>(undefined);

// Provider component
export function WorkoutSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      dispatch({ type: "START_SESSION", payload: stored });
    }
  }, []);

  // Auto-save session to localStorage and IndexedDB whenever it changes
  useEffect(() => {
    if (state.session) {
      persistSession(state.session).catch((error) => {
        console.error("Error persisting session:", error);
      });
    }
  }, [state.session]);

  // Start a new session
  const startSession = useCallback(async (session: WorkoutSession) => {
    dispatch({ type: "START_SESSION", payload: session });

    // Trigger sync if online
    if (networkService.isOnline) {
      syncManager.sync().catch((error) => {
        console.error("Error syncing new session:", error);
      });
    }
  }, []);

  // Load existing session by ID from API
  const loadSessionById = useCallback(async (sessionId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to load session");
      }

      // Transform API response to WorkoutSession format
      const apiSession = data.data;
      const session: WorkoutSession = {
        id: apiSession.session.id,
        workout_plan_id: apiSession.session.workoutPlanId || "",
        assignment_id: apiSession.session.assignmentId,
        athlete_id: apiSession.session.athleteId,
        workout_name: apiSession.session.workoutPlanName,
        status: apiSession.session.status,
        started_at: apiSession.session.startTime,
        paused_at: null,
        completed_at: apiSession.session.endTime,
        total_duration_seconds: apiSession.session.duration
          ? apiSession.session.duration * 60
          : 0,
        current_exercise_index: 0,
        groups: apiSession.groups || [],
        exercises: apiSession.exercises.map(
          (ex: {
            id: string;
            exerciseId: string;
            exerciseName: string;
            orderIndex: number;
            targetSets: number;
            targetReps: number;
            targetWeight: number;
            weightType: string;
            restTime: number;
            notes: string;
            groupId?: string | null;
            completedSets: Array<{
              id: string;
              session_exercise_id: string;
              set_number: number;
              reps_completed: number;
              weight_used: number;
              rpe: number;
              notes: string;
              completed_at: string;
            }>;
          }) => ({
            id: ex.id,
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            order_index: ex.orderIndex,
            target_sets: ex.targetSets,
            target_reps: ex.targetReps,
            target_weight: ex.targetWeight,
            weight_type: ex.weightType,
            rest_time: ex.restTime,
            notes: ex.notes,
            group_id: ex.groupId,
            is_completed: false,
            sets_completed: ex.completedSets?.length || 0,
            set_records:
              ex.completedSets?.map((set) => ({
                id: set.id,
                session_exercise_id: set.session_exercise_id,
                set_number: set.set_number,
                reps_completed: set.reps_completed,
                weight_used: set.weight_used,
                rpe: set.rpe,
                notes: set.notes,
                completed_at: set.completed_at,
              })) || [],
          })
        ),
      };

      dispatch({ type: "START_SESSION", payload: session });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      console.error("Error loading session:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load session",
      });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Pause current session
  const pauseSession = useCallback(async () => {
    if (!state.session) return;

    dispatch({ type: "PAUSE_SESSION" });

    // Update IndexedDB
    try {
      await saveSessionIDB({
        ...toIDBSession(state.session),
        status: "paused",
        paused_at: new Date().toISOString(),
        synced: false,
      });
    } catch (error) {
      console.error("Error saving paused state to IndexedDB:", error);
    }

    // Try to sync to server
    try {
      if (networkService.isOnline) {
        const response = await fetch(`/api/sessions/${state.session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "paused" }),
        });

        if (response.ok) {
          // Mark as synced if successful
          await saveSessionIDB({
            ...toIDBSession(state.session),
            status: "paused",
            paused_at: new Date().toISOString(),
            synced: true,
          });
        }
      }
    } catch (error) {
      console.error("Error pausing session on server:", error);
      // Continue - data is saved locally
    }
  }, [state.session]);

  // Resume paused session
  const resumeSession = useCallback(async () => {
    if (!state.session) return;

    dispatch({ type: "RESUME_SESSION" });

    // Update IndexedDB
    try {
      await saveSessionIDB({
        ...toIDBSession(state.session),
        status: "active",
        paused_at: null,
        synced: false,
      });
    } catch (error) {
      console.error("Error saving resumed state to IndexedDB:", error);
    }

    // Try to sync to server
    try {
      if (networkService.isOnline) {
        const response = await fetch(`/api/sessions/${state.session.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in-progress" }),
        });

        if (response.ok) {
          // Mark as synced if successful
          await saveSessionIDB({
            ...toIDBSession(state.session),
            status: "active",
            paused_at: null,
            synced: true,
          });
        }
      }
    } catch (error) {
      console.error("Error resuming session on server:", error);
      // Continue - data is saved locally
    }
  }, [state.session]);

  // Complete current session
  const completeSession = useCallback(async () => {
    if (!state.session) return;

    dispatch({ type: "COMPLETE_SESSION" });

    // Update IndexedDB
    const completedSession = {
      ...toIDBSession(state.session),
      status: "completed" as const,
      completed_at: new Date().toISOString(),
      total_duration_seconds: calculateSessionDuration(state.session),
      synced: false,
    };

    try {
      await saveSessionIDB(completedSession);
    } catch (error) {
      console.error("Error saving completed session to IndexedDB:", error);
    }

    // Try to sync to server
    try {
      if (networkService.isOnline) {
        const response = await fetch(
          `/api/sessions/${state.session.id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          // Mark as synced
          await saveSessionIDB({ ...completedSession, synced: true });
        }
      }

      // Clear session after successful completion
      setTimeout(() => {
        clearSession();
        dispatch({ type: "CLEAR_SESSION" });
      }, 2000); // Give time for celebration UI
    } catch (error) {
      console.error("Error completing session on server:", error);
      // Continue - data is saved locally and will sync later
    }
  }, [state.session]);

  // Abandon current session
  const abandonSession = useCallback(async () => {
    if (!state.session) return;

    try {
      const response = await fetch(`/api/sessions/${state.session.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to abandon session");
      }

      // Clear session after successful abandonment
      clearSession();
      dispatch({ type: "CLEAR_SESSION" });
    } catch (error) {
      console.error("Error abandoning session:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to abandon session",
      });
    }
  }, [state.session]);

  // Update current exercise index
  const updateExerciseIndex = useCallback((index: number) => {
    dispatch({ type: "UPDATE_EXERCISE_INDEX", payload: index });
  }, []);

  // Add a set record
  const addSetRecord = useCallback(
    async (exerciseIndex: number, setRecord: SetRecord) => {
      if (!state.session) return;

      // Update local state immediately
      dispatch({
        type: "ADD_SET_RECORD",
        payload: { exerciseIndex, setRecord },
      });

      // Save to IndexedDB for offline support
      try {
        const idbSet: IDBSetRecord = {
          id:
            setRecord.id ||
            `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          session_id: state.session.id,
          session_exercise_id: setRecord.session_exercise_id,
          set_number: setRecord.set_number,
          reps_completed: setRecord.reps,
          weight_used: setRecord.weight,
          rpe: setRecord.rpe,
          notes: setRecord.notes || null,
          completed_at: setRecord.completed_at,
          created_at: new Date().toISOString(),
          synced: false,
        };

        await saveSetIDB(idbSet);

        // Trigger sync if online
        if (networkService.isOnline) {
          syncManager.sync().catch((error) => {
            console.error("Error syncing set:", error);
          });
        }
      } catch (error) {
        console.error("Error saving set to IndexedDB:", error);
      }
    },
    [state.session]
  );

  // Delete a set record
  const deleteSet = useCallback(
    async (exerciseIndex: number, setId: string) => {
      if (!state.session) return;

      try {
        // Call API to delete set from database
        const response = await fetch(`/api/sets/${setId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete set");
        }

        // Update local state - remove set from exercise
        const updatedSession = { ...state.session };
        const exercise = updatedSession.exercises[exerciseIndex];
        exercise.set_records = exercise.set_records.filter(
          (set) => set.id !== setId
        );
        exercise.sets_completed = exercise.set_records.length;

        dispatch({ type: "START_SESSION", payload: updatedSession });
        saveSessionLocal(updatedSession);

        console.log(`[WorkoutSession] Set ${setId} deleted successfully`);
      } catch (error) {
        console.error("Error deleting set:", error);
        throw error;
      }
    },
    [state.session]
  );

  // Mark exercise as complete
  const completeExercise = useCallback((exerciseIndex: number) => {
    dispatch({ type: "COMPLETE_EXERCISE", payload: exerciseIndex });
  }, []);

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    clearSession();
    dispatch({ type: "CLEAR_SESSION" });
  }, []);

  // Save current session (for manual save)
  const saveCurrentSession = useCallback(() => {
    if (state.session) {
      persistSession(state.session).catch((error) => {
        console.error("Error saving session:", error);
      });
    }
  }, [state.session]);

  const value: WorkoutSessionContextType = {
    ...state,
    startSession,
    loadSessionById,
    pauseSession,
    resumeSession,
    completeSession,
    abandonSession,
    updateExerciseIndex,
    addSetRecord,
    deleteSet,
    completeExercise,
    clearCurrentSession,
    saveCurrentSession,
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}

// Hook to use the context
export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutSession must be used within a WorkoutSessionProvider"
    );
  }
  return context;
}
