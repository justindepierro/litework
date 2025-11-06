# Workout Assignment & Feedback System - Complete Roadmap

**Created**: November 6, 2025  
**Updated**: November 6, 2025  
**Status**: � In Progress - Week 1 (20% Complete)  
**Priority**: 🔥 HIGH - Core MVP Feature

---

## 📊 Progress Overview

**Overall**: 21 of 106 hours complete (~20%)  
**Current Week**: Week 1 - Assignment & Calendar (Days 4-5)  
**Next Milestone**: Calendar integration into dashboards

### ✅ Completed
- Phase 1.1: Database Enhancements (4 hours) ✅
- Phase 1.2: Assignment Modals (8 hours) ✅
- Phase 1.3: Assignment API (6 hours) ✅
- Phase 1.4: Calendar Component (3 hours) ✅

### 🔄 In Progress
- Phase 1.5: Calendar Integration (7 hours remaining)

### 📋 Upcoming
- Week 2: Session Tracking & Live Mode
- Week 3: Feedback System
- Week 4: Advanced Features & Polish

---

## 🎯 Vision

Create a comprehensive workout assignment, tracking, and feedback system where:

1. **Coaches** can easily assign workouts to individuals or groups with specific dates/times
2. **Athletes** see assigned workouts on their calendar and can interact with them in the gym
3. **Real-time tracking** of workout completion as athletes progress through exercises
4. **Feedback loop** from athletes to coaches about difficulty, soreness, and performance
5. **Data-driven insights** for both coaches and athletes to optimize training

---

## 📊 Current State Analysis

### ✅ What We Have (Updated Nov 6, 2025)

**Database Tables**:
- ✅ `workout_assignments` - Enhanced with start_time, end_time, location, notifications
- ✅ `workout_feedback` - NEW: Complete feedback system (20 columns)
- ✅ `workout_sessions` - Session tracking with status
- ✅ `session_exercises` - Individual exercise tracking
- ✅ `set_records` - Set-level data (weight, reps, RPE)
- ✅ `users` - User profiles and roles
- ✅ `athlete_groups` - Group management
- ✅ `workout_plans` - Workout templates

**Components (New & Enhanced)**:
- ✅ `AthleteCalendar` - NEW: Month/Week/Day calendar views with assignments
- ✅ `DateTimePicker` - NEW: Interactive date and time selection
- ✅ `IndividualAssignmentModal` - NEW: Assign to specific athletes
- ✅ `GroupAssignmentModal` - ENHANCED: DateTimePicker integration, location field
- ✅ `WorkoutView` - Read-only workout preview (stub)
- ✅ `WorkoutLive` - Live workout tracking (stub)
- ✅ `CalendarView` - Legacy calendar (to be replaced)

**API Routes (Complete)**:
- ✅ `/api/assignments` - GET with filters, POST with enhanced fields
- ✅ `/api/assignments/[id]` - GET, PUT, DELETE, PATCH (complete CRUD)
- ✅ `/api/assignments/bulk` - POST/DELETE bulk operations
- ✅ `/api/analytics/today-schedule` - Today's workouts
- ⚠️ Missing: Session management endpoints (Week 2)
- ⚠️ Missing: Feedback submission endpoints (Week 3)

### 🔄 In Progress

**Calendar Integration** (Week 1, Days 4-5):
1. 🔄 Integrate AthleteCalendar into Coach Dashboard
2. 🔄 Integrate AthleteCalendar into Athlete Dashboard
3. 🔄 Wire assignment modals to calendar
4. 🔄 Add assignment detail modal from calendar clicks

### ❌ What's Still Missing

**Remaining Gaps** (Weeks 2-4):
1. ❌ **Workout session flow** - Can't start/complete workouts (Week 2)
2. ❌ **Live workout tracking** - No set recording UI (Week 2)
3. ❌ **Feedback submission** - No athlete feedback UI (Week 3)
4. ❌ **Coach feedback dashboard** - Can't see athlete feedback (Week 3)
5. ❌ **Session management API** - Missing start/complete endpoints (Week 2)
6. ❌ **Notifications** - No assignment reminders (Week 4)
7. ❌ **Workout history** - No past session viewing (Week 4)

---

## 🗺️ Implementation Roadmap

