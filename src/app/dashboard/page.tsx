import { redirect } from "next/navigation";
import DashboardClientPage from "./DashboardClientPage";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { getDashboardBootstrapData } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const initialData = await getDashboardBootstrapData(user);

  return <DashboardClientPage initialData={initialData} />;
}
