# LiteWork - Workout Tracker for Weight Lifting Club

This is a comprehensive web-based workout tracking application designed for weight lifting clubs. The application enables coaches to manage athlete groups, assign workouts with advanced exercise organization, and track progress, while providing athletes with interactive workout sessions and progress monitoring.

## Project Architecture

This is a modern full-stack web application built with:

- **Framework**: Next.js 16 with App Router (full-stack React framework)
- **Language**: TypeScript for complete type safety
- **Styling**: Tailwind CSS with custom design token system
- **State Management**: React Context API with local component state
- **Authentication**: Supabase Auth with role-based access control (RBAC)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS) - 34 tables
- **PWA**: Progressive Web App capabilities for mobile installation
- **Deployment**: Vercel (production), optimized for serverless

## Database Schema (REFERENCE THIS!)

**Complete Documentation**: `docs/DATABASE_SCHEMA.md` (500+ lines)

### Core Tables (34 total)

**Workouts** (6 tables):
- `workout_plans` - Workout templates
- `workout_exercises` - Exercises with 23 columns (sets, reps, weight, tempo, notes, etc.)
- `workout_exercise_groups` - Supersets, circuits, sections
- `workout_block_instances` - Reusable templates
- `workout_sessions` - Completed workouts
- `workout_assignments` - Workout assignments to athletes

**Exercises** (5 tables):
- `exercises` - Exercise library (500+ movements)
- `exercise_muscle_groups` - Exercise-to-muscle mapping
- `muscle_groups` - Muscle group definitions
- `exercise_analytics` - Usage tracking
- `user_exercise_preferences` - Athlete preferences

**Progress Tracking** (4 tables):
- `athlete_kpis` - 1RMs and performance metrics
- `progress_entries` - Weight, measurements
- `session_exercises` - Exercises per session
- `set_records` - Individual set data (weight, reps, RPE)

**IMPORTANT**: Always check `docs/DATABASE_SCHEMA.md` before:
- Creating new database queries
- Adding new tables or columns
- Understanding data relationships
- Writing migrations

### Current Schema Export
- **Live Schema**: `database-export/schema-dump.sql` (auto-generated from production)
- **Export Tool**: `./scripts/database/export-schema.sh`

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

### Directory Organization & Professional Structure (Nov 1, 2025)

- **Root Cleanup**: Reduced from 80+ files to 22 essential files
- **Organized Scripts**: Categorized into `/scripts/{database,dev,deployment,analysis}`
- **Organized Docs**: Categorized into `/docs/{guides,reports,checklists}`
- **TypeScript Configuration**: Excludes non-source directories for clean compilation
- **Comprehensive Documentation**: Created PROJECT_STRUCTURE.md with complete guidelines
- **Zero TypeScript Errors**: Achieved 100% error-free production build

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

### Core Principles

- **TypeScript First**: Use comprehensive type definitions from `src/types/index.ts`
- **Security First**: All API routes MUST use auth wrappers (see ARCHITECTURE.md)
- **Mobile-First Design**: Build for touch interfaces and mobile gym use
- **Component Patterns**: Follow established React patterns with functional components and hooks
- **Design System**: Use design tokens and consistent Tailwind classes
- **Progressive Enhancement**: Ensure basic functionality works everywhere
- **Domain Knowledge**: Understand weight lifting terminology (supersets, circuits, 1RM, etc.)
- **Permission Checks**: Always use permission helpers, never direct role comparisons
- **Professional Organization**: Maintain clean directory structure (see PROJECT_STRUCTURE.md)

### Code Quality Standards

- **Zero TypeScript Errors**: Run `npm run typecheck` before committing
- **Build Validation**: Ensure `npm run build` succeeds
- **Consistent Formatting**: Follow existing code style and patterns
- **Type Safety**: Use proper types, avoid `any` unless absolutely necessary
- **Error Handling**: Always handle errors gracefully with user-friendly messages
- **Performance**: Optimize for mobile devices and slow connections

## Project Structure & File Organization

### Directory Hierarchy (CRITICAL - MUST FOLLOW)

```
litework/
├── 📄 Root Level                 # ONLY essential configuration files
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.ts            # Next.js config
│   ├── tailwind.config.ts        # Tailwind config
│   ├── middleware.ts             # Route middleware
│   └── *.md                      # Core documentation
│
├── 📁 src/                       # ALL application source code
│   ├── app/                      # Next.js pages & API routes
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities & services
│   ├── styles/                   # CSS & design tokens
│   └── types/                    # TypeScript definitions
│
├── 📁 scripts/                   # Automation scripts (ORGANIZED)
│   ├── database/                 # DB migrations, seeds, setup
│   ├── dev/                      # Development tools
│   ├── deployment/               # Production deployment
│   └── analysis/                 # Performance analysis
│
├── 📁 docs/                      # Documentation (ORGANIZED)
│   ├── guides/                   # How-to guides
│   ├── reports/                  # Audit reports
│   └── checklists/              # Process checklists
│
├── 📁 database/                  # Database schemas only
├── 📁 public/                    # Static assets
├── 📁 config/                    # Config files & archive
└── 📁 .github/                   # GitHub config
```

