import Link from "next/link";
import { Display, Heading, Body } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";

/**
 * Static Landing Page - Zero Client JavaScript
 * Server-rendered for maximum performance
 */
export default function StaticHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
      {/* Hero Section - Mobile First */}
      <div className="container-responsive section-spacing pt-20 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <Badge variant="purple" gradient>
                🏋️ Professional Training Platform
              </Badge>
            </div>

            {/* Hero Title with Gradient */}
            <Display size="xl" className="mb-4" style={{ color: "#ffffff" }}>
              <span className="block" style={{ color: "#ffffff" }}>
                Weight Lifting Club
              </span>
              <span className="block bg-gradient-to-r from-accent-blue-400 via-accent-purple-400 to-accent-orange-400 bg-clip-text text-transparent mt-2">
                Workout Tracker
              </span>
            </Display>

            <Body
              as="p"
              size="lg"
              className="text-white/80 mt-8 max-w-2xl mx-auto leading-relaxed"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Professional workout tracking for coaches and athletes. Manage
              programs, track progress, and achieve goals.
            </Body>

            {/* CTA Buttons with Gradients */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-xl hover:from-accent-orange-600 hover:to-accent-orange-700 transition-all shadow-lg shadow-accent-orange-500/30 hover:shadow-xl hover:shadow-accent-orange-500/40 hover:-translate-y-0.5 min-h-[56px]"
              >
                Get Started
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold bg-white border-2 border-white rounded-xl hover:bg-silver-50 transition-all shadow-lg min-h-[56px]"
                style={{ color: 'rgb(15, 23, 42)' }}
              >
                Sign Up Free
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-accent-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Works Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container-responsive">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Heading
                level="h2"
                className="text-navy-900 text-3xl md:text-4xl font-bold"
              >
                Everything You Need
              </Heading>
              <Body
                as="p"
                className="mt-4 text-lg"
                style={{ color: "rgb(71, 85, 105)" }}
              >
                Built for coaches and athletes who demand excellence
              </Body>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 - Track Progress */}
              <div className="group bg-gradient-to-br from-accent-blue-50 to-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-accent-blue-100">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-blue-400 to-accent-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-blue-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <Heading
                  level="h3"
                  className="mb-3 text-xl font-bold text-navy-900"
                >
                  Track Progress
                </Heading>
                <Body
                  as="p"
                  size="sm"
                  className="leading-relaxed"
                  style={{ color: "rgb(71, 85, 105)" }}
                >
                  Monitor performance, PRs, and volume over time with detailed
                  analytics.
                </Body>
              </div>

              {/* Feature 2 - Manage Groups */}
              <div className="group bg-gradient-to-br from-accent-purple-50 to-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-accent-purple-100">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple-400 to-accent-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-purple-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <Heading
                  level="h3"
                  className="mb-3 text-xl font-bold text-navy-900"
                >
                  Manage Groups
                </Heading>
                <Body
                  as="p"
                  size="sm"
                  className="leading-relaxed"
                  style={{ color: "rgb(71, 85, 105)" }}
                >
                  Organize athletes by team, position, or experience level for
                  targeted programming.
                </Body>
              </div>

              {/* Feature 3 - Smart Scheduling */}
              <div className="group bg-gradient-to-br from-accent-orange-50 to-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-accent-orange-100">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-orange-400 to-accent-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-accent-orange-500/30 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
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
                <Heading
                  level="h3"
                  className="mb-3 text-xl font-bold text-navy-900"
                >
                  Smart Scheduling
                </Heading>
                <Body
                  as="p"
                  size="sm"
                  className="leading-relaxed"
                  style={{ color: "rgb(71, 85, 105)" }}
                >
                  Assign workouts with automatic weight suggestions based on
                  performance.
                </Body>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-silver-50 to-white py-20">
        <div className="container-responsive">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-accent-blue-100">
                  <Display
                    size="lg"
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    500+
                  </Display>
                  <Body as="p" className="mt-3 font-semibold text-navy-800">
                    Exercises
                  </Body>
                </div>
              </div>
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-accent-emerald-100">
                  <Display
                    size="lg"
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    100%
                  </Display>
                  <Body as="p" className="mt-3 font-semibold text-navy-800">
                    Free Forever
                  </Body>
                </div>
              </div>
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-accent-purple-100">
                  <Display
                    size="lg"
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(168, 85, 247), rgb(147, 51, 234))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    PWA
                  </Display>
                  <Body as="p" className="mt-3 font-semibold text-navy-800">
                    Mobile App
                  </Body>
                </div>
              </div>
              <div className="group">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-accent-orange-100">
                  <Display
                    size="lg"
                    className="font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(251, 146, 60), rgb(249, 115, 22))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    24/7
                  </Display>
                  <Body as="p" className="mt-3 font-semibold text-navy-800">
                    Always On
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-20">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-navy-800/50 backdrop-blur-sm rounded-3xl p-10 md:p-16 border-2 border-white/10 shadow-2xl">
              <Display size="lg" className="mb-4" style={{ color: "#ffffff" }}>
                Ready to Transform Your Training?
              </Display>
              <Body
                as="p"
                size="lg"
                className="mt-6 mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Join coaches and athletes already using LiteWork to achieve
                their goals. Start tracking workouts, managing teams, and
                hitting PRs today.
              </Body>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white bg-gradient-to-r from-accent-orange-500 to-accent-orange-600 rounded-xl hover:from-accent-orange-600 hover:to-accent-orange-700 transition-all shadow-lg shadow-accent-orange-500/30 hover:shadow-xl hover:shadow-accent-orange-500/40 hover:-translate-y-0.5 min-h-14"
              >
                Get Started Free
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Body
                as="p"
                size="sm"
                className="mt-6"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                No credit card required • Free forever • Cancel anytime
              </Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
