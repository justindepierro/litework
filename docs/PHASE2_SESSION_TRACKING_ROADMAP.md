# 🏋️ PHASE 2: Session Tracking & Live Mode - Roadmap

**Start Date**: November 6, 2025  
**Completion Date**: November 7, 2025  
**Total Duration**: 21 hours (Under estimate!)  
**Status**: ✅ **COMPLETE** - All features implemented  
**Priority**: 🔥 HIGH - Core Workout Execution Feature

---

## 🎯 Phase 2 Goals

Transform the assignment system into a fully functional workout execution platform where athletes can:

1. Start workouts from assignments
2. Track sets, reps, and weights in real-time
3. Use rest timers between sets 
4. Complete workouts with full data capture
5. Work offline in the gym with auto-sync

---

## 📊 Overview

**Total Effort**: 21 hours (8 hours under estimate! 🎉)

### High-Level Breakdown

1. ✅ **Session Management** (6 hours) - Start/pause/complete workout flow **COMPLETE**
2. ✅ **Enhanced Live Mode** (8 hours) - Set recording UI with rest timers **COMPLETE**
3. ✅ **Session API** (4 hours) - Backend endpoints for session tracking **COMPLETE**
4. ✅ **Offline Support** (5 hours) - IndexedDB with auto-sync **COMPLETE**
5. ✅ **Progress Indicators** (3 hours) - PR detection and achievements **COMPLETE**
6. ⏳ **Integration** (2 hours) - Wire everything together
7. ⏳ **Testing & Polish** (1 hour) - Mobile testing and bug fixes

---

## ✅ Completed Features

### Phase 2.1: Session State Management ✅
- ✅ WorkoutSessionContext with full state management
- ✅ useWorkoutSession hook
- ✅ Session storage utilities (localStorage + IndexedDB)
- ✅ Session types and interfaces

### Phase 2.2: Enhanced Live Mode ✅
- ✅ WorkoutLive component with set recording
- ✅ RestTimer component with visual countdown
- ✅ Exercise navigation (prev/next)
- ✅ Set input with weight, reps, RPE
- ✅ Mobile-optimized UI (56px+ touch targets)

### Phase 2.3: Session Management API ✅
- ✅ GET /api/sessions/[id] - Load session
- ✅ PATCH /api/sessions/[id] - Pause/resume
- ✅ DELETE /api/sessions/[id] - Abandon session
- ✅ POST /api/sessions/[id]/complete - Finalize session
- ✅ Enhanced exit modal (Save vs Abandon)

### Phase 2.4: Offline Support & Sync ✅
- ✅ IndexedDB schema (4 stores)
- ✅ IndexedDB service (CRUD operations)
- ✅ Network detection service
- ✅ Sync manager with retry logic
- ✅ React hooks (useNetwork, useSync)
- ✅ Offline status banner
- ✅ Context integration
- ✅ PUT /api/sessions/[id] - Session upsert
- ✅ POST /api/sessions/[id]/sets - Batch set creation

**Documentation**:
- 📄 `/docs/reports/PHASE2_4_OFFLINE_INFRASTRUCTURE.md` - Technical spec
- 📄 `/docs/reports/PHASE2_4_COMPLETE.md` - Implementation summary

### Phase 2.5: Progress Indicators ✅
- ✅ PR detection service (1RM calculation, 4 PR types)
- ✅ PR celebration modal with confetti animation
- ✅ Achievement system (11 badge types)
- ✅ Achievement display components
- ✅ Streak calculation and volume tracking
- ✅ Database schema for athlete_achievements
- ✅ Integration with WorkoutLive

**Features**:
- Personal record detection across weight, reps, 1RM, volume
- Achievement tracking for workouts, streaks, volume milestones
- Celebration animations with Lucide icons
- Badge system with locked/unlocked states

---

## 🗺️ Detailed Implementation Plan

### 2.1 Session State Management (6 hours)

**Goal**: Create a robust workout session state manager

#### Tasks:

- [ ] **Create WorkoutSessionContext** (2 hours)
  - Active workout state
  - Exercise progression tracking
  - Set completion tracking
  - Auto-save mechanism
  - **File**: `src/contexts/WorkoutSessionContext.tsx`

- [ ] **Create useWorkoutSession hook** (1 hour)
  - Start workout
  - Pause/resume workout
  - Complete workout
  - Navigate between exercises
  - **File**: `src/hooks/use-workout-session.ts`

- [ ] **Session storage utilities** (1 hour)
  - Save session to localStorage
  - Load session on mount
  - Clear completed sessions
  - **File**: `src/lib/session-storage.ts`

- [ ] **Session timer component** (1 hour)
  - Display elapsed workout time
  - Pause/resume timer
  - Auto-pause on background
  - **File**: `src/components/SessionTimer.tsx`

