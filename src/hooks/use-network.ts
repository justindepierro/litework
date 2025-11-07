/**
 * React Hook for Network Detection
 *
 * Provides network status and connectivity checking in React components.
 */

"use client";

import { useState, useEffect } from "react";
import { networkService } from "@/lib/network-service";

interface UseNetworkReturn {
  isOnline: boolean;
  checkConnectivity: () => Promise<boolean>;
  waitForOnline: (timeoutMs?: number) => Promise<boolean>;
}

/**
 * Hook to monitor network connectivity
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, checkConnectivity } = useNetwork();
 *
 *   if (!isOnline) {
 *     return <div>You are offline</div>;
 *   }
 *
 *   return <div>Connected</div>;
 * }
 * ```
 */
export function useNetwork(): UseNetworkReturn {
  const [isOnline, setIsOnline] = useState(() => networkService.isOnline);

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkService.addListener((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    checkConnectivity: networkService.checkConnectivity.bind(networkService),
    waitForOnline: networkService.waitForOnline.bind(networkService),
  };
}
