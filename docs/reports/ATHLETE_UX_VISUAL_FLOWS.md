# Athlete Experience - Visual Flow Diagrams

**Companion to: ATHLETE_UX_AUDIT_2025.md**

---

## 🎨 Current User Flow (ASCII Diagrams)

### Complete Athlete Journey

```
                    ┌─────────────────────────────────────────┐
                    │         ATHLETE LANDS ON APP            │
                    └─────────────┬───────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────────────┐
                    │   LOGIN / AUTHENTICATION                │
                    │   ────────────────────────              │
                    │   • Email + Password                    │
                    │   • Remember me checkbox                │
                    │   • Supabase auth                       │
                    │                                         │
                    │   ⭐ Score: 6/10                        │
                    │   ❌ Missing: Social login              │
                    │   ❌ Missing: Biometric auth            │
                    └─────────────┬───────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────┴─────────────────────────┐
        │                                                     │
        │                   DASHBOARD                         │
        │              (Athlete Home Screen)                  │
        │                                                     │
        │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
        │   ┃  Glass Header (Gradient Accent Bar)        ┃   │
        │   ┃  Hi, Justin! 👋              [Profile]    ┃   │
        │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
        │                                                     │
        │   📊 TODAY'S WORKOUTS                              │
        │   ┌──────────────────────────────────────────┐    │
        │   │ 🏋️ Upper Body Strength                  │    │
        │   │ ⏰ 3:00 PM - 4:30 PM                     │    │
        │   │ 📍 Main Gym                              │    │
        │   │                                          │    │
        │   │ [START WORKOUT] ◄─── Large Touch Target │    │
        │   └──────────────────────────────────────────┘    │
        │                                                     │
        │   ⭐ Score: 8/10                                   │
        │   ❌ Missing: Quick stats widget                  │
        │   ❌ Missing: Recent workouts preview             │
        │   ❌ Missing: Upcoming schedule                   │
        │                                                     │
        └─────────────┬───────────────────────────┬──────────┘
                      │                           │
                      │                           │
          ┌───────────▼─────────┐     ┌──────────▼──────────┐
          │  Navigation Options │     │   Start Workout     │
          │  ─────────────────  │     │   Clicked           │
          │  • History          │     └──────────┬──────────┘
          │  • Progress         │                │
          │  • Profile          │                ▼
          │  • Schedule         │     ┌────────────────────┐
          └─────────────────────┘     │  WORKOUT VIEW      │
                                      │  (Pre-Workout)     │
                                      └────────┬───────────┘
                                               │
                                               │
        ┌──────────────────────────────────────▼─────────────────────────────────┐
        │                                                                          │
        │                          WORKOUT VIEW                                   │
        │                        (Review & Prepare)                               │
        │                                                                          │
        │   ╔════════════════════════════════════════════════════════════╗        │
        │   ║  🏋️ UPPER BODY STRENGTH                                   ║        │
        │   ║  Push Day - Chest & Triceps Focus                        ║        │
        │   ║                                                            ║        │
        │   ║  📅 Nov 23  ⏱️ ~45min  🎯 8 exercises                    ║        │
        │   ╚════════════════════════════════════════════════════════════╝        │
        │                                                                          │
        │   [START LIVE WORKOUT] ◄─── Big Green Button                           │
        │                                                                          │
        │   ┌────────────────────────────────────────────────────────┐           │
        │   │ 📦 BEFORE YOU START                                    │           │
        │   │                                                        │           │
        │   │ Equipment Needed:                                      │           │
        │   │ [Barbell] [Bench] [Dumbbells] [Rack]                 │           │
        │   │                                                        │           │
        │   │ ❓ Difficulty: ⭐⭐⭐ Intermediate                     │           │
        │   └────────────────────────────────────────────────────────┘           │
        │                                                                          │
        │   Exercise Cards (scrollable list):                                     │
        │   ┌────────────────────────────────────────────────────────┐           │
        │   │ 1️⃣ Barbell Bench Press                                │           │
        │   │ 4 sets × 8 reps @ 185 lbs                            │           │
        │   │ 💡 Coach: "Focus on bar path and elbow angle"        │           │
        │   │ 🎥 [View Form Video]                                  │           │
        │   └────────────────────────────────────────────────────────┘           │
        │   ┌────────────────────────────────────────────────────────┐           │
        │   │ 2️⃣ Incline Dumbbell Press                             │           │
        │   │ 3 sets × 10 reps @ 60 lbs each                       │           │
        │   └────────────────────────────────────────────────────────┘           │
        │                                                                          │
        │   ⭐ Score: 7.5/10                                                      │
        │   ✅ Good: Clear layout, coach notes, video links                       │
        │   ❌ Missing: Warmup section, time estimates, visual timeline           │
        │                                                                          │
        └──────────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       │ User clicks "Start Live Workout"
                                       │
                                       ▼
        ┌─────────────────────────────────────────────────────────────────────┐
        │                                                                       │
        │                      WORKOUT LIVE MODE                                │
        │                    (Active Workout Session)                           │
        │                  ⭐ BEST FEATURE OF THE APP! ⭐                       │
        │                                                                       │
        │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
        │   ┃ Fixed Header (Always Visible)                              ┃   │
        │   ┃ ⏱️ 18:34 │ 3/8 exercises │ ☰ Menu                         ┃   │
        │   ┃ ▓▓▓▓▓▓░░░░░░░░░ 37% Progress                             ┃   │
        │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
        │                                                                       │
        │   ┌─────────────────────────────────────────────────────┐           │
        │   │ SCROLLABLE EXERCISE LIST                            │           │
        │   │                                                      │           │
        │   │ [✓ Completed (2 exercises)] ◄─── Auto-collapsed    │           │
        │   │                                                      │           │
        │   │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │           │
        │   │ ┃ 🔴 ACTIVE NOW                                 ┃  │           │
        │   │ ┃                                               ┃  │           │
        │   │ ┃ Barbell Bench Press                          ┃  │           │
        │   │ ┃ 4 × 8 @ 185 lbs │ Rest: 90s                 ┃  │           │
        │   │ ┃                                               ┃  │           │
        │   │ ┃ 💡 Keep elbows at 45° angle                  ┃  │           │
        │   │ ┃                                               ┃  │           │
        │   │ ┃ Last set: 185 lbs × 8 reps                   ┃  │           │
        │   │ ┃                                               ┃  │           │
        │   │ ┃ Sets completed: ✓ ✓ ⭕ ⭕                     ┃  │           │
        │   │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │           │
        │   │                                                      │           │
        │   │ Pending Exercises (dimmed):                          │           │
        │   │ ○ Incline DB Press (3×10)                           │           │
        │   │ ○ Cable Flyes (3×12)                                │           │
        │   │ ○ Tricep Pushdowns (3×15)                           │           │
        │   │                                                      │           │
        │   └─────────────────────────────────────────────────────┘           │
        │                                                                       │
        │   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
        │   ┃ Fixed Input Area (Always Visible)                          ┃   │
        │   ┃                                                             ┃   │
        │   ┃ Weight: [-5 lbs] 185 [+5 lbs]  ◄── Excellent Steppers!   ┃   │
        │   ┃ Reps:   [-1]      8   [+1]                                ┃   │
        │   ┃ RPE:    ●●●●●●○○○○ (6/10)                               ┃   │
        │   ┃                                                             ┃   │
        │   ┃ [COMPLETE SET 3/4] ◄── Big Green Button                   ┃   │
        │   ┃                                                             ┃   │
        │   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
        │                                                                       │
        │   ⭐ Score: 9/10 - EXCELLENT!                                        │
        │   ✅ Split view layout is perfect                                    │
        │   ✅ Auto-collapsing reduces scroll by 50%                           │
        │   ✅ Large touch targets                                             │
        │   ✅ PR celebrations are motivating                                  │
        │   ❌ Missing: Rest timer (critical gap!)                            │
        │   ❌ Missing: 1RM calculator                                        │
        │                                                                       │
        └───────────────────────────┬───────────────────────────────────────────┘
                                    │
                                    │ Workout completed
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │  🏆 WORKOUT COMPLETE!       │
                     │                              │
                     │  Great job!                  │
                     │                              │
                     │  3 exercises • 24 sets       │
                     │  45 minutes • 5,420 lbs     │
                     │                              │
                     │  🎉 NEW PR: Bench Press!    │
                     │     195 lbs × 6 reps        │
                     │                              │
                     │  [Back to Dashboard]         │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                          [Return to Dashboard]
```

