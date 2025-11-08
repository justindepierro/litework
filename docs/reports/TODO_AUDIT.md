# TODO Comments Audit

**Date: November 7, 2025**
**Total TODOs Found: 17**

## Summary

| Priority                        | Count | Action                          |
| ------------------------------- | ----- | ------------------------------- |
| 🔴 **Critical** (Implement Now) | 2     | Security/functionality issues   |
| 🟡 **Medium** (Document)        | 10    | Feature enhancements, can defer |
| 🟢 **Low** (Remove/Keep)        | 5     | Already implemented or trivial  |

---

## 🔴 CRITICAL - Implement Now (2)

### 1. Security: Group Membership Checks

**Files:**

- `src/app/api/assignments/[id]/route.ts:104`
- `src/app/api/assignments/[id]/route.ts:299`

**TODOs:**

```typescript
// TODO: Check if user is in assigned group
// TODO: Check group membership for group assignments
```

**Issue:** Athletes might be able to access workouts assigned to groups they're not in.

**Priority:** HIGH - Security vulnerability

**Action Required:** Implement group membership validation in assignment access checks

**Estimated Time:** 30 minutes

---

## 🟡 MEDIUM - Document for Later (10)

### 2. Email Invitation System

**File:** `src/app/api/bulk-operations/route.ts:124`

**TODO:**

```typescript
// TODO: Send invitation email
```

**Context:** Email sending infrastructure exists (Resend), just needs wiring

**Priority:** MEDIUM - Important for user onboarding

**Action:** Create GitHub issue, implement post-tester launch

### 3. Message System Implementation

**Files:**

- `src/app/api/messages/route.ts:17`
- `src/app/api/messages/route.ts:41`

**TODOs:**

```typescript
// TODO: Implement actual message fetching from database
// TODO: Implement actual message sending to database
```

**Context:** Communication schema exists in database, routes are placeholders

**Priority:** MEDIUM - Nice to have for coach-athlete communication

**Action:** Create GitHub issue, implement in v2

### 4. Group Messaging

**File:** `src/app/api/bulk-operations/route.ts:179`

**TODO:**

```typescript
// TODO: Handle group messaging by expanding groups to individual athletes
```

**Context:** Related to message system above

**Priority:** MEDIUM - Depends on message system

**Action:** Bundle with message system implementation

### 5. Edit Modal Integration

**Files:**

- `src/app/athletes/page.tsx:1307`
- `src/app/athletes/page.tsx:2027`
- `src/app/dashboard/page.tsx:203`

**TODOs:**

```typescript
// TODO: Open edit modal to add email
// TODO: Open edit modal
// TODO: Open edit modal or navigate to edit page
```

**Context:** UI enhancement - edit-in-place modals

**Priority:** LOW-MEDIUM - UX improvement

**Action:** Design modal system first, then implement

### 6. Athlete Loading from API

**Files:**

- `src/components/GroupFormModal.tsx:92`
- `src/components/CalendarView.tsx:37`

**TODOs:**

```typescript
// TODO: Load athletes from API
```

**Context:** Currently using hardcoded data or props

**Priority:** LOW - Already working with current data flow

**Action:** Review if actually needed or if current approach is better

### 7. Workout Update Cascade

**File:** `src/app/api/workouts/route.ts:242`

**TODO:**

```typescript
// TODO: Also update workout_exercises, workout_exercise_groups, and workout_block_instances tables
```

**Context:** Complex workout update logic

**Priority:** MEDIUM - Data integrity

**Action:** Test current implementation, implement if issues found

### 8. Progress Analytics Calculations

**File:** `src/components/ProgressAnalytics.tsx:127`

**TODO:**

```typescript
avgImprovement: 8.5, // TODO: Calculate from actual data
```

**Context:** Hardcoded placeholder value

**Priority:** MEDIUM - Analytics feature

**Action:** Implement proper calculation based on workout history

### 9. Workout Session API Implementation

**File:** `src/components/WorkoutView.tsx:35`

**TODO:**

```typescript
// TODO: Implement actual API call to fetch workout session
```

**Context:** May already be implemented elsewhere

**Priority:** LOW - Check if still needed

**Action:** Audit WorkoutView component, remove if obsolete

