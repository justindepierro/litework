# Profile Transfer System - Complete Guide

## Overview

The Profile Transfer System allows coaches to create pre-filled athlete profiles that automatically transfer to the athlete's account when they accept an invitation and sign up. This eliminates duplicate data entry and ensures athletes start with complete, coach-prepared profiles.

## Features

### Coach Benefits

- Pre-load athlete information before they sign up
- Add notes, bio, date of birth, injury status
- Assign athlete to multiple groups at once
- Create draft profiles (no email required) for roster management
- All data transfers automatically on athlete signup

### Athlete Benefits

- Pre-filled profile on first login
- Already member of assigned groups
- Coach relationship established automatically
- No need to enter information manually

## Architecture

### Data Flow

```
1. Coach Creates Invite
   ↓
   Stores in invites table:
   - first_name, last_name
   - email (optional)
   - notes, bio, date_of_birth, injury_status
   - group_ids[] (array of group IDs)
   - invited_by (coach ID)

2. Athlete Accepts Invite
   ↓
   Signup page loads invite data
   ↓
   signUp(email, password, first, last, inviteId)

3. System Transfers Data
   ↓
   Creates user profile with:
   - Basic info from signup form
   - Profile data from invite
   - coach_id from invite
   - group_ids from invite
   ↓
   Adds athlete to all assigned groups
   ↓
   Updates group.athlete_ids arrays

4. Result
   ↓
   Athlete has complete profile
   Appears in all assigned groups
   Coach relationship established
```

### Database Schema

#### Invites Table (Enhanced)

```sql
CREATE TABLE public.invites (
  id UUID PRIMARY KEY,
  email TEXT,                    -- Optional
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  invited_by UUID NOT NULL,
  role TEXT DEFAULT 'athlete',
  status TEXT DEFAULT 'pending', -- 'pending', 'draft', 'accepted', 'expired'

  -- Profile data (NEW)
  notes TEXT,                    -- Coach notes about athlete
  bio TEXT,                      -- Athlete bio/description
  date_of_birth DATE,            -- DOB
  injury_status TEXT,            -- Current injury info
  group_ids TEXT[],              -- Array of group IDs

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

#### Users Table (Enhanced)

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'athlete',

  -- Profile data (NEW)
  bio TEXT,                      -- Visible to athlete
  notes TEXT,                    -- Coach notes (coach-only)
  date_of_birth DATE,
  injury_status TEXT,
  group_ids TEXT[],
  coach_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation

### 1. Database Migrations

**Apply these migrations in Supabase SQL Editor:**

#### Migration 1: Add User Profile Fields

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.users.bio IS 'Athlete bio/description visible to athlete';
COMMENT ON COLUMN public.users.notes IS 'Coach notes about athlete (visible only to coaches)';

CREATE INDEX IF NOT EXISTS idx_users_bio_text_search
ON public.users USING gin(to_tsvector('english', COALESCE(bio, '')));
```

#### Migration 2: Enhance Invites Table

```sql
ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS injury_status TEXT,
ADD COLUMN IF NOT EXISTS group_ids TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.invites.notes IS 'Coach notes about athlete';
COMMENT ON COLUMN public.invites.bio IS 'Athlete bio/description';
COMMENT ON COLUMN public.invites.date_of_birth IS 'Athlete date of birth';
COMMENT ON COLUMN public.invites.injury_status IS 'Current injury status';
COMMENT ON COLUMN public.invites.group_ids IS 'Array of group IDs to add athlete to';

-- Migrate existing single group_id to array
UPDATE public.invites
SET group_ids = ARRAY[group_id::text]
WHERE group_id IS NOT NULL AND (group_ids IS NULL OR group_ids = '{}');

CREATE INDEX IF NOT EXISTS idx_invites_group_ids
ON public.invites USING GIN(group_ids);
```

### 2. Backend Code

#### auth-client.ts - signUp Function

The `signUp` function now accepts an optional `inviteId` parameter and handles complete profile transfer:

```typescript
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  inviteId?: string // NEW: Enable profile transfer
) {
  // Load invite data if invite ID provided
  let inviteData = null;
  if (inviteId) {
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("*")
      .eq("id", inviteId)
      .eq("status", "pending")
      .single();

    if (!inviteError && invite) {
      inviteData = invite;
    }
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email: sanitizedEmail,
    password,
  });

  // Create user profile WITH transferred data
  await supabase.from("users").insert({
    id: data.user.id,
    email: sanitizedEmail,
    name: fullName,
    first_name: sanitizedFirstName,
    last_name: sanitizedLastName,
    role: "athlete",

    // TRANSFER PROFILE DATA FROM INVITE:
    bio: inviteData?.bio || null,
    notes: inviteData?.notes || null,
    date_of_birth: inviteData?.date_of_birth || null,
    injury_status: inviteData?.injury_status || null,
    group_ids: inviteData?.group_ids || [],
    coach_id: inviteData?.invited_by || null,

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // ADD ATHLETE TO GROUPS FROM INVITE
  if (inviteData?.group_ids && inviteData.group_ids.length > 0) {
    for (const groupId of inviteData.group_ids) {
      try {
        const { data: group } = await supabase
          .from("athlete_groups")
          .select("athlete_ids")
          .eq("id", groupId)
          .single();

        if (group) {
          const currentAthleteIds = group.athlete_ids || [];
          const updatedAthleteIds = Array.from(
            new Set([...currentAthleteIds, data.user.id])
          );

          await supabase
            .from("athlete_groups")
            .update({ athlete_ids: updatedAthleteIds })
            .eq("id", groupId);
        }
      } catch (err) {
        console.error(`Failed to add athlete to group ${groupId}:`, err);
      }
    }
  }
}
```

