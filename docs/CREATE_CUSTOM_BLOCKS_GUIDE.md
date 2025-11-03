# Creating Custom Workout Blocks - Quick Guide

## Overview

Workout blocks allow you to save reusable sets of exercises that you can quickly add to any workout. This is perfect for:

- Warm-up routines you use every Monday
- Main lift combinations for push/pull/leg days
- Accessory work supersets
- Cool-down stretching routines

## How to Create a Custom Block

### From the Workout Editor

1. **Open Workout Editor**: When creating or editing a workout
2. **Click "Add Block"**: The purple button with a package icon
3. **In Block Library, Click "Create Block"**: White button in the top-right
4. **Fill in Block Details**:
   - **Name**: Give it a descriptive name (e.g., "My Push Day Main Lifts")
   - **Category**: Choose from Warm-up, Main Lifts, Accessory, Cool Down, or Custom
   - **Description**: Optional brief description
   - **Tags**: Comma-separated tags (e.g., "push, strength, chest")
   - **Duration**: Estimated time in minutes
5. **Add Exercises**: Click "Add Exercise" for each movement
   - Enter exercise name, sets, and reps
   - Use the trash icon to remove exercises
   - Exercises are automatically numbered
6. **Click "Save Block"**: Your block is now saved and ready to use!

### Using Your Custom Blocks

Once created, your custom blocks appear in the Block Library alongside templates:

- **All Blocks tab**: Shows everything
- **Custom tab**: Shows only your custom blocks
- **Category tabs**: Filter by type (Warm-up, Main, Accessory, Cool Down)
- **Favorites**: Star your most-used blocks for quick access

## Block Library Features

### Search & Filter

- **Search bar**: Find blocks by name, description, or tags
- **Category tabs**: Filter by block type
- **Favorites toggle**: Show only starred blocks
- **Sort options**: By name, most used, or recently used

### Block Actions

- **Click to Add**: Click any block to add it to your workout
- **Star for Favorites**: Click the star icon to favorite/unfavorite
- **Edit Custom Blocks**: Edit button on non-template blocks
- **Duplicate Blocks**: Copy a block to customize it

## API Endpoints

### GET /api/blocks

Fetch all available blocks (templates + your custom blocks)

**Query Parameters**:

- `category`: Filter by warmup, main, accessory, cooldown, or custom
- `favorites=true`: Show only favorites
- `templates=true`: Show only templates

**Response**:

```json
{
  "blocks": [
    {
      "id": "uuid",
      "name": "My Push Day Main Lifts",
      "description": "Core compound movements",
      "category": "main",
      "exercises": [...],
      "tags": ["push", "strength"],
      "estimatedDuration": 30,
      "isTemplate": false,
      "isFavorite": true,
      "usageCount": 5,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/blocks

Create a new custom block

**Request Body**:

```json
{
  "name": "My Custom Block",
  "description": "Optional description",
  "category": "custom",
  "exercises": [
    {
      "exerciseName": "Bench Press",
      "sets": 4,
      "reps": 8,
      "weightType": "percentage",
      "percentage": 80
    }
  ],
  "tags": ["push", "strength"],
  "estimatedDuration": 25
}
```

**Response**:

```json
{
  "success": true,
  "block": {
    /* created block */
  }
}
```

### POST /api/blocks/[id]/favorite

Toggle favorite status of a block

**Response**:

```json
{
  "success": true,
  "block": {
    /* updated block */
  },
  "isFavorite": true
}
```

## Database Schema

The `workout_blocks` table stores all blocks:

```sql
CREATE TABLE workout_blocks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- warmup, main, accessory, cooldown, custom
  exercises JSONB NOT NULL, -- Array of exercise objects
  groups JSONB, -- Optional exercise groups (supersets, circuits)
  estimated_duration INTEGER,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_template BOOLEAN DEFAULT false, -- System templates vs user blocks
  created_by UUID REFERENCES public.users(id),
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

- **Templates**: Visible to everyone
- **Custom Blocks**: Only visible to the creator
- **Favorites**: User-specific per block
- **Usage Count**: Updated when block is added to a workout

## Tips & Best Practices

1. **Descriptive Names**: Use clear names that indicate when/how to use the block
2. **Consistent Tags**: Use standard tags (push, pull, legs, upper, lower, strength, hypertrophy)
3. **Realistic Duration**: Helps with workout planning
4. **Star Your Favorites**: Quick access to your most-used blocks
5. **Build Block Library**: Create blocks for recurring patterns in your training
6. **Categories Matter**: Proper categorization makes blocks easier to find

## Example Use Cases

### Monday Upper Body Warm-up

- Category: Warm-up
- Exercises: Arm circles, band pull-aparts, push-ups
- Duration: 10 minutes
- Tags: warmup, upper, mobility

### Push Day Main Lifts

- Category: Main Lifts
- Exercises: Bench press, overhead press, incline DB press
- Duration: 30 minutes
- Tags: push, strength, chest, shoulders

### Accessory Superset

- Category: Accessory
- Exercises: Lateral raises, tricep pushdowns, cable flyes
- Duration: 20 minutes
- Tags: push, accessory, superset

### Standard Cool Down

- Category: Cool Down
- Exercises: Foam rolling, static stretching
- Duration: 10 minutes
- Tags: cooldown, recovery, mobility

## Troubleshooting

### Block Not Appearing in Library

- Make sure you saved the block successfully
- Check that you're viewing "All Blocks" or the correct category tab
- Templates are visible to everyone, custom blocks only to you

### Cannot Edit or Delete a Block

- Templates (system blocks) cannot be edited or deleted
- Only the creator can edit/delete custom blocks
- Use "Duplicate" to create an editable copy of a template

### Exercises Not Saving Properly

- Ensure all exercises have names entered
- Sets and reps must be numbers greater than 0
- Exercise names are automatically converted to IDs

## Future Enhancements

Potential features for workout blocks:

- [ ] Share blocks with specific coaches/athletes
- [ ] Public block library (community-contributed)
- [ ] Block versioning (track changes over time)
- [ ] Block analytics (most effective blocks)
- [ ] Export/import blocks between accounts
- [ ] Block templates from certified coaches