### ✅ Phase 1: Enhanced Assignment System (Week 1) - IN PROGRESS
**Goal**: Complete workout assignment functionality with calendar integration

#### 1.1 Database Enhancements
**Priority**: 🔥 CRITICAL  
**Effort**: 4 hours  
**Files**: `/database/enhance-assignments.sql`

```sql
-- Add missing columns to workout_assignments
ALTER TABLE workout_assignments
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_scheduled_date 
  ON workout_assignments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_assignments_athlete_date 
  ON workout_assignments(athlete_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_assignments_group_date 
  ON workout_assignments(group_id, scheduled_date);

-- Add feedback table (Phase 3 prep)
CREATE TABLE IF NOT EXISTS workout_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Workout difficulty feedback
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  difficulty_notes TEXT,
  
  -- Physical feedback
  soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 10),
  soreness_areas TEXT[], -- Array of muscle groups
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  
  -- Qualitative feedback
  enjoyed BOOLEAN,
  what_went_well TEXT,
  what_was_difficult TEXT,
  suggestions TEXT,
  
  -- Coach visibility
  coach_viewed BOOLEAN DEFAULT FALSE,
  coach_response TEXT,
  coach_responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_session ON workout_feedback(workout_session_id);
CREATE INDEX idx_feedback_athlete ON workout_feedback(athlete_id);
CREATE INDEX idx_feedback_unviewed ON workout_feedback(coach_viewed) 
  WHERE coach_viewed = FALSE;
```

**Tasks**:
- [ ] Create migration file
- [ ] Test migration on development database
- [ ] Document new schema in DATABASE_SCHEMA.md
- [ ] Export updated schema

#### 1.2 Enhanced Assignment Modal
**Priority**: 🔥 CRITICAL  
**Effort**: 8 hours  
**Files**: 
- `src/components/GroupAssignmentModal.tsx` (enhance)
- `src/components/IndividualAssignmentModal.tsx` (new)
- `src/components/DateTimePicker.tsx` (new)

**Features to Add**:
- ✅ Multiple group selection (already exists)
- [ ] Individual athlete selection (multi-select)
- [ ] Date picker with calendar UI (not just selectedDate prop)
- [ ] Time range picker (start/end times)
- [ ] Location field (e.g., "Main Gym", "Weight Room")
- [ ] Notification preferences toggle
- [ ] Preview of who will receive the assignment
- [ ] Validation and error handling

**Component Structure**:
```typescript
// New: IndividualAssignmentModal.tsx
interface IndividualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: User[];
  workoutPlans: WorkoutPlan[];
  onAssignWorkout: (assignment: Omit<WorkoutAssignment, "id">) => void;
}

// Enhanced: DateTimePicker.tsx
interface DateTimePickerProps {
  selectedDate?: Date;
  startTime?: string;
  endTime?: string;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
}
```

**Tasks**:
- [ ] Create DateTimePicker component with calendar UI
- [ ] Create IndividualAssignmentModal component
- [ ] Enhance GroupAssignmentModal with new fields
- [ ] Add athlete multi-select dropdown
- [ ] Add validation logic
- [ ] Add loading and error states
- [ ] Test with different user roles

#### 1.3 Complete Assignment API
**Priority**: 🔥 CRITICAL  
**Effort**: 6 hours  
**Files**: 
- `src/app/api/assignments/route.ts` (enhance)
- `src/app/api/assignments/[id]/route.ts` (new)

**Endpoints to Complete**:

```typescript
// POST /api/assignments - Create new assignment
// ✅ Already exists but needs enhancement for individual athletes

// GET /api/assignments?athleteId=xxx&date=2025-11-06
// ✅ Already exists

// GET /api/assignments/[id] - Get single assignment details
// ❌ NEW ENDPOINT NEEDED
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (user) => {
    // Fetch assignment with full details
    // Include workout plan, exercises, modifications
  });
}

// PUT /api/assignments/[id] - Update assignment
// ❌ NEW ENDPOINT NEEDED
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(request, "assign-workouts", async (user) => {
    // Update assignment (reschedule, modify notes, etc.)
  });
}

// DELETE /api/assignments/[id] - Delete/cancel assignment
// ❌ NEW ENDPOINT NEEDED
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withPermission(request, "assign-workouts", async (user) => {
    // Soft delete or cancel assignment
  });
}

// POST /api/assignments/bulk - Bulk assignment operations
// ❌ NEW ENDPOINT NEEDED
export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    // Create multiple assignments at once
    // Useful for weekly scheduling
  });
}
```

