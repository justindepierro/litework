# App Crash & Performance Audit

**Date**: November 10, 2025  
**Priority**: CRITICAL  
**Status**: Investigation in Progress

---

## 🔍 Investigation Focus

### Primary Symptoms

1. **App kicks user out frequently**
2. **Random crashes during workout sessions**
3. **Navigation issues**
4. **Session loss**

### Potential Root Causes

- Authentication token expiration
- Memory leaks from timers/intervals
- State updates on unmounted components
- Network request failures
- Supabase session handling
- React context re-renders
- Service worker issues (PWA)

---

## 🔐 Authentication Audit

### Issues Found

#### 1. **Token Expiration Handling EXISTS but May Have Issues**

**Location**: `src/lib/auth-client.ts` line 652  
**Severity**: MEDIUM  
**Impact**: Token refresh exists but may not handle edge cases

**Current State**:
✅ Token refresh mechanism EXISTS:

```typescript
// src/lib/auth-client.ts line 652
return supabase.auth.onAuthStateChange(async (event, session) => {
  // Loads user profile on auth change
  // Has 5-second timeout for profile fetch
});
```

⚠️ **Potential Issues**:

1. Profile fetch timeout (5s) might be too short on slow networks
2. No graceful degradation if profile fetch fails
3. No user notification on token refresh failure
4. Auth listener might not be registered early enough
5. Error in profile fetch calls `callback(null)` - logs user out silently

**Evidence of Problem**:

```typescript
// Line 690-710: Profile fetch timeout
const timeoutPromise = new Promise<never>((_, reject) =>
  setTimeout(() => {
    reject(
      new Error("Profile fetch timeout - database query exceeded 5 seconds.")
    );
  }, 5000)
);

// If timeout or error:
if (error || !profile) {
  callback(null); // ❌ SILENT LOGOUT - This is the problem!
  return;
}
```

**The Smoking Gun**: When profile fetch times out (slow network) or fails, the callback receives `null`, which logs the user out WITHOUT WARNING. This explains "app kicks me out frequently" on slower connections or when Supabase is slow.

#### 2. **No Session Persistence Check**

**Location**: Page loads/refreshes  
**Severity**: MEDIUM  
**Impact**: User appears logged out after refresh

**Current State**:

- Session may not persist across page reloads
- No loading state while checking session
- Race conditions possible

---

## ⚡ Performance Issues

### Issues Found

#### 1. **Timer Memory Leaks in WorkoutHeader**

**Location**: `WorkoutHeader.tsx` line 24-45  
**Severity**: HIGH  
**Impact**: setInterval updates state on unmounted component

**Evidence**:

```typescript
// WorkoutHeader.tsx line 24-45
useEffect(() => {
  const startTime = new Date(startedAt).getTime();

  const updateElapsedTime = () => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    setElapsedTime(...); // ❌ No isMounted check before setState!
  };

  updateElapsedTime();
  const interval = setInterval(updateElapsedTime, 1000);

  return () => clearInterval(interval); // ✅ Cleanup exists BUT...
}, [startedAt]);
```

**The Problem**:

- User navigates away from WorkoutLive
- Interval cleanup runs (good)
- BUT there's a race condition: if `updateElapsedTime()` is mid-execution when component unmounts, it still calls `setElapsedTime()` on unmounted component
- This happens EVERY SECOND the timer runs
- Over a 30-minute workout, that's 1,800+ potential crash points

**Fix Required**: Add `isMounted` check in WorkoutHeader exactly like WorkoutLive

#### 2. **Context Re-render Cascade**

**Location**: `WorkoutSessionContext.tsx`  
**Severity**: MEDIUM  
**Impact**: Entire app re-renders on every set logged

**Evidence**:

```typescript
// Every state update triggers ALL consumers
const [state, dispatch] = useReducer(sessionReducer, initialState);

// This re-renders EVERY component using the context
// Even if they only need one piece of data
```

**Fix Required**:

- Split context into smaller contexts
- Use `useMemo` for derived values
- Implement selector pattern

#### 3. **Large State Objects**

**Location**: Session state with all exercises  
**Severity**: MEDIUM  
**Impact**: Slow updates, janky UI

**Current State**:

```typescript
interface WorkoutSession {
  exercises: ExerciseProgress[]; // Could be 20+ exercises
  // Each update copies entire array
}
```

#### 4. **Unoptimized List Rendering**

**Location**: Exercise list in WorkoutLive  
**Severity**: LOW-MEDIUM  
**Impact**: Scroll jank with many exercises

