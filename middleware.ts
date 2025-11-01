import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/reset-password", "/clear-sw.html"];

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/workouts", "/progress", "/schedule", "/athletes", "/profile"];

// Routes that require coach/admin role
const COACH_ROUTES = ["/athletes"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

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

  // For now, let client-side guards handle auth
  // Server-side middleware auth would require cookies/session management
  // which we can add later if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/workouts/:path*", 
    "/progress/:path*",
    "/schedule/:path*",
    "/athletes/:path*",
    "/profile/:path*"
  ],
};
