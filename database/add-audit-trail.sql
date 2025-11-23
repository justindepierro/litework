-- ============================================
-- AUDIT TRAIL SYSTEM
-- Tracks all deletions and critical operations
-- ============================================

-- 1. Create audit_trail table
CREATE TABLE IF NOT EXISTS public.audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'soft_delete', 'restore')),
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON public.audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record_id ON public.audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_at ON public.audit_trail(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_performed_by ON public.audit_trail(performed_by);

-- Add comments
COMMENT ON TABLE public.audit_trail IS 'Comprehensive audit log for tracking all data modifications';
COMMENT ON COLUMN public.audit_trail.table_name IS 'Name of the table that was modified';
COMMENT ON COLUMN public.audit_trail.record_id IS 'ID of the record that was modified';
COMMENT ON COLUMN public.audit_trail.action IS 'Type of action performed (insert, update, delete, soft_delete, restore)';
COMMENT ON COLUMN public.audit_trail.old_values IS 'JSON snapshot of record before modification';
COMMENT ON COLUMN public.audit_trail.new_values IS 'JSON snapshot of record after modification';
COMMENT ON COLUMN public.audit_trail.performed_by IS 'User who performed the action';
COMMENT ON COLUMN public.audit_trail.metadata IS 'Additional context (reason, notes, etc.)';

-- 2. Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log DELETE operations
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_trail (
      table_name,
      record_id,
      action,
      old_values,
      performed_by
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      CASE 
        WHEN OLD.deleted_at IS NOT NULL THEN 'delete' -- Already soft-deleted, now hard deleting
        ELSE 'delete'
      END,
      to_jsonb(OLD),
      auth.uid()
    );
    RETURN OLD;
  END IF;

  -- Log UPDATE operations (especially soft deletes and restores)
  IF (TG_OP = 'UPDATE') THEN
    -- Soft delete detection (deleted_at changed from NULL to timestamp)
    IF (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'soft_delete',
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
      RETURN NEW;
    END IF;

    -- Restore detection (deleted_at changed from timestamp to NULL)
    IF (OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'restore',
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid()
      );
      RETURN NEW;
    END IF;

    -- Log other significant updates (status changes, etc.)
    IF (TG_TABLE_NAME = 'invites' AND OLD.status IS DISTINCT FROM NEW.status) THEN
      INSERT INTO public.audit_trail (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        performed_by
      ) VALUES (
        TG_TABLE_NAME,
        NEW.id,
        'update',
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status),
        auth.uid()
      );
    END IF;

    RETURN NEW;
  END IF;

  -- Log INSERT operations for invites
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'invites') THEN
    INSERT INTO public.audit_trail (
      table_name,
      record_id,
      action,
      new_values,
      performed_by
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'insert',
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers for invites table
DROP TRIGGER IF EXISTS audit_invites_changes ON public.invites;
CREATE TRIGGER audit_invites_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- 4. Create triggers for users table (athlete deletions)
DROP TRIGGER IF EXISTS audit_users_changes ON public.users;
CREATE TRIGGER audit_users_changes
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- 5. Create triggers for workout_plans table
DROP TRIGGER IF EXISTS audit_workout_plans_changes ON public.workout_plans;
CREATE TRIGGER audit_workout_plans_changes
  AFTER DELETE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- 6. Create view for easy audit querying
CREATE OR REPLACE VIEW public.audit_log_summary AS
SELECT 
  a.id,
  a.table_name,
  a.record_id,
  a.action,
  a.performed_at,
  a.performed_by,
  u.email as performed_by_email,
  u.first_name || ' ' || u.last_name as performed_by_name,
  CASE 
    WHEN a.table_name = 'invites' THEN 
      COALESCE(a.old_values->>'first_name', a.new_values->>'first_name') || ' ' || 
      COALESCE(a.old_values->>'last_name', a.new_values->>'last_name')
    WHEN a.table_name = 'users' THEN 
      COALESCE(a.old_values->>'first_name', a.new_values->>'first_name') || ' ' || 
      COALESCE(a.old_values->>'last_name', a.new_values->>'last_name')
    ELSE NULL
  END as record_name,
  a.old_values,
  a.new_values
FROM public.audit_trail a
LEFT JOIN public.users u ON a.performed_by = u.id
ORDER BY a.performed_at DESC;

-- 7. Create function to restore soft-deleted records
CREATE OR REPLACE FUNCTION public.restore_deleted_invite(invite_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Restore the invite by clearing deleted_at
  UPDATE public.invites
  SET 
    deleted_at = NULL,
    updated_at = NOW()
  WHERE id = invite_id
  RETURNING to_jsonb(invites.*) INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Invite not found: %', invite_id;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get deletion history for a record
CREATE OR REPLACE FUNCTION public.get_deletion_history(
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  record_id UUID,
  action TEXT,
  record_data JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  deleted_by_email TEXT,
  deleted_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.record_id,
    a.action,
    COALESCE(a.old_values, a.new_values) as record_data,
    a.performed_at as deleted_at,
    a.performed_by as deleted_by,
    u.email as deleted_by_email,
    u.first_name || ' ' || u.last_name as deleted_by_name
  FROM public.audit_trail a
  LEFT JOIN public.users u ON a.performed_by = u.id
  WHERE 
    a.table_name = p_table_name
    AND a.action IN ('delete', 'soft_delete')
    AND (p_record_id IS NULL OR a.record_id = p_record_id)
  ORDER BY a.performed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enable RLS on audit_trail
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Coaches can view audit logs for their actions
CREATE POLICY "Coaches can view their own audit logs"
  ON public.audit_trail
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('coach', 'admin')
      AND (audit_trail.performed_by = auth.uid() OR users.role = 'admin')
    )
  );

-- 10. Grant permissions
GRANT SELECT ON public.audit_trail TO authenticated;
GRANT SELECT ON public.audit_log_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_deleted_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_deletion_history(TEXT, UUID, INT) TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View recent audit events
-- SELECT * FROM audit_log_summary LIMIT 20;

-- View all deleted invites
-- SELECT * FROM get_deletion_history('invites');

-- Restore a deleted invite
-- SELECT restore_deleted_invite('invite-uuid-here');

-- View deletion history for specific invite
-- SELECT * FROM get_deletion_history('invites', 'invite-uuid-here');
