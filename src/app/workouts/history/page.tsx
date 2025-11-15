"use client";

import React, { useEffect, useState } from "react";
import { useAthleteGuard } from "@/hooks/use-auth-guard";
import Navigation from "@/components/Navigation";
import {
  Check,
  Download,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "in-progress"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter sessions based on criteria
  const getFilteredSessions = () => {
    if (!history) return [];

    let filtered = history.sessions;

    // Status filter
    if (statusFilter === "completed") {
      filtered = filtered.filter((s) => s.completed);
    } else if (statusFilter === "in-progress") {
      filtered = filtered.filter((s) => !s.completed);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((s) => new Date(s.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((s) => new Date(s.date) <= new Date(dateTo));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.workoutPlanName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Pagination
  const filteredSessions = getFilteredSessions();
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const sessions = getFilteredSessions();
    if (sessions.length === 0) return;

    const csvRows = [
      [
        "Date",
        "Workout",
        "Status",
        "Exercises",
        "Sets",
        "Volume (lbs)",
        "Duration (min)",
      ].join(","),
    ];

    sessions.forEach((session) => {
      csvRows.push(
        [
          formatDate(session.date),
          `"${session.workoutPlanName}"`,
          session.completed ? "Completed" : "In Progress",
          `${session.stats.completedExercises}/${session.stats.totalExercises}`,
          `${session.stats.completedSets}/${session.stats.totalSets}`,
          session.stats.totalVolume,
          session.stats.duration || "N/A",
        ].join(",")
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workout-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset filters
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-(--bg-secondary)">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-(--bg-tertiary) rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-(--bg-tertiary) rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-(--bg-secondary)">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Alert variant="error" title="Error loading history">
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-3 px-4 py-2 bg-(--status-error) text-white rounded-lg hover:bg-(--status-error)"
            >
              Try Again
            </button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-secondary)">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-(--text-primary)">
                Workout History
              </h1>
              <p className="text-(--text-secondary) mt-2">
                Review your past workouts and track your progress
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredSessions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-lg border border-silver-300 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-(--text-primary)">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-(--text-tertiary) hover:text-(--text-secondary)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Search Workouts"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(
                        e.target.value as "all" | "completed" | "in-progress"
                      );
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 bg-white border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 bg-white border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 bg-white border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-(--text-secondary)">
                  {filteredSessions.length} workout
                  {filteredSessions.length !== 1 ? "s" : ""} found
                </p>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {history && history.sessions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-(--text-secondary) text-sm">Total Workouts</p>
              <p className="text-2xl font-bold text-(--text-primary)">
                {history.sessions.length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-(--text-secondary) text-sm">Completed</p>
              <p className="text-2xl font-bold text-(--status-success)">
                {history.sessions.filter((s) => s.completed).length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-(--text-secondary) text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-(--accent-blue-600)">
                {history.sessions
                  .reduce((sum, s) => sum + s.stats.totalVolume, 0)
                  .toLocaleString()}
                <span className="text-sm text-(--text-secondary) ml-1">
                  lbs
                </span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-(--text-secondary) text-sm">Avg Duration</p>
              <p className="text-2xl font-bold text-(--accent-purple-600)">
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
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={Check}
            title="No workouts found"
            description={
              searchQuery || dateFrom || dateTo || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Complete your first workout to see it here!"
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedSessions.map((session) => {
                const isExpanded = expandedSessions.has(session.id);
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Session Header */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full p-4 text-left hover:bg-(--interactive-hover) transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-(--text-primary)">
                              {session.workoutPlanName}
                            </h3>
                            {session.completed ? (
                              <Badge variant="success" size="sm">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-(--text-secondary) mt-1">
                            {formatDate(session.date)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-(--text-secondary)">
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
                          className={`w-5 h-5 text-(--text-tertiary) transition-transform ${
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
                      <div className="border-t border-silver-300 p-4 bg-(--bg-secondary)">
                        <h4 className="font-semibold text-(--text-primary) mb-3">
                          Exercises
                        </h4>
                        <div className="space-y-4">
                          {session.sessionExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="bg-white rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-(--text-primary)">
                                  {exercise.exerciseName}
                                </h5>
                                {exercise.completed && (
                                  <span className="text-(--status-success) text-sm flex items-center gap-1">
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
                                      <span className="text-(--text-secondary)">
                                        Set {set.setNumber}
                                      </span>
                                      <span className="text-(--text-primary)">
                                        {set.actualWeight} lbs ×{" "}
                                        {set.actualReps} reps
                                        {set.actualWeight !==
                                          set.targetWeight ||
                                        set.actualReps !== set.targetReps ? (
                                          <span className="text-(--text-tertiary) ml-2">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-silver-300">
                <div className="text-sm text-(--text-secondary)">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredSessions.length
                  )}{" "}
                  of {filteredSessions.length} workouts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-(--text-tertiary)">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "text-(--text-secondary) hover:bg-(--interactive-hover)"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
