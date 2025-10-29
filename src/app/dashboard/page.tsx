"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container-responsive section-spacing min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-heading-primary text-2xl mb-6 sm:text-3xl">
          Welcome back, <span className="text-heading-accent">{user.name}</span>
          !
        </h1>

        {/* Quick Stats - Mobile First Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card-stat">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-accent-orange bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="workout-accent-strength text-lg">💪</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small">This Week</dt>
                <dd className="text-heading-primary text-2xl">3 workouts</dd>
              </div>
            </div>
          </div>

          <div className="card-stat">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-accent-green bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="workout-accent-progress text-lg">🏆</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small">Personal Records</dt>
                <dd className="text-heading-primary text-2xl">12</dd>
              </div>
            </div>
          </div>

          <div className="card-stat sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-accent-purple bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="workout-accent-achievement text-lg">🔥</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small">Streak Days</dt>
                <dd className="text-heading-primary text-2xl">7</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Workouts for Members */}
        {user.role === "member" && (
          <div className="mb-8">
            <h2 className="text-heading-secondary text-xl mb-4">
              📋 Your Assigned Workouts
            </h2>
            <div className="space-y-4">
              <div className="card-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-heading-secondary text-lg">
                      Upper Body Strength
                    </h3>
                    <p className="text-body-secondary text-sm mt-1">
                      Scheduled for today • 45 minutes • 4 exercises
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-body-small px-2 py-1 bg-accent-green/10 text-accent-green rounded">
                        Ready to Start
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-small mb-2">Progress</div>
                    <div className="text-heading-primary text-lg">0%</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-body-small text-navy-600 mb-1">Exercises:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="bg-silver-100 px-2 py-1 rounded">3×10 Bench Press (75%)</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">3×10 Shoulder Shrug</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">3×8 Tricep Extension</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">10 Jump Squats</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/workouts/view/session-1"
                    className="btn-secondary flex-1 text-sm"
                  >
                    👀 View Details
                  </Link>
                  <Link
                    href="/workouts/live/session-1"
                    className="btn-primary flex-1 text-sm"
                  >
                    🚀 Start Live
                  </Link>
                </div>
              </div>

              <div className="card-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-heading-secondary text-lg">
                      Lower Body Power
                    </h3>
                    <p className="text-body-secondary text-sm mt-1">
                      Scheduled for tomorrow • 60 minutes • 6 exercises
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-body-small px-2 py-1 bg-silver-300 text-navy-600 rounded">
                        Upcoming
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-small mb-2">Progress</div>
                    <div className="text-heading-primary text-lg">-</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-body-small text-navy-600 mb-1">Exercises:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="bg-silver-100 px-2 py-1 rounded">5×5 Squats (80%)</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">3×8 Deadlifts</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">3×12 Leg Press</span>
                    <span className="bg-silver-100 px-2 py-1 rounded">+ 3 more</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/workouts/view/session-2"
                    className="btn-secondary flex-1 text-sm"
                  >
                    👀 View Details
                  </Link>
                  <button
                    disabled
                    className="btn-secondary flex-1 text-sm opacity-50 cursor-not-allowed"
                  >
                    ⏳ Not Ready
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity - Mobile Optimized */}
        <div className="mb-8">
          <h2 className="text-heading-secondary text-xl mb-4">
            Recent Activity
          </h2>
          <div className="card-primary overflow-hidden">
            <div className="divide-y divide-silver-300">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-body-primary text-sm font-medium mb-1">
                      <span className="workout-accent-progress">💪</span>{" "}
                      Completed: Upper Body Strength
                    </div>
                    <div className="text-body-small">
                      3 sets × 8 reps Bench Press at 185 lbs
                    </div>
                  </div>
                  <div className="text-xs text-silver-600 whitespace-nowrap ml-2">
                    2h ago
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-body-primary text-sm font-medium mb-1">
                      <span className="workout-accent-warning">🏆</span> New
                      Personal Record: Deadlift
                    </div>
                    <div className="text-body-small">
                      You lifted 315 lbs - that&apos;s 25 lbs more than your
                      previous best!
                    </div>
                  </div>
                  <div className="text-xs text-silver-600 whitespace-nowrap ml-2">
                    Yesterday
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Workouts - Mobile Optimized */}
        {user.role === "member" && (
          <div>
            <h2 className="text-heading-secondary text-xl mb-4">
              Upcoming Workouts
            </h2>
            <div className="card-primary overflow-hidden">
              <div className="divide-y divide-silver-300">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-body-primary text-sm font-medium mb-1">
                        <span className="workout-accent-schedule">🦵</span>{" "}
                        Lower Body Power
                      </div>
                      <div className="text-body-small">
                        Squats, Deadlifts, Leg Press
                      </div>
                    </div>
                    <div className="text-body-small whitespace-nowrap ml-2">
                      Tomorrow 3:00 PM
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-body-primary text-sm font-medium mb-1">
                        <span className="workout-accent-strength">💪</span>{" "}
                        Upper Body Hypertrophy
                      </div>
                      <div className="text-body-small">
                        Bench Press, Rows, Shoulder Press
                      </div>
                    </div>
                    <div className="text-body-small whitespace-nowrap ml-2">
                      Friday 3:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Mobile FAB Style */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/workout/new"
            className="flex items-center justify-center w-14 h-14 bg-accent-orange hover:bg-accent-orange text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ filter: "brightness(0.9)" }}
          >
            <span className="text-xl font-bold">+</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
