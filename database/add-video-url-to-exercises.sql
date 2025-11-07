-- Add video_url column to workout_exercises table
-- This allows coaches to add YouTube demonstration videos for exercises

ALTER TABLE workout_exercises 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN workout_exercises.video_url IS 'YouTube URL for exercise demonstration video';

-- Add index for faster lookups when filtering exercises with videos
CREATE INDEX IF NOT EXISTS idx_workout_exercises_video_url 
ON workout_exercises(video_url) 
WHERE video_url IS NOT NULL;
