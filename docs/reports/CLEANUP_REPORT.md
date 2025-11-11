# Comprehensive Cleanup Report

**Generated:** 2025-11-10T13:18:20.571Z
**Files Scanned:** 237

## Summary

| Metric | Count | Status |
|--------|-------|--------|
| Console Logs | 161 | ⚠️ |
| Unauth API Routes | 6 | ❌ |
| Naming Violations | 0 | ✓ |
| Hardcoded Styles | 334 | ⚠️ |

## Issues by Severity

- 🔴 **Errors:** 6 (must fix)
- 🟡 **Warnings:** 161 (should fix)
- 🔵 **Info:** 334 (nice to have)

## Critical Errors

- `src/app/api/cron/workout-reminders/route.ts:1` - API route missing authentication
- `src/app/api/exercises/search/route.ts:1` - API route missing authentication
- `src/app/api/invites/accept/route.ts:1` - API route missing authentication
- `src/app/api/invites/validate/[code]/route.ts:1` - API route missing authentication
- `src/app/api/maintenance/cleanup/route.ts:1` - API route missing authentication
- `src/app/api/notifications/inbox/route.ts:1` - API route missing authentication

## Warnings

- `src/app/api/assignments/[id]/route.ts:23` - console statement: // [REMOVED] console.log(`[API] Fetching assignment ${id} for user ${user.id}`);
- `src/app/api/assignments/[id]/route.ts:83` - console statement: console.log(`[API] Assignment query result:`, {
- `src/app/api/assignments/reschedule/route.ts:34` - console statement: console.log("[RESCHEDULE] Request received:", {
- `src/app/api/assignments/reschedule/route.ts:57` - console statement: console.log("[RESCHEDULE] Found assignment:", {
- `src/app/api/assignments/reschedule/route.ts:75` - console statement: // [REMOVED] console.log("[RESCHEDULE] Target date calculated:", targetDate.toIS
- `src/app/api/assignments/reschedule/route.ts:79` - console statement: // [REMOVED] console.log("[RESCHEDULE] Processing group assignment move");
- `src/app/api/assignments/reschedule/route.ts:103` - console statement: console.log(`[RESCHEDULE] About to update ${assignmentIds.length} assignments`, 
- `src/app/api/assignments/reschedule/route.ts:125` - console statement: // [REMOVED] console.log(`[RESCHEDULE] Successfully updated ${assignmentIds.leng
- `src/app/api/assignments/reschedule/route.ts:151` - console statement: // [REMOVED] console.log("[RESCHEDULE] Processing individual assignment move");
- `src/app/api/assignments/reschedule/route.ts:172` - console statement: // [REMOVED] console.log(`[RESCHEDULE] Successfully updated individual assignmen
- `src/app/api/assignments/route.ts:178` - console statement: // [REMOVED] console.log("No athletes to notify for assignment");
- `src/app/api/assignments/route.ts:229` - console statement: console.log(
- `src/app/api/cron/workout-reminders/route.ts:48` - console statement: // [REMOVED] console.log('[CRON] Starting workout reminder cron job...');
- `src/app/api/cron/workout-reminders/route.ts:90` - console statement: // [REMOVED] console.log('[CRON] No upcoming workouts to remind about');
- `src/app/api/cron/workout-reminders/route.ts:98` - console statement: // [REMOVED] console.log(`[CRON] Found ${assignments.length} upcoming workouts`)
- `src/app/api/cron/workout-reminders/route.ts:121` - console statement: // [REMOVED] console.log('[CRON] No athletes have workout reminders enabled');
- `src/app/api/cron/workout-reminders/route.ts:129` - console statement: // [REMOVED] console.log(`[CRON] ${athletesWithReminders.length} athletes have r
- `src/app/api/cron/workout-reminders/route.ts:230` - console statement: // [REMOVED] console.log(`[CRON] Sending reminder to ${athlete.name} for "${work
- `src/app/api/cron/workout-reminders/route.ts:248` - console statement: // [REMOVED] console.log('[CRON] No reminders to send at this time');
- `src/app/api/cron/workout-reminders/route.ts:270` - console statement: // [REMOVED] console.log(`[CRON] Workout reminders complete: ${successful} sent,

... and 141 more warnings

## Recommendations

1. **⚠️ Fix unprotected API routes immediately**
2. **⚠️ Remove console.logs before production**
3. **✓ Naming conventions followed**
4. **⚠️ Migrate to component system**

## Next Steps

```bash
# Fix automatically (if supported)
node cleanup.mjs --fix

# Review specific issues
grep -n "console.log" src/**/*.ts
```
