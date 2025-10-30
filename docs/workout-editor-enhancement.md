# Workout Editor Enhancement

## Overview

The workout editor has been enhanced with advanced grouping and organization features that allow coaches to create structured, professional workout plans with exercise groupings, drag-and-drop reordering, and flexible exercise management.

## New Features

### 1. Exercise Grouping

Three types of exercise groups are supported:

#### Superset

- **Purpose**: Back-to-back exercises with minimal rest between them
- **Use Case**: Pairing complementary exercises (e.g., biceps + triceps)
- **Visual**: Orange-themed border and icon (⚡)

#### Circuit

- **Purpose**: Series of exercises completed in sequence with timed rounds
- **Use Case**: HIIT training, conditioning workouts
- **Features**: Configurable rounds and rest between rounds
- **Visual**: Blue-themed border and icon (🔄)

#### Section

- **Purpose**: Logical grouping of exercises (e.g., "Warm-up", "Main Workout", "Cool-down")
- **Use Case**: Organizing workout phases
- **Visual**: Green-themed border and icon (🎯)

### 2. Drag-and-Drop Functionality

- **Manual Reordering**: Up/down arrow buttons for precise control
- **Group Assignment**: Dropdown menu to move exercises between groups
- **Visual Feedback**: Intuitive UI with hover states and clear indicators

### 3. Enhanced Exercise Management

#### Exercise Editor

- **Inline Editing**: Click edit button to modify exercise details
- **Quick Parameters**: Sets, reps, weight, rest time
- **Weight Types**: Fixed weight, percentage-based (1RM), bodyweight

#### Group Editor

- **Group Properties**: Name, type, description
- **Circuit Settings**: Rounds and rest between rounds
- **Collapsible Views**: Expand/collapse groups for better organization

### 4. Workout Structure

```typescript
// Updated types to support grouping
interface WorkoutExercise {
  // ... existing properties
  groupId?: string; // Links exercise to a group
}

interface ExerciseGroup {
  id: string;
  name: string;
  type: "superset" | "circuit" | "section";
  order: number;
  rounds?: number; // For circuits
  restBetweenRounds?: number; // For circuits
  description?: string;
}

interface WorkoutPlan {
  // ... existing properties
  groups?: ExerciseGroup[]; // Array of exercise groups
}
```

## Usage Guide

### Creating a New Workout with Groups

1. **Access Workout Editor**:
   - Navigate to Workouts page
   - Click "Edit" on an existing workout or create new workout

2. **Add Exercise Groups**:
   - Click "Add Superset" for paired exercises
   - Click "Add Circuit" for timed rounds
   - Click "Add Section" for logical grouping

3. **Add Exercises**:
   - Click "Add Exercise" for individual exercises
   - Use the three-dot menu (⋮) to move exercises into groups
   - Use up/down arrows to reorder within groups

4. **Configure Groups**:
   - Click edit button on group header to modify settings
   - Set rounds and rest times for circuits
   - Add descriptions for clarity

### Exercise Management

#### Moving Exercises

- **Between Groups**: Use the three-dot menu (⋮) → "Move to [Group Name]"
- **Remove from Group**: Select "Remove from group"
- **Reorder**: Use up (↑) and down (↓) arrow buttons

#### Editing Exercise Details

1. Click the edit button (✏️) on any exercise
2. Modify sets, reps, weight, and other parameters
3. Click "Save" to confirm changes

### Group Types and Best Practices

#### Superset Example

```
Shoulder & Tricep Superset:
  - Shoulder Press (3x10)
  - Tricep Extension (3x8)
  (Perform back-to-back with minimal rest)
```

#### Circuit Example

```
HIIT Circuit (3 rounds, 2min rest between rounds):
  - Burpees (10 reps, 30s rest)
  - Mountain Climbers (20 reps, 30s rest)
  - Jump Squats (15 reps, 30s rest)
  - Push-ups (12 reps, 30s rest)
```

#### Section Example

```
Warm-up Section:
  - Dynamic Stretching
  - Light Cardio

Main Workout Section:
  - Strength Training Exercises

Cool-down Section:
  - Static Stretching
  - Breathing Exercises
```

## Technical Implementation

### Architecture

- **React Components**: Modular design with separate components for exercises, groups, and editor
- **State Management**: Local state with callback-based updates
- **TypeScript**: Full type safety with enhanced interfaces
- **Drag-and-Drop**: Manual implementation with up/down controls for precise ordering

### Key Components

- `WorkoutEditor`: Main editor component with modal overlay
- `ExerciseItem`: Individual exercise with inline editing
- `GroupItem`: Exercise group container with collapse/expand
- Enhanced `WorkoutPlan` and `WorkoutExercise` types

### Data Flow

1. Workout data passed to editor
2. Local state maintains working copy
3. Changes propagated through callbacks
4. Parent component updates main workout list

## Benefits

### For Coaches

- **Professional Structure**: Create gym-quality workout plans
- **Flexibility**: Easy reorganization of exercises and groups
- **Clarity**: Visual grouping makes workout intent clear
- **Efficiency**: Quick editing and reordering tools

### For Athletes

- **Clear Instructions**: Understand exercise flow and grouping
- **Better Performance**: Proper superset and circuit guidance
- **Progressive Training**: Structured approach to workouts

## Future Enhancements

- True drag-and-drop with react-dnd library
- Exercise templates and presets
- Time-based workout planning
- Exercise video integration
- Workout sharing and duplication
- Mobile-optimized touch controls
