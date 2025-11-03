# Workout Block System

## Overview

The Workout Block System allows coaches to build workouts using reusable, pre-built templates. This dramatically speeds up workout creation and ensures consistency across training programs.

## Key Concepts

### What is a Workout Block?

A **Workout Block** is a reusable template containing a group of exercises organized for a specific purpose. Examples:

- **Warm-up Block**: "Monday Upper Body Warm-up" (Arm circles, band pull-aparts, push-ups)
- **Main Lift Block**: "Push Day - Main Lifts" (Bench press, overhead press, incline DB press)
- **Accessory Block**: "Push Accessories" (Lateral raises, tricep pushdowns, cable flyes)
- **Cool Down Block**: "Standard Cool Down" (Foam rolling, static stretching)

### Benefits

1. **Speed**: Build a complete workout in seconds by adding blocks
2. **Consistency**: Use the same warm-up/cool-down every Monday
3. **Flexibility**: Edit block content after insertion for day-specific adjustments
4. **Reusability**: Save frequently-used exercise combinations
5. **Organization**: Categorize blocks by type (warmup, main, accessory, cooldown)

## Architecture

### Type Definitions

```typescript
// src/types/index.ts

export interface WorkoutBlock {
  id: string;
  name: string; // e.g., "Monday Warm-up", "Push Day Core"
  description?: string;
  category: "warmup" | "main" | "accessory" | "cooldown" | "custom";
  exercises: WorkoutExercise[]; // Exercises in this block
  groups?: ExerciseGroup[]; // Supersets/circuits within the block
  estimatedDuration: number; // In minutes
  tags: string[]; // e.g., ["push", "upper body", "strength"]
  isTemplate: boolean; // System template or user-created
  createdBy: string;
  usageCount: number; // Track popularity
  lastUsed?: Date;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlan {
  // ... existing fields ...
  blocks?: WorkoutBlock[]; // Denormalized for editing
  blockIds?: string[]; // Reference to original blocks
}
```

### Database Schema

**Table: `workout_blocks`**

