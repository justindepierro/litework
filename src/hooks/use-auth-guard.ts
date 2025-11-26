// Enhanced auth guard hooks with proper redirect handling and role checks

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Require any authenticated user
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loading && !user && !hasRedirected.current) {
      // Redirecting to login - silent
      hasRedirected.current = true;
      router.push("/login");
    }
  }, [user?.id, loading, router]);

  return { user, isLoading: loading };
}

// Alias for athletes
export function useAthleteGuard() {
  return useRequireAuth();
}

// Require coach or admin
export function useRequireCoach() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loading && !hasRedirected.current) {
      if (!user) {
        hasRedirected.current = true;
        router.push("/login");
      } else if (user.role !== "coach" && user.role !== "admin") {
        hasRedirected.current = true;
        router.push("/dashboard");
      }
    }
  }, [user?.id, user?.role, loading, router]);

  return { user, isLoading: loading };
}

// Alias for coaches
export function useCoachGuard() {
  return useRequireCoach();
}

// Require admin
export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loading && !hasRedirected.current) {
      if (!user) {
        hasRedirected.current = true;
        router.push("/login");
      } else if (user.role !== "admin") {
        hasRedirected.current = true;
        router.push("/dashboard");
      }
    }
  }, [user?.id, user?.role, loading, router]);

  return { user, isLoading: loading };
}

// Alias for admins
export function useAdminGuard() {
  return useRequireAdmin();
}

// Redirect authenticated users away from public pages (login, signup)
export function useRedirectIfAuthenticated(redirectTo: string = "/dashboard") {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push(redirectTo);
    }
  }, [user?.id, loading, router, redirectTo]);

  return { user, isLoading: loading };
}
