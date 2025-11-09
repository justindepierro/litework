-- KPI Tags System
-- Purpose: Tag exercises with KPI associations to track volume/intensity leading up to PRs
-- Example: Tag all bench variations with "BENCH" to see training leading to bench PR

-- ============================================================================
-- KPI Tags Table
-- ============================================================================
-- Stores available KPI tags (coach-defined)
CREATE TABLE IF NOT EXISTS kpi_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- "BENCH", "SQUAT", "DEADLIFT", "VERTICAL_JUMP", etc.
  display_name TEXT NOT NULL, -- "Bench Press", "Squat", "Deadlift", "Vertical Jump"
  color TEXT NOT NULL DEFAULT '#3B82F6', -- Hex color for badge display
  description TEXT, -- What this KPI tracks
  kpi_type TEXT NOT NULL DEFAULT 'one_rm', -- 'one_rm', 'max_reps', 'max_distance', 'best_time'
  primary_exercise_id TEXT, -- Main exercise for this KPI (FK to exercises.id)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_kpi_tags_name ON kpi_tags(name);
CREATE INDEX IF NOT EXISTS idx_kpi_tags_created_by ON kpi_tags(created_by);

-- ============================================================================
-- Exercise KPI Tag Links
-- ============================================================================
-- Links workout exercises to KPI tags (many-to-many)
CREATE TABLE IF NOT EXISTS exercise_kpi_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  kpi_tag_id UUID NOT NULL REFERENCES kpi_tags(id) ON DELETE CASCADE,
  -- Context about why this exercise relates to this KPI
  relevance_notes TEXT, -- e.g., "Accessory for bench strength", "Competition lift"
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate tags on same exercise
  UNIQUE(workout_exercise_id, kpi_tag_id)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_exercise_kpi_tags_workout_exercise ON exercise_kpi_tags(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_kpi_tags_kpi_tag ON exercise_kpi_tags(kpi_tag_id);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE kpi_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_kpi_tags ENABLE ROW LEVEL SECURITY;

-- KPI Tags Policies
-- Everyone can read tags
CREATE POLICY "kpi_tags_select_all" ON kpi_tags
  FOR SELECT USING (true);

-- Only coaches/admins can create/update/delete tags
CREATE POLICY "kpi_tags_insert_coach" ON kpi_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "kpi_tags_update_coach" ON kpi_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "kpi_tags_delete_coach" ON kpi_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Exercise KPI Tag Links Policies
-- Everyone can read their own workout's exercise tags
CREATE POLICY "exercise_kpi_tags_select_own" ON exercise_kpi_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workout_plans wp ON we.workout_plan_id = wp.id
      WHERE we.id = exercise_kpi_tags.workout_exercise_id
      AND (
        wp.created_by = auth.uid() -- Coach who created the workout
        OR EXISTS ( -- Athletes assigned this workout
          SELECT 1 FROM workout_assignments wa
          WHERE wa.workout_plan_id = wp.id
          AND wa.assigned_to_user_id = auth.uid()
        )
      )
    )
  );

-- Only coaches/admins can manage exercise KPI tags
CREATE POLICY "exercise_kpi_tags_insert_coach" ON exercise_kpi_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "exercise_kpi_tags_update_coach" ON exercise_kpi_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "exercise_kpi_tags_delete_coach" ON exercise_kpi_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- ============================================================================
-- Seed Common KPI Tags
-- ============================================================================

-- Common strength KPIs
INSERT INTO kpi_tags (name, display_name, color, description, kpi_type, primary_exercise_id)
VALUES
  ('BENCH', 'Bench Press', '#EF4444', 'Tracks all bench press variations and accessories', 'one_rm', 'bench-press'),
  ('SQUAT', 'Squat', '#3B82F6', 'Tracks all squat variations and leg strength work', 'one_rm', 'back-squat'),
  ('DEADLIFT', 'Deadlift', '#8B5CF6', 'Tracks all deadlift variations and posterior chain work', 'one_rm', 'deadlift'),
  ('OVERHEAD_PRESS', 'Overhead Press', '#F59E0B', 'Tracks overhead pressing strength', 'one_rm', 'overhead-press'),
  ('PULL_UP', 'Pull-Up', '#10B981', 'Tracks pull-up strength and back development', 'max_reps', 'pull-up')
