-- Performance Optimization Indexes
-- Created: November 4, 2025
-- Purpose: Speed up frequently-used queries for workouts, assignments, users, exercises

-- ============================================================================
-- WORKOUT ASSIGNMENTS
-- ============================================================================

-- Speed up athlete schedule queries
CREATE INDEX IF NOT EXISTS idx_assignments_user_date 
  ON workout_assignments(assigned_to_user_id, scheduled_date);

-- Speed up group assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_group_date 
  ON workout_assignments(assigned_to_group_id, scheduled_date);

-- Speed up completion tracking
CREATE INDEX IF NOT EXISTS idx_assignments_completed 
  ON workout_assignments(completed);

-- Speed up queries by assigned_by (coach)
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by 
  ON workout_assignments(assigned_by);

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
-- WORKOUT PLANS
-- ============================================================================

-- Speed up coach's workout library (uses created_by not coach_id)
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_by 
  ON workout_plans(created_by);

-- Speed up recent workouts queries
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_at 
  ON workout_plans(created_at DESC);

-- Speed up workout name searches
CREATE INDEX IF NOT EXISTS idx_workout_plans_name 
  ON workout_plans(name);

-- Speed up target group filtering
CREATE INDEX IF NOT EXISTS idx_workout_plans_target_group 
  ON workout_plans(target_group_id);

-- ============================================================================
-- EXERCISES
-- ============================================================================

-- Speed up category filtering in exercise library
CREATE INDEX IF NOT EXISTS idx_exercises_category_id 
  ON exercises(category_id);

-- Speed up exercise name searches
CREATE INDEX IF NOT EXISTS idx_exercises_name 
  ON exercises(name);

-- Speed up active exercise filtering
CREATE INDEX IF NOT EXISTS idx_exercises_active 
  ON exercises(is_active);

-- Speed up approved exercise filtering
CREATE INDEX IF NOT EXISTS idx_exercises_approved 
  ON exercises(is_approved);

-- Speed up searches by creator
CREATE INDEX IF NOT EXISTS idx_exercises_created_by 
  ON exercises(created_by);

-- Speed up compound exercise filtering
CREATE INDEX IF NOT EXISTS idx_exercises_compound 
  ON exercises(is_compound);

-- Speed up difficulty filtering
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty 
  ON exercises(difficulty_level);

-- ============================================================================
-- ATHLETE GROUPS
-- ============================================================================

-- Speed up coach's group queries
CREATE INDEX IF NOT EXISTS idx_groups_coach 
  ON athlete_groups(coach_id);

-- Speed up active group filtering
-- NOTE: This may already exist from add-archived-to-groups.sql migration
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

-- Speed up "get user's assignments for date range"
CREATE INDEX IF NOT EXISTS idx_assignments_user_completed_date 
  ON workout_assignments(assigned_to_user_id, completed, scheduled_date);

-- Speed up "get coach's workouts by date"
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_by_date 
  ON workout_plans(created_by, created_at DESC);

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
