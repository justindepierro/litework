# useAsyncState Hook - Usage Guide

**Created**: November 13, 2025  
**Hook Location**: `src/hooks/use-async-state.ts`  
**Purpose**: Eliminate 270+ lines of boilerplate async state management code

## Overview

The `useAsyncState` hook provides a consistent pattern for managing loading states, errors, and data from async operations. It eliminates the need for manual `useState` declarations and try/catch blocks in every component.

---

## Basic Usage

### Before (Manual State Management)

```typescript
const [data, setData] = useState<Exercise[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/exercises");
    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Lines of code**: 17 lines

### After (useAsyncState Hook)

```typescript
import { useAsyncState } from "@/hooks/use-async-state";

const { data, isLoading, error, execute } = useAsyncState<Exercise[]>();

const fetchData = () => execute(async () => {
  const response = await fetch("/api/exercises");
  return response.json();
});
```

**Lines of code**: 6 lines  
**Savings**: 11 lines (65% reduction)

---

## API Reference

### Return Values

```typescript
interface UseAsyncStateReturn<T> {
  data: T | null;              // The data from async operation
  isLoading: boolean;          // Loading state
  error: string | null;        // Error message if failed
  execute: (fn) => Promise<T>; // Execute async operation
  reset: () => void;           // Reset to initial state
  setError: (err) => void;     // Manually set error
  setData: (data) => void;     // Manually set data
  setIsLoading: (bool) => void; // Manually set loading
}
```

---

## Common Patterns

### Pattern 1: Fetch on Mount

```typescript
const { data: exercises, isLoading, error, execute } = useAsyncState<Exercise[]>();

useEffect(() => {
  execute(async () => {
    const response = await fetch("/api/exercises");
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  });
}, []);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (!exercises) return null;

return <ExerciseList exercises={exercises} />;
```

### Pattern 2: Fetch with Dependencies

```typescript
const { data: workout, isLoading, error, execute } = useAsyncState<Workout>();

useEffect(() => {
  if (!workoutId) return;
  
  execute(async () => {
    const response = await fetch(`/api/workouts/${workoutId}`);
    return response.json();
  });
}, [workoutId, execute]);
```

### Pattern 3: Search with Debounce

```typescript
const { data: results, isLoading, execute, setData, setError } = useAsyncState<SearchResult[]>();
const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  // Clear results for short queries
  if (searchQuery.length < 2) {
    setData([]);
    setError(null);
    return;
  }

  // Debounce search
  const debounce = setTimeout(() => {
    execute(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    });
  }, 300);

  return () => clearTimeout(debounce);
}, [searchQuery, execute, setData, setError]);
```

### Pattern 4: Form Submission

```typescript
const { isLoading, error, execute } = useAsyncState<SubmitResponse>();

const handleSubmit = async (formData: FormData) => {
  const result = await execute(async () => {
    const response = await fetch("/api/submit", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) throw new Error("Submission failed");
    return response.json();
  });

  if (result) {
    toast.success("Submitted successfully!");
    onClose();
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* form fields */}
    <Button type="submit" loading={isLoading} disabled={isLoading}>
      Submit
    </Button>
    {error && <ErrorMessage message={error} />}
  </form>
);
```

### Pattern 5: Manual State Control

```typescript
const { 
  data, 
  isLoading, 
  error, 
  execute,
  setData,
  setError,
  reset 
} = useAsyncState<User>();

// Manual data update
const handleOptimisticUpdate = (updatedUser: User) => {
  setData(updatedUser);
};

// Manual error handling
const handleRetry = () => {
  setError(null);
  execute(fetchUser);
};

