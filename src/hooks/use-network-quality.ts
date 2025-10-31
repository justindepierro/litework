"use client";

import { useState, useEffect } from "react";
import React from "react";

interface ConnectionInfo {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface UseNetworkQualityResult {
  connectionQuality: "poor" | "good" | "excellent";
  isSlowConnection: boolean;
  shouldOptimize: boolean;
  connectionInfo: ConnectionInfo | null;
}

// Extended Navigator interface for connection API
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
  };
}

/**
 * Hook to detect network quality and optimize app behavior accordingly
 * Particularly useful for gym WiFi scenarios
 */
export function useNetworkQuality(): UseNetworkQualityResult {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
    null
  );
  const [connectionQuality, setConnectionQuality] = useState<
    "poor" | "good" | "excellent"
  >("good");

  useEffect(() => {
    // Check if Network Information API is available
    if ("connection" in navigator) {
      const connection = (navigator as NavigatorWithConnection).connection;

      const updateConnectionInfo = () => {
        const effectiveType =
          (connection?.effectiveType as "slow-2g" | "2g" | "3g" | "4g") || "4g";

        const info: ConnectionInfo = {
          effectiveType,
          downlink: connection?.downlink || 10,
          rtt: connection?.rtt || 50,
          saveData: connection?.saveData || false,
        };

        setConnectionInfo(info);

        // Determine connection quality
        if (
          info.effectiveType === "slow-2g" ||
          info.effectiveType === "2g" ||
          info.downlink < 1
        ) {
          setConnectionQuality("poor");
        } else if (info.effectiveType === "3g" || info.downlink < 5) {
          setConnectionQuality("good");
        } else {
          setConnectionQuality("excellent");
        }
      };

      // Initial check
      updateConnectionInfo();

      // Listen for connection changes
      if (connection) {
        connection.addEventListener("change", updateConnectionInfo);

        return () => {
          connection.removeEventListener("change", updateConnectionInfo);
        };
      }
    } else {
      // Fallback: detect connection quality through loading times
      const startTime = performance.now();

      fetch("/api/health", { method: "HEAD" })
        .then(() => {
          const loadTime = performance.now() - startTime;
          if (loadTime > 2000) {
            setConnectionQuality("poor");
          } else if (loadTime > 1000) {
            setConnectionQuality("good");
          } else {
            setConnectionQuality("excellent");
          }
        })
        .catch(() => {
          setConnectionQuality("poor");
        });
    }
  }, []);

  const isSlowConnection =
    connectionQuality === "poor" || connectionInfo?.saveData === true;

  const shouldOptimize = isSlowConnection || connectionQuality !== "excellent";

  return {
    connectionQuality,
    isSlowConnection,
    shouldOptimize,
    connectionInfo,
  };
}

/**
 * Component that adapts UI based on connection quality
 */
export function NetworkQualityIndicator() {
  const { connectionQuality, isSlowConnection } = useNetworkQuality();

  if (!isSlowConnection) return null;

  return React.createElement(
    "div",
    { className: "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4" },
    React.createElement(
      "div",
      { className: "flex" },
      React.createElement(
        "div",
        { className: "shrink-0" },
        React.createElement(
          "svg",
          {
            className: "h-5 w-5 text-yellow-400",
            viewBox: "0 0 20 20",
            fill: "currentColor",
          },
          React.createElement("path", {
            fillRule: "evenodd",
            d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
            clipRule: "evenodd",
          })
        )
      ),
      React.createElement(
        "div",
        { className: "ml-3" },
        React.createElement(
          "p",
          { className: "text-sm text-yellow-700" },
          connectionQuality === "poor"
            ? "Slow connection detected. App optimized for minimal data usage."
            : "Connection quality is limited. Some features may load slowly."
        )
      )
    )
  );
}

export default useNetworkQuality;
