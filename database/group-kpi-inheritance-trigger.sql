-- Group KPI Inheritance System
-- Purpose: Automatically assign KPIs to athletes when they join a group OR accept an invite
-- Ensures: Athletes inherit all KPIs that were assigned to their group
-- Works with: Invited athletes (status='invited') and active athletes (status='active')

-- ============================================================================
-- Function: Auto-assign group KPIs to new group members
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_assign_group_kpis()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id TEXT;
  v_kpi_assignment RECORD;
  v_existing_id UUID;
BEGIN
  -- Only process if group_ids changed (added new groups) OR if status changed to active
  IF TG_OP = 'UPDATE' THEN
    -- Skip if group_ids didn't change AND status didn't change to active
    IF NEW.group_ids = OLD.group_ids AND NOT (OLD.status = 'invited' AND NEW.status = 'active') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- For each group the athlete is now in
  FOREACH v_group_id IN ARRAY NEW.group_ids
  LOOP
    -- Skip if athlete was already in this group (for UPDATE operations)
    -- But still process if they just changed from invited to active
    IF TG_OP = 'UPDATE' AND v_group_id = ANY(OLD.group_ids) AND NOT (OLD.status = 'invited' AND NEW.status = 'active') THEN
      CONTINUE;
    END IF;

    -- Find all KPI assignments for this group
    FOR v_kpi_assignment IN
      SELECT DISTINCT
        kpi_tag_id,
        assigned_by,
        target_value,
        target_date,
        notes
      FROM athlete_assigned_kpis
      WHERE assigned_via = 'group:' || v_group_id
        AND is_active = true
    LOOP
      -- Check if athlete already has this KPI assigned
      SELECT id INTO v_existing_id
      FROM athlete_assigned_kpis
      WHERE athlete_id = NEW.id
        AND kpi_tag_id = v_kpi_assignment.kpi_tag_id
        AND is_active = true;

      -- Only assign if not already assigned
      IF v_existing_id IS NULL THEN
        INSERT INTO athlete_assigned_kpis (
          athlete_id,
          kpi_tag_id,
          assigned_by,
          assigned_via,
          target_value,
          target_date,
          notes,
          is_active
        ) VALUES (
          NEW.id,
          v_kpi_assignment.kpi_tag_id,
          v_kpi_assignment.assigned_by,
          'group:' || v_group_id, -- Preserve group assignment context
          v_kpi_assignment.target_value,
          v_kpi_assignment.target_date,
          v_kpi_assignment.notes,
          true
        );
      END IF;
    END LOOP;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: Fire when user's group_ids change
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_assign_group_kpis ON users;

CREATE TRIGGER trigger_auto_assign_group_kpis
  AFTER INSERT OR UPDATE OF group_ids, status ON users
  FOR EACH ROW
  WHEN (NEW.role = 'athlete')
  EXECUTE FUNCTION auto_assign_group_kpis();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION auto_assign_group_kpis IS 'Automatically assigns group KPIs to athletes when they join a group';
COMMENT ON TRIGGER trigger_auto_assign_group_kpis ON users IS 'Triggers group KPI inheritance when athlete joins a group';

-- ============================================================================
-- Example Usage & Testing
-- ============================================================================

/*
-- Example 1: Assign KPIs to a group
-- This assigns BENCH and SQUAT to the "Football Team" group
SELECT bulk_assign_kpis(
  ARRAY['athlete-uuid-1', 'athlete-uuid-2']::UUID[],
  ARRAY['bench-kpi-uuid', 'squat-kpi-uuid']::UUID[],
  'coach-uuid'::UUID,
  'group:football-team-group-uuid',
  225,
  '2025-12-31'::DATE,
  'End of season goal'
);

-- Example 2: Add new athlete to the group
-- The athlete will AUTOMATICALLY get BENCH and SQUAT assigned
UPDATE users
SET group_ids = array_append(group_ids, 'football-team-group-uuid')
WHERE id = 'new-athlete-uuid';

-- Example 3: Invite new athlete to group
-- When they accept the invite, they'll get the group KPIs
INSERT INTO invites (
  email,
  first_name,
  last_name,
  role,
  invited_by,
  group_ids,
  status
) VALUES (
  'newathlete@example.com',
  'John',
  'Doe',
  'athlete',
  'coach-uuid',
  ARRAY['football-team-group-uuid'], -- Will inherit group KPIs when accepted
  'pending'
);

-- Verify: Check athlete's assigned KPIs
SELECT
  u.first_name || ' ' || u.last_name as athlete_name,
  kt.display_name as kpi_name,
  aak.assigned_via,
  aak.target_value,
  aak.target_date
FROM athlete_assigned_kpis aak
JOIN users u ON aak.athlete_id = u.id
JOIN kpi_tags kt ON aak.kpi_tag_id = kt.id
WHERE u.id = 'new-athlete-uuid'
  AND aak.is_active = true;
*/
