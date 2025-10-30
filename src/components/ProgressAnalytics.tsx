"use client";

import { useState, useMemo } from "react";
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
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Target,
  Trophy,
  Calendar,
  Dumbbell,
  BarChart3,
  Download,
  Medal,
  Users,
  Zap,
  Award,
  Activity,
  TrendingDown,
} from "lucide-react";
import { mockProgressData, mockAnalytics } from "@/lib/analytics-data";

interface AnalyticsDashboardProps {
  athleteId?: string;
}

interface ChartDataPoint {
  date: string;
  oneRepMax?: number;
  weight: number;
  reps: number;
  volume: number;
}

export default function AnalyticsDashboard({
  athleteId,
}: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1m" | "3m" | "6m" | "1y"
  >("3m");
  const [viewMode, setViewMode] = useState<"overview" | "strength" | "comparison" | "goals">("overview");

  // Filter data based on timeframe
  const filteredProgressData = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (selectedTimeframe) {
      case "1m":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    let data = mockProgressData.filter((entry) => entry.date >= cutoff);

    if (athleteId) {
      data = data.filter((entry) => entry.userId === athleteId);
    }

    return data;
  }, [selectedTimeframe, athleteId]);

  // Prepare volume trend data
  const volumeData = useMemo(() => {
    const weeklyVolume = new Map<string, number>();
    
    filteredProgressData.forEach((entry) => {
      const week = `Week ${Math.ceil(entry.date.getDate() / 7)}`;
      // Estimate volume using weight * reps (assuming 3 sets average)
      const volume = entry.weight * entry.reps * 3;
      weeklyVolume.set(week, (weeklyVolume.get(week) || 0) + volume);
    });

    return Array.from(weeklyVolume.entries()).map(([week, volume]) => ({
      week,
      volume: Math.round(volume),
    }));
  }, [filteredProgressData]);

  // Prepare chart data
  const strengthProgressData = useMemo(() => {
    const exerciseData = new Map<string, ChartDataPoint[]>();

    filteredProgressData.forEach((entry) => {
      const key = entry.exerciseId;
      if (!exerciseData.has(key)) {
        exerciseData.set(key, []);
      }
      exerciseData.get(key)!.push({
        date: entry.date.toLocaleDateString(),
        oneRepMax: entry.oneRepMax,
        weight: entry.weight,
        reps: entry.reps,
        volume: entry.weight * entry.reps,
      });
    });

    return Array.from(exerciseData.entries()).map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: getExerciseName(exerciseId as string),
      data: data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));
  }, [filteredProgressData]);

  const workoutFrequencyData = mockAnalytics.workoutFrequency;

  // Overview stats
  const overviewStats = useMemo(() => {
    const totalWorkouts = workoutFrequencyData.reduce(
      (sum, week) => sum + week.workouts,
      0
    );
    const avgWorkoutsPerWeek = totalWorkouts / workoutFrequencyData.length;
    const consistencyScore =
      workoutFrequencyData.reduce(
        (sum, week) => sum + (week.workouts / week.goal) * 100,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-heading-primary text-3xl mb-2">
            Progress Analytics
          </h1>
          <p className="text-heading-secondary">
            Track progress, strength gains, and workout consistency
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-color-silver-100 rounded-lg p-1">
            {(["1m", "3m", "6m", "1y"] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? "bg-white text-accent-blue shadow-sm"
                    : "text-heading-secondary hover:text-heading-primary"
                }`}
              >
                {timeframe.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 mb-6 bg-surface-gray rounded-lg p-1">
        <button
          onClick={() => setViewMode("overview")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "overview"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-surface-gray-dark hover:text-primary-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode("strength")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "strength"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-surface-gray-dark hover:text-primary-600"
          }`}
        >
          Strength
        </button>
        <button
          onClick={() => setViewMode("comparison")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "comparison"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-surface-gray-dark hover:text-primary-600"
          }`}
        >
          Comparison
        </button>
        <button
          onClick={() => setViewMode("goals")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "goals"
              ? "bg-white text-primary-600 shadow-sm"
              : "text-surface-gray-dark hover:text-primary-600"
          }`}
        >
          Goals & Achievements
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-color-silver-100 rounded-lg p-1">
        {[
          { key: "overview", label: "Overview", icon: BarChart3 },
          { key: "strength", label: "Strength", icon: Dumbbell },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as "overview" | "strength")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === key
                ? "bg-white text-accent-blue shadow-sm"
                : "text-heading-secondary hover:text-heading-primary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      {viewMode === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-heading-secondary text-sm">
                    Total Workouts
                  </p>
                  <p className="text-heading-primary text-2xl font-semibold">
                    {overviewStats.totalWorkouts}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-accent-blue bg-accent-blue/10">
                  <Dumbbell className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-heading-secondary text-sm">Avg per Week</p>
                  <p className="text-heading-primary text-2xl font-semibold">
                    {overviewStats.avgWorkoutsPerWeek}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-accent-green bg-accent-green/10">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-heading-secondary text-sm">Consistency</p>
                  <p className="text-heading-primary text-2xl font-semibold">
                    {overviewStats.consistencyScore}
                    <span className="text-lg text-heading-secondary ml-1">
                      %
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-lg text-accent-orange bg-accent-orange/10">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="card-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-heading-secondary text-sm">
                    Avg Improvement
                  </p>
                  <p className="text-heading-primary text-2xl font-semibold">
                    {overviewStats.avgImprovement}
                    <span className="text-lg text-heading-secondary ml-1">
                      %
                    </span>
                  </p>
                  <div className="flex items-center mt-2 text-sm text-accent-green">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.3%
                  </div>
                </div>
                <div className="p-3 rounded-lg text-purple-600 bg-purple-100">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Workout Frequency Chart */}
          <div className="card-primary">
            <h3 className="text-heading-primary text-lg font-semibold mb-4">
              Workout Frequency
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workouts" fill="#3b82f6" name="Workouts" />
                <Bar dataKey="goal" fill="#e5e7eb" name="Goal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Strength Progress */}
      {viewMode === "strength" && (
        <div className="space-y-6">
          {strengthProgressData.map((exercise) => (
            <div key={exercise.exerciseId} className="card-primary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-heading-primary text-lg font-semibold">
                  {exercise.exerciseName} Progress
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={exercise.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="oneRepMax"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="1RM (lbs)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Performance Comparison View */}
      {viewMode === "comparison" && (
        <div className="space-y-6">
          {/* Exercise Distribution */}
          <div className="card-primary">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Radar */}
          <div className="card-primary">
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
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Training Volume Trend */}
          <div className="card-primary">
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
          </div>
        </div>
      )}

      {/* Goals & Achievements View */}
      {viewMode === "goals" && (
        <div className="space-y-6">
          {/* Current Goals */}
          <div className="card-primary">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary-600" />
              <h3 className="text-heading-primary text-lg font-semibold">
                Current Goals
              </h3>
            </div>
            <div className="space-y-4">
              <div className="border border-surface-border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Bench Press 1RM</span>
                  <span className="text-primary-600 font-semibold">225 lbs</span>
                </div>
                <div className="w-full bg-surface-gray rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between text-sm text-heading-secondary mt-1">
                  <span>Current: 195 lbs</span>
                  <span>75% Complete</span>
                </div>
              </div>

              <div className="border border-surface-border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Weekly Consistency</span>
                  <span className="text-primary-600 font-semibold">4 workouts</span>
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
          </div>

          {/* Achievement Badges */}
          <div className="card-primary">
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
          </div>

          {/* Performance Insights */}
          <div className="card-primary">
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
                  Your bench press has improved 12% this month. Keep focusing on progressive overload.
                </p>
              </div>
              <div className="border-l-4 border-accent-orange pl-4">
                <p className="font-medium text-accent-orange">Recovery Note</p>
                <p className="text-sm text-heading-secondary">
                  Consider adding more rest days between heavy squat sessions for optimal recovery.
                </p>
              </div>
              <div className="border-l-4 border-accent-blue pl-4">
                <p className="font-medium text-accent-blue">Consistency Win</p>
                <p className="text-sm text-heading-secondary">
                  You&apos;re in the top 15% for workout consistency this quarter. Great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get exercise name from ID
function getExerciseName(exerciseId: string): string {
  const exerciseNames: Record<string, string> = {
    "1": "Bench Press",
    "2": "Squats",
    "3": "Deadlifts",
    "4": "Overhead Press",
    "5": "Pull-ups",
  };
  return exerciseNames[exerciseId] || `Exercise ${exerciseId}`;
}