### 10. Auth Context Integration

**File:** `src/components/IndividualAssignmentModal.tsx:112`

**TODO:**

```typescript
assignedBy: "coach1", // TODO: Get from auth context
```

**Context:** Hardcoded coach ID

**Priority:** MEDIUM - Should use authenticated user

**Action:** Pass user from AuthContext

---

## 🟢 LOW - Review/Remove (5)

### 11. Error Logging to Sentry

**File:** `src/components/GlobalErrorBoundary.tsx:36`

**TODO:**

```typescript
// TODO: Send to Sentry or similar
```

**Context:** Error boundary exists, Sentry integration optional

**Priority:** LOW - Console.error is acceptable for now

**Action:** Keep comment, implement when adding Sentry

### 12. Pause Duration Tracking

**File:** `src/lib/session-storage.ts:85`

**TODO:**

```typescript
// TODO: Track pause durations and subtract them
```

**Context:** Workout timer accuracy

**Priority:** LOW - Minor feature

**Action:** Nice to have, not critical

---

## Action Plan

### Immediate (Today/Tomorrow)

1. ✅ **Implement Group Membership Checks** (30 min)
   - Add validation in assignment routes
   - Test with different user roles

### Short Term (This Week)

2. **Create GitHub Issues** for Medium priority items:
   - Email invitation system
   - Message system implementation
   - Group messaging
   - Edit modals
   - Progress analytics calculations
   - Auth context integration

### Long Term (Post-Launch)

3. **Review Low Priority TODOs**:
   - Sentry integration
   - Pause duration tracking
   - Athlete loading patterns

### Clean Up (This Week)

4. **Remove Obsolete TODOs**:
   - Check if "Load athletes from API" is still needed
   - Verify WorkoutView API implementation
   - Remove comments for already-implemented features

---

## Implementation Details

### 🔴 Critical Fix: Group Membership Validation

**File:** `src/app/api/assignments/[id]/route.ts`

**Current Code (Line 99-107):**

```typescript
// GET /api/assignments/[id] - Get single assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    if (!isCoach(user)) {
      // TODO: Check if user is in assigned group
      // For athletes, verify they are assigned this workout
```

**Proposed Fix:**

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (user) => {
    const assignment = await fetchAssignment(params.id);

    if (!isCoach(user)) {
      // Verify athlete has access to this assignment
      const hasAccess = assignment.userId === user.id ||
                       (assignment.groupId && await isUserInGroup(user.id, assignment.groupId));

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Not authorized to view this assignment" },
          { status: 403 }
        );
      }
    }
```

**Required Helper Function:**

```typescript
async function isUserInGroup(
  userId: string,
  groupId: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("athlete_group_members")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .single();

  return !error && !!data;
}
```

---

## Statistics

- **Total TODOs:** 17
- **Security Issues:** 2 (12%)
- **Feature Enhancements:** 10 (59%)
- **Minor/Optional:** 5 (29%)
- **Estimated Total Effort:** 4-6 hours
- **Critical Path Effort:** 30 minutes

---

## Recommendations

1. **Today:** Fix the 2 security TODOs (group membership checks)
2. **This Week:** Create GitHub issues for all Medium priority items
3. **Post-Launch:** Implement features based on tester feedback
4. **Maintenance:** Review TODOs quarterly, remove obsolete ones

---

## GitHub Issue Templates

### Template 1: Email Invitation System

```markdown
**Title:** Implement Email Invitation System

**Description:**
Wire up email invitation sending when coaches invite athletes.

**Technical Details:**

- Resend API already configured
- Email templates need creation
- Trigger: bulk-operations route (line 124)

**Priority:** Medium
**Effort:** 2-3 hours
**Dependencies:** None
```

### Template 2: Message System

```markdown
**Title:** Implement Coach-Athlete Messaging

**Description:**
Complete the messaging system for coach-athlete communication.

**Technical Details:**

- Database schema exists (communication-schema.sql)
- API routes are placeholders (messages/route.ts)
- Need: message CRUD, real-time updates (optional)

**Priority:** Medium
**Effort:** 4-6 hours
**Dependencies:** None
```

---

**Last Updated:** November 7, 2025
**Next Review:** After fixing critical TODOs
