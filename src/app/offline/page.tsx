"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Body } from "@/components/ui/Typography";

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
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <WifiOff className="w-16 h-16 text-silver-500 mx-auto mb-4" />
          <h1 className="text-heading-primary text-2xl font-bold mb-4">
            You&apos;re Offline
          </h1>
          <Body variant="secondary" className="mb-6">
            It looks like you&apos;re not connected to the internet. Some
            features may not be available until you reconnect.
          </Body>
          <Button
            onClick={handleRetry}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            fullWidth
          >
            Try Again
          </Button>
          <Body variant="secondary" className="text-sm mt-4">
            Don&apos;t worry - your workout data is saved locally and will sync
            when you&apos;re back online.
          </Body>
        </div>
      </div>
    </div>
  );
}
