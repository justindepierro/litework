"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-primary px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <PageHeader
          title="Offline Mode"
          subtitle="LiteWork caches your workouts so you can keep training without WiFi."
          icon={<WifiOff className="w-6 h-6" />}
          actions={
            <Button
              variant="primary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRetry}
            >
              Try Again
            </Button>
          }
        />

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <WifiOff className="w-16 h-16 text-silver-500 mx-auto mb-4" />
          <Heading level="h3" className="mb-4">
            You&apos;re Offline
          </Heading>
          <Body variant="secondary" className="mb-6">
            It looks like you&apos;re not connected to the internet. Some
            features may not be available until you reconnect.
          </Body>
          <Button
            onClick={handleRetry}
            variant="secondary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            fullWidth
          >
            Try Again
          </Button>
          <Body variant="secondary" className="text-sm mt-4">
            Don&apos;t worry — your workout data is saved locally and will sync
            when you&apos;re back online.
          </Body>
        </div>
      </div>
    </div>
  );
}
