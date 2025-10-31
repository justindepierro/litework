# Quick Migration Guide - Split Names

## The Problem
Your production database doesn't have an `invites` table yet, so we need to create it fresh with the split name structure.

## Solution: Two-Step Migration

### Step 1: Create Invites Table
**File:** `database/create-invites-table.sql`

Run this in Supabase SQL Editor to create the `invites` table with:
- `first_name`, `last_name`, `full_name` columns
- RLS policies for security
- Proper indexes
- Triggers for timestamps

### Step 2: Migrate Users Table  
**File:** `database/migration-split-names.sql`

Run this in Supabase SQL Editor to add split name columns to existing `users` table.

## Commands (In Supabase SQL Editor)

1. **First:** Copy and run `create-invites-table.sql`
2. **Second:** Copy and run `migration-split-names.sql`
3. **Verify:** Check both tables have the new columns
4. **Deploy:** `git push origin main`

## Why Two Scripts?

- **invites** table doesn't exist yet → Create it fresh with new structure
- **users** table already exists with data → Migrate existing data to new structure

## After Migration

Your athlete invitation form will have separate First Name and Last Name fields, giving you better control over name display and sorting!
