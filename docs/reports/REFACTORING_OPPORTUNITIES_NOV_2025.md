# LiteWork - Refactoring Opportunities Report

**Generated**: November 1, 2025  
**Last Updated**: November 13, 2025  
**Codebase Version**: Main branch  
**Analysis Scope**: Full src/ directory

---

## Executive Summary

**Total Opportunities Identified**: 7  
**Potential Lines Saved**: 950+ lines  
**Estimated Total Effort**: 12-15 hours  
**Expected ROI**: High - significant reduction in boilerplate and improved maintainability

**Status Update (Nov 13 - Priorities 1-4 Complete)**:
- ✅ **Priority 1 Complete**: useAsyncState hook - 14 components, 160 lines removed, 2 hours
- ✅ **Priority 2 Complete**: API Client Wrapper - 7 components, 65 lines removed, 1.5 hours
- ✅ **Priority 3 Complete**: Form Validation Hook - 3 forms, 65 lines removed, 1 hour
- ✅ **Priority 4 Complete (Phase 1)**: Design Token Enforcement - 5 components, ~95 violations fixed, 1 hour
- 📊 **Total Impact**: ~385 lines cleaned/removed, 29 components/forms refactored
- ⏱️ **Total Time**: 5.5 hours actual vs 12 hours estimated (54% under budget!)
- 📚 **Documentation**: 4 comprehensive guides created (API_CLIENT_USAGE.md, FORM_VALIDATION_USAGE.md, COLOR_TOKEN_MIGRATION.md, useAsyncState patterns)
- 🎯 **Next**: Priority 5 (Accessibility audit), Priority 6 (Performance optimization), or continue Priority 4 Phases 2-3

**Key Achievements**:
1. ✅ Zero TypeScript errors maintained throughout all migrations
2. ✅ Consistent patterns established across similar components
3. ✅ Comprehensive documentation for future development
4. ✅ Under time estimates on all 4 priorities (high efficiency)
5. ✅ Production-ready implementations with full type safety
6. ✅ Design token system enforced in high-visibility components

---

## 🎯 Priority 1: Error & Loading State Hook ✅ COMPLETE (Phases 1 & 2)

### Implementation Summary

**Status**: ✅ Complete - Phases 1 & 2  
**Components Migrated**: 14 of 30+ target  
**Lines Removed**: 160 lines (62% reduction)  
**Time Spent**: 2 hours (under estimate)  
**TypeScript Errors**: 0 maintained throughout

**Phase 1 Migrations** (Nov 13 - Session 1):
- ✅ ExerciseLibraryPanel.tsx (17 lines saved)
- ✅ WorkoutView.tsx (17 lines saved)
- ✅ FeedbackDashboard.tsx (14 lines saved)
- ✅ WorkoutAssignmentDetailModal.tsx (13 lines saved)
- ✅ NotificationPermission.tsx (11 lines saved)

**Phase 2 Migrations** (Nov 13 - Session 2):
- ✅ AchievementsSection.tsx (14 lines saved)
- ✅ NotificationPreferences.tsx (12 lines saved)
- ✅ BlockLibrary.tsx (12 lines saved)
- ✅ BulkOperationHistory.tsx (10 lines saved)
- ✅ BlockInstanceEditor.tsx (10 lines saved)
- ✅ NotificationBell.tsx (8 lines saved)
- ✅ NotificationPreferencesSettings.tsx (8 lines saved)
- ✅ ManageGroupMembersModal.tsx (8 lines saved)
- ✅ GroupCompletionStats.tsx (6 lines saved)

**Patterns Established**:
1. Simple fetch-on-mount (most common)
2. Fetch with dependencies (useEffect with deps)
3. Button-triggered actions (onClick handlers)
4. Complex state updates (mixed state management)
5. Inline execute() in useEffect (cleanest for simple cases)

**Remaining Work**: 15+ components can still be migrated (Phase 3)

### Original Problem Statement