---

## 🔄 Information Architecture - Current

```
LiteWork App
│
├── 🏠 Dashboard (Home)
│   ├── Today's Workouts
│   │   ├── Workout Card(s)
│   │   └── Start Workout CTA
│   ├── [Empty State if no workouts]
│   └── Profile Link (top-right)
│
├── 📅 Workouts
│   ├── View Mode (/workouts/view/:id)
│   │   ├── Workout Details
│   │   ├── Before You Start
│   │   ├── Exercise List
│   │   └── Start Live Workout CTA
│   │
│   └── Live Mode (/workouts/live/:id)
│       ├── Fixed Header (timer, progress)
│       ├── Scrollable Exercise List
│       ├── Fixed Input Area
│       └── Exit Confirmation
│
├── 📚 History (/workouts/history)
│   ├── Filter Controls
│   ├── Workout List (paginated)
│   │   ├── Session Summary
│   │   └── Expandable Details
│   └── Export Options
│
├── 📈 Progress (/progress)
│   ├── Timeframe Selector
│   ├── View Tabs
│   │   ├── Overview
│   │   ├── Strength
│   │   ├── Comparison
│   │   └── Goals
│   └── Analytics Component
│       ❌ (Charts not implemented!)
│
└── 👤 Profile (/profile)
    ├── Avatar Upload
    ├── Personal Info Tab
    │   ├── Basic Info
    │   ├── Body Metrics
    │   └── Emergency Contact
    ├── Metrics Tab
    └── Account Tab
        └── Change Password
```

