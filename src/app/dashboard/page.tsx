import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-server";
import DashboardClientPage from "./DashboardClientPage";
import type { DashboardBootstrapData } from "@/lib/dashboard-data";

// Server Component - Auth check happens on server
export default async function DashboardPage() {
  // Server-side auth check - no JavaScript required
  const { user, error } = await getAuthenticatedUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // Empty initial data - will be loaded client-side (role will be added from user)
  const emptyData = {
    stats: undefined,
    assignments: [],
    workouts: [],
    groups: [],
    athletes: [],
    coachWelcomeMessage: undefined,
  };

  // Create data with user role from server
  const dataWithRole: DashboardBootstrapData = {
    ...emptyData,
    role: user.role,
  };

  return <DashboardClientPage initialData={dataWithRole} />;
}
