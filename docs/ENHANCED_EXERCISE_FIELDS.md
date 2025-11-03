# Enhanced Exercise Configuration Guide

## Overview

Exercises in LiteWork now support comprehensive configuration options to match real-world strength and conditioning programming:

- **Reps**: Number of repetitions per set
- **Tempo**: Speed and timing of each rep phase
- **Load Configuration**: Fixed weight, percentage of 1RM, or bodyweight
- **Unilateral Flag**: Mark exercises performed on each leg separately
- **Exercise Notes**: Equipment needs, cues, and specific instructions

## Exercise Fields Reference

### Basic Fields

#### Exercise Name

The name of the movement (e.g., "Bench Press", "Bulgarian Split Squat")

#### Sets

Number of sets to perform (e.g., 3, 4, 5)

#### Reps

Number of repetitions per set (e.g., 8, 10, 12)

### Tempo (NEW)

**Format**: `Down-Pause-Up-Top` (4 numbers separated by dashes)

**Explanation**:

- **First number**: Eccentric (lowering) phase in seconds
- **Second number**: Pause at bottom in seconds
- **Third number**: Concentric (lifting) phase in seconds
- **Fourth number**: Pause at top in seconds

**Examples**:

- `3-1-1-0`: 3 seconds down, 1 second pause, 1 second up, no pause at top
- `2-0-2-0`: Controlled 2-second eccentric and concentric, no pauses
- `4-2-1-0`: 4 seconds down, 2 second pause, explosive up, no top pause
- `1-0-1-1`: Standard tempo with 1 second squeeze at top

**Common Tempos**:

- `2-0-2-0`: Standard controlled tempo
- `3-1-1-0`: Tempo for strength emphasis
- `4-0-1-0`: Slow eccentric for hypertrophy
- `1-0-X-0`: Explosive concentric (X = as fast as possible)

**When to Use**:

- Hypertrophy training: Slower eccentrics (3-4 seconds)
- Strength training: Controlled but not slow (2-0-1-0)
- Power training: Explosive concentrics (1-0-X-0)
- Isometric holds: Long pauses at specific positions

### Load Configuration (ENHANCED)

Three load types are available:

#### 1. Fixed Weight

**Use Case**: When prescribing a specific weight in pounds

**Fields**:

- Weight Type: `Fixed Weight`
- Weight: Number in pounds (e.g., 135, 185, 225)

**Example**: Bench Press @ 185 lbs

#### 2. Percentage of 1RM

**Use Case**: Auto-regulated programming based on athlete's maxes

**Fields**:

- Weight Type: `% of 1RM`
- Percentage: Number between 0-100 (e.g., 75, 80, 85)

**Example**: Squat @ 85% 1RM

- If athlete's 1RM squat = 300 lbs
- Workout weight = 300 × 0.85 = 255 lbs

**Benefits**:

- Automatically adjusts as athlete's maxes improve
- Ensures appropriate relative intensity
- Prevents under/over-loading

#### 3. Bodyweight

**Use Case**: Exercises using only body weight

**Fields**:

- Weight Type: `Bodyweight`
- No additional fields needed

**Example**: Pull-ups, Push-ups, Planks

### Each Side Checkbox (NEW)

**Purpose**: Indicate exercises performed unilaterally (one side at a time)

**When Checked**:

- Reps are performed on EACH side separately
- Total reps = prescribed reps × 2 sides
- Rest between sides can be minimal or as prescribed

**Examples**:

**Bulgarian Split Squats - 3 sets × 10 reps (Each Side ✓)**

- Perform 10 reps on right leg
- Perform 10 reps on left leg
- Rest as prescribed
- Repeat for 3 total sets
- Total reps = 60 (30 per leg)

**Single-Arm Dumbbell Rows - 4 sets × 8 reps (Each Side ✓)**

- 8 reps right arm
- 8 reps left arm
- Rest
- Repeat 4 times
- Total reps = 64 (32 per arm)

**When to Use**:

- **Legs**: Bulgarian split squats, single-leg RDLs, step-ups, pistol squats
- **Arms**: Single-arm rows, single-arm press, single-arm curls
- **Core**: Side planks, oblique exercises
- Any exercise performed on one side of the body at a time

**When NOT to Use**:

- Bilateral movements (regular squats, bench press, deadlifts)
- Exercises where both sides move together
- Alternating lunges (count total reps, not per leg)

### Exercise Notes (NEW)

**Purpose**: Provide specific guidance for execution

**Field**: Multi-line text area

**What to Include**:

- **Equipment**: "Use resistance band" or "Requires TRX"
- **Cues**: "Focus on squeezing glutes at top"
- **Setup**: "Bench at 30-degree incline"
- **Modifications**: "Can substitute with goblet squat if bar unavailable"
- **Safety**: "Use spotter on final set"
- **Technique**: "Maintain neutral spine throughout"