**Tasks**:
- [ ] Implement GET /api/assignments/[id]
- [ ] Implement PUT /api/assignments/[id]
- [ ] Implement DELETE /api/assignments/[id]
- [ ] Implement POST /api/assignments/bulk
- [ ] Add proper error handling
- [ ] Add request validation
- [ ] Add RLS policy checks
- [ ] Test with Postman/Thunder Client
- [ ] Document endpoints in API docs

#### 1.4 Calendar Integration
**Priority**: 🔥 CRITICAL  
**Effort**: 10 hours  
**Files**: 
- `src/components/CalendarView.tsx` (enhance)
- `src/components/AthleteCalendar.tsx` (new)
- `src/components/AssignmentCard.tsx` (new)

**Enhancements Needed**:

**Coach Calendar** (`CalendarView.tsx`):
- ✅ Month view with assignments (exists)
- [ ] Day view with detailed timeline
- [ ] Week view option
- [ ] Filter by group/athlete
- [ ] Color coding by workout type
- [ ] Drag-and-drop to reschedule
- [ ] Quick actions (edit, delete, duplicate)
- [ ] Assignment density indicators

**Athlete Calendar** (`AthleteCalendar.tsx` - NEW):
- [ ] Month view showing assigned workouts
- [ ] Day view with workout details
- [ ] Status indicators (pending, completed, overdue)
- [ ] Quick start workout button
- [ ] Workout preview modal
- [ ] Notification badges for new assignments
- [ ] Filter by completed/pending

**Assignment Card** (`AssignmentCard.tsx` - NEW):
```typescript
interface AssignmentCardProps {
  assignment: WorkoutAssignment;
  workout: WorkoutPlan;
  viewMode: "coach" | "athlete";
  onStart?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Tasks**:
- [ ] Create AthleteCalendar component
- [ ] Create AssignmentCard component
- [ ] Enhance CalendarView with timeline view
- [ ] Add drag-and-drop functionality
- [ ] Implement status filtering
- [ ] Add color-coding system
- [ ] Create assignment detail modal
- [ ] Add loading skeletons
- [ ] Test responsive design
- [ ] Test on mobile devices

---

### Phase 2: Workout Session Management (Week 2)
**Goal**: Complete athlete workout experience from start to finish

#### 2.1 Session API Endpoints
**Priority**: 🔥 CRITICAL  
**Effort**: 8 hours  
**Files**: 
- `src/app/api/sessions/route.ts` (new)
- `src/app/api/sessions/[id]/route.ts` (new)
- `src/app/api/sessions/[id]/exercises/route.ts` (new)
- `src/app/api/sessions/[id]/exercises/[exerciseId]/sets/route.ts` (new)

**Endpoints to Create**:

```typescript
// POST /api/sessions - Start a new workout session
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    const { assignmentId, workoutPlanId } = await request.json();
    
    // Create new workout_session record
    // Copy exercises from workout plan to session_exercises
    // Set status to "in_progress"
    // Return session with full exercise data
  });
}

// GET /api/sessions/[id] - Get session details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (user) => {
    // Fetch session with exercises and set records
    // Include progress percentage calculation
  });
}

// PUT /api/sessions/[id] - Update session (notes, complete, etc.)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(request, async (user) => {
    const updates = await request.json();
    
    // Update session fields
    // If completing, calculate duration and final stats
  });
}

// POST /api/sessions/[id]/exercises/[exerciseId]/sets - Record a set
export async function POST(request: NextRequest, { params }) {
  return withAuth(request, async (user) => {
    const { setNumber, reps, weight, rpe, notes } = await request.json();
    
    // Create or update set_record
    // Update session progress
    // Return updated session state
  });
}