---

## 🔄 Proposed Information Architecture (Enhanced)

```
LiteWork App (Enhanced)
│
├── 🏠 Dashboard (Home) ⭐ ENHANCED
│   ├── Quick Stats Widget (NEW!)
│   │   ├── 🔥 Current Streak
│   │   ├── 💪 Workouts This Week
│   │   └── 📊 Total Volume This Week
│   │
│   ├── Today's Workouts
│   │   ├── Workout Card(s)
│   │   └── Start Workout CTA
│   │
│   ├── Recent Workouts (NEW!)
│   │   └── Last 3 workouts (compact)
│   │
│   ├── This Week (NEW!)
│   │   └── Upcoming scheduled workouts
│   │
│   └── Quick Actions (NEW!)
│       ├── View History
│       ├── Track Progress
│       └── Contact Coach
│
├── 📅 Workouts
│   ├── View Mode ⭐ ENHANCED
│   │   ├── Workout Header
│   │   │   ├── Title & Description
│   │   │   ├── Metadata (date, duration, exercises)
│   │   │   └── Difficulty Badge (NEW!)
│   │   │
│   │   ├── Before You Start
│   │   │   ├── Warmup Section (NEW!)
│   │   │   ├── Equipment Checklist (ENHANCED)
│   │   │   ├── Estimated Time per Exercise (NEW!)
│   │   │   └── Estimated Calories (NEW!)
│   │   │
│   │   ├── Visual Exercise Timeline (NEW!)
│   │   │
│   │   ├── Exercise List
│   │   │   ├── Exercise Cards
│   │   │   ├── Tap to Preview (NEW!)
│   │   │   └── Form Videos
│   │   │
│   │   └── Start Live Workout CTA
│   │
│   └── Live Mode ⭐ ENHANCED
│       ├── Fixed Header
│       ├── Scrollable Exercise List
│       ├── Fixed Input Area
│       │   ├── Weight Stepper
│       │   ├── Reps Stepper
│       │   ├── RPE Selector
│       │   └── Complete Set Button
│       │
│       ├── Rest Timer (NEW! - Critical)
│       │   ├── Auto-start after set
│       │   ├── Skip option
│       │   ├── Sound/vibration alert
│       │   └── Countdown display
│       │
│       ├── Quick Actions Menu (NEW!)
│       │   ├── View Form Video
│       │   ├── 1RM Calculator (NEW!)
│       │   ├── Add Quick Note
│       │   └── Skip Exercise
│       │
│       └── Exit Confirmation
│
├── 📚 History ⭐ ENHANCED
│   ├── Filter Controls
│   ├── Calendar Heatmap (NEW!)
│   │   └── GitHub-style workout frequency
│   │
│   ├── Weekly Volume Chart (NEW!)
│   │   └── Bar chart of volume over time
│   │
│   ├── Workout List (paginated)
│   │   ├── Session Summary
│   │   ├── Expandable Details
│   │   └── Compare to Last Time (NEW!)
│   │
│   ├── Exercise-Specific History (NEW!)
│   │   └── Tap exercise → see all performances
│   │
│   └── Personal Records Timeline (NEW!)
│       └── List of all PRs with dates
│
├── 📈 Progress ⭐ ENHANCED
│   ├── Timeframe Selector
│   │
│   ├── Charts & Graphs (IMPLEMENTED!)
│   │   ├── 1RM Progression Charts (NEW!)
│   │   ├── Volume Trends (NEW!)
│   │   ├── Body Weight Graph (NEW!)
│   │   └── Workout Frequency (NEW!)
│   │
│   ├── Strength Standards (NEW!)
│   │   ├── Compare to standards
│   │   ├── "How strong am I?"
│   │   └── Next level targets
│   │
│   ├── Progress Photos (NEW!)
│   │   ├── Upload photos
│   │   ├── Timeline gallery
│   │   ├── Before/after slider
│   │   └── Body measurements
│   │
│   └── Goals (NEW!)
│       ├── Set SMART goals
│       ├── Track progress
│       └── Goal completion celebrations
│
├── 🏆 Achievements (NEW!)
│   ├── Badge Showcase
│   ├── Milestones
│   │   ├── First Workout
│   │   ├── 10 Workouts
│   │   ├── 50 Workouts
│   │   ├── First PR
│   │   ├── Volume Milestones
│   │   └── Consistency Streaks
│   │
│   └── Achievements Feed
│       └── Recent unlocks
│
└── 👤 Profile ⭐ ENHANCED
    ├── Avatar & Bio
    ├── App Statistics (NEW!)
    │   ├── Total Workouts
    │   ├── Total Volume
    │   ├── Days Active
    │   └── PRs Set
    │
    ├── Personal Info Tab
    ├── Metrics Tab
    ├── Settings Tab (NEW!)
    │   ├── Notifications (NEW!)
    │   ├── Appearance (NEW!)
    │   │   ├── Dark Mode
    │   │   └── Theme Colors
    │   ├── Social Features (NEW!)
    │   └── Help & Tutorials (NEW!)
    │
    └── Account Tab
        └── Change Password

Bottom Navigation Bar (NEW! - Critical for Discovery)
├── 🏠 Home
├── 📚 History
├── 📈 Progress
└── 👤 Profile
```