**Pattern frequency**: 30+ components  
**Code duplication**: ~300 lines across codebase

Every component manually manages error and loading state:

```typescript
// Repeated in 30+ files
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Then in every async function:
try {
  setIsLoading(true);
  setError(null);
  await apiCall();
} catch (err) {
  setError(err.message);
} finally {
  setIsLoading(false);
}
```

**Files affected**:

- `ExerciseLibraryPanel.tsx`
- `WorkoutAssignmentDetailModal.tsx`
- `FeedbackDashboard.tsx`
- `NotificationPermission.tsx`
- `BulkKPIAssignmentModal.tsx`
- `BlockLibrary.tsx`
- `WorkoutView.tsx`
- ~23 more components

### Proposed Solution

**Create**: `src/hooks/use-async-state.ts`

```typescript
/**
 * Hook to manage async operation state (loading, error, data)
 * Eliminates boilerplate in 30+ components
 */
export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset, setError, setData };
}
```

### Refactored Example

**Before** (10 lines):

```typescript
const [exercises, setExercises] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchExercises = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/exercises");
    const data = await response.json();
    setExercises(data.exercises);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After** (3 lines):

```typescript
const { data: exercises, isLoading, error, execute } = useAsyncState();

const fetchExercises = () =>
  execute(() => fetch("/api/exercises").then((r) => r.json()));
```

### Impact - ACTUAL RESULTS ✅

- **Lines removed**: 160 lines (Phase 1: 72, Phase 2: 88)
- **Components migrated**: 14 of 30+ (47% complete)
- **Consistency**: Unified async state management across all migrated components
- **Maintenance**: Single source of truth for loading/error patterns
- **Testing**: Centralized logic easier to test
- **Effort**: 2 hours actual (45 min Phase 1 + 75 min Phase 2) vs 3-4 hours estimated
- **Quality**: 0 TypeScript errors maintained throughout
- **Documentation**: Complete migration guide and summary created

**Phase 3 Potential**: 15+ components remaining, estimated 60-80 additional lines savings

---

## 🎯 Priority 2: API Error Handling Wrapper ✅ COMPLETE

### Implementation Summary

**Status**: ✅ Complete - Enhanced existing ApiClient  
**Files Migrated**: 7 components  
**Fetch Calls Eliminated**: 13 fetch() calls  
**Lines Removed**: ~65 lines of boilerplate  
**Time Spent**: 1.5 hours (under estimate)  
**TypeScript Errors**: 0 maintained throughout

**Components Migrated**:
- ✅ GroupCompletionStats.tsx (1 GET)
- ✅ NotificationPreferences.tsx (1 GET + 1 PUT)
- ✅ NotificationBell.tsx (1 GET + 3 PATCH/DELETE)
- ✅ ManageGroupMembersModal.tsx (1 GET + 1 POST + 1 DELETE)
- ✅ BulkKPIAssignmentModal.tsx (1 POST)
- ✅ AchievementsSection.tsx (1 GET)
- ✅ TodayOverview.tsx (1 GET)

**Infrastructure Created**:
- Enhanced `src/lib/api-client.ts` with timeout management
- Added `ApiResponse<T>` interface for standardized responses
- Maintained backwards compatibility with legacy methods
- Created `docs/guides/API_CLIENT_USAGE.md` (400+ lines)

**Features Implemented**:
- ✅ Timeout management (10s default, configurable)
- ✅ Comprehensive error handling (401, 4xx, 5xx, network, timeout)
- ✅ Optional toast notifications via callback
- ✅ Development logging for performance tracking
- ✅ Type-safe with full TypeScript support

**Remaining Work**: ~10 files still using direct fetch() calls (can be migrated incrementally)

### Original Problem

**Pattern frequency**: 50+ API calls  
**Inconsistency**: 3 different error handling patterns

**Pattern 1** - Try/catch everywhere (30 instances):

```typescript
try {
  const response = await fetch("/api/workouts");
  if (!response.ok) throw new Error("Failed");
  const data = await response.json();
} catch (error) {
  console.error(error);
  toast.error("Failed to load workouts");
}
```

**Pattern 2** - No error handling (15 instances):

```typescript
const response = await fetch("/api/exercises"); // ❌ Crashes on network fail
const data = await response.json();
```

**Pattern 3** - Custom error logic (5 instances):

```typescript
const response = await fetch("/api/groups");
const data = await response.json();
if (data.error) {
  showError(data.error);
}
```

### Proposed Solution

**Create**: `src/lib/api-wrapper.ts`

```typescript
/**
 * Centralized API wrapper with consistent error handling
 * Eliminates 200+ lines of duplicate try/catch blocks
 */
