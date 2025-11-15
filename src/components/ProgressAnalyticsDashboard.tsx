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
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Heading, Body } from "@/components/ui/Typography";

// Progress data - will be loaded from API
const mockProgressData: Array<{
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  oneRepMax: number;
  athleteId: string;
}> = [];

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

  // Analytics summary - will be calculated from real data
  const analyticsSummary: AnalyticsSummary = {
    totalWorkouts: 0,
    totalVolume: 0,
    strengthGain: 0,
    consistencyScore: 0,
    topExercises: [],
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
          <Heading level="h1" className="mb-2">
            Progress Analytics
          </Heading>
          <Body variant="secondary">
            Track strength gains, volume, and performance trends
          </Body>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-silver-200 transition-colors shadow-sm hover:shadow-md"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-silver-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Time Range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 3 months" },
                { value: "365d", label: "Last year" },
              ]}
            />

            <Select
              label="Athlete"
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              options={[
                { value: "all", label: "All Athletes" },
                { value: "john-doe", label: "John Doe" },
                { value: "jane-smith", label: "Jane Smith" },
                { value: "mike-wilson", label: "Mike Wilson" },
              ]}
            />

            <Select
              label="Metric"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              options={[
                { value: "strength", label: "Strength (1RM)" },
                { value: "volume", label: "Volume" },
                { value: "frequency", label: "Frequency" },
                { value: "consistency", label: "Consistency" },
              ]}
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-lighter rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Heading level="h3">Total Workouts</Heading>
              <p className="text-sm text-body-secondary">This period</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-heading-primary mb-2">
            {analyticsSummary.totalWorkouts}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">+12%</span>
            <span className="text-caption-muted">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-heading-primary">
                Total Volume
              </h3>
              <p className="text-sm text-body-secondary">Pounds lifted</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-heading-primary mb-2">
            {analyticsSummary.totalVolume.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">+8.3%</span>
            <span className="text-caption-muted">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-heading-primary">
                Strength Gain
              </h3>
              <p className="text-sm text-body-secondary">
                Average 1RM increase
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold text-heading-primary mb-2">
            +{analyticsSummary.strengthGain}%
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">+2.1%</span>
            <span className="text-caption-muted">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning-light rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-heading-primary">
                Consistency
              </h3>
              <p className="text-sm text-body-secondary">Workout adherence</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-heading-primary mb-2">
            {analyticsSummary.consistencyScore}%
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-medium">+5%</span>
            <span className="text-caption-muted">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Progression Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-heading-primary mb-4">
            Strength Progression
          </h3>
          <div className="h-64 bg-silver-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-steel-400 mx-auto mb-2" />
              <p className="text-caption-muted">
                Chart visualization would go here
              </p>
              <p className="text-sm text-steel-400">
                Shows 1RM progression over time
              </p>
            </div>
          </div>
        </div>

        {/* Volume Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-heading-primary mb-4">
            Volume Trends
          </h3>
          <div className="h-64 bg-silver-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-steel-400 mx-auto mb-2" />
              <p className="text-caption-muted">
                Chart visualization would go here
              </p>
              <p className="text-sm text-steel-400">
                Shows total volume over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Exercises Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-heading-primary">
            Top Exercises
          </h3>
          <Award className="w-5 h-5 text-warning" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-silver-300">
                <th className="text-left py-3 px-4 font-semibold text-body-secondary">
                  Exercise
                </th>
                <th className="text-left py-3 px-4 font-semibold text-body-secondary">
                  Sessions
                </th>
                <th className="text-left py-3 px-4 font-semibold text-body-secondary">
                  Improvement
                </th>
                <th className="text-left py-3 px-4 font-semibold text-body-secondary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsSummary.topExercises.map((exercise, index) => (
                <tr
                  key={index}
                  className="border-b border-silver-300 hover:bg-silver-200 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-heading-primary">
                      {exercise.name}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-body-secondary">
                    {exercise.sessions}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-success font-medium">
                      +{exercise.improvement}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="success" size="sm">
                      Improving
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-heading-primary">
            Recent Activity
          </h3>
          <Users className="w-5 h-5 text-primary" />
        </div>

        <div className="space-y-4">
          {chartData.slice(-5).map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-silver-100 rounded-lg"
            >
              <div className="w-10 h-10 bg-primary-lighter rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-heading-primary">
                  {activity.exercise}
                </div>
                <div className="text-sm text-body-secondary">
                  {activity.weight}lbs × {activity.reps} × {activity.sets} ={" "}
                  {activity.volume.toLocaleString()} total lbs
                </div>
              </div>
              <div className="text-sm text-caption-muted">{activity.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
