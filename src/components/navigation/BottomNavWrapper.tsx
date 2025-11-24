"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

/**
 * Wrapper component to conditionally render BottomNav
 * Only shows for authenticated athletes on mobile-appropriate pages
 */
export function BottomNavWrapper() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Only show for athletes (not coaches/admins)
  if (!user || user.role !== "athlete") {
    return null;
  }

  // Don't show on certain pages
  const excludedPaths = [
    "/login",
    "/register",
    "/onboarding",
    "/setup",
    "/workouts/live", // Don't show during active workouts
  ];

  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return <BottomNav />;
}