```sql
CREATE TABLE workout_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('warmup', 'main', 'accessory', 'cooldown', 'custom')),
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  groups JSONB DEFAULT '[]'::jsonb,
  estimated_duration INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security**:

- Users can view all template blocks (is_template = true)
- Users can view their own blocks
- Coaches/admins can view all blocks
- Users can create/edit/delete their own blocks
- Only admins can edit/delete templates

### Components

#### BlockLibrary Component

**Location**: `src/components/BlockLibrary.tsx`

**Features**:

- Browse blocks by category (Warm-up, Main, Accessory, Cool Down)
- Search by name, description, or tags
- Filter by favorites
- Sort by popularity, name, or recent usage
- Visual category indicators with color coding
- Click to insert block into workout
- Toggle favorites
- Display usage statistics

**Props**:

```typescript
interface BlockLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (block: WorkoutBlock) => void;
  onCreateBlock?: () => void;
  selectedBlocks?: string[];
}
```

#### Enhanced WorkoutEditor

**Location**: `src/components/WorkoutEditor.tsx`

**New Features**:

- "Add Block" button (purple gradient)
- Opens BlockLibrary modal
- Inserts block exercises with unique IDs
- Updates workout duration automatically
- Tracks which blocks were used (blockIds)

**Block Insertion Logic**:

```typescript
const insertBlock = (block: WorkoutBlock) => {
  // Generate unique IDs for all exercises and groups
  const timestamp = Date.now();

  // Clone exercises with new IDs
  const newExercises = block.exercises.map((ex, index) => ({
    ...ex,
    id: `${timestamp}-ex-${index}`,
    order: maxOrder + index + 1,
  }));

  // Clone groups with new IDs
  const newGroups = (block.groups || []).map((group, index) => ({
    ...group,
    id: `${timestamp}-group-${group.id}`,
    order: maxGroupOrder + index + 1,
  }));

  // Add to workout
  updateWorkout({
    ...localWorkout,
    exercises: [...localWorkout.exercises, ...newExercises],
    groups: [...(localWorkout.groups || []), ...newGroups],
    blockIds: [...(localWorkout.blockIds || []), block.id],
    estimatedDuration: localWorkout.estimatedDuration + block.estimatedDuration,
  });
};
```

### API Endpoints

**GET `/api/blocks`**

- Fetch workout blocks
- Query params:
  - `category`: Filter by category
  - `favorites`: Show only favorites
  - `templates`: Show only templates
- Returns user's blocks + all templates
- Sorted by usage_count

**POST `/api/blocks`**

- Create new workout block
- Requires: name, category, exercises
- Auto-sets is_template = false
- Returns created block

**PUT `/api/blocks`**

- Update existing block
- Can't edit templates (unless admin)
- Must own the block
- Returns updated block

**DELETE `/api/blocks`**

- Delete workout block
- Can't delete templates (unless admin)
- Must own the block
- Returns success message

## Pre-built Templates

### Warm-up Blocks (3)

1. **Monday Upper Body Warm-up**: Arm circles, band pull-aparts, push-ups
2. **Lower Body Dynamic Warm-up**: Leg swings, bodyweight squats, lunges, hip circles

### Main Lift Blocks (4)

3. **Push Day - Main Lifts**: Bench press, overhead press, incline DB press
4. **Pull Day - Main Lifts**: Deadlift, bent over row, pull-ups
5. **Leg Day - Main Lifts**: Back squat, Romanian deadlift, Bulgarian split squat
6. **Football Power Training**: Power clean, box jumps, medicine ball slams

### Accessory Blocks (4)

7. **Push Accessories**: Lateral raises, front raises (superset), tricep pushdowns, cable flyes
8. **Pull Accessories**: Face pulls, bicep curls, hammer curls (superset), lat pulldowns
9. **Leg Accessories**: Leg extensions, leg curls, calf raises
10. **Core Circuit**: Planks, Russian twists, leg raises, bicycle crunches (circuit format)

### Cool Down Blocks (3)

11. **Standard Cool Down**: Foam rolling, static stretching
12. **Upper Body Stretch**: Doorway chest stretch, shoulder stretch, tricep stretch, lat stretch
13. **Lower Body Stretch**: Quad stretch, hamstring stretch, hip flexor stretch, calf stretch, pigeon pose

## User Workflows

### Building a Workout with Blocks

1. **Open Workout Editor**
   - Click "Create Workout" or edit existing

2. **Add Warm-up Block**
   - Click "Add Block" button (purple)
   - Filter by "Warm-up" category
   - Select "Monday Upper Body Warm-up"
   - Block exercises appear in editor

3. **Add Main Work**
   - Click "Add Block" again
   - Filter by "Main Lifts"
   - Select "Push Day - Main Lifts"
   - Exercises added below warm-up

4. **Add Accessories**
   - Click "Add Block"
   - Select "Push Accessories"
   - Complete with supersets

5. **Add Cool Down**
   - Click "Add Block"
   - Select "Standard Cool Down"

6. **Individual Edits**
   - Modify any exercise (sets, reps, weight)
   - Add/remove exercises
   - Reorder as needed
   - All changes are workout-specific

7. **Save Workout**
   - Changes save automatically
   - Block IDs tracked for reference
   - Duration updated automatically

### Creating a Custom Block

1. **Build Exercise Sequence**
   - Create exercises in workout editor
   - Organize with groups if needed
   - Test the flow

2. **Save as Block**
   - (Future feature - "Save Selection as Block")
   - Name the block
   - Add description
   - Choose category
   - Add tags
   - Save

3. **Reuse the Block**
   - Block appears in library
   - Available in all workouts
   - Edit block updates all future uses
   - Past workouts unaffected

## Category Color Coding

```typescript
const CATEGORY_CONFIG = {
  warmup: {
    label: "Warm-up",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  main: {
    label: "Main Lifts",
    icon: Dumbbell,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  accessory: {
    label: "Accessory",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  cooldown: {
    label: "Cool Down",
    icon: Wind,
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  custom: {
    label: "Custom",
    icon: Star,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};
```

## Implementation Timeline

### Phase 1: Core Functionality (Completed)

- ✅ WorkoutBlock type definition
- ✅ Database schema and migrations
- ✅ Seed data with 13 pre-built templates
- ✅ BlockLibrary component
- ✅ WorkoutEditor integration
- ✅ API endpoints for CRUD operations

### Phase 2: Enhanced Features (Future)

- [ ] "Save as Block" from workout editor
- [ ] Block preview before insertion
- [ ] Block versioning/history
- [ ] Share blocks with other coaches
- [ ] Block analytics (most popular, effectiveness)
- [ ] Drag-and-drop block ordering
- [ ] Block categories customization

### Phase 3: Advanced Features (Future)

- [ ] AI-suggested blocks based on workout context
- [ ] Block recommendations based on athlete level
- [ ] Smart block combinations (warm-up + main + cool down)
- [ ] Block templates marketplace
- [ ] Export/import blocks between systems

## Database Migration

### Apply Schema

```bash
# Run the schema migration
psql $DATABASE_URL -f database/workout-blocks-schema.sql

# Seed with pre-built templates
psql $DATABASE_URL -f database/workout-blocks-seed.sql
```

### Verify Installation

```sql
-- Check table exists
SELECT COUNT(*) FROM workout_blocks;

-- List all template blocks
SELECT name, category, estimated_duration, usage_count
FROM workout_blocks
WHERE is_template = true
ORDER BY category, name;

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'workout_blocks';
```

## Testing Checklist

### BlockLibrary Component

- [ ] Opens/closes properly
- [ ] Displays all template blocks
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Favorites toggle works
- [ ] Sorting options work
- [ ] Block selection inserts into workout
- [ ] Proper mobile responsiveness

### WorkoutEditor Integration

- [ ] "Add Block" button visible
- [ ] BlockLibrary modal opens on click
- [ ] Block insertion creates unique IDs
- [ ] Exercises appear in correct order
- [ ] Groups are preserved
- [ ] Duration updates automatically
- [ ] blockIds tracked correctly
- [ ] Can edit block content after insertion

### API Endpoints

- [ ] GET /api/blocks returns correct data
- [ ] Query filters work (category, favorites, templates)
- [ ] POST creates new block
- [ ] PUT updates existing block
- [ ] DELETE removes block
- [ ] RLS prevents unauthorized access
- [ ] Admin can manage all blocks

### Database

- [ ] Schema applies without errors
- [ ] Seed data inserts correctly
- [ ] RLS policies enforce security
- [ ] Indexes improve query performance
- [ ] Triggers update timestamps

## Best Practices

### For Coaches

1. **Use Templates First**: Start with pre-built blocks before creating custom ones
2. **Consistent Warm-ups**: Use the same warm-up for specific training days
3. **Edit After Insertion**: Don't hesitate to modify block content for specific athletes
4. **Track Favorites**: Mark frequently-used blocks as favorites for quick access
5. **Name Clearly**: Use descriptive names like "Monday Upper Warm-up" not just "Warm-up"

### For Developers

1. **Unique IDs**: Always generate new IDs when cloning blocks
2. **Update Duration**: Automatically update workout duration when adding blocks
3. **Track Usage**: Increment usage_count when blocks are inserted
4. **Preserve Groups**: Maintain group relationships when cloning
5. **RLS First**: Always test with proper user permissions

## Troubleshooting

### Block Not Appearing

- Check RLS policies
- Verify user has correct role
- Check is_template flag
- Look for database errors in logs

### Exercises Duplicating

- Ensure unique ID generation
- Check timestamp uniqueness
- Verify order calculation

### Permission Errors

- Confirm user authentication
- Check created_by matches user ID
- Verify role for template access

## Future Enhancements

1. **Block Builder UI**: Dedicated interface for creating blocks
2. **Block Templates**: Pre-configured block structures
3. **Smart Suggestions**: AI-recommended blocks based on context
4. **Block Analytics**: Track which blocks perform best
5. **Sharing**: Allow coaches to share blocks with team
6. **Versioning**: Track block changes over time
7. **Bulk Operations**: Add multiple blocks at once
8. **Block Marketplace**: Community-contributed blocks

## Conclusion

The Workout Block System revolutionizes workout creation by enabling coaches to build complete training sessions in minutes using reusable templates. This ensures consistency, saves time, and maintains high-quality programming across all athletes.
