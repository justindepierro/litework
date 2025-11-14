# Code Audit Action Items - Quick Reference

**Generated**: November 13, 2025  
**From**: CODE_AUDIT_DUPLICATE_DEPRECATED_NOV_2025.md

## ✅ Completed (Already Done)

- [x] **Comprehensive code audit** - Analyzed auth, database, components, API routes
- [x] **Added deprecation warnings** to `createWorkoutPlan` and `updateWorkoutPlan`
- [x] **Documented findings** in comprehensive audit report

## 🔥 Immediate Actions (This Sprint)

### 1. Update CHANGELOG

**File**: `CHANGELOG.md`  
**Action**: Add deprecation notice

```markdown
## [Unreleased]

### Deprecated

- `createWorkoutPlan()` - Use `createWorkoutPlanTransaction()` instead (will be removed in v1.1.0)
- `updateWorkoutPlan()` - Use `updateWorkoutPlanTransaction()` instead (will be removed in v1.1.0)

These functions do not provide transaction safety and may leave orphaned data on failure.
See deprecation warnings in `src/lib/database-service.ts` for migration instructions.
```

### 2. Document in README

**File**: `README.md` or `docs/guides/MIGRATION_GUIDE.md`  
**Action**: Add to "Known Issues" or "Breaking Changes" section

---

## ⚠️ Short-term Actions (Next Sprint)

### Priority 1: Fix Hardcoded Colors

**Target files** (ordered by priority):

1. **WorkoutLive.tsx** (15 violations)
   - Lines: 309, 314, 327, 336, 363, 369, 383, 420, 423, 424, 430, 448, 485-498
   - Impact: HIGH (user-facing workout sessions)
2. **BulkOperationModal.tsx** (12 violations)
   - Lines: 278, 282, 293, 297, 308, 323, 345, 382, 428, 752, 768, 778, 858-882
   - Impact: MEDIUM (coach workflows)

3. **WorkoutAssignmentDetailModal.tsx** (8 violations)
   - Lines: 522-524, 549
   - Impact: MEDIUM (assignment viewing)

4. **ExerciseLibraryPanel.tsx** (3 violations)
   - Lines: 117-126
   - Impact: LOW (library browsing)

5. **connection-aware.tsx** (2 violations)
   - Line: 369
   - Impact: LOW (connection status indicator)

### Migration Pattern Examples

```typescript
// ❌ BEFORE (hardcoded)
<div className="text-blue-600 bg-blue-50 border-blue-500">
  <CheckCircle className="w-5 h-5 text-green-600" />
</div>

// ✅ AFTER (design tokens)
<div className="text-primary bg-primary-light border-primary">
  <CheckCircle className="w-5 h-5 text-success" />
</div>
```

### Create ESLint Rule

**File**: `eslint.config.mjs`  
**Rule to add**:

```javascript
{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/text-(blue|red|green|yellow|purple|pink|indigo)-[0-9]/]',
        message: 'Use design tokens instead of hardcoded colors (e.g., text-primary, text-success)',
      },
      {
        selector: 'Literal[value=/bg-(blue|red|green|yellow|purple|pink|indigo)-[0-9]/]',
        message: 'Use design tokens instead of hardcoded colors (e.g., bg-primary-light, bg-success)',
      },
    ],
  },
}
```

---

## 📅 Long-term Actions (Next Quarter)

### Refactor Notification Services

**Current state**:

- `notification-service.ts` (552 lines) - push + email + preferences
- `unified-notification-service.ts` (414 lines) - wrapper around above

**Proposed structure**:

```
src/lib/notifications/
├── push-notifications.ts      # Push-specific logic
├── email-notifications.ts     # Email-specific logic
├── preferences.ts             # User preferences
├── subscription.ts            # Push subscription management
├── in-app.ts                  # In-app notifications
└── index.ts                   # Unified API
```

**Benefits**:

- Reduced file sizes (< 200 lines each)
- Clear separation of concerns
- Easier testing and maintenance
- No duplication

### Remove Deprecated Functions

**Version**: v1.1.0  
**Files**: `src/lib/database-service.ts`  
**Functions to remove**:

- `createWorkoutPlan` (line ~943)
- `updateWorkoutPlan` (line ~1123)

**Before removal**:

1. ✅ Verify no external dependencies
2. ✅ Check for any dynamic/string-based calls
3. ✅ Update exports section at bottom of file
4. ✅ Update type exports if needed

---

## 📊 Progress Tracking

| Item                  | Status  | Priority | Effort | Target      |
| --------------------- | ------- | -------- | ------ | ----------- |
| Code audit            | ✅ Done | P0       | 2h     | Nov 13      |
| Deprecation warnings  | ✅ Done | P1       | 15m    | Nov 13      |
| Audit report          | ✅ Done | P1       | 1h     | Nov 13      |
| CHANGELOG update      | ⏳ Todo | P1       | 5m     | This week   |
| WorkoutLive colors    | ⏳ Todo | P2       | 30m    | Next sprint |
| BulkOperation colors  | ⏳ Todo | P2       | 30m    | Next sprint |
| ESLint rule           | ⏳ Todo | P2       | 15m    | Next sprint |
| Notification refactor | ⏳ Todo | P3       | 4h     | Q1 2026     |
| Remove deprecated     | ⏳ Todo | P3       | 30m    | v1.1.0      |

---

## 🎯 Success Metrics

### Current Score: 92% (A-)

**Target for next sprint: 95% (A)**

Improvements needed:

- Fix top 3 component color violations (+2%)
- Add ESLint prevention rule (+1%)

---

## 📚 Related Documentation

- Full audit: `docs/reports/CODE_AUDIT_DUPLICATE_DEPRECATED_NOV_2025.md`
- Component standards: `docs/guides/COMPONENT_USAGE_STANDARDS.md`
- Architecture: `ARCHITECTURE.md`
- Design tokens: `src/styles/tokens.css`

---

_Last updated: November 13, 2025_
