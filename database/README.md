# Database Directory

This directory contains SQL schemas, migrations, and database-related scripts for LiteWork.

## Directory Structure

```
database/
├── schema.sql                    # Main database schema (tables, RLS policies)
├── exercises-schema.sql          # Exercise library schema
├── exercises-seed.sql            # Exercise library seed data (106KB)
├── communication-schema.sql      # Messaging and communication features
├── cleanup-test-data.sql         # Utility to clean test data
└── archive/                      # Completed migrations and one-time scripts
```

## Current Schema Files

### `schema.sql`
**Primary database schema** - Contains all core tables:
- `users` - User accounts with role-based access
- `athlete_groups` - Groups for organizing athletes
- `workouts` - Workout templates
- `workout_assignments` - Assigned workouts to athletes
- `workout_sessions` - Completed workout sessions
- `exercises` - Exercise library
- All Row Level Security (RLS) policies

**When to update:** Any time you modify core table structure or policies.

### `exercises-schema.sql`
Exercise library table definition with comprehensive fields:
- Exercise details (name, description, equipment)
- Muscle groups and movement patterns
- Video URLs and instructions
- Difficulty levels

### `exercises-seed.sql`
**Large seed file (106KB)** - Contains 200+ exercises:
- Compound movements (squats, deadlifts, bench press)
- Isolation exercises
- Bodyweight exercises
- Olympic lifts
- Accessory movements

### `communication-schema.sql`
Messaging and communication features:
- Coach-athlete messaging
- Notifications
- Announcements

### `cleanup-test-data.sql`
**Utility script** - Use to clean up test data during development:
```sql
-- Removes test users, workouts, assignments
-- Preserves production data
```

## Archive Directory

Contains completed one-time migrations and diagnostic scripts:

**Recent Migrations (Applied Nov 3, 2025):**
- ✅ `add-user-profile-fields.sql` - Added bio and notes to users table
- ✅ `enhance-invites-for-profile-transfer.sql` - Enhanced invites for profile transfer

**Historical Migrations:**
- `migration-split-names.sql` - Split name field into first_name/last_name
- `create-invites-table.sql` - Initial invites table creation
- `add-archived-to-groups.sql` - Added archived flag to groups
- `add-notification-preferences.sql` - User notification settings
- `add-user-creation-trigger.sql` - Auto-create profile trigger

**Diagnostic Scripts:**
- `diagnose-signup-issue.sql` - Troubleshoot signup problems
- `check-users-schema.sql` - Verify users table structure
- `cleanup-duplicate-invites.sql` - Remove duplicate invites

**Policy Management:**
- `policy-fix.sql` - RLS policy corrections
- `policy-reset.sql` - Reset RLS policies
- `fix-my-account.sql` - Account-specific fixes

## How to Apply Migrations

### Using Supabase SQL Editor (Recommended)

1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the SQL from the migration file
4. Run in the editor
5. Verify success

### For Profile Transfer (Example)

The profile transfer migrations have been applied. To apply similar migrations:

```bash
# 1. Open Supabase SQL Editor
# 2. Run migration 1: database/archive/add-user-profile-fields.sql
# 3. Run migration 2: database/archive/enhance-invites-for-profile-transfer.sql
```

See: `docs/guides/PROFILE_TRANSFER_SYSTEM.md` for details.

## Best Practices

### Adding New Migrations

1. **Create migration file** in `/database` with descriptive name:
   ```
   add-[feature]-to-[table].sql
   enhance-[table]-for-[feature].sql
   ```

2. **Use IF NOT EXISTS** to make migrations idempotent:
   ```sql
   ALTER TABLE users
   ADD COLUMN IF NOT EXISTS new_field TEXT;
   ```

3. **Add comments** to document purpose:
   ```sql
   COMMENT ON COLUMN users.bio IS 'Athlete bio visible to athlete';
   ```

4. **Test locally** before applying to production

5. **Move to archive** after successful application:
   ```bash
   mv database/migration-name.sql database/archive/
   ```

### Schema Updates

**When modifying `schema.sql`:**
- Update the file with new schema
- Create a separate migration file for the change
- Apply migration to database
- Document in changelog

**Don't:** Directly edit the database and forget to update schema.sql
**Do:** Keep schema.sql as source of truth

### RLS Policies

All tables use Row Level Security (RLS):
- Admins: Full access
- Coaches: Access to their athletes and groups
- Athletes: Access to own data only

When adding tables, always:
```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_name" ON new_table
FOR SELECT
TO authenticated
USING (...policy logic...);
```

## Database Connection

Managed via Supabase:
- **URL:** `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- **Service Role Key:** `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- **Anon Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

See: `docs/guides/SUPABASE_SETUP.md` for setup instructions.

## Related Documentation

- **Architecture:** `ARCHITECTURE.md` - Database design patterns
- **Setup Guide:** `docs/guides/SUPABASE_SETUP.md`
- **Profile Transfer:** `docs/guides/PROFILE_TRANSFER_SYSTEM.md`
- **Security:** `SECURITY_AUDIT_REPORT.md` - RLS policy audit

## Maintenance

### Regular Tasks

- **Clean test data:** Run `cleanup-test-data.sql` in dev environment
- **Archive old migrations:** Move completed migrations to `/archive`
- **Update schema.sql:** Keep in sync with actual database structure
- **Review RLS policies:** Ensure proper access control

### Backup

Supabase provides:
- Automatic daily backups (retained based on plan)
- Point-in-time recovery (Pro plan)
- Manual backups via dashboard

**Always test migrations in a staging environment first.**
