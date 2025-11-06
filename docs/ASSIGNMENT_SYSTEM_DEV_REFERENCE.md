# Workout Assignment System - Developer Quick Reference

**One-page cheat sheet for implementation**

---

## 🎯 The Goal
Coach assigns workout → Athlete sees it → Athlete completes it → Athlete gives feedback → Coach sees results

---

## 📁 Files to Create/Modify

### Week 1: Assignment System
```
CREATE:
/database/enhance-assignments.sql          (Feedback table + indexes)
/src/components/DateTimePicker.tsx         (Date & time selection)
/src/components/IndividualAssignmentModal.tsx (Assign to individuals)
/src/components/AthleteCalendar.tsx        (Athlete calendar view)
/src/components/AssignmentCard.tsx         (Assignment display card)
/src/app/api/assignments/[id]/route.ts     (Single assignment CRUD)
/src/app/api/assignments/bulk/route.ts     (Bulk operations)

MODIFY:
/src/components/GroupAssignmentModal.tsx   (Add date/time picker)
/src/components/CalendarView.tsx           (Enhance coach calendar)
/docs/DATABASE_SCHEMA.md                   (Document new schema)
```

### Week 2: Session Management
```
CREATE:
/src/app/api/sessions/route.ts                              (Create session)
/src/app/api/sessions/[id]/route.ts                        (Session CRUD)
/src/app/api/sessions/[id]/exercises/[exerciseId]/sets/route.ts (Record sets)
/src/contexts/WorkoutSessionContext.tsx                    (Session state)
/src/hooks/useWorkoutSession.ts                           (Session logic)

MODIFY:
/src/components/WorkoutView.tsx            (Full preview implementation)
/src/components/WorkoutLive.tsx            (Full live mode implementation)
```

### Week 3: Feedback System
```
CREATE:
/src/app/api/feedback/route.ts             (Submit/get feedback)
/src/app/api/feedback/[id]/route.ts        (Coach response)
/src/components/WorkoutFeedbackModal.tsx   (Post-workout feedback)
/src/components/RatingScale.tsx            (1-10 rating component)
/src/components/FeedbackList.tsx           (List of feedback)
/src/components/FeedbackCard.tsx           (Individual feedback card)
/src/components/FeedbackDetailModal.tsx    (Full feedback view)
/src/app/feedback/page.tsx                 (Coach feedback dashboard)
```

---

## 🗄️ Database Schema

### New Table: workout_feedback
```sql
CREATE TABLE workout_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID NOT NULL REFERENCES workout_sessions(id),
  athlete_id UUID NOT NULL REFERENCES users(id),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
  soreness_level INTEGER CHECK (soreness_level BETWEEN 1 AND 10),
  soreness_areas TEXT[],
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  enjoyed BOOLEAN,
  what_went_well TEXT,
  what_was_difficult TEXT,
  suggestions TEXT,
  coach_viewed BOOLEAN DEFAULT FALSE,
  coach_response TEXT,
  coach_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Enhanced Table: workout_assignments
```sql
ALTER TABLE workout_assignments
  ADD COLUMN start_time TIME,
  ADD COLUMN end_time TIME,
  ADD COLUMN location TEXT;
```

---

## 🔌 API Endpoint Patterns

### Assignments
```typescript
// CREATE
POST /api/assignments
Body: { workoutPlanId, athleteId OR groupId, scheduledDate, startTime, endTime, notes }

// READ
GET /api/assignments?athleteId=xxx&date=2025-11-06
GET /api/assignments/[id]

// UPDATE
PUT /api/assignments/[id]
Body: { scheduledDate, startTime, endTime, notes, status }

// DELETE
DELETE /api/assignments/[id]

// BULK
POST /api/assignments/bulk
Body: { assignments: [...] }
```

### Sessions
```typescript
// START SESSION
POST /api/sessions
Body: { assignmentId, workoutPlanId }
Returns: { session (with exercises copied) }

// GET SESSION
GET /api/sessions/[id]
Returns: { session, exercises, setRecords }

// RECORD SET
POST /api/sessions/[id]/exercises/[exerciseId]/sets
Body: { setNumber, reps, weight, rpe, notes }

// COMPLETE WORKOUT
PUT /api/sessions/[id]
Body: { status: "completed", completedAt: Date, notes }
```

### Feedback
```typescript
// SUBMIT FEEDBACK
POST /api/feedback
Body: { sessionId, difficultyRating, sorenessLevel, energyLevel, ... }

// GET FEEDBACK
GET /api/feedback?sessionId=xxx
GET /api/feedback?athleteId=xxx

// COACH RESPONSE
PUT /api/feedback/[id]
Body: { coachResponse, coachViewed: true }
```

---

## 🎨 Component Patterns

### Auth Wrapper (Required for all endpoints)
```typescript
// API routes
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    // Your logic here
  });
}

// For coach-only endpoints
export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    // Your logic here
  });
}
```

### Data Fetching (Frontend)
```typescript
// Use SWR hooks
import { useAssignments, useSessions } from '@/hooks/api-hooks';

function Component() {
  const { assignments, isLoading, error, refetch } = useAssignments({
    athleteId: user.id,
    date: selectedDate
  });
  
  // Use assignments...
}
```

### State Management (Workout Session)
```typescript
// Create context in WorkoutSessionContext.tsx
interface WorkoutSessionContextType {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  recordSet: (exerciseId: string, set: SetRecord) => Promise<void>;
  completeExercise: (exerciseId: string) => Promise<void>;
  completeSession: () => Promise<void>;
}

