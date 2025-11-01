// SERVER-SIDE AUTH ONLY
// For use in API routes and server components

import { headers } from "next/headers";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";

export interface User {
  id: string;
  email: string;
  role: "admin" | "coach" | "athlete";
  firstName: string;
  lastName: string;
  fullName: string;
}

// Get current authenticated user in API routes
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get auth token from headers
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token with Supabase
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return null;
    }

    // Get profile with admin client (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email || authUser.email || "",
      role: profile.role,
      firstName: profile.first_name || profile.name?.split(" ")[0] || "",
      lastName: profile.last_name || profile.name?.split(" ")[1] || "",
      fullName: profile.name,
    };
  } catch {
    // Silent fail - auth errors should not expose details
    return null;
  }
}

// Check if user is authenticated
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Check if user has required role
export async function requireRole(
  role: "admin" | "coach" | "athlete"
): Promise<User> {
  const user = await requireAuth();

  // Admin has all permissions
  if (user.role === "admin") return user;

  if (user.role !== role) {
    throw new Error("Forbidden");
  }

  return user;
}

// Check if user is coach or admin
export async function requireCoach(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "coach" && user.role !== "admin") {
    throw new Error("Forbidden - Coach access required");
  }

  return user;
}

// Get admin Supabase client (bypasses RLS)
export function getAdminClient() {
  return supabaseAdmin;
}