// PUT /api/sessions/[id]/exercises/[exerciseId] - Update exercise in session
export async function PUT(request: NextRequest, { params }) {
  return withAuth(request, async (user) => {
    const { completed, notes, substitutedExerciseId } = await request.json();
    
    // Update session_exercise
    // Handle exercise substitutions
  });
}
```

**Tasks**:
- [ ] Implement POST /api/sessions
- [ ] Implement GET /api/sessions/[id]
- [ ] Implement PUT /api/sessions/[id]
- [ ] Implement set recording endpoint
- [ ] Implement exercise update endpoint
- [ ] Add transaction handling for data consistency
- [ ] Add progress calculation logic
- [ ] Test concurrent updates (multiple sets)
- [ ] Document endpoints

#### 2.2 Enhanced WorkoutView Component
**Priority**: 🔥 CRITICAL  
**Effort**: 6 hours  
**Files**: `src/components/WorkoutView.tsx`

**Current State**: Stub with no functionality  
**Target State**: Full workout preview with start capability

**Features to Implement**:
- [ ] Load workout from assignment
- [ ] Display all exercises with details
- [ ] Show exercise groups (supersets, circuits)
- [ ] Display target weights and suggested weights
- [ ] Show exercise instructions and form tips
- [ ] Start workout button → navigates to live mode
- [ ] Exercise substitution option
- [ ] View workout history/previous performance
- [ ] Mobile-optimized layout

**Component Structure**:
```typescript
interface WorkoutViewProps {
  assignmentId: string;
  workoutPlan: WorkoutPlan;
  onStartWorkout: (sessionId: string) => void;
}

// Sub-components
- ExerciseCard (display exercise details)
- ExerciseGroupCard (display supersets/circuits)
- PreviousPerformance (show last time athlete did this)
- StartWorkoutButton (prominent CTA)
```

**Tasks**:
- [ ] Implement data fetching from API
- [ ] Create exercise display components
- [ ] Add previous performance lookup
- [ ] Implement start workout flow
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test on mobile devices
- [ ] Add accessibility features

#### 2.3 Enhanced WorkoutLive Component
**Priority**: 🔥 CRITICAL  
**Effort**: 12 hours  
**Files**: `src/components/WorkoutLive.tsx`

**Current State**: Stub with basic structure  
**Target State**: Full live workout tracking experience

**Core Features**:
1. **Exercise Navigation**
   - [ ] Current exercise display (large, touch-friendly)
   - [ ] Progress bar showing workout completion
   - [ ] Next/previous exercise buttons
   - [ ] Exercise list sidebar (collapsible)

2. **Set Recording**
   - [ ] Large weight/reps input (optimized for gym use)
   - [ ] Quick increment buttons (+5, +10, +45 lbs)
   - [ ] RPE scale (1-10) with visual indicators
   - [ ] Complete set button (large touch target)
   - [ ] Set history display
   - [ ] Auto-suggest weights based on previous session

3. **Rest Timer**
   - [ ] Automatic rest timer after completing set
   - [ ] Customizable rest duration
   - [ ] Skip rest button
   - [ ] Audio notification when rest complete
   - [ ] Background timer (works when phone locked)

4. **Exercise Management**
   - [ ] Mark exercise as complete
   - [ ] Skip exercise with reason
   - [ ] Substitute exercise
   - [ ] Add notes to exercise
   - [ ] View form tips/instructions

5. **Session Control**
   - [ ] Pause workout
   - [ ] Resume workout
   - [ ] Complete workout (with confirmation)
   - [ ] Abandon workout (with confirmation)
   - [ ] Session duration tracking

**Mobile Optimization**:
- 56px minimum touch targets
- Large, readable fonts (18px+)
- High contrast colors
- Minimal scrolling required
- Works offline (PWA)
- Portrait and landscape support

**Component Structure**:
```typescript
interface WorkoutLiveProps {
  sessionId: string;
}

// Sub-components needed:
- ExerciseDisplay (current exercise with details)
- SetRecorder (weight/reps input)
- RestTimer (countdown timer)
- ExerciseList (sidebar navigation)
- ProgressBar (workout progress)
- SessionControls (pause, complete, abandon)
- CompletionModal (end of workout feedback)
```

**Tasks**:
- [ ] Implement session state management (useWorkoutSession hook)
- [ ] Create set recording UI
- [ ] Implement rest timer with audio
- [ ] Add exercise navigation
- [ ] Create progress tracking
- [ ] Implement offline mode with sync
- [ ] Add PWA notifications
- [ ] Test on iOS and Android
- [ ] Test with real workout scenarios
- [ ] Add keyboard shortcuts for desktop

---

### Phase 3: Feedback System (Week 3)
**Goal**: Enable athlete-to-coach communication and performance feedback

#### 3.1 Feedback Database & API
**Priority**: 🟡 MEDIUM  
**Effort**: 6 hours  
**Files**: 
- `/database/enhance-assignments.sql` (already includes feedback table)
- `src/app/api/feedback/route.ts` (new)
- `src/app/api/feedback/[id]/route.ts` (new)

**Endpoints to Create**:

```typescript
// POST /api/feedback - Submit workout feedback
export async function POST(request: NextRequest) {
  return withAuth(request, async (user) => {
    const feedback = await request.json();
    
    // Create feedback record
    // Link to workout_session
    // Send notification to coach (optional)
    // Return created feedback
  });
}

