/**
 * Service Worker Registration and Management
 * Client-side utilities for service worker lifecycle
 */

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    // [REMOVED] console.log("Service workers not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // [REMOVED] console.log("Service Worker registered:", registration);

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New service worker available
          // [REMOVED] console.log("New service worker available");

          // Notify user about update
          if (typeof window !== "undefined" && "confirm" in window) {
            const shouldUpdate = confirm(
              "A new version of the app is available. Reload to update?"
            );

            if (shouldUpdate) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          }
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // [REMOVED] console.log("Service Worker controller changed");
    });

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    // [REMOVED] console.log("Service Worker unregistered:", success);
    return success;
  } catch (error) {
    console.error("Service Worker unregistration failed:", error);
    return false;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    // [REMOVED] console.log("All caches cleared");

    // Also notify service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
    }
  } catch (error) {
    console.error("Failed to clear caches:", error);
  }
}

/**
 * Check if service worker is registered
 */
export function isServiceWorkerRegistered(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  return navigator.serviceWorker.controller !== null;
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error("Failed to get service worker registration:", error);
    return null;
  }
}

/**
 * Hook to use service worker registration
 */
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [registration, setRegistration] =
    React.useState<ServiceWorkerRegistration | null>(null);

  React.useEffect(() => {
    const register = async () => {
      const reg = await registerServiceWorker();
      setRegistration(reg);
      setIsRegistered(reg !== null);
      setIsLoading(false);
    };

    register();
  }, []);

  return {
    isRegistered,
    isLoading,
    registration,
    unregister: unregisterServiceWorker,
    clearCaches: clearAllCaches,
  };
}

// For non-React usage
import React from "react";
