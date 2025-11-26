"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Display, Heading, Body, Caption } from "@/components/ui/Typography";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Dumbbell,
  Rocket,
} from "lucide-react";

/**
 * Authenticated Home Page - Client Component
 * Only loaded when user has an active session
 */
export default function AuthenticatedHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile First */}
      <div className="container-responsive section-spacing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Display size="xl" className="text-heading-primary">
              <Body as="span" className="block text-inherit">
                Weight Lifting Club
              </Body>
              <Display size="lg" className="block text-heading-accent mt-1">
                Workout Tracker
              </Display>
            </Display>
            <Body
              className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              variant="secondary"
            >
              Track your workouts, monitor progress, and stay on schedule with
              your weight lifting goals.
            </Body>

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
          <Heading level="h2" className="text-center mb-8">
            Everything you need to track your fitness
          </Heading>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 - Progress Tracking */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-center w-12 h-12 bg-success-light rounded-lg mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-accent-green" />
              </div>
              <Heading level="h3" className="text-center mb-3">
                Track Progress
              </Heading>
              <Body
                variant="secondary"
                className="text-center text-sm leading-relaxed"
              >
                Monitor your strength gains and personal records over time with
                detailed analytics and visual charts.
              </Body>
              <div className="mt-3 text-center">
                <Caption className="status-success inline-block px-2 py-1 rounded-full font-medium">
                  Analytics
                </Caption>
              </div>
            </Card>

            {/* Feature 2 - Smart Scheduling */}
            <Card variant="default" padding="md">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-lighter rounded-lg mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-accent-blue" />
              </div>
              <Heading level="h3" className="text-center mb-3">
                Smart Scheduling
              </Heading>
              <Body
                variant="secondary"
                className="text-center text-sm leading-relaxed"
              >
                View your workout schedule and get reminders so you never miss a
                training session.
              </Body>
              <div className="mt-3 text-center">
                <Caption className="status-info inline-block px-2 py-1 rounded-full font-medium">
                  Never Miss
                </Caption>
              </div>
            </Card>

            {/* Feature 3 - Team Management */}
            <Card
              variant="default"
              padding="md"
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-accent-light rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-accent-purple" />
              </div>
              <Heading level="h3" className="text-center mb-3">
                Team Management
              </Heading>
              <Body
                variant="secondary"
                className="text-center text-sm leading-relaxed"
              >
                Coaches can create workouts and track member progress across the
                entire team.
              </Body>
              <div className="mt-3 text-center">
                <Badge variant="primary">Coach Tools</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Focused */}
      {user && (
        <div className="container-responsive py-8 bg-(--bg-secondary)">
          <div className="max-w-2xl mx-auto">
            <Heading level="h2" className="text-center mb-6">
              Quick Actions
            </Heading>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Link
                href="/dashboard"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-green"
              >
                <BarChart3 className="w-8 h-8 mb-2 text-accent-green" />
                <Body size="sm" weight="medium">
                  Dashboard
                </Body>
              </Link>
              <Link
                href="/workout/new"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-orange"
              >
                <Dumbbell className="w-8 h-8 mb-2 text-accent-orange" />
                <Body size="sm" weight="medium">
                  New Workout
                </Body>
              </Link>
              <Link
                href="/progress"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-pink"
              >
                <TrendingUp className="w-8 h-8 mb-2 text-accent-pink" />
                <Body size="sm" weight="medium">
                  Progress
                </Body>
              </Link>
              <Link
                href="/schedule"
                className="card-stat flex flex-col items-center justify-center hover:border-accent-blue"
              >
                <Calendar className="w-8 h-8 mb-2 text-accent-blue" />
                <Body size="sm" weight="medium">
                  Schedule
                </Body>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
