# COMPREHENSIVE ATHLETE SYSTEM AUDIT & FIXES

**Date:** November 14, 2025  
**Status:** 🔴 CRITICAL ISSUES FOUND & FIXED

---

## 🚨 CRITICAL FINDINGS

### Issue: Hard Delete Without Cascade Cleanup

**Severity:** CRITICAL 🔴  
**Impact:** 4 athletes were permanently deleted, leaving orphaned references in the database

**Evidence:**

- 4 orphaned athlete IDs found in group memberships
- Athletes: Timothy Brogan and Lucas Rodriguez-Lopez (confirmed missing)
- 2 additional unknown athletes also deleted
- All deletions were HARD DELETES with no audit trail

**Root Cause:**

```typescript
// File: src/app/api/users/[id]/route.ts (Line 131)
// OLD CODE - DANGEROUS:
const { error } = await supabase.from("users").delete().eq("id", id);
```

This code:

- ❌ Deletes user from `users` table ONLY
- ❌ Leaves references in `athlete_groups.athlete_ids` array
- ❌ Leaves KPIs, sessions, assignments orphaned
- ❌ No audit log of who deleted or why
- ❌ Cannot be undone

---

## ✅ IMPLEMENTED FIXES

### 1. Database Layer (MUST RUN MIGRATIONS)

#### A. Soft Delete System ✅

**File:** `database/add-soft-delete-and-audit.sql`

**Features:**

- Added `deleted_at` column to `users` and `invites` tables
- Soft-deleted records remain in database but are hidden
- Can be restored by admins
- No orphaned references

**Functions Created:**

```sql
soft_delete_athlete(athlete_id, deleted_by, reason)
  → Marks athlete as deleted, logs action, can be restored

restore_athlete(athlete_id, restored_by)
  → Restores soft-deleted athlete

hard_delete_athlete(athlete_id, deleted_by, reason, confirmation_code)
  → Permanent delete with CASCADE cleanup
  → Requires confirmation code = athlete ID
  → Removes from ALL tables:
    - athlete_kpis
    - workout_sessions
    - workout_assignments
    - athlete_groups (array_remove)
    - progress_entries
    - set_records
```

#### B. Audit Logging ✅

**Table:** `athlete_audit_log`

Tracks:

- Who deleted/restored
- When it happened
- Full record data (JSON)
- Deletion reason
- IP address and user agent
- Action type (delete, restore, hard_delete)

**Views Created:**

- `active_athletes` - Excludes soft-deleted
- `deleted_athletes` - Shows only deleted, with restore info

#### C. Orphaned Reference Cleanup ✅

**File:** `database/cleanup-orphaned-athletes.sql`

Removes the 4 orphaned IDs from group memberships:

- Football - Skill: 2 orphaned IDs
- Football - Line: 2 orphaned IDs

### 2. API Layer ✅

#### Updated DELETE Endpoint

**File:** `src/app/api/users/[id]/route.ts`

**New Behavior:**

```typescript
// SOFT DELETE (default):
DELETE /api/users/{id}?reason=No+longer+active
→ Calls soft_delete_athlete()
→ Can be restored
→ Audit logged

// HARD DELETE (requires confirmation):
DELETE /api/users/{id}?permanent=true&confirm={id}&reason=GDPR+request
→ Calls hard_delete_athlete()
→ CASCADE cleanup
→ Cannot be undone
→ Audit logged
```

#### Updated Athletes Endpoint

**File:** `src/app/api/athletes/route.ts`

Added filters:

```typescript
.is("deleted_at", null) // Exclude soft-deleted athletes
```

Both `users` and `invites` queries now exclude soft-deleted records.

### 3. Audit Scripts ✅

#### A. Comprehensive Athlete Audit

**File:** `scripts/database/comprehensive-athlete-audit.mjs`

Searches:

- Users table (all roles, all statuses)
- Invites table (all statuses)
- KPIs, sessions, assignments (orphaned records)
- Group memberships (orphaned IDs)
- Reports findings with detailed analysis

#### B. Orphaned Athletes Investigation

**File:** `scripts/database/investigate-orphaned-athletes.mjs`

Finds:

- Orphaned IDs in groups
- Checks Supabase Auth for existence
- Lists affected relationships
- Provides cleanup recommendations

#### C. Find Missing Athletes

**File:** `scripts/database/find-missing-athletes.mjs`

Searches by name for specific athletes

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Database Migration (CRITICAL - DO FIRST) 🔴

- [ ] **1.1** Run `database/add-soft-delete-and-audit.sql` in Supabase SQL Editor
  - Adds `deleted_at` columns
  - Creates `athlete_audit_log` table
  - Creates stored functions
  - Creates views
  - Sets up RLS policies

- [ ] **1.2** Run `database/cleanup-orphaned-athletes.sql` in Supabase SQL Editor
  - Removes 4 orphaned athlete IDs from groups
  - Verifies cleanup was successful

- [ ] **1.3** Test migrations:
  ```bash
  # Run audit to verify cleanup
  node scripts/database/comprehensive-athlete-audit.mjs
  ```
  Expected: "No orphaned references found"

