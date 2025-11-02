"use client";

import { useEffect, useState } from "react";
import { log } from "@/lib/dev-logger";
import { devFeatures } from "@/lib/dev-config";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

export default function ServiceWorkerRegistration() {
  const toast = useToast();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  useEffect(() => {
    // Suppress harmless Chrome extension message channel errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || "";

      // Filter out known harmless errors from Chrome extensions and PWA
      if (
        message.includes(
          "message channel closed before a response was received"
        ) ||
        message.includes("A listener indicated an asynchronous response") ||
        message.includes("beforeinstallprompt") ||
        message.includes("prompt() to show the banner")
      ) {
        // Silently ignore these extension-related errors
        return;
      }

      // Pass through all other errors
      originalError.apply(console, args);
    };

    // Only register service worker in production
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
                  // New content is available - show modal
                  setShowUpdateModal(true);
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

  const handleUpdate = () => {
    toast.info("Updating app...");
    setShowUpdateModal(false);
    window.location.reload();
  };

  return (
    <ConfirmModal
      isOpen={showUpdateModal}
      title="App Update Available"
      message="A new version of LiteWork is available. Would you like to reload the app to get the latest features and improvements?"
      confirmText="Update Now"
      cancelText="Later"
      confirmVariant="primary"
      onConfirm={handleUpdate}
      onCancel={() => setShowUpdateModal(false)}
    />
  );
}
