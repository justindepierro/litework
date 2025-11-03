# Block Instance System - Complete Guide

## Overview

The **Block Instance System** allows coaches to create reusable workout block templates and customize them individually for different athletes, groups, or progression phases **without modifying the original template**.

### Key Concept: Template vs Instance

- **Template (WorkoutBlock)**: The reusable, unchanging workout block stored in the database
- **Instance (BlockInstance)**: A specific use of a template in a workout, with potential customizations

Think of it like a recipe:

- **Template** = The original recipe in a cookbook
- **Instance** = Your specific cooking session where you might add extra garlic or substitute ingredients

## Architecture

### Type System

```typescript
// Block Template (in database)
interface WorkoutBlock {
  id: string;
  name: string; // e.g., "Push Day Main Lifts"
  category: "warmup" | "main" | "accessory" | "cooldown" | "custom";
  exercises: WorkoutExercise[];
  groups?: ExerciseGroup[];
  isTemplate: boolean;
  // ... metadata
}

// Block Instance (in workout)
interface BlockInstance {
  id: string; // Unique instance ID
  sourceBlockId: string; // Reference to original template
  sourceBlockName: string; // Template name for display
  instanceName?: string; // Optional custom name for this instance
  customizations: {
    modifiedExercises: string[]; // Exercise IDs that changed
    addedExercises: string[]; // Exercise IDs added to instance
    removedExercises: string[]; // Template exercise IDs removed
    modifiedGroups: string[];
    addedGroups: string[];
    removedGroups: string[];
  };
  notes?: string; // Instance-specific notes
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

// Exercise/Group tracking
interface WorkoutExercise {
  // ... other fields
  blockInstanceId?: string; // Links to parent block instance
}

interface ExerciseGroup {
  // ... other fields
  blockInstanceId?: string; // Links to parent block instance
}
```

### Data Flow

```
1. Coach creates template block → Saved in workout_blocks table
2. Coach adds block to workout → Instance created with unique ID
3. Exercises/groups cloned → Tagged with blockInstanceId
4. Coach customizes instance → Changes tracked in customizations
5. Template remains unchanged → Other workouts using same template unaffected
```

## Use Cases

### 1. Progressive Programming

**Scenario**: Same workout block, increasing intensity over 4 weeks

```typescript
// Week 1 - Base template
{
  sourceBlockName: "Bench Press Main",
  instanceName: "Week 1 - Base",
  exercises: [
    { name: "Bench Press", sets: 4, reps: 8, weight: 185 }
  ],
  notes: "Focus on form"
}

// Week 2 - Increased volume
{
  sourceBlockName: "Bench Press Main",
  instanceName: "Week 2 - Volume",
  exercises: [
    { name: "Bench Press", sets: 5, reps: 8, weight: 185 }
  ],
  notes: "Added 1 set",
  customizations: {
    modifiedExercises: ["ex-bench-1"]
  }
}

// Week 3 - Increased load
{
  sourceBlockName: "Bench Press Main",
  instanceName: "Week 3 - Load",
  exercises: [
    { name: "Bench Press", sets: 5, reps: 8, weight: 195 }
  ],
  notes: "Increased weight 10 lbs",
  customizations: {
    modifiedExercises: ["ex-bench-1"]
  }
}

// Week 4 - Peak
{
  sourceBlockName: "Bench Press Main",
  instanceName: "Week 4 - Peak",
  exercises: [
    { name: "Bench Press", sets: 4, reps: 6, weight: 205 }
  ],
  notes: "Lower reps, higher weight",
  customizations: {
    modifiedExercises: ["ex-bench-1"]
  }
}
```

### 2. Group-Specific Variations

**Scenario**: Same block template for different athlete groups

```typescript
// Varsity Football - Full template
{
  sourceBlockName: "Lower Body Power",
  instanceName: "Varsity - Full Load",
  exercises: [
    { name: "Back Squat", sets: 5, reps: 5, weight: "85% 1RM" },
    { name: "Box Jump", sets: 4, reps: 5, height: "36in" },
    { name: "Bulgarian Split Squat", sets: 3, reps: 8 }
  ],
  notes: "Full power development protocol"
}

// JV Football - Reduced volume
{
  sourceBlockName: "Lower Body Power",
  instanceName: "JV - Moderate Load",
  exercises: [
    { name: "Back Squat", sets: 4, reps: 5, weight: "75% 1RM" },
    { name: "Box Jump", sets: 3, reps: 5, height: "30in" },
    { name: "Bulgarian Split Squat", sets: 3, reps: 8 }
  ],
  notes: "Reduced intensity for development",
  customizations: {
    modifiedExercises: ["ex-squat-1", "ex-jump-2"]
  }
}

// Freshman - Beginner variation
{
  sourceBlockName: "Lower Body Power",
  instanceName: "Freshman - Beginner",
  exercises: [
    { name: "Goblet Squat", sets: 4, reps: 8, weight: "60 lbs" }, // Substituted
    { name: "Box Step-up", sets: 3, reps: 8, height: "20in" }, // Substituted
    { name: "Split Squat", sets: 3, reps: 8 } // Simplified
  ],
  notes: "Focus on movement quality, reduced complexity",
  customizations: {
    modifiedExercises: ["ex-squat-1", "ex-jump-2", "ex-split-3"]
  }
}
```

