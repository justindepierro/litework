-- Terms of Service & Privacy Policy Acceptance
-- Tracks user agreement to legal terms
-- Date: November 14, 2025

-- Add TOS fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_version TEXT DEFAULT '1.0';
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT DEFAULT '1.0';

-- Comments for documentation
COMMENT ON COLUMN users.tos_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN users.tos_version IS 'Version of TOS that user accepted (e.g., 1.0, 1.1, 2.0)';
COMMENT ON COLUMN users.privacy_policy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN users.privacy_policy_version IS 'Version of Privacy Policy that user accepted';

-- Create TOS version history table (optional - for tracking changes)
CREATE TABLE IF NOT EXISTS tos_versions (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Insert current version
INSERT INTO tos_versions (version, title, content, effective_date)
VALUES (
  '1.0',
  'Terms of Service',
  'Initial Terms of Service for LiteWork',
  '2025-01-01'
) ON CONFLICT (version) DO NOTHING;

-- Comments
COMMENT ON TABLE tos_versions IS 'Historical record of Terms of Service versions';
COMMENT ON COLUMN tos_versions.effective_date IS 'Date when this version becomes effective';
