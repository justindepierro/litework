// Simple auth guard hooks for client-side pages

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Require any authenticated user
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "coach" && user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  return { user, isLoading: loading };
}

// Alias for admins
export function useAdminGuard() {
  return useRequireAdmin();
}
