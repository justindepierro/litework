// Authentication Guard Hook
// Centralized authentication logic for page-level protection

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredRole?: "coach" | "athlete";
  requireAuth?: boolean;
}

interface AuthGuardReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRequiredRole: boolean;
}

export const useAuthGuard = (
  options: UseAuthGuardOptions = {}
): AuthGuardReturn => {
  const { redirectTo = "/login", requiredRole, requireAuth = true } = options;

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAuthenticated = !!user;
  
  // Check if user has required role
  // Admin role has access to all coach and athlete features
  const hasRequiredRole = !requiredRole || 
    user?.role === requiredRole || 
    user?.role === "admin";

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Redirect if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Redirect if user doesn't have required role
    if (isAuthenticated && requiredRole && !hasRequiredRole) {
      // Redirect based on user's actual role
      if (user?.role === "coach") {
        router.push("/dashboard");
      } else if (user?.role === "athlete") {
        router.push("/progress");
      } else {
        router.push("/");
      }
      return;
    }
  }, [
    user,
    isLoading,
    router,
    redirectTo,
    requiredRole,
    isAuthenticated,
    hasRequiredRole,
    requireAuth,
  ]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRequiredRole,
  };
};

// Specific hooks for common use cases
export const useCoachGuard = (redirectTo?: string) => {
  return useAuthGuard({
    requiredRole: "coach",
    redirectTo: redirectTo || "/login",
  });
};

export const useAthleteGuard = (redirectTo?: string) => {
  return useAuthGuard({
    requiredRole: "athlete",
    redirectTo: redirectTo || "/login",
  });
};

// Hook for pages that require any authenticated user
export const useAnyUserGuard = (redirectTo?: string) => {
  return useAuthGuard({
    redirectTo: redirectTo || "/login",
  });
};

// Hook for public pages that should redirect authenticated users
export const usePublicOnlyGuard = (redirectTo?: string) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      const defaultRedirect =
        user.role === "coach" ? "/dashboard" : "/progress";
      router.push(redirectTo || defaultRedirect);
    }
  }, [user, isLoading, router, redirectTo]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRequiredRole: true, // Not applicable for public pages
  };
};
