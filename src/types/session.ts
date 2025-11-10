// Session tracking types for Phase 2

export type SessionStatus = "active" | "paused" | "completed" | "abandoned";

export interface ExerciseGroupInfo {
  id: string;
  name: string;
  type: "superset" | "circuit" | "section";
  description?: string;
  order_index: number;
  rest_between_rounds?: number;
  rest_between_exercises?: number;
  rounds?: number;
  notes?: string;
}

export interface SetRecord {
  id?: string;
  session_exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number;
  rpe: number | null; // Rate of Perceived Exertion (1-10)
  completed_at: string;
  notes?: string | null;
}

export interface ExerciseProgress {
  session_exercise_id: string;
  exercise_id: string;
  exercise_name: string;
  sets_target: number;
  sets_completed: number;
  reps_target: string; // e.g., "10", "8-12"
  weight_target: number | null;
  weight_percentage: number | null;
  rest_seconds: number;
  tempo: string | null;
  notes: string | null;
  order_index: number;
  completed: boolean;
  set_records: SetRecord[];
  group_id?: string | null;
}

export interface WorkoutSession {
  id: string;
  assignment_id: string;
  athlete_id: string;
  workout_plan_id: string;
  workout_name: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  paused_at: string | null;
  total_duration_seconds: number; // Excludes paused time
  current_exercise_index: number;
  exercises: ExerciseProgress[];
  groups?: ExerciseGroupInfo[]; // Exercise group information
  notes?: string | null;
}

export interface SessionState {
  session: WorkoutSession | null;
  isLoading: boolean;
  error: string | null;
}

// Local storage keys
export const SESSION_STORAGE_KEY = "litework_active_session";
export const OFFLINE_QUEUE_KEY = "litework_offline_queue";

// Action types for session updates
export type SessionAction =
  | { type: "START_SESSION"; payload: WorkoutSession }
  | { type: "PAUSE_SESSION" }
  | { type: "RESUME_SESSION" }
  | { type: "COMPLETE_SESSION" }
  | { type: "UPDATE_EXERCISE_INDEX"; payload: number }
  | {
      type: "ADD_SET_RECORD";
      payload: { exerciseIndex: number; setRecord: SetRecord };
    }
  | { type: "COMPLETE_EXERCISE"; payload: number }
  | { type: "UPDATE_SESSION"; payload: Partial<WorkoutSession> }
  | { type: "CLEAR_SESSION" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };
