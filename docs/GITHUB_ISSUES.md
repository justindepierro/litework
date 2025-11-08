# GitHub Issues - Technical Debt from TODO Audit

Created: November 7, 2025  
Source: Phase 2 Production Cleanup - TODO_AUDIT.md

## How to Create These Issues

Copy each issue template below and create in GitHub with the specified labels.

---

## Issue 1: Implement Email Invitation System

**Labels:** `enhancement`, `feature`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 1-2 hours

**Description:**

Currently, the bulk operations API creates user invitations but doesn't send email notifications. This leaves users unaware they've been invited to the platform.

**Current Behavior:**
```typescript
// src/app/api/bulk-operations/route.ts:124
// TODO: Send invitation email to user.email
```

**Desired Behavior:**
- Send email using Resend API when invitation is created
- Email should include invitation code and signup link
- Use existing Resend configuration from environment variables

**Implementation Notes:**
- Email service setup exists (RESEND_API_KEY in .env.example)
- Reference existing email patterns if any
- Template should be mobile-responsive
- Include invitation expiration date

**Files to Modify:**
- `src/app/api/bulk-operations/route.ts` (line 124)
- Possibly create `src/lib/email-service.ts` for reusable email functions

---

## Issue 2: Implement Message System API

**Labels:** `enhancement`, `feature`, `backend`  
**Priority:** Medium  
**Estimate:** 2-3 hours

**Description:**

The messages API endpoint currently has placeholder implementation. Need to build complete message fetching, creation, and management system.

**Current Behavior:**
```typescript
// src/app/api/messages/route.ts:17
// TODO: Implement actual message fetching from database
return NextResponse.json({ messages: [] });
```

**Desired Behavior:**
- Fetch messages from `messages` table (if exists) or create schema
- Support filtering by user (sender/recipient)
- Include pagination for large message lists
- Handle both direct messages and group messages

**Implementation Checklist:**
- [ ] Verify/create `messages` database schema
- [ ] Implement GET endpoint with filters
- [ ] Implement POST endpoint for creating messages
- [ ] Add proper RLS policies for message access
- [ ] Add TypeScript types in `src/types/index.ts`

