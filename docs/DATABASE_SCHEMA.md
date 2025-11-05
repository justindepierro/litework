# Database Schema Documentation

**Last Updated**: November 5, 2025  
**Database**: Supabase PostgreSQL  
**Total Tables**: 34

## Quick Reference

### Core Tables
- [Users & Authentication](#users--authentication)
- [Workouts](#workouts)
- [Exercises](#exercises)
- [Progress Tracking](#progress-tracking)
- [Groups & Assignments](#groups--assignments)
- [Communication](#communication)

---

## Users & Authentication

### `users`
**Purpose**: User profiles and authentication data

**Key Columns**:
- `id` (UUID, PK) - User identifier (matches auth.users)
- `email` (TEXT) - User email
- `role` (TEXT) - 'admin', 'coach', 'athlete'
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `phone` (TEXT) - Contact phone number
- `created_at` (TIMESTAMP) - Account creation date

**Related Tables**: athlete_groups, workout_assignments, workout_plans

---

## Workouts

### `workout_plans`
**Purpose**: Main workout templates created by coaches

**Key Columns**:
- `id` (UUID, PK) - Workout identifier
- `name` (TEXT, NOT NULL) - Workout name (e.g., "Monday Upper Body")
- `description` (TEXT) - Workout description/notes
- `estimated_duration` (INTEGER) - Expected duration in minutes
- `target_group_id` (UUID) - FK to athlete_groups
- `created_by` (UUID, NOT NULL) - FK to users (coach who created it)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

**Related Tables**: workout_exercises, workout_exercise_groups, workout_assignments

---

### `workout_exercises`
**Purpose**: Individual exercises within a workout

**Key Columns**:
- `id` (UUID, PK) - Exercise instance identifier
- `workout_plan_id` (UUID, FK) - Parent workout
- `exercise_id` (TEXT, NOT NULL) - Reference to exercise in library
- `exercise_name` (TEXT, NOT NULL) - Display name
- `sets` (INTEGER, NOT NULL) - Number of sets
- `reps` (INTEGER, NOT NULL) - Reps per set
- `weight_type` (ENUM, NOT NULL) - 'fixed', 'percentage', 'bodyweight'
- `weight` (NUMERIC) - Weight for fixed type (e.g., 135 lbs)
- `weight_max` (NUMERIC) - Maximum weight for ranges (e.g., 135-155 lbs)
- `percentage` (INTEGER) - Percentage of 1RM (e.g., 70%)
- `percentage_max` (INTEGER) - Max percentage for ranges (e.g., 70-80%)
- `percentage_base_kpi` (TEXT) - Which KPI to base percentage on
- `tempo` (TEXT) - Rep tempo (e.g., "3-1-1-0" = 3s eccentric, 1s pause, 1s concentric, 0s rest)
- `each_side` (BOOLEAN) - Unilateral exercise flag (e.g., single-leg RDL)
- `notes` (TEXT) - Exercise-specific instructions
- `rest_time` (INTEGER) - Rest in seconds after exercise
- `order_index` (INTEGER, NOT NULL) - Display order in workout
- `group_id` (TEXT) - FK to workout_exercise_groups (for supersets/circuits)
- `block_instance_id` (TEXT) - FK to workout_block_instances (if from template)
- `substitution_reason` (TEXT) - Why this exercise was substituted
- `original_exercise` (TEXT) - Original exercise if this is a substitution
- `progression_notes` (TEXT) - Progression suggestions for next workout
- `created_at` (TIMESTAMP) - Creation timestamp

**Related Tables**: workout_plans, workout_exercise_groups, exercises

**Weight Type Examples**:
```javascript
// Fixed weight
{ weight_type: 'fixed', weight: 135, weight_max: 155 } // 135-155 lbs

// Percentage of 1RM
{ weight_type: 'percentage', percentage: 70, percentage_max: 80 } // 70-80% of 1RM

// Bodyweight
{ weight_type: 'bodyweight', weight: null } // No added weight
```

---

### `workout_exercise_groups`
**Purpose**: Groups of exercises (supersets, circuits, sections)

**Key Columns**:
- `id` (UUID, PK) - Group identifier
- `workout_plan_id` (UUID, FK) - Parent workout
- `name` (TEXT, NOT NULL) - Group name (e.g., "Superset 1", "Upper Body Circuit")
- `type` (TEXT, NOT NULL) - 'superset', 'circuit', 'section'
- `description` (TEXT) - Group description
- `order_index` (INTEGER, NOT NULL) - Display order in workout
- `rest_between_rounds` (INTEGER) - Rest between complete rounds (for circuits)
- `rest_between_exercises` (INTEGER) - Rest between individual exercises
- `rounds` (INTEGER) - Number of times to repeat the group
- `notes` (TEXT) - Group-specific instructions
- `block_instance_id` (TEXT) - FK to workout_block_instances (if from template)
- `created_at` (TIMESTAMP) - Creation timestamp

**Type Definitions**:
- **Superset**: 2-4 exercises performed back-to-back with minimal rest
- **Circuit**: 5+ exercises performed in sequence, often for conditioning
- **Section**: Workout phase grouping (e.g., "Warmup", "Main Lifts", "Accessory Work")

**Related Tables**: workout_plans, workout_exercises

**Usage Example**:
```javascript
{
  name: "Superset 1",
  type: "superset",
  rest_between_exercises: 0,      // No rest between exercises
  rest_between_rounds: 120,        // 2 minutes rest after completing all exercises
  rounds: 3,                       // Perform 3 times
  exercises: [
    { exercise_name: "Bench Press", sets: 3, reps: 8 },
    { exercise_name: "Bent Over Row", sets: 3, reps: 8 }
  ]
}
```

---

### `workout_block_instances`
**Purpose**: Instances of reusable workout templates (blocks)

**Key Columns**:
- `id` (UUID, PK) - Instance identifier
- `workout_plan_id` (UUID, FK) - Parent workout
- `source_block_id` (UUID) - Reference to original block template
- `source_block_name` (TEXT, NOT NULL) - Name of source block
- `instance_name` (TEXT) - Custom name for this instance (if modified)
- `notes` (TEXT) - Instance-specific notes
- `estimated_duration` (INTEGER) - Expected duration in minutes
- `modified_exercises` (JSONB) - Array of exercise modifications
- `added_exercises` (JSONB) - Array of exercises added to this instance
- `removed_exercises` (JSONB) - Array of exercises removed from source
- `modified_groups` (JSONB) - Array of group modifications
- `added_groups` (JSONB) - Array of groups added
- `removed_groups` (JSONB) - Array of groups removed
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

**Related Tables**: workout_plans, workout_blocks

**Use Case**: Allows coaches to create reusable workout blocks (e.g., "Olympic Lift Complex") and customize them per athlete without modifying the original template.

---

### `workout_blocks`
**Purpose**: Reusable workout templates

**Key Columns**:
- `id` (UUID, PK) - Block identifier
- `name` (TEXT, NOT NULL) - Block name
- `description` (TEXT) - Block description
- `created_by` (UUID) - FK to users (coach who created it)
- `estimated_duration` (INTEGER) - Expected duration
- `is_public` (BOOLEAN) - Shared with other coaches
- `created_at` (TIMESTAMP)

**Related Tables**: block_exercises, block_exercise_groups, workout_block_instances

---

### `workout_sessions`
**Purpose**: Completed workout instances by athletes

**Key Columns**:
- `id` (UUID, PK) - Session identifier
- `athlete_id` (UUID, FK) - User who performed the workout
- `workout_plan_id` (UUID, FK) - Original workout plan
- `workout_assignment_id` (UUID, FK) - Assignment that prompted this session
- `started_at` (TIMESTAMP) - When athlete started
- `completed_at` (TIMESTAMP) - When athlete finished
- `status` (TEXT) - 'in_progress', 'completed', 'skipped'
- `notes` (TEXT) - Athlete's notes about the session
- `created_at` (TIMESTAMP)

**Related Tables**: session_exercises, set_records, workout_plans, users

---

### `session_exercises`
**Purpose**: Exercises performed during a workout session

**Key Columns**:
- `id` (UUID, PK)
- `workout_session_id` (UUID, FK) - Parent session
- `workout_exercise_id` (UUID, FK) - Original planned exercise
- `exercise_id` (TEXT) - Exercise performed (may differ from plan)
- `exercise_name` (TEXT)
- `completed` (BOOLEAN) - Whether athlete completed this exercise
- `notes` (TEXT) - Exercise-specific notes
- `order_index` (INTEGER)

**Related Tables**: workout_sessions, set_records

---

### `set_records`
**Purpose**: Individual set records (weight, reps, RPE per set)

**Key Columns**:
- `id` (UUID, PK)
- `session_exercise_id` (UUID, FK) - Parent session exercise
- `set_number` (INTEGER) - Which set (1, 2, 3, etc.)
- `reps` (INTEGER) - Actual reps performed
- `weight` (NUMERIC) - Actual weight used
- `rpe` (NUMERIC) - Rate of Perceived Exertion (1-10)
- `completed` (BOOLEAN)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

**Related Tables**: session_exercises

**Example**:
```javascript
// Bench Press - Set 1
{ set_number: 1, reps: 8, weight: 135, rpe: 7 }
// Bench Press - Set 2
{ set_number: 2, reps: 7, weight: 135, rpe: 8.5 } // Struggled more
```

---

## Exercises

### `exercises`
**Purpose**: Exercise library (movements database)

**Key Columns**:
- `id` (TEXT, PK) - Unique exercise identifier (slug format)
- `name` (TEXT, NOT NULL) - Display name
- `description` (TEXT) - Exercise description/instructions
- `category` (TEXT) - 'strength', 'cardio', 'flexibility', 'sport-specific'
- `equipment` (TEXT[]) - Array of required equipment
- `video_url` (TEXT) - Instructional video link
- `created_at` (TIMESTAMP)

**Related Tables**: exercise_muscle_groups, exercise_analytics, user_exercise_preferences

---

### `exercise_muscle_groups`
**Purpose**: Many-to-many mapping of exercises to muscle groups

**Key Columns**:
- `id` (UUID, PK)
- `exercise_id` (TEXT, FK) - Exercise
- `muscle_group_id` (UUID, FK) - Muscle group
- `is_primary` (BOOLEAN) - Primary vs secondary muscle
- `created_at` (TIMESTAMP)

**Related Tables**: exercises, muscle_groups

---

### `muscle_groups`
**Purpose**: Muscle groups database

**Key Columns**:
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL) - e.g., "Quadriceps", "Chest", "Hamstrings"
- `description` (TEXT)
- `created_at` (TIMESTAMP)

---

### `exercise_analytics`
**Purpose**: Exercise usage tracking and analytics

**Key Columns**:
- `id` (UUID, PK)
- `exercise_id` (TEXT, FK) - Exercise being tracked
- `user_id` (UUID, FK) - User (coach or athlete)
- `usage_count` (INTEGER) - Number of times used
- `last_used` (TIMESTAMP) - Most recent use
- `created_at` (TIMESTAMP)

**Related Tables**: exercises, users

---

## Progress Tracking

### `athlete_kpis`
**Purpose**: Key Performance Indicators for athletes (1RMs, etc.)

**Key Columns**:
- `id` (UUID, PK)
- `athlete_id` (UUID, FK) - User
- `exercise_id` (TEXT, FK) - Exercise
- `kpi_type` (TEXT) - 'one_rm', 'max_reps', 'max_distance', 'best_time'
- `value` (NUMERIC) - KPI value
- `date` (DATE) - When achieved
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

**Related Tables**: users, exercises

**Example**:
```javascript
{ 
  athlete_id: "uuid",
  exercise_id: "back-squat",
  kpi_type: "one_rm",
  value: 315,  // 315 lbs 1RM
  date: "2025-11-01"
}
```

---

### `progress_entries`
**Purpose**: General progress tracking (weight, measurements, etc.)

**Key Columns**:
- `id` (UUID, PK)
- `athlete_id` (UUID, FK)
- `entry_type` (TEXT) - 'bodyweight', 'body_fat', 'measurement'
- `value` (NUMERIC)
- `unit` (TEXT) - 'lbs', 'kg', 'inches', '%'
- `date` (DATE)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

**Related Tables**: users

---

## Groups & Assignments

### `athlete_groups`
**Purpose**: Groups of athletes (teams, positions, etc.)

**Key Columns**:
- `id` (UUID, PK)
- `name` (TEXT, NOT NULL) - Group name (e.g., "Varsity Football", "Volleyball Girls")
- `description` (TEXT)
- `sport` (TEXT) - Sport type
- `season` (TEXT) - Current season
- `created_by` (UUID, FK) - Coach who created it
- `archived` (BOOLEAN) - Whether group is active
- `created_at` (TIMESTAMP)

**Related Tables**: athlete_group_members, workout_assignments

---

### `workout_assignments`
**Purpose**: Assigns workouts to athletes or groups

**Key Columns**:
- `id` (UUID, PK)
- `workout_plan_id` (UUID, FK) - Workout being assigned
- `athlete_id` (UUID, FK) - Individual athlete (if individual assignment)
- `group_id` (UUID, FK) - Group (if group assignment)
- `assigned_by` (UUID, FK) - Coach who assigned it
- `assigned_at` (TIMESTAMP) - When assigned
- `scheduled_date` (DATE) - When to perform
- `due_date` (DATE) - Deadline
- `status` (TEXT) - 'assigned', 'completed', 'skipped'
- `notes` (TEXT) - Assignment-specific instructions
- `created_at` (TIMESTAMP)

**Related Tables**: workout_plans, users, athlete_groups

---

## Communication

### `notifications`
**Purpose**: User notifications

**Key Columns**:
- `id` (UUID, PK)
- `user_id` (UUID, FK) - Recipient
- `type` (TEXT) - Notification type
- `title` (TEXT)
- `message` (TEXT)
- `read` (BOOLEAN)
- `action_url` (TEXT) - Link to related item
- `created_at` (TIMESTAMP)

**Related Tables**: users

---

### `messages`
**Purpose**: Direct messages between users

**Key Columns**:
- `id` (UUID, PK)
- `sender_id` (UUID, FK)
- `recipient_id` (UUID, FK)
- `subject` (TEXT)
- `body` (TEXT)
- `read` (BOOLEAN)
- `created_at` (TIMESTAMP)

**Related Tables**: users

---

## Row Level Security (RLS)

All tables have Row Level Security enabled with policies for:

- **SELECT**: Users can view their own data + related data based on role
- **INSERT**: Users can create records they own
- **UPDATE**: Users can update records they own
- **DELETE**: Users can delete records they own

**Role Hierarchy**:
- **admin**: Full access to all data
- **coach**: Can manage athletes, workouts, groups
- **athlete**: Can view assigned workouts, record sessions, track progress

---

## Common Queries

### Get Workout with All Exercises and Groups
```sql
SELECT 
  wp.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', we.id,
    'exerciseName', we.exercise_name,
    'sets', we.sets,
    'reps', we.reps,
    'groupId', we.group_id,
    'orderIndex', we.order_index
  )) as exercises,
  json_agg(DISTINCT jsonb_build_object(
    'id', weg.id,
    'name', weg.name,
    'type', weg.type,
    'orderIndex', weg.order_index
  )) FILTER (WHERE weg.id IS NOT NULL) as groups
FROM workout_plans wp
LEFT JOIN workout_exercises we ON we.workout_plan_id = wp.id
LEFT JOIN workout_exercise_groups weg ON weg.workout_plan_id = wp.id
WHERE wp.id = $1
GROUP BY wp.id;
```

### Get Athlete's Assigned Workouts
```sql
SELECT 
  wa.*,
  wp.name as workout_name,
  wp.estimated_duration,
  u.first_name || ' ' || u.last_name as assigned_by_name
FROM workout_assignments wa
JOIN workout_plans wp ON wp.id = wa.workout_plan_id
JOIN users u ON u.id = wa.assigned_by
WHERE wa.athlete_id = $1
  AND wa.status = 'assigned'
ORDER BY wa.scheduled_date;
```

### Get Athlete's Progress for Exercise
```sql
SELECT 
  sr.*,
  se.exercise_name,
  ws.completed_at
FROM set_records sr
JOIN session_exercises se ON se.id = sr.session_exercise_id
JOIN workout_sessions ws ON ws.id = se.workout_session_id
WHERE ws.athlete_id = $1
  AND se.exercise_id = $2
ORDER BY ws.completed_at DESC
LIMIT 20;
```

---

## Migration History

### November 2025 - Groups and Blocks Enhancement
- Added `workout_exercise_groups` table for supersets/circuits
- Added `workout_block_instances` table for template customization
- Enhanced `workout_exercises` with 10 additional columns:
  - `weight_max`, `percentage_max`, `percentage_base_kpi`
  - `tempo`, `each_side`, `notes`
  - `block_instance_id`, `substitution_reason`, `original_exercise`, `progression_notes`

### Schema File Location
- **Full Schema**: `database-export/schema-dump.sql`
- **Schema Documentation**: This file
- **Migration Scripts**: `database/*.sql`

---

## Maintenance

### Backup Strategy
```bash
# Export full schema
supabase db dump --linked --data-only=false > backup-schema.sql

# Export data for specific table
supabase db dump --linked --data-only --table public.workout_plans > workout_plans_backup.sql
```

### Schema Updates
1. Test changes locally first
2. Create migration script in `/database/`
3. Apply to production via Supabase Dashboard → SQL Editor
4. Update this documentation
5. Commit changes to git

---

**For more information**:
- See `database/schema.sql` for legacy schema reference
- See `database-export/schema-dump.sql` for current production schema
- See `ARCHITECTURE.md` for application architecture and auth patterns
