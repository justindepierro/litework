/**
 * API Response Caching Utilities
 *
 * Add cache headers to API responses for better performance
 */

import { NextResponse } from "next/server";

/**
 * Cache durations in seconds
 */
export const CacheDurations = {
  /** 1 minute - frequently changing data */
  SHORT: 60,
  /** 5 minutes - occasionally changing data */
  MEDIUM: 300,
  /** 15 minutes - rarely changing data */
  LONG: 900,
  /** 1 hour - static data */
  VERY_LONG: 3600,
  /** No cache */
  NONE: 0,
};

/**
 * Create a cached JSON response
 *
 * @param data - Data to return
 * @param duration - Cache duration in seconds
 * @param staleWhileRevalidate - Additional time to serve stale content while revalidating
 *
 * @example
 * return cachedResponse(
 *   { success: true, data: workouts },
 *   CacheDurations.MEDIUM
 * );
 */
export function cachedResponse<T>(
  data: T,
  duration: number = CacheDurations.SHORT,
  staleWhileRevalidate: number = 300
) {
  const headers: Record<string, string> = {};

  if (duration > 0) {
    headers["Cache-Control"] =
      `public, s-maxage=${duration}, stale-while-revalidate=${staleWhileRevalidate}`;
  } else {
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
  }

  return NextResponse.json(data, { headers });
}

/**
 * Create a no-cache JSON response (for mutations, user-specific data)
 *
 * @example
 * return noCacheResponse({ success: true, message: 'Workout created' });
 */
export function noCacheResponse<T>(data: T) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/**
 * Conditional caching based on authentication
 * - Authenticated requests: no cache (user-specific)
 * - Public requests: cache
 */
export function conditionalCache<T>(
  data: T,
  isAuthenticated: boolean,
  duration: number = CacheDurations.SHORT
) {
  if (isAuthenticated) {
    return noCacheResponse(data);
  }

  return cachedResponse(data, duration);
}

/**
 * ETag-based caching for unchanged resources
 *
 * @param request - Incoming request
 * @param data - Data to return
 * @param etag - ETag value (usually a hash of the data)
 *
 * @returns 304 Not Modified if ETag matches, otherwise 200 with data
 */
export function etagResponse<T>(request: Request, data: T, etag: string) {
  const ifNoneMatch = request.headers.get("If-None-Match");

  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  return NextResponse.json(data, {
    headers: {
      ETag: etag,
      "Cache-Control": "public, max-age=60",
    },
  });
}

/**
 * Generate an ETag from data
 * Simple hash function for demo purposes
 * In production, use a proper hash function like crypto.createHash
 */
export function generateETag(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `W/"${Math.abs(hash).toString(36)}"`;
}
