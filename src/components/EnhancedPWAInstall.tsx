"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Wifi,
  WifiOff,
  CheckCircle,
  Clock,
  Database,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface CacheStatus {
  staticCached: boolean;
  apiCached: boolean;
  workoutDataCached: boolean;
  totalCacheSize: string;
}

const EnhancedPWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    staticCached: false,
    apiCached: false,
    workoutDataCached: false,
    totalCacheSize: "0 MB",
  });
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Initialize install status
  const getInstallStatus = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInAppBrowser =
      "standalone" in window.navigator && window.navigator.standalone;
    return isStandalone || Boolean(isInAppBrowser);
  }, []);

  const [isInstalled, setIsInstalled] = useState(false);

  // Check install status on client side
  useEffect(() => {
    const checkStatus = () => {
      const installStatus = getInstallStatus();
      setIsInstalled(installStatus);
    };
    checkStatus();
  }, [getInstallStatus]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);

      // Show install banner after a delay if not already installed
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [isInstalled]);

  // Monitor cache status
  const monitorCacheStatus = useCallback(async () => {
    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        let staticCached = false;
        let apiCached = false;
        let workoutDataCached = false;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          if (cacheName.includes("static")) staticCached = keys.length > 0;
          if (cacheName.includes("api")) apiCached = keys.length > 0;
          if (cacheName.includes("workout-data"))
            workoutDataCached = keys.length > 0;

          // Estimate cache size (rough calculation)
          totalSize += keys.length * 50; // Rough estimate: 50KB per cached item
        }

        setCacheStatus({
          staticCached,
          apiCached,
          workoutDataCached,
          totalCacheSize: `${(totalSize / 1024 / 1024).toFixed(1)} MB`,
        });
      } catch (error) {
        console.error("Cache monitoring failed:", error);
      }
    }
  }, []);

  // Service Worker registration and cache monitoring
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          setSwRegistration(registration);
          // [REMOVED] console.log("Enhanced service worker registered:", registration);

          // Monitor cache status
          monitorCacheStatus();
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }, [monitorCacheStatus]);

  // Install PWA
  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Installation failed:", error);
    }
  }, [deferredPrompt]);

  // Force cache refresh
  const handleCacheRefresh = useCallback(async () => {
    if (swRegistration) {
      try {
        await swRegistration.update();

        // Send message to service worker to skip waiting
        if (swRegistration.waiting) {
          swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Refresh cache status
        await monitorCacheStatus();
      } catch (error) {
        console.error("Cache refresh failed:", error);
      }
    }
  }, [swRegistration, monitorCacheStatus]);

  // Preload workout data for offline use
  const handlePreloadWorkouts = useCallback(async () => {
    if (swRegistration && swRegistration.active) {
      try {
        // Request background sync for workout data
        swRegistration.active.postMessage({
          type: "SYNC_REQUEST",
          tag: "workout-preload",
        });

        // Refresh cache status after a delay
        setTimeout(monitorCacheStatus, 2000);
      } catch (error) {
        console.error("Workout preload failed:", error);
      }
    }
  }, [swRegistration, monitorCacheStatus]);

  // Don't show anything if already installed
  if (isInstalled) {
    return (
      <Alert
        variant="success"
        icon={<CheckCircle />}
        title="LiteWork is installed!"
      >
        <p className="text-sm">
          Enjoy the full offline experience in your gym.
        </p>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Installation Banner */}
      {showInstallBanner && deferredPrompt && (
        <Alert variant="info" icon={<Download />} title="Install LiteWork">
          <p className="text-sm mb-4">
            Get the full offline experience for your gym workouts
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallBanner(false)}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
          </div>
        </Alert>
      )}

      {/* Connection Status */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg ${
          isOnline
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-orange-50 text-orange-800 border border-orange-200"
        }`}
      >
        {isOnline ? (
          <Wifi className="w-5 h-5" />
        ) : (
          <WifiOff className="w-5 h-5" />
        )}
        <span className="font-medium">
          {isOnline ? "Connected" : "Offline Mode"}
        </span>
        {!isOnline && (
          <span className="text-sm">
            - Your workouts will sync when reconnected
          </span>
        )}
      </div>

      {/* Cache Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Offline Cache Status</h3>
          <button
            onClick={handleCacheRefresh}
            className="ml-auto px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Static Resources</span>
            <div className="flex items-center gap-1">
              {cacheStatus.staticCached ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-orange-600" />
              )}
              <span
                className={
                  cacheStatus.staticCached
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {cacheStatus.staticCached ? "Cached" : "Loading..."}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Exercise Library</span>
            <div className="flex items-center gap-1">
              {cacheStatus.apiCached ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-orange-600" />
              )}
              <span
                className={
                  cacheStatus.apiCached ? "text-green-600" : "text-orange-600"
                }
              >
                {cacheStatus.apiCached ? "Cached" : "Loading..."}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Workout Data</span>
            <div className="flex items-center gap-1">
              {cacheStatus.workoutDataCached ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <button
                  onClick={handlePreloadWorkouts}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Preload Now
                </button>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Cache Size</span>
              <span className="text-gray-600">
                {cacheStatus.totalCacheSize}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      {!deferredPrompt && !isInstalled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            Manual Installation
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Chrome/Edge:</strong> Menu → Install LiteWork
            </p>
            <p>
              <strong>Safari:</strong> Share → Add to Home Screen
            </p>
            <p>
              <strong>Firefox:</strong> Menu → Install
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPWAInstall;
