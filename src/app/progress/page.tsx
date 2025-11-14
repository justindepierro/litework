"use client";

import { useAthleteGuard } from "@/hooks/use-auth-guard";
import { PageHeader } from "@/components/ui/PageHeader";
import ProgressAnalytics from "@/components/ProgressAnalytics";
import { TrendingUp } from "lucide-react";

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
        <div className="mb-6">
          <PageHeader
            title="Progress Tracking"
            subtitle="Monitor your strength gains and workout history"
            icon={<TrendingUp className="w-6 h-6" />}
            gradientVariant="primary"
          />
        </div>
        <ProgressAnalytics
          athleteId={user!.role === "athlete" ? user!.id : undefined}
        />
      </div>
    </div>
  );
}
