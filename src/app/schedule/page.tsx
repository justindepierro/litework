"use client";

import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useState, useEffect } from "react";
import { Calendar, Settings, BarChart3, Clock, Users } from "lucide-react";
import { WorkoutAssignment } from "@/types";

export default function SchedulePage() {
  const { user, isLoading } = useRequireAuth();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, currentWeek]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await fetch("/api/assignments");
      const data = await response.json();

      if (data.success) {
        setAssignments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

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

  // Get start of current week
  const getWeekStart = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + currentWeek * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const weekStart = getWeekStart();

  // Get assignments for each day
  const getAssignmentsForDay = (dayIndex: number) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    
    return assignments.filter(assignment => {
      const scheduledDate = new Date(assignment.scheduledDate);
      return (
        scheduledDate.getFullYear() === dayDate.getFullYear() &&
        scheduledDate.getMonth() === dayDate.getMonth() &&
        scheduledDate.getDate() === dayDate.getDate()
      );
    });
  };

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
          {days.map((day, index) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + index);
            const dayAssignments = getAssignmentsForDay(index);
            const isToday =
              dayDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={day}
                className={`bg-white rounded-xl shadow-sm border ${
                  isToday ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"
                } p-6 min-h-48 hover:shadow-md transition-shadow`}
              >
                <div className="text-center border-b border-gray-200 pb-3 mb-4">
                  <h3 className="text-gray-700 text-lg font-semibold">
                    {day}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {dayDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {isToday && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {loadingAssignments ? (
                  <div className="space-y-2">
                    <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ) : dayAssignments.length === 0 ? (
                  <div className="text-center text-body-small py-4 text-silver-600">
                    No workouts
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {assignment.workoutPlanName}
                        </h4>
                        {assignment.startTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{assignment.startTime}</span>
                          </div>
                        )}
                        {assignment.athleteIds && assignment.athleteIds.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <Users className="w-3 h-3" />
                            <span>{assignment.athleteIds.length} athletes</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
