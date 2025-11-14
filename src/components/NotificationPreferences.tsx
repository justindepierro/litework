/**
 * NotificationPreferences Component
 * User interface for managing notification settings
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { Alert } from "@/components/ui/Alert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAsyncState } from "@/hooks/use-async-state";

interface NotificationPreferencesData {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  workout_reminders: boolean;
  assignment_notifications: boolean;
  message_notifications: boolean;
  progress_updates: boolean;
  achievement_notifications: boolean;
  quiet_hours?: {
    start: string;
    end: string;
    timezone: string;
  };
  preferred_contact: "push" | "email" | "both";
}

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferencesData | null>(null);
  const { isLoading, execute } = useAsyncState<NotificationPreferencesData | null>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { error: toastError } = useToast();

  // Load preferences on mount
  useEffect(() => {
    if (!user) return;
    
    execute(async () => {
      const { data, error } = await apiClient.requestWithResponse<{
        preferences: NotificationPreferencesData;
      }>("/api/notifications/preferences", { toastError });

      if (error) {
        console.error("Failed to load preferences:", error);
        throw new Error(error);
      }

      setPreferences(data?.preferences || null);
      return data?.preferences || null;
    });
  }, [user, execute, toastError]);

  /**
   * Save preferences to database
   */
  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const { error } = await apiClient.requestWithResponse(
        "/api/notifications/preferences",
        {
          method: "PUT",
          body: preferences,
          toastError,
        }
      );

      if (error) {
        throw new Error(error);
      }

      setSuccessMessage("✅ Preferences saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Update a preference field
   */
  const updatePreference = <K extends keyof NotificationPreferencesData>(
    field: K,
    value: NotificationPreferencesData[K]
  ) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <Alert variant="error">Failed to load notification preferences</Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-900">
          Notification Settings
        </h2>
        <p className="mt-1 text-sm text-neutral-dark">
          Manage how and when you receive notifications from LiteWork
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {error && <Alert variant="error">{error}</Alert>}

      {/* Channel Preferences */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">
          Notification Channels
        </h3>

        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="push_enabled"
                className="text-sm font-medium text-navy-900"
              >
                Push Notifications
              </label>
              <p className="text-sm text-neutral">
                Receive instant notifications in your browser
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.push_enabled}
              onClick={() =>
                updatePreference("push_enabled", !preferences.push_enabled)
              }
              className={`${
                preferences.push_enabled ? "bg-primary" : "bg-silver-400"
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.push_enabled ? "translate-x-5" : "translate-x-0"
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="email_enabled"
                className="text-sm font-medium text-navy-900"
              >
                Email Notifications
              </label>
              <p className="text-sm text-neutral">
                Receive notifications via email
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.email_enabled}
              onClick={() =>
                updatePreference("email_enabled", !preferences.email_enabled)
              }
              className={`${
                preferences.email_enabled ? "bg-primary" : "bg-silver-400"
              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences.email_enabled ? "translate-x-5" : "translate-x-0"
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {/* Preferred Contact Method */}
          <div className="pt-4 border-t border-silver-300">
            <label className="text-sm font-medium text-navy-900 block mb-2">
              Preferred Contact Method
            </label>
            <div className="flex gap-4">
              {(["push", "email", "both"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updatePreference("preferred_contact", method)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    preferences.preferred_contact === method
                      ? "bg-info-lightest border-primary text-primary-dark"
                      : "bg-white border-silver-400 text-neutral-darker hover:bg-silver-200"
                  }`}
                >
                  {method === "push" && "Push"}
                  {method === "email" && "Email"}
                  {method === "both" && "Both"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Preferences */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">
          Notification Types
        </h3>

        <div className="space-y-4">
          {/* Workout Reminders */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="workout_reminders"
                type="checkbox"
                checked={preferences.workout_reminders}
                onChange={(e) =>
                  updatePreference("workout_reminders", e.target.checked)
                }
                className="h-4 w-4 rounded border-silver-400 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="workout_reminders"
                className="text-sm font-medium text-navy-900"
              >
                ⏰ Workout Reminders
              </label>
              <p className="text-sm text-neutral">
                Get reminded about scheduled workouts
              </p>
            </div>
          </div>

          {/* Assignment Notifications */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="assignment_notifications"
                type="checkbox"
                checked={preferences.assignment_notifications}
                onChange={(e) =>
                  updatePreference("assignment_notifications", e.target.checked)
                }
                className="h-4 w-4 rounded border-silver-400 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="assignment_notifications"
                className="text-sm font-medium text-navy-900"
              >
                New Assignments
              </label>
              <p className="text-sm text-neutral">
                Get notified when new workouts are assigned to you
              </p>
            </div>
          </div>

          {/* Coach Messages */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="message_notifications"
                type="checkbox"
                checked={preferences.message_notifications}
                onChange={(e) =>
                  updatePreference("message_notifications", e.target.checked)
                }
                className="h-4 w-4 rounded border-silver-400 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="message_notifications"
                className="text-sm font-medium text-navy-900"
              >
                💬 Coach Messages
              </label>
              <p className="text-sm text-neutral">
                Get notified when your coach sends you a message
              </p>
            </div>
          </div>

          {/* Progress Updates */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="progress_updates"
                type="checkbox"
                checked={preferences.progress_updates}
                onChange={(e) =>
                  updatePreference("progress_updates", e.target.checked)
                }
                className="h-4 w-4 rounded border-silver-400 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="progress_updates"
                className="text-sm font-medium text-navy-900"
              >
                Weekly Progress Reports
              </label>
              <p className="text-sm text-neutral">
                Receive weekly summaries of your training progress
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="achievement_notifications"
                type="checkbox"
                checked={preferences.achievement_notifications}
                onChange={(e) =>
                  updatePreference(
                    "achievement_notifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-silver-400 text-primary focus:ring-primary"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="achievement_notifications"
                className="text-sm font-medium text-navy-900"
              >
                Achievements & PRs
              </label>
              <p className="text-sm text-neutral">
                Celebrate when you hit new personal records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  );
}
