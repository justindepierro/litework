"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncState } from "@/hooks/use-async-state";
import type { NotificationPreferences, NotificationTiming } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Toggle } from "@/components/ui/Toggle";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Heading, Body, Label } from "@/components/ui/Typography";

export default function NotificationPreferencesSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const { isLoading, execute } = useAsyncState<void>();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load current preferences
  useEffect(() => {
    if (user) {
      execute(async () => {
        const response = await fetch("/api/user/preferences");
        const data = await response.json();

        if (data.success) {
          setPreferences(data.preferences);
        }
      });
    }
  }, [user, execute]);

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Preferences saved successfully!",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to save preferences",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateWorkoutReminders = <
    K extends keyof NotificationPreferences["workoutReminders"],
  >(
    key: K,
    value: NotificationPreferences["workoutReminders"][K]
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      workoutReminders: {
        ...preferences.workoutReminders,
        [key]: value,
      },
    });
  };

  const updateNotificationSection = <
    S extends "achievementNotifications" | "assignmentNotifications",
  >(
    section: S,
    key: keyof NotificationPreferences[S],
    value: boolean
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    });
  };

  const toggleChannel = (
    section: keyof NotificationPreferences,
    channel: "email" | "push"
  ) => {
    if (!preferences) return;

    const currentChannels = preferences[section].channels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section],
        channels: newChannels,
      },
    });
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
      <div className="text-center p-8 text-(--text-tertiary)">
        Failed to load notification preferences
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <Heading level="h2" className="mb-2">
          Notification Preferences
        </Heading>
        <Body variant="secondary">
          Customize when and how you receive notifications
        </Body>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-(--status-success-light) text-(--status-success)"
              : "bg-(--status-error-light) text-(--status-error)"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Workout Reminders */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3">Workout Reminders</Heading>
            <p className="text-sm text-(--text-secondary)">
              Get notified about upcoming workouts
            </p>
          </div>
          <Toggle
            checked={preferences.workoutReminders.enabled}
            onChange={(checked) => updateWorkoutReminders("enabled", checked)}
            label=""
            size="md"
          />
        </div>

        {preferences.workoutReminders.enabled && (
          <>
            {/* Timing Options */}
            <div>
              <Label className="block mb-2">Reminder Timing</Label>
              <select
                value={preferences.workoutReminders.timing}
                onChange={(e) =>
                  updateWorkoutReminders(
                    "timing",
                    e.target.value as NotificationTiming
                  )
                }
                className="w-full px-3 py-2 border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="smart">
                  Smart (2 hours before or day before)
                </option>
                <option value="morning">Every morning (7 AM)</option>
                <option value="evening">Every evening (5 PM)</option>
                <option value="2hours">2 hours before workout</option>
                <option value="1hour">1 hour before workout</option>
                <option value="30min">30 minutes before workout</option>
              </select>
              <p className="mt-1 text-xs text-(--text-tertiary)">
                {preferences.workoutReminders.timing === "smart" &&
                  "We'll calculate the best time based on your workout schedule"}
                {preferences.workoutReminders.timing === "morning" &&
                  "You'll get reminders at 7 AM for any workouts scheduled that day"}
                {preferences.workoutReminders.timing === "evening" &&
                  "You'll get reminders at 5 PM for workouts scheduled the next day"}
                {["2hours", "1hour", "30min"].includes(
                  preferences.workoutReminders.timing
                ) &&
                  "You'll get a reminder at this exact time before each workout"}
              </p>
            </div>

            {/* Channels */}
            <div>
              <Label className="block mb-2">Notification Channels</Label>
              <div className="space-y-2">
                <Checkbox
                  checked={preferences.workoutReminders.channels.includes(
                    "email"
                  )}
                  onChange={() => toggleChannel("workoutReminders", "email")}
                  label="Email"
                />
                <Checkbox
                  checked={preferences.workoutReminders.channels.includes(
                    "push"
                  )}
                  onChange={() => toggleChannel("workoutReminders", "push")}
                  disabled
                  label="Push Notifications (Coming soon)"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Achievement Notifications */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3">Achievement Notifications</Heading>
            <p className="text-sm text-(--text-secondary)">
              Get notified when you hit a new PR or milestone
            </p>
          </div>
          <Toggle
            checked={preferences.achievementNotifications.enabled}
            onChange={(checked) =>
              updateNotificationSection(
                "achievementNotifications",
                "enabled",
                checked
              )
            }
            label=""
            size="md"
          />
        </div>
      </div>

      {/* Assignment Notifications */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3">New Workout Assignments</Heading>
            <p className="text-sm text-(--text-secondary)">
              Get notified when your coach assigns a new workout
            </p>
          </div>
          <Toggle
            checked={preferences.assignmentNotifications.enabled}
            onChange={(checked) =>
              updateNotificationSection(
                "assignmentNotifications",
                "enabled",
                checked
              )
            }
            label=""
            size="md"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
          isLoading={isSaving}
          loadingText="Saving..."
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
