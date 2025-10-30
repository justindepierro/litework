"use client";

import Link from "next/link";
import { useAnyUserGuard } from "@/hooks/use-auth-guard";
import CalendarView from "@/components/CalendarView";
import { Dumbbell, Trophy, Flame, Hand, ClipboardList, CheckCircle, Eye, Rocket, PartyPopper, Clock, TrendingUp, Calendar, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAnyUserGuard();

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
    <div className="container-responsive min-h-screen bg-gradient-primary px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced mobile-first welcome header */}
        <div className="text-center sm:text-left mb-8">
          <h1 className="text-heading-primary text-3xl sm:text-2xl mb-2 font-bold">
            Welcome back, 
          </h1>
          <p className="text-heading-accent text-2xl sm:text-xl font-bold flex items-center gap-2">
            {user.name}! <Hand className="w-6 h-6" />
          </p>
        </div>

        {/* Enhanced mobile-first stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="card-stat rounded-2xl border-2 border-orange-200 bg-orange-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-orange bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 sm:w-6 sm:h-6 text-accent-orange" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-orange-700">This Week</dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-orange-800">3 workouts</dd>
              </div>
            </div>
          </div>

          <div className="card-stat rounded-2xl border-2 border-green-200 bg-green-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-green bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 sm:w-6 sm:h-6 text-accent-green" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-green-700">Personal Records</dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-green-800">12</dd>
              </div>
            </div>
          </div>

          <div className="card-stat sm:col-span-2 lg:col-span-1 rounded-2xl border-2 border-red-200 bg-red-50 touch-manipulation hover:shadow-lg transition-all">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-14 h-14 sm:w-12 sm:h-12 bg-accent-red bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Flame className="w-7 h-7 sm:w-6 sm:h-6 text-accent-red" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-body-small font-medium text-red-700">Streak Days</dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-red-800">7</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View for Coaches */}
        {user.role === "coach" && (
          <div className="mb-8">
            <CalendarView />
          </div>
        )}

        {/* Enhanced assigned workouts for athletes */}
        {user.role === "athlete" && (
          <div className="mb-8">
            <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
              <ClipboardList className="w-6 h-6" /> Your Assigned Workouts
            </h2>
            <div className="space-y-6">
              <div className="card-primary rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-heading-secondary text-xl sm:text-lg font-bold mb-2">
                      Upper Body Strength
                    </h3>
                    <p className="text-body-secondary mb-3 leading-relaxed">
                      Scheduled for today • 45 minutes • 4 exercises
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-body-small px-3 py-2 bg-accent-green/20 text-accent-green rounded-xl font-bold border border-accent-green flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Ready to Start
                      </span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right bg-gray-50 rounded-xl p-4 min-w-[100px]">
                    <div className="text-body-small mb-1 font-medium">Progress</div>
                    <div className="text-heading-primary text-2xl sm:text-xl font-bold text-gray-600">0%</div>
                  </div>
                </div>

                {/* Enhanced exercise preview */}
                <div className="mb-6">
                  <div className="text-body-small text-navy-600 mb-3 font-medium">
                    Exercise Preview:
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    <span className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl text-sm font-medium text-orange-800">
                      3×10 Bench Press (75%)
                    </span>
                    <span className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-sm font-medium text-blue-800">
                      3×10 Shoulder Shrug
                    </span>
                    <span className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl text-sm font-medium text-purple-800">
                      3×8 Tricep Extension
                    </span>
                    <span className="bg-green-50 border border-green-200 px-3 py-2 rounded-xl text-sm font-medium text-green-800">
                      10 Jump Squats
                    </span>
                  </div>
                </div>

                {/* Enhanced action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/workouts/view/session-1"
                    className="btn-secondary flex-1 py-4 rounded-xl font-medium touch-manipulation flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                  <Link
                    href="/workouts/live/session-1"
                    className="btn-primary flex-1 py-4 rounded-xl font-bold touch-manipulation flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Rocket className="w-4 h-4" /> Start Live Workout
                  </Link>
                </div>
              </div>

              <div className="card-primary rounded-2xl border-2 border-gray-200 shadow-md opacity-75">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1">
                    <h3 className="text-heading-secondary text-xl sm:text-lg font-bold mb-2">
                      Lower Body Power
                    </h3>
                    <p className="text-body-secondary mb-3 leading-relaxed">
                      Scheduled for tomorrow • 60 minutes • 6 exercises
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-body-small px-3 py-2 bg-gray-200 text-gray-600 rounded-xl font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Upcoming
                      </span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right bg-gray-50 rounded-xl p-4 min-w-[100px]">
                    <div className="text-body-small mb-1 font-medium">Progress</div>
                    <div className="text-heading-primary text-2xl sm:text-xl font-bold text-gray-400">-</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-body-small text-navy-600 mb-3 font-medium">
                    Exercise Preview:
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    <span className="bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium text-gray-600">
                      5×5 Squats (80%)
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium text-gray-600">
                      3×8 Deadlifts
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium text-gray-600">
                      3×12 Leg Press
                    </span>
                    <span className="bg-gray-100 px-3 py-2 rounded-xl text-sm font-medium text-gray-600">
                      + 3 more exercises
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/workouts/view/session-2"
                    className="btn-secondary flex-1 py-4 rounded-xl font-medium touch-manipulation flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </Link>
                  <button
                    disabled
                    className="btn-secondary flex-1 py-4 rounded-xl font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Not Ready Yet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced recent activity - mobile optimized */}
        <div className="mb-8">
          <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
            <TrendingUp className="w-6 h-6" /> Recent Activity
          </h2>
          <div className="card-primary rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
            <div className="divide-y divide-gray-200">
              <div className="p-6 hover:bg-gray-50 transition-colors touch-manipulation">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Dumbbell className="w-6 h-6 text-accent-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-primary font-bold mb-1 text-lg">
                      Completed: Upper Body Strength
                    </div>
                    <div className="text-body-secondary leading-relaxed">
                      3 sets × 8 reps Bench Press at 185 lbs
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium shrink-0">
                    2h ago
                  </div>
                </div>
              </div>
              
              <div className="p-6 hover:bg-gray-50 transition-colors touch-manipulation">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-accent-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-primary font-bold mb-1 text-lg flex items-center gap-2">
                      <PartyPopper className="w-5 h-5" /> New Personal Record: Deadlift
                    </div>
                    <div className="text-body-secondary leading-relaxed">
                      You lifted 315 lbs - that&apos;s 25 lbs more than your previous best!
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium shrink-0">
                    Yesterday
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced upcoming workouts - mobile optimized */}
        {user.role === "athlete" && (
          <div className="mb-8">
            <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
              <Calendar className="h-6 w-6 text-blue-600" />
              Upcoming Workouts
            </h2>
            <div className="card-primary rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
              <div className="divide-y divide-gray-200">
                <div className="p-6 hover:bg-gray-50 transition-colors touch-manipulation">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-primary font-bold mb-1 text-lg">
                        Lower Body Power
                      </div>
                      <div className="text-body-secondary leading-relaxed">
                        Squats, Deadlifts, Leg Press
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-bold shrink-0 bg-blue-100 px-3 py-1 rounded-lg">
                      Tomorrow 3:00 PM
                    </div>
                  </div>
                </div>
                
                <div className="p-6 hover:bg-gray-50 transition-colors touch-manipulation">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                      <Dumbbell className="w-6 h-6 text-accent-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-primary font-bold mb-1 text-lg">
                        Upper Body Hypertrophy
                      </div>
                      <div className="text-body-secondary leading-relaxed">
                        Bench Press, Rows, Shoulder Press
                      </div>
                    </div>
                    <div className="text-sm text-purple-600 font-bold shrink-0 bg-purple-100 px-3 py-1 rounded-lg">
                      Friday 3:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced mobile floating action button */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/workout/new"
            className="flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 bg-linear-to-br from-accent-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
          >
            <span className="text-2xl sm:text-xl font-bold">+</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
