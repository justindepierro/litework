-- ============================================================
-- In-App Notification Center - Database Schema
-- Created: November 2, 2025
-- ============================================================

-- ============================================================
-- IN-APP NOTIFICATIONS TABLE
-- Stores notifications shown in the notification center
-- ============================================================

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification content
  type TEXT NOT NULL CHECK (type IN ('workout', 'message', 'assignment', 'progress', 'achievement')),
  title TEXT NOT NULL,
  body TEXT,
  icon TEXT,                           -- Emoji or icon name
  url TEXT,                            -- Link to related content
  
  -- Status tracking
  read BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  
  -- Metadata
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  data JSONB,                          -- Additional structured data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Prevent duplicates (same notification within short time)
  UNIQUE(user_id, type, title, created_at)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_in_app_notifs_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifs_unread ON in_app_notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_in_app_notifs_created ON in_app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_in_app_notifs_expires ON in_app_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON in_app_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON in_app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON in_app_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System (service role) can insert notifications
CREATE POLICY "System can insert notifications" ON in_app_notifications
  FOR INSERT WITH CHECK (true);

-- Coaches and admins can view all notifications (for support)
CREATE POLICY "Coaches can view all notifications" ON in_app_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('coach', 'admin')
    )
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to automatically delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM in_app_notifications
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM in_app_notifications
    WHERE user_id = target_user_id
      AND read = false
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to create in-app notification (can be called from other SQL)
CREATE OR REPLACE FUNCTION create_in_app_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO in_app_notifications (
    user_id,
    type,
    title,
    body,
    icon,
    url,
    priority,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_icon,
    p_url,
    p_priority,
    p_data
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEWS
-- ============================================================

-- Drop existing view if it exists (to avoid column mismatch errors)
DROP VIEW IF EXISTS user_notification_summary;

-- View: User notification summary
CREATE VIEW user_notification_summary AS
SELECT 
  u.id as user_id,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(n.id) as total_notifications,
  SUM(CASE WHEN NOT n.read THEN 1 ELSE 0 END) as unread_count,
  MAX(n.created_at) as last_notification_at
FROM users u
LEFT JOIN in_app_notifications n ON n.user_id = u.id
WHERE n.expires_at IS NULL OR n.expires_at > NOW()
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- ============================================================
-- CLEANUP JOB (to be scheduled)
-- ============================================================

-- This should be run daily via cron
-- SELECT delete_expired_notifications();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify table exists
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'in_app_notifications') as column_count
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'in_app_notifications';

-- Verify indexes
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'in_app_notifications'
ORDER BY indexname;

-- Verify RLS policies
SELECT 
  policyname, 
  permissive, 
  cmd
FROM pg_policies
WHERE tablename = 'in_app_notifications'
ORDER BY policyname;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ In-app notification center table created successfully!';
  RAISE NOTICE '📊 Table: in_app_notifications';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '🚀 Ready for notification center UI';
END $$;
