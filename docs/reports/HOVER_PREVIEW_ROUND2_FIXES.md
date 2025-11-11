# Hover Preview - Additional Fixes (Round 2)

**Date:** November 10, 2025  
**Status:** Critical data mapping fixes applied

---

## 🐛 Issues Found in Testing

### 1. **Group Data Not Displaying** ⚠️ CRITICAL

**Problem:** "3 Rounds" and "4m rest" showing in workout editor but not in hover preview  
**Root Cause:** Field name mismatch between database and HoverCard interface

**Database Returns:**

```typescript
{
  type: "circuit",           // not groupType
  rounds: 3,                 // not sets
  restBetweenRounds: 240,    // not restTime (in seconds, not minutes)
  order: 0                   // not orderIndex
}
```

**HoverCard Expected:**

```typescript
{
  groupType: "circuit",
  sets: 3,
  restTime: 60,
  orderIndex: 0
}
```

**Fix Applied:**

```typescript
interface ExerciseGroup {
  id: string;
  type: string; // ✅ Changed from groupType
  rounds?: number; // ✅ Changed from sets
  restBetweenRounds?: number; // ✅ Changed from restTime
  restBetweenExercises?: number;
  order: number; // ✅ Changed from orderIndex
  name?: string;
  description?: string;
}
```

---

### 2. **Display Logic Updated**

**Sets/Rounds Display:**

```typescript
// Before (WRONG):
{group.sets && <span>{group.sets} sets</span>}

// After (CORRECT):
{group.rounds && (
  <span>
    {group.rounds} {group.type === "circuit" ? "rounds" : "sets"}
  </span>
)}
```

**Rest Time Display:**

```typescript
// Before (WRONG):
{group.restTime && <span>• {group.restTime}s rest</span>}

// After (CORRECT):
{group.restBetweenRounds && (
  <span>
    • {Math.floor(group.restBetweenRounds / 60)}m rest
  </span>
)}
```

**Type Reference:**

```typescript
// Before (WRONG):
const cfg = getGroupConfig(group.groupType);

// After (CORRECT):
const cfg = getGroupConfig(group.type);
```

---

### 3. **Scrollable Structure Section** ✅

**Added:**

- Max height: 320px
- Auto scroll when content exceeds
- Fade gradient at bottom to indicate scrollable content
- Custom scrollbar styling

```typescript
<div
  style={{
    maxHeight: "320px",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "0.25rem",
  }}
  className="custom-scrollbar"
>
  {/* Groups */}
</div>
```

---

### 4. **Improved Position Calculation** ✅

**Added:**

- ResizeObserver to detect card size changes
- Multiple position recalculations (50ms, 150ms, 300ms)
- Better viewport edge detection
- Smart positioning (flip to top if more space above)

```typescript
// Watch for card size changes (when content loads)
const resizeObserver = new ResizeObserver(() => {
  calculatePosition();
});
resizeObserver.observe(cardRef.current);

// Better edge detection
if (top + cardHeight > viewportHeight - padding) {
  const spaceAbove = triggerRect.top;
  const spaceBelow = viewportHeight - triggerRect.bottom;

  if (spaceAbove > spaceBelow && spaceAbove > cardHeight) {
    top = triggerRect.top - cardHeight - offset; // Flip to top
  }
}
```

---

### 5. **Always Show Sets** ✅

**Changed:** Display sets even if `rounds === 1`

```typescript
// Before:
{group.rounds && group.rounds > 1 && <span>...</span>}

// After:
{group.rounds && <span>...</span>}
```

---

## 📊 Data Flow Diagram

```
Database (workout_exercise_groups)
  ↓
  type: "circuit"
  rounds: 3
  restBetweenRounds: 240 (seconds)
  ↓
API Response: { workout: { groups: [...] } }
  ↓
HoverCard: Correctly maps fields
  ↓
Display: "Circuit • 3 rounds • 4m rest"
```

---

## ✅ What Now Works

1. **Group Sets/Rounds** - "3 rounds" displays correctly
2. **Rest Time** - "4m rest" displays correctly (converted from 240s)
3. **Group Type** - "Circuit", "Superset", "Section" badges
4. **Scrolling** - Large workouts scroll smoothly
5. **Positioning** - Card stays on screen, repositions correctly
6. **Visual Feedback** - Fade gradient shows more content below

---

## 🎯 Expected Display

```
┌─ CIRCUIT • 3 rounds • 4m rest ─────────┐
│ 1. Front Squats         1×4           │
│    Tempo: 3-1-1-2                     │
│ 2. Box Jumps            1×2           │
│ 3. Dumbbell Shrugs      1×8           │
│    Tempo: 1-3-1-2                     │
│ 4. Banded Lateral       1×20          │
│    Monster Walks                       │
└───────────────────────────────────────┘
```

---

## 🔧 Files Modified

1. `/src/components/ui/HoverCard.tsx`
   - Updated `ExerciseGroup` interface to match database schema
   - Fixed field references: `type`, `rounds`, `restBetweenRounds`
   - Added scrollable container with max-height
   - Improved position calculation with ResizeObserver
   - Added fade gradient for scroll indication
   - Convert rest time from seconds to minutes for display

---

## ✅ Testing Checklist

- [x] TypeScript: 0 errors
- [x] Build: Success
- [ ] Manual Test: Hover shows "3 rounds" ← **Test this!**
- [ ] Manual Test: Hover shows "4m rest" ← **Test this!**
- [ ] Manual Test: Structure section scrolls ← **Test this!**
- [ ] Manual Test: Card doesn't cut off at screen edge ← **Test this!**

---

## 🚀 Ready for Testing

All field mapping issues resolved. The hover should now display the exact same data that appears in the workout editor.

**Test by:**

1. Hover over "Monday 11/10 Football Workout" in calendar
2. Verify "Circuit • 3 rounds • 4m rest" appears
3. Verify all 4 exercises show in structure
4. Verify scrolling if workout is large
5. Verify card repositions at screen edges
