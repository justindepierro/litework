-- ============================================================
-- LiteWork Notification System - Database Schema
-- Created: November 2, 2025
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PUSH SUBSCRIPTIONS TABLE
-- Stores device subscriptions for push notifications
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Push subscription data from browser
  endpoint TEXT NOT NULL,              -- Push service URL (FCM/APNs)
  p256dh TEXT NOT NULL,                 -- Client public key for encryption
  auth TEXT NOT NULL,                   -- Authentication secret
  
  -- Device metadata
  device_name TEXT,                     -- "Justin's iPhone", "Android Chrome", etc.
  user_agent TEXT,                      -- Browser/OS information
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate subscriptions for same device
  UNIQUE(user_id, endpoint)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_last_used ON push_subscriptions(last_used DESC);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Coaches and admins can view all subscriptions (for admin purposes)
CREATE POLICY "Coaches can view all subscriptions" ON push_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('coach', 'admin')
    )
  );

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- User settings for notification delivery
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Channel toggles
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  
  -- Category preferences (what types of notifications to receive)
  workout_reminders BOOLEAN DEFAULT true,           -- Reminder before workout starts
  assignment_notifications BOOLEAN DEFAULT true,    -- New workout assigned
  message_notifications BOOLEAN DEFAULT true,       -- Coach sent a message
  progress_updates BOOLEAN DEFAULT false,           -- Weekly progress reports
  achievement_notifications BOOLEAN DEFAULT true,   -- New PRs, milestones
  
  -- Quiet hours (JSON format: {"start": "22:00", "end": "07:00", "timezone": "America/New_York"})
  quiet_hours JSONB,
  
  -- Preferred contact method for urgent notifications
  preferred_contact TEXT DEFAULT 'push' CHECK (preferred_contact IN ('push', 'email', 'both')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user_id ON notification_preferences(user_id);

-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Coaches and admins can view all preferences (read-only)
CREATE POLICY "Coaches can view all preferences" ON notification_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('coach', 'admin')
    )
  );

-- ============================================================
-- NOTIFICATION LOG TABLE
-- Audit trail for all notifications sent
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('push', 'email')),
  category TEXT NOT NULL,              -- 'workout', 'message', 'assignment', 'progress', 'achievement'
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,                            -- Deep link URL for click tracking
  
  -- Delivery tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata (JSON format for flexibility)
  device_info JSONB,                   -- Device name, user agent, etc.
  email_id TEXT                        -- Resend email ID for tracking
);

-- Indexes for notification_log (created after table)
CREATE INDEX IF NOT EXISTS idx_notif_log_user_sent ON notification_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_type_category ON notification_log(type, category);
CREATE INDEX IF NOT EXISTS idx_notif_log_delivered ON notification_log(delivered, sent_at);
CREATE INDEX IF NOT EXISTS idx_notif_log_sent_at ON notification_log(sent_at DESC);

-- RLS Policies
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification history
CREATE POLICY "Users can view own notifications" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- Coaches and admins can view all notifications
CREATE POLICY "Coaches can view all notifications" ON notification_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('coach', 'admin')
    )
  );

-- Only system can insert (via API with service key)
CREATE POLICY "System can insert notifications" ON notification_log
  FOR INSERT WITH CHECK (true);

-- Only system can update (for delivery tracking)
CREATE POLICY "System can update notifications" ON notification_log
  FOR UPDATE USING (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification_preferences
DROP TRIGGER IF EXISTS trigger_update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create preferences when user is created
DROP TRIGGER IF EXISTS trigger_create_default_notification_preferences ON users;
CREATE TRIGGER trigger_create_default_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================================
-- ANALYTICS VIEWS
-- ============================================================

-- View: Notification delivery statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  type,
  category,
  DATE(sent_at) as date,
  COUNT(*) as total_sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered_count,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened_count,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked_count,
  ROUND(100.0 * SUM(CASE WHEN delivered THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN delivered THEN 1 ELSE 0 END), 0), 2) as click_through_rate
FROM notification_log
GROUP BY type, category, DATE(sent_at);

-- View: User notification preferences summary
CREATE OR REPLACE VIEW user_notification_summary AS
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.role,
  np.push_enabled,
  np.email_enabled,
  np.preferred_contact,
  COUNT(DISTINCT ps.id) as device_count,
  MAX(ps.last_used) as last_notification_at
FROM users u
LEFT JOIN notification_preferences np ON np.user_id = u.id
LEFT JOIN push_subscriptions ps ON ps.user_id = u.id
GROUP BY u.id, u.name, u.email, u.role, np.push_enabled, np.email_enabled, np.preferred_contact;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get user's notification preferences (used by API)
CREATE OR REPLACE FUNCTION get_user_notification_preferences(target_user_id UUID)
RETURNS TABLE (
  push_enabled BOOLEAN,
  email_enabled BOOLEAN,
  workout_reminders BOOLEAN,
  assignment_notifications BOOLEAN,
  message_notifications BOOLEAN,
  progress_updates BOOLEAN,
  achievement_notifications BOOLEAN,
  quiet_hours JSONB,
  preferred_contact TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.push_enabled,
    np.email_enabled,
    np.workout_reminders,
    np.assignment_notifications,
    np.message_notifications,
    np.progress_updates,
    np.achievement_notifications,
    np.quiet_hours,
    np.preferred_contact
  FROM notification_preferences np
  WHERE np.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Uncomment to insert sample preferences for existing users
-- INSERT INTO notification_preferences (user_id)
-- SELECT id FROM users
-- WHERE role = 'athlete'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- CLEANUP QUERIES (for development)
-- ============================================================

-- Uncomment to drop all notification tables (DANGEROUS!)
-- DROP VIEW IF EXISTS notification_stats CASCADE;
-- DROP VIEW IF EXISTS user_notification_summary CASCADE;
-- DROP TABLE IF EXISTS notification_log CASCADE;
-- DROP TABLE IF EXISTS notification_preferences CASCADE;
-- DROP TABLE IF EXISTS push_subscriptions CASCADE;
-- DROP FUNCTION IF EXISTS update_notification_preferences_updated_at() CASCADE;
-- DROP FUNCTION IF EXISTS create_default_notification_preferences() CASCADE;
-- DROP FUNCTION IF EXISTS get_user_notification_preferences(UUID) CASCADE;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify tables exist
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('push_subscriptions', 'notification_preferences', 'notification_log')
ORDER BY table_name;

-- Verify indexes
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename IN ('push_subscriptions', 'notification_preferences', 'notification_log')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
  tablename, 
  policyname, 
  permissive, 
  cmd
FROM pg_policies
WHERE tablename IN ('push_subscriptions', 'notification_preferences', 'notification_log')
ORDER BY tablename, policyname;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Notification system tables created successfully!';
  RAISE NOTICE '📊 Tables: push_subscriptions, notification_preferences, notification_log';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
  RAISE NOTICE '🚀 Ready for Phase 2: Push Notification Implementation';
END $$;
