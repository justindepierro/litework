# API Client Usage Guide

## Overview

The `ApiClient` class in `src/lib/api-client.ts` provides a centralized, type-safe way to make API requests with consistent error handling, timeout management, and optional toast notifications.

## Key Features

- ✅ **Automatic Timeout Management** - 10-second default (configurable)
- ✅ **Consistent Error Handling** - Standardized error responses
- ✅ **Authentication Integration** - Automatic Supabase auth tokens
- ✅ **Toast Notifications** - Optional error toast callbacks
- ✅ **Development Logging** - Performance tracking in dev mode
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Backwards Compatible** - Legacy methods still work

## Architecture

The API client provides two sets of methods:

### 1. Legacy Methods (Backwards Compatible)

These methods throw errors on failure (original behavior):

```typescript
async getGroups()
async createGroup(groupData)
async getWorkouts()
// ... etc
```

### 2. Enhanced Methods (Recommended for New Code)

These methods return `ApiResponse<T>` with error handling:

```typescript
async getGroupsWithResponse(toastError?)
async createGroupWithResponse(groupData, toastError?)
async getWorkoutsWithResponse(toastError?)
// ... etc
```

### 3. Direct Request Methods

For custom endpoints:

```typescript
// Legacy (throws errors)
async request<T>(endpoint, options)

// Enhanced (returns ApiResponse)
async requestWithResponse<T>(endpoint, options)
```

## Basic Usage

### Import the Client

```typescript
import { apiClient } from "@/lib/api-client";
```

### Legacy Method Pattern (Existing Code)

```typescript
try {
  const groups = await apiClient.getGroups();
  setGroups(groups);
} catch (error) {
  console.error("Failed to load groups:", error);
  toast.error("Failed to load groups");
}
```

### Enhanced Method Pattern (Recommended)

```typescript
import { useToast } from "@/components/ToastProvider";

const { error: toastError } = useToast();

const { data, error, success } =
  await apiClient.getGroupsWithResponse(toastError);

if (!success) {
  console.error("Failed to load groups:", error);
  // Error toast already shown if toastError provided
  return;
}

setGroups(data?.groups || []);
```

## ApiResponse Interface

```typescript
interface ApiResponse<T> {
  data: T | null; // Response data on success
  error: string | null; // Error message on failure
  success: boolean; // true if request succeeded
}
```

## ApiClientOptions

```typescript
interface ApiClientOptions extends RequestInit {
  body?: unknown; // Request body (auto-stringified)
  showErrorToast?: boolean; // Whether to show error toasts
  toastError?: (message: string) => void; // Toast error callback
  customErrorMessage?: string; // Override error message
  timeout?: number; // Request timeout (ms, default 10000)
  skipJsonParse?: boolean; // Skip JSON parsing for blob/text
}
```

## Advanced Usage

### Custom Timeout

```typescript
const { data, error } = await apiClient.requestWithResponse("/api/large-data", {
  timeout: 30000, // 30 seconds for slow endpoints
  toastError,
});
```

### Custom Error Messages

```typescript
const { data, error } = await apiClient.requestWithResponse("/api/workouts", {
  customErrorMessage: "Unable to load your workouts. Please try again.",
  toastError,
});
```

### Without Toast Notifications

```typescript
const { data, error } = await apiClient.requestWithResponse("/api/data", {
  showErrorToast: false, // No toast, handle errors manually
});
```

### POST/PUT/DELETE Requests

```typescript
// Create
const { data, error } = await apiClient.createGroupWithResponse(
  { name: "New Group", athlete_ids: ["123"] },
  toastError
);

// Update
const { data, error } = await apiClient.requestWithResponse(
  "/api/workouts/123",
  {
    method: "PUT",
    body: { name: "Updated Workout" },
    toastError,
  }
);

// Delete
const { success } = await apiClient.requestWithResponse("/api/workouts/123", {
  method: "DELETE",
  toastError,
});
```

## Migration Guide

