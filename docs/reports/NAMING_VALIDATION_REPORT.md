
# Naming Convention Validation Report
**Generated**: 2025-11-10T13:02:45.119Z

## Summary
- Database field issues: 0
- TypeScript snake_case leaks: 0
- File naming issues: 6
- Database transformation issues: 6
- **Total Issues**: 12

## Naming Convention Standards

### Database (PostgreSQL)
- **Pattern**: snake_case
- **Example**: `user_id`, `created_at`, `workout_plan`
- **Why**: PostgreSQL convention, case-insensitive by default

### TypeScript/JavaScript
- **Variables/Functions**: camelCase
- **Example**: `userId`, `createdAt`, `workoutPlan`
- **Components**: PascalCase
- **Example**: `WorkoutEditor`, `UserProfile`
- **Constants**: SCREAMING_SNAKE_CASE
- **Example**: `MAX_EXERCISES`, `API_URL`

### Files
- **Components**: PascalCase.tsx
- **Example**: `WorkoutEditor.tsx`, `UserProfile.tsx`
- **Utilities**: kebab-case.ts
- **Example**: `api-client.ts`, `auth-utils.ts`

## Database Transformation Layer

We have utilities to handle snake_case ↔ camelCase conversion:
- `src/lib/case-transform.ts` - Conversion functions
- `src/lib/database-service.ts` - Automatic transformations
- `src/lib/db-validation.ts` - Validation

**Usage in API routes**:
```typescript
import { transformFromDatabase, transformToDatabase } from '@/lib/case-transform';

// After database query
const data = await supabase.from('workout_plans').select('*');
const transformed = data.data?.map(transformFromDatabase);

// Before database insert/update
const dbData = transformToDatabase(frontendData);
await supabase.from('workout_plans').insert(dbData);
```

## Issues Found

### Database Field Names
✓ No issues

### TypeScript snake_case Leaks
✓ No issues

### File Naming
Found 6 files with naming issues

### Database Transformation Usage
6 routes may need transformation utilities

## Recommendations


1. Review and fix 12 naming issues above
2. Use transformation utilities in all API routes that query the database
3. Run this validator regularly during development
4. Add pre-commit hook to enforce naming conventions

