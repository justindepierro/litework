-- Invite Audit Trail System
-- Tracks all invite-related events for security and compliance
-- Date: November 14, 2025

-- Add audit fields to invites table
ALTER TABLE invites ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS accepted_ip TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS accepted_user_agent TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS resend_count INTEGER DEFAULT 0;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP;

-- Create audit log table
CREATE TABLE IF NOT EXISTS invite_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID REFERENCES invites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created',
    'sent',
    'resent',
    'accepted',
    'verified',
    'expired',
    'cancelled',
    'email_changed',
    'suspicious_activity'
  )),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who performed the action
  target_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who was affected (athlete)
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB, -- Additional context (flexible for different event types)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_invite_audit_log_invite ON invite_audit_log(invite_id);
CREATE INDEX IF NOT EXISTS idx_invite_audit_log_event ON invite_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_invite_audit_log_actor ON invite_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_invite_audit_log_created ON invite_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE invite_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Coaches and admins can view audit logs for their invites
CREATE POLICY "Coaches can view their invite audit logs"
  ON invite_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invites
      WHERE invites.id = invite_audit_log.invite_id
      AND invites.invited_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach')
    )
  );

-- Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON invite_audit_log
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Comments for documentation
COMMENT ON TABLE invite_audit_log IS 'Comprehensive audit trail for all invite-related events';
COMMENT ON COLUMN invite_audit_log.event_type IS 'Type of event: created, sent, resent, accepted, verified, expired, cancelled, email_changed, suspicious_activity';
COMMENT ON COLUMN invite_audit_log.actor_id IS 'User who performed the action (coach, athlete, or system)';
COMMENT ON COLUMN invite_audit_log.target_id IS 'User who was affected by the action (usually the athlete)';
COMMENT ON COLUMN invite_audit_log.metadata IS 'Flexible JSONB field for event-specific data';

-- Example metadata structures for different event types:
-- created: { "email": "athlete@example.com", "groups": ["uuid1", "uuid2"], "notes": "..." }
-- sent: { "email_subject": "...", "email_template": "..." }
-- resent: { "reason": "athlete_requested", "previous_sent_at": "..." }
-- accepted: { "email": "...", "name": "...", "verification_required": true }
-- verified: { "verification_time_minutes": 5 }
-- suspicious_activity: { "reason": "email_mismatch", "attempted_email": "...", "expected_email": "..." }