### Migrating from Direct `fetch()` Calls

**Before:**

```typescript
try {
  const response = await fetch("/api/groups");
  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }
  const data = await response.json();
  setGroups(data.groups);
} catch (error) {
  console.error(error);
  toast.error("Failed to load groups");
} finally {
  setIsLoading(false);
}
```

**After:**

```typescript
const { error: toastError } = useToast();

const { data, error } = await apiClient.getGroupsWithResponse(toastError);
if (error) {
  console.error("Failed to load groups:", error);
  return;
}
setGroups(data?.groups || []);
```

**Lines Saved:** ~6-8 lines per fetch call

### Migrating Legacy API Client Methods

**Before:**

```typescript
try {
  const workouts = await apiClient.getWorkouts();
  setWorkouts(workouts);
} catch (error) {
  toast.error("Failed to load workouts");
}
```

**After:**

```typescript
const { data, error } = await apiClient.getWorkoutsWithResponse(toastError);
if (error) return;
setWorkouts(data || []);
```

## Error Handling

The API client handles several error types:

### 1. Authentication Errors (401)

```typescript
// Automatically returns user-friendly error
{ data: null, error: "Authentication required. Please log in.", success: false }
```

### 2. HTTP Errors (4xx, 5xx)

```typescript
// Parses error from response body
{ data: null, error: "Group not found", success: false }
```

### 3. Network Errors

```typescript
// Detects network issues
{ data: null, error: "Network error. Please check your connection.", success: false }
```

### 4. Timeout Errors

```typescript
// Request took too long
{ data: null, error: "Request timeout. The server took too long to respond.", success: false }
```

### 5. JSON Parse Errors

```typescript
// Invalid JSON response
{ data: null, error: "Invalid server response", success: false }
```

## Development Features

### Performance Logging

In development mode, all requests are logged with timing:

```
[API] GET /api/groups - 200 (142ms)
[API] POST /api/workouts - 201 (289ms)
[API] Error GET /api/missing - 404 (67ms)
```

### Error Details

Full error objects are logged to console in development:

```typescript
console.error("[API] Error GET /api/endpoint:", {
  status: 404,
  statusText: "Not Found",
  error: "Resource not found",
});
```

## Best Practices

### 1. Use Enhanced Methods for New Code

Prefer `*WithResponse()` methods for better error handling:

```typescript
const { data, error } = await apiClient.getGroupsWithResponse(toastError);
```

### 2. Always Check for Errors

Never assume success:

```typescript
const { data, error } = await apiClient.getWorkoutsWithResponse(toastError);
if (error) {
  // Handle error case
  return;
}
// Use data safely
```

### 3. Provide Toast Callbacks

Import and pass `toastError` for automatic error notifications:

```typescript
import { useToast } from "@/components/ToastProvider";

const { error: toastError } = useToast();
await apiClient.requestWithResponse("/api/endpoint", { toastError });
```

### 4. Use Custom Timeouts for Slow Endpoints

Analytics and large data queries may need longer timeouts:

```typescript
const { data } = await apiClient.requestWithResponse("/api/analytics", {
  timeout: 30000, // 30 seconds
  toastError,
});
```

### 5. Set Custom Error Messages for User-Facing Operations

Make errors user-friendly:

```typescript
const { data, error } = await apiClient.createGroupWithResponse(
  groupData,
  toastError
);
if (error) {
  // More specific than generic "Request failed"
  console.error("Failed to create group:", error);
}
```

## Common Patterns

### Loading Data on Component Mount

```typescript
useEffect(() => {
  const loadData = async () => {
    const { data, error } = await apiClient.getGroupsWithResponse(toastError);
    if (error) return;
    setGroups(data?.groups || []);
  };
  loadData();
}, []);
```

### Form Submission

```typescript
const handleSubmit = async () => {
  const { data, error } = await apiClient.createWorkoutWithResponse(
    formData,
    toastError
  );

  if (error) {
    console.error("Failed to create workout:", error);
    return;
  }

  toast.success("Workout created successfully!");
  navigate(`/workouts/${data.id}`);
};
```

