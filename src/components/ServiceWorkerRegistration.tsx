"use client";

import { useEffect } from "react";
import { log } from "@/lib/dev-logger";
import { devFeatures } from "@/lib/dev-config";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Suppress harmless Chrome extension message channel errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || "";

      // Filter out known harmless errors from Chrome extensions
      if (
        message.includes(
          "message channel closed before a response was received"
        ) ||
        message.includes("A listener indicated an asynchronous response")
      ) {
        // Silently ignore these extension-related errors
        return;
      }

      // Pass through all other errors
      originalError.apply(console, args);
    };

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (devFeatures.enableServiceWorkerLogging) {
            log.info("Service Worker registered successfully:", registration);
          }

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available
                  if (confirm("New version available! Reload to update?")) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          log.error("Service Worker registration failed:", registrationError);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CACHE_UPDATED") {
          if (devFeatures.enableServiceWorkerLogging) {
            log.info("Service Worker cache updated");
          }
        }
      });
    }

    // Cleanup: restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
