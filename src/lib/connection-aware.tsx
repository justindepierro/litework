/**
 * Connection-Aware Data Fetching
 * Adapt data quality and behavior based on network speed
 */

import { useState, useEffect } from "react";

/**
 * Network connection types
 */
export type ConnectionType =
  | "4g"
  | "3g"
  | "2g"
  | "slow-2g"
  | "wifi"
  | "unknown";

/**
 * Connection quality levels
 */
export type ConnectionQuality = "high" | "medium" | "low" | "offline";

/**
 * Network information interface
 */
interface NetworkInformation {
  type: ConnectionType;
  quality: ConnectionQuality;
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean; // User has enabled data saver
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

/**
 * Extended Navigator interface for Network Information API
 */
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
  mozConnection?: {
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
  webkitConnection?: {
    effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };
}

/**
 * Detect current network connection
 */
export function getNetworkInformation(): NetworkInformation {
  if (typeof window === "undefined" || !("navigator" in window)) {
    return { type: "unknown", quality: "high" };
  }

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!connection) {
    return { type: "unknown", quality: "high" };
  }

  const effectiveType = connection.effectiveType || "4g";
  const downlink = connection.downlink;
  const rtt = connection.rtt;
  const saveData = connection.saveData || false;

  // Determine quality
  let quality: ConnectionQuality = "high";

  if (saveData) {
    quality = "low";
  } else if (effectiveType === "slow-2g" || (rtt && rtt > 1000)) {
    quality = "low";
  } else if (effectiveType === "2g" || (rtt && rtt > 400)) {
    quality = "low";
  } else if (effectiveType === "3g" || (downlink && downlink < 1.5)) {
    quality = "medium";
  } else {
    quality = "high";
  }

  return {
    type: effectiveType as ConnectionType,
    quality,
    downlink,
    rtt,
    saveData,
    effectiveType,
  };
}

/**
 * Hook to monitor network connection
 */
export function useNetworkQuality() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInformation>(
    getNetworkInformation()
  );

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) return;

    const updateNetworkInfo = () => {
      setNetworkInfo(getNetworkInformation());
    };

    connection.addEventListener("change", updateNetworkInfo);

    return () => {
      connection.removeEventListener("change", updateNetworkInfo);
    };
  }, []);

  return networkInfo;
}

/**
 * Fetch options based on network quality
 */
export interface AdaptiveFetchOptions {
  url: string;
  quality?: ConnectionQuality;
  highQualityParams?: Record<string, string>;
  mediumQualityParams?: Record<string, string>;
  lowQualityParams?: Record<string, string>;
}

/**
 * Adaptive fetch that adjusts request parameters based on connection
 */
export async function adaptiveFetch({
  url,
  quality,
  highQualityParams = {},
  mediumQualityParams = {},
  lowQualityParams = {},
}: AdaptiveFetchOptions): Promise<Response> {
  const currentQuality = quality || getNetworkInformation().quality;

  let params: Record<string, string>;

  switch (currentQuality) {
    case "low":
      params = lowQualityParams;
      break;
    case "medium":
      params = mediumQualityParams;
      break;
    case "high":
    default:
      params = highQualityParams;
      break;
  }

  // Build URL with params
  const urlWithParams = new URL(url, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value);
  });

  return fetch(urlWithParams.toString());
}

/**
 * Configuration for adaptive features
 */
interface AdaptiveConfig {
  enableImages: boolean;
  enableAnimations: boolean;
  enableAutoplay: boolean;
  enablePrefetch: boolean;
  imageQuality: "high" | "medium" | "low";
  maxImageSize: number;
  dataLimit: "unlimited" | "moderate" | "strict";
}

/**
 * Get adaptive configuration based on network quality
 */