ON CONFLICT (name) DO NOTHING;

-- Power/Athletic KPIs
INSERT INTO kpi_tags (name, display_name, color, description, kpi_type)
VALUES
  ('VERTICAL_JUMP', 'Vertical Jump', '#06B6D4', 'Tracks explosive leg power', 'max_distance'),
  ('SPRINT', 'Sprint Speed', '#EC4899', 'Tracks sprint performance', 'best_time'),
  ('BROAD_JUMP', 'Broad Jump', '#14B8A6', 'Tracks horizontal power', 'max_distance')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Useful Views for Analysis
-- ============================================================================

-- View: Exercise KPI history for an athlete
-- Shows all exercises tagged with a specific KPI that an athlete has completed
CREATE OR REPLACE VIEW athlete_kpi_exercise_history AS
SELECT
  ws.user_id as athlete_id,
  se.workout_session_id,
  ws.completed_at as session_date,
  wa.workout_plan_id,
  wp.name as workout_name,
  ekt.kpi_tag_id,
  kt.name as kpi_tag_name,
  kt.display_name as kpi_display_name,
  we.exercise_id,
  se.exercise_name,
  sr.set_number,
  sr.actual_reps as reps_completed,
  sr.actual_weight as weight_used,
  NULL::numeric as rpe, -- RPE not tracked in set_records yet
  we.sets as prescribed_sets,
  we.reps as prescribed_reps,
  we.weight as prescribed_weight,
  we.weight_type,
  we.percentage,
  we.percentage_base_kpi,
  ekt.relevance_notes
FROM set_records sr
JOIN session_exercises se ON sr.session_exercise_id = se.id
JOIN workout_exercises we ON se.workout_exercise_id = we.id
JOIN exercise_kpi_tags ekt ON ekt.workout_exercise_id = we.id
JOIN kpi_tags kt ON ekt.kpi_tag_id = kt.id
JOIN workout_sessions ws ON se.workout_session_id = ws.id
JOIN workout_assignments wa ON ws.workout_assignment_id = wa.id
JOIN workout_plans wp ON wa.workout_plan_id = wp.id
ORDER BY ws.completed_at DESC, sr.set_number;

-- View: KPI tag volume summary
-- Aggregates total volume (sets x reps x weight) per KPI tag per athlete
CREATE OR REPLACE VIEW kpi_tag_volume_summary AS
SELECT
  athlete_id,
  kpi_tag_id,
  kpi_tag_name,
  kpi_display_name,
  DATE_TRUNC('week', session_date) as week_start,
  COUNT(DISTINCT workout_session_id) as workouts_completed,
  COUNT(DISTINCT exercise_id) as unique_exercises,
  SUM(reps_completed) as total_reps,
  SUM(reps_completed * COALESCE(weight_used, 0)) as total_volume,
  AVG(CASE WHEN rpe IS NOT NULL THEN rpe ELSE NULL END) as avg_rpe,
  MAX(weight_used) as max_weight
FROM athlete_kpi_exercise_history
GROUP BY athlete_id, kpi_tag_id, kpi_tag_name, kpi_display_name, DATE_TRUNC('week', session_date)
ORDER BY athlete_id, week_start DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE kpi_tags IS 'Available KPI tags for categorizing exercises (coach-defined)';
COMMENT ON TABLE exercise_kpi_tags IS 'Links workout exercises to KPI tags for tracking training leading to PRs';
COMMENT ON VIEW athlete_kpi_exercise_history IS 'Complete history of exercises tagged with KPIs for analysis';
COMMENT ON VIEW kpi_tag_volume_summary IS 'Weekly volume summary per KPI tag per athlete';