### Phase 2: Verify API Changes ✅ (ALREADY DONE)

- [x] **2.1** `src/app/api/users/[id]/route.ts` - DELETE endpoint updated
- [x] **2.2** `src/app/api/athletes/route.ts` - Excludes deleted athletes
- [x] **2.3** Run typecheck: `npm run typecheck` → 0 errors

### Phase 3: Test in Development 🟡 (TODO)

- [ ] **3.1** Test soft delete:

  ```bash
  # In browser console or API client
  fetch('/api/users/ATHLETE_ID?reason=Testing', { method: 'DELETE' })
  ```

  Expected: Athlete disappears from list, can be restored

- [ ] **3.2** Test restore (need to build UI or use SQL):

  ```sql
  SELECT restore_athlete('ATHLETE_ID', 'YOUR_ADMIN_ID');
  ```

  Expected: Athlete reappears in list

- [ ] **3.3** Test that deleted athletes don't appear:
  - Go to /athletes page
  - Soft-delete an athlete
  - Refresh page
  - Athlete should not appear in list

### Phase 4: UI Enhancements 🟡 (RECOMMENDED)

#### A. Admin Panel - Deleted Athletes View

Create `/athletes/deleted` page showing:

- List of soft-deleted athletes
- Deletion date and reason
- Who deleted them
- Restore button for each

#### B. Improved Delete Confirmation

If you add delete buttons to athlete cards/modals:

```typescript
// Example confirmation modal
<ConfirmModal
  title="Archive Athlete?"
  message={`${athlete.fullName} will be hidden but can be restored later.`}
  confirmText="Archive"
  cancelText="Cancel"
  variant="warning"
  onConfirm={() => handleSoftDelete(athlete.id)}
/>
```

#### C. Hard Delete (Admin Only)

For GDPR/permanent deletion:

```typescript
<ConfirmModal
  title="⚠️ PERMANENT DELETE"
  message={`Type "${athlete.id}" to confirm permanent deletion. This CANNOT be undone.`}
  requiresTextConfirmation={athlete.id}
  confirmText="Delete Permanently"
  variant="danger"
  onConfirm={() => handleHardDelete(athlete.id)}
/>
```

### Phase 5: Additional Safeguards 🟢 (NICE TO HAVE)

- [ ] **5.1** Add foreign key constraints:

  ```sql
  ALTER TABLE athlete_kpis
  ADD CONSTRAINT fk_athlete
  FOREIGN KEY (athlete_id)
  REFERENCES users(id)
  ON DELETE CASCADE;
  ```

- [ ] **5.2** Set up automated backups:
  - Supabase Dashboard → Project Settings → Database
  - Enable Point-in-Time Recovery
  - Set retention period (7-30 days recommended)

- [ ] **5.3** Create backup script:

  ```bash
  # scripts/database/backup.sh
  pg_dump $DATABASE_URL > backups/$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **5.4** Add rate limiting to DELETE endpoint:
  - Max 5 deletes per hour per admin
  - Prevents accidental mass deletion

---

## 🎨 UI/UX AUDIT

### Current State: Athletes Page

#### ✅ What's Working Well:

1. **Mobile-First Design** - Touch-friendly buttons, responsive grid
2. **Clear Visual Hierarchy** - Typography components used consistently
3. **Loading States** - Skeleton screens while data loads
4. **Empty States** - Clear message when no athletes found
5. **Search & Filters** - Debounced search, status filters working
6. **Invite System** - Draft invites shown as "invited" status

#### 🔧 Areas for Improvement:

##### 1. No Delete Functionality in UI (GOOD!)

**Status:** ✅ This is actually SAFE

- Athletes page has NO delete buttons
- Prevents accidental deletions
- **Recommendation:** Keep it this way, or add ONLY to admin panel

##### 2. Athlete Card Actions

**Current Actions:**

- Message
- Assign Workout
- Manage KPIs
- View Analytics
- Add to Group
- Edit Email (for invites)
- Resend Invite
- Cancel Invite

**Missing:**

- Archive/Delete option (could add to admin-only menu)

##### 3. Invite Workflow

**File:** `src/app/athletes/components/modals/InviteAthleteModal.tsx`

**Current:**

- ✅ Group selection
- ✅ Draft invites (no email required)
- ✅ Resend invite
- ✅ Cancel invite

**Improvements Needed:**

- [ ] Show draft invites more clearly (currently mixed with pending)
- [ ] Add bulk invite (CSV upload)
- [ ] Email validation feedback
- [ ] Invite expiration warnings

##### 4. Athlete Detail Modal

**File:** `src/components/AthleteDetailModal.tsx`

**Current Tabs:**

- Overview (contact, KPIs, performance stats)
- PRs (personal records)
- History (activity log - not implemented yet)

**Improvements:**

- [ ] Add "Archived" tab for admins to see deleted athletes
- [ ] Show deletion warning if viewing deleted athlete
- [ ] Add restore button in deleted athlete view

##### 5. Group Management

**Current:**

- ✅ Create groups
- ✅ Edit groups
- ✅ Delete groups (with confirmation)
- ⚠️ Group delete doesn't check for orphaned athletes

**Fix Needed:**

```typescript
// Before deleting group, check for orphaned athletes
const orphanedAthletes = group.athlete_ids.filter(
  (id) => !athletes.some((a) => a.id === id)
);