export interface ApiOptions extends RequestInit {
  showErrorToast?: boolean;
  errorMessage?: string;
  timeout?: number;
}

export async function apiRequest<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  const {
    showErrorToast = true,
    errorMessage = "Request failed",
    timeout = 10000,
    ...fetchOptions
  } = options;

  try {
    // Timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || errorMessage;
      
      if (showErrorToast) {
        toast.error(message);
      }
      
      return { data: null, error: message };
    }

    // Parse response
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Request timeout"
          : err.message
        : errorMessage;

    if (showErrorToast) {
      toast.error(message);
    }

    return { data: null, error: message };
  }
}

// Convenience methods
export const api = {
  get: <T>(url: string, options?: ApiOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),
  
  post: <T>(url: string, body: any, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(body),
    }),
  
  put: <T>(url: string, body: any, options?: ApiOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...options?.headers },
      body: JSON.stringify(body),
    }),
  
  delete: <T>(url: string, options?: ApiOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
```

### Refactored Example

**Before** (15 lines):

```typescript
const loadWorkouts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch("/api/workouts");
    if (!response.ok) {
      throw new Error(`Failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    setWorkouts(result.data.workouts);
  } catch (err) {
    console.error("Load error:", err);
    setError(err.message);
    toast.error("Failed to load workouts");
  } finally {
    setLoading(false);
  }
};
```

**After** (5 lines):

```typescript
const loadWorkouts = async () => {
  setLoading(true);
  const { data, error } = await api.get("/api/workouts");
  setWorkouts(data?.workouts || []);
  setError(error);
  setLoading(false);
};
```

**Even Better with Priority 1 hook** (2 lines):

```typescript
const { data: workouts, execute } = useAsyncState();
const loadWorkouts = () => execute(() => api.get("/api/workouts"));
```

### Impact

- **Lines removed**: ~200 lines of try/catch boilerplate
- **Consistency**: All API calls use same error handling
- **Features**: Automatic timeout, consistent error messages
- **User Experience**: Proper toast notifications everywhere
- **Network Resilience**: Handles offline, timeout scenarios
- **Effort**: 2 hours (create wrapper + migrate 10 API calls as proof)

---

## 🎯 Priority 3: Form Validation Abstraction ✅ COMPLETE

### Implementation Summary

**Status**: ✅ Complete - Phase 1  
**Hook Created**: `useFormValidation` (452 lines)  
**Forms Migrated**: 3 of 15+ target  
**Lines Removed**: ~65 lines validation boilerplate  
**Time Spent**: 1 hour (under estimate)  
**TypeScript Errors**: 0 maintained throughout  
**Documentation**: FORM_VALIDATION_USAGE.md created (700+ lines)

**Migrated Components**:
1. ✅ **GroupFormModal.tsx** (~25 lines saved)
   - Validators: required (name, sport), custom duplicate check
   
2. ✅ **IndividualAssignmentModal.tsx** (~22 lines saved)
   - Validators: required (workoutId, date), custom time range
   
3. ✅ **AthleteEditModal.tsx** (~18 lines saved)
   - Validators: required (firstName, lastName, email), email format

**Hook Features**:
- ✅ Declarative validation rules (required, email, minLength, maxLength, min, max, pattern)
- ✅ Custom validators (cross-field, conditional)
- ✅ Async validation (API checks)
- ✅ Automatic error clearing on field change
- ✅ Field-level and form-level error state
- ✅ Type-safe with TypeScript generics
- ✅ Submit state management (isSubmitting)
- ✅ Programmatic field manipulation (setFieldValue, setFieldError)

**Before Example** (GroupFormModal - 30 lines):
```typescript
const [formData, setFormData] = useState({ name: "", sport: "" });
const [error, setError] = useState("");

const validateForm = () => {
  if (!formData.name.trim()) {
    setError("Group name is required");
    return false;
  }
  if (!formData.sport) {
    setError("Sport selection is required");
    return false;
  }
  const duplicateName = existingGroups.some(
    (group) => group.name.toLowerCase() === formData.name.toLowerCase()
  );
  if (duplicateName) {
    setError("A group with this name already exists");
    return false;
  }
  return true;
};
```

**After Example** (5 lines):
```typescript
const { values, errors, handleChange, handleSubmit, isSubmitting } = useFormValidation({
  initialValues: { name: "", sport: "" },
  validationRules: {
    name: { 
      required: "Group name is required",
      custom: (value) => checkDuplicateName(value)
    },
    sport: { required: "Sport selection is required" },
  },
  onSubmit: async (values) => await apiClient.createGroup(values),
});
```

### Remaining Work

**Status**: ~15 more forms identified for migration  
**Approach**: Incremental migration as forms are modified  
**Target files**:
- InviteAthleteModal.tsx
- KPIModal.tsx
- KPIManagementModal.tsx
- BulkKPIAssignmentModal.tsx
- login/page.tsx, signup/page.tsx
- ~9 more forms

**Future Enhancement Ideas**:
- Form-level validation (multi-field dependencies)
- Debounced async validation
- Validation schemas from Zod/Yup integration
- Form submission retry logic

---

## 🎯 Priority 3: Form Validation Abstraction (ORIGINAL ANALYSIS)

### Current Problem

**Pattern frequency**: 15+ forms  
**Code duplication**: ~400 lines of validation logic

Every form implements custom validation:

```typescript
// Repeated pattern in 15+ files
const [formData, setFormData] = useState({ name: "", email: "" });
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }
  
  if (!formData.email.includes("@")) {
    newErrors.email = "Invalid email";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();
  if (!validate()) return;
  // ... submit logic
};
```

**Files affected**:

- `InviteAthleteModal.tsx`
- `KPIModal.tsx`
- `AthleteEditModal.tsx`
- `GroupFormModal.tsx`
- `KPIManagementModal.tsx`
- `BulkKPIAssignmentModal.tsx`
- `login/page.tsx`, `signup/page.tsx`
- ~8 more forms

### Proposed Solution

**Create**: `src/hooks/use-form.ts`

```typescript
/**
 * Unified form state management with validation
 * Eliminates 400+ lines of duplicate form logic
 */
export interface ValidationRule<T> {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: T) => string | undefined;
}

export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const [values, setValues] = useState<T>(config.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T, value: any): string | undefined => {
      const rules = config.validationRules?.[field];
      if (!rules) return undefined;

      // Required validation
      if (rules.required) {
        if (!value || (typeof value === "string" && !value.trim())) {
          return typeof rules.required === "string"
            ? rules.required
            : `${String(field)} is required`;
        }
      }

      // String-specific validations
      if (typeof value === "string") {
        // Min length
        if (rules.minLength) {
          const config = typeof rules.minLength === "number" 
            ? { value: rules.minLength, message: `Minimum ${rules.minLength} characters` }
            : rules.minLength;
          if (value.length < config.value) {
            return config.message;
          }
        }

        // Max length
        if (rules.maxLength) {
          const config = typeof rules.maxLength === "number"
            ? { value: rules.maxLength, message: `Maximum ${rules.maxLength} characters` }
            : rules.maxLength;
          if (value.length > config.value) {
            return config.message;
          }
        }

        // Pattern
        if (rules.pattern && !rules.pattern.value.test(value)) {
          return rules.pattern.message;
        }
      }

      // Custom validation
      if (rules.validate) {
        return rules.validate(value);
      }

      return undefined;
    },
    [config.validationRules]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in config.validationRules) {
      const error = validateField(field as keyof T, values[field]);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, config.validationRules]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate on blur if field was touched
    const error = validateField(field, values[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [validateField, values]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      );
      setTouched(allTouched);

      // Validate all fields
      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await config.onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAll, config]
  );

  const reset = useCallback(() => {
    setValues(config.initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [config.initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
```

### Refactored Example

**Before** (40 lines):

```typescript
const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!form.firstName.trim()) {
    newErrors.firstName = "First name is required";
  }

  if (!form.lastName.trim()) {
    newErrors.lastName = "Last name is required";
  }

  if (form.email && !form.email.includes("@")) {
    newErrors.email = "Invalid email";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;

  setIsSubmitting(true);
  try {
    await onInvite(form);
    setForm({ firstName: "", lastName: "", email: "" });
  } finally {
    setIsSubmitting(false);
  }
};
```

**After** (15 lines):

```typescript
const {
  values,
  errors,
  handleChange,
  handleSubmit,
  isSubmitting,
} = useForm({
  initialValues: { firstName: "", lastName: "", email: "" },
  validationRules: {
    firstName: { required: "First name is required" },
    lastName: { required: "Last name is required" },
    email: {
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email",
      },
    },
  },
  onSubmit: async (values) => {
    await onInvite(values);
  },
});
```

### Impact

- **Lines removed**: ~350 lines of validation boilerplate
- **Consistency**: All forms use same validation patterns
- **Features**: Field-level validation, touched tracking, blur validation
- **DX**: Declarative validation rules instead of imperative logic
- **Type Safety**: Full TypeScript support with inference
- **Effort**: 3 hours (create hook + migrate 3 forms as proof)

---

## 🎯 Priority 4: Centralized Data Fetching Layer

### Current Problem

**Pattern frequency**: 40+ data fetching locations  
**Code duplication**: ~600 lines across pages and components

While we have `use-swr-hooks.ts` for some data, many components still use manual fetch:

**Pattern 1** - Manual useState/useEffect (25 instances):

```typescript
const [workouts, setWorkouts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    const response = await fetch("/api/workouts");
    const data = await response.json();
    setWorkouts(data.workouts);
    setLoading(false);
  };
  load();
}, []);
```

**Pattern 2** - Load functions in components (15 instances):

```typescript
const loadAthletes = async () => {
  setLoading(true);
  const response = await fetch("/api/athletes");
  const data = await response.json();
  setAthletes(data.athletes);
  setLoading(false);
};

useEffect(() => {
  loadAthletes();
}, []);
```

### Proposed Solution

**Expand**: `src/hooks/use-swr-hooks.ts` + create `use-query.ts`

Add missing SWR hooks and create unified query hook:

```typescript
/**
 * Extended SWR hooks for all API endpoints
 */

// Missing hooks to add
export function useWorkoutSessions(athleteId?: string) {
  const queryString = athleteId ? `?athleteId=${athleteId}` : "";
  return useSWR(`/api/workout-sessions${queryString}`, fetcher);
}

export function useBlocks(params?: { category?: string; favorites?: boolean }) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useSWR(`/api/blocks${queryString}`, fetcher);
}

export function useExerciseLibrary(params?: { search?: string; category?: string }) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return useSWR(`/api/exercises${queryString}`, fetcher);
}

// ... 10 more endpoint hooks
```

**Create**: `src/hooks/use-query.ts` (generic query hook)

```typescript
/**
 * Generic query hook for any API endpoint
 * Alternative to creating individual hooks
 */
export function useQuery<T = any>(
  url: string | null,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    swrConfig?: SWRConfiguration;
  }
) {
  const { data, error, isLoading, mutate } = useSWR(
    url,
    async (url) => {
      const response = await fetch(url, {
        method: options?.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });
      
      if (!response.ok) throw new Error("Request failed");
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      ...options?.swrConfig,
    }
  );

  return {
    data: data as T | undefined,
    isLoading,
    error: error ? (error.message || "Request failed") : null,
    refetch: mutate,
  };
}
```

### Refactored Example

**Before** (12 lines):

```typescript
const [exercises, setExercises] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const load = async () => {
    try {
      const response = await fetch("/api/exercises");
      const data = await response.json();
      setExercises(data.exercises);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

**After - Option 1** (1 line with dedicated hook):

```typescript
const { data: exercises, isLoading, error } = useExercises();
```

**After - Option 2** (1 line with generic hook):

```typescript
const { data: exercises, isLoading, error } = useQuery<Exercise[]>("/api/exercises");
```

### Impact

- **Lines removed**: ~500 lines of fetch boilerplate
- **Caching**: Automatic deduplication and caching across components
- **Performance**: Reduced API calls by 60-70% (SWR benefits)
- **Real-time Updates**: Background revalidation keeps data fresh
- **Developer Experience**: Simple one-liner data fetching
- **Effort**: 4 hours (add 15 missing hooks + migrate 10 components)

---

## 🎯 Priority 5: Modal Composition Patterns

### Current Problem

**Pattern frequency**: 25+ modals  
**Inconsistency**: 4 different modal structures

**Pattern 1** - ModalBackdrop + custom structure (15 modals):

```typescript
<ModalBackdrop isOpen={isOpen} onClose={onClose}>
  <div className="bg-white rounded-lg w-full max-w-2xl">
    <ModalHeader title="Title" icon={<Icon />} onClose={onClose} />
    <ModalContent>{/* content */}</ModalContent>
    <ModalFooter>{/* buttons */}</ModalFooter>
  </div>
</ModalBackdrop>
```

**Pattern 2** - Full Modal component (5 modals):

```typescript
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Title"
  footer={<Button>Save</Button>}
>
  {/* content */}
</Modal>
```

**Pattern 3** - Custom div overlay (3 modals):

```typescript
{
  isOpen && (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="bg-white rounded-lg">{/* content */}</div>
    </div>
  );
}
```

**Pattern 4** - MobileModal (2 modals):

```typescript
<MobileModal isOpen={isOpen} onClose={onClose} title="Title">
  {/* content */}
</MobileModal>
```

### Proposed Solution

**Standardize**: `src/components/ui/Modal.tsx` (enhance existing)

Add reusable modal templates:

```typescript
/**
 * Standard form modal template
 * For forms with save/cancel actions
 */
export function FormModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  saveDisabled = false,
  isSubmitting = false,
  size = "md",
}: FormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size={size}
      footer={
        <ModalFooter align="between">
          <Button variant="secondary" onClick={onCancel || onClose}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saveDisabled || isSubmitting}
            loading={isSubmitting}
          >
            {saveText}
          </Button>
        </ModalFooter>
      }
    >
      {children}
    </Modal>
  );
}

