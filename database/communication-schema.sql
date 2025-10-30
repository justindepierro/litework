-- Enhanced Athlete Management Database Schema Extensions
-- Add these tables to support communication, enhanced profiles, and analytics

-- Communication Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  recipient_id UUID REFERENCES public.users(id) NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  parent_message_id UUID REFERENCES public.messages(id), -- For threading
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Preferences table
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) UNIQUE NOT NULL,
  preferred_contact TEXT DEFAULT 'app' CHECK (preferred_contact IN ('app', 'email', 'sms')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  progress_updates BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'workout_assigned', 'progress_milestone', 'workout_reminder', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced athlete profile data
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive', 'suspended'));

-- Activity Log table for tracking user actions
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('workout_completed', 'pr_achieved', 'login', 'profile_updated', 'message_sent')),
  description TEXT NOT NULL,
  metadata JSONB, -- Additional structured data about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Progress Analytics table
CREATE TABLE IF NOT EXISTS public.progress_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_workouts INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_volume DECIMAL DEFAULT 0, -- Total weight × reps
  prs_achieved INTEGER DEFAULT 0,
  workout_streak INTEGER DEFAULT 0,
  avg_workout_duration INTEGER DEFAULT 0, -- in minutes
  top_exercises JSONB, -- JSON array of most frequent exercises
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique analytics per user per period
  UNIQUE(user_id, period_start, period_end)
);

-- Bulk Operations Log for tracking bulk actions
CREATE TABLE IF NOT EXISTS public.bulk_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_by UUID REFERENCES public.users(id) NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('bulk_invite', 'bulk_message', 'bulk_assign_workout', 'bulk_update_status')),
  target_count INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  details JSONB, -- Details about the operation
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(recipient_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON public.activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON public.activity_log(action_type);

CREATE INDEX IF NOT EXISTS idx_progress_analytics_user_period ON public.progress_analytics(user_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_bulk_operations_performed_by ON public.bulk_operations(performed_by);
CREATE INDEX IF NOT EXISTS idx_bulk_operations_status ON public.bulk_operations(status);

CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users(last_activity_at);

-- Row Level Security Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;

-- Messages: Users can send/receive their own messages, coaches can message their athletes
CREATE POLICY "Users can send and receive messages" ON public.messages
  FOR ALL USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Coaches can message their athletes" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND 
    (
      -- Direct coach-athlete relationship
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = recipient_id AND coach_id = auth.uid()
      ) OR
      -- Coach to athletes in their groups
      EXISTS (
        SELECT 1 FROM public.users sender 
        JOIN public.users recipient ON recipient.id = messages.recipient_id
        WHERE sender.id = auth.uid() 
        AND sender.role IN ('coach', 'admin')
        AND recipient.role = 'athlete'
      )
    )
  );

-- Communication preferences: Users can manage their own
CREATE POLICY "Users can manage own communication preferences" ON public.communication_preferences
  FOR ALL USING (user_id = auth.uid());

-- Notifications: Users can view/update their own
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Activity log: Users can view their own, coaches can view their athletes'
CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view athlete activity" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users coach
      JOIN public.users athlete ON athlete.id = activity_log.user_id
      WHERE coach.id = auth.uid() 
      AND coach.role IN ('coach', 'admin')
      AND (athlete.coach_id = auth.uid() OR athlete.role = 'athlete')
    )
  );

-- Progress analytics: Users can view their own, coaches can view their athletes'
CREATE POLICY "Users can view own progress analytics" ON public.progress_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view athlete progress analytics" ON public.progress_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users coach
      JOIN public.users athlete ON athlete.id = progress_analytics.user_id
      WHERE coach.id = auth.uid() 
      AND coach.role IN ('coach', 'admin')
      AND (athlete.coach_id = auth.uid() OR athlete.role = 'athlete')
    )
  );

-- Bulk operations: Only coaches/admins can perform and view
CREATE POLICY "Coaches can manage bulk operations" ON public.bulk_operations
  FOR ALL USING (
    performed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('coach', 'admin')
    )
  );

-- Create updated_at triggers for new tables
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_preferences_updated_at BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create communication preferences for new users
CREATE OR REPLACE FUNCTION create_default_communication_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.communication_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_communication_preferences_for_new_user
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_communication_preferences();

-- Function to update last_activity_at when user performs actions
CREATE OR REPLACE FUNCTION update_user_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET last_activity_at = NOW() 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_activity_on_session
  AFTER INSERT ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_last_activity();

CREATE TRIGGER update_last_activity_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_user_last_activity();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.messages 
  SET is_read = TRUE, read_at = NOW() 
  WHERE id = message_id AND recipient_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.messages 
    WHERE recipient_id = user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;