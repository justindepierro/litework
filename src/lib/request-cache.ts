/**
 * Request-Level Memoization Cache
 *
 * Caches function results within the same request to avoid duplicate computations.
 * Perfect for:
 * - Nested data fetching
 * - Repeated database queries in the same request
 * - Expensive calculations used multiple times
 *
 * Benefits:
 * - Prevents duplicate API/DB calls in same request
 * - Reduces computation time
 * - Memory-efficient (cleared after request)
 *
 * Usage:
 * ```typescript
 * import { memoize, clearCache } from '@/lib/request-cache';
 *
 * const getUser = memoize(async (id: string) => {
 *   return await db.users.findById(id);
 * });
 *
 * // First call - hits database
 * const user1 = await getUser('123');
 * // Second call - returns cached result
 * const user2 = await getUser('123');
 * ```
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: 'any' is necessary for generic memoization to work with any function signature

// Type for cache key generator
type CacheKey = string | number | boolean | null | undefined;

/**
 * Generate cache key from function arguments
 */
function generateCacheKey(args: CacheKey[]): string {
  return JSON.stringify(args);
}

// Type for cached values
interface CachedValue<T = any> {
  value: T;
  timestamp: number;
}

/**
 * Request-level cache storage
 * Uses Map for efficient lookups and automatic memory management
 */
const requestCache = new Map<string, Map<string, CachedValue>>();

/**
 * Get or create cache for a specific function
 */
function getFunctionCache(fnName: string): Map<string, CachedValue> {
  if (!requestCache.has(fnName)) {
    requestCache.set(fnName, new Map());
  }
  return requestCache.get(fnName)!;
}

/**
 * Memoize an async function for the duration of the request
 *
 * @param fn - Async function to memoize
 * @param options - Memoization options
 * @returns Memoized version of the function
 *
 * @example
 * ```typescript
 * const fetchUser = memoize(async (id: string) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * });
 * ```
 */
export function memoize<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    name?: string;
    ttl?: number; // Time to live in milliseconds
  } = {}
): T {
  const fnName = options.name || fn.name || "anonymous";
  const cache = getFunctionCache(fnName);

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const cacheKey = generateCacheKey(args as CacheKey[]);

    // Check if result is cached and not expired
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);

      if (cached) {
        // Check TTL if specified
        if (options.ttl) {
          const age = Date.now() - cached.timestamp;
          if (age > options.ttl) {
            cache.delete(cacheKey);
          } else {
            return cached.value as Awaited<ReturnType<T>>;
          }
        } else {
          return cached.value as Awaited<ReturnType<T>>;
        }
      }
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(cacheKey, {
      value: result,
      timestamp: Date.now(),
    });

    return result as Awaited<ReturnType<T>>;
  }) as T;
}

/**
 * Clear cache for a specific function or all functions
 *
 * @param fnName - Optional function name to clear. If omitted, clears all.
 *
 * @example
 * ```typescript
 * // Clear specific function cache
 * clearCache('fetchUser');
 *
 * // Clear all caches
 * clearCache();
 * ```
 */
export function clearCache(fnName?: string): void {
  if (fnName) {
    requestCache.delete(fnName);
  } else {
    requestCache.clear();
  }
}

/**
 * Get cache statistics for monitoring
 *
 * @returns Object with cache stats
 */
export function getCacheStats(): {
  functions: number;
  totalEntries: number;
  entriesByFunction: Record<string, number>;
} {
  const entriesByFunction: Record<string, number> = {};
  let totalEntries = 0;

  requestCache.forEach((cache, fnName) => {
    const size = cache.size;
    entriesByFunction[fnName] = size;
    totalEntries += size;
  });

  return {
    functions: requestCache.size,
    totalEntries,
    entriesByFunction,
  };
}

/**
 * Higher-order function to automatically memoize API route handlers
 *
 * @param handler - Next.js API route handler
 * @returns Wrapped handler with automatic cache clearing
 *
 * @example
 * ```typescript
 * export const GET = withRequestCache(async (request) => {
 *   const data = await memoizedFetch();
 *   return NextResponse.json({ data });
 * });
 * ```
 */
export function withRequestCache<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      const result = await handler(...args);
      return result as Awaited<ReturnType<T>>;
    } finally {
      // Clear cache after request completes
      clearCache();
    }
  }) as T;
}

/**
 * Decorator for memoizing class methods
 *
 * @example
 * ```typescript
 * class UserService {
 *   @Memoized()
 *   async getUser(id: string) {
 *     return await db.users.findById(id);
 *   }
 * }
 * ```
 */
export function Memoized(options: { ttl?: number } = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = memoize(originalMethod, {
      name: `${target.constructor.name}.${propertyKey}`,
      ...options,
    });
    return descriptor;
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