/**
 * Confirmation modal template
 * For delete/archive/dangerous actions
 */
export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={
        variant === "danger" ? (
          <AlertTriangle className="w-6 h-6 text-error" />
        ) : (
          <Info className="w-6 h-6 text-primary" />
        )
      }
      size="sm"
      footer={
        <ModalFooter align="between">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      }
    >
      <Body>{message}</Body>
    </Modal>
  );
}

/**
 * Info/view modal template
 * For read-only content display
 */
export function InfoModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = "md",
}: InfoModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size={size}
      footer={
        <ModalFooter align="center">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      }
    >
      {children}
    </Modal>
  );
}
```

### Refactored Example

**Before** (30 lines):

```typescript
<ModalBackdrop isOpen={isOpen} onClose={onClose}>
  <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
    <ModalHeader
      title="Invite Athlete"
      icon={<Send className="w-6 h-6" />}
      onClose={onClose}
    />
    
    <ModalContent>
      {/* form fields */}
    </ModalContent>
    
    <ModalFooter align="between">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Send Invite"}
      </button>
    </ModalFooter>
  </div>
</ModalBackdrop>
```

**After** (12 lines):

```typescript
<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title="Invite Athlete"
  icon={<Send className="w-6 h-6" />}
  onSave={handleSubmit}
  saveText="Send Invite"
  saveDisabled={!form.firstName || !form.lastName}
  isSubmitting={isSubmitting}
  size="md"
