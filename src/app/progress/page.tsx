import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContainer } from "@/components/layout";
import ProgressDashboard from "@/components/ProgressDashboard";
import { TrendingUp } from "lucide-react";

// Server Component - Auth check happens on server
export default async function ProgressPage() {
  const { user, error } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/progress");
  }

  return (
    <PageContainer maxWidth="7xl" background="gradient">
      <div className="mb-6">
        <PageHeader
          title="Progress Tracking"
          subtitle="Monitor your strength gains and workout history"
          icon={<TrendingUp className="w-6 h-6" />}
          gradientVariant="primary"
        />
      </div>
      <ProgressDashboard
        athleteId={user.role === "athlete" ? user.id : undefined}
      />
    </PageContainer>
  );
}
