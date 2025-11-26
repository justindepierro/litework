/**
 * Profile Page - Server Component
 * Handles authentication and renders ProfileClient component
 */

import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-server";
import ProfileClient from "./ProfileClient";

// Server Component - Auth check happens on server
export default async function ProfilePage() {
  const { user, error } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  return <ProfileClient user={user} />;
}
