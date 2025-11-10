# Database-Frontend Naming Reference

Quick reference for database column names and their frontend equivalents.

## Naming Convention Pattern

```
Database (PostgreSQL) → Frontend (TypeScript)
snake_case            → camelCase
```

## Core Tables

### athlete_groups

```typescript
// Database → Frontend
id                → id
name              → name
description       → description
sport             → sport
category          → category
coach_id          → coachId
athlete_ids       → athleteIds
color             → color
archived          → archived
created_at        → createdAt
updated_at        → updatedAt
```

### workout_assignments

```typescript
// Database → Frontend
id                      → id
workout_plan_id         → workoutPlanId
workout_plan_name       → workoutPlanName
assigned_to_user_id     → athleteId (⚠️ deprecated?)
assigned_to_group_id    → groupId
athlete_ids             → athleteIds
assigned_by             → assignedBy
assigned_date           → assignedDate
scheduled_date          → scheduledDate
start_time              → startTime
end_time                → endTime
location                → location
due_date                → dueDate
status                  → status
notes                   → notes
created_at              → createdAt
updated_at              → updatedAt

// Computed fields (not in DB)
N/A                     → athleteNames (computed from users.first_name, last_name)
N/A                     → modifications (separate table)
```

### users

```typescript
// Database → Frontend
id                  → id
email               → email
full_name           → fullName
first_name          → firstName
last_name           → lastName
role                → role
status              → status
avatar_url          → avatarUrl
date_of_birth       → dateOfBirth
phone               → phone
emergency_contact   → emergencyContact
injury_status       → injuryStatus
created_at          → createdAt
updated_at          → updatedAt
```

### workout_plans

```typescript
// Database → Frontend
id              → id
name            → name
description     → description
coach_id        → coachId
is_template     → isTemplate
created_at      → createdAt
updated_at      → updatedAt
```

## Where Mapping Happens

All transformations occur in `/src/lib/database-service.ts`:

- `getAllGroups()` - Lines 115-135
- `getAllAssignments()` - Lines 1020-1080
- `getWorkoutPlan()` - Lines 380-420
- `createWorkoutPlan()` - Lines 590-680

## Usage Examples

### ❌ WRONG - Using database names in frontend

```typescript
// DON'T DO THIS
const coachId = group.coach_id; // ❌
const athleteIds = assignment.athlete_ids; // ❌
```

### ✅ CORRECT - Using frontend names

```typescript
// DO THIS
const coachId = group.coachId; // ✅
const athleteIds = assignment.athleteIds; // ✅
```

### ✅ CORRECT - Querying database

```typescript
// In API routes or database-service.ts
const { data } = await supabase
  .from("athlete_groups")
  .select("coach_id, athlete_ids") // ✅ Use snake_case for database
  .eq("id", groupId);

// Then transform for frontend
return {
  coachId: data.coach_id, // ✅ Transform to camelCase
  athleteIds: data.athlete_ids,
};
```

## Common Gotchas

### 1. Group Assignments

```typescript
// ❌ WRONG
assignment.assigned_to_group_id;

// ✅ CORRECT
assignment.groupId;
```

### 2. Individual Assignments

```typescript
// ❌ WRONG
assignment.assigned_to_user_id;

// ✅ CORRECT
assignment.athleteId;
```

### 3. Scheduled Dates

```typescript
// ❌ WRONG
assignment.scheduled_date;

// ✅ CORRECT
assignment.scheduledDate;
```

## TypeScript Interfaces

All frontend types use camelCase:

- `AthleteGroup` - `/src/types/index.ts` line 34
- `WorkoutAssignment` - `/src/types/index.ts` line 220
- `User` - `/src/types/index.ts` line 8
- `WorkoutPlan` - `/src/types/index.ts` line 80

## Database Schema

Full schema documentation: `/docs/DATABASE_SCHEMA.md`

## Questions?

See full audit report: `/docs/reports/DATABASE_NAMING_AUDIT.md`
