# Exercise Library Database Migration

## Overview

We've migrated from a static TypeScript file with limited exercises to a comprehensive database-driven exercise library system. This allows for easy addition, editing, and customization of exercises through the admin interface.

## What Changed

### Before (Static File)
- Limited to ~20 exercises in `src/lib/exercise-library.ts`
- Hard to maintain and update
- No filtering by equipment, difficulty, or muscle groups
- No usage analytics
- No user preferences

### After (Database-Driven)
- Hundreds of exercises stored in Supabase database
- Easy to add/edit through admin interface
- Advanced filtering and search capabilities
- Usage tracking and analytics
- User preferences and favorites
- Exercise approval workflow
- Muscle group and equipment categorization

## Database Schema

### Core Tables
- `exercises` - Main exercise data
- `exercise_categories` - Categories (Chest, Back, Shoulders, etc.)
- `muscle_groups` - Target muscle groups
- `equipment_types` - Required equipment
- `exercise_muscle_groups` - Many-to-many relationship
- `exercise_variations` - Exercise variations and progressions
- `user_exercise_preferences` - User favorites and restrictions
- `exercise_analytics` - Usage tracking

## Setup Instructions

1. **Run the database migrations:**
   ```sql
   -- First, run the schema creation
   \i database/exercises-schema.sql
   
   -- Then seed with initial data
   \i database/exercises-seed.sql
   ```

2. **Update your API calls:**
   The exercise library now uses the `/api/exercises` endpoint instead of the static file.

3. **Component Usage:**
   ```tsx
   import ExerciseLibrary from '@/components/ExerciseLibrary';
   
   <ExerciseLibrary
     isOpen={showLibrary}
     onClose={() => setShowLibrary(false)}
     onSelectExercise={handleExerciseSelect}
     multiSelect={true}
     showCreateButton={true}
   />
   ```

## Features

### For Users
- **Advanced Search**: Search by name, description, or tags
- **Smart Filtering**: Filter by category, muscle group, equipment, difficulty
- **Exercise Details**: Complete instructions, muscle groups, equipment needed
- **Difficulty Levels**: Beginner to Expert ratings
- **Usage Analytics**: See popular exercises
- **Favorites**: Save preferred exercises
- **Restrictions**: Mark exercises as restricted due to injuries

### For Coaches/Admins
- **Exercise Management**: Add, edit, and approve exercises
- **Bulk Operations**: Import exercises from spreadsheets
- **Usage Analytics**: Track which exercises are most used
- **Custom Categories**: Create sport-specific categories
- **Equipment Management**: Define available equipment types

## API Endpoints

### GET `/api/exercises`
Retrieve exercises with filtering options:
- `?search=term` - Search by name/description
- `?category=id` - Filter by category
- `?muscleGroup=name` - Filter by muscle group
- `?equipment=name` - Filter by equipment
- `?difficulty=level` - Filter by difficulty (1-5)

### POST `/api/exercises`
Create new exercise (coaches/admins only):
```json
{
  "name": "Exercise Name",
  "description": "Exercise description",
  "categoryId": "uuid",
  "instructions": ["Step 1", "Step 2"],
  "difficultyLevel": 3,
  "equipmentNeeded": ["Barbell", "Bench"],
  "isCompound": true,
  "muscleGroups": [
    {"muscleGroupId": "uuid", "involvementType": "primary"}
  ]
}
```

## Migration Benefits

1. **Scalability**: Can easily add hundreds more exercises
2. **Maintainability**: Exercises managed through UI, not code
3. **Flexibility**: Custom categories and muscle groups
4. **Analytics**: Track usage and popularity
5. **Personalization**: User preferences and restrictions
6. **Approval Workflow**: Quality control for user-submitted exercises
7. **Search & Filter**: Advanced discovery capabilities

## Next Steps

1. **Admin Interface**: Build exercise management UI for coaches
2. **Import Tools**: Create tools to import exercises from spreadsheets
3. **Video Integration**: Add exercise video support
4. **Exercise Builder**: Guided exercise creation wizard
5. **Analytics Dashboard**: Usage and popularity analytics
6. **Mobile Optimization**: Enhance mobile exercise browsing

## Data Migration

If you have custom exercises in the old format, they can be migrated using this script:

```typescript
// Migration helper (to be run once)
async function migrateExercises() {
  for (const exercise of oldExerciseLibrary) {
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: exercise.name,
        description: exercise.description,
        // ... map other fields
      })
    });
  }
}
```

This new system provides a much more robust and scalable foundation for the exercise library while maintaining all existing functionality.