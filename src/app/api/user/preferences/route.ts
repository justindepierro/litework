/**
 * User Notification Preferences API
 * Allows authenticated users to view and update their notification settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasRoleOrHigher, isCoach } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';
import type { NotificationPreferences } from '@/types';

/**
 * GET /api/user/preferences
 * Get current user's notification preferences
 */
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    if (error) {
      throw error;
    }

    // Return default preferences if none set
    const defaultPreferences: NotificationPreferences = {
      workoutReminders: {
        enabled: true,
        timing: 'smart',
        channels: ['email'],
      },
      achievementNotifications: {
        enabled: true,
        channels: ['email'],
      },
      assignmentNotifications: {
        enabled: true,
        channels: ['email'],
      },
    };

    return NextResponse.json({
      success: true,
      preferences: data?.notification_preferences || defaultPreferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notification preferences',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/preferences
 * Update current user's notification preferences
 */
export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const preferences = body.preferences as Partial<NotificationPreferences>;

    if (!preferences) {
      return NextResponse.json(
        {
          success: false,
          error: 'Preferences are required',
        },
        { status: 400 }
      );
    }

    // Get current preferences
    const { data: currentData } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id)
      .single();

    // Merge with existing preferences
    const updatedPreferences = {
      ...(currentData?.notification_preferences || {}),
      ...preferences,
    };

    // Update in database
    const { error } = await supabase
      .from('users')
      .update({
        notification_preferences: updatedPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification preferences',
      },
      { status: 500 }
    );
  }
}