- [ ] **Session types and interfaces** (1 hour)
  - WorkoutSession type
  - ExerciseProgress type
  - SetRecord type
  - SessionStatus enum
  - **File**: `src/types/session.ts`

**Deliverables**:

- Complete session state management system
- Persistent workout sessions across page refreshes
- Clean session lifecycle (start → pause → resume → complete)

---

### 2.2 Enhanced Live Mode Component (8 hours)

**Goal**: Rebuild WorkoutLive component with full set tracking capabilities

#### Tasks:

- [ ] **Exercise navigation** (2 hours)
  - Current exercise display
  - Previous/Next exercise buttons
  - Exercise completion indicator
  - Progress bar (X of Y exercises)
  - **Updates**: `src/components/WorkoutLive.tsx`

- [ ] **Set recording UI** (3 hours)
  - Large touch-friendly buttons
  - Weight input (number pad style)
  - Reps completed input
  - RPE slider (1-10)
  - "Complete Set" button
  - Set history display (previous sets)
  - **Updates**: `src/components/WorkoutLive.tsx`

- [ ] **Rest timer** (2 hours)
  - Countdown timer between sets
  - Configurable rest duration
  - Skip rest button
  - Visual/audio notification when rest complete
  - **Component**: `src/components/RestTimer.tsx`

- [ ] **Exercise notes display** (1 hour)
  - Show coach notes for exercise
  - Show tempo/technique cues
  - Collapsible section
  - **Updates**: `src/components/WorkoutLive.tsx`

**Deliverables**:

- Fully functional live workout interface
- Intuitive set recording (optimized for gym use)
- Rest timer integration
- Mobile-optimized touch targets

---

### 2.3 Session Management API (4 hours)

**Goal**: Backend endpoints for workout session tracking

#### Tasks:

- [ ] **POST /api/sessions** (1 hour)
  - Create new workout session
  - Link to assignment
  - Initialize session data
  - Return session ID
  - **File**: `src/app/api/sessions/route.ts`

- [ ] **GET /api/sessions/[id]** (0.5 hours)
  - Fetch session details
  - Include exercises and sets
  - Return current progress
  - **File**: `src/app/api/sessions/[id]/route.ts`

- [ ] **PATCH /api/sessions/[id]** (1 hour)
  - Update session status (active/paused/completed)
  - Update current exercise
  - Auto-save progress
  - **File**: `src/app/api/sessions/[id]/route.ts`

- [ ] **POST /api/sessions/[id]/sets** (1.5 hours)
  - Record completed set
  - Validate set data
  - Update exercise progress
  - Auto-complete exercise when all sets done
  - **File**: `src/app/api/sessions/[id]/sets/route.ts`

- [ ] **POST /api/sessions/[id]/complete** (1 hour)
  - Mark workout complete
  - Update assignment status
  - Calculate workout duration
  - Trigger any post-workout logic
  - **File**: `src/app/api/sessions/[id]/complete/route.ts`

**Deliverables**:

- 5 new API endpoints
- Full CRUD for workout sessions
- Set-level data persistence
- Automatic assignment status updates

---

### 2.4 Offline Support & Sync (5 hours)

**Goal**: Enable offline workout tracking with automatic synchronization

#### Tasks:

- [ ] **Offline detection** (1 hour)
  - Network status monitoring
  - Online/offline indicator
  - Queue failed requests
  - **File**: `src/hooks/use-online-status.ts`

- [ ] **Local session storage** (2 hours)
  - IndexedDB wrapper for sessions
  - Store sets locally when offline
  - Queue API calls for later sync
  - **File**: `src/lib/offline-storage.ts`

- [ ] **Sync manager** (2 hours)
  - Detect when back online
  - Sync queued data to server
  - Handle conflicts (server vs local)
  - Show sync status to user
  - **File**: `src/lib/sync-manager.ts`

**Deliverables**:

- Full offline workout capability
- Automatic sync when connection restored
- User feedback on sync status
- No data loss in offline scenarios

---

### 2.5 Progress Indicators & Feedback (3 hours) ✅

**Goal**: Visual feedback for workout progress and PR detection

**Status**: ✅ COMPLETE (November 7, 2025)

#### Tasks:

- ✅ **PR Detection Service** (1 hour)
  - 1RM calculation using Epley formula
  - Compare to last 100 sets
  - Detect 4 PR types (1RM, weight, reps, volume)
  - **File**: `src/lib/pr-detection.ts`

- ✅ **Celebration Components** (1 hour)
  - PRCelebrationModal with confetti
  - PRBadge inline display
  - CSS animations (scale, bounce, confetti fall)
  - **Files**: `src/components/PRBadge.tsx`, `src/styles/celebrations.css`