---

## 🎯 Feature Priority Heatmap

```
                     High User Value ↑
                                     │
                                     │
    ┌────────────────────────────────┼────────────────────────────────┐
    │                                │                                │
    │   CRITICAL GAPS                │   QUICK WINS                   │
    │   (Do First!)                  │   (Easy + High Impact)         │
    │                                │                                │
    │   • Progress Charts            │   • Dashboard Quick Stats      │
    │   • Rest Timer                 │   • Workout Streak Display     │
    │   • History Visualizations     │   • Bottom Navigation Bar      │
    │   • 1RM Calculator             │   • Improved Empty States      │
    │                                │   • Equipment Checklist        │
    │                                │                                │
    ├────────────────────────────────┼────────────────────────────────┤
    │                                │                                │
    │   NICE TO HAVE                 │   FUTURE ENHANCEMENTS          │
    │   (Lower Priority)             │   (Complex, Lower ROI)         │
    │                                │                                │
    │   • Dark Mode                  │   • Social Features            │
    │   • Photo Progress             │   • AI Recommendations         │
    │   • Workout Comparison         │   • Apple Watch Integration    │
    │   • Music Integration          │   • Video Form Analysis        │
    │                                │   • Bluetooth Equipment        │
    │                                │                                │
    └────────────────────────────────┴────────────────────────────────┘
                                     │
                                     │
                    Low Implementation Effort →  High Implementation Effort
```