**Examples**:

```
Bench Press Notes:
- Use spotter on heavy sets
- Bar should touch chest mid-pec
- Drive feet into ground for leg drive
```

```
Bulgarian Split Squat Notes:
- Rear foot elevated on 12-16" box
- Front knee should not pass toes
- Use dumbbells if barbell causes balance issues
```

```
Face Pulls Notes:
- Use rope attachment
- Pull to face level, not chest
- External rotation at end (hands wide)
- Focus on rear delt squeeze
```

### Rest Time

**Field**: Number in seconds

**Common Values**:

- 30-45 seconds: Conditioning circuits, light accessories
- 60-90 seconds: Accessory work, hypertrophy
- 120-180 seconds: Main compound lifts
- 240-300 seconds: Heavy singles, maximal efforts

**Auto-Calculation** (Coming Soon):

- System will suggest rest times based on:
  - Exercise type (main vs. accessory)
  - Intensity (percentage if using % of 1RM)
  - Training phase (strength vs. hypertrophy)

## Group Rest Intervals (NEW)

When creating supersets, circuits, or sections, you can now specify precise rest intervals at multiple levels:

### Rest Between Exercises

**Purpose**: Time to rest between exercises within a superset or circuit

**When to Use**:

- **Circuits**: Typically 0-15 seconds for continuous movement
- **Supersets**: Usually 0-10 seconds (just transition time)
- **Sections**: Not typically used (each exercise has its own rest)

**Examples**:

- Circuit training: 10 seconds (just enough to move to next station)
- Superset: 0 seconds (immediately start next exercise)
- Active recovery circuit: 15 seconds

### Rest Between Rounds

**Purpose**: Time to rest after completing all exercises in a group before starting the next round

**When to Use**:

- **Circuits**: 60-120 seconds between full rounds
- **Supersets**: 90-180 seconds between sets
- **Sections**: Not applicable

**Examples**:

- Conditioning circuit: 60-90 seconds (partial recovery)
- Strength superset: 120-180 seconds (fuller recovery)
- Metabolic circuit: 45-60 seconds (limited recovery)

### Rounds (Circuits Only)

**Purpose**: Number of times to repeat the entire circuit

**Typical Values**:

- Conditioning: 3-5 rounds
- Strength circuits: 2-3 rounds
- Finisher circuits: 2-4 rounds

### Example Configurations

**Strength Superset (Push/Pull)**

```
Group: Upper Body Superset
Type: Superset
Rest Between Exercises: 0 seconds (immediate transition)
Rest Between Rounds: 180 seconds (full recovery)
Exercises:
  - Bench Press: 4×8
  - Bent Over Row: 4×8
```

**Conditioning Circuit**

```
Group: Full Body Circuit
Type: Circuit
Rest Between Exercises: 10 seconds (station transition)
Rest Between Rounds: 60 seconds (partial recovery)
Rounds: 4
Exercises:
  - Burpees: 15 reps
  - Kettlebell Swings: 20 reps
  - Box Jumps: 10 reps
  - Mountain Climbers: 30 reps
```

**Accessory Superset**

```
Group: Shoulder Superset
Type: Superset
Rest Between Exercises: 0 seconds
Rest Between Rounds: 90 seconds
Exercises:
  - Lateral Raises: 3×15
  - Front Raises: 3×15
```

## Workout Block Creation Examples

### Example 1: Strength-Focused Push Day

**Block Name**: Push Day - Main Lifts (Strength Phase)

**Exercises**:

1. **Bench Press**
   - Sets: 5
   - Reps: 5
   - Tempo: 2-1-1-0
   - Load: 85% of 1RM
   - Rest: 240 seconds
   - Each Leg: ❌
   - Notes: "Use competition grip width. Spotter required on sets 4-5."

2. **Overhead Press**
   - Sets: 4
   - Reps: 6
   - Tempo: 2-0-1-0
   - Load: 80% of 1RM
   - Rest: 180 seconds
   - Each Leg: ❌
   - Notes: "Strict press - no leg drive. Keep core tight."

3. **Incline Dumbbell Press**
   - Sets: 3
   - Reps: 8
   - Tempo: 3-1-1-0
   - Load: 70 lbs (Fixed)
   - Rest: 120 seconds
   - Each Leg: ❌
   - Notes: "Bench at 30 degrees. Focus on chest stretch at bottom."

### Example 2: Hypertrophy Leg Day

**Block Name**: Leg Day - Hypertrophy Focus

**Exercises**:

1. **Back Squat**
   - Sets: 4
   - Reps: 10
   - Tempo: 3-0-1-1
   - Load: 70% of 1RM
   - Rest: 180 seconds
   - Each Leg: ❌
   - Notes: "Deep squat (below parallel). 1 second squeeze at top."

