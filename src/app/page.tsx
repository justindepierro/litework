"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Dumbbell,
  Rocket,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section - Mobile First */}
      <div className="container-responsive section-spacing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-heading-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">Weight Lifting Club</span>
              <span className="block text-heading-accent mt-1">
                Workout Tracker
              </span>
            </h1>
            <p className="mt-4 text-body-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Track your workouts, monitor progress, and stay on schedule with
              your weight lifting goals.
            </p>

            {/* CTA Button - Mobile Optimized */}
            <div className="mt-8 w-full max-w-sm mx-auto">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    variant="primary"
                    leftIcon={<BarChart3 className="w-5 h-5" />}
                    className="text-lg"
                    fullWidth
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup" className="flex-1">
                    <Button
                      variant="primary"
                      leftIcon={<Rocket className="w-5 h-5" />}
                      fullWidth
                    >
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" fullWidth>
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Mobile Optimized Grid */}
      <div className="container-responsive section-spacing bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-heading-secondary text-2xl text-center mb-8 sm:text-3xl">
            Everything you need to track your fitness
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 - Progress Tracking */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-accent-green" />
              </div>
              <h3 className="text-heading-secondary text-lg text-center mb-3">
                Track Progress
              </h3>
              <p className="text-body-secondary text-center text-sm leading-relaxed">
                Monitor your strength gains and personal records over time with
                detailed analytics and visual charts.
              </p>
              <div className="mt-3 text-center">
                <span className="status-success inline-block px-2 py-1 text-xs rounded-full font-medium">
                  Analytics
                </span>
              </div>
            </Card>

            {/* Feature 2 - Smart Scheduling */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-accent-blue" />
              </div>
              <h3 className="text-heading-secondary text-lg text-center mb-3">
                Smart Scheduling
              </h3>
              <p className="text-body-secondary text-center text-sm leading-relaxed">
                View your workout schedule and get reminders so you never miss a
                training session.
              </p>
              <div className="mt-3 text-center">
                <span className="status-info inline-block px-2 py-1 text-xs rounded-full font-medium">
                  Never Miss
                </span>
              </div>
            </Card>

            {/* Feature 3 - Team Management */}
            <Card
              variant="default"
              padding="md"
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
              <h3 className="text-heading-secondary text-lg text-center mb-3">
                Team Management
              </h3>
              <p className="text-body-secondary text-center text-sm leading-relaxed">
                Coaches can create workouts and track member progress across the
                entire team.
              </p>
              <div className="mt-3 text-center">
                <Badge variant="primary">Coach Tools</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Focused */}
      {user && (
        <div className="container-responsive py-8 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-heading-secondary text-xl text-center mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href="/dashboard"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-green"
              >
                <BarChart3 className="w-8 h-8 mb-2 text-accent-green" />
                <span className="text-body-primary text-sm font-medium">
                  Dashboard
                </span>
              </Link>
              <Link
                href="/workout/new"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-orange"
              >
                <Dumbbell className="w-8 h-8 mb-2 text-accent-orange" />
                <span className="text-body-primary text-sm font-medium">
                  New Workout
                </span>
              </Link>
              <Link
                href="/progress"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-pink"
              >
                <TrendingUp className="w-8 h-8 mb-2 text-accent-pink" />
                <span className="text-body-primary text-sm font-medium">
                  Progress
                </span>
              </Link>
              <Link
                href="/schedule"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-blue"
              >
                <Calendar className="w-8 h-8 mb-2 text-accent-blue" />
                <span className="text-body-primary text-sm font-medium">
                  Schedule
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
