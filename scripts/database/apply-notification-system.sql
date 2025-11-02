-- Combined Migration: Notification Preferences System
-- This script applies both the notification preferences column and the auto-profile-creation trigger
-- Run this in Supabase SQL Editor

-- ====================
-- PART 1: Add notification preferences column
-- ====================

-- Add notification_preferences column with default settings
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "workoutReminders": {
    "enabled": true,
    "timing": "smart",
    "channels": ["email"]
  },
  "achievementNotifications": {
    "enabled": true,
    "channels": ["email"]
  },
  "assignmentNotifications": {
    "enabled": true,
    "channels": ["email"]
  }
}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.users.notification_preferences IS 
'User notification preferences in JSONB format:
{
  "workoutReminders": {
    "enabled": boolean,
    "timing": "smart" | "morning" | "evening" | "2hours" | "1hour" | "30min",
    "channels": ["email", "push"]
  },
  "achievementNotifications": {
    "enabled": boolean,
    "channels": ["email", "push"]
  },
  "assignmentNotifications": {
    "enabled": boolean,
    "channels": ["email", "push"]
  }
}';

-- Update existing users to have default preferences if null
UPDATE public.users 
SET notification_preferences = '{
  "workoutReminders": {
    "enabled": true,
    "timing": "smart",
    "channels": ["email"]
  },
  "achievementNotifications": {
    "enabled": true,
    "channels": ["email"]
  },
  "assignmentNotifications": {
    "enabled": true,
    "channels": ["email"]
  }
}'::jsonb
WHERE notification_preferences IS NULL;

-- ====================
-- PART 2: Add user creation trigger
-- ====================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
      NEW.email
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO service_role;

-- Add comments
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a user profile when a new auth user is created';

-- ====================
-- VERIFICATION QUERIES
-- ====================

-- Check that the column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'notification_preferences';

-- Check that the trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- Check that existing users have preferences
SELECT 
  id,
  email,
  notification_preferences IS NOT NULL as has_preferences,
  notification_preferences->>'workoutReminders' as workout_prefs
FROM public.users
LIMIT 5;
