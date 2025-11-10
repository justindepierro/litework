-- Athlete KPI Assignments System
-- Purpose: Assign KPI tags to athletes for tracking different performance metrics
-- Allows: Different KPIs per athlete, bulk assignment to groups, active/inactive tracking

-- ============================================================================
-- Athlete Assigned KPIs Table
-- ============================================================================
-- Links athletes to their active KPI tags (what each athlete is tracking)
CREATE TABLE IF NOT EXISTS athlete_assigned_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kpi_tag_id UUID NOT NULL REFERENCES kpi_tags(id) ON DELETE CASCADE,
  
  -- Assignment context
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Coach who assigned
  assigned_via TEXT, -- 'individual' or 'group:{group_id}' for tracking assignment source
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Status and goals
  is_active BOOLEAN NOT NULL DEFAULT true, -- Can deactivate without deleting
  target_value NUMERIC, -- Optional: target PR value (e.g., 315 lbs for bench)
  target_date DATE, -- Optional: goal date for target
  notes TEXT, -- Coach notes about this KPI for this athlete
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate active assignments
  UNIQUE(athlete_id, kpi_tag_id, is_active)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_athlete_assigned_kpis_athlete ON athlete_assigned_kpis(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_assigned_kpis_kpi_tag ON athlete_assigned_kpis(kpi_tag_id);
CREATE INDEX IF NOT EXISTS idx_athlete_assigned_kpis_active ON athlete_assigned_kpis(athlete_id, is_active);
CREATE INDEX IF NOT EXISTS idx_athlete_assigned_kpis_assigned_by ON athlete_assigned_kpis(assigned_by);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE athlete_assigned_kpis ENABLE ROW LEVEL SECURITY;

-- Athletes can view their own assigned KPIs
CREATE POLICY "athlete_assigned_kpis_select_own" ON athlete_assigned_kpis
  FOR SELECT USING (
    athlete_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Only coaches/admins can assign KPIs
CREATE POLICY "athlete_assigned_kpis_insert_coach" ON athlete_assigned_kpis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Only coaches/admins can update assignments
CREATE POLICY "athlete_assigned_kpis_update_coach" ON athlete_assigned_kpis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- Only coaches/admins can delete assignments
CREATE POLICY "athlete_assigned_kpis_delete_coach" ON athlete_assigned_kpis
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
    )
  );

-- ============================================================================
-- Useful Views
-- ============================================================================

-- View: Active athlete KPIs with tag details
CREATE OR REPLACE VIEW active_athlete_kpis AS
SELECT
  aak.id as assignment_id,
  aak.athlete_id,
  u.name as athlete_name,
  aak.kpi_tag_id,
  kt.name as kpi_name,
  kt.display_name as kpi_display_name,
  kt.color as kpi_color,
  kt.kpi_type,
  aak.target_value,
  aak.target_date,
  aak.notes,
  aak.assigned_via,
  aak.assigned_at,
  assigned_by_user.name as assigned_by_name
FROM athlete_assigned_kpis aak
JOIN users u ON aak.athlete_id = u.id
JOIN kpi_tags kt ON aak.kpi_tag_id = kt.id
LEFT JOIN users assigned_by_user ON aak.assigned_by = assigned_by_user.id
WHERE aak.is_active = true
ORDER BY u.name, kt.display_name;

-- View: KPI assignment summary by athlete
CREATE OR REPLACE VIEW athlete_kpi_summary AS
SELECT
  athlete_id,
  athlete_name,
  COUNT(*) as active_kpis,
  ARRAY_AGG(kpi_display_name ORDER BY kpi_display_name) as kpi_names,
  ARRAY_AGG(kpi_color ORDER BY kpi_display_name) as kpi_colors
FROM active_athlete_kpis
GROUP BY athlete_id, athlete_name
ORDER BY athlete_name;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamp on changes
CREATE OR REPLACE FUNCTION update_athlete_assigned_kpis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_athlete_assigned_kpis_timestamp
  BEFORE UPDATE ON athlete_assigned_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_assigned_kpis_updated_at();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE athlete_assigned_kpis IS 'Links athletes to their active KPI tags for tracking performance metrics';
COMMENT ON VIEW active_athlete_kpis IS 'Active athlete KPI assignments with full tag details';
COMMENT ON VIEW athlete_kpi_summary IS 'Summary of active KPIs per athlete';

-- ============================================================================
-- Helper Function: Bulk assign KPIs to multiple athletes
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_assign_kpis(
  p_athlete_ids UUID[],
  p_kpi_tag_ids UUID[],
  p_assigned_by UUID,
  p_assigned_via TEXT DEFAULT 'individual',
  p_target_value NUMERIC DEFAULT NULL,
  p_target_date DATE DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  athlete_id UUID,
  kpi_tag_id UUID,
  assignment_id UUID,
  was_already_assigned BOOLEAN
) AS $$
DECLARE
  v_athlete_id UUID;
  v_kpi_tag_id UUID;
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Loop through all athlete/KPI combinations
  FOREACH v_athlete_id IN ARRAY p_athlete_ids
  LOOP
    FOREACH v_kpi_tag_id IN ARRAY p_kpi_tag_ids
    LOOP
      -- Check if already assigned and active
      SELECT id INTO v_existing_id
      FROM athlete_assigned_kpis
      WHERE athlete_assigned_kpis.athlete_id = v_athlete_id
        AND athlete_assigned_kpis.kpi_tag_id = v_kpi_tag_id
        AND is_active = true;
      
      IF v_existing_id IS NOT NULL THEN
        -- Already assigned - return existing
        athlete_id := v_athlete_id;
        kpi_tag_id := v_kpi_tag_id;
        assignment_id := v_existing_id;
        was_already_assigned := true;
        RETURN NEXT;
      ELSE
        -- Create new assignment
        INSERT INTO athlete_assigned_kpis (
          athlete_id,
          kpi_tag_id,
          assigned_by,
          assigned_via,
          target_value,
          target_date,
          notes
        ) VALUES (
          v_athlete_id,
          v_kpi_tag_id,
          p_assigned_by,
          p_assigned_via,
          p_target_value,
          p_target_date,
          p_notes
        ) RETURNING id INTO v_new_id;
        
        athlete_id := v_athlete_id;
        kpi_tag_id := v_kpi_tag_id;
        assignment_id := v_new_id;
        was_already_assigned := false;
        RETURN NEXT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION bulk_assign_kpis IS 'Bulk assign KPI tags to multiple athletes, skipping duplicates';