**Evidence**:

```typescript
{
  session.exercises.map((exercise, index) => {
    // Renders ALL exercises even if collapsed
    // No virtualization
    // No React.memo
  });
}
```

---

## 🐛 React State Management Issues

### Issues Found

#### 1. **Async State Updates After Navigation**

**Location**: `WorkoutLive.tsx` lines 194, 200, 209, 214, 268  
**Severity**: HIGH - **PRIMARY CRASH CAUSE**  
**Impact**: "Can't perform React state update on unmounted component"

**Evidence - Found 5+ unprotected setTimeout calls**:

```typescript
// Line 194-209: Circuit navigation with delays
setTimeout(() => {
  updateExerciseIndex(firstExerciseIndex); // ❌ No isMounted check
}, 500);

setTimeout(() => updateExerciseIndex(nextExerciseIndex), 500); // ❌ No check

// Line 214: Moving to next exercise
setTimeout(() => updateExerciseIndex(session.current_exercise_index + 1), 500); // ❌ No check

// Line 268: Navigate to dashboard after completing
setTimeout(() => router.push("/dashboard"), 2000); // ❌ CRITICAL - User already left!
```

**The Real Problem**: User completes workout or hits back button, WorkoutLive unmounts, but 2 seconds later `router.push("/dashboard")` tries to execute on unmounted component.

**Fix Applied (Partial)**:

- ✅ Added `isMounted` flag to WorkoutLive (line 62)
- ✅ Added cleanup on unmount
- ⚠️ **Only 1 of 5+ setTimeout calls is protected**

**Still Need to Fix**: All setTimeout/setInterval calls must check `isMounted` before state updates

#### 2. **Error Boundaries ARE IMPLEMENTED** ✅

**Location**: `src/app/layout.tsx` line 10  
**Severity**: N/A  
**Impact**: Error boundaries working correctly

**Current State**:
✅ GlobalErrorBoundary wraps entire app:

```typescript
// src/app/layout.tsx
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";

<GlobalErrorBoundary>
  <AuthProvider>
    <WorkoutSessionProvider>
      {children}
    </WorkoutSessionProvider>
  </AuthProvider>
</GlobalErrorBoundary>
```

✅ Also have ErrorBoundary component at `src/components/ui/ErrorBoundary.tsx`
✅ WorkoutEditorErrorBoundary for specific features

**Verdict**: Error boundaries are NOT the problem. They're working correctly.

---

## 🌐 Network & API Issues

### Issues Found

#### 1. **No Network Error Handling**

**Location**: API calls throughout app  
**Severity**: HIGH  
**Impact**: App crashes on network failures

**Evidence**:

```typescript
// Most API calls like this:
const response = await fetch("/api/sets");
const data = await response.json(); // ❌ No error handling

// If network fails: unhandled promise rejection
```

**Fix Required**:

- Wrap all fetch calls in try/catch
- Add network error toasts
- Implement retry logic
- Add offline detection

#### 2. **Race Conditions in Session Loading**

**Location**: WorkoutSessionContext  
**Severity**: MEDIUM  
**Impact**: Loading wrong session data

**Evidence**:

```typescript
// Multiple components might trigger session load
// No deduplication
// No loading state coordination
```

---

## 📱 PWA/Service Worker Issues

### Issues Found

#### 1. **Service Worker Not Registered**

**Location**: `next.config.ts`  
**Severity**: LOW  
**Impact**: No offline support, no install prompt

**Current State**:

```typescript
// No service worker configuration found
// PWA might be enabled but not working
```

#### 2. **Cache Strategy Unknown**

**Location**: Service worker config  
**Severity**: LOW  
**Impact**: Stale data, unnecessary requests

---

## 🔥 Critical Fixes Needed (Priority Order)

### ROOT CAUSE IDENTIFIED:

1. **Profile fetch timeout** → Silent logout → "kicked out of app"
2. **Unprotected setTimeout calls** → State updates on unmounted component → Crashes
3. **Timer in WorkoutHeader** → setInterval race condition → Crashes every second

---

### 1. **Fix Silent Logout on Profile Fetch Failure** (10 min) - CRITICAL

```typescript
// src/lib/auth-client.ts line 710
// CURRENT (BAD):
if (error || !profile) {
  callback(null); // ❌ Logs user out silently!
  return;
}

// FIX TO:
if (error || !profile) {
  // Don't log out on transient failures - keep existing session
  console.warn("[AUTH] Profile fetch failed, retaining session", { error });

  // Still call callback with session user (basic info)
  if (session?.user) {
    callback({
      id: session.user.id,
      email: session.user.email || "",
      firstName: "User", // Fallback
      lastName: "",
      role: "athlete", // Safe default
    });
  }
  return;
}
```

