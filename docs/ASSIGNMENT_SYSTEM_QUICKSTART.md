# Workout Assignment System - Quick Start Guide

**For**: Development Team  
**Status**: 🔄 Planning Complete - Ready to Build  
**Priority**: 🔥 CRITICAL - Core MVP Feature

---

## 🎯 What We're Building

A complete workout assignment and tracking system that connects coaches and athletes through the training process.

### The Complete Flow

```
COACH                                    ATHLETE
  │                                        │
  ├─► 1. Create/Select Workout            │
  │                                        │
  ├─► 2. Pick Date & Time                 │
  │   • Calendar picker                   │
  │   • Time range                        │
  │   • Location                          │
  │                                        │
  ├─► 3. Select Athletes                  │
  │   • Individual athlete(s)             │
  │   • Group(s)                          │
  │   • Modifications per athlete         │
  │                                        │
  ├─► 4. Assign Workout ─────────────────► 📬 Receives Assignment
  │   • Creates assignment record         │   • Appears on calendar
  │   • Sends notification                │   • Gets notification
  │                                        │
  │                                        ├─► 5. View Workout Details
  │                                        │   • Review exercises
  │                                        │   • See target weights
  │                                        │   • Check previous performance
  │                                        │
  │                                        ├─► 6. Start Workout (Live Mode)
  │                                        │   • Record each set
  │                                        │   • Track weight/reps/RPE
  │                                        │   • Rest timer
  │                                        │   • Real-time progress
  │                                        │
  │                                        ├─► 7. Complete Workout
  │                                        │   • Session summary
  │                                        │   • Provide feedback
  │                                        │
  ├─◄ 8. Receives Completion Data ◄───────┤
  │   • View session details              │
  │   • See actual weights/reps           │
  │   • Read athlete feedback             │
  │                                        │
  ├─► 9. Respond to Feedback ─────────────► 📬 Receives Coach Response
  │   • Acknowledge completion            │
  │   • Provide guidance                  │
  │   • Adjust future workouts            │
  │                                        │
  └─► 10. Analyze & Optimize              │
      • Track athlete progress            │
      • Identify patterns                 │
      • Make programming decisions        │
```

---

## 📊 Current State vs Target State

### What Works Now ✅

- Basic group assignment modal
- Calendar display with assignments
- Database tables exist
- Some API endpoints work

### What's Missing ❌

- No date picker in assignment modal
- No individual athlete assignment
- Athletes can't see their calendar
- No workout start/complete flow
- No set recording
- No feedback system
- APIs incomplete

---

## 🚀 Build Order (4 Weeks)

### **Week 1: Enhanced Assignment System**

**Goal**: Complete assignment creation with calendar integration

**What we're building**:

1. ✨ **Date & Time Picker Component**
   - Visual calendar to pick date
   - Time range selection
   - Location field

2. ✨ **Individual Assignment Modal**
   - Select one or more athletes (not just groups)
   - Same date/time/location options
   - Preview who's receiving assignment

3. ✨ **Complete Assignment API**
   - Create, read, update, delete assignments
   - Bulk assignment support
   - Proper validation

4. ✨ **Enhanced Calendar Views**
   - **Coach Calendar**: See all assignments, edit/delete
   - **Athlete Calendar**: See personal assignments
   - Color coding by status
   - Quick actions

**Deliverable**: Coaches can assign workouts to anyone, anytime. Athletes see assignments on their calendar.

---

### **Week 2: Workout Session Experience**

**Goal**: Athletes can complete workouts and record data

**What we're building**:

1. ✨ **WorkoutView Component** (Preview Mode)
   - See workout before starting
   - Review all exercises
   - View target weights
   - See previous performance
   - **BIG "Start Workout" button**

2. ✨ **WorkoutLive Component** (Live Mode)
   - Large, touch-friendly interface
   - Record weight, reps, RPE per set
   - Automatic rest timer
   - Progress indicator
   - Exercise navigation
   - Complete/pause/abandon options

