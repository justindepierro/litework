"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardBootstrapData } from "@/lib/dashboard-data";

// Empty initial data - will be loaded client-side
const emptyData: DashboardBootstrapData = {
  stats: null,
  assignments: [],
  workouts: [],
  groups: [],
  athletes: [],
  coachWelcomeMessage: null,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user after loading completes, DashboardClientPage's useAuthGuard will handle redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <DashboardClientPage initialData={emptyData} />;
}
