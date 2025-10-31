// Authentication System - Sprint 4 Enhanced
// Uses hybrid approach: Supabase Auth with JWT fallback

import { NextRequest } from "next/server";
import { verifyToken as verifyHybridToken } from "./auth-hybrid";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: "admin" | "coach" | "athlete";
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

// Main auth verification function (now async for Supabase)
export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  return await verifyHybridToken(request);
}

// Re-export role-based helpers
export {
  isAdmin,
  isCoach,
  isAthlete,
  canManageGroups,
  canAssignWorkouts,
  canViewAllAthletes,
  canModifyWorkouts,
  requireRole
} from "./auth-hybrid";