// GET /api/feedback?sessionId=xxx - Get feedback for session
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    // Fetch feedback by session or athlete
  });
}

// PUT /api/feedback/[id] - Coach response to feedback
export async function PUT(request: NextRequest, { params }) {
  return withPermission(request, "view-all-athletes", async (user) => {
    // Add coach response
    // Mark as viewed
    // Send notification to athlete
  });
}
```

**Tasks**:
- [ ] Implement POST /api/feedback
- [ ] Implement GET /api/feedback
- [ ] Implement PUT /api/feedback/[id]
- [ ] Add validation for feedback data
- [ ] Test feedback submission flow
- [ ] Document endpoints

#### 3.2 Post-Workout Feedback Modal
**Priority**: 🟡 MEDIUM  
**Effort**: 8 hours  
**Files**: 
- `src/components/WorkoutFeedbackModal.tsx` (new)
- `src/components/RatingScale.tsx` (new)
- `src/components/SorenessMap.tsx` (new)

**Features**:
1. **Difficulty Rating**
   - Scale: 1-10 (Too Easy → Way Too Hard)
   - Visual indicators (emojis or icons)
   - Optional notes

2. **Soreness Tracking**
   - Body map (click muscle groups)
   - Soreness level per muscle group (1-10)
   - Expected vs unexpected soreness

3. **Energy Level**
   - Scale: 1-10 (Exhausted → Energized)
   - Time of day consideration

4. **Qualitative Feedback**
   - What went well? (text area)
   - What was difficult? (text area)
   - Suggestions for coach (text area)
   - Enjoyed this workout? (yes/no/neutral)

5. **Quick Feedback Option**
   - "Skip detailed feedback" button
   - Minimum: difficulty rating only
   - Full feedback encouraged but not required

**Component Structure**:
```typescript
interface WorkoutFeedbackModalProps {
  isOpen: boolean;
  sessionId: string;
  workoutName: string;
  onSubmit: (feedback: WorkoutFeedback) => Promise<void>;
  onSkip: () => void;
}

interface WorkoutFeedback {
  workoutSessionId: string;
  difficultyRating: number;
  difficultyNotes?: string;
  sorenessLevel: number;
  sorenessAreas?: string[];
  energyLevel: number;
  enjoyed?: boolean;
  whatWentWell?: string;
  whatWasDifficult?: string;
  suggestions?: string;
}
```

**Tasks**:
- [ ] Create WorkoutFeedbackModal component
- [ ] Create RatingScale component
- [ ] Create SorenessMap component (optional v1, simple list v0)
- [ ] Add form validation
- [ ] Add submission handling
- [ ] Add loading and success states
- [ ] Test on mobile
- [ ] Add skip functionality

#### 3.3 Coach Feedback Dashboard
**Priority**: 🟡 MEDIUM  
**Effort**: 10 hours  
**Files**: 
- `src/app/feedback/page.tsx` (new)
- `src/components/FeedbackList.tsx` (new)
- `src/components/FeedbackCard.tsx` (new)
- `src/components/FeedbackDetailModal.tsx` (new)

**Features**:
1. **Feedback Overview**
   - List of recent feedback (unread first)
   - Filter by athlete, group, date range
   - Search by workout name
   - Badge showing unread count

2. **Feedback Cards**
   - Athlete name and photo
   - Workout name and date
   - Difficulty rating (visual)
   - Soreness level
   - Quick preview of text feedback
   - Responded/Unread status

3. **Feedback Detail View**
   - Full feedback display
   - Athlete's workout performance data
   - Historical feedback comparison
   - Coach response form
   - Mark as viewed

4. **Analytics** (Phase 4)
   - Average difficulty by workout
   - Soreness patterns
   - Athlete sentiment trends

**Component Structure**:
```typescript
interface FeedbackDashboardProps {
  // Loaded via API
}

