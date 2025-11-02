/**
 * Group Membership API
 * Manage athlete assignments to groups
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/groups/members
 * Add athlete(s) to a group
 */
export async function POST(request: NextRequest) {
  return withRole(request, 'coach', async () => {
    try {
      const body = await request.json();
      const { groupId, athleteIds } = body;

      if (!groupId || !athleteIds || !Array.isArray(athleteIds)) {
        return NextResponse.json(
          { success: false, error: 'Group ID and athlete IDs required' },
          { status: 400 }
        );
      }

      // Check if group exists
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        return NextResponse.json(
          { success: false, error: 'Group not found' },
          { status: 404 }
        );
      }

      // Add athletes to group
      const memberships = athleteIds.map(athleteId => ({
        group_id: groupId,
        user_id: athleteId
      }));

      const { data, error } = await supabase
        .from('group_members')
        .insert(memberships)
        .select();

      if (error) {
        // Handle duplicate key errors gracefully
        if (error.code === '23505') {
          return NextResponse.json({
            success: true,
            message: 'Some athletes were already in this group',
            memberships: []
          });
        }
        throw error;
      }

      return NextResponse.json({
        success: true,
        memberships: data,
        message: `Added ${athleteIds.length} athlete(s) to group`
      });

    } catch (error) {
      console.error('Add group members error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add athletes to group' },
        { status: 500 }
      );
    }
  });
}

/**
 * DELETE /api/groups/members
 * Remove athlete from a group
 */
export async function DELETE(request: NextRequest) {
  return withRole(request, 'coach', async () => {
    try {
      const { searchParams } = new URL(request.url);
      const groupId = searchParams.get('groupId');
      const athleteId = searchParams.get('athleteId');

      if (!groupId || !athleteId) {
        return NextResponse.json(
          { success: false, error: 'Group ID and athlete ID required' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', athleteId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Athlete removed from group'
      });

    } catch (error) {
      console.error('Remove group member error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove athlete from group' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/groups/members?groupId=xxx
 * Get all athletes in a group
 */
export async function GET(request: NextRequest) {
  return withRole(request, 'coach', async () => {
    try {
      const { searchParams } = new URL(request.url);
      const groupId = searchParams.get('groupId');

      if (!groupId) {
        return NextResponse.json(
          { success: false, error: 'Group ID required' },
          { status: 400 }
        );
      }

      const { data: members, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          users!inner (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const athletes = members?.map(m => m.users) || [];

      return NextResponse.json({
        success: true,
        athletes
      });

    } catch (error) {
      console.error('Get group members error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to get group members' },
        { status: 500 }
      );
    }
  });
}
