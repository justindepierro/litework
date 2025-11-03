-- Migration: Add notification preferences to users table
-- Allows users to customize when and how they receive workout reminders

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

-- Verify the migration
SELECT 
  id,
  email,
  notification_preferences
FROM public.users
LIMIT 5;
