"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProgressPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");

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

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-heading-primary text-3xl">Progress Tracking</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTimeRange("week")}
              className={
                selectedTimeRange === "week" ? "btn-primary" : "btn-secondary"
              }
            >
              Week
            </button>
            <button
              onClick={() => setSelectedTimeRange("month")}
              className={
                selectedTimeRange === "month" ? "btn-primary" : "btn-secondary"
              }
            >
              Month
            </button>
            <button
              onClick={() => setSelectedTimeRange("year")}
              className={
                selectedTimeRange === "year" ? "btn-primary" : "btn-secondary"
              }
            >
              Year
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-stat">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-orange bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="workout-accent-strength text-2xl">💪</span>
              </div>
              <div className="text-heading-primary text-2xl font-bold">
                185 lbs
              </div>
              <div className="text-body-small">Bench Press PR</div>
              <div className="text-accent-green text-sm">
                +10 lbs this month
              </div>
            </div>
          </div>

          <div className="card-stat">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="workout-accent-progress text-2xl">📈</span>
              </div>
              <div className="text-heading-primary text-2xl font-bold">24</div>
              <div className="text-body-small">Workouts Completed</div>
              <div className="text-accent-green text-sm">+6 this month</div>
            </div>
          </div>

          <div className="card-stat">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="workout-accent-achievement text-2xl">🏆</span>
              </div>
              <div className="text-heading-primary text-2xl font-bold">7</div>
              <div className="text-body-small">Personal Records</div>
              <div className="text-accent-green text-sm">+2 this month</div>
            </div>
          </div>

          <div className="card-stat">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-pink bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="workout-accent-motivation text-2xl">🔥</span>
              </div>
              <div className="text-heading-primary text-2xl font-bold">12</div>
              <div className="text-body-small">Day Streak</div>
              <div className="text-accent-green text-sm">Keep it up!</div>
            </div>
          </div>
        </div>

        {/* Recent PRs */}
        <div className="card-primary mb-8">
          <h2 className="text-heading-secondary text-xl mb-4">
            Recent Personal Records
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent-orange bg-opacity-5 rounded-lg border border-accent-orange border-opacity-20">
              <div className="flex items-center">
                <span className="workout-accent-strength text-2xl mr-3">
                  💪
                </span>
                <div>
                  <h3 className="text-body-primary font-medium">Bench Press</h3>
                  <p className="text-body-small">Previous: 175 lbs</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-heading-primary text-xl font-bold">
                  185 lbs
                </div>
                <div className="text-accent-green text-sm">+10 lbs</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent-blue bg-opacity-5 rounded-lg border border-accent-blue border-opacity-20">
              <div className="flex items-center">
                <span className="workout-accent-schedule text-2xl mr-3">
                  🦵
                </span>
                <div>
                  <h3 className="text-body-primary font-medium">Squat</h3>
                  <p className="text-body-small">Previous: 225 lbs</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-heading-primary text-xl font-bold">
                  235 lbs
                </div>
                <div className="text-accent-green text-sm">+10 lbs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="card-primary">
          <h2 className="text-heading-secondary text-xl mb-4">
            Strength Progress Chart
          </h2>
          <div className="h-64 bg-silver-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="workout-accent-progress text-4xl mb-2 block">
                📊
              </span>
              <p className="text-body-secondary">
                Interactive progress charts coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
