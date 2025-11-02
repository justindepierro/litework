/**
 * Today's Schedule API
 * GET /api/analytics/today-schedule
 * 
 * Returns scheduled workouts for today with completion status
 * For coaches/admins only
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  return withRole(request, 'coach', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch all assignments scheduled for today
      const { data: assignments, error: assignmentError } = await supabase
        .from('workout_assignments')
        .select(`
          id,
          scheduled_date,
          group_id,
          workout_id,
          groups!inner (
            id,
            name
          ),
          workouts!inner (
            id,
            name
          )
        `)
        .gte('scheduled_date', today.toISOString())
        .lt('scheduled_date', tomorrow.toISOString())
        .order('scheduled_date', { ascending: true });

      if (assignmentError) throw assignmentError;

      if (!assignments || assignments.length === 0) {
        return NextResponse.json({
          success: true,
          workouts: []
        });
      }

      // For each assignment, get athlete count and completion count
      const workoutsWithStats = await Promise.all(
        assignments.map(async (assignment) => {
          // Get total athletes in group
          const { data: groupMembers, error: memberError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', assignment.group_id);

          if (memberError) throw memberError;

          const athleteCount = groupMembers?.length || 0;

          // Get completed sessions for this assignment
          const { data: sessions, error: sessionError } = await supabase
            .from('workout_sessions')
            .select('id')
            .eq('assignment_id', assignment.id)
            .not('completed_at', 'is', null);

          if (sessionError) throw sessionError;

          const completedCount = sessions?.length || 0;

          // Parse time from scheduled_date
          const scheduledDate = new Date(assignment.scheduled_date);
          const startTime = scheduledDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          // Assume 1 hour duration if not specified
          const endDate = new Date(scheduledDate);
          endDate.setHours(endDate.getHours() + 1);
          const endTime = endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          const workout = Array.isArray(assignment.workouts) ? assignment.workouts[0] : assignment.workouts;
          const group = Array.isArray(assignment.groups) ? assignment.groups[0] : assignment.groups;

          return {
            id: assignment.id,
            workoutName: workout?.name || 'Unknown Workout',
            groupName: group?.name || 'Unknown Group',
            athleteCount,
            completedCount,
            startTime,
            endTime
          };
        })
      );

      return NextResponse.json({
        success: true,
        workouts: workoutsWithStats
      });

    } catch (error) {
      console.error('Today schedule error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch today\'s schedule',
          workouts: []
        },
        { status: 500 }
      );
    }
  });
}
