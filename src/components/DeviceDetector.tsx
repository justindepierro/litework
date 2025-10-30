"use client";

import { useEffect, useState } from "react";
import { Smartphone, Monitor, Tablet } from "lucide-react";

export default function DeviceDetector() {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;

      if (width <= 640) {
        setDeviceType("mobile");
      } else if (width <= 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }

      // Check if running as PWA
      const isInStandaloneMode = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isIosStandalone =
        "standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone;

      setIsStandalone(isInStandaloneMode || Boolean(isIosStandalone));
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  const getIcon = () => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  // Only show in development or if user wants to see device info
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-navy-800 text-white p-2 rounded-lg text-xs z-50 opacity-75">
      <div className="flex items-center space-x-2">
        {getIcon()}
        <span>{deviceType}</span>
        {isStandalone && (
          <span className="bg-accent-green px-2 py-1 rounded text-xs">PWA</span>
        )}
      </div>
    </div>
  );
}
