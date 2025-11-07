"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
  WorkoutSession,
  SessionState,
  SessionAction,
  SetRecord,
} from "@/types/session";
import {
  saveSession,
  loadSession,
  clearSession,
  calculateSessionDuration,
} from "@/lib/session-storage";

// Initial state
const initialState: SessionState = {
  session: null,
  isLoading: false,
  error: null,
};

// Reducer for session state management
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
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
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => Promise<void>;
  updateExerciseIndex: (index: number) => void;
  addSetRecord: (exerciseIndex: number, setRecord: SetRecord) => void;
  completeExercise: (exerciseIndex: number) => void;
  clearCurrentSession: () => void;
  saveCurrentSession: () => void;
}

const WorkoutSessionContext = createContext<WorkoutSessionContextType | undefined>(
  undefined
);

// Provider component
export function WorkoutSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      dispatch({ type: "START_SESSION", payload: stored });
    }
  }, []);

  // Auto-save session to localStorage whenever it changes
  useEffect(() => {
    if (state.session) {
      saveSession(state.session);
    }
  }, [state.session]);

  // Start a new session
  const startSession = useCallback((session: WorkoutSession) => {
    dispatch({ type: "START_SESSION", payload: session });
  }, []);

  // Pause current session
  const pauseSession = useCallback(() => {
    dispatch({ type: "PAUSE_SESSION" });
  }, []);

  // Resume paused session
  const resumeSession = useCallback(() => {
    dispatch({ type: "RESUME_SESSION" });
  }, []);

  // Complete current session
  const completeSession = useCallback(async () => {
    if (!state.session) return;

    dispatch({ type: "COMPLETE_SESSION" });

    // Call API to mark session complete
    try {
      const response = await fetch(`/api/sessions/${state.session.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to complete session");
      }

      // Clear session after successful completion
      setTimeout(() => {
        clearSession();
        dispatch({ type: "CLEAR_SESSION" });
      }, 2000); // Give time for celebration UI
    } catch (error) {
      console.error("Error completing session:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to complete session",
      });
    }
  }, [state.session]);

  // Update current exercise index
  const updateExerciseIndex = useCallback((index: number) => {
    dispatch({ type: "UPDATE_EXERCISE_INDEX", payload: index });
  }, []);

  // Add a set record
  const addSetRecord = useCallback((exerciseIndex: number, setRecord: SetRecord) => {
    dispatch({ type: "ADD_SET_RECORD", payload: { exerciseIndex, setRecord } });
  }, []);

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
      saveSession(state.session);
    }
  }, [state.session]);

  const value: WorkoutSessionContextType = {
    ...state,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    updateExerciseIndex,
    addSetRecord,
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
    throw new Error("useWorkoutSession must be used within a WorkoutSessionProvider");
  }
  return context;
}
