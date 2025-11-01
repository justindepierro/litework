/**
 * Centralized Authentication Utilities
 *
 * This file provides consistent auth patterns and helper functions
 * to prevent authentication/authorization bugs across the application.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseAuth as verifyToken } from "./supabase-auth";
import type { AuthenticatedUser } from "./supabase-auth";

/**
 * Type for role-based access control
 */
export type Role = "admin" | "coach" | "athlete";
export type Permission =
  | "view-all"
  | "manage-users"
  | "assign-workouts"
  | "manage-groups"
  | "view-own";

/**
 * Role hierarchy: admin > coach > athlete
 * Admin has all permissions of coach and athlete
 * Coach has more permissions than athlete
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  coach: 2,
  athlete: 1,
};

/**
 * Permission matrix: which roles have which permissions
 */
const PERMISSION_MATRIX: Record<Permission, Role[]> = {
  "view-all": ["admin", "coach"],
  "manage-users": ["admin"],
  "assign-workouts": ["admin", "coach"],
  "manage-groups": ["admin", "coach"],
  "view-own": ["admin", "coach", "athlete"],
};

/**
 * Check if a user has a specific role or higher in the hierarchy
 */
export function hasRoleOrHigher(
  user: AuthenticatedUser,
  requiredRole: Role
): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: AuthenticatedUser,
  permission: Permission
): boolean {
  return PERMISSION_MATRIX[permission].includes(user.role);
}

/**
 * Middleware wrapper for API routes that require authentication
 *
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withAuth(request, async (auth) => {
 *     // Your authenticated route logic here
 *     return NextResponse.json({ data: "success" });
 *   });
 * }
 * ```
 */
export async function withAuth(
  request: NextRequest,
  handler: (auth: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const auth = await verifyToken(authHeader);

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Authentication required" },
      { status: 401 }
    );
  }

  return handler(auth.user);
}

/**
 * Middleware wrapper for API routes that require specific permissions
 *
 * Usage:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   return withPermission(request, "assign-workouts", async (auth) => {
 *     // Your protected route logic here
 *     return NextResponse.json({ data: "success" });
 *   });
 * }
 * ```
 */
export async function withPermission(
  request: NextRequest,
  permission: Permission,
  handler: (auth: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    if (!hasPermission(user, permission)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(user);
  });
}

/**
 * Middleware wrapper for API routes that require a specific role
 *
 * Usage:
 * ```ts
 * export async function DELETE(request: NextRequest) {
 *   return withRole(request, "admin", async (auth) => {
 *     // Admin-only route logic here
 *     return NextResponse.json({ data: "deleted" });
 *   });
 * }
 * ```
 */
export async function withRole(
  request: NextRequest,
  requiredRole: Role,
  handler: (auth: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    if (!hasRoleOrHigher(user, requiredRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(user);
  });
}

/**
 * Helper to check if user can access another user's resources
 * - Admins and coaches can access all users
 * - Athletes can only access their own resources
 */
export function canAccessUser(
  requestingUser: AuthenticatedUser,
  targetUserId: string
): boolean {
  // Admins and coaches can access all users
  if (hasPermission(requestingUser, "view-all")) {
    return true;
  }

  // Athletes can only access their own resources
  return requestingUser.userId === targetUserId;
}

/**
 * Common auth error responses
 */
export const AuthErrors = {
  unauthorized: () =>
    NextResponse.json({ error: "Authentication required" }, { status: 401 }),

  forbidden: () =>
    NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),

  notFound: () =>
    NextResponse.json({ error: "Resource not found" }, { status: 404 }),

  badRequest: (message: string) =>
    NextResponse.json({ error: message }, { status: 400 }),

  serverError: (message: string = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),
};

/**
 * Audit log helper for sensitive operations
 */
export function logAuthEvent(
  user: AuthenticatedUser,
  action: string,
  resource: string,
  success: boolean,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId: user.userId,
    userRole: user.role,
    action,
    resource,
    success,
    ...details,
  };

  // In production, this should go to a proper logging service
  // For now, we'll use console.log with a specific prefix for easy filtering
  if (process.env.NODE_ENV === "production") {
    console.log("[AUTH_AUDIT]", JSON.stringify(logEntry));
  } else {
    console.log("[AUTH_AUDIT]", logEntry);
  }
}
