import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    securityHeaders.forEach((value, key) => {
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
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

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