### File Placement Rules (ENFORCE STRICTLY)

**✅ DO:**

- Place ALL automation scripts in `/scripts/{category}/`
- Place ALL documentation in `/docs/{type}/`
- Place ALL source code in `/src/`
- Keep root directory minimal (config files + core docs only)
- Archive old configs to `/config/archive/`

**❌ DON'T:**

- Add loose `.mjs`, `.sh`, or utility scripts to root
- Create documentation files outside `/docs/`
- Mix scripts with source code
- Leave temporary/test files in root

### Naming Conventions

**Files:**

- Components: `PascalCase.tsx` (e.g., `WorkoutEditor.tsx`)
- Utilities: `kebab-case.ts` (e.g., `auth-utils.ts`)
- Scripts: `kebab-case.mjs` (e.g., `migrate-database.mjs`)
- API routes: `route.ts` in feature folders

**Directories:**

- Feature folders: `kebab-case` (e.g., `workout-editor/`)
- Component folders: `PascalCase` (e.g., `WorkoutEditor/`)

**Variables/Functions:**

- camelCase for functions and variables
- PascalCase for components and classes
- SCREAMING_SNAKE_CASE for constants

### Source Code Organization (`/src`)

**Application Pages & Routes (`/app`)**

```
app/
├── (auth)/                       # Auth-protected routes
├── api/                          # API endpoints (grouped by resource)
│   ├── analytics/route.ts
│   ├── assignments/route.ts
│   ├── exercises/route.ts
│   └── workouts/
│       ├── route.ts              # List/create workouts
│       └── [id]/route.ts         # Single workout operations
├── dashboard/page.tsx
├── workouts/page.tsx
└── layout.tsx
```

**Reusable Components (`/components`)**

- Feature components: Root of `/components/`
- Shared UI components: `/components/ui/`
- Feature-specific sub-components: `/components/feature-name/`

**Utilities & Services (`/lib`)**

```
lib/
├── auth-utils.ts                 # Authentication wrappers
├── supabase-auth.ts             # Supabase auth helpers
├── api-client.ts                # API request utilities
├── analytics-service.ts         # Analytics logic
└── [feature]-service.ts         # Feature-specific services
```

**Type Definitions (`/types`)**

```
types/
├── index.ts                      # Main type exports
├── database.ts                   # Database types
├── api.ts                        # API request/response types
└── [feature].ts                  # Feature-specific types
```

### Script Organization (`/scripts`)

**Database Scripts (`/scripts/database/`)**

- Migrations: `migrate-*.mjs`
- Seeds: `seed-*.mjs`, `*-seed.sql`
- Setup: `create-*.mjs`, `check-*.mjs`
- Verification: `verify-*.mjs`

**Development Scripts (`/scripts/dev/`)**

- Server management: `dev-*.sh`
- Environment checks: `check-*.mjs`
- Diagnostics: `*-diagnose.sh`, `*-troubleshoot.sh`

**Deployment Scripts (`/scripts/deployment/`)**

- Production: `deploy-*.sh`
- Pre-deploy checks: `pre-deploy-*.mjs`

**Analysis Scripts (`/scripts/analysis/`)**

- Performance: `analyze-*.mjs`
- Optimization: `optimize-*.mjs`

### Documentation Organization (`/docs`)

**Guides (`/docs/guides/`)**

- Setup guides: `*_SETUP.md`, `*_GUIDE.md`
- Development: `DEV_*.md`
- Deployment: `DEPLOYMENT_*.md`
- Quick starts: `QUICK_START_*.md`

**Reports (`/docs/reports/`)**

- Audits: `*_AUDIT_REPORT.md`
- Security: `SECURITY_*.md`
- Performance: `PERFORMANCE_*.md`

**Checklists (`/docs/checklists/`)**

- Launch: `*-checklist.md`
- Migration: `*-migration.md`
- Optimization: `*-optimization-*.md`

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

## Design Language & UI Patterns

### Design System

**Design Tokens** (from `src/styles/tokens.css`):

- Use CSS custom properties for colors, spacing, typography
- Reference: `docs/design-tokens.md`
- Never hardcode colors - always use tokens
- Maintain consistency across all components

**Tailwind Classes**:

- Use utility-first approach with Tailwind
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Prefer Tailwind utilities over custom CSS
- Use `@apply` in components for repeated patterns

**Color Palette**:

```css
/* Primary - Brand colors */
--color-primary: #3b82f6; /* Blue */
--color-primary-dark: #1e40af;

/* Semantic - Functional colors */
--color-success: #10b981; /* Green */
--color-warning: #f59e0b; /* Amber */
--color-error: #ef4444; /* Red */
--color-info: #06b6d4; /* Cyan */

/* Neutral - Text and backgrounds */
--color-gray-50: #f9fafb;
--color-gray-900: #111827;
```