interface FeedbackCardProps {
  feedback: WorkoutFeedback;
  athlete: User;
  workout: WorkoutPlan;
  onClick: () => void;
}

interface FeedbackDetailModalProps {
  feedback: WorkoutFeedback;
  session: WorkoutSession;
  athlete: User;
  onRespond: (response: string) => void;
  onClose: () => void;
}
```

**Tasks**:
- [ ] Create /feedback page route
- [ ] Create FeedbackList component
- [ ] Create FeedbackCard component
- [ ] Create FeedbackDetailModal component
- [ ] Implement filtering and search
- [ ] Add coach response functionality
- [ ] Add unread badge to navigation
- [ ] Test with multiple athletes
- [ ] Add mobile responsiveness

---

### Phase 4: Enhanced Features & Polish (Week 4)
**Goal**: Add advanced features and optimize user experience

#### 4.1 Workout History & Analytics
**Priority**: 🟢 LOW  
**Effort**: 8 hours  

**Features**:
- Athlete workout history page
- Exercise performance trends
- Personal records tracking
- Volume/intensity graphs
- Comparison with previous sessions

#### 4.2 Notifications System
**Priority**: 🟢 LOW  
**Effort**: 6 hours  

**Features**:
- Push notifications for new assignments
- Reminder notifications before workouts
- Completion notifications to coaches
- Feedback response notifications
- Weekly summary emails

#### 4.3 Advanced Assignment Features
**Priority**: 🟢 LOW  
**Effort**: 6 hours  

**Features**:
- Recurring assignments (weekly patterns)
- Assignment templates
- Bulk reschedule
- Assignment history
- Duplicate assignment

#### 4.4 Progressive Overload Suggestions
**Priority**: 🟢 LOW  
**Effort**: 8 hours  

**Features**:
- Auto-suggest weight increases
- Rep progression tracking
- Deload week detection
- Plateau identification
- Smart programming recommendations

---

## 🎨 UI/UX Specifications

### Mobile-First Design Principles

**Touch Targets**:
- Minimum 44px (iOS) / 48px (Android)
- Live mode: 56px+ for primary actions
- Adequate spacing between targets (12px+)

**Typography**:
```css
/* Mobile base (gym environment - needs to be larger) */
.workout-live {
  --text-base: 18px;    /* Normal text */
  --text-lg: 20px;      /* Exercise names */
  --text-xl: 24px;      /* Current set info */
  --text-2xl: 32px;     /* Weight display */
  --text-3xl: 48px;     /* Timer countdown */
}
```

**Color Coding**:
- 🔵 Assigned (Blue) - `--color-primary`
- 🟡 In Progress (Yellow) - `--color-warning`
- 🟢 Completed (Green) - `--color-success`
- 🔴 Overdue (Red) - `--color-error`
- ⚪ Skipped (Gray) - `--color-gray-400`

**Status Indicators**:
```typescript
const statusConfig = {
  assigned: { color: "blue", icon: "Calendar", text: "Assigned" },
  started: { color: "yellow", icon: "Dumbbell", text: "In Progress" },
  completed: { color: "green", icon: "CheckCircle", text: "Completed" },
  overdue: { color: "red", icon: "AlertCircle", text: "Overdue" },
};
```

### Responsive Breakpoints

```typescript
// Mobile first approach
const breakpoints = {
  sm: "640px",   // Large phones
  md: "768px",   // Tablets
  lg: "1024px",  // Desktop
  xl: "1280px",  // Large desktop
};