### Optimistic Updates

```typescript
// Optimistically update UI
setWorkouts((prev) => [...prev, newWorkout]);

const { error } = await apiClient.createWorkoutWithResponse(
  newWorkout,
  toastError
);

if (error) {
  // Revert optimistic update
  setWorkouts((prev) => prev.filter((w) => w.id !== newWorkout.id));
}
```

## Available Methods

### Groups

- `getGroups()` / `getGroupsWithResponse(toastError?)`
- `createGroup(data)` / `createGroupWithResponse(data, toastError?)`
- `updateGroup(id, data)`
- `deleteGroup(id)`

### Workouts

- `getWorkouts()` / `getWorkoutsWithResponse(toastError?)`
- `createWorkout(data)` / `createWorkoutWithResponse(data, toastError?)`
- `bulkCreateWorkouts(data)`

### Exercises

- `getExercises()`
- `findOrCreateExercise(data)`

### Assignments

- `getAssignments(athleteId?, groupId?)`
- `createAssignment(data)`

### Athletes

- `getAthletes()`

### Users

- `getUsers()`

### KPIs

- `createKPI(data)`
- `updateKPI(id, data)`
- `deleteKPI(id)`

### Invites

- `createAthleteInvite(data)`
- `deleteInvite(id)`
- `updateInvite(id, data)`
- `resendInvite(id)`
- `validateInvite(code)`
- `acceptInvite(code, password)`

### Other

- `deleteAthlete(id)`

## Performance Tips

1. **Batch API Calls**: Use `Promise.all()` for parallel requests:

```typescript
const [groupsResult, workoutsResult] = await Promise.all([
  apiClient.getGroupsWithResponse(toastError),
  apiClient.getWorkoutsWithResponse(toastError),
]);
```

2. **Avoid Redundant Calls**: Cache results when appropriate
3. **Use Optimistic Updates**: Update UI before API response
4. **Set Appropriate Timeouts**: Don't wait longer than necessary

## Troubleshooting

### "Request timeout" Errors

- Increase timeout for slow endpoints
- Check network connectivity
- Verify API endpoint is responding

### "Authentication required" Errors

- User session may have expired
- Redirect to login page
- Check Supabase auth configuration

### Type Errors

- Ensure you're using the correct response type
- Check if endpoint returns expected data structure
- Use TypeScript casting if needed: `data as ExpectedType`

### Toast Not Showing

- Verify `toastError` callback is passed
- Check `showErrorToast` is not set to `false`
- Ensure ToastProvider is wrapping your component tree

## Examples

See these components for real-world usage:

- `src/components/ManageGroupMembersModal.tsx` - Legacy pattern
- `src/components/WorkoutAssignmentDetailModal.tsx` - Legacy pattern
- `src/app/athletes/hooks/useAthleteData.ts` - Mixed legacy pattern

## Migration Checklist

When converting from `fetch()` to `apiClient`:

- [ ] Import `apiClient` from `@/lib/api-client`
- [ ] Import `useToast` and get `toastError` callback
- [ ] Replace `fetch()` with appropriate `apiClient` method
- [ ] Remove manual error handling (response.ok checks, etc.)
- [ ] Update to handle `ApiResponse` pattern
- [ ] Remove redundant try/catch blocks
- [ ] Test error scenarios (network errors, 401, etc.)
- [ ] Verify TypeScript compilation
- [ ] Update any affected tests

## Future Enhancements

Planned improvements:

- Request deduplication (prevent duplicate concurrent requests)
- Response caching with TTL
- Retry logic with exponential backoff
- Request queue for offline support
- Request cancellation support
- GraphQL support

## Questions?

See also:

- `src/lib/api-client.ts` - Implementation
- `ARCHITECTURE.md` - Auth patterns
- `REFACTORING_OPPORTUNITIES_NOV_2025.md` - Migration progress
