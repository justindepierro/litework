# Assignment Display Verification Checklist

## Post-Fix Testing Guide

Use this checklist to verify that assignments now display correctly after the snake_case/camelCase transformation fix.

### Setup

- [ ] Dev server running: `npm run dev`
- [ ] Logged in as coach account
- [ ] Browser console open (F12 → Console tab)

---

## Test 1: Create New Assignment

### Steps:

1. [ ] Go to Workouts page (`/workouts`)
2. [ ] Click "Assign Workout" button on any workout card
3. [ ] Select a group from dropdown
4. [ ] Choose today's date
5. [ ] (Optional) Add location and times
6. [ ] Click "Assign Workout"

### Expected Results:

- [ ] Toast notification: "Successfully assigned workout"
- [ ] No errors in browser console
- [ ] **Check console for validation:** Should see validation messages (dev mode only)

### Console Output to Look For:

```
[DEV VALIDATION WARN] getAllAssignments
Successfully validated workoutAssignment
```

If you see errors about snake_case fields, the transformation is missing.

---

## Test 2: View in Schedule Calendar

### Steps:

1. [ ] Stay on Workouts page or navigate to Dashboard
2. [ ] Look at the calendar/schedule section
3. [ ] Find today's date

### Expected Results:

- [ ] Assigned workout appears on calendar
- [ ] Shows workout name
- [ ] Shows assigned group name (if group assignment)
- [ ] Shows time (if you added it)
- [ ] Shows location icon (if you added it)

### If Assignment Doesn't Appear:

Check browser Network tab:

1. [ ] Find the `/api/assignments` GET request
2. [ ] Check the response data
3. [ ] Verify fields are camelCase: `workoutPlanId`, `scheduledDate`, `athleteIds`
4. [ ] If fields are snake_case: transformation didn't run

---

## Test 3: Check Athlete Cards

### Steps:

1. [ ] Go to Athletes page (or wherever athlete cards are displayed)
2. [ ] Find an athlete who is in the assigned group
3. [ ] Look at their card

### Expected Results:

- [ ] Card shows "X scheduled workouts" (where X > 0)
- [ ] Clicking on the card shows the assigned workout
- [ ] Workout details are correct (name, date, etc.)

### If Count Shows 0:

- [ ] Check browser console for errors
- [ ] Check Network tab for `/api/assignments?athleteId=...` request
- [ ] Verify response has camelCase fields

---

## Test 4: Individual Assignment

### Steps:

1. [ ] Go to Workouts page
2. [ ] Click "Assign Workout" on any workout
3. [ ] This time, select "Individual Athletes" tab
4. [ ] Select a specific athlete
5. [ ] Choose a date
6. [ ] Add notes (optional)
7. [ ] Click "Assign Workout"

### Expected Results:

- [ ] Success toast appears
- [ ] Assignment shows in calendar
- [ ] Shows on athlete's card
- [ ] No console errors

---

## Test 5: Update Assignment

### Steps:

1. [ ] Find an existing assignment in the calendar
2. [ ] Click to edit it
3. [ ] Change the date or add/edit location
4. [ ] Save changes

### Expected Results:

- [ ] Success message
- [ ] Assignment updates in calendar
- [ ] Changes persist on page reload
- [ ] No console errors

---

## Test 6: Validation in Development Mode

### Steps:

1. [ ] Open browser console
2. [ ] Filter for "VALIDATION" messages
3. [ ] Create/view a few assignments

### Expected Results:

- [ ] See validation messages like:
  ```
  [DEV VALIDATION WARN] getAllAssignments
  Successfully validated workoutAssignment
  ```
- [ ] **Should NOT see:**
  ```
  [DEV VALIDATION FAILED] ...
  Errors: Found snake_case fields: ...
  ```

### If You See Failure Messages:

- The transformation is incomplete
- Check the specific function mentioned in the error
- Report the error (it should not happen with the fix)

---

## Test 7: Database Direct Check

### Steps:

1. [ ] Open Supabase Dashboard
2. [ ] Go to SQL Editor
3. [ ] Run:
   ```sql
   SELECT * FROM workout_assignments
   ORDER BY created_at DESC
   LIMIT 5;
   ```

### Expected Results:

- [ ] See your recently created assignments
- [ ] Fields are in snake_case (correct for database)
- [ ] Check these fields exist:
  - `workout_plan_id`
  - `workout_plan_name`
  - `athlete_ids` (array)
  - `assignment_type`
  - `status`
  - `scheduled_date`
  - `start_time`, `end_time`, `location` (if you added them)

---

## Test 8: Production Build Check

### Steps:

1. [ ] Stop dev server
2. [ ] Run: `npm run build`
3. [ ] Check for TypeScript errors
4. [ ] Run: `npm start` (production mode)
5. [ ] Test assignment creation in production build

### Expected Results:

- [ ] Build completes successfully: 0 errors
- [ ] Production server starts
- [ ] Assignments work identically to dev mode
- [ ] **No validation messages in console** (dev-only feature)
- [ ] Performance is identical

---

## Troubleshooting

### Issue: Assignments create but don't show

**Check:**

1. Browser console for errors
2. Network tab → `/api/assignments` response
3. Are fields snake_case or camelCase?

**Solution:**

- If snake_case in response: transformation missing in API route
- If camelCase in response: check frontend parsing

### Issue: Validation errors in console

**Example Error:**

```
[DEV VALIDATION FAILED] getAllAssignments
Errors: Found snake_case fields: workout_plan_id, scheduled_date
```

**Solution:**

- Function is missing `transformToCamel()` call
- Check `/src/lib/database-service.ts`
- Find the function mentioned in error
- Add transformation (see documentation)

### Issue: TypeScript errors

**Solution:**

- Run: `npx tsc --noEmit`
- Check specific error messages
- Usually means type definitions don't match transformed data

---

## Success Criteria

✅ All tests pass  
✅ No console errors  
✅ Assignments display in all locations  
✅ Validation shows success (dev mode)  
✅ Production build works  
✅ Database has correct data

---

## Report Issues

If any test fails:

1. **Note the test number and step**
2. **Copy console errors** (if any)
3. **Take screenshot** of the issue
4. **Check Network tab** for API responses
5. **Include which function** is involved

Common patterns to report:

- "Test 2 fails: assignments don't show in calendar"
- "Console shows: [DEV VALIDATION FAILED] getAllAssignments"
- "Network response has snake_case fields in /api/assignments"

---

**Testing Completed:** ****\_\_**** (Date/Time)  
**Tested By:** ****\_\_****  
**Results:** ☐ All Pass | ☐ Issues Found (describe below)

**Notes:**
