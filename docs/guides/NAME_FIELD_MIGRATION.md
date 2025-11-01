# Name Field Migration Summary

## Overview

Migrating from single `name` field to separate `firstName` and `lastName` fields throughout the application for better flexibility in display, sorting, and personalization.

## Changes Made

### 1. Database Schema ✅

**File:** `database/migration-split-names.sql`

- Added `first_name`, `last_name`, `full_name` (computed) to `users` table
- Added `first_name`, `last_name`, `full_name` (computed) to `athlete_invites` table
- Migrates existing data by splitting on first space
- Adds indexes for performance
- Includes verification queries

**Status:** Migration file created, needs to be run in Supabase

### 2. TypeScript Types ✅

**File:** `src/types/index.ts`

- Updated `User` interface to use `firstName`, `lastName`, `fullName?`
- Removed old `name` field

### 3. API Routes ✅

**File:** `src/app/api/invites/route.ts` (POST /api/invites)

- Changed from `{ name, email }` to `{ firstName, lastName, email }`
- Updates validation message
- Stores `first_name`, `last_name` in database

**File:** `src/app/api/invites/accept/route.ts` (POST /api/invites/accept)

- Reads `invite.first_name`, `invite.last_name` from database
- Creates user with `first_name`, `last_name` fields
- Returns `firstName`, `lastName` in response

### 4. Auth Utils ✅

**File:** `src/lib/supabase-auth.ts`

- Updated `getUserProfile()` to construct name from `full_name` or `first_name + last_name`
- Updated `verifySupabaseAuth()` to do the same
- Maintains backwards compatibility with `name` field in `AuthenticatedUser` interface

### 5. Frontend Components - PENDING

**File:** `src/app/athletes/page.tsx`

- [ ] Update `InviteForm` interface from `name: string` to `firstName: string; lastName: string`
- [ ] Update form state initialization
- [ ] Split Name input field into two fields (First Name and Last Name)
- [ ] Update `handleSendInvite()` to send `firstName` and `lastName`
- [ ] Update athlete displays to use `fullName` or construct from first + last

**File:** `src/lib/api-client.ts`

- [ ] Update `createAthleteInvite()` method signature

**File:** Components that display user names

- [ ] Update all components that display `user.name` to use `user.fullName` or construct it
- [ ] Examples: Navigation, Dashboard, Progress Analytics, etc.

## Migration Steps

1. **Run Database Migration** (REQUIRED FIRST)

   ```sql
   -- In Supabase SQL Editor
   -- Run: database/migration-split-names.sql
   ```

2. **Update Frontend** (IN PROGRESS)
   - Update Athletes page form
   - Update API client
   - Update all user name displays

3. **Test Locally**
   - Create new athlete invitation with first/last name
   - Accept invitation
   - Verify name displays correctly
   - Check all existing athletes still display

4. **Deploy to Production**
   - Commit all changes
   - Push to GitHub
   - Vercel auto-deploys

## Benefits

1. **Better Sorting:** Can sort by last name separately
2. **Personalization:** Can address athletes by first name ("Hey John!")
3. **Formal Display:** Can show "Last, First" format for rosters
4. **Flexibility:** Can customize name display per context
5. **Data Quality:** Structured data is easier to validate and clean

## Backwards Compatibility

- Migration includes `full_name` computed column for easy display
- Auth utils construct full name from parts
- No data loss - existing single names split intelligently