export function getAdaptiveConfig(quality: ConnectionQuality): AdaptiveConfig {
  switch (quality) {
    case "low":
      return {
        enableImages: true,
        enableAnimations: false,
        enableAutoplay: false,
        enablePrefetch: false,
        imageQuality: "low",
        maxImageSize: 50, // KB
        dataLimit: "strict",
      };

    case "medium":
      return {
        enableImages: true,
        enableAnimations: true,
        enableAutoplay: false,
        enablePrefetch: false,
        imageQuality: "medium",
        maxImageSize: 200, // KB
        dataLimit: "moderate",
      };

    case "high":
    default:
      return {
        enableImages: true,
        enableAnimations: true,
        enableAutoplay: true,
        enablePrefetch: true,
        imageQuality: "high",
        maxImageSize: 1000, // KB
        dataLimit: "unlimited",
      };
  }
}

/**
 * Hook to get adaptive configuration
 */
export function useAdaptiveConfig() {
  const networkInfo = useNetworkQuality();

  // Memoize config based on network quality
  const config = getAdaptiveConfig(networkInfo.quality);

  return { config, networkInfo };
}

/**
 * Adaptive image loading
 */
export interface AdaptiveImageOptions {
  src: string;
  highQualitySrc?: string;
  mediumQualitySrc?: string;
  lowQualitySrc?: string;
  quality?: ConnectionQuality;
}

export function getAdaptiveImageSrc({
  src,
  highQualitySrc,
  mediumQualitySrc,
  lowQualitySrc,
  quality,
}: AdaptiveImageOptions): string {
  const currentQuality = quality || getNetworkInformation().quality;

  switch (currentQuality) {
    case "low":
      return lowQualitySrc || mediumQualitySrc || src;
    case "medium":
      return mediumQualitySrc || src;
    case "high":
    default:
      return highQualitySrc || src;
  }
}

/**
 * Adaptive data fetching parameters
 */
export interface AdaptiveDataOptions {
  includeImages?: boolean;
  includeDescriptions?: boolean;
  includeMetadata?: boolean;
  limit?: number;
  fields?: string[];
}

export function getAdaptiveDataParams(
  quality: ConnectionQuality
): AdaptiveDataOptions {
  switch (quality) {
    case "low":
      return {
        includeImages: false,
        includeDescriptions: false,
        includeMetadata: false,
        limit: 20,
        fields: ["id", "name"], // Minimal fields
      };

    case "medium":
      return {
        includeImages: true,
        includeDescriptions: false,
        includeMetadata: false,
        limit: 50,
        fields: ["id", "name", "thumbnail"], // Essential fields
      };

    case "high":
    default:
      return {
        includeImages: true,
        includeDescriptions: true,
        includeMetadata: true,
        limit: 100,
        // All fields
      };
  }
}

/**
 * Workout list fetch options based on connection
 */
export function getWorkoutFetchParams(quality: ConnectionQuality) {
  switch (quality) {
    case "low":
      return {
        limit: "20",
        includeExercises: "false",
        includeStats: "false",
      };

    case "medium":
      return {
        limit: "50",
        includeExercises: "false",
        includeStats: "true",
      };

    case "high":
    default:
      return {
        limit: "100",
        includeExercises: "true",
        includeStats: "true",
      };
  }
}

/**
 * Show network quality indicator in UI
 */
export function NetworkQualityBadge() {
  const { quality } = useNetworkQuality();

  if (quality === "high") return null; // Don't show for good connections

  const colors: Record<string, string> = {
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
    offline: "bg-gray-100 text-gray-800",
  };

  const labels: Record<string, string> = {
    medium: "Slow Connection",
    low: "Very Slow Connection",
    offline: "Offline",
  };

  const colorClass = colors[quality] || colors.medium;
  const label = labels[quality] || labels.medium;

  return (
    <div
      className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${colorClass}`}
    >
      {label}
    </div>
  );
}

/**
 * Warn user about data usage on slow connections
 */
export function useDataUsageWarning(actionName: string) {
  const { quality, saveData } = useNetworkQuality();

  const shouldWarn = quality === "low" || quality === "medium" || saveData;

  const warning = shouldWarn
    ? `${actionName} may use additional data. Your connection appears to be ${quality}.`
    : null;

  return { shouldWarn, warning };
}