// Calendar views
// Mobile: Month view only (single column)
// Tablet: Month + day view (side by side)
// Desktop: Month + week + day views
```

---

## 🔧 Technical Implementation Details

### State Management

**Workout Session State** (use React Context):
```typescript
interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  
  // Actions
  startSession: (assignmentId: string) => Promise<void>;
  recordSet: (exerciseId: string, set: SetRecord) => Promise<void>;
  completeExercise: (exerciseId: string) => Promise<void>;
  skipExercise: (exerciseId: string, reason: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => Promise<void>;
  abandonSession: (reason: string) => Promise<void>;
  
  // Utilities
  getProgressPercentage: () => number;
  getElapsedTime: () => number;
  getEstimatedTimeRemaining: () => number;
}
```

### Offline Support (PWA)

**Strategy**:
1. Cache workout data when assignment is opened
2. Allow set recording offline (local storage)
3. Sync when connection restored
4. Show sync status indicator
5. Handle conflicts gracefully

**Implementation**:
```typescript
// Use IndexedDB for offline storage
interface OfflineData {
  sessions: WorkoutSession[];
  pendingSetRecords: SetRecord[];
  pendingFeedback: WorkoutFeedback[];
  lastSyncAt: Date;
}

// Sync strategy
const syncOfflineData = async () => {
  // 1. Upload pending set records
  // 2. Upload pending feedback
  // 3. Download new assignments
  // 4. Update last sync timestamp
};
```

### Real-time Updates (Optional v2)

**Use Supabase Realtime**:
- Coach sees live progress as athletes complete sets
- Athletes see assignment updates immediately
- Real-time feedback notifications

```typescript
// Subscribe to session updates
supabase
  .channel('workout-sessions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'workout_sessions',
    filter: `athlete_id=eq.${userId}`
  }, (payload) => {
    // Update UI with new data
  })
  .subscribe();
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] API endpoint tests (assignments, sessions, feedback)
- [ ] Component rendering tests
- [ ] Utility function tests (calculations, formatters)
- [ ] State management tests

### Integration Tests
- [ ] Assignment creation flow (coach perspective)
- [ ] Workout session flow (athlete perspective)
- [ ] Feedback submission and response flow
- [ ] Calendar synchronization

### E2E Tests (Playwright)
- [ ] Complete coach workflow: Create workout → Assign → View completion
- [ ] Complete athlete workflow: View assignment → Start workout → Record sets → Submit feedback
- [ ] Mobile device testing (iOS Safari, Android Chrome)
- [ ] Offline mode testing
- [ ] Multi-user testing (concurrent sessions)

### Manual Testing Checklist
- [ ] Test on iPhone (Safari)
- [ ] Test on Android phone (Chrome)
- [ ] Test on iPad
- [ ] Test with slow network
- [ ] Test with no network (offline)
- [ ] Test with 10+ assignments on calendar
- [ ] Test with 20+ exercise workout
- [ ] Test concurrent coach/athlete actions
- [ ] Test permissions (athlete can't see coach features)

---

## 📝 Documentation Requirements

### For Developers
- [ ] Update DATABASE_SCHEMA.md with new tables/columns
- [ ] Document new API endpoints (OpenAPI/Swagger)
- [ ] Update ARCHITECTURE.md with new patterns
- [ ] Create component documentation (Storybook?)
- [ ] Update PROJECT_STRUCTURE.md

### For Users
- [ ] Coach guide: "How to assign workouts"
- [ ] Athlete guide: "How to complete a workout"
- [ ] Coach guide: "Understanding athlete feedback"
- [ ] Athlete guide: "Providing workout feedback"
- [ ] Troubleshooting guide

---

## ⚡ Performance Considerations

### Optimization Targets
- [ ] Calendar page load: < 2 seconds
- [ ] Assignment creation: < 1 second
- [ ] Set recording: < 500ms
- [ ] Session sync: < 2 seconds
- [ ] Mobile PWA install: < 5 seconds

### Optimization Strategies
1. **Lazy Loading**: Load modals and heavy components only when needed
2. **Pagination**: Limit calendar to current month + 1 month buffer
3. **Caching**: Aggressive caching with SWR (60s cache for assignments)
4. **Image Optimization**: Use Next.js Image component
5. **Code Splitting**: Split by route and component
6. **Database Indexes**: Ensure all queries use indexes
7. **API Response Size**: Only return needed fields

---

## 🚀 Deployment Strategy

### Phase 1 Deployment (Week 1)
- Deploy database migrations
- Deploy enhanced assignment API
- Deploy enhanced calendar UI
- Feature flag: `ENABLE_ENHANCED_ASSIGNMENTS=true`

### Phase 2 Deployment (Week 2)
- Deploy session management API
- Deploy WorkoutView and WorkoutLive
- Feature flag: `ENABLE_LIVE_WORKOUTS=true`

### Phase 3 Deployment (Week 3)
- Deploy feedback system
- Deploy coach feedback dashboard
- Feature flag: `ENABLE_FEEDBACK_SYSTEM=true`

### Phase 4 Deployment (Week 4)
- Deploy analytics and advanced features
- Remove all feature flags
- Full production release

---

## 🎯 Success Metrics

### Quantitative Metrics
- **Assignment Success Rate**: % of assignments completed on time
- **Feedback Response Rate**: % of athletes providing feedback
- **Coach Response Rate**: % of feedback responded to by coaches
- **Session Completion Rate**: % of started workouts that are completed
- **Average Time to Assign**: Time from opening modal to assignment created
- **Mobile Usage**: % of workouts completed on mobile devices

### Qualitative Metrics
- User satisfaction surveys (1-10 scale)
- Feature request feedback
- Bug reports and severity
- Support ticket volume

### Target KPIs (MVP)
- ✅ 80%+ assignment completion rate
- ✅ 60%+ feedback submission rate
- ✅ 90%+ session completion rate (once started)
- ✅ < 30s average time to create assignment
- ✅ 70%+ mobile usage for live workouts
- ✅ 4.5+ star user satisfaction

---

## 🔐 Security Considerations

### Authentication & Authorization
- [ ] Verify assignment ownership before viewing
- [ ] Verify session ownership before recording sets
- [ ] Coaches can only assign to their groups
- [ ] Athletes can only see their own assignments
- [ ] Admins have full visibility (audit log)

### Data Privacy
- [ ] Feedback only visible to athlete and their coaches
- [ ] Performance data only visible to athlete and coaches
- [ ] Group assignments respect group membership
- [ ] RLS policies on all new tables

### API Security
- [ ] Rate limiting on assignment creation (prevent spam)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize text inputs)