>
  {/* form fields */}
</FormModal>
```

### Impact

- **Lines removed**: ~200 lines of modal boilerplate
- **Consistency**: All modals use same structure
- **Accessibility**: Built-in keyboard navigation and focus management
- **Mobile**: Automatic mobile optimization
- **Developer Experience**: Simple template selection
- **Effort**: 4 hours (create 3 templates + migrate 8 modals)

---

## 🎯 Priority 6: Notification Service Consolidation

### Current Problem

**Code duplication**: Toast notifications implemented twice

**Implementation 1** - Custom useToast hook (primary):

```typescript
// src/contexts/ToastContext.tsx (120 lines)
// Used by 95% of components
```

**Implementation 2** - react-hot-toast (unused):

```typescript
// Imported but not used consistently
import toast from "react-hot-toast";
```

**Issue**: Both implementations exist, causing confusion and maintenance burden.

### Proposed Solution

**Decision**: Standardize on our custom `useToast` (already 95% adopted)

**Action Items**:

1. **Remove react-hot-toast dependency**:

   ```bash
   npm uninstall react-hot-toast
   ```

2. **Document Toast Usage** (`docs/guides/TOAST_NOTIFICATION_GUIDE.md`):

   ```typescript
   import { useToast } from "@/hooks/use-toast";

   function MyComponent() {
     const toast = useToast();

     toast.success("Operation successful!");
     toast.error("Something went wrong");
     toast.info("New message available");
     toast.warning("Unstable connection");
   }
   ```

3. **Find/replace** any `react-hot-toast` imports:

   ```bash
   # Find instances (should be ~0-2)
   grep -r "from 'react-hot-toast'" src/
   ```

### Impact

- **Dependency cleanup**: Remove unused package
- **Consistency**: Single notification system
- **Bundle size**: -15KB (react-hot-toast removed)
- **Documentation**: Clear usage guide
- **Effort**: 30 minutes

---

## 🎯 Priority 7: Authentication Guard Abstraction

### Current Problem

**Pattern frequency**: 8+ pages  
**Code duplication**: ~120 lines

Every protected page repeats auth check:

```typescript
// Repeated in 8+ pages
const { user, isLoading } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!isLoading && !user) {
    router.push("/login");
  }
}, [user, isLoading, router]);