if (orphanedAthletes.length > 0) {
  toast.warning(
    `Group has ${orphanedAthletes.length} deleted athletes. Clean up first.`
  );
}
```

---

## 🛡️ PREVENTION MEASURES

### 1. Database Constraints ✅

- Soft delete implemented → Can't lose data accidentally
- Audit log → Track all deletions
- Cascade cleanup → No orphaned references on hard delete

### 2. Code-Level Safeguards

```typescript
// Always use soft delete by default
apiClient.deleteAthlete(id, { soft: true, reason: "User requested" });

// Hard delete requires explicit confirmation
apiClient.deleteAthlete(id, {
  permanent: true,
  reason: "GDPR right to deletion",
  confirm: id, // Must match athlete ID
});
```

### 3. UI/UX Patterns

- No one-click delete buttons
- Always require confirmation
- Show impact (e.g., "Will affect 3 groups, 12 workout assignments")
- Different colors for severity (Archive = yellow, Delete = red)

### 4. Audit & Monitoring

```sql
-- Daily check for orphaned references
SELECT 'groups' as table_name, COUNT(*) as orphaned_count
FROM athlete_groups g
WHERE EXISTS (
  SELECT 1 FROM unnest(g.athlete_ids) as athlete_id
  WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE id = athlete_id
  )
);
```

---

## 📊 TESTING PLAN

### Unit Tests Needed:

1. Soft delete function
2. Restore function
3. Hard delete with cascade
4. API endpoint authorization

### Integration Tests Needed:

1. Delete athlete → Verify disappears from UI
2. Delete athlete → Verify removed from groups
3. Restore athlete → Verify reappears
4. Hard delete → Verify all references cleaned

### E2E Tests Needed:

1. Coach cannot delete athletes (403)
2. Admin can soft delete (200)
3. Admin can restore (200)
4. Hard delete requires confirmation (400 without)

---

## 📈 SUCCESS METRICS

After implementing all fixes:

- ✅ **Zero orphaned references** - Audit script returns clean
- ✅ **100% deletion audit coverage** - All deletes logged
- ✅ **Restore capability** - Deleted athletes can be recovered
- ✅ **Safe hard delete** - Cascade cleanup working
- ✅ **Zero data loss** - Soft delete by default
- ✅ **Session persistence** - 30-minute refresh (already fixed)

---

## 🚀 DEPLOYMENT STEPS

### Development → Staging:

1. Run all SQL migrations
2. Test soft delete/restore
3. Verify audit logs working
4. Test hard delete cascade

### Staging → Production:

1. Backup database first (`pg_dump`)
2. Run migrations during low-traffic window
3. Monitor audit logs for 24 hours
4. Verify no orphaned references

---

## 📞 SUPPORT & RECOVERY

### If Athletes Still Missing:

1. Check `deleted_athletes` view
2. Restore from audit log:
   ```sql
   SELECT * FROM athlete_audit_log
   WHERE action = 'hard_delete'
   ORDER BY performed_at DESC;
   ```
3. Contact Supabase support for PITR (Point-in-Time Recovery)

### Emergency Recovery:

```sql
-- Restore from audit log
INSERT INTO users (id, first_name, last_name, email, role, created_at)
SELECT
  record_id,
  record_data->>'first_name',
  record_data->>'last_name',
  record_data->>'email',
  'athlete',
  (record_data->>'created_at')::timestamp
FROM athlete_audit_log
WHERE action = 'hard_delete'
  AND performed_at > NOW() - INTERVAL '30 days';
```

---

## ✅ FINAL CHECKLIST

**Before considering this complete:**

- [ ] Ran `add-soft-delete-and-audit.sql`
- [ ] Ran `cleanup-orphaned-athletes.sql`
- [ ] Tested soft delete in development
- [ ] Tested restore in development
- [ ] Verified audit logs are written
- [ ] Updated API endpoints (already done)
- [ ] TypeScript compiles (already verified)
- [ ] Session persistence fixed (already done)
- [ ] Documented changes in CHANGELOG.md

**Optional but recommended:**

- [ ] Built deleted athletes admin UI
- [ ] Added foreign key constraints
- [ ] Set up automated backups
- [ ] Created monitoring dashboard
- [ ] Added E2E tests

---

## 📚 DOCUMENTATION UPDATES NEEDED

- [ ] Update API documentation with new DELETE parameters
- [ ] Add "Deleting Athletes" section to admin guide
- [ ] Document restore procedure
- [ ] Add troubleshooting section for orphaned references
- [ ] Create runbook for emergency recovery

---

**Status:** 🟡 Ready for Testing  
**Next Action:** Run database migrations  
**Timeline:** 30 minutes to fully deploy and test
