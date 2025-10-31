import EnhancedPWAInstall from "@/components/EnhancedPWAInstall";

import { Dumbbell, Smartphone } from "lucide-react";

export default function PWADemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Enhanced PWA & Offline Features
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience the power of Progressive Web App technology optimized for
            gym environments with spotty WiFi and offline workout sessions.
          </p>
        </div>

        <EnhancedPWAInstall />

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" />
            Gym-Optimized Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Offline Workout Sessions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Continue your workouts even when WiFi is down. All progress
                    syncs automatically when reconnected.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Smart Caching</h3>
                  <p className="text-sm text-gray-600">
                    Exercise library, workout templates, and your recent
                    sessions are cached for instant access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Background Sync</h3>
                  <p className="text-sm text-gray-600">
                    Completed sets and workouts sync in the background when
                    connection is restored.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Network Timeout Handling
                  </h3>
                  <p className="text-sm text-gray-600">
                    Optimized for slow gym WiFi with intelligent retry logic and
                    5-second timeouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get workout reminders and updates even when the app
                    isn&apos;t open.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Native App Experience
                  </h3>
                  <p className="text-sm text-gray-600">
                    Install to home screen for a full native app experience with
                    offline capabilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            🚀 Performance Enhancements
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Cache Strategy</div>
              <div className="text-gray-600">
                Stale-while-revalidate for APIs
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Image Caching</div>
              <div className="text-gray-600">30-day cache with compression</div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">API Optimization</div>
              <div className="text-gray-600">5-minute TTL with retry logic</div>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Bundle Size</div>
              <div className="text-gray-600">1.76MB optimized build</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Installation Instructions
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Chrome/Edge (Desktop & Mobile)
              </h3>
              <p className="text-gray-600">
                Click the install button above, or look for the install icon in
                the address bar
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Safari (iOS)</h3>
              <p className="text-gray-600">
                Tap the Share button → &quot;Add to Home Screen&quot; →
                &quot;Add&quot;
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Firefox (Desktop & Mobile)
              </h3>
              <p className="text-gray-600">
                Look for the install prompt or menu option &quot;Install
                LiteWork&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
