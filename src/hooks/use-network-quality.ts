"use client";

import { useState, useEffect, useMemo } from "react";
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
    {
      className:
        "bg-accent-yellow-50 border-l-4 border-accent-yellow-400 p-4 mb-4",
    },
    React.createElement(
      "div",
      { className: "flex" },
      React.createElement(
        "div",
        { className: "shrink-0" },
        React.createElement(
          "svg",
          {
            className: "h-5 w-5 text-accent-yellow-400",
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
          { className: "text-sm text-accent-yellow-700" },
          connectionQuality === "poor"
            ? "Slow connection detected. App optimized for minimal data usage."
            : "Connection quality is limited. Some features may load slowly."
        )
      )
    )
  );
}

export default useNetworkQuality;

/**
 * Hook to detect if user prefers reduced data usage
 */
export function useDataSaver(): boolean {
  const { connectionInfo } = useNetworkQuality();
  return connectionInfo?.saveData || false;
}

/**
 * Hook to get adaptive quality settings based on network and device
 */
export function useAdaptiveQuality() {
  const { isSlowConnection, connectionQuality } = useNetworkQuality();

  // Compute device quality once
  const deviceQuality = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        isLowEnd: false,
        hardwareConcurrency: 4,
        deviceMemory: 4,
        prefersReducedMotion: false,
      };
    }

    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    // @ts-expect-error - deviceMemory not in all browsers
    const deviceMemory = navigator.deviceMemory || 4;
    const isLowEnd = hardwareConcurrency <= 4 && deviceMemory <= 4;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    return {
      isLowEnd,
      hardwareConcurrency,
      deviceMemory,
      prefersReducedMotion,
    };
  }, []);

  return {
    // Network quality
    connectionQuality,
    isSlowConnection,

    // Device quality
    isLowEndDevice: deviceQuality.isLowEnd,
    prefersReducedMotion: deviceQuality.prefersReducedMotion,

    // Adaptive settings
    shouldReduceAnimations:
      isSlowConnection ||
      deviceQuality.isLowEnd ||
      deviceQuality.prefersReducedMotion,
    shouldReduceImageQuality: isSlowConnection,
    shouldEnableVirtualScrolling: true, // Always enable for performance
    maxPreloadCount:
      connectionQuality === "excellent" && !deviceQuality.isLowEnd ? 10 : 3,
    chartDataPoints: deviceQuality.isLowEnd ? 10 : 30,
    enableShadows: !deviceQuality.isLowEnd && connectionQuality !== "poor",
    enableBlur: !deviceQuality.isLowEnd && connectionQuality !== "poor",
    animationDuration: deviceQuality.prefersReducedMotion
      ? 0
      : deviceQuality.isLowEnd
        ? 150
        : 300,
  };
}