### 3. Individual Athlete Modifications

**Scenario**: Same workout for team, one athlete returning from injury

```typescript
// Team workout
{
  sourceBlockName: "Upper Body Hypertrophy",
  instanceName: "Team - Week 5",
  exercises: [
    { name: "Bench Press", sets: 4, reps: 10 },
    { name: "Rows", sets: 4, reps: 10 },
    { name: "Overhead Press", sets: 3, reps: 12 }
  ]
}

// Athlete returning from shoulder injury
{
  sourceBlockName: "Upper Body Hypertrophy",
  instanceName: "Team - Week 5 (Modified for John)",
  exercises: [
    { name: "Bench Press", sets: 3, reps: 10, weight: "lighter" }, // Reduced volume
    { name: "Rows", sets: 4, reps: 10 }, // Unchanged
    { name: "Landmine Press", sets: 3, reps: 12 } // Exercise substitution
  ],
  notes: "Shoulder-friendly variation for John's return to training",
  customizations: {
    modifiedExercises: ["ex-bench-1", "ex-press-3"]
  }
}
```

### 4. Adding Accessory Exercises

**Scenario**: Core template with group-specific accessories

```typescript
// Base template
{
  sourceBlockName: "Deadlift Complex",
  exercises: [
    { name: "Deadlift", sets: 5, reps: 3 },
    { name: "Romanian Deadlift", sets: 3, reps: 8 }
  ]
}

// Linemen - add extra lower back work
{
  sourceBlockName: "Deadlift Complex",
  instanceName: "Linemen - Enhanced",
  exercises: [
    { name: "Deadlift", sets: 5, reps: 3 },
    { name: "Romanian Deadlift", sets: 3, reps: 8 },
    { name: "Good Mornings", sets: 3, reps: 10 }, // Added
    { name: "Farmer's Carry", sets: 3, distance: "50yd" } // Added
  ],
  notes: "Extra posterior chain work for linemen",
  customizations: {
    addedExercises: ["ex-goodmorning-1", "ex-carry-2"]
  }
}

// Skill players - add explosive work
{
  sourceBlockName: "Deadlift Complex",
  instanceName: "Skill - Explosive",
  exercises: [
    { name: "Deadlift", sets: 5, reps: 3 },
    { name: "Romanian Deadlift", sets: 3, reps: 8 },
    { name: "Broad Jump", sets: 4, reps: 3 }, // Added
    { name: "Sled Sprint", sets: 4, distance: "20yd" } // Added
  ],
  notes: "Focus on explosiveness for speed positions",
  customizations: {
    addedExercises: ["ex-jump-1", "ex-sled-2"]
  }
}
```

## Workflow

### Creating a Template

1. **Open Block Library**
   - Click "Add Block" button in WorkoutEditor
   - Click "Create New Block" button

2. **Design Template**
   - Add exercises with default parameters
   - Organize into groups (supersets, circuits)
   - Set category and tags
   - Save as template

3. **Template Stored**
   - Saved to `workout_blocks` table
   - Available in Block Library for reuse
   - `isTemplate: true` flag

### Using a Template

1. **Add to Workout**
   - Open Block Library
   - Search/filter for desired template
   - Click template to insert

2. **Instance Created**
   - Unique `blockInstanceId` generated
   - Exercises/groups cloned with new IDs
   - All tagged with `blockInstanceId`
   - Stored in `blockInstances` array

3. **Initial State**
   - Identical to template
   - No customizations yet
   - `customizations` arrays empty

### Customizing an Instance

1. **Access Customization**
   - Click "Customize" button on block instance
   - Opens BlockInstanceEditor modal

2. **Edit Metadata**
   - Set custom instance name
   - Add instance-specific notes
   - View customization summary

