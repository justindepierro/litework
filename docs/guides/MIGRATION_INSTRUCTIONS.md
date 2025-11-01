# 🚨 IMPORTANT: Database Migration Required

## ⚠️ DO NOT PUSH TO PRODUCTION YET

The code changes have been committed locally, but **you MUST run the database migrations first** before pushing to production.

## Step-by-Step Migration Process

### Step 1: Create Invites Table (DO THIS FIRST)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your LiteWork project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/create-invites-table.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd+Enter)

**What this does:**

- Creates the `invites` table with `first_name`, `last_name`, `full_name` from the start
- Adds proper indexes for performance
- Sets up Row Level Security (RLS) policies
- Creates triggers for timestamp updates

### Step 2: Migrate Users Table

1. Still in Supabase SQL Editor
2. Click **New Query**
3. Copy the entire contents of `database/migration-split-names.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd+Enter)

**What this does:**

- Adds `first_name`, `last_name`, `full_name` columns to `users` table
- Migrates existing user data (splits "John Doe" → first="John", last="Doe")
- Creates indexes for better performance
- Keeps old `name` column temporarily for safety

### Step 3: Verify Migration Success

Run these queries in Supabase SQL Editor:

```sql
-- Check users table structure
SELECT id, name, first_name, last_name, full_name, email, role
FROM public.users
LIMIT 10;

-- Check invites table structure
SELECT id, email, first_name, last_name, full_name, status, created_at
FROM public.invites
LIMIT 10;
```

**Expected result:**

- **users table:** Should have both old `name` and new `first_name`, `last_name`, `full_name` columns
- **invites table:** Should be empty but have the correct structure with split name fields

Once migration is verified:

```bash
git push origin main
```

This will trigger Vercel to deploy the updated code.

### Step 4: Test in Production

1. Go to https://liteworkapp.com
2. Navigate to Athletes page
3. Click "Invite Athlete"
4. **New form:** You should see separate "First Name" and "Last Name" fields
5. Fill out the form and send an invite
6. Check that the athlete appears with correct name

## What Changed

### Frontend (Athletes Page)

- ✅ Form now has **two separate fields**: First Name and Last Name
- ✅ Side-by-side layout for better UX
- ✅ Both fields required before sending invite

### API Endpoints

- ✅ `POST /api/invites` now expects `{ firstName, lastName, email }`
- ✅ `POST /api/invites/accept` uses split names to create accounts
- ✅ All user data transformed to use new structure

### Database

- ✅ `users` table has `first_name`, `last_name`, `full_name` columns
- ✅ `athlete_invites` table has same new columns
- ✅ Computed `full_name` column auto-updates when first/last change
- ✅ Indexes added for performance

## Rollback Plan (If Issues Arise)

If something goes wrong, you can rollback:

```bash
# Locally
git revert HEAD
git push origin main

# In Supabase SQL Editor
ALTER TABLE public.users DROP COLUMN first_name;
ALTER TABLE public.users DROP COLUMN last_name;
ALTER TABLE public.users DROP COLUMN full_name;

ALTER TABLE public.athlete_invites DROP COLUMN first_name;
ALTER TABLE public.athlete_invites DROP COLUMN last_name;
ALTER TABLE public.athlete_invites DROP COLUMN full_name;
```

## Benefits of This Change

1. **Better Sorting** - Can sort athletes by last name independently
2. **Personalization** - Greet athletes by first name ("Hey John!")
3. **Professional Display** - Show "Last, First" format on rosters
4. **Data Quality** - Structured names are easier to validate
5. **Flexibility** - Customize display format per context

## Files Changed

- ✅ `database/migration-split-names.sql` - Database migration script
- ✅ `src/types/index.ts` - User interface updated
- ✅ `src/app/api/invites/route.ts` - API endpoint updated
- ✅ `src/app/api/invites/accept/route.ts` - Accept endpoint updated
- ✅ `src/app/athletes/page.tsx` - Form UI updated with split fields
- ✅ `src/lib/api-client.ts` - Method signature updated
- ✅ `src/lib/supabase-auth.ts` - User transformation updated

## Next Steps Summary

1. ✅ Code committed locally (DONE)
2. ⏳ Run migration in Supabase (DO THIS NEXT)
3. ⏳ Verify migration worked
4. ⏳ Push to production (`git push origin main`)
5. ⏳ Test in production

---

**Current Status:** Code ready, waiting for database migration.

**DO NOT PUSH** until database migration is complete and verified! ⚠️