// Use in components
const { session, recordSet, completeSession } = useWorkoutSession();
```

---

## 🎨 Design Tokens

### Colors
```typescript
// Status colors
const STATUS_COLORS = {
  assigned: "bg-blue-500",
  started: "bg-yellow-500",
  completed: "bg-green-500",
  overdue: "bg-red-500",
};

// Text colors
const TEXT_COLORS = {
  primary: "text-gray-900",
  secondary: "text-gray-600",
  muted: "text-gray-400",
};
```

### Touch Targets
```css
/* Mobile workout mode */
.btn-workout {
  min-height: 56px;
  font-size: 18px;
  padding: 16px 24px;
}

/* Regular buttons */
.btn-primary {
  min-height: 44px;
  font-size: 16px;
  padding: 12px 20px;
}
```

---

## 🧪 Testing Commands

```bash
# Type checking
npm run typecheck

# Build
npm run build

# Run dev server
npm run dev

# Run tests (when implemented)
npm test

# E2E tests (when implemented)
npm run test:e2e
```

---

## 🔍 Common Queries

### Get athlete's assignments for today
```typescript
const { assignments } = useAssignments({
  athleteId: user.id,
  date: new Date().toISOString().split('T')[0]
});
```

### Get active workout session
```typescript
const { session } = useSessions({
  athleteId: user.id,
  status: 'in_progress'
});
```

### Get unread feedback count
```typescript
const { feedback } = useFeedback({
  coachId: user.id,
  coachViewed: false
});
const unreadCount = feedback.length;
```

---

## ⚡ Quick Wins

### Phase 1 Quick Wins
1. Add date picker to existing assignment modal (2h)
2. Create athlete calendar page (3h)
3. Add assignment status badges (1h)

### Phase 2 Quick Wins
1. Implement basic set recording (3h)
2. Add rest timer (2h)
3. Create completion summary (2h)

### Phase 3 Quick Wins
1. Simple feedback form (3h)
2. Feedback list view (2h)
3. Coach response functionality (2h)

---

## 🚨 Common Pitfalls

### Authentication
❌ **DON'T**: `if (user.role === "coach")`  
✅ **DO**: `if (canAssignWorkouts(user))` or use `withPermission`

### Data Fetching
❌ **DON'T**: Fetch in useEffect without cleanup  
✅ **DO**: Use SWR hooks with proper cache config

### Mobile UI
❌ **DON'T**: Use small touch targets (<44px)  
✅ **DO**: Use 56px for primary workout actions

### Database Queries
❌ **DON'T**: Loop and make individual queries  
✅ **DO**: Use batch queries and joins

### Offline Support
❌ **DON'T**: Assume network is always available  
✅ **DO**: Cache data and queue mutations

---

## 📝 Code Snippets

### Create Assignment
```typescript
const assignment = {
  workoutPlanId: selectedWorkout.id,
  workoutPlanName: selectedWorkout.name,
  assignmentType: "group" as const,
  groupId: groupId,
  athleteIds: athleteIds,
  assignedBy: user.id,
  assignedDate: new Date(),
  scheduledDate: selectedDate,
  startTime: "15:30",
  endTime: "16:30",
  status: "assigned" as const,
  notes: notes || undefined,
};

const response = await fetch('/api/assignments', {
  method: 'POST',
  body: JSON.stringify(assignment),
});
```

### Record Set
```typescript
const recordSet = async (exerciseId: string, setData: SetRecord) => {
  const response = await fetch(
    `/api/sessions/${sessionId}/exercises/${exerciseId}/sets`,
    {
      method: 'POST',
      body: JSON.stringify(setData),
    }
  );
  
  if (response.ok) {
    // Update local state
    mutate(`/api/sessions/${sessionId}`);
  }
};
```

### Submit Feedback
```typescript
const submitFeedback = async (feedback: WorkoutFeedback) => {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
      workoutSessionId: sessionId,
      difficultyRating: feedback.difficultyRating,
      sorenessLevel: feedback.sorenessLevel,
      sorenessAreas: feedback.sorenessAreas,
      energyLevel: feedback.energyLevel,
      enjoyed: feedback.enjoyed,
      whatWentWell: feedback.whatWentWell,
      whatWasDifficult: feedback.whatWasDifficult,
      suggestions: feedback.suggestions,
    }),
  });
  
  return response.json();
};
```

---

## 🎯 Success Checklist

### Phase 1 Complete When:
- [ ] Coach can select date in assignment modal
- [ ] Coach can assign to individual athletes
- [ ] Athletes see assignments on their calendar
- [ ] Assignment status shows correctly (assigned/completed/overdue)

### Phase 2 Complete When:
- [ ] Athletes can start a workout from assignment
- [ ] Athletes can record weight/reps/RPE per set
- [ ] Rest timer works automatically
- [ ] Athletes can complete workout
- [ ] Works offline with sync when online

### Phase 3 Complete When:
- [ ] Athletes see feedback modal after workout
- [ ] Athletes can submit ratings and text feedback
- [ ] Coaches see list of athlete feedback
- [ ] Coaches can respond to feedback
- [ ] Unread badge shows on coach dashboard

---

## 🔗 Key Documentation Links

- Full Roadmap: `/docs/WORKOUT_ASSIGNMENT_ROADMAP.md`
- Quick Start: `/docs/ASSIGNMENT_SYSTEM_QUICKSTART.md`
- UI Mockups: `/docs/ASSIGNMENT_SYSTEM_UI_MOCKUPS.md`
- Database Schema: `/docs/DATABASE_SCHEMA.md`
- Architecture: `/ARCHITECTURE.md`

---

**Print this page and keep it next to your monitor!** 🖨️
