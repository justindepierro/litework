"use client";

import React, { useState, useMemo, useEffect, memo } from "react";
import { Card } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Trophy,
  Dumbbell,
  Download,
  Medal,
  Users,
  Zap,
  Award,
  Activity,
  BarChart3,
} from "lucide-react";

// Analytics-specific interfaces
interface WorkoutFrequencyData {
  week: string;
  workouts: number;
  goal: number;
}

interface ExerciseProgressData {
  exerciseId: string;
  exerciseName: string;
  data: Array<{
    date: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    volume: number;
  }>;
}

interface AnalyticsData {
  strengthProgress: ExerciseProgressData[];
  workoutFrequency: WorkoutFrequencyData[];
  exerciseComparison: Record<string, unknown>;
  weeklyGoals: Record<string, unknown>;
  overviewStats: {
    totalWorkouts: number;
    avgWorkoutsPerWeek: number;
    consistencyScore: number;
    avgImprovement: number;
  };
}

interface AnalyticsDashboardProps {
  athleteId?: string;
}

function AnalyticsDashboard({ athleteId }: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1m" | "3m" | "6m" | "1y"
  >("3m");
  const [viewMode, setViewMode] = useState<
    "overview" | "strength" | "comparison" | "goals"
  >("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [selectedExercise, setSelectedExercise] = useState<string>("all");

  // Load analytics data from API
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Only run on client side
        if (typeof window === "undefined") return;

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          console.error("No auth token available");
          return;
        }

        // Load overview data
        const overviewResponse = await fetch(
          `/api/analytics?timeframe=${selectedTimeframe}${athleteId ? `&athleteId=${athleteId}` : ""}&type=overview`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json();
          if (overviewData.success) {
            setAnalyticsData({
              strengthProgress: [],
              workoutFrequency:
                overviewData.data.overview?.workoutFrequency || [],
              exerciseComparison: {},
              weeklyGoals: {},
              overviewStats: {
                totalWorkouts: overviewData.data.overview?.totalWorkouts || 0,
                avgWorkoutsPerWeek:
                  overviewData.data.overview?.avgWorkoutsPerWeek || 0,
                consistencyScore:
                  overviewData.data.overview?.consistencyScore || 0,
                avgImprovement: 8.5, // TODO: Calculate from actual data
              },
            });
          }
        }

        // Load strength data
        const strengthResponse = await fetch(
          `/api/analytics?timeframe=${selectedTimeframe}${athleteId ? `&athleteId=${athleteId}` : ""}&type=strength`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (strengthResponse.ok) {
          const strengthData = await strengthResponse.json();
          if (strengthData.success) {
            setAnalyticsData((prev) =>
              prev
                ? {
                    ...prev,
                    strengthProgress: strengthData.data.strength || [],
                  }
                : {
                    strengthProgress: strengthData.data.strength || [],
                    workoutFrequency: [],
                    exerciseComparison: {},
                    weeklyGoals: {},
                    overviewStats: {
                      totalWorkouts: 0,
                      avgWorkoutsPerWeek: 0,
                      consistencyScore: 0,
                      avgImprovement: 0,
                    },
                  }
            );
          }
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
        // Set fallback data
        setAnalyticsData({
          strengthProgress: [],
          workoutFrequency: [],
          exerciseComparison: {},
          weeklyGoals: {},
          overviewStats: {
            totalWorkouts: 0,
            avgWorkoutsPerWeek: 0,
            consistencyScore: 0,
            avgImprovement: 0,
          },
        });
      }
    };

    loadAnalyticsData();
  }, [athleteId, selectedTimeframe]);

  // Prepare volume trend data
  const volumeData = useMemo(() => {
    if (!analyticsData?.strengthProgress) return [];

    const weeklyVolume = new Map<string, number>();

    analyticsData.strengthProgress.forEach((exercise) => {
      exercise.data?.forEach((entry) => {
        const entryDate = new Date(entry.date);
        const week = `Week ${Math.ceil(entryDate.getDate() / 7)}`;
        const volume = entry.volume || 0;
        weeklyVolume.set(week, (weeklyVolume.get(week) || 0) + volume);
      });
    });

    return Array.from(weeklyVolume.entries()).map(([week, volume]) => ({
      week,
      volume: Math.round(volume),
    }));
  }, [analyticsData]);

  // Prepare chart data
  const strengthProgressData = useMemo(() => {
    if (!analyticsData?.strengthProgress) return [];

    return analyticsData.strengthProgress.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      data:
        exercise.data
          ?.map((entry) => ({
            date: new Date(entry.date).toLocaleDateString(),
            oneRepMax: entry.estimated1RM,
            weight: entry.weight,
            reps: entry.reps,
            volume: entry.volume,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ) || [],
    }));
  }, [analyticsData]);

  // Filtered strength progress data based on selected exercise
  const filteredStrengthData = useMemo(() => {
    if (selectedExercise === "all") return strengthProgressData;
    return strengthProgressData.filter(
      (ex) => ex.exerciseId === selectedExercise
    );
  }, [strengthProgressData, selectedExercise]);

  const workoutFrequencyData = useMemo(() => {
    return analyticsData?.workoutFrequency || [];
  }, [analyticsData]);

  // Overview stats
  const overviewStats = useMemo(() => {
    const totalWorkouts = workoutFrequencyData.reduce(
      (sum: number, week: WorkoutFrequencyData) => sum + week.workouts,
      0
    );
    const avgWorkoutsPerWeek = totalWorkouts / workoutFrequencyData.length;
    const consistencyScore =
      workoutFrequencyData.reduce(
        (sum: number, week: WorkoutFrequencyData) =>
          sum + (week.workouts / week.goal) * 100,
        0
      ) / workoutFrequencyData.length;

    return {
      totalWorkouts: Math.round(totalWorkouts),
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
      consistencyScore: Math.round(consistencyScore),
      avgImprovement: 8.5,
    };
  }, [workoutFrequencyData]);

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Enhanced mobile header */}
      <div className="flex flex-col gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-heading-primary text-3xl sm:text-2xl mb-3 font-bold flex items-center gap-3 justify-center sm:justify-start">
            <BarChart3 className="w-8 h-8" /> Progress Analytics
          </h1>
          <p className="text-heading-secondary leading-relaxed">
            Track progress, strength gains, and workout consistency
          </p>
        </div>

        {/* Mobile-optimized controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Enhanced time range selector */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(["1m", "3m", "6m", "1y"] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`flex-1 px-4 py-3 sm:px-3 sm:py-2 rounded-lg text-base sm:text-sm font-medium transition-all touch-manipulation ${
                  selectedTimeframe === timeframe
                    ? "bg-white text-accent-blue shadow-md"
                    : "text-heading-secondary hover:text-heading-primary"
                }`}
              >
                {timeframe.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            leftIcon={<Download className="w-5 h-5 sm:w-4 sm:h-4" />}
            className="py-3 sm:py-2 rounded-xl sm:rounded-lg font-medium"
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Enhanced mobile view mode tabs */}
      <div className="grid grid-cols-2 sm:flex gap-1 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setViewMode("overview")}
          className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
            viewMode === "overview"
              ? "bg-white text-primary-600 shadow-md"
              : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" /> Overview
        </button>
        <button
          onClick={() => setViewMode("strength")}
          className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
            viewMode === "strength"
              ? "bg-white text-primary-600 shadow-md"
              : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
          }`}
        >
          <Dumbbell className="w-4 h-4 inline mr-2" /> Strength
        </button>
        <button
          onClick={() => setViewMode("comparison")}
          className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
            viewMode === "comparison"
              ? "bg-white text-primary-600 shadow-md"
              : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" /> Compare
        </button>
        <button
          onClick={() => setViewMode("goals")}
          className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all touch-manipulation ${
            viewMode === "goals"
              ? "bg-white text-primary-600 shadow-md"
              : "text-gray-600 hover:text-primary-600 hover:bg-white/50"
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" /> Goals
        </button>
      </div>

      {/* Overview Stats */}
      {viewMode === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-[1.02] transition-all touch-manipulation border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Workouts
                  </p>
                  <p className="text-gray-900 text-3xl sm:text-2xl font-bold mt-1">
                    {overviewStats.totalWorkouts}
                  </p>
                </div>
                <div className="p-3 rounded-xl text-blue-600 bg-linear-to-br from-blue-50 to-blue-100">
                  <Dumbbell className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-[1.02] transition-all touch-manipulation border-l-4 border-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Avg per Week
                  </p>
                  <p className="text-gray-900 text-3xl sm:text-2xl font-bold mt-1">
                    {overviewStats.avgWorkoutsPerWeek || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl text-green-600 bg-linear-to-br from-green-50 to-green-100">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-[1.02] transition-all touch-manipulation border-l-4 border-orange-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Consistency
                  </p>
                  <p className="text-gray-900 text-3xl sm:text-2xl font-bold mt-1">
                    {overviewStats.consistencyScore}
                    <span className="text-lg text-gray-600 ml-1">%</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl text-orange-600 bg-linear-to-br from-orange-50 to-orange-100">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:scale-[1.02] transition-all touch-manipulation border-l-4 border-purple-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Avg Improvement
                  </p>
                  <p className="text-gray-900 text-3xl sm:text-2xl font-bold mt-1">
                    {overviewStats.avgImprovement}
                    <span className="text-lg text-gray-600 ml-1">%</span>
                  </p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.3%
                  </div>
                </div>
                <div className="p-3 rounded-xl text-purple-600 bg-linear-to-br from-purple-50 to-purple-100">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Workout Frequency Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Workout Frequency
            </h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer
                width="100%"
                height={280}
                className="touch-manipulation"
              >
                <BarChart
                  data={workoutFrequencyData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="workouts"
                    fill="#3b82f6"
                    name="Workouts"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="goal"
                    fill="#e5e7eb"
                    name="Goal"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Mobile-optimized Strength Progress */}
      {viewMode === "strength" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Exercise Selector */}
          {strengthProgressData.length > 0 && (
            <Card variant="default" padding="md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label
                  htmlFor="exercise-select"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Dumbbell className="h-4 w-4" />
                  Filter by Exercise:
                </label>
                <Select
                  id="exercise-select"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  options={[
                    { value: "all", label: "All Exercises" },
                    ...strengthProgressData.map((ex) => ({
                      value: ex.exerciseId,
                      label: ex.exerciseName,
                    })),
                  ]}
                  className="flex-1 sm:flex-initial sm:min-w-[250px]"
                />
              </div>
            </Card>
          )}

          {/* Exercise Charts */}
          {filteredStrengthData.map((exercise) => (
            <div
              key={exercise.exerciseId}
              className="bg-white rounded-xl shadow-sm p-6 sm:p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                  {exercise.exerciseName} Progress
                </h3>
              </div>

              <div className="w-full overflow-x-auto">
                <ResponsiveContainer
                  width="100%"
                  height={280}
                  className="touch-manipulation"
                >
                  <LineChart
                    data={exercise.data}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="oneRepMax"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="1RM (lbs)"
                      dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                      activeDot={{
                        r: 6,
                        fill: "#3b82f6",
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Comparison View */}
      {viewMode === "comparison" && (
        <div className="space-y-6">
          {/* Exercise Distribution */}
          <Card variant="default" padding="md">
            <h3 className="text-heading-primary text-lg font-semibold mb-4">
              Workout Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Bench Press", value: 25, fill: "#3b82f6" },
                    { name: "Squats", value: 20, fill: "#10b981" },
                    { name: "Deadlifts", value: 18, fill: "#f59e0b" },
                    { name: "Overhead Press", value: 15, fill: "#ef4444" },
                    { name: "Pull-ups", value: 12, fill: "#8b5cf6" },
                    { name: "Other", value: 10, fill: "#6b7280" },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Radar */}
          <Card variant="default" padding="md">
            <h3 className="text-heading-primary text-lg font-semibold mb-4">
              Performance Profile
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart
                data={[
                  { subject: "Strength", A: 85, fullMark: 100 },
                  { subject: "Power", A: 78, fullMark: 100 },
                  { subject: "Endurance", A: 92, fullMark: 100 },
                  { subject: "Consistency", A: 88, fullMark: 100 },
                  { subject: "Technique", A: 82, fullMark: 100 },
                  { subject: "Recovery", A: 75, fullMark: 100 },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Training Volume Trend */}
          <Card variant="default" padding="md">
            <h3 className="text-heading-primary text-lg font-semibold mb-4">
              Training Volume Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Total Volume (lbs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Goals & Achievements View */}
      {viewMode === "goals" && (
        <div className="space-y-6">
          {/* Current Goals */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary-600" />
              <h3 className="text-heading-primary text-lg font-semibold">
                Current Goals
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg p-4 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Bench Press 1RM</span>
                  <span className="text-primary-600 font-semibold">
                    225 lbs
                  </span>
                </div>
                <div className="w-full bg-surface-gray rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between text-sm text-heading-secondary mt-1">
                  <span>Current: 195 lbs</span>
                  <span>75% Complete</span>
                </div>
              </div>

              <div className="rounded-lg p-4 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Weekly Consistency</span>
                  <span className="text-primary-600 font-semibold">
                    4 workouts
                  </span>
                </div>
                <div className="w-full bg-surface-gray rounded-full h-2">
                  <div className="bg-accent-green h-2 rounded-full w-4/5"></div>
                </div>
                <div className="flex justify-between text-sm text-heading-secondary mt-1">
                  <span>This week: 3 workouts</span>
                  <span>80% Complete</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievement Badges */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-6">
              <Medal className="w-6 h-6 text-accent-orange" />
              <h3 className="text-heading-primary text-lg font-semibold">
                Recent Achievements
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-accent-orange/10 rounded-lg">
                <Award className="w-8 h-8 text-accent-orange mx-auto mb-2" />
                <p className="font-medium text-sm">First 200lb Bench</p>
                <p className="text-xs text-heading-secondary">2 days ago</p>
              </div>
              <div className="text-center p-4 bg-accent-green/10 rounded-lg">
                <Zap className="w-8 h-8 text-accent-green mx-auto mb-2" />
                <p className="font-medium text-sm">7-Day Streak</p>
                <p className="text-xs text-heading-secondary">Active</p>
              </div>
              <div className="text-center p-4 bg-accent-blue/10 rounded-lg">
                <Users className="w-8 h-8 text-accent-blue mx-auto mb-2" />
                <p className="font-medium text-sm">Top 10% Lifter</p>
                <p className="text-xs text-heading-secondary">This month</p>
              </div>
              <div className="text-center p-4 bg-purple-100 rounded-lg">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Volume Leader</p>
                <p className="text-xs text-heading-secondary">Last week</p>
              </div>
            </div>
          </Card>

          {/* Performance Insights */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-6">
              <TrendingDown className="w-6 h-6 text-primary-600" />
              <h3 className="text-heading-primary text-lg font-semibold">
                Performance Insights
              </h3>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-accent-green pl-4">
                <p className="font-medium text-accent-green">Strength Gains</p>
                <p className="text-sm text-heading-secondary">
                  Your bench press has improved 12% this month. Keep focusing on
                  progressive overload.
                </p>
              </div>
              <div className="border-l-4 border-accent-orange pl-4">
                <p className="font-medium text-accent-orange">Recovery Note</p>
                <p className="text-sm text-heading-secondary">
                  Consider adding more rest days between heavy squat sessions
                  for optimal recovery.
                </p>
              </div>
              <div className="border-l-4 border-accent-blue pl-4">
                <p className="font-medium text-accent-blue">Consistency Win</p>
                <p className="text-sm text-heading-secondary">
                  You&apos;re in the top 15% for workout consistency this
                  quarter. Great work!
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default memo(AnalyticsDashboard);
