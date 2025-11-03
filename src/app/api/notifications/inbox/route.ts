/**
 * API Route: /api/notifications/inbox
 * Manage in-app notifications using cookie-based authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Helper to create authenticated Supabase client from cookies
 */
async function getAuthenticatedSupabase() {
  // Ensure cookies are accessed (required for Next.js cookie handling)
  await cookies();
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null, error: 'Authentication required' };
  }

  return { supabase, user, error: null };
}

/**
 * GET /api/notifications/inbox
 * Fetch user's in-app notifications
 * 
 * Query params:
 * - limit: number (default: 20)
 * - unread_only: boolean (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedSupabase();
    
    if (authError || !supabase || !user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter for unexpired notifications
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    // Filter for unread only if requested
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw error;
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: unreadCount || 0
    });

  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/inbox
 * Create a new in-app notification (system use only)
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role key for system operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const {
      userId,
      type,
      title,
      body: notificationBody,
      icon,
      url,
      priority,
      data
    } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabaseAdmin
      .from('in_app_notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body: notificationBody,
        icon,
        url,
        priority: priority || 'normal',
        data
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('[API] Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/inbox
 * Mark notification(s) as read
 * 
 * Body:
 * - notificationId: string (single notification)
 * - notificationIds: string[] (multiple notifications)
 * - markAllRead: boolean (mark all as read)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedSupabase();
    
    if (authError || !supabase || !user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all user's notifications as read
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notifications marked as read`
      });
    }

    return NextResponse.json(
      { error: 'No notification IDs provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/inbox
 * Delete notification(s)
 * 
 * Body:
 * - notificationId: string (single notification)
 * - notificationIds: string[] (multiple notifications)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedSupabase();
    
    if (authError || !supabase || !user) {
      return NextResponse.json(
        { error: authError || 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, notificationIds } = body;

    if (notificationId) {
      // Delete single notification
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Notification deleted'
      });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Delete multiple notifications
      const { error } = await supabase
        .from('in_app_notifications')
        .delete()
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notifications deleted`
      });
    }

    return NextResponse.json(
      { error: 'No notification IDs provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