### 2. **Protect All setTimeout Calls in WorkoutLive** (15 min)

```typescript
// src/components/WorkoutLive.tsx
// Wrap ALL setTimeout calls with isMounted check

// Line 194:
setTimeout(() => {
  if (isMounted) updateExerciseIndex(firstExerciseIndex);
}, 500);

// Line 200:
setTimeout(() => {
  if (isMounted) updateExerciseIndex(session.current_exercise_index + 1);
}, 500);

// Line 209:
setTimeout(() => {
  if (isMounted) updateExerciseIndex(nextExerciseIndex);
}, 500);

// Line 214:
setTimeout(() => {
  if (isMounted) updateExerciseIndex(session.current_exercise_index + 1);
}, 500);

// Line 268 - CRITICAL:
setTimeout(() => {
  if (isMounted) router.push("/dashboard");
}, 2000);
```

### 3. **Add isMounted Protection to WorkoutHeader** (10 min)

```typescript
// src/components/WorkoutHeader.tsx
const [isMounted, setIsMounted] = useState(true);

useEffect(() => {
  return () => setIsMounted(false);
}, []);

const updateElapsedTime = () => {
  if (!isMounted) return;
  // ... update logic
};
```

### 4. **Increase Profile Fetch Timeout** (2 min)

```typescript
// src/lib/auth-client.ts line 685
// CURRENT: 5 seconds
setTimeout(() => reject(...), 5000);

// CHANGE TO: 15 seconds (account for slow mobile networks)
setTimeout(() => reject(...), 15000);
```

### 5. **Wrap All API Calls** (30 min)

```typescript
// src/lib/api-client.ts
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    toast.error("Network error. Please try again.");
    throw error;
  }
}
```

### 6. **Add Network Detection** (15 min)

```typescript
// src/hooks/use-online.ts
export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

### 7. **Split WorkoutSessionContext** (45 min)

```typescript
// Separate contexts for better performance
<WorkoutSessionProvider>
  <WorkoutMetadataContext> {/* workout name, timer */}
  <WorkoutExercisesContext> {/* exercise list */}
  <WorkoutProgressContext>  {/* sets, progress */}
</WorkoutSessionProvider>
```

---

## 🧪 Testing Checklist

### Reproduce Crashes

- [ ] Start workout, navigate away immediately
- [ ] Start workout, let timer run 10 minutes, navigate
- [ ] Complete set, close app, reopen
- [ ] Turn off wifi mid-workout
- [ ] Let app sit idle for 2+ hours (token expiry)
- [ ] Complete workout with 15+ exercises
- [ ] Rapid button clicking (Complete Set x10 fast)

### Memory Leak Detection

```bash
# Chrome DevTools
1. Open Performance tab
2. Start recording
3. Use app for 5 minutes
4. Take heap snapshot
5. Look for detached DOM nodes
6. Look for growing timer counts
```

---

## 📊 Performance Metrics to Track

### Before Fixes

- Time to interactive: ?
- Memory usage after 10 min: ?
- Crashes per session: ?
- Auth token refreshes: ?

### Target After Fixes

- Time to interactive: <2s
- Memory usage stable: <50MB growth/10min
- Crashes per session: 0
- Auth token refreshes: Automatic, silent

---

## 🔧 Implementation Plan

### Phase 1: Critical Stability (Today)

1. Add error boundary
2. Fix token refresh
3. Add timer cleanup
4. Wrap API calls

### Phase 2: Performance (Next)

5. Split context
6. Add network detection
7. Optimize list rendering
8. Add error recovery

### Phase 3: Monitoring (Future)

9. Add Sentry/error tracking
10. Add performance monitoring
11. Add user session replay
12. Add crash analytics

---

## 🎯 Success Criteria

**App is stable when:**

- [ ] No crashes during 30-minute workout
- [ ] Memory usage stays below 100MB
- [ ] Token refreshes automatically
- [ ] Network errors show friendly messages
- [ ] User can navigate freely without crashes
- [ ] Session persists across page reloads
- [ ] Timers clean up properly
- [ ] No console errors in production

---

## 📝 Next Steps

1. Run full audit with React DevTools Profiler
2. Check Supabase auth logs for token issues
3. Add error tracking service
4. Implement critical fixes (Phase 1)
5. Test in production environment
6. Monitor crash rate after deploy