---

## 🐛 Known Issues & Risks

### Technical Risks
1. **Offline Sync Conflicts**: What if athlete records sets offline and coach modifies assignment?
   - **Mitigation**: Timestamp-based conflict resolution, notify user of conflicts
   
2. **Performance with Large Groups**: 100+ athlete group assignments may be slow
   - **Mitigation**: Background job processing for bulk assignments
   
3. **Real-time Updates**: Supabase Realtime has connection limits
   - **Mitigation**: Use polling for non-critical updates, prioritize real-time for active sessions

### User Experience Risks
1. **Feedback Fatigue**: Athletes may not want to provide feedback after every workout
   - **Mitigation**: Make it optional but easy, use quick feedback option
   
2. **Calendar Clutter**: Too many assignments on one day may overwhelm UI
   - **Mitigation**: Collapsible views, summary mode, density controls

3. **Mobile Keyboard Issues**: iOS keyboard may obscure inputs in live mode
   - **Mitigation**: Use `scrollIntoView` and `inputmode` attributes

---

## 📅 Timeline Summary

| Week | Phase | Deliverables | Effort |
|------|-------|--------------|---------|
| 1 | Assignment System | Enhanced modals, complete API, calendar integration | 28 hours |
| 2 | Session Management | WorkoutView, WorkoutLive, session API | 26 hours |
| 3 | Feedback System | Feedback modal, API, coach dashboard | 24 hours |
| 4 | Polish & Analytics | History, notifications, advanced features | 28 hours |

**Total Estimated Effort**: 106 hours (~3 weeks full-time)

---

## 🎬 Next Steps

### Immediate Actions (Start Now)
1. ✅ Review and approve this roadmap
2. [ ] Set up feature flags in environment variables
3. [ ] Create GitHub project board with tasks
4. [ ] Create database migration for feedback table
5. [ ] Start Phase 1.2: Enhanced Assignment Modal

### This Week (Week 1)
- Complete Phase 1.1 (Database)
- Complete Phase 1.2 (Modals)
- Start Phase 1.3 (API)

### Questions to Resolve
1. Do we want real-time updates or polling for session progress?
2. Should feedback be required or optional after workouts?
3. Do we need a body map for soreness tracking in v1?
4. Should we support video recording for form checks? (Future phase?)
5. Do we want automated reminders before workouts?

---

**Last Updated**: November 6, 2025  
**Next Review**: After Phase 1 completion  
**Owner**: Development Team  
**Stakeholders**: Coaches, Athletes, Admin
