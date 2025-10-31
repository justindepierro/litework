// API Request Caching and Optimization Service
// Optimizes API calls for mobile performance and gym WiFi scenarios

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number;
  maxCacheSize: number;
  enableOfflineMode: boolean;
}

class ApiCacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxCacheSize: 100,
      enableOfflineMode: true,
      ...config,
    };
  }

  /**
   * Get cache key for request
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || "GET";
    const body = options?.body || "";
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }

    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );

      const toRemove = entries.slice(
        0,
        this.cache.size - this.config.maxCacheSize
      );
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Enhanced fetch with caching and mobile optimizations
   */
  async cachedFetch<T>(
    url: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);
    const ttl = cacheTTL || this.config.defaultTTL;

    // Check cache first (except for POST/PUT/DELETE requests)
    if (
      (!options.method || options.method === "GET") &&
      this.cache.has(cacheKey)
    ) {
      const entry = this.cache.get(cacheKey) as CacheEntry<T>;
      if (this.isCacheValid(entry)) {
        return entry.data;
      }
    }

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Create new request with mobile optimizations
    const requestPromise = this.performRequest<T>(url, options, ttl, cacheKey);

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform the actual request with optimizations
   */
  private async performRequest<T>(
    url: string,
    options: RequestInit,
    ttl: number,
    cacheKey: string
  ): Promise<T> {
    // Add mobile-friendly headers
    const enhancedOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // Prefer compressed responses
        "Accept-Encoding": "gzip, deflate, br",
        // Cache control for mobile
        "Cache-Control": "max-age=300",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, enhancedOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;

      // Cache successful GET requests
      if (!options.method || options.method === "GET") {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        // Cleanup cache periodically
        this.cleanupCache();
      }

      return data;
    } catch (error) {
      // If offline and cache available, return cached data
      if (
        !navigator.onLine &&
        this.config.enableOfflineMode &&
        this.cache.has(cacheKey)
      ) {
        const entry = this.cache.get(cacheKey) as CacheEntry<T>;
        console.warn("Using stale cache data due to offline status");
        return entry.data;
      }

      throw error;
    }
  }

  /**
   * Prefetch data for better performance
   */
  async prefetch(url: string, options: RequestInit = {}): Promise<void> {
    try {
      await this.cachedFetch(url, options);
    } catch (error) {
      // Prefetch failures shouldn't break the app
      console.warn(`Prefetch failed for ${url}:`, error);
    }
  }

  /**
   * Batch prefetch multiple URLs
   */
  async prefetchBatch(
    requests: Array<{ url: string; options?: RequestInit }>
  ): Promise<void> {
    const promises = requests.map(({ url, options }) =>
      this.prefetch(url, options)
    );
    await Promise.allSettled(promises);
  }

  /**
   * Clear cache (useful for logout or data refresh)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const validEntries = Array.from(this.cache.values()).filter((entry) =>
      this.isCacheValid(entry)
    );

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      pendingRequests: this.pendingRequests.size,
      cacheHitRatio: validEntries.length / Math.max(this.cache.size, 1),
    };
  }
}

// Create singleton instance
export const apiCache = new ApiCacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 50, // Smaller for mobile
  enableOfflineMode: true,
});

// Enhanced API client with caching
export class CachedApiClient {
  private baseUrl: string;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string, cacheTTL?: number): Promise<T> {
    return apiCache.cachedFetch<T>(
      `${this.baseUrl}${endpoint}`,
      {
        method: "GET",
      },
      cacheTTL
    );
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return apiCache.cachedFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return apiCache.cachedFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return apiCache.cachedFetch<T>(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });
  }

  // Prefetch critical data on app load
  async prefetchCriticalData(): Promise<void> {
    await apiCache.prefetchBatch([
      { url: `${this.baseUrl}/api/workouts` },
      { url: `${this.baseUrl}/api/exercises` },
      { url: `${this.baseUrl}/api/groups` },
    ]);
  }
}

export default apiCache;
