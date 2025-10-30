"use client";

import { useEffect, useState } from "react";
import { Plus, Download } from "lucide-react";

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
    if (isInstalled) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
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

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }

    setDeferredPrompt(null);
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
            <p className="text-body-secondary text-xs">
              Add to home screen for quick access
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="text-body-secondary text-sm px-3 py-2 rounded-lg hover:bg-silver-100"
          >
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="btn-primary flex items-center space-x-1 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
        </div>
      </div>
    </div>
  );
}
