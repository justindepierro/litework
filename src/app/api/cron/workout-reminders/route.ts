/**
 * Cron Job: Workout Reminders
 * Runs twice daily (7 AM and 5 PM) to send workout reminders
 * 
 * Vercel Cron: 0 7,17 * * * (7 AM and 5 PM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWorkoutReminder } from '@/lib/unified-notification-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * GET /api/cron/workout-reminders
 * Send reminders for workouts scheduled in the next 24 hours
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔔 Starting workout reminder cron job...');

    // Get current time and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);

    // Query assignments scheduled for the next 24 hours
    const { data: assignments, error: assignmentsError } = await supabase
      .from('workout_assignments')
      .select(`
        id,
        scheduled_date,
        athlete_id,
        workout_plan_id,
        workout_plans (
          id,
          name
        )
      `)
      .gte('scheduled_date', now.toISOString())
      .lte('scheduled_date', tomorrow.toISOString())
      .eq('status', 'assigned');

    if (assignmentsError) {
      throw assignmentsError;
    }

    if (!assignments || assignments.length === 0) {
      console.log('✅ No upcoming workouts to remind about');
      return NextResponse.json({
        success: true,
        message: 'No upcoming workouts',
        sent: 0
      });
    }

    console.log(`📋 Found ${assignments.length} upcoming workouts`);

    // Get unique athlete IDs
    const athleteIds = [...new Set(assignments.map(a => a.athlete_id))];

    // Fetch athlete details and preferences
    const { data: athletes, error: athletesError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        notification_preferences (
          workout_reminders
        )
      `)
      .in('id', athleteIds);

    if (athletesError) {
      throw athletesError;
    }

    // Filter athletes who have workout reminders enabled
    const athletesWithReminders = athletes?.filter(
      athlete => athlete.notification_preferences?.[0]?.workout_reminders !== false
    ) || [];

    if (athletesWithReminders.length === 0) {
      console.log('⏭️  No athletes have workout reminders enabled');
      return NextResponse.json({
        success: true,
        message: 'No athletes with reminders enabled',
        sent: 0
      });
    }

    console.log(`👥 ${athletesWithReminders.length} athletes have reminders enabled`);

    // Send reminders
    const reminders = [];
    
    for (const athlete of athletesWithReminders) {
      // Get athlete's upcoming workouts
      const athleteWorkouts = assignments.filter(a => a.athlete_id === athlete.id);
      
      for (const assignment of athleteWorkouts) {
        const workoutPlan = Array.isArray(assignment.workout_plans) 
          ? assignment.workout_plans[0] 
          : assignment.workout_plans;
        const workoutName = workoutPlan?.name || 'Workout';
        const scheduledDate = new Date(assignment.scheduled_date);
        
        // Format time nicely
        const scheduledTime = scheduledDate.toLocaleString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        // Generate workout URL
        const workoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/workouts/view/${assignment.id}`;

        // Send reminder
        reminders.push(
          notifyWorkoutReminder(
            {
              userId: athlete.id,
              email: athlete.email,
              name: athlete.name || 'Athlete'
            },
            workoutName,
            scheduledTime,
            workoutUrl
          )
        );
      }
    }

    const results = await Promise.allSettled(reminders);
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failed = results.filter(r => 
      r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    console.log(`✅ Workout reminders complete: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Workout reminders sent',
      sent: successful,
      failed,
      totalWorkouts: assignments.length,
      athletesNotified: athletesWithReminders.length
    });

  } catch (error) {
    console.error('❌ Error in workout reminders cron:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send workout reminders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
