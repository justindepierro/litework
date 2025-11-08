/**
 * Cron Job: Workout Reminders
 * Runs multiple times daily to send workout reminders based on user preferences
 * 
 * Smart Timing: Sends reminders at optimal times based on workout schedule
 * - 2 hours before workout (if workout is today)
 * - Day before at 5 PM (if workout is tomorrow)
 * 
 * Fixed Timing Options:
 * - Morning: 7 AM daily
 * - Evening: 5 PM daily
 * - 2 hours before workout
 * - 1 hour before workout
 * - 30 minutes before workout
 * 
 * Vercel Cron: 0 7,9,11,13,15,17,19,21 * * * (Every 2 hours from 7 AM to 9 PM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyWorkoutReminder } from '@/lib/unified-notification-service';
import { transformToCamel, transformToSnake } from "@/lib/case-transform";

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
 * Send reminders based on user preferences and workout schedules
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON] Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // [REMOVED] console.log('[CRON] Starting workout reminder cron job...');

    const now = new Date();
    const currentHour = now.getHours();
    
    // Define time windows for different reminder types
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const twoHoursFromNow = new Date(now);
    twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
    
    const oneHourFromNow = new Date(now);
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const thirtyMinFromNow = new Date(now);
    thirtyMinFromNow.setMinutes(thirtyMinFromNow.getMinutes() + 30);

    // Query assignments scheduled within relevant time windows
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
      // [REMOVED] console.log('[CRON] No upcoming workouts to remind about');
      return NextResponse.json({
        success: true,
        message: 'No upcoming workouts',
        sent: 0
      });
    }

    // [REMOVED] console.log(`[CRON] Found ${assignments.length} upcoming workouts`);

    // Get unique athlete IDs
    const athleteIds = [...new Set(assignments.map(a => a.athlete_id))];

    // Fetch athlete details with new notification preferences
    const { data: athletes, error: athletesError } = await supabase
      .from('users')
      .select('id, email, name, notification_preferences')
      .in('id', athleteIds);

    if (athletesError) {
      throw athletesError;
    }

    // Filter athletes who have workout reminders enabled
    const athletesWithReminders = athletes?.filter(athlete => {
      const prefs = athlete.notification_preferences;
      return prefs?.workoutReminders?.enabled !== false;
    }) || [];

    if (athletesWithReminders.length === 0) {
      // [REMOVED] console.log('[CRON] No athletes have workout reminders enabled');
      return NextResponse.json({
        success: true,
        message: 'No athletes with reminders enabled',
        sent: 0
      });
    }

    // [REMOVED] console.log(`[CRON] ${athletesWithReminders.length} athletes have reminders enabled`);

    // Send reminders based on user preferences
    const reminders = [];
    
    for (const athlete of athletesWithReminders) {
      const prefs = athlete.notification_preferences?.workoutReminders;
      const timing = prefs?.timing || 'smart';
      const channels = prefs?.channels || ['email'];
      
      // Skip if email is not in channels (for now, only email is supported)
      if (!channels.includes('email')) {
        continue;
      }

      // Get athlete's upcoming workouts
      const athleteWorkouts = assignments.filter(a => a.athlete_id === athlete.id);
      
      for (const assignment of athleteWorkouts) {
        const scheduledDate = new Date(assignment.scheduled_date);
        const hoursUntilWorkout = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Determine if we should send a reminder based on timing preference
        let shouldSend = false;
        
        switch (timing) {
          case 'smart':
            // Smart timing: 2 hours before if today, or day before at 5 PM
            if (hoursUntilWorkout <= 2.5 && hoursUntilWorkout >= 1.5) {
              shouldSend = true; // 2 hours before
            } else if (hoursUntilWorkout >= 22 && hoursUntilWorkout <= 26 && currentHour === 17) {
              shouldSend = true; // Day before at 5 PM
            }
            break;
            
          case 'morning':
            // Send at 7 AM if workout is today or tomorrow
            if (currentHour === 7 && hoursUntilWorkout <= 24) {
              shouldSend = true;
            }
            break;
            
          case 'evening':
            // Send at 5 PM if workout is today or tomorrow
            if (currentHour === 17 && hoursUntilWorkout <= 24) {
              shouldSend = true;
            }
            break;
            
          case '2hours':
            // Send 2 hours before workout
            if (hoursUntilWorkout <= 2.5 && hoursUntilWorkout >= 1.5) {
              shouldSend = true;
            }
            break;
            
          case '1hour':
            // Send 1 hour before workout
            if (hoursUntilWorkout <= 1.5 && hoursUntilWorkout >= 0.5) {
              shouldSend = true;
            }
            break;
            
          case '30min':
            // Send 30 minutes before workout
            if (hoursUntilWorkout <= 0.75 && hoursUntilWorkout >= 0.25) {
              shouldSend = true;
            }
            break;
        }
        
        if (!shouldSend) {
          continue;
        }

        const workoutPlan = Array.isArray(assignment.workout_plans) 
          ? assignment.workout_plans[0] 
          : assignment.workout_plans;
        const workoutName = workoutPlan?.name || 'Workout';
        
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
        // [REMOVED] console.log(`[CRON] Sending reminder to ${athlete.name} for "${workoutName}" (timing: ${timing})`);
        
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

    if (reminders.length === 0) {
      // [REMOVED] console.log('[CRON] No reminders to send at this time');
      return NextResponse.json({
        success: true,
        message: 'No reminders scheduled for this time',
        sent: 0,
        totalWorkouts: assignments.length,
        athletesChecked: athletesWithReminders.length
      });
    }

    const results = await Promise.allSettled(reminders);
    
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length;
    
    const failed = results.filter(r => 
      r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    // [REMOVED] console.log(`[CRON] Workout reminders complete: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Workout reminders sent',
      sent: successful,
      failed,
      totalWorkouts: assignments.length,
      athletesNotified: athletesWithReminders.length
    });

  } catch (error) {
    console.error('[CRON] Error in workout reminders cron:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send workout reminders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
