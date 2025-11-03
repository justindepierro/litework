/**
 * API Route: /api/notifications/preferences
 * Manage user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasRoleOrHigher, isCoach } from '@/lib/auth-server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
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
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist, create defaults
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            push_enabled: true,
            email_enabled: true,
            workout_reminders: true,
            assignment_notifications: true,
            message_notifications: true,
            progress_updates: false,
            achievement_notifications: true,
            preferred_contact: 'push'
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return NextResponse.json({
          success: true,
          preferences: newPrefs
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      preferences: data
    });

  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validate preferences
    const allowedFields = [
      'push_enabled',
      'email_enabled',
      'workout_reminders',
      'assignment_notifications',
      'message_notifications',
      'progress_updates',
      'achievement_notifications',
      'quiet_hours',
      'preferred_contact'
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update preferences
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      preferences: data
    });

  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