**Files to Modify:**
- `src/app/api/messages/route.ts` (line 17)
- Database schema (if messages table doesn't exist)
- `src/types/index.ts` (Message types)

---

## Issue 3: Integrate Edit Modals in WorkoutCalendar

**Labels:** `enhancement`, `ui`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 30 minutes

**Description:**

The WorkoutCalendar component needs integration with edit modals for quick workout modifications from calendar view.

**Current Behavior:**
```typescript
// src/components/WorkoutCalendar.tsx:156
// TODO: Integrate with edit modal when ready
```

**Desired Behavior:**
- Clicking workout event opens edit modal
- Modal allows editing workout details (name, exercises, date)
- Changes save and calendar updates immediately
- Close modal returns to calendar view

**Implementation Notes:**
- Determine which edit modal to use (WorkoutEditor?)
- Pass workout ID and refetch callback
- Consider mobile UX (full-screen modal on small devices)

**Files to Modify:**
- `src/components/WorkoutCalendar.tsx` (line 156)

---

## Issue 4: Add Edit Modal to GroupWorkoutItem

**Labels:** `enhancement`, `ui`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 30 minutes

**Description:**

Group workout items in calendar view need edit modal integration for quick modifications.

**Current Behavior:**
```typescript
// src/components/WorkoutCalendar.tsx:268
// TODO: Integrate with edit modal
```

**Desired Behavior:**
- Edit button opens workout editor modal
- Pre-populated with current workout data
- Save updates workout and refreshes calendar
- Consider permissions (coach/admin only)

**Implementation Notes:**
- Similar to Issue 3, but for group workout context
- Ensure proper auth checks (coaches only)
- May need group-specific editing logic

**Files to Modify:**
- `src/components/WorkoutCalendar.tsx` (line 268)

---

## Issue 5: Add Edit Modal to IndividualWorkoutItem

**Labels:** `enhancement`, `ui`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 30 minutes

**Description:**

Individual workout items need edit modal integration, matching group workout functionality.

**Current Behavior:**
```typescript
// src/components/WorkoutCalendar.tsx:347
// TODO: Integrate with edit modal
```

**Desired Behavior:**
- Consistent edit experience across all workout types
- Pre-fill modal with workout details
- Save and refresh on success

**Implementation Notes:**
- Third location for same pattern (consider extracting shared logic)
- Could create `useWorkoutEditModal` hook to reduce duplication

**Files to Modify:**
- `src/components/WorkoutCalendar.tsx` (line 347)

**Refactoring Opportunity:**
Consider creating shared hook/component for workout editing used by all three locations (Issues 3, 4, 5).

---

## Issue 6: Fix Progress Analytics Calculation

**Labels:** `bug`, `analytics`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 15 minutes

**Description:**

Progress analytics uses hardcoded test value instead of actual calculation.

**Current Behavior:**
```typescript
// src/components/ProgressAnalytics.tsx:85
const avg = 8.5; // TODO: Calculate actual average RPE from data
```

**Desired Behavior:**
- Calculate real average RPE from workout session data
- Handle empty data (no workouts completed)
- Show loading state while calculating

**Implementation:**
```typescript
const avg = data.length > 0 
  ? data.reduce((sum, entry) => sum + entry.averageRpe, 0) / data.length
  : 0;
```

**Files to Modify:**
- `src/components/ProgressAnalytics.tsx` (line 85)

---

## Issue 7: Integrate Auth Context in IndividualAssignmentModal

**Labels:** `enhancement`, `auth`, `refactoring`  
**Priority:** Medium  
**Estimate:** 30 minutes

**Description:**

The individual assignment modal uses local auth state instead of global auth context, causing inconsistencies.

**Current Behavior:**
```typescript
// src/components/GroupAssignmentModal.tsx:34
// TODO: This should be integrated with auth context
const [currentUser, setCurrentUser] = useState<any>(null);
```

**Desired Behavior:**
- Use `useAuth()` hook from auth context
- Remove duplicate auth state management
- Consistent user data across components

**Implementation:**
```typescript
const { user: currentUser } = useAuth();
```

**Files to Modify:**
- `src/components/GroupAssignmentModal.tsx` (line 34)
- Remove `setCurrentUser` and related useEffect

**Benefits:**
- Eliminates duplicate auth logic
- Ensures consistent user state
- Reduces component complexity

---

## Issue 8: Load Athletes from API (Verify Need)

**Labels:** `question`, `enhancement`, `api`  
**Priority:** Low → Medium (investigate first)  
**Estimate:** 1 hour (if needed)

**Description:**

Need to verify if this TODO is still relevant or if athletes are already loaded elsewhere.

**Current State:**
```typescript
// src/components/GroupAssignmentModal.tsx:57
// TODO: Load athletes from API
```

**Investigation Needed:**
- Are athletes already loaded in parent component?
- Does the modal receive athletes as props?
- Should we fetch athletes locally or lift state?

**Action Items:**
1. Check component usage in codebase
2. Verify if athletes prop is passed
3. If not, implement API call to `/api/athletes`
4. Add loading and error states

**Files to Check:**
- `src/components/GroupAssignmentModal.tsx` (line 57)
- Parent components that use GroupAssignmentModal
- `src/app/api/athletes/route.ts` (verify endpoint exists)

---

## Issue 9: Implement WorkoutView API Loading

**Labels:** `enhancement`, `api`, `good-first-issue`  
**Priority:** Medium  
**Estimate:** 30 minutes

**Description:**

WorkoutView component needs to fetch workout data from API instead of using placeholder.

**Current Behavior:**
```typescript
// src/components/WorkoutView.tsx:69
// TODO: Call API to get workout based on sessionId
```

**Desired Behavior:**
- Fetch workout session details from `/api/workout-sessions/[id]`
- Show loading spinner while fetching
- Handle error states gracefully
- Display workout data when loaded

**Implementation Pattern:**
```typescript
useEffect(() => {
  async function fetchWorkout() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workout-sessions/${sessionId}`);
      const data = await response.json();
      setWorkout(data);
    } catch (error) {
      setError("Failed to load workout");
    } finally {
      setIsLoading(false);
    }
  }
  fetchWorkout();
}, [sessionId]);
```

**Files to Modify:**
- `src/components/WorkoutView.tsx` (line 69)
- Verify API endpoint exists at `src/app/api/workout-sessions/[id]/route.ts`

---

## Issue 10: Add Sentry Error Tracking

**Labels:** `enhancement`, `monitoring`, `infrastructure`  
**Priority:** Low (nice-to-have)  
**Estimate:** 1 hour

**Description:**

Error boundaries currently log to console but should send to error tracking service like Sentry for production monitoring.

**Current Behavior:**
```typescript
// src/components/GlobalErrorBoundary.tsx:36
// TODO: Send to Sentry or other error tracking service
console.error("Error caught by boundary:", error, errorInfo);
```

**Desired Behavior:**
- Integrate Sentry SDK
- Send error details to Sentry dashboard
- Include user context and error boundary info
- Keep console.error for development

**Implementation Steps:**
1. Add `@sentry/nextjs` dependency
2. Configure Sentry in `next.config.ts`
3. Add SENTRY_DSN to environment variables
4. Update error boundary to call Sentry.captureException()

**Files to Modify:**
- `src/components/GlobalErrorBoundary.tsx` (line 36)
- `next.config.ts` (Sentry config)
- `.env.example` (document SENTRY_DSN)

**Optional:** This can be deferred until after initial tester deployment.

---

## Low Priority TODOs (Review/Remove)

These TODOs should be reviewed and potentially removed if no longer relevant:

### 1. Add Pause/Resume Tracking Feature
- **File:** `src/components/WorkoutLive.tsx:428`
- **Description:** Nice-to-have feature for tracking workout rest periods
- **Action:** Create separate feature request issue if desired, remove TODO for now

### 2. Consider Loading Athletes from API
- **File:** `src/components/GroupFormModal.tsx:26`
- **Description:** Duplicate of Issue 8 above
- **Action:** Remove after investigating Issue 8

### 3. Implement Message Fetching
- **File:** `src/app/api/messages/route.ts:17`
- **Description:** Covered by Issue 2
- **Action:** Will be resolved by Issue 2

### 4. Load Athletes from API
- **File:** `src/components/GroupAssignmentModal.tsx:57`
- **Description:** Covered by Issue 8
- **Action:** Will be resolved by Issue 8

### 5. Implement WorkoutView API
- **File:** `src/components/WorkoutView.tsx:69`
- **Description:** Covered by Issue 9
- **Action:** Will be resolved by Issue 9

---

## Summary

**Total Issues to Create:** 10  
**Estimated Total Time:** 8-10 hours  
**Priority Breakdown:**
- High: 0 (critical TODOs already fixed)
- Medium: 9 (features and enhancements)
- Low: 1 (Sentry integration - optional)

**Quick Wins (< 1 hour each):**
- Issue 3: Integrate edit modal in WorkoutCalendar
- Issue 4: Edit modal for GroupWorkoutItem
- Issue 5: Edit modal for IndividualWorkoutItem
- Issue 6: Fix progress analytics calculation
- Issue 7: Use auth context
- Issue 9: WorkoutView API loading

**Larger Tasks (> 1 hour):**
- Issue 1: Email invitation system
- Issue 2: Message system API
- Issue 8: Athletes API (if needed)
- Issue 10: Sentry integration (optional)

## Next Steps

1. Create these issues on GitHub with appropriate labels
2. Consider creating a "Technical Debt" milestone
3. Mark quick wins as "good first issue" for potential contributors
4. Prioritize Issues 1, 2, and 9 for tester deployment readiness
5. Issues 3-5 can be batched together (same pattern, could create shared solution)