---

## 📊 User Flow Improvements - Before & After

### BEFORE: Starting a Workout

```
Dashboard → [Start Workout] → Workout View → [Start Live Workout] → Live Mode
  ↑                                ↑
  └── Limited info                 └── No preparation guidance
  └── No motivation                └── Cold start, no warmup
```

### AFTER: Starting a Workout (Proposed)

```
Dashboard → [Start Workout] → Workout View → [Start Live Workout] → Live Mode
  ↑                                ↑                                    ↑
  ├── Streak: 5 days!             ├── Warmup exercises listed         ├── Rest timer auto-starts
  ├── Last workout: 2 days ago    ├── Equipment checklist             ├── 1RM calculator available
  ├── Total volume this week      ├── Difficulty: ⭐⭐⭐            ├── Form videos one tap away
  └── Recent workouts visible     ├── Estimated time: 45 min         ├── Quick note button
                                   └── Warmup → Main → Cooldown       └── Haptic feedback on PRs
```

---

## 🎨 Visual Design Tokens

### Color Palette (Current)

```
Primary Colors:
┌──────────┬──────────┬──────────┬──────────┐
│ Primary  │ Cyan     │ Blue     │ Green    │
│ #3B82F6  │ #06B6D4  │ #0EA5E9  │ #10B981  │
│ ████████ │ ████████ │ ████████ │ ████████ │
└──────────┴──────────┴──────────┴──────────┘

Accent Colors:
┌──────────┬──────────┬──────────┬──────────┐
│ Orange   │ Purple   │ Pink     │ Yellow   │
│ #F97316  │ #A855F7  │ #EC4899  │ #EAB308  │
│ ████████ │ ████████ │ ████████ │ ████████ │
└──────────┴──────────┴──────────┴──────────┘

Semantic Colors:
┌──────────┬──────────┬──────────┬──────────┐
│ Success  │ Warning  │ Error    │ Info     │
│ #10B981  │ #F59E0B  │ #EF4444  │ #06B6D4  │
│ ████████ │ ████████ │ ████████ │ ████████ │
└──────────┴──────────┴──────────┴──────────┘
```

### Typography Scale

```
Display:  48px / 56px  (3rem / 3.5rem)  - Page headers
H1:       36px / 44px  (2.25rem / 2.75rem)
H2:       30px / 38px  (1.875rem / 2.375rem)
H3:       24px / 32px  (1.5rem / 2rem)
Body:     16px / 24px  (1rem / 1.5rem)
Caption:  14px / 20px  (0.875rem / 1.25rem)
```

### Spacing System

```
4px   - xs   (tight spacing, badges)
8px   - sm   (component padding)
12px  - md   (card padding)
16px  - lg   (section spacing)
24px  - xl   (large gaps)
32px  - 2xl  (page padding)
```

---

## 🚀 Component Interaction Patterns

### Rest Timer Flow (Proposed)

```
Set Completed
      ↓
[Complete Set] Button Pressed
      ↓
┌─────────────────────────────────┐
│  ✓ SET COMPLETED!               │
│                                 │
│  Rest Timer: 90 seconds         │
│  ┌───────────────────────────┐ │
│  │  ⏱️ 1:30                   │ │
│  │  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  │ │
│  └───────────────────────────┘ │
│                                 │
│  [Skip Rest] [Add 30s]         │
└─────────────────────────────────┘
      ↓
Timer Counts Down (90 → 0)
      ↓
Notification: "Rest complete! Ready for next set"
Sound: Ding 🔔
Vibration: Buzz 📳
      ↓
Input Area Re-enables for Next Set
```

### 1RM Calculator Modal (Proposed)

