# API Endpoint Audit - Missing Routes

## Missing Endpoints (Need to Create)

### 1. `/api/invites/validate/[code]` ❌
**Used by:** `apiClient.validateInvite()`
**Purpose:** Validate invitation code before accepting
**Status:** MISSING

### 2. `/api/invites/accept` ❌
**Used by:** `apiClient.acceptInvite()`
**Purpose:** Accept invitation and create athlete account
**Status:** MISSING

### 3. `/api/logs` ❌
**Used by:** `src/lib/logger.ts`
**Purpose:** Log errors/warnings to server
**Status:** MISSING (Optional - for production error logging)

### 4. `/api/auth/login` GET ❌
**Used by:** `apiClient.getDemoCredentials()` in login page
**Purpose:** Demo credentials for testing
**Status:** MISSING (Not needed for production)

## Existing Endpoints ✅

- `/api/invites` POST/GET ✅ (Just created)
- `/api/groups` POST/GET ✅
- `/api/groups/[id]` PUT/DELETE ✅
- `/api/workouts` POST/GET ✅
- `/api/exercises` GET ✅
- `/api/assignments` POST/GET ✅
- `/api/users` POST/GET ✅
- `/api/users/[id]` DELETE ✅
- `/api/kpis` POST ✅
- `/api/kpis/[id]` PUT/DELETE ✅
- `/api/health` HEAD/GET ✅
- `/api/analytics` POST ✅
- `/api/analytics/web-vitals` POST ✅
- `/api/analytics/custom-metrics` POST ✅
- `/api/bulk-operations` POST/GET ✅
- `/api/messages` POST ✅
- `/api/auth/login` POST ✅
- `/api/auth/debug` GET ✅

## Priority Fixes

### HIGH PRIORITY (Needed for core functionality):
1. Create `/api/invites/validate/[code]`
2. Create `/api/invites/accept`

### LOW PRIORITY (Nice to have):
1. Create `/api/logs` for error logging
2. Add GET to `/api/auth/login` for demo credentials (or remove from UI)

## Action Plan

1. Create missing invite endpoints ✅ (Doing now)
2. Test invitation flow end-to-end
3. Optional: Create logs endpoint for production monitoring