2. **Bulgarian Split Squat**
   - Sets: 3
   - Reps: 12
   - Tempo: 3-1-1-0
   - Load: 50 lbs (Fixed)
   - Rest: 90 seconds
   - Each Leg: ✅
   - Notes: "Back foot on 14-inch box. Hold dumbbells at sides."

3. **Leg Extensions**
   - Sets: 3
   - Reps: 15
   - Tempo: 2-0-2-2
   - Load: 120 lbs (Fixed)
   - Rest: 60 seconds
   - Each Leg: ❌
   - Notes: "Slow and controlled. 2-second squeeze at top."

### Example 3: Bodyweight Circuit

**Block Name**: Upper Body Bodyweight Circuit

**Exercises**:

1. **Push-ups**
   - Sets: 3
   - Reps: 15
   - Tempo: 2-0-1-0
   - Load: Bodyweight
   - Rest: 30 seconds
   - Each Leg: ❌
   - Notes: "Chest to ground on each rep. Maintain plank position."

2. **Pull-ups**
   - Sets: 3
   - Reps: 10
   - Tempo: 1-0-1-1
   - Load: Bodyweight
   - Rest: 30 seconds
   - Each Leg: ❌
   - Notes: "Full hang at bottom. Chin over bar at top."

3. **Dips**
   - Sets: 3
   - Reps: 12
   - Tempo: 2-0-1-0
   - Load: Bodyweight
   - Rest: 30 seconds
   - Each Leg: ❌
   - Notes: "Use parallel bars. Lean forward for chest emphasis."

## Best Practices

### Tempo Programming

**Beginner Athletes**:

- Use simple tempos: `2-0-2-0` or `3-0-1-0`
- Focus on control, not speed
- Avoid overly complex patterns

**Advanced Athletes**:

- Vary tempo for different training phases
- Use slow eccentrics for hypertrophy
- Incorporate pauses for strength gains

**Power Development**:

- Emphasize explosive concentrics: `1-0-X-0`
- Control the eccentric to build tension
- Short to no pauses

### Load Progression

**Percentage-Based**:

- Track 1RM updates in athlete profiles
- Percentages auto-adjust with new maxes
- Ideal for main compound lifts

**Fixed Weight**:

- Better for accessory work
- Easier for beginners to understand
- Manual progression required

**Bodyweight**:

- Add progressions in notes (e.g., "Add weight vest when reaching 15 reps")
- Track progressions over time
- Good for warm-ups and conditioning

### Unilateral Programming

**Balance Work**:

- Always prescribe same reps for each side
- Consider starting with weaker side
- Track imbalances in notes

**Volume Consideration**:

- Remember: reps are PER SIDE
- 3×10 each side = 60 total reps
- Adjust total volume accordingly

**Rest Between Sides**:

- Can rest between sides or perform continuously
- Specify in notes if important
- Default: minimal rest between sides

### Exercise Notes

**Be Specific**:

- Exact equipment names
- Precise technique cues
- Measurable progressions

**Keep It Concise**:

- Bullet points work well
- Focus on key points
- Avoid novels

**Update Regularly**:

- Add modifications as needed
- Note common errors
- Include progression criteria

## Implementation in Database

The enhanced fields are stored in the `workout_blocks` table as JSONB:

```sql
{
  "id": "ex-1",
  "exerciseId": "bench-press",
  "exerciseName": "Bench Press",
  "sets": 5,
  "reps": 5,
  "tempo": "2-1-1-0",
  "weightType": "percentage",
  "percentage": 85,
  "restTime": 240,
  "eachLeg": false,
  "notes": "Use competition grip width. Spotter required on sets 4-5.",
  "order": 1
}
```

All fields are optional except:

- `id`, `exerciseId`, `exerciseName`, `sets`, `reps`, `weightType`, `order`

## UI/UX Guidelines

### Mobile Optimization

- Large touch targets for checkboxes
- Clear labels for all fields
- Collapsible advanced options
- Save progress automatically

### Progressive Disclosure

- Basic fields visible by default
- Advanced fields (tempo, notes) expandable
- Show only relevant fields based on weight type

### Validation

- Reps must be > 0
- Sets must be > 0
- Percentage must be 0-100
- Weight must be ≥ 0
- Tempo format: X-X-X-X (optional)

## Future Enhancements

- [ ] Tempo presets dropdown (common patterns)
- [ ] Auto-calculate workout duration based on tempo + rest
- [ ] Tempo coaching videos/animations
- [ ] Smart rest time suggestions
- [ ] Exercise video library linked to exercises
- [ ] Voice cues for tempo during live workouts
- [ ] RPE (Rate of Perceived Exertion) field
- [ ] RIR (Reps in Reserve) field
- [ ] Equipment availability checking
