-- Clean up duplicate invites
-- Keep only the most recent invite for each email address

-- First, let's see what duplicates we have
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id ORDER BY created_at DESC) as invite_ids,
  array_agg(created_at ORDER BY created_at DESC) as dates
FROM invites
WHERE status = 'pending'
GROUP BY email
HAVING COUNT(*) > 1;

-- Delete older duplicate invites, keeping only the most recent one for each email
DELETE FROM invites
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      email,
      ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM invites
    WHERE status = 'pending'
  ) AS ranked
  WHERE rn > 1
);

-- Verify cleanup
SELECT 
  email,
  first_name,
  last_name,
  status,
  created_at,
  expires_at
FROM invites
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Add a comment about duplicate prevention
COMMENT ON TABLE invites IS 'Athlete invitations. Duplicates are prevented by the API checking for existing pending invites before creation.';