3. ✨ **Session Management API**
   - Start session
   - Record sets
   - Complete workout
   - Track duration and progress

**Deliverable**: Athletes can complete workouts in the gym with full tracking.

---

### **Week 3: Feedback Loop**

**Goal**: Athletes provide feedback, coaches see results

**What we're building**:

1. ✨ **Post-Workout Feedback Modal**
   - Difficulty rating (1-10)
   - Soreness level (1-10)
   - Energy level (1-10)
   - Text feedback (what went well, what was hard)
   - Quick skip option

2. ✨ **Feedback API**
   - Submit feedback
   - Retrieve feedback
   - Coach response

3. ✨ **Coach Feedback Dashboard**
   - See all athlete feedback
   - Filter by athlete/group/date
   - Respond to feedback
   - Identify patterns

**Deliverable**: Complete feedback loop between athletes and coaches.

---

### **Week 4: Polish & Advanced Features**

**Goal**: Enhance experience and add power features

**What we're building**:

1. ✨ **Workout History**
   - See all completed workouts
   - Track progress over time
   - Personal records

2. ✨ **Notifications**
   - Assignment notifications
   - Workout reminders
   - Completion alerts
   - Feedback responses

3. ✨ **Advanced Assignment**
   - Recurring assignments
   - Bulk reschedule
   - Assignment templates

**Deliverable**: Production-ready system with all enhancements.

---

## 🎨 Key Design Decisions

### Mobile-First (Gym Use)

- **Large touch targets**: Minimum 56px for workout mode
- **High contrast**: Easy to read in bright gym
- **Minimal scrolling**: Everything visible without hunting
- **Offline capable**: Works without internet

### Simple Workflow

- **Athletes**: Calendar → View → Start → Record → Feedback (5 steps)
- **Coaches**: Pick workout → Pick people → Pick date → Assign (4 steps)

### Smart Defaults

- Auto-suggest weights based on previous session
- Default rest times from workout plan
- Quick actions for common operations

---

## 💾 Database Structure

### Key Tables

```
workout_assignments (main assignment record)
  ├─ workout_plans (what to do)
  ├─ users (who assigned it)
  ├─ users (who receives it) via athlete_id OR
  └─ athlete_groups (who receives it) via group_id

workout_sessions (actual workout instance)
  ├─ workout_assignments (which assignment)
  ├─ users (athlete performing it)
  └─ session_exercises (exercises in session)
      └─ set_records (individual sets)
          ├─ weight (actual weight used)
          ├─ reps (actual reps completed)
          └─ rpe (rate of perceived exertion)

workout_feedback (athlete feedback)
  ├─ workout_sessions (which workout)
  ├─ users (athlete providing feedback)
  ├─ difficulty_rating (1-10)
  ├─ soreness_level (1-10)
  └─ coach_response (coach reply)
```

---

## 🔧 Technical Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context + SWR for data fetching
- **Mobile**: PWA with offline support

### Backend

- **API**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS
- **Real-time**: Supabase Realtime (optional)

### Key Patterns

```typescript
// API endpoints use auth wrappers
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    // Implementation
  });
}

// Frontend uses SWR for caching
const { assignments, refetch } = useAssignments({
  athleteId: user.id,
  date: selectedDate,
});

// State management with Context
const { session, recordSet, completeWorkout } = useWorkoutSession();
```

---

## 🧪 Testing Approach

### Must Test

- ✅ Coach assigns workout to group → All athletes see it
- ✅ Coach assigns workout to individual → Only that athlete sees it
- ✅ Athlete starts workout → Session created in database
- ✅ Athlete records set → Data saved immediately
- ✅ Athlete completes workout → Feedback modal appears
- ✅ Coach views feedback → Can see athlete's response
- ✅ Works offline → Data syncs when connection restored
- ✅ Mobile responsive → Usable on iPhone and Android

