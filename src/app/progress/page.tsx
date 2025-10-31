"use client";

import { useAthleteGuard } from "@/hooks/use-auth-guard";
import ProgressAnalytics from "@/components/ProgressAnalytics";

export default function ProgressPage() {
  const { user, isLoading } = useAthleteGuard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-heading-secondary text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary container-responsive section-spacing px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <ProgressAnalytics
          athleteId={user!.role === "athlete" ? user!.id : undefined}
        />
      </div>
    </div>
  );
}