#### AuthContext.tsx - Updated Interface

```typescript
signUp: (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  inviteId?: string // NEW parameter
) => Promise<{ needsEmailConfirmation?: boolean }>;
```

#### signup/page.tsx - Pass InviteId

```typescript
const result = await signUp(
  email,
  password,
  firstName.trim(),
  lastName.trim(),
  inviteId || undefined // Pass invite ID from URL
);
```

#### invites/route.ts - Store Profile Data

```typescript
const {
  firstName,
  lastName,
  email,
  groupId,
  notes, // NEW
  bio, // NEW
  dateOfBirth, // NEW
  injuryStatus, // NEW
} = body;

await supabase.from("invites").insert({
  email: email ? email.toLowerCase() : null,
  first_name: firstName,
  last_name: lastName,
  invited_by: user.id,
  role: "athlete",
  group_ids: groupId ? [groupId] : [], // Array instead of single ID
  status: email ? "pending" : "draft",
  expires_at: email ? expirationDate : null,

  // Store profile data
  notes: notes || null,
  bio: bio || null,
  date_of_birth: dateOfBirth || null,
  injury_status: injuryStatus || null,
});
```

## Usage Guide

### Current State (After Migrations)

**Backend is fully functional:**

- ✅ Database schema enhanced
- ✅ Profile transfer logic implemented
- ✅ Group membership auto-assignment works
- ✅ Draft invites supported (no email required)

**Frontend needs enhancement:**
Currently the invite form only captures:

- First Name
- Last Name
- Email (optional)
- Single Group

### Next Steps - UI Enhancement

Add profile fields to the invite form in `src/app/athletes/page.tsx`:

```typescript
// Add to inviteForm state
const [inviteForm, setInviteForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  groupId: "",
  // ADD THESE:
  bio: "",
  notes: "",
  dateOfBirth: "",
  injuryStatus: "",
});

// Add form fields to modal
<textarea
  placeholder="Bio (visible to athlete)"
  value={inviteForm.bio}
  onChange={(e) => setInviteForm({...inviteForm, bio: e.target.value})}
  className="w-full p-2 border rounded"
/>

<textarea
  placeholder="Coach notes (private)"
  value={inviteForm.notes}
  onChange={(e) => setInviteForm({...inviteForm, notes: e.target.value})}
  className="w-full p-2 border rounded"
/>

<input
  type="date"
  placeholder="Date of Birth"
  value={inviteForm.dateOfBirth}
  onChange={(e) => setInviteForm({...inviteForm, dateOfBirth: e.target.value})}
  className="w-full p-2 border rounded"
/>

<input
  placeholder="Injury Status"
  value={inviteForm.injuryStatus}
  onChange={(e) => setInviteForm({...inviteForm, injuryStatus: e.target.value})}
  className="w-full p-2 border rounded"
/>
```

### Testing the System

1. **Apply Migrations** (in Supabase SQL Editor)
2. **Create Test Invite:**
   - Add athlete with basic info
   - Assign to a group
   - (Later) Add bio, notes, DOB when UI is ready
3. **Athlete Accepts:**
   - Click invite link
   - Complete signup
   - Verify profile has transferred data
   - Check athlete appears in group
4. **Verify Data Transfer:**
   - Check users table has bio, notes
   - Check athlete_ids in group
   - Check coach_id is set

## Benefits Summary

### For Coaches

- **Efficiency**: Pre-load all athlete information once
- **Organization**: Assign to multiple groups immediately
- **Tracking**: Add notes that persist to athlete profile
- **Roster Management**: Create draft profiles for planning

### For Athletes

- **Convenience**: No duplicate data entry
- **Immediate Access**: Already in correct groups on first login
- **Complete Profile**: See coach-prepared information
- **Smooth Onboarding**: Professional first impression

### For System

- **Data Integrity**: Single source of truth (invite → user)
- **Scalability**: Bulk athlete onboarding made easy
- **Maintainability**: Clear data flow and ownership
- **Extensibility**: Easy to add more transferrable fields

## Future Enhancements

### Vitals System (User Interest)

- Weight, height, body fat percentage
- Measurement history tracking
- Transfer from invite to user
- Progress charts and analytics

### Multi-Group Support

- Already supported in backend (group_ids array)
- UI needs update to allow multiple group selection
- Athlete can be in multiple teams/categories simultaneously

### Profile Editing

- Allow athletes to edit their own bio
- Coach-only access to notes field
- Permission-based field visibility

## Files Modified

### New Files

- `database/add-user-profile-fields.sql`
- `database/enhance-invites-for-profile-transfer.sql`
- `scripts/database/apply-profile-transfer.mjs`
- `docs/guides/PROFILE_TRANSFER_SYSTEM.md` (this file)

### Modified Files

- `src/lib/auth-client.ts` (signUp function - ~70 lines added)
- `src/contexts/AuthContext.tsx` (interface + implementation)
- `src/app/signup/page.tsx` (pass inviteId parameter)
- `src/app/api/invites/route.ts` (accept profile fields)

## Related Documentation

- `ARCHITECTURE.md` - Authentication patterns and security
- `docs/guides/SUPABASE_SETUP.md` - Database setup guide
- `docs/guides/MIGRATION_INSTRUCTIONS.md` - General migration guide
- `SECURITY_AUDIT_REPORT.md` - Security best practices

## Support

For questions or issues with the Profile Transfer System:

1. Check this guide first
2. Review related documentation above
3. Test with draft invites (no email) to avoid sending test emails
4. Verify migrations applied correctly in Supabase dashboard
