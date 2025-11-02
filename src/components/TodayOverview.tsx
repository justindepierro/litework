"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";

interface TodayWorkout {
  id: string;
  workoutName: string;
  groupName: string;
  athleteCount: number;
  completedCount: number;
  startTime: string;
  endTime: string;
}

export default function TodayOverview() {
  const [todayWorkouts, setTodayWorkouts] = useState<TodayWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayWorkouts();
  }, []);

  const fetchTodayWorkouts = async () => {
    try {
      const response = await fetch('/api/analytics/today-schedule');
      const data = await response.json();

      if (data.success) {
        setTodayWorkouts(data.workouts || []);
      }
    } catch (error) {
      console.error("Error fetching today's workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Today&apos;s Schedule</h2>
      </div>

      {todayWorkouts.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No workouts scheduled for today</p>
          <p className="text-sm text-gray-500 mt-1">
            Assign workouts from the calendar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayWorkouts.map((workout) => {
            const rate = completionRate(
              workout.completedCount,
              workout.athleteCount
            );
            return (
              <div
                key={workout.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {workout.workoutName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{workout.groupName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {workout.startTime} - {workout.endTime}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">
                      {workout.completedCount}/{workout.athleteCount} athletes (
                      {rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        rate === 100
                          ? "bg-green-500"
                          : rate >= 50
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>

                {rate === 100 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">All athletes completed!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
