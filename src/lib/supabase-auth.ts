// Supabase Authentication Service
// Enhanced auth layer for Sprint 4

import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";
import type { Session } from "@supabase/supabase-js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: "admin" | "coach" | "athlete";
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "coach" | "athlete";
}

// ===========================
// AUTHENTICATION ACTIONS
// ===========================

export const signInWithEmailPassword = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || "Sign in failed",
      };
    }

    // Get user profile from our users table
    const userProfile = await getUserProfile(data.user.id);
    if (!userProfile) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    return {
      success: true,
      user: userProfile,
    };
  } catch (error) {
    console.error("signInWithEmailPassword error:", error);
    return {
      success: false,
      error: "Sign in failed",
    };
  }
};

export const signUpWithEmailPassword = async (
  signUpData: SignUpData
): Promise<AuthResult> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role = "athlete",
    } = signUpData;

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || "Sign up failed",
      };
    }

    // Create user profile in our users table
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user.id,
        email: email,
        name: `${firstName} ${lastName}`,
        role: role,
        group_ids: [],
        status: "active",
      },
    ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Continue even if profile creation fails - can be handled later
    }

    return {
      success: true,
      user: {
        userId: data.user.id,
        email: email,
        role: role,
        name: `${firstName} ${lastName}`,
      },
    };
  } catch (error) {
    console.error("signUpWithEmailPassword error:", error);
    return {
      success: false,
      error: "Sign up failed",
    };
  }
};

export const signOut = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("signOut error:", error);
    return {
      success: false,
      error: "Sign out failed",
    };
  }
};

export const resetPassword = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("resetPassword error:", error);
    return {
      success: false,
      error: "Password reset failed",
    };
  }
};

// ===========================
// SESSION MANAGEMENT
// ===========================

export const getCurrentUser = async (): Promise<AuthResult> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: error?.message || "No authenticated user",
      };
    }

    // Get user profile from our users table
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    return {
      success: true,
      user: userProfile,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return {
      success: false,
      error: "Failed to get current user",
    };
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("getCurrentSession error:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("getCurrentSession error:", error);
    return null;
  }
};

// ===========================
// AUTH STATE LISTENERS
// ===========================

export const onAuthStateChange = (
  callback: (user: AuthenticatedUser | null) => void
) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const userProfile = await getUserProfile(session.user.id);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};

// ===========================
// HELPER FUNCTIONS
// ===========================

const getUserProfile = async (
  userId: string,
  useAdmin = false // Use admin client for server-side calls
): Promise<AuthenticatedUser | null> => {
  try {
    const client = useAdmin ? supabaseAdmin : supabase;
    const { data: userProfile, error } = await client
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !userProfile) {
      console.error("getUserProfile error:", error);
      return null;
    }

    return {
      userId: userProfile.id,
      email: userProfile.email,
      role: userProfile.role as "admin" | "coach" | "athlete",
      name:
        userProfile.full_name ||
        `${userProfile.first_name} ${userProfile.last_name}`,
    };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
};

// ===========================
// API ROUTE HELPERS
// ===========================

export const verifySupabaseAuth = async (
  authorizationHeader?: string | null
): Promise<AuthResult> => {
  try {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "No valid authorization header found",
      };
    }

    const token = authorizationHeader.substring(7); // Remove 'Bearer ' prefix

    // Create a new Supabase client with the user's token for server-side verification
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const { createClient } = await import("@supabase/supabase-js");
    const serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await serverSupabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: error?.message || "Invalid token",
      };
    }

    // Get user profile using the authenticated client
    const { data: userProfile, error: profileError } = await serverSupabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    return {
      success: true,
      user: {
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role as "admin" | "coach" | "athlete",
        name:
          userProfile.full_name ||
          `${userProfile.first_name} ${userProfile.last_name}`,
      },
    };
  } catch (error) {
    console.error("[verifySupabaseAuth] Unexpected error:", error);
    return {
      success: false,
      error: "Token verification failed",
    };
  }
};

// ===========================
// ROLE-BASED PERMISSIONS
// ===========================

export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === "admin";
}

export function isCoach(user: AuthenticatedUser): boolean {
  return user.role === "coach" || user.role === "admin";
}

export function isAthlete(user: AuthenticatedUser): boolean {
  return user.role === "athlete";
}

export function canManageGroups(user: AuthenticatedUser): boolean {
  return user.role === "coach" || user.role === "admin";
}

export function canAssignWorkouts(user: AuthenticatedUser): boolean {
  return user.role === "coach" || user.role === "admin";
}

export function canViewAllAthletes(user: AuthenticatedUser): boolean {
  return user.role === "coach" || user.role === "admin";
}

export function canModifyWorkouts(user: AuthenticatedUser): boolean {
  return user.role === "coach" || user.role === "admin";
}
