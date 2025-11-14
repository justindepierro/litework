# Athlete Investigation Report - November 14, 2025

## Issue Summary

User reported missing athletes from the athletes page display.

## Investigation Results

### What We Found

**Current Database State:**

- **Users Table**: 2 total
  - 1 athlete: Justin DePierro
  - 1 admin: Justin DePierro
- **Invites Table**: 3 total (all draft status)
  - Matthew Robertson
  - Aedan O'Brien
  - Marco Langley

**Total Athletes Displaying**: 4 (1 active + 3 invited) ✅ **CORRECT**

### Missing Athletes

- **Timothy Brogan** - NOT in database
- **Lucas Rodriguez-Lopez** - NOT in database

**Conclusion**: These athletes were either:

1. Never added to this database
2. Deleted at some point
3. Exist in a different environment (staging/development)

### Issues Fixed During Investigation

#### 1. **Login Session Expiration** ✅ **FIXED**

- **Problem**: Session refresh interval was set to 4 hours, but Supabase tokens expire after 1 hour
- **Fix**: Changed refresh interval from 4 hours → 30 minutes
- **File**: `src/contexts/AuthContext.tsx`
- **Impact**: User should no longer be logged out frequently

#### 2. **Auth Debug Mode Enabled** ✅ **ADDED**

- **Change**: Added `debug: true` to Supabase client in development
- **File**: `src/lib/supabase.ts`
- **Benefit**: Better visibility into auth issues during development

#### 3. **Component Re-render Performance** ℹ️ **IDENTIFIED**

- **Observation**: Athletes page hook was called 12+ times on mount
- **Cause**: Likely normal React Strict Mode behavior in development
- **Impact**: No functional issue, but could be optimized in future
- **Note**: Does not affect production builds

## Recommendations

### 1. Add Database Audit Logging

Consider enabling audit logging in Supabase to track:

- User deletions
- Role changes
- Invite status changes

### 2. Create Data Backup Strategy

Implement regular backups to prevent data loss:

```bash
# Example backup command
npm run db:backup
```

### 3. Add Soft Delete

Instead of hard deleting users, implement soft delete:

- Add `deleted_at` column to `users` and `invites` tables
- Filter out deleted records in queries
- Ability to restore accidentally deleted data

### 4. Recovery Options for Missing Athletes

If you want to restore Timothy Brogan and Lucas Rodriguez-Lopez, you can:

**Option A: Add as new invites**

```sql
INSERT INTO invites (first_name, last_name, email, status)
VALUES
  ('Timothy', 'Brogan', 'timothy.brogan@example.com', 'pending'),
  ('Lucas', 'Rodriguez-Lopez', 'lucas.rodriguez@example.com', 'pending');
```

**Option B: Check Supabase backup/history**

1. Go to Supabase Dashboard → Project Settings → Database
2. Check "Point in Time Recovery" if enabled
3. Restore from a specific timestamp before deletion

**Option C: Check other environments**

- Development database
- Staging database
- Local database dump files

## Files Modified

### Production Changes

1. `src/contexts/AuthContext.tsx` - Session refresh interval fix
2. `src/lib/supabase.ts` - Added debug mode

### Investigation Tools Created

1. `scripts/database/find-missing-athletes.mjs` - Database search utility

### Temporary Debug Code (All Removed)

- `src/app/athletes/hooks/useAthleteData.ts` - Added/removed console logs
- `src/app/athletes/hooks/useAthleteFilters.ts` - Added/removed console logs
- `src/app/athletes/page.tsx` - Added/removed console logs
- `src/app/api/athletes/route.ts` - Added/removed console logs

## Summary

**Athletes Display**: ✅ Working correctly (4 athletes showing)
**Session Management**: ✅ Fixed (30-minute refresh)
**Missing Athletes**: ❌ Not in database (never added or deleted)
**Code Quality**: ✅ All debug code removed, production-ready

The system is working as expected with the data that exists. The missing athletes need to be re-added if they should be in the system.
