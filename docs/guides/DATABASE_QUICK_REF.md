# LiteWork Database Quick Reference

**Last Updated**: November 5, 2025

## 📊 Database Stats

- **Total Tables**: 34
- **Database**: Supabase PostgreSQL
- **Row Level Security**: Enabled on all tables
- **Current Schema**: `database-export/schema-dump.sql`

## 🔑 Most Important Tables

### Workouts

```
workout_plans (id, name, description, created_by, estimated_duration)
  └─ workout_exercises (23 columns: sets, reps, weight, tempo, notes, etc.)
  └─ workout_exercise_groups (supersets, circuits, sections)
  └─ workout_block_instances (reusable templates)

workout_assignments (athlete_id, group_id, scheduled_date, status)
  └─ workout_sessions (started_at, completed_at, status)
      └─ session_exercises (exercise_id, completed)
          └─ set_records (set_number, reps, weight, rpe)
```

### Exercises

```
exercises (id, name, description, category, equipment)
  └─ exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
  └─ exercise_analytics (usage_count, last_used)
```

### Users & Groups

```
users (id, email, role, first_name, last_name)
  └─ athlete_kpis (exercise_id, kpi_type, value, date)
  └─ progress_entries (entry_type, value, date)

athlete_groups (id, name, sport, season, created_by)
```

## 🎯 Common Queries

### Get Workout with Exercises & Groups

```sql
SELECT wp.*,
  json_agg(DISTINCT we.*) as exercises,
  json_agg(DISTINCT weg.*) FILTER (WHERE weg.id IS NOT NULL) as groups
FROM workout_plans wp
LEFT JOIN workout_exercises we ON we.workout_plan_id = wp.id
LEFT JOIN workout_exercise_groups weg ON weg.workout_plan_id = wp.id
WHERE wp.id = $1
GROUP BY wp.id;
```

### Get Athlete's Progress

```sql
SELECT sr.*, se.exercise_name, ws.completed_at
FROM set_records sr
JOIN session_exercises se ON se.id = sr.session_exercise_id
JOIN workout_sessions ws ON ws.id = se.workout_session_id
WHERE ws.athlete_id = $1 AND se.exercise_id = $2
ORDER BY ws.completed_at DESC;
```

## 🔧 Useful Commands

```bash
# Export current schema
./scripts/database/export-schema.sh

# View tables summary
cat database-export/TABLES_SUMMARY.txt

# View complete schema
cat database-export/schema-dump.sql | less
```

## 📚 Full Documentation

- **Complete Schema**: `docs/DATABASE_SCHEMA.md`
- **API Patterns**: `ARCHITECTURE.md`
- **Security**: `SECURITY_AUDIT_REPORT.md`

## 🚨 Important Notes

1. **workout_exercises** has 23 columns - check schema before querying
2. **workout_exercise_groups** enables supersets/circuits
3. **RLS policies** enforce all data access
4. Always use camelCase in TypeScript, snake_case in SQL
5. Transform between cases in `database-service.ts`

## 🔄 Schema Changes

When adding tables/columns:

1. Update `docs/DATABASE_SCHEMA.md`
2. Create migration in `/database/`
3. Run via Supabase Dashboard SQL Editor
4. Re-export schema: `./scripts/database/export-schema.sh`
5. Commit all changes to git