3. **Modify Exercises** (in main editor)
   - Edit sets, reps, weight directly
   - Changes tracked automatically
   - Exercise ID added to `modifiedExercises`

4. **Add/Remove Exercises**
   - Add new exercises to block
   - Remove template exercises
   - Tracked in `addedExercises`/`removedExercises`

5. **Save Changes**
   - Customizations stored in `blockInstances`
   - Original template unchanged
   - Other workouts using template unaffected

### Resetting to Template

1. **Reset Option**
   - Click "Reset to Template" in customization modal
   - Confirms action with user

2. **Process**
   - Fetches original template from API
   - Replaces all exercises/groups
   - Clears customizations
   - Keeps same instance ID

## Visual Indicators

### In Workout Editor

**Block Instance Container**:

```
┌─────────────────────────────────────────────────┐
│ 📦 Push Day Main Lifts                          │
│    Block Template                [Customize] │
│                                                 │
│    • Bench Press (4x8 @ 185 lbs)               │
│    • Incline Press (3x10 @ 135 lbs)            │
│    • Tricep Dips (3x12)                        │
└─────────────────────────────────────────────────┘
```

**Customized Instance**:

```
┌─────────────────────────────────────────────────┐
│ 📦 Week 3 Progression                           │
│    Block Template • Customized    [Customize] │
│                                                 │
│    "Increased weight by 10 lbs"                │
│                                                 │
│    • Bench Press (4x8 @ 195 lbs) ⚡ Modified   │
│    • Incline Press (3x10 @ 145 lbs) ⚡         │
│    • Tricep Dips (3x12)                        │
│    • Close-grip Press (3x10) ⭐ Added          │
└─────────────────────────────────────────────────┘
```

### Customization Modal

```
┌──────────────────────────────────────────────────┐
│ Customize Block Instance                    [X] │
├──────────────────────────────────────────────────┤
│                                                  │
│ ℹ️ This block has been customized               │
│    Changes made here only affect this workout.  │
│    The original template remains unchanged.     │
│                                                  │
│ Instance Name (Optional)                        │
│ ┌──────────────────────────────────────────┐    │
│ │ Week 3 Progression                       │    │
│ └──────────────────────────────────────────┘    │
│                                                  │
│ Instance Notes                                  │
│ ┌──────────────────────────────────────────┐    │
│ │ Increased all weights by 5%             │    │
│ │ Added close-grip variation               │    │
│ └──────────────────────────────────────────┘    │
│                                                  │
│ Block Contents                                  │
│ • Exercises: 4                                  │
│ • Groups: 0                                     │
│ • Duration: ~25 min                             │
│                                                  │
│ [🔄 Reset to Template]                           │
│                                                  │
│ ℹ️ Note: To modify exercises, edit directly     │
│    in the workout editor. Changes are tracked   │
│    automatically.                               │
│                                                  │
├──────────────────────────────────────────────────┤
│ [Cancel]                         [💾 Save] │
└──────────────────────────────────────────────────┘
```

## Database Schema

### workout_plans Table

```sql
ALTER TABLE workout_plans
ADD COLUMN block_instances JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_workout_plans_block_instances
ON workout_plans USING GIN (block_instances);
```

### JSONB Structure

```json
{
  "blockInstances": [
    {
      "id": "block-instance-1699123456789",
      "sourceBlockId": "block-uuid-123",
      "sourceBlockName": "Push Day Main Lifts",
      "instanceName": "Week 3 Progression",
      "customizations": {
        "modifiedExercises": ["ex-1", "ex-2"],
        "addedExercises": ["ex-5"],
        "removedExercises": [],
        "modifiedGroups": [],
        "addedGroups": [],
        "removedGroups": []
      },
      "notes": "Increased weight by 10 lbs across all pressing movements",
      "estimatedDuration": 25,
      "createdAt": "2025-11-03T10:00:00Z",
      "updatedAt": "2025-11-03T10:30:00Z"
    }
  ],
  "exercises": [
    {
      "id": "1699123456789-ex-0",
      "exerciseName": "Bench Press",
      "blockInstanceId": "block-instance-1699123456789",
      "sets": 4,
      "reps": 8,
      "weight": 195
      // ... other fields
    }
  ],
  "groups": []
}
```

## API Integration

### Fetching Source Template

