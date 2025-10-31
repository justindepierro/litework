"use client";

import { useAnyUserGuard } from "@/hooks/use-auth-guard";
import { useState } from "react";
import {
  Calendar,
  Settings,
  BarChart3,
} from "lucide-react";

export default function SchedulePage() {
  const { user, isLoading } = useAnyUserGuard();
  const [currentWeek, setCurrentWeek] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-heading-primary text-3xl sm:text-2xl font-bold">
              Weekly Schedule
            </h1>
            <p className="text-heading-secondary text-base sm:text-sm mt-1">
              Week{" "}
              {currentWeek === 0
                ? "Current"
                : currentWeek > 0
                  ? `+${currentWeek}`
                  : currentWeek}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setCurrentWeek((prev) => prev - 1)}
              className="flex-1 sm:flex-none btn-secondary py-3 px-4 rounded-xl font-medium touch-manipulation"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentWeek((prev) => prev + 1)}
              className="flex-1 sm:flex-none btn-secondary py-3 px-4 rounded-xl font-medium touch-manipulation"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {days.map((day) => (
            <div
              key={day}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-48 hover:shadow-md transition-shadow"
            >
              <h3 className="text-gray-700 text-lg font-semibold mb-4 text-center border-b border-gray-200 pb-3">
                {day}
              </h3>

              {/* No scheduled workouts - will be loaded from API */}
              <div className="text-center text-body-small py-8 text-silver-600">
                No workouts scheduled
              </div>
            </div>
          ))}
        </div>

        {user.role !== "athlete" && (
          <div className="mt-8 card-primary">
            <h2 className="text-heading-secondary text-xl mb-4">
              Schedule Management
            </h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Add Workout
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Edit Schedule
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