// Reset to initial state
const handleCancel = () => {
  reset();
  onClose();
};
```

---

## Migration Checklist

When migrating a component to use `useAsyncState`:

1. **Import the hook**:
   ```typescript
   import { useAsyncState } from "@/hooks/use-async-state";
   ```

2. **Replace useState declarations**:
   ```typescript
   // ❌ Remove these
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   // ✅ Replace with this
   const { data, isLoading, error, execute, setData, setError } = useAsyncState<DataType>();
   ```

3. **Update async functions**:
   ```typescript
   // ❌ Old way
   const fetchData = async () => {
     try {
       setLoading(true);
       setError(null);
       const result = await apiCall();
       setData(result);
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };

   // ✅ New way
   const fetchData = () => execute(async () => {
     return await apiCall();
   });
   ```

4. **Update variable references**:
   - `loading` → `isLoading`
   - Keep `data`, `error` the same

5. **Add null checks** (since data starts as null):
   ```typescript
   // ❌ Before (data defaults to [])
   {data.map(item => ...)}

   // ✅ After (data can be null)
   {data?.map(item => ...)}
   // or
   {(data || []).map(item => ...)}
   ```

6. **Test thoroughly**:
   - Loading states display correctly
   - Errors show user-friendly messages
   - Data renders when loaded
   - No TypeScript errors

---

## Completed Migrations

### ✅ ExerciseLibraryPanel.tsx

**Before**: 17 lines of state management  
**After**: 6 lines with `useAsyncState`  
**Savings**: 11 lines (65% reduction)

**Changes**:
- Replaced 3 `useState` declarations with single hook
- Simplified `fetchExercises` function
- Added null-safe array access (`exercises?.map`)

**File**: `src/components/ExerciseLibraryPanel.tsx`  
**Commit**: [Add commit hash after migration]

---

## Planned Migrations

### High Priority (10+ lines saved each)

1. **WorkoutAssignmentDetailModal.tsx** - 18 lines saved
2. **BlockLibrary.tsx** - 16 lines saved  
3. **FeedbackDashboard.tsx** - 15 lines saved
4. **WorkoutView.tsx** - 14 lines saved
5. **NotificationPermission.tsx** - 12 lines saved

### Medium Priority (5-10 lines saved)

6. **AchievementsSection.tsx** - 8 lines saved
7. **NotificationPreferences.tsx** - 8 lines saved
8. **WorkoutFeedbackModal.tsx** - 7 lines saved
9. **BlockEditor.tsx** - 7 lines saved
10. **ExerciseLibrary.tsx** - 7 lines saved

### Estimated Total Impact

- **Components to migrate**: 30+
- **Lines removed**: ~270 lines
- **Consistency**: 100% (all use same pattern)
- **Maintenance**: Single source of truth

---

## Best Practices

### ✅ DO

- **Use TypeScript generics**: `useAsyncState<Exercise[]>()`
- **Handle null data**: Use `data?.map()` or `(data || []).map()`
- **Wrap in execute()**: Let the hook manage loading/error states
- **Keep async logic simple**: Focus on the API call, not state management
- **Add appropriate dependencies**: Include `execute`, `setData`, `setError` in useEffect deps

### ❌ DON'T

- **Don't mix patterns**: Use either `useAsyncState` OR manual state, not both
- **Don't nest execute() calls**: Each operation should have its own execute
- **Don't forget null checks**: Data starts as null, not empty array
- **Don't manually manage loading**: Let execute() handle it
- **Don't swallow errors**: Let execute() catch and set error state

---

## Troubleshooting

### Issue: "data is possibly null"

**Solution**: Add null check or default value
```typescript
// Option 1: Optional chaining
{data?.map(item => ...)}

// Option 2: Default value
{(data || []).map(item => ...)}

// Option 3: Early return
if (!data) return <Loading />;
return <List items={data} />;
```

### Issue: "execute is not a function"

**Solution**: Ensure `execute` is in useEffect dependency array
```typescript
useEffect(() => {
  execute(fetchData);
}, [execute]); // ✅ Include execute
```

### Issue: "Too many re-renders"

**Solution**: Don't call execute() directly in render
```typescript
// ❌ Wrong - infinite loop
execute(fetchData);

// ✅ Correct - in useEffect or event handler
useEffect(() => {
  execute(fetchData);
}, []);
```

### Issue: "Data not updating after mutation"

**Solution**: Use `setData` for optimistic updates or refetch
```typescript
// Option 1: Refetch
await execute(fetchData);

// Option 2: Optimistic update
setData(updatedData);
```

---

## Performance Considerations

### Memoization

The `execute` function is memoized with `useCallback`, so it's safe to use in dependency arrays:

```typescript
useEffect(() => {
  execute(fetchData);
}, [param, execute]); // ✅ execute won't cause re-renders
```

### Avoiding Unnecessary Fetches

Use manual controls to prevent redundant API calls:

```typescript
const { data, execute, setData, setError } = useAsyncState();

// Clear data without fetching
const handleClear = () => {
  setData(null);
  setError(null);
};

// Only fetch if needed
useEffect(() => {
  if (data) return; // Skip if already loaded
  execute(fetchData);
}, [data, execute]);
```

---

## Next Steps

1. **Complete Priority 1 migrations** (5 components)
2. **Measure impact**: Track lines saved and consistency improvements
3. **Update this guide**: Add examples from real migrations
4. **Create API wrapper** (Priority 2 from refactoring report)
5. **Document combined patterns**: `useAsyncState` + API wrapper

---

## Related Documentation

- **Hook Source**: `src/hooks/use-async-state.ts`
- **Refactoring Report**: `docs/reports/REFACTORING_OPPORTUNITIES_NOV_2025.md`
- **TypeScript Types**: All types defined in hook file
- **Examples**: See migrated components for real-world usage

---

**Last Updated**: November 13, 2025  
**Status**: ✅ Hook created, 1 component migrated, 29+ to go  
**Next**: Migrate WorkoutAssignmentDetailModal.tsx
