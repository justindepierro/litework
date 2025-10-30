"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Activity,
  Calendar,
  Settings,
  BarChart3,
  Zap,
} from "lucide-react";

export default function SchedulePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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
            <h1 className="text-heading-primary text-3xl sm:text-2xl font-bold">Weekly Schedule</h1>
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
          {days.map((day, index) => (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-48 hover:shadow-md transition-shadow">
              <h3 className="text-gray-700 text-lg font-semibold mb-4 text-center border-b border-gray-200 pb-3">
                {day}
              </h3>

              {index === 1 && ( // Tuesday
                <div className="space-y-2">
                  <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200 touch-manipulation">
                    <div className="text-orange-700 text-sm font-bold mb-2 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" /> Upper Body
                    </div>
                    <div className="text-gray-600 text-sm">6:00 PM - 7:30 PM</div>
                  </div>
                </div>
              )}

              {index === 3 && ( // Thursday
                <div className="space-y-2">
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 touch-manipulation">
                    <div className="text-blue-700 text-sm font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Lower
                      Body
                    </div>
                    <div className="text-body-small">6:00 PM - 7:30 PM</div>
                  </div>
                </div>
              )}

              {index === 5 && ( // Saturday
                <div className="space-y-2">
                  <div className="p-3 bg-accent-green bg-opacity-10 rounded-lg border border-accent-green border-opacity-20">
                    <div className="text-body-primary text-sm font-medium mb-1 flex items-center gap-1">
                      <Activity className="w-4 h-4 text-accent-green" />
                      Conditioning
                    </div>
                    <div className="text-body-small">10:00 AM - 11:00 AM</div>
                  </div>
                </div>
              )}

              {![1, 3, 5].includes(index) && (
                <div className="text-center text-body-small py-8 text-silver-600">
                  Rest Day
                </div>
              )}
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
