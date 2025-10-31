"use client";

import Link from "next/link";
import { useAnyUserGuard } from "@/hooks/use-auth-guard";
import CalendarView from "@/components/CalendarView";
import {
  TrendingUp,
  ClipboardList,
  Trophy,
  Calendar,
  Eye,
  Dumbbell,
  Hand,
  Flame,
} from "lucide-react";

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
                <dt className="text-body-small font-medium text-orange-700">
                  This Week
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-orange-800">
                  3 workouts
                </dd>
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
                <dt className="text-body-small font-medium text-green-700">
                  Personal Records
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-green-800">
                  12
                </dd>
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
                <dt className="text-body-small font-medium text-red-700">
                  Streak Days
                </dt>
                <dd className="text-heading-primary text-3xl sm:text-2xl font-bold text-red-800">
                  7
                </dd>
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
            {/* No assigned workouts yet - will be loaded from API */}
            <div className="text-center py-16">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No Workouts Assigned Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Your coach will assign workouts that will appear here.
              </p>
              <Link
                href="/workouts"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Browse Workout Library
              </Link>
            </div>
          </div>
        )}

        {/* Enhanced recent activity - mobile optimized */}
        <div className="mb-8">
          <h2 className="text-heading-secondary text-2xl sm:text-xl mb-6 font-bold text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
            <TrendingUp className="w-6 h-6" /> Recent Activity
          </h2>
          <div className="card-primary rounded-2xl border-2 border-gray-200 overflow-hidden shadow-md">
            {/* No recent activity yet - will be loaded from API */}
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray-400">
                Your workout progress and achievements will appear here.
              </p>
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
              {/* No upcoming workouts - will be loaded from API */}
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  No Upcoming Workouts
                </h3>
                <p className="text-gray-400">
                  Future workout assignments will appear here.
                </p>
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