```typescript
// In BlockInstanceEditor
const fetchSourceBlock = async () => {
  const response = await fetch(`/api/blocks/${blockInstance.sourceBlockId}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  return data.block;
};
```

### Saving Customizations

```typescript
// In WorkoutEditor
const handleSaveBlockInstance = (
  updatedExercises: WorkoutExercise[],
  updatedGroups: ExerciseGroup[],
  updatedInstance: BlockInstance
) => {
  // Replace exercises for this instance
  const otherExercises = workout.exercises.filter(
    (ex) => ex.blockInstanceId !== updatedInstance.id
  );

  // Update workout
  updateWorkout({
    ...workout,
    exercises: [...otherExercises, ...updatedExercises],
    blockInstances: [...otherInstances, updatedInstance],
  });
};
```

## Best Practices

### When to Use Templates

✅ **Good Use Cases**:

- Common warm-up sequences
- Core strength complexes
- Sport-specific conditioning circuits
- Position-specific training blocks
- Progressive programming series

❌ **Poor Use Cases**:

- One-off workouts (just build directly)
- Highly individualized programs (defeats the purpose)
- Constantly changing routines (template won't get reused)

### Naming Conventions

**Templates**:

- Descriptive and general
- Examples: "Upper Body Push", "Deadlift Complex", "Sprint Conditioning"

**Instances**:

- Specific and contextual
- Examples: "Week 3 - Heavy", "Varsity Variation", "Modified for John"

### Customization Tracking

The system automatically tracks:

- ✅ Modified exercises (sets/reps/weight changed)
- ✅ Added exercises (new to instance)
- ✅ Removed exercises (from template)
- ✅ Modified groups
- ✅ Added/removed groups

This enables:

- Visual indicators of changes
- Reset to template capability
- Understanding of how instances differ
- Future analytics on common modifications

### Progressive Programming Tips

1. **Start with Base Template**
   - Design template at moderate intensity
   - Use clear, descriptive names
   - Document intended progression in description

2. **Create Instance Series**
   - Week 1: Use template as-is
   - Week 2: Increase volume (more sets)
   - Week 3: Increase load (more weight)
   - Week 4: Peak or deload

3. **Track Changes in Notes**
   - Document what changed and why
   - Example: "Week 3: +10 lbs all compounds, +1 set accessories"

4. **Use Instance Names**
   - Clear phase indicators
   - Example: "Base Week 1", "Volume Week 2", "Intensity Week 3", "Peak Week 4"

## Troubleshooting

### Issue: Changes Not Saving

**Symptom**: Edits to exercises in block instance don't persist

**Solution**:

1. Ensure `blockInstanceId` is set on exercises
2. Check that exercises have unique IDs
3. Verify `handleSaveBlockInstance` is called
4. Check browser console for errors

### Issue: Template Changes Affect Instances

**Symptom**: Editing template modifies existing instances

**Solution**:

- This should NOT happen - instances are independent
- Check that instance creation clones exercises with new IDs
- Verify `blockInstanceId` is set correctly
- Instances should reference `sourceBlockId` but not share data

### Issue: Reset Doesn't Work

**Symptom**: "Reset to Template" button doesn't restore original

**Solution**:

1. Check API endpoint `/api/blocks/[id]` is accessible
2. Verify `sourceBlockId` is correct
3. Check network tab for errors
4. Ensure new IDs are generated on reset

### Issue: Customizations Not Showing

**Symptom**: "Customized" badge doesn't appear

**Solution**:

- Check `customizations` object is populated
- Verify exercise IDs are added to tracking arrays
- Check logic in `BlockInstanceItem` component
- Ensure `hasCustomizations` calculation is correct

## Future Enhancements

### Potential Features

1. **Block Versioning**
   - Track template changes over time
   - Update instances to new version option
   - Migration path for breaking changes

2. **Instance Analytics**
   - Most common customizations
   - Popular modifications by group
   - Success metrics by variation

3. **Template Suggestions**
   - AI-powered recommendations
   - Based on athlete profile
   - Progressive overload automation

4. **Bulk Instance Updates**
   - Apply changes to multiple instances
   - Useful for correcting errors
   - Update entire progression series

5. **Instance Comparison**
   - Side-by-side view of variations
   - Diff highlighting
   - Export comparison reports

6. **Template Marketplace**
   - Share templates with other coaches
   - Download community templates
   - Rate and review templates

## Summary

The Block Instance System provides powerful flexibility for coaches:

- **Reusability**: Create templates once, use many times
- **Customization**: Tailor each use without affecting template
- **Progressive Programming**: Easy phase-to-phase progression
- **Group Variations**: Same plan, different intensities
- **Individual Modifications**: Adapt for injuries, experience
- **Template Integrity**: Original remains unchanged

This system brings professional programming capabilities to LiteWork, enabling coaches to work efficiently while maintaining individual athlete care.