```
Tap "Calculator" Icon in Live Mode
      ↓
┌──────────────────────────────────┐
│  🧮 1RM CALCULATOR                │
│                                  │
│  Current 1RM: 225 lbs            │
│  ────────────────────────        │
│                                  │
│  Target Percentage:               │
│  [60%] [70%] [80%] [85%] [90%]  │
│                                  │
│  Calculated Weight:               │
│  ┌──────────────────────────┐   │
│  │   202.5 lbs              │   │
│  │   (90% of 225 lbs)       │   │
│  └──────────────────────────┘   │
│                                  │
│  [Use This Weight] [Close]      │
└──────────────────────────────────┘
      ↓
"Use This Weight" → Auto-fills weight input
```

---

## 📱 Mobile Screen Dimensions

### Target Devices

```
iPhone SE (Small)         iPhone 13/14 (Medium)   iPhone 14 Pro Max (Large)
┌─────────────┐          ┌────────────────┐      ┌──────────────────┐
│   375×667   │          │   390×844      │      │    430×932       │
│             │          │                │      │                  │
│  🏠 Header  │          │  🏠 Header     │      │  🏠 Header       │
│             │          │                │      │                  │
│  Content    │          │  Content       │      │  Content         │
│  Area       │          │  Area          │      │  Area            │
│             │          │                │      │                  │
│  Bottom     │          │  Bottom        │      │  Bottom          │
│  Nav        │          │  Nav           │      │  Nav             │
└─────────────┘          └────────────────┘      └──────────────────┘
```

### Touch Target Sizes

```
Minimum: 44×44px (iOS Human Interface Guidelines)
Optimal: 48×48px (Material Design)
Large: 56×56px (Primary CTAs)

LiteWork Implementation:
✅ Start Workout Button: 56px height
✅ Complete Set Button: 56px height
✅ Stepper Buttons: 48×48px
✅ Exercise Cards: 56px minimum height
```

---

## 🎯 Success Metrics Dashboard (Proposed)

```
┌─────────────────────────────────────────────────────────────┐
│                   LITEWORK ANALYTICS                        │
│                   November 2025                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Active Athletes: 124 (+12% from last month)              │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 112                                    │
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐          │
│  │ Engagement   │ Retention    │ Satisfaction │          │
│  │              │              │              │          │
│  │ 85% DAU      │ 75% Day 7   │ 4.8/5 ⭐    │          │
│  │ ▲ +5%        │ ▲ +10%      │ ▲ +0.3      │          │
│  └──────────────┴──────────────┴──────────────┘          │
│                                                             │
│  Feature Usage:                                            │
│  ┌─────────────────────────────────────────────┐          │
│  │ Live Mode      ████████████████████ 95%    │          │
│  │ History        ██████████████░░░░░░ 68%    │          │
│  │ Progress       ████████░░░░░░░░░░░░ 42%    │ ← IMPROVE!
│  │ Profile        ██████░░░░░░░░░░░░░░ 35%    │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
│  Top Requested Features:                                   │
│  1. Rest Timer (78 votes)                                 │
│  2. Progress Charts (64 votes)                            │
│  3. 1RM Calculator (52 votes)                             │
│  4. Dark Mode (41 votes)                                  │
│  5. Workout Streaks (38 votes)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation Notes

### Rest Timer Component (Pseudo-code)

```typescript
// hooks/useRestTimer.ts
export function useRestTimer(restSeconds: number) {
  const [timeRemaining, setTimeRemaining] = useState(restSeconds);
  const [isActive, setIsActive] = useState(false);

  const start = () => setIsActive(true);
  const skip = () => {
    setIsActive(false);
    setTimeRemaining(restSeconds);
  };
  const addTime = (seconds: number) =>
    setTimeRemaining((prev) => prev + seconds);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          playSound(); // Ding!
          vibrate([200]); // Buzz!
          setIsActive(false);
          return restSeconds; // Reset
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  return { timeRemaining, isActive, start, skip, addTime };
}
```

### Chart Library Recommendation

```bash
# Install Recharts (best for mobile)
npm install recharts

# Example Usage
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <Line type="monotone" dataKey="weight" stroke="#3B82F6" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
  </LineChart>
</ResponsiveContainer>
```

---

**End of Visual Flow Documentation**

For implementation details, see: `ATHLETE_UX_AUDIT_2025.md`
For quick-start guide, see: `QUICK_START_UX_IMPROVEMENTS.md`
