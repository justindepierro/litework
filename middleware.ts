import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/middleware-utils";

/**
 * Get security headers for responses
 */
function getSecurityHeaders() {
  const headers = new Headers();

  // Content Security Policy - Prevent XSS attacks
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://*.supabase.co; " +
      "frame-ancestors 'none';"
  );

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // XSS Protection
  headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - Restrict browser features
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return headers;
}

/**
 * Get compression headers for responses
 * Signals browser that compression is available
 */
function getCompressionHeaders() {
  const headers = new Headers();

  // Vary header tells caches to store different versions based on Accept-Encoding
  headers.set("Vary", "Accept-Encoding");

  return headers;
}

/**
 * Check if response should be compressed
 * Only compress text-based content types
 */
function shouldCompress(pathname: string): boolean {
  // Compress API responses (JSON)
  if (pathname.startsWith("/api/")) return true;

  // Compress HTML pages
  if (!pathname.includes(".")) return true;

  // Compress CSS, JS, SVG
  const compressibleExtensions = [
    ".css",
    ".js",
    ".json",
    ".svg",
    ".xml",
    ".txt",
  ];
  return compressibleExtensions.some((ext) => pathname.endsWith(ext));
}

export async function middleware(request: NextRequest) {
  // Update session first to handle auth cookies
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith("/api/")) {
    // Add security headers
    const securityHeaders = getSecurityHeaders();
    securityHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Add compression headers for API responses
    const compressionHeaders = getCompressionHeaders();
    compressionHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  // Add compression headers to compressible content
  if (shouldCompress(pathname)) {
    const compressionHeaders = getCompressionHeaders();
    compressionHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/workouts/:path*",
    "/progress/:path*",
    "/schedule/:path*",
    "/athletes/:path*",
    "/profile/:path*",
  ],
};
