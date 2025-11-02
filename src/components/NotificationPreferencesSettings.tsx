"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { NotificationPreferences, NotificationTiming } from "@/types";

export default function NotificationPreferencesSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load current preferences
  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        
        if (data.success) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save preferences' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateWorkoutReminders = <K extends keyof NotificationPreferences['workoutReminders']>(
    key: K, 
    value: NotificationPreferences['workoutReminders'][K]
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

  const updateNotificationSection = <S extends 'achievementNotifications' | 'assignmentNotifications'>(
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
    channel: 'email' | 'push'
  ) => {
    if (!preferences) return;
    
    const currentChannels = preferences[section].channels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8 text-gray-500">
        Failed to load notification preferences
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Customize when and how you receive notifications</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Workout Reminders */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workout Reminders</h3>
            <p className="text-sm text-gray-600">Get notified about upcoming workouts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.workoutReminders.enabled}
              onChange={(e) => updateWorkoutReminders('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {preferences.workoutReminders.enabled && (
          <>
            {/* Timing Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Timing
              </label>
              <select
                value={preferences.workoutReminders.timing}
                onChange={(e) => updateWorkoutReminders('timing', e.target.value as NotificationTiming)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="smart">Smart (2 hours before or day before)</option>
                <option value="morning">Every morning (7 AM)</option>
                <option value="evening">Every evening (5 PM)</option>
                <option value="2hours">2 hours before workout</option>
                <option value="1hour">1 hour before workout</option>
                <option value="30min">30 minutes before workout</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {preferences.workoutReminders.timing === 'smart' && 
                  "We'll calculate the best time based on your workout schedule"}
                {preferences.workoutReminders.timing === 'morning' && 
                  "You'll get reminders at 7 AM for any workouts scheduled that day"}
                {preferences.workoutReminders.timing === 'evening' && 
                  "You'll get reminders at 5 PM for workouts scheduled the next day"}
                {['2hours', '1hour', '30min'].includes(preferences.workoutReminders.timing) && 
                  "You'll get a reminder at this exact time before each workout"}
              </p>
            </div>

            {/* Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Channels
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.workoutReminders.channels.includes('email')}
                    onChange={() => toggleChannel('workoutReminders', 'email')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.workoutReminders.channels.includes('push')}
                    onChange={() => toggleChannel('workoutReminders', 'push')}
                    disabled
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Push Notifications <span className="text-xs text-gray-500">(Coming soon)</span>
                  </span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Achievement Notifications */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Achievement Notifications</h3>
            <p className="text-sm text-gray-600">Get notified when you hit a new PR or milestone</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.achievementNotifications.enabled}
              onChange={(e) => updateNotificationSection('achievementNotifications', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Assignment Notifications */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">New Workout Assignments</h3>
            <p className="text-sm text-gray-600">Get notified when your coach assigns a new workout</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.assignmentNotifications.enabled}
              onChange={(e) => updateNotificationSection('assignmentNotifications', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
