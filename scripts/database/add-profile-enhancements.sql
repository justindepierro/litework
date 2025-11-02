-- ============================================================
-- Profile Enhancements - Database Schema
-- Created: November 2, 2025
-- Adds profile pictures and athlete metrics
-- ============================================================

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS height_inches NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS weight_lbs NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on avatar_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url) WHERE avatar_url IS NOT NULL;

-- Create index on date_of_birth for age calculations
CREATE INDEX IF NOT EXISTS idx_users_dob ON users(date_of_birth) WHERE date_of_birth IS NOT NULL;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(height_in NUMERIC, weight_lb NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  IF height_in IS NULL OR weight_lb IS NULL OR height_in <= 0 OR weight_lb <= 0 THEN
    RETURN NULL;
  END IF;
  -- BMI = (weight in lbs / (height in inches)^2) * 703
  RETURN ROUND((weight_lb / (height_in * height_in)) * 703, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_timestamp ON users;
CREATE TRIGGER trigger_update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ============================================================
-- STORAGE BUCKET FOR PROFILE PICTURES
-- ============================================================

-- Create storage bucket for avatars (run this in Supabase Dashboard → Storage)
-- Bucket name: avatars
-- Public: true (for easy access)
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Note: You'll need to create the bucket manually in Supabase Dashboard
-- Then set up RLS policies for the bucket

-- ============================================================
-- VIEWS
-- ============================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS users_with_metrics;

-- View: Users with calculated metrics
CREATE VIEW users_with_metrics AS
SELECT 
  u.*,
  calculate_age(u.date_of_birth) as age,
  calculate_bmi(u.height_inches, u.weight_lbs) as bmi,
  CASE 
    WHEN calculate_bmi(u.height_inches, u.weight_lbs) < 18.5 THEN 'underweight'
    WHEN calculate_bmi(u.height_inches, u.weight_lbs) >= 18.5 AND calculate_bmi(u.height_inches, u.weight_lbs) < 25 THEN 'normal'
    WHEN calculate_bmi(u.height_inches, u.weight_lbs) >= 25 AND calculate_bmi(u.height_inches, u.weight_lbs) < 30 THEN 'overweight'
    WHEN calculate_bmi(u.height_inches, u.weight_lbs) >= 30 THEN 'obese'
    ELSE 'unknown'
  END as bmi_category
FROM users u;

-- ============================================================
-- RLS POLICIES FOR PROFILE DATA
-- ============================================================

-- Users can view their own extended profile
-- Coaches can view all athlete profiles

-- Note: Existing policies on users table should handle this
-- Just verify that coaches can see all user data

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify new columns exist
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN (
    'avatar_url', 
    'date_of_birth', 
    'height_inches', 
    'weight_lbs', 
    'gender', 
    'bio',
    'emergency_contact_name',
    'emergency_contact_phone',
    'updated_at'
  )
ORDER BY column_name;

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('calculate_age', 'calculate_bmi', 'update_users_updated_at')
ORDER BY routine_name;

-- Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_users_timestamp';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Profile enhancements added successfully!';
  RAISE NOTICE '📊 New columns: avatar_url, date_of_birth, height, weight, gender, bio';
  RAISE NOTICE '🔧 Helper functions: calculate_age(), calculate_bmi()';
  RAISE NOTICE '👤 View: users_with_metrics (includes age and BMI)';
  RAISE NOTICE '⚠️  Next step: Create "avatars" bucket in Supabase Storage';
END $$;
