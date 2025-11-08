# Production Readiness Plan

**Target: Tester Deployment Next Week**
**Created: 2025-01-XX**

## Executive Summary

**Current Status:**

- ✅ Production build: SUCCESS (21.9s compile, 61 pages)
- ✅ TypeScript: CLEAN (0 errors)
- ⚠️ ESLint: 68 issues (9 critical errors, 59 warnings)
- ⚠️ Console.logs: 140 statements across src/
- ⚠️ TODOs: 17 comments needing review
- ✅ .env.example: Created

**Recommendation:** Code is functionally working but needs quality improvements for professional tester release.

---

## Phase 1: Critical Fixes (MUST DO)

### 1.1 Fix 9 Critical ESLint Errors

**Priority: HIGHEST**

#### src/app/diagnose/page.tsx (4 errors)

- **Issue**: Function `runDiagnostics` used in useEffect before declaration
- **Fix**: Move function declaration above useEffect OR use useCallback
- **Impact**: Code works but violates React best practices

```typescript
// OPTION 1: Move function above useEffect
const runDiagnostics = async () => { ... };

useEffect(() => {
  runDiagnostics();
}, []);

// OPTION 2: Use useCallback
const runDiagnostics = useCallback(async () => { ... }, []);
```

**Type Errors (3):**

- Lines with `Record<string, any>` should use proper types
- Error handlers need proper typing

#### src/components/WorkoutLive.tsx (3 errors)

- **Issue**: setState calls inside useEffect without proper dependencies
- **Fix**: Extract logic or add to dependency array
- **Impact**: May cause unnecessary re-renders or stale state

#### src/components/WorkoutView.tsx (2 errors)

- **Issue**: Error handlers using `any` type
- **Fix**: Type as `Error` or `unknown`

```typescript
// BEFORE
} catch (error: any) { ... }

// AFTER
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

---

### 1.2 Remove/Replace Console.log Statements

**Priority: HIGH**
**Count: 140 statements**

**Strategy:**

1. Use existing `logger.ts` (already production-ready with dev/prod modes)
2. Run `scripts/dev/remove-console-logs.mjs` to find all instances
3. Categorize:
   - **Remove:** Debug statements no longer needed
   - **Replace:** Important logs → use `logger.debug()` or `logger.info()`
   - **Keep:** Diagnose page logs (this is diagnostic tool)

**Critical Files (10+ console.logs each):**

- `src/app/api/assignments/[id]/route.ts` (10)
- `src/app/api/assignments/reschedule/route.ts` (10)
- `src/app/dashboard/page.tsx`
- `src/app/schedule/page.tsx`

**Recommendation:**

- Start with API routes (remove verbose logging)
- Replace client-side logs with logger.debug()
- Keep error logging but use logger.error()

---

## Phase 2: Code Quality (SHOULD DO)

### 2.1 Fix 59 ESLint Warnings

**Priority: MEDIUM**
**Types:**

- Unused imports: `transformToCamel`, `transformToSnake` (30+ files)
- Unused variables: `err`, `isCoach`, `hasRoleOrHigher`
- Unused React hooks: `isSameDay`, `isToday`

**Impact:** Build succeeds despite warnings, but clutters codebase

**Strategy:**

1. Run ESLint auto-fix: `npm run lint -- --fix`
2. Manually review remaining warnings
3. Remove genuinely unused code
4. Keep imports if they're "commented out for future use" → add comment explaining why

---

### 2.2 Address TODO Comments

**Priority: MEDIUM**
**Count: 17 comments**

**Categories:**

1. **Implement Now** (blocking testers):
   - "TODO: Send invitation email" → Critical for user onboarding
   - "TODO: Check if user is in assigned group" → Security concern

2. **Document for Later** (post-tester):
   - "TODO: Add pagination" → Performance optimization
   - "TODO: Implement caching" → Enhancement

3. **Remove if Obsolete**:
   - Check if functionality already exists
   - Remove outdated comments

**Action:**

- Create GitHub issues for "later" items
- Implement or remove "now" items
- Update comments with issue numbers if keeping

---

## Phase 3: Documentation (SHOULD DO)

### 3.1 Environment Variables

- ✅ .env.example created
- ⏳ Verify all required variables documented
- ⏳ Add production deployment instructions

### 3.2 Deployment Checklist

- ⏳ Create pre-deployment verification steps
- ⏳ Document rollback procedure
- ⏳ List required environment variables for Vercel

### 3.3 Tester Onboarding

- ⏳ Create tester quick-start guide
- ⏳ Document known limitations
- ⏳ Provide test accounts and data

---

## Phase 4: Testing (MUST DO)

### 4.1 Critical User Flows

- [ ] Coach signup/login
- [ ] Athlete signup/login
- [ ] Create workout with exercise groups
- [ ] Assign workout to group
- [ ] Athlete views assignment
- [ ] Athlete completes workout (live mode)
- [ ] Coach views progress analytics
- [ ] Calendar drag-and-drop scheduling

### 4.2 Mobile Testing

- [ ] iOS Safari (primary target)
- [ ] Android Chrome
- [ ] PWA installation works
- [ ] Touch targets adequate (44x44px minimum)
- [ ] Offline functionality (service worker)

### 4.3 Performance

- [ ] Lighthouse score > 80 on mobile
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] No layout shifts (CLS < 0.1)

---

## Phase 5: Deployment Preparation

### 5.1 Vercel Configuration

```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
FROM_EMAIL
NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL
```

### 5.2 Supabase Production Database

- [ ] Run all migrations on production DB
- [ ] Verify RLS policies active
- [ ] Set up database backups
- [ ] Configure connection pooling

### 5.3 Error Monitoring

- [ ] Configure Sentry (optional but recommended)
- [ ] Set up logging aggregation
- [ ] Create alert rules for critical errors

---

## Execution Timeline

### Day 1-2: Critical Fixes

- ✅ Fix 9 ESLint errors
- ✅ Remove/replace console.logs
- ✅ Test critical user flows

### Day 3-4: Code Quality

- ✅ Fix ESLint warnings
- ✅ Address TODOs (implement or document)
- ✅ Complete documentation

### Day 5-6: Testing & Polish

- ✅ Full mobile testing
- ✅ Performance optimization
- ✅ Create tester guide

### Day 7: Deploy

- ✅ Final verification
- ✅ Deploy to Vercel
- ✅ Smoke tests in production
- ✅ Invite testers

---

## Decision Points

### Keep or Remove?

**Console.logs in Diagnose Page:**

- **KEEP** - This is a diagnostic tool, logging is intentional
- Add comment: `// Intentional - diagnostic logging`

