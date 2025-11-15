"use client";

import { useEffect, useState } from "react";
import { Plus, X, Download } from "lucide-react";
import { Body } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInWebAppCapable =
      "standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone;
    return isStandalone || isInWebAppCapable;
  });

  useEffect(() => {
    // Only show in production
    if (process.env.NODE_ENV !== "production") return;
    if (isInstalled) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default prompt
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
      }
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for this session
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-install-dismissed", "true");
    }
  };

  if (isInstalled || !showInstallBanner) {
    return null;
  }

  // Check if user has dismissed this session
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("pwa-install-dismissed")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-silver-200 p-4 shadow-lg z-50">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-accent-blue p-2 rounded-lg">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-heading-primary font-semibold text-sm">
              Install App
            </h3>
            <Body className="text-xs" variant="secondary">
              Add to home screen for quick access
            </Body>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="text-body-secondary text-sm px-3 py-2 rounded-lg hover:bg-silver-100"
          >
            Later
          </button>
          <Button
            onClick={handleInstallClick}
            variant="primary"
            leftIcon={<Download className="w-4 h-4" />}
            size="sm"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
