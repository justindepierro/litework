/**
 * Settings Page - Notification Preferences
 */

"use client";

import { useRequireAuth } from "@/hooks/use-auth-guard";
import NotificationPermission from "@/components/NotificationPermission";
import NotificationPreferencesSettings from "@/components/NotificationPreferencesSettings";

export default function SettingsPage() {
  const { user, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and notification preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Push Notification Permission */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Browser Notifications
          </h2>
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