**Unused Utility Functions:**

- **KEEP** - If part of design system or future-proofing
- **REMOVE** - If truly obsolete or "dead code"

**Type `any` Usage:**

- **REPLACE** - Use proper types or `unknown`
- Exception: Third-party library types that don't have definitions

---

## Success Criteria

✅ **Minimum Bar for Tester Release:**

1. Zero TypeScript errors ✅
2. Zero critical ESLint errors
3. Production build succeeds ✅
4. All critical user flows tested
5. Mobile responsive on iOS/Android
6. .env.example complete ✅

✅ **Nice to Have:**

1. Zero ESLint warnings
2. Zero console.logs
3. All TODOs addressed
4. Lighthouse score > 90
5. Complete documentation

---

## Commands Reference

```bash
# Check TypeScript
npm run typecheck

# Check ESLint
npm run lint

# Auto-fix ESLint
npm run lint -- --fix

# Production build
npm run build

# Find console.logs
node scripts/dev/remove-console-logs.mjs

# Run comprehensive cleanup
node scripts/deployment/production-cleanup.mjs
```

---

## Notes

- **Philosophy:** Functional > Perfect. Ship working code to testers, iterate based on feedback.
- **Timeline:** One week is achievable with focused effort on critical items.
- **Risk Management:** Production build succeeds, so deployment is low-risk. Focus on polish.
- **Tester Expectations:** Expect some rough edges, focus on core functionality working smoothly.

---

## Current Status: Phase 1 In Progress

**Completed:**

- ✅ Created .env.example
- ✅ Created production cleanup infrastructure
- ✅ Identified all issues with specific counts

**Next Steps:**

1. Fix diagnose/page.tsx (move runDiagnostics above useEffect)
2. Fix WorkoutLive.tsx (refactor useEffect dependencies)
3. Fix WorkoutView.tsx (type error handlers)
4. Run console.log removal script
5. Review and address TODOs

**Estimated Time Remaining:** 6-8 hours of focused work
