/**
 * Settings Page - Notification Preferences
 */

"use client";

import { useRequireAuth } from "@/hooks/use-auth-guard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/Typography";
import NotificationPermission from "@/components/NotificationPermission";
import NotificationPreferencesSettings from "@/components/NotificationPreferencesSettings";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <PageHeader
          title="Settings"
          subtitle="Manage your account and notification preferences"
          icon={<SettingsIcon className="w-6 h-6" />}
          gradientVariant="primary"
        />
      </div>

      <div className="space-y-8">
        {/* Push Notification Permission */}
        <div>
          <Heading level="h2" className="mb-4">
            Browser Notifications
          </Heading>
          <NotificationPermission />
        </div>

        {/* Notification Preferences */}
        <div>
          <NotificationPreferencesSettings />
        </div>
      </div>
    </div>
  );
}
