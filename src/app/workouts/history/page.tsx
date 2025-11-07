"use client";

import { useEffect, useState } from "react";
import { useAthleteGuard } from "@/hooks/use-auth-guard";
import Navigation from "@/components/Navigation";
import { Check } from "lucide-react";

interface SetRecord {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeight: number;
  actualWeight: number;
  completed: boolean;
  completedAt: string;
}

interface SessionExercise {
  id: string;
  exerciseName: string;
  targetSets: number;
  completedSets: number;
  started: boolean;
  completed: boolean;
  setRecords: SetRecord[];
}

interface WorkoutSession {
  id: string;
  workoutPlanName: string;
  date: string;
  mode: string;
  started: boolean;
  completed: boolean;
  progressPercentage: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  sessionExercises: SessionExercise[];
  stats: {
    totalExercises: number;
    completedExercises: number;
    totalSets: number;
    completedSets: number;
    totalVolume: number;
    duration: number | null;
  };
}

interface WorkoutHistoryResponse {
  sessions: WorkoutSession[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function WorkoutHistoryPage() {
  const { user, isLoading: authLoading } = useAthleteGuard();
  const [history, setHistory] = useState<WorkoutHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    }
  }, [authLoading, user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workouts/history");

      if (!response.ok) {
        throw new Error("Failed to fetch workout history");
      }

      const data: WorkoutHistoryResponse = await response.json();
      setHistory(data);
    } catch (err) {
      console.error("Error loading workout history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error loading history</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Workout History</h1>
          <p className="text-gray-600 mt-2">
            Review your past workouts and track your progress
          </p>
        </div>

        {/* Summary Stats */}
        {history && history.sessions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 text-sm">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.sessions.length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {history.sessions.filter((s) => s.completed).length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-blue-600">
                {history.sessions
                  .reduce((sum, s) => sum + s.stats.totalVolume, 0)
                  .toLocaleString()}
                <span className="text-sm text-gray-600 ml-1">lbs</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 text-sm">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatDuration(
                  Math.round(
                    history.sessions
                      .filter((s) => s.stats.duration)
                      .reduce((sum, s) => sum + (s.stats.duration || 0), 0) /
                      history.sessions.filter((s) => s.stats.duration).length
                  )
                )}
              </p>
            </div>
          </div>
        )}

        {/* Workout Sessions List */}
        {history && history.sessions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-600 text-lg">No workout history yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Complete your first workout to see it here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history?.sessions.map((session) => {
              const isExpanded = expandedSessions.has(session.id);
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Session Header */}
                  <button
                    onClick={() => toggleSession(session.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.workoutPlanName}
                          </h3>
                          {session.completed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(session.date)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>
                            {session.stats.completedExercises}/
                            {session.stats.totalExercises} exercises
                          </span>
                          <span>
                            {session.stats.completedSets}/
                            {session.stats.totalSets} sets
                          </span>
                          <span>
                            {session.stats.totalVolume.toLocaleString()} lbs
                          </span>
                          {session.stats.duration && (
                            <span>
                              {formatDuration(session.stats.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Exercises
                      </h4>
                      <div className="space-y-4">
                        {session.sessionExercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="bg-white rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                {exercise.exerciseName}
                              </h5>
                              {exercise.completed && (
                                <span className="text-green-600 text-sm flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  Completed
                                </span>
                              )}
                            </div>
                            {exercise.setRecords.length > 0 && (
                              <div className="space-y-1">
                                {exercise.setRecords.map((set) => (
                                  <div
                                    key={set.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      Set {set.setNumber}
                                    </span>
                                    <span className="text-gray-900">
                                      {set.actualWeight} lbs × {set.actualReps}{" "}
                                      reps
                                      {set.actualWeight !== set.targetWeight ||
                                      set.actualReps !== set.targetReps ? (
                                        <span className="text-gray-500 ml-2">
                                          (target: {set.targetWeight} lbs ×{" "}
                                          {set.targetReps})
                                        </span>
                                      ) : null}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
