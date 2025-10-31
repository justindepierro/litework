// Hybrid Authentication System for Sprint 4 Transition
// Supports both JWT (legacy) and Supabase Auth (new) during migration

import { NextRequest } from "next/server";
import { verifySupabaseAuth, AuthResult, AuthenticatedUser } from "./supabase-auth";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Legacy JWT auth (for backward compatibility)
function verifyJWTToken(request: NextRequest): AuthResult {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "No valid authorization header found",
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    return {
      success: true,
      user: decoded,
    };
  } catch {
    return {
      success: false,
      error: "Invalid or expired token",
    };
  }
}

// Enhanced verifyToken that tries Supabase first, then falls back to JWT
export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "No valid authorization header found",
      };
    }

    // Try Supabase auth first
    try {
      const supabaseResult = await verifySupabaseAuth(authHeader);
      if (supabaseResult.success) {
        return supabaseResult;
      }
    } catch (error) {
      console.log("Supabase auth failed, trying JWT fallback:", error);
    }

    // Fallback to JWT auth for backward compatibility
    const jwtResult = verifyJWTToken(request);
    return jwtResult;

  } catch (error) {
    console.error("Token verification error:", error);
    return {
      success: false,
      error: "Token verification failed"
    };
  }
}

// Re-export role-based permission helpers for compatibility
export {
  isAdmin,
  isCoach,
  isAthlete,
  canManageGroups,
  canAssignWorkouts,
  canViewAllAthletes,
  canModifyWorkouts
} from "./supabase-auth";

export type { AuthenticatedUser, AuthResult } from "./supabase-auth";

export function requireRole(allowedRoles: string[]) {
  return (user: AuthenticatedUser): boolean => {
    return allowedRoles.includes(user.role);
  };
}