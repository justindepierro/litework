import EnhancedPWAInstall from "@/components/EnhancedPWAInstall";
import { Body } from "@/components/ui/Typography";

import { Dumbbell, Smartphone } from "lucide-react";

export default function PWADemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary) mb-4">
            Enhanced PWA & Offline Features
          </h1>
          <Body className="text-lg mb-6" variant="secondary">
            Experience the power of Progressive Web App technology optimized for
            gym environments with spotty WiFi and offline workout sessions.
          </Body>
        </div>

        <EnhancedPWAInstall />

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Gym-Optimized Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-blue-500) rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-(--text-primary)">
                    Offline Workout Sessions
                  </h3>
                  <Body className="text-sm" variant="secondary">
                    Continue your workouts even when WiFi is down. All progress
                    syncs automatically when reconnected.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--status-success) rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-(--text-primary)">
                    Smart Caching
                  </h3>
                  <Body className="text-sm" variant="secondary">
                    Exercise library, workout templates, and your recent
                    sessions are cached for instant access.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-orange-500) rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-(--text-primary)">
                    Background Sync
                  </h3>
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
                  <h3 className="font-medium text-(--text-primary)">
                    Network Timeout Handling
                  </h3>
                  <Body className="text-sm" variant="secondary">
                    Optimized for slow gym WiFi with intelligent retry logic and
                    5-second timeouts.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--status-error) rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-(--text-primary)">
                    Push Notifications
                  </h3>
                  <Body className="text-sm" variant="secondary">
                    Get workout reminders and updates even when the app
                    isn&apos;t open.
                  </Body>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-(--accent-indigo-500) rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-(--text-primary)">
                    Native App Experience
                  </h3>
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
          <h2 className="text-xl font-semibold text-(--accent-blue-900) mb-4">
            🚀 Performance Enhancements
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-(--text-primary)">
                Cache Strategy
              </div>
              <div className="text-(--text-secondary)">
                Stale-while-revalidate for APIs
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-(--text-primary)">
                Image Caching
              </div>
              <div className="text-(--text-secondary)">
                30-day cache with compression
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-(--text-primary)">
                API Optimization
              </div>
              <div className="text-(--text-secondary)">
                5-minute TTL with retry logic
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-(--text-primary)">
                Bundle Size
              </div>
              <div className="text-(--text-secondary)">
                1.76MB optimized build
              </div>
            </div>
          </div>
        </div>

        <div className="bg-silver-200 shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installation Instructions
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-(--text-primary) mb-1">
                Chrome/Edge (Desktop & Mobile)
              </h3>
              <Body className="text-sm" variant="secondary">
                Click the install button above, or look for the install icon in
                the address bar
              </Body>
            </div>

            <div>
              <h3 className="font-medium text-(--text-primary) mb-1">
                Safari (iOS)
              </h3>
              <Body className="text-sm" variant="secondary">
                Tap the Share button → &quot;Add to Home Screen&quot; →
                &quot;Add&quot;
              </Body>
            </div>

            <div>
              <h3 className="font-medium text-(--text-primary) mb-1">
                Firefox (Desktop & Mobile)
              </h3>
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
