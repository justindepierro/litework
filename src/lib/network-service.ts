/**
 * Network Detection Service
 *
 * Monitors network connectivity and provides hooks for offline/online state.
 * Handles network change events and provides reliable connectivity status.
 */

type NetworkChangeCallback = (isOnline: boolean) => void;

class NetworkService {
  private listeners: Set<NetworkChangeCallback> = new Set();
  private _isOnline: boolean = true;
  private hasInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this._isOnline = navigator.onLine;
      this.initialize();
    }
  }

  /**
   * Initialize network event listeners
   */
  private initialize(): void {
    if (this.hasInitialized || typeof window === "undefined") return;

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    this.hasInitialized = true;
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    // [REMOVED] console.log("🌐 Network: ONLINE");
    this._isOnline = true;
    this.notifyListeners(true);
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    // [REMOVED] console.log("📡 Network: OFFLINE");
    this._isOnline = false;
    this.notifyListeners(false);
  };

  /**
   * Notify all listeners of network change
   */
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error("Error in network listener:", error);
      }
    });
  }

  /**
   * Get current online status
   */
  get isOnline(): boolean {
    return this._isOnline;
  }

  /**
   * Add a network change listener
   */
  public addListener(callback: NetworkChangeCallback): () => void {
    this.listeners.add(callback);

    // Return cleanup function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Remove a network change listener
   */
  public removeListener(callback: NetworkChangeCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Check network connectivity with a ping
   * Useful for verifying actual connectivity vs browser status
   */
  public async checkConnectivity(): Promise<boolean> {
    if (typeof window === "undefined") return true;

    // First check browser status
    if (!navigator.onLine) {
      return false;
    }

    // Try to fetch a small resource to verify connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn("Connectivity check failed:", error);
      return false;
    }
  }

  /**
   * Wait for network to come online
   * Useful for retrying operations when offline
   */
  public async waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
    if (this._isOnline) return true;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve(false);
      }, timeoutMs);

      const listener = (isOnline: boolean) => {
        if (isOnline) {
          cleanup();
          resolve(true);
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.removeListener(listener);
      };

      this.addListener(listener);
    });
  }

  /**
   * Cleanup event listeners (call on app unmount)
   */
  public cleanup(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
    this.listeners.clear();
    this.hasInitialized = false;
  }
}

// Export singleton instance
export const networkService = new NetworkService();

// Export for testing/alternative instances
export { NetworkService };