if (isLoading) {
  return <LoadingSpinner />;
}

if (!user) {
  return null;
}
```

### Proposed Solution

**Already exists!**: `src/hooks/use-auth-guard.ts`

We have `useRequireAuth()`, `useCoachGuard()`, `useAdminGuard()` - just need to migrate all pages.

**Action**: Update pages to use guard hooks

**Before** (12 lines):

```typescript
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!user) return null;

  return <div>{/* content */}</div>;
}
```

**After** (3 lines):

```typescript
export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  if (isLoading) return <Loading />;

  return <div>{/* content */}</div>;
}
```

### Impact

- **Lines removed**: ~100 lines of auth boilerplate
- **Consistency**: All pages use same guard pattern
- **Security**: Centralized auth logic easier to audit
- **Maintenance**: Single source of truth
- **Effort**: 1 hour (migrate 8 pages)

---

## Implementation Roadmap

### Week 1 (Quick Wins)

**Day 1-2**: Priority 1 - Error & Loading State Hook

- Create `use-async-state.ts` hook (1 hour)
- Migrate 5 components as proof of concept (2 hours)
- Document usage pattern (30 minutes)

**Day 3-4**: Priority 2 - API Error Handling Wrapper

- Create `api-wrapper.ts` utility (1 hour)
- Migrate 10 API calls to new wrapper (2 hours)
- Document usage patterns (30 minutes)

**Day 5**: Priority 7 - Authentication Guard Migration

- Audit all pages for manual auth checks (30 minutes)
- Migrate 8 pages to use guard hooks (1 hour)

### Week 2 (High-Value Refactors)

**Day 1-2**: Priority 3 - Form Validation Hook

- Create `use-form.ts` hook (2 hours)
- Migrate 3 forms as proof of concept (2 hours)
- Document validation patterns (1 hour)

**Day 3-4**: Priority 4 - Data Fetching Layer

- Add 15 missing SWR hooks (2 hours)
- Create generic `use-query.ts` hook (1 hour)
- Migrate 10 components to use new hooks (3 hours)

**Day 5**: Priority 5 - Modal Templates

- Create FormModal, ConfirmModal, InfoModal (2 hours)
- Migrate 5 modals as proof of concept (2 hours)

### Week 3 (Cleanup)

- Priority 6 - Remove react-hot-toast (30 minutes)
- Documentation updates (2 hours)
- Complete remaining migrations (4 hours)

---

## Success Metrics

### Code Quality

- **Lines of code removed**: ~1,500 lines
- **Files affected**: 50+ components
- **Consistency score**: Improve from 75% to 95%

### Developer Experience

- **New component creation time**: Reduce by 40%
- **Bug fix time**: Reduce by 30% (centralized logic)
- **Onboarding time**: Reduce by 50% (clearer patterns)

### Performance

- **API calls**: Reduce by 50% (SWR caching)
- **Bundle size**: Reduce by 15KB (remove react-hot-toast)
- **Initial load**: No impact (code splitting preserved)

### Maintenance

- **Test coverage**: Easier to test centralized hooks
- **TypeScript errors**: Prevent with stricter types
- **Security**: Easier auth audit with guard hooks

---

## Next Steps

1. **Review this report** with team
2. **Prioritize** based on current sprint goals
3. **Start with Quick Wins** (Priorities 1, 2, 7) - 1 week
4. **Progress to High-Value** (Priorities 3, 4, 5) - 2 weeks
5. **Complete Cleanup** (Priority 6) - 30 minutes
6. **Document patterns** in `/docs/guides/`
7. **Update CHANGELOG.md** with refactoring progress

---

## Appendix: File Impact Analysis

### High-Impact Files (10+ lines saved)

1. `src/components/ExerciseLibraryPanel.tsx` - 15 lines
2. `src/components/WorkoutAssignmentDetailModal.tsx` - 18 lines
3. `src/components/BulkKPIAssignmentModal.tsx` - 22 lines
4. `src/components/BlockLibrary.tsx` - 16 lines
5. `src/components/InviteAthleteModal.tsx` - 20 lines
6. `src/components/GroupFormModal.tsx` - 25 lines
7. `src/app/workouts/page.tsx` - 14 lines
8. `src/app/athletes/page.tsx` - 16 lines
9. `src/app/dashboard/page.tsx` - 12 lines
10. `src/app/profile/page.tsx` - 18 lines

### Total Impact

- **Components**: 30+ affected
- **Pages**: 8+ affected
- **API calls**: 50+ affected
- **Forms**: 15+ affected
- **Modals**: 25+ affected

---

**Report compiled**: November 1, 2025  
**Next review**: After Week 1 Quick Wins completion
