"use client";

import EnhancedPWAInstall from "@/components/EnhancedPWAInstall";
import { Body, Heading } from "@/components/ui/Typography";
import { PageHeader } from "@/components/ui/PageHeader";

import { Dumbbell, Smartphone } from "lucide-react";

export default function PWADemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <PageHeader
          title="Enhanced PWA & Offline Features"
          subtitle="Experience PWA technology optimized for gym environments with spotty WiFi and offline workouts."
          icon={<Smartphone className="w-6 h-6" />}
          mobileAlign="left"
        />

        <EnhancedPWAInstall />

        <div className="bg-white shadow-sm rounded-lg p-6">
          <Heading level="h3" className="mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Gym-Optimized Features
          </Heading>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-blue-500) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Offline Workout Sessions
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Continue your workouts even when WiFi is down. All progress
                    syncs automatically when reconnected.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--status-success) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Smart Caching
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Exercise library, workout templates, and your recent
                    sessions are cached for instant access.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-orange-500) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Background Sync
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Completed sets and workouts sync in the background when
                    connection is restored.
                  </Body>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-purple-500) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Network Timeout Handling
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Optimized for slow gym WiFi with intelligent retry logic and
                    5-second timeouts.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--status-error) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Push Notifications
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Get workout reminders and updates even when the app
                    isn&apos;t open.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-indigo-500) rounded-full mt-2"></div>
                <div>
                  <Heading level="h4" className="font-semibold">
                    Native App Experience
                  </Heading>
                  <Body className="text-sm" variant="secondary">
                    Install to home screen for a full native app experience with
                    offline capabilities.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--accent-blue-50) rounded-lg p-6 shadow-sm">
          <Heading level="h3" className="mb-4 flex items-center gap-2">
            <span role="img" aria-hidden="true">
              🚀
            </span>
            Performance Enhancements
          </Heading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <Heading level="h5" className="text-sm">
                Cache Strategy
              </Heading>
              <Body variant="secondary" size="sm">
                Stale-while-revalidate for APIs
              </Body>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <Heading level="h5" className="text-sm">
                Image Caching
              </Heading>
              <Body variant="secondary" size="sm">
                30-day cache with compression
              </Body>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <Heading level="h5" className="text-sm">
                API Optimization
              </Heading>
              <Body variant="secondary" size="sm">
                5-minute TTL with retry logic
              </Body>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <Heading level="h5" className="text-sm">
                Bundle Size
              </Heading>
              <Body variant="secondary" size="sm">
                1.76MB optimized build
              </Body>
            </div>
          </div>
        </div>

        <div className="bg-silver-200 shadow-sm rounded-lg p-6">
          <Heading level="h3" className="mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installation Instructions
          </Heading>

          <div className="space-y-4 text-sm">
            <div>
              <Heading level="h4" className="mb-1">
                Chrome/Edge (Desktop & Mobile)
              </Heading>
              <Body className="text-sm" variant="secondary">
                Click the install button above, or look for the install icon in
                the address bar
              </Body>
            </div>

            <div>
              <Heading level="h4" className="mb-1">
                Safari (iOS)
              </Heading>
              <Body className="text-sm" variant="secondary">
                Tap the Share button → &quot;Add to Home Screen&quot; →
                &quot;Add&quot;
              </Body>
            </div>

            <div>
              <Heading level="h4" className="mb-1">
                Firefox (Desktop & Mobile)
              </Heading>
              <Body className="text-sm" variant="secondary">
                Look for the install prompt or menu option &quot;Install
                LiteWork&quot;
              </Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