### Component Patterns

**Modal Components**:

- Use consistent modal structure with backdrop
- Mobile-responsive with full-screen on small devices
- Always include close button and keyboard (Escape) handling
- Follow pattern: `[Feature]Modal.tsx` (e.g., `WorkoutEditor.tsx`)

**Form Patterns**:

```typescript
// ✅ Good - Controlled inputs with validation
const [formData, setFormData] = useState<FormType>(initialState);
const [errors, setErrors] = useState<Record<string, string>>({});

// Handle input changes
const handleChange = (field: keyof FormType, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }
};
```

**Loading States**:

```typescript
// ✅ Good - Consistent loading UI
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

**Error Handling**:

```typescript
// ✅ Good - User-friendly error messages
try {
  await apiCall();
} catch (error) {
  setError(
    error instanceof Error ? error.message : "An unexpected error occurred"
  );
  // Show toast notification
  toast.error("Failed to save workout. Please try again.");
}
```

### Mobile-First Design Rules

**Touch Targets**:

- Minimum 44x44px for all interactive elements
- Use larger buttons in workout live mode (56px+)
- Add adequate spacing between touch targets (8px minimum)

**Typography**:

```css
/* Mobile base sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px - minimum for body text */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */

/* Increase for readability in gym environment */
.workout-live {
  font-size: var(--text-lg); /* Larger base text */
}
```

**Responsive Breakpoints**:

```typescript
// Mobile-first approach
className="
  w-full              // Mobile: full width
  md:w-2/3            // Tablet: 2/3 width
  lg:w-1/2            // Desktop: half width
  p-4                 // Mobile: padding
  md:p-6              // Tablet: more padding
  lg:p-8              // Desktop: even more
"
```

**Mobile Optimization**:

- Always test on mobile devices (PWA context)
- Optimize images and assets for mobile bandwidth
- Use lazy loading for images and heavy components
- Implement offline-first patterns for core features

### Accessibility Requirements

**Keyboard Navigation**:

- All interactive elements must be keyboard accessible
- Logical tab order throughout the application
- Visual focus indicators on all focusable elements
- Support Escape key to close modals/dialogs

**Screen Readers**:

```typescript
// ✅ Good - Semantic HTML with ARIA labels
<button
  aria-label="Delete workout"
  onClick={handleDelete}
>
  <TrashIcon className="w-5 h-5" />
</button>

// ✅ Good - Descriptive link text
<Link href="/workouts" aria-label="View all workouts">
  Workouts
</Link>
```

**Color Contrast**:

- Maintain WCAG AA standards (4.5:1 for normal text)
- Never rely solely on color to convey information
- Use icons + text for status indicators

### Performance Patterns

**Code Splitting**:

```typescript
// ✅ Good - Lazy load heavy components
const WorkoutEditor = dynamic(() => import('@/components/WorkoutEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

**Memoization**:

```typescript
// ✅ Good - Memoize expensive computations
const sortedWorkouts = useMemo(() => {
  return workouts.sort((a, b) => b.date.localeCompare(a.date));
}, [workouts]);

// ✅ Good - Memoize callbacks passed to children
const handleWorkoutSelect = useCallback(
  (id: string) => {
    navigate(`/workouts/view/${id}`);
  },
  [navigate]
);
```

**API Optimization**:

```typescript
// ✅ Good - Batch API calls when possible
const [workouts, assignments, analytics] = await Promise.all([
  fetchWorkouts(),
  fetchAssignments(),
  fetchAnalytics(),
]);

// ✅ Good - Use pagination for large lists
const { data, hasMore } = await fetchWorkouts({
  limit: 20,
  offset: page * 20,
});
```

### State Management Patterns

**Local State** - Component-specific data:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormType>(initialState);
```

**Context** - Shared state across components:

```typescript
// ✅ Good - Auth context for user session
const { user, isLoading } = useAuth();

// ✅ Good - Workout session context
const { activeWorkout, updateSet } = useWorkoutSession();
```

**Server State** - Data from API:

```typescript
// ✅ Good - Use SWR or React Query pattern
const { data: workouts, error, mutate } = useSWR("/api/workouts", fetcher);
```

### Testing & Validation

**Before Every Commit**:

```bash
npm run typecheck    # Must show 0 errors
npm run build        # Must complete successfully
npm run lint         # Must pass (or fix warnings)
```

**Code Review Checklist**:

- [ ] TypeScript errors: ZERO
- [ ] Mobile responsive: Tested
- [ ] Accessibility: Keyboard + screen reader
- [ ] Error handling: All edge cases
- [ ] Loading states: Implemented
- [ ] File placement: Correct directory
- [ ] Naming: Follows conventions
- [ ] Comments: Added for complex logic
- [ ] No console.logs in production code
- [ ] Security: Auth checks in place

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
