# Date/Timestamp Bug Audit Summary

**Date**: November 7, 2025  
**Audit Tool**: `scripts/analysis/audit-date-bugs.mjs`

## Executive Summary

Scanned **187 files** (53,404 lines) and found **86 potential issues**:

- **55 HIGH** severity (most are false positives)
- **1 MEDIUM** severity
- **30 INFO** (type definitions)

## The Bug We Fixed

### Problem

**File**: `src/app/api/assignments/reschedule/route.ts`  
**Issue**: Sending full ISO timestamp to DATE column

```typescript
// ❌ WRONG - Sends "2025-11-07T12:00:00.000Z"
scheduled_date: targetDate.toISOString();
```

**Result**: PostgreSQL silently failed to update rows due to type mismatch.

### Solution

```typescript
// ✅ CORRECT - Sends "2025-11-07"
const dateOnly = targetDate.toISOString().split("T")[0];
scheduled_date: dateOnly;
```

**Impact**: Drag-and-drop workout rescheduling now persists correctly!

## Database Column Types Reference

### DATE Columns (Use `.split('T')[0]`)

- `workout_assignments.scheduled_date`
- `workout_assignments.assigned_date`
- `workout_assignments.due_date`
- `workout_sessions.date`
- `progress_entries.date`
- `athlete_kpis.date`

### TIMESTAMP Columns (Use `.toISOString()`)

- `*.created_at`
- `*.updated_at`
- `workout_sessions.started_at`
- `workout_sessions.completed_at`
- `notifications.read_at`

## Audit Results Analysis

### False Positives

Most HIGH severity issues (45 out of 55) are false positives because:

- Script incorrectly flags `updated_at` (TIMESTAMP) in same `.update()` as DATE columns
- Pattern matching is too broad
- Some columns like `read_at`, `used_at` are actually TIMESTAMP types

### True Positives

The audit **correctly identified**:

1. ✅ `reschedule/route.ts` - Fixed (sending dateOnly now)
2. Other potential issues in update operations (need manual review)

### Recommendations

#### Immediate Actions

1. ✅ **DONE**: Fixed reschedule route date format
2. Review other API routes that update DATE columns
3. Add date conversion helper functions

#### Long-term Improvements

1. **Create date utilities**:

   ```typescript
   // lib/date-utils.ts
   export const toDateOnly = (date: Date): string =>
     date.toISOString().split("T")[0];

   export const toTimestamp = (date: Date): string => date.toISOString();
   ```

2. **Add runtime validation**:

   ```typescript
   // Validate DATE format before sending to DB
   const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
   if (!DATE_REGEX.test(dateString)) {
     throw new Error("Invalid date format");
   }
   ```

3. **Improve TypeScript types**:
   - Create separate types for DATE vs TIMESTAMP columns
   - Use branded types to prevent mixing

4. **Database migration**:
   - Consider using TIMESTAMP for all date/time columns
   - Convert DATE columns to TIMESTAMP WITH TIME ZONE
   - Benefit: Timezone awareness, no format mismatches

## Testing Checklist

- [x] Drag-and-drop saves to database
- [x] Date persists after page refresh
- [x] Date displays correctly in multiple views (schedule, dashboard)
- [ ] Test across timezone boundaries
- [ ] Test with leap years and edge dates
- [ ] Test with different date formats in API

## Audit Script Usage

```bash
# Run the audit
node scripts/analysis/audit-date-bugs.mjs

# View detailed JSON report
cat audit-date-bugs-report.json | jq '.issues[] | select(.severity == "HIGH")'
```

## Files Modified

- ✅ `src/app/api/assignments/reschedule/route.ts` - Fixed date format
- ✅ `scripts/analysis/audit-date-bugs.mjs` - Created audit tool

## Next Steps

1. Review other DATE column updates in codebase
2. Create standardized date utility functions
3. Add integration tests for date operations
4. Consider database schema changes for consistency
