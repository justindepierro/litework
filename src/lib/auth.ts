import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

export function verifyToken(request: NextRequest): AuthResult {
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

export function requireRole(allowedRoles: string[]) {
  return (user: AuthenticatedUser): boolean => {
    return allowedRoles.includes(user.role);
  };
}

// Role-based permission helpers
export const isCoach = (user: AuthenticatedUser): boolean => {
  return user.role === "coach" || user.role === "admin";
};

export const isAthlete = (user: AuthenticatedUser): boolean => {
  return user.role === "athlete";
};

export const canManageGroups = (user: AuthenticatedUser): boolean => {
  return user.role === "coach" || user.role === "admin";
};

export const canAssignWorkouts = (user: AuthenticatedUser): boolean => {
  return user.role === "coach" || user.role === "admin";
};

export const canModifyWorkouts = (user: AuthenticatedUser): boolean => {
  return user.role === "coach" || user.role === "admin";
};

export const canViewAllAthletes = (user: AuthenticatedUser): boolean => {
  return user.role === "coach" || user.role === "admin";
};
