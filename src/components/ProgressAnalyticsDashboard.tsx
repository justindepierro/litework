"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  BarChart3,
  Target,
  Calendar,
  Award,
  Users,
  Zap,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";

// Mock data - in real app, this would come from API
const mockProgressData = [
  {
    date: "2024-10-01",
    exercise: "Bench Press",
    weight: 185,
    reps: 8,
    sets: 3,
    volume: 4440,
    oneRepMax: 231,
    athleteId: "athlete1",
  },
  {
    date: "2024-10-05",
    exercise: "Bench Press",
    weight: 190,
    reps: 8,
    sets: 3,
    volume: 4560,
    oneRepMax: 237,
    athleteId: "athlete1",
  },
  {
    date: "2024-10-10",
    exercise: "Bench Press",
    weight: 195,
    reps: 8,
    sets: 3,
    volume: 4680,
    oneRepMax: 244,
    athleteId: "athlete1",
  },
  {
    date: "2024-10-15",
    exercise: "Squats",
    weight: 225,
    reps: 10,
    sets: 3,
    volume: 6750,
    oneRepMax: 300,
    athleteId: "athlete2",
  },
  {
    date: "2024-10-20",
    exercise: "Squats",
    weight: 235,
    reps: 10,
    sets: 3,
    volume: 7050,
    oneRepMax: 313,
    athleteId: "athlete2",
  },
  {
    date: "2024-10-25",
    exercise: "Deadlift",
    weight: 275,
    reps: 5,
    sets: 3,
    volume: 4125,
    oneRepMax: 309,
    athleteId: "athlete1",
  },
];

interface AnalyticsSummary {
  totalWorkouts: number;
  totalVolume: number;
  strengthGain: number;
  consistencyScore: number;
  topExercises: Array<{
    name: string;
    sessions: number;
    improvement: number;
  }>;
}

export default function ProgressAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedAthlete, setSelectedAthlete] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("strength");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in real app, this would come from API

  const analyticsSummary: AnalyticsSummary = {
    totalWorkouts: 24,
    totalVolume: 45680,
    strengthGain: 15.2,
    consistencyScore: 87,
    topExercises: [
      { name: "Bench Press", sessions: 8, improvement: 12.5 },
      { name: "Squats", sessions: 7, improvement: 18.3 },
      { name: "Deadlift", sessions: 6, improvement: 9.7 },
    ],
  };

  const chartData = useMemo(() => {
    // Process data based on selected filters
    const filtered = mockProgressData.filter((data) => {
      // Apply time range filter
      const dataDate = new Date(data.date);
      const now = new Date();
      const daysAgo = parseInt(timeRange.replace("d", ""));
      const cutoffDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );

      if (dataDate < cutoffDate) return false;

      // Apply athlete filter
      if (selectedAthlete !== "all" && data.athleteId !== selectedAthlete) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [timeRange, selectedAthlete]);

  const exportData = () => {
    const csv = [
      ["Date", "Exercise", "Weight", "Reps", "Sets", "Volume", "1RM"],
      ...chartData.map((row) => [
        row.date,
        row.exercise,
        row.weight,
        row.reps,
        row.sets,
        row.volume,
        row.oneRepMax,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress-analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progress Analytics
          </h1>
          <p className="text-gray-600">
            Track strength gains, volume, and performance trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="365d">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Athlete
              </label>
              <select
                value={selectedAthlete}
                onChange={(e) => setSelectedAthlete(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Athletes</option>
                <option value="john-doe">John Doe</option>
                <option value="jane-smith">Jane Smith</option>
                <option value="mike-wilson">Mike Wilson</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="strength">Strength (1RM)</option>
                <option value="volume">Volume</option>
                <option value="frequency">Frequency</option>
                <option value="consistency">Consistency</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Workouts</h3>
              <p className="text-sm text-gray-600">This period</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {analyticsSummary.totalWorkouts}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Volume</h3>
              <p className="text-sm text-gray-600">Pounds lifted</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {analyticsSummary.totalVolume.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+8.3%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Strength Gain</h3>
              <p className="text-sm text-gray-600">Average 1RM increase</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            +{analyticsSummary.strengthGain}%
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Consistency</h3>
              <p className="text-sm text-gray-600">Workout adherence</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {analyticsSummary.consistencyScore}%
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">+5%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Progression Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Strength Progression
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">
                Shows 1RM progression over time
              </p>
            </div>
          </div>
        </div>

        {/* Volume Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Volume Trends
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">
                Shows total volume over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Exercises Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Top Exercises</h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Exercise
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Sessions
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Improvement
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsSummary.topExercises.map((exercise, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {exercise.name}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {exercise.sessions}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-green-600 font-medium">
                      +{exercise.improvement}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Improving
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <Users className="w-5 h-5 text-blue-500" />
        </div>

        <div className="space-y-4">
          {chartData.slice(-5).map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {activity.exercise}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.weight}lbs × {activity.reps} × {activity.sets} ={" "}
                  {activity.volume.toLocaleString()} total lbs
                </div>
              </div>
              <div className="text-sm text-gray-500">{activity.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