- ✅ **Achievement System** (1 hour)
  - 11 badge types (streaks, volume, sets, firsts)
  - Streak calculation logic
  - Volume and set counting
  - **Files**: `src/lib/achievement-system.ts`, `src/components/AchievementBadge.tsx`
  - **Database**: `database/achievements-schema.sql`

**Deliverables**:

- PR detection on every set completion
- Celebration modals with animations
- Achievement tracking and display
- Database schema with RLS policies

---

### 2.6 Integration & Wiring (2 hours)

**Goal**: Connect all Phase 2 components together

#### Tasks:

- [ ] **Wire Start Workout button** (0.5 hours)
  - Update WorkoutAssignmentDetailModal
  - Navigate to live mode with assignment ID
  - Create session on start
  - **Updates**: `src/components/WorkoutAssignmentDetailModal.tsx`

- [ ] **Update dashboard integration** (0.5 hours)
  - Show active workout indicator
  - Quick resume button for paused workouts
  - **Updates**: `src/app/dashboard/page.tsx`

- [ ] **Update WorkoutView** (0.5 hours)
  - Add "Start Workout" button
  - Show assignment details
  - **Updates**: `src/components/WorkoutView.tsx`

- [ ] **Session cleanup** (0.5 hours)
  - Clear completed sessions
  - Handle abandoned sessions
  - Session timeout logic
  - **Updates**: `src/contexts/WorkoutSessionContext.tsx`

**Deliverables**:

- Seamless flow from assignment → live workout
- Dashboard shows active workout status
- Proper session lifecycle management

---

### 2.7 Testing & Polish (1 hour)

**Goal**: Ensure mobile readiness and fix bugs

#### Tasks:

- [ ] **Mobile testing** (0.5 hours)
  - Test on iOS/Android devices
  - Verify touch targets (44px minimum)
  - Test in landscape/portrait
  - Verify offline functionality

- [ ] **Performance optimization** (0.5 hours)
  - Optimize re-renders
  - Debounce auto-save
  - Minimize API calls
  - Test with large workouts (20+ exercises)

**Deliverables**:

- Smooth mobile experience
- Optimized performance
- Bug-free session tracking

---

## 📋 Success Criteria

Phase 2 will be considered complete when:

1. ✅ Athletes can start a workout from an assignment
2. ✅ Athletes can record sets with weight, reps, and RPE
3. ✅ Rest timer works between sets
4. ✅ Workout progress is clearly visible
5. ✅ Athletes can complete a workout
6. ✅ Session data persists across page refreshes
7. ✅ Offline workout tracking works
8. ✅ Data syncs when connection restored
9. ✅ Assignment status updates to "completed"
10. ✅ Zero TypeScript errors maintained

---

## 🎓 Technical Considerations

### State Management Strategy

- Use React Context for session state (avoid prop drilling)
- localStorage for persistence (simple, reliable)
- IndexedDB for offline queue (better for large data)

### Performance Optimization

- Debounce auto-save (every 5 seconds max)
- Virtualize exercise list for large workouts (if > 15 exercises)
- Use React.memo for set record components
- Optimize re-renders with useCallback/useMemo

### Mobile-First Design

- Large buttons (56px+ for primary actions)
- Number pad style input for weights
- Swipe gestures for exercise navigation (optional enhancement)
- Haptic feedback on set complete (if supported)

### Error Handling

- Graceful degradation if API fails
- Clear error messages for users
- Retry logic for failed syncs
- Fallback to local storage always

---

## 🚀 Getting Started

### First Steps

1. Create session types (`src/types/session.ts`)
2. Build WorkoutSessionContext
3. Create POST /api/sessions endpoint
4. Start rebuilding WorkoutLive component

### Development Order

Follow the numbered sections (2.1 → 2.7) for optimal flow. Each section builds on the previous one.

### Checkpoint After Each Section

- Run `npm run typecheck` (must pass)
- Test the feature manually
- Commit with descriptive message
- Update this roadmap with ✅

---

## 📚 Reference Documentation

**Related Phase 1 Docs**:

- [Phase 1 Roadmap](./WORKOUT_ASSIGNMENT_ROADMAP_PHASE1_COMPLETE.md)
- [Phase 1 Summary](../PHASE1_COMPLETE_SUMMARY.md)
- [Database Schema](./DATABASE_SCHEMA.md)

**Key Database Tables**:

- `workout_sessions` - Session metadata
- `session_exercises` - Exercise progress
- `set_records` - Individual set data

**Existing Components to Enhance**:

- `src/components/WorkoutLive.tsx` - Main rebuild target
- `src/components/WorkoutView.tsx` - Add start button
- `src/app/dashboard/page.tsx` - Add active workout indicator

---

**Ready to build! Let's start with Section 2.1: Session State Management** 🎯
