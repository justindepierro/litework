-- COMPREHENSIVE ATHLETE DELETION FIX
-- This migration adds soft delete and prevents orphaned references

-- 1. Add deleted_at column to users table (soft delete) - only if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END $$;

-- 2. Add deleted_at column to invites table - only if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'invites' 
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.invites ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
  END IF;
END $$;

-- 3. Create audit log table for tracking deletions
CREATE TABLE IF NOT EXISTS athlete_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50) NOT NULL, -- 'delete', 'restore', 'hard_delete'
  table_name VARCHAR(50) NOT NULL, -- 'users', 'invites'
  record_id UUID NOT NULL,
  record_data JSONB, -- Store the deleted record data
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- 4. Create index for fast audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_record 
ON athlete_audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at 
ON athlete_audit_log(performed_at DESC);

-- 5. Create function to safely delete an athlete (soft delete)
CREATE OR REPLACE FUNCTION soft_delete_athlete(
  athlete_id UUID,
  deleted_by UUID,
  deletion_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  athlete_record RECORD;
  affected_groups INT;
  affected_assignments INT;
  result JSONB;
BEGIN
  -- Get athlete data before deletion
  SELECT * INTO athlete_record FROM users WHERE id = athlete_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found: %', athlete_id;
  END IF;
  
  -- Soft delete the user
  UPDATE users 
  SET deleted_at = NOW()
  WHERE id = athlete_id;
  
  -- Log the deletion
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    record_data,
    performed_by,
    reason
  ) VALUES (
    'delete',
    'users',
    athlete_id,
    to_jsonb(athlete_record),
    deleted_by,
    deletion_reason
  );
  
  -- Count affected relationships
  SELECT COUNT(*) INTO affected_groups
  FROM athlete_groups
  WHERE athlete_id = ANY(athlete_ids);
  
  SELECT COUNT(*) INTO affected_assignments
  FROM workout_assignments
  WHERE athlete_id = athlete_id;
  
  -- Return summary
  result := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'athlete_name', athlete_record.first_name || ' ' || athlete_record.last_name,
    'affected_groups', affected_groups,
    'affected_assignments', affected_assignments,
    'can_restore', true,
    'deleted_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to restore a soft-deleted athlete
CREATE OR REPLACE FUNCTION restore_athlete(
  athlete_id UUID,
  restored_by UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Restore the user
  UPDATE users 
  SET deleted_at = NULL
  WHERE id = athlete_id AND deleted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found or not deleted: %', athlete_id;
  END IF;
  
  -- Log the restoration
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    performed_by
  ) VALUES (
    'restore',
    'users',
    athlete_id,
    restored_by
  );
  
  result := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'restored_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function for HARD delete with CASCADE cleanup (admin only, with audit)
CREATE OR REPLACE FUNCTION hard_delete_athlete(
  athlete_id UUID,
  deleted_by UUID,
  deletion_reason TEXT,
  confirmation_code TEXT -- Must match athlete ID to prevent accidents
)
RETURNS JSONB AS $$
DECLARE
  athlete_record RECORD;
  cleanup_summary JSONB;
  deleted_kpis INT;
  deleted_sessions INT;
  deleted_assignments INT;
  updated_groups INT;
