import Link from "next/link";
import { Display, Heading, Body } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";

/**
 * Static Landing Page - Zero Client JavaScript
 * Server-rendered for maximum performance
 */
export default function StaticHome() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile First */}
      <div className="container-responsive section-spacing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Display size="xl" className="text-heading-primary">
              <Body as="span" className="block">
                Weight Lifting Club
              </Body>
              <Body as="span" className="block text-heading-accent mt-1">
                Workout Tracker
              </Body>
            </Display>

            <Body
              size="lg"
              variant="secondary"
              className="mt-6 max-w-2xl mx-auto"
            >
              Professional workout tracking for coaches and athletes. Manage
              programs, track progress, and achieve goals.
            </Body>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors min-h-[48px]"
              >
                Get Started
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-primary bg-white border-2 border-primary rounded-lg hover:bg-silver-50 transition-colors min-h-[48px]"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-responsive py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Heading level="h2" className="text-heading-primary">
              Everything You Need
            </Heading>
            <Body variant="secondary" className="mt-2">
              Built for coaches and athletes who demand excellence
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <Heading level="h3" className="mb-2 text-lg">
                Track Progress
              </Heading>
              <Body variant="secondary" size="sm">
                Monitor performance, PRs, and volume over time with detailed
                analytics.
              </Body>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <Heading level="h3" className="mb-2 text-lg">
                Manage Groups
              </Heading>
              <Body variant="secondary" size="sm">
                Organize athletes by team, position, or experience level for
                targeted programming.
              </Body>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <Heading level="h3" className="mb-2 text-lg">
                Smart Scheduling
              </Heading>
              <Body variant="secondary" size="sm">
                Assign workouts with automatic weight suggestions based on
                performance.
              </Body>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <Display size="lg" className="text-primary">
                  500+
                </Display>
                <Body variant="secondary" className="mt-2">
                  Exercises
                </Body>
              </div>
              <div>
                <Display size="lg" className="text-success">
                  100%
                </Display>
                <Body variant="secondary" className="mt-2">
                  Free
                </Body>
              </div>
              <div>
                <Display size="lg" className="text-accent">
                  PWA
                </Display>
                <Body variant="secondary" className="mt-2">
                  Mobile App
                </Body>
              </div>
              <div>
                <Display size="lg" className="text-primary">
                  24/7
                </Display>
                <Body variant="secondary" className="mt-2">
                  Available
                </Body>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container-responsive py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12">
          <Display size="lg" className="text-white">
            Ready to Transform Your Training?
          </Display>
          <Body size="lg" className="text-white/90 mt-4 mb-8">
            Join coaches and athletes already using LiteWork to achieve their
            goals.
          </Body>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-primary bg-white rounded-lg hover:bg-silver-50 transition-colors min-h-[56px]"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}