### Test Devices

- iPhone (Safari)
- Android phone (Chrome)
- iPad (Safari)
- Desktop (Chrome, Firefox)

---

## 📱 Mobile Experience Priority

### In the Gym (Live Mode)

```
┌─────────────────────────────┐
│  Exercise: Bench Press      │ ← Large, clear
│  Set 3 of 4                 │
│                             │
│  Previous: 135 lbs × 8      │ ← Context
│                             │
│  ┌─────────────────────┐   │
│  │   Weight: 135  lbs  │   │ ← Large input
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   Reps:   8         │   │
│  └─────────────────────┘   │
│                             │
│  RPE: ●●●●●●●○○○ (7/10)    │ ← Visual scale
│                             │
│  ┌─────────────────────┐   │
│  │  COMPLETE SET ✓     │   │ ← 56px tall
│  └─────────────────────┘   │
│                             │
│  Rest Timer: 2:00           │ ← Countdown
│                             │
│  [ < Prev ]    [ Next > ]  │ ← Navigation
└─────────────────────────────┘
```

---

## 🚦 Getting Started (For Developers)

### Step 1: Review Documents

1. Read this file (you are here)
2. Read full roadmap: `docs/WORKOUT_ASSIGNMENT_ROADMAP.md`
3. Review database schema: `docs/DATABASE_SCHEMA.md`

### Step 2: Set Up Environment

```bash
# Ensure you have latest dependencies
npm install

# Check TypeScript compilation
npm run typecheck

# Start dev server
npm run dev
```

### Step 3: Create Feature Branch

```bash
git checkout -b feature/workout-assignment-system
```

### Step 4: Start with Phase 1

Begin with database migration (Phase 1.1):

```bash
# Create migration file
touch database/enhance-assignments.sql

# Add feedback table and indexes
# (SQL provided in roadmap)
```

---

## ❓ FAQ

**Q: Why focus on mobile?**  
A: Athletes will be using this in the gym on their phones. Desktop is secondary for this feature.

**Q: What about offline support?**  
A: Critical for Phase 2 (WorkoutLive). Use IndexedDB + background sync.

**Q: Should feedback be required?**  
A: No, optional but encouraged. Quick skip option provided.

**Q: How do we handle group vs individual assignments?**  
A: Single `workout_assignments` table with nullable `athlete_id` and `group_id`. If `group_id` is set, it's a group assignment.

**Q: What if athlete wants to modify workout mid-session?**  
A: Allow exercise substitution and note-taking. Coach sees actual workout performed.

**Q: Real-time or polling for updates?**  
A: Polling with SWR is sufficient. Real-time optional for Phase 4.

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)

- [x] Coach can assign workout to group with date
- [ ] Coach can assign workout to individual(s) with date
- [ ] Athletes see assignments on their calendar
- [ ] Athletes can start and complete workouts
- [ ] Athletes can record sets (weight, reps, RPE)
- [ ] Athletes can provide feedback
- [ ] Coaches can view completed workouts
- [ ] Coaches can see athlete feedback
- [ ] Works on mobile devices
- [ ] Basic offline support for live mode

### Stretch Goals (Nice to Have)

- [ ] Real-time updates
- [ ] Push notifications
- [ ] Workout history graphs
- [ ] Automated weight suggestions
- [ ] Body map for soreness
- [ ] Video form checks

---

## 📞 Questions or Issues?

**During Development**:

- Check `docs/WORKOUT_ASSIGNMENT_ROADMAP.md` for detailed specs
- Review `docs/DATABASE_SCHEMA.md` for data structure
- Follow patterns in `ARCHITECTURE.md` for code style

**Blockers**:

- Document in GitHub Issues
- Tag with `workout-assignment-system`
- Include component/API route affected

---

**Ready to Build?** Start with Week 1, Phase 1.1 (Database Migration) 🚀
