# LiteWork - Workout Tracker for Weight Lifting Club

This is a comprehensive web-based workout tracking application designed for weight lifting clubs. The application enables coaches to manage athlete groups, assign workouts with advanced exercise organization, and track progress, while providing athletes with interactive workout sessions and progress monitoring.

## Project Architecture

This is a modern full-stack web application built with:

- **Framework**: Next.js 16 with App Router (full-stack React framework)
- **Language**: TypeScript for complete type safety
- **Styling**: Tailwind CSS with custom design token system
- **State Management**: React Context API with local component state
- **Authentication**: Supabase Auth with role-based access control (RBAC)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **PWA**: Progressive Web App capabilities for mobile installation
- **Deployment**: Vercel (production), optimized for serverless

## Authentication & Authorization (CRITICAL)

### Role Hierarchy

```
admin (level 3) → Full system access
  ↓
coach (level 2) → Manage athletes, workouts, groups
  ↓
athlete (level 1) → View own data, complete workouts
```

**IMPORTANT**: Admin role ALWAYS has coach and athlete permissions. Never check `role === "coach"` without also allowing admin.

### Security Patterns

**API Routes** - Use auth wrappers from `src/lib/auth-utils.ts`:

```typescript
import { withAuth, withPermission, withRole } from "@/lib/auth-utils";

// Require authentication
export async function GET(request: NextRequest) {
  return withAuth(request, async (user) => {
    return NextResponse.json({ data: "success" });
  });
}

// Require specific permission
export async function POST(request: NextRequest) {
  return withPermission(request, "assign-workouts", async (user) => {
    return NextResponse.json({ data: "created" });
  });
}
```

**Frontend Pages** - Use guard hooks from `src/hooks/use-auth-guard.ts`:

```typescript
import { useCoachGuard } from "@/hooks/use-auth-guard";

function CoachPage() {
  const { user, isLoading } = useCoachGuard();
  if (isLoading) return <Loading />;
  // user.role is "coach" or "admin"
}
```

**Permission Helpers** - Use from `src/lib/supabase-auth.ts`:

```typescript
isAdmin(user); // user.role === "admin"
isCoach(user); // user.role === "coach" || admin
canManageGroups(user); // coach or admin
canAssignWorkouts(user); // coach or admin
canViewAllAthletes(user); // coach or admin
```

### Reference Documentation

- `ARCHITECTURE.md` - Complete auth patterns and best practices
- `SECURITY_AUDIT_REPORT.md` - Security audit findings and fixes
- All API routes follow consistent patterns documented in ARCHITECTURE.md

## Key Features

### For Coaches/Admins:

- **Advanced Workout Editor**: Create workouts with exercise grouping (supersets, circuits, sections)
- **Group Management**: Organize athletes by sport/category (Football Linemen, Volleyball Girls, etc.)
- **Bulk Assignment**: Assign workouts to entire groups with scheduling
- **Individual Modifications**: Customize group workouts for specific athletes (injuries, experience levels)
- **Progress Analytics**: Monitor athlete progress and performance metrics
- **Calendar Management**: Schedule training sessions and events

### For Athletes:

- **View Mode**: Review assigned workouts with exercise details and target weights
- **Live Mode**: Interactive workout sessions with large touch-friendly buttons
- **Progress Tracking**: Monitor personal improvements and workout history
- **Mobile-First**: Optimized for use on phones and tablets in the gym
- **Offline Capability**: Core functionality works without internet connection

## Recent Major Enhancements (October 2025)

### Security & Authentication (Oct 30, 2025)

- **Comprehensive Security Audit**: Fixed 6 critical unprotected API routes
- **Centralized Auth Utilities**: `withAuth`, `withPermission`, `withRole` wrappers
- **Role Hierarchy**: Admin role properly inherits all coach/athlete permissions
- **Supabase Migration**: Migrated from JWT to Supabase Auth with RLS
- **Documentation**: Created ARCHITECTURE.md and SECURITY_AUDIT_REPORT.md

### Advanced Workout Editor System

- **Exercise Grouping**: Comprehensive superset, circuit, and section organization
- **Unified Experience**: Same advanced editor for both creating and editing workouts
- **Drag-and-Drop**: Manual reordering with up/down controls for precise organization
- **Exercise Library Integration**: Browse and add exercises from comprehensive library
- **Type-Safe Architecture**: Enhanced TypeScript interfaces with `ExerciseGroup` and updated `WorkoutExercise`

### Production Deployment

- **Vercel Production**: Deployed at https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app
- **TypeScript Validation**: Integrated into deployment workflow
- **Persistent Dev Server**: Auto-restart capabilities with health monitoring

## Development Guidelines

- **TypeScript First**: Use comprehensive type definitions from `src/types/index.ts`
- **Security First**: All API routes MUST use auth wrappers (see ARCHITECTURE.md)
- **Mobile-First Design**: Build for touch interfaces and mobile gym use
- **Component Patterns**: Follow established React patterns with functional components and hooks
- **Design System**: Use design tokens and consistent Tailwind classes
- **Progressive Enhancement**: Ensure basic functionality works everywhere
- **Domain Knowledge**: Understand weight lifting terminology (supersets, circuits, 1RM, etc.)
- **Permission Checks**: Always use permission helpers, never direct role comparisons

## File Organization

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/contexts/` - React Context providers for global state
- `src/types/` - TypeScript type definitions and interfaces
- `src/styles/` - Design system, tokens, and custom CSS
- `src/lib/` - Utility functions and shared logic
- `src/hooks/` - Custom React hooks

## Key Components

### WorkoutEditor (`src/components/WorkoutEditor.tsx`)

- Advanced modal-based workout creation and editing
- Exercise grouping with supersets, circuits, and sections
- Drag-and-drop organization with manual controls
- Exercise library integration
- Type-safe with comprehensive interfaces

### Group Management

- `GroupAssignmentModal.tsx` - Bulk workout assignment to athlete groups
- `AthleteModificationModal.tsx` - Individual customizations for group workouts
- `GroupFormModal.tsx` - Create and manage athlete groups

### Workout Sessions

- `WorkoutView.tsx` - Review mode for assigned workouts
- `WorkoutLive.tsx` - Interactive workout session with set recording
- `ProgressAnalytics.tsx` - Performance tracking and statistics

## Domain-Specific Context

### Weight Lifting Terminology

- **Superset**: 2-4 exercises performed back-to-back with minimal rest
- **Circuit**: 5+ exercises performed in sequence, often for conditioning
- **1RM**: One-rep maximum, the heaviest weight an athlete can lift once
- **Volume**: Total work performed (sets × reps × weight)
- **Progressive Overload**: Gradually increasing training demands over time

### Athlete Categories

- Sport-specific groups (Football, Volleyball, Cross Country, etc.)
- Position-specific training (Linemen, Skill players, etc.)
- Experience levels (Beginner, Intermediate, Advanced)
- Gender-specific programming when appropriate

### Workout Modifications

- **Exercise Substitutions**: Alternative exercises for injuries or equipment limitations
- **Volume Adjustments**: Modified sets, reps, or weights for individual needs
- **Progression Tracking**: Automatic weight and rep suggestions based on performance
