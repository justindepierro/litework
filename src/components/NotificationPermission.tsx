/**
 * NotificationPermission Component
 * Handles push notification permission request and subscription
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { useAsyncState } from "@/hooks/use-async-state";
import { Bell, CheckCircle, XCircle } from "lucide-react";

interface NotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  className?: string;
}

export default function NotificationPermission({
  onPermissionGranted,
  onPermissionDenied,
  className = "",
}: NotificationPermissionProps) {
  const { user } = useAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isLoading, error, execute, setError } = useAsyncState();

  // Check current permission status on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      checkSubscriptionStatus();
    }
  }, []);

  /**
   * Check if user is already subscribed
   */
  const checkSubscriptionStatus = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  };

  /**
   * Request notification permission from user
   */
  const requestPermission = () =>
    execute(async () => {
      if (!("Notification" in window)) {
        throw new Error("Push notifications are not supported in this browser");
      }

      if (!user) {
        throw new Error("You must be logged in to enable notifications");
      }

      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await subscribeToPush();
        onPermissionGranted?.();
      } else {
        setError("Notification permission denied");
        onPermissionDenied?.();
      }
    });

  /**
   * Subscribe to push notifications
   */
  const subscribeToPush = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported");
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      // Get device info
      const deviceName = getDeviceName();

      // Save subscription to backend
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save subscription");
      }

      setIsSubscribed(true);
      // [REMOVED] console.log("✅ Successfully subscribed to push notifications");
    } catch (err) {
      console.error("Error subscribing to push:", err);
      throw err;
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = () =>
    execute(async () => {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported");
      }

      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        throw new Error("No subscription found");
      }

      // Unsubscribe
      const success = await subscription.unsubscribe();
      if (!success) {
        throw new Error("Failed to unsubscribe");
      }

      // Remove subscription from backend
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove subscription");
      }

      setIsSubscribed(false);
      // [REMOVED] console.log("✅ Successfully unsubscribed from push notifications");
    });

  /**
   * Get a friendly device name
   */
  const getDeviceName = (): string => {
    const ua = navigator.userAgent;

    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android";
    if (/Mac/.test(ua)) return "Mac";
    if (/Windows/.test(ua)) return "Windows";
    if (/Linux/.test(ua)) return "Linux";

    return "Unknown Device";
  };

  /**
   * Convert VAPID public key to Uint8Array
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Don't show if notifications not supported
  if (!("Notification" in window)) {
    return null;
  }

  return (
    <div className={`notification-permission ${className}`}>
      {permission === "default" && (
        <Alert variant="info" icon={<Bell />} title="Enable Push Notifications">
          <p className="text-sm mb-4">
            Get notified when you have new workouts, messages from your coach,
            and more.
          </p>
          <button
            onClick={requestPermission}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-(--accent-blue-600) hover:bg-(--accent-blue-700) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--accent-blue-500) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enabling...
              </>
            ) : (
              "Enable Notifications"
            )}
          </button>
        </Alert>
      )}

      {permission === "granted" && isSubscribed && (
        <Alert
          variant="success"
          icon={<CheckCircle />}
          title="Notifications Enabled"
        >
          <p className="text-sm mb-4">
            You&apos;ll receive push notifications for workouts and messages.
          </p>
          <button
            onClick={unsubscribe}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-(--status-success-light) text-sm font-medium rounded text-(--status-success) bg-white hover:bg-(--status-success-light) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--status-success) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Disabling..." : "Disable Notifications"}
          </button>
        </Alert>
      )}

      {permission === "denied" && (
        <Alert variant="error" icon={<XCircle />} title="Notifications Blocked">
          <p className="text-sm">
            You&apos;ve blocked notifications. To enable them, go to your
            browser settings and allow notifications for this site.
          </p>
        </Alert>
      )}

      {error && (
        <div className="mt-2 text-sm text-(--status-error)">{error}</div>
      )}
    </div>
  );
}