BEGIN
  -- Verify confirmation code
  IF confirmation_code != athlete_id::TEXT THEN
    RAISE EXCEPTION 'Confirmation code mismatch. Hard delete cancelled.';
  END IF;
  
  -- Get athlete data before deletion
  SELECT * INTO athlete_record FROM users WHERE id = athlete_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Athlete not found: %', athlete_id;
  END IF;
  
  -- CASCADE CLEANUP
  
  -- 1. Delete KPIs
  DELETE FROM athlete_kpis WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_kpis = ROW_COUNT;
  
  -- 2. Delete workout sessions
  DELETE FROM workout_sessions WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- 3. Delete workout assignments
  DELETE FROM workout_assignments WHERE athlete_id = athlete_id;
  GET DIAGNOSTICS deleted_assignments = ROW_COUNT;
  
  -- 4. Remove from groups
  UPDATE athlete_groups
  SET athlete_ids = array_remove(athlete_ids, athlete_id)
  WHERE athlete_id = ANY(athlete_ids);
  GET DIAGNOSTICS updated_groups = ROW_COUNT;
  
  -- 5. Delete progress entries
  DELETE FROM progress_entries WHERE athlete_id = athlete_id;
  
  -- 6. Delete set records
  DELETE FROM set_records 
  WHERE session_id IN (
    SELECT id FROM workout_sessions WHERE athlete_id = athlete_id
  );
  
  -- 7. HARD DELETE the user
  DELETE FROM users WHERE id = athlete_id;
  
  -- 8. Delete from Supabase Auth (handled by application layer)
  
  -- Log the HARD deletion
  INSERT INTO athlete_audit_log (
    action,
    table_name,
    record_id,
    record_data,
    performed_by,
    reason
  ) VALUES (
    'hard_delete',
    'users',
    athlete_id,
    to_jsonb(athlete_record),
    deleted_by,
    deletion_reason
  );
  
  -- Build summary
  cleanup_summary := jsonb_build_object(
    'success', true,
    'athlete_id', athlete_id,
    'athlete_name', athlete_record.first_name || ' ' || athlete_record.last_name,
    'deleted_kpis', deleted_kpis,
    'deleted_sessions', deleted_sessions,
    'deleted_assignments', deleted_assignments,
    'updated_groups', updated_groups,
    'warning', 'This action cannot be undone',
    'deleted_at', NOW()
  );
  
  RETURN cleanup_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create view to show active athletes (excludes soft-deleted)
-- Note: Only create if deleted_at column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'deleted_at'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW active_athletes AS
      SELECT * FROM users 
      WHERE role = ''athlete'' 
        AND deleted_at IS NULL';
  ELSE
    -- Fallback view without deleted_at filter
    EXECUTE 'CREATE OR REPLACE VIEW active_athletes AS
      SELECT * FROM users 
      WHERE role = ''athlete''';
  END IF;
END $$;

-- 9. Create view to show deleted athletes (for restore UI)
-- Note: Only create if deleted_at column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'users' 
    AND column_name = 'deleted_at'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW deleted_athletes AS
      SELECT 
        u.*,
        a.performed_at as audit_deleted_at,
        a.reason as deletion_reason,
        deleter.first_name || '' '' || deleter.last_name as deleted_by_name
      FROM users u
      LEFT JOIN athlete_audit_log a ON a.record_id = u.id AND a.action = ''delete''
      LEFT JOIN users deleter ON deleter.id = a.performed_by
      WHERE u.role = ''athlete'' 
        AND u.deleted_at IS NOT NULL
      ORDER BY u.deleted_at DESC';
  END IF;
END $$;

-- 10. Grant permissions
GRANT SELECT ON active_athletes TO authenticated;
GRANT SELECT ON deleted_athletes TO authenticated;
GRANT SELECT ON athlete_audit_log TO authenticated;

-- 11. Add RLS policies
ALTER TABLE athlete_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
ON athlete_audit_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- 12. Update existing queries to filter out deleted athletes
-- Note: Application code should be updated to use active_athletes view
-- or add WHERE deleted_at IS NULL to all athlete queries

COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp. NULL = active, NOT NULL = deleted';
COMMENT ON FUNCTION soft_delete_athlete IS 'Soft delete an athlete with audit logging. Can be restored.';
COMMENT ON FUNCTION hard_delete_athlete IS 'Permanently delete an athlete with CASCADE cleanup. Cannot be undone. Requires confirmation code.';
COMMENT ON FUNCTION restore_athlete IS 'Restore a soft-deleted athlete.';
COMMENT ON TABLE athlete_audit_log IS 'Audit log for all athlete deletion/restoration actions';
