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
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-heading-primary text-3xl">Weekly Schedule</h1>
            <p className="text-heading-secondary text-sm">
              Week{" "}
              {currentWeek === 0
                ? "Current"
                : currentWeek > 0
                  ? `+${currentWeek}`
                  : currentWeek}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentWeek((prev) => prev - 1)}
              className="btn-secondary"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentWeek((prev) => prev + 1)}
              className="btn-secondary"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {days.map((day, index) => (
            <div key={day} className="card-primary min-h-48">
              <h3 className="text-heading-secondary text-lg mb-4 text-center border-b border-silver-300 pb-2">
                {day}
              </h3>

              {index === 1 && ( // Tuesday
                <div className="space-y-2">
                  <div className="p-3 bg-accent-orange bg-opacity-10 rounded-lg border border-accent-orange border-opacity-20">
                    <div className="text-body-primary text-sm font-medium mb-1 flex items-center gap-1">
                      <Dumbbell className="w-4 h-4 text-accent-orange" /> Upper
                      Body
                    </div>
                    <div className="text-body-small">6:00 PM - 7:30 PM</div>
                  </div>
                </div>
              )}

              {index === 3 && ( // Thursday
                <div className="space-y-2">
                  <div className="p-3 bg-accent-blue bg-opacity-10 rounded-lg border border-accent-blue border-opacity-20">
                    <div className="text-body-primary text-sm font-medium mb-1">
                      <span className="workout-accent-schedule">🦵</span> Lower
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
