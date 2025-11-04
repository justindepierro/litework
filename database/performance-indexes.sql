-- Performance Optimization Indexes
-- Created: November 4, 2025
-- Purpose: Speed up frequently-used queries for workouts, assignments, users, exercises

-- ============================================================================
-- WORKOUT ASSIGNMENTS
-- ============================================================================

-- Speed up athlete schedule queries
CREATE INDEX IF NOT EXISTS idx_assignments_athlete_date 
  ON workout_assignments(athlete_id, scheduled_date);

-- Speed up group assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_group_date 
  ON workout_assignments(group_id, scheduled_date);

-- Speed up status filtering
CREATE INDEX IF NOT EXISTS idx_assignments_status 
  ON workout_assignments(status);

-- Speed up completion tracking
CREATE INDEX IF NOT EXISTS idx_assignments_completed 
  ON workout_assignments(completed_at);

-- ============================================================================
-- USERS
-- ============================================================================

-- Speed up role-based queries (coaches, athletes, admins)
CREATE INDEX IF NOT EXISTS idx_users_role 
  ON users(role);

-- Speed up coach's athlete queries
CREATE INDEX IF NOT EXISTS idx_users_coach 
  ON users(coach_id);

-- Speed up email lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);

-- ============================================================================
-- WORKOUTS
-- ============================================================================

-- Speed up coach's workout library
CREATE INDEX IF NOT EXISTS idx_workouts_coach 
  ON workouts(coach_id);

-- Speed up recent workouts queries
CREATE INDEX IF NOT EXISTS idx_workouts_created 
  ON workouts(created_at DESC);

-- Speed up workout name searches
CREATE INDEX IF NOT EXISTS idx_workouts_name 
  ON workouts(name);

-- ============================================================================
-- EXERCISES
-- ============================================================================

-- Speed up category filtering in exercise library
CREATE INDEX IF NOT EXISTS idx_exercises_category 
  ON exercises(category);

-- Speed up exercise name searches
CREATE INDEX IF NOT EXISTS idx_exercises_name 
  ON exercises(name);

-- Speed up equipment filtering
CREATE INDEX IF NOT EXISTS idx_exercises_equipment 
  ON exercises(equipment);

-- ============================================================================
-- ATHLETE GROUPS
-- ============================================================================

-- Speed up coach's group queries
CREATE INDEX IF NOT EXISTS idx_groups_coach 
  ON athlete_groups(coach_id);

-- Speed up active group filtering
CREATE INDEX IF NOT EXISTS idx_groups_archived 
  ON athlete_groups(archived);

-- ============================================================================
-- NOTIFICATIONS (if table exists)
-- ============================================================================

-- Speed up user notification inbox
CREATE INDEX IF NOT EXISTS idx_notifications_user 
  ON notifications(user_id, created_at DESC);

-- Speed up unread notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_read 
  ON notifications(user_id, read_at);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Speed up "get athlete's assignments for date range"
CREATE INDEX IF NOT EXISTS idx_assignments_athlete_status_date 
  ON workout_assignments(athlete_id, status, scheduled_date);

-- Speed up "get coach's workouts by date"
CREATE INDEX IF NOT EXISTS idx_workouts_coach_created 
  ON workouts(coach_id, created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
