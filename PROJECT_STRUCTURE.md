# LiteWork Project Structure

**Last Updated**: November 10, 2025  
**Status**: Clean and professionally organized (70% reduction from 80+ files to 24 items in root)

Clean, professional directory organization for maintainability and scalability.

## Root Directory Overview

**Essential Files Only** (15 configuration + 4 core docs + 9 directories = 28 items total)

### Configuration Files (15)

- `package.json`, `package-lock.json` - Dependencies
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.mjs` - ESLint rules
- `postcss.config.mjs` - PostCSS configuration
- `vercel.json` - Vercel deployment settings
- `middleware.ts` - Route middleware (auth, security headers)
- `next-env.d.ts` - Next.js TypeScript definitions
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore rules

### Core Documentation (4)

- `README.md` - Project overview, quick start, feature list
- `ARCHITECTURE.md` - System architecture, patterns, best practices
- `CHANGELOG.md` - Version history with detailed changes
- `PROJECT_STRUCTURE.md` - This file (organization guide)

### Directories (9)

- `src/` - All application source code
- `docs/` - All documentation (100+ files professionally organized)
- `scripts/` - Automation scripts (categorized by purpose)
- `public/` - Static assets
- `database/` - SQL schemas and migrations
- `database-export/` - Schema exports and analysis
- `config/` - Configuration files and archive
- `supabase/` - Supabase-specific configuration
- `node_modules/` - Dependencies (gitignored)

## Root Directory

```
litework/
├── 📄 README.md                  # Project overview and quick start
├── 📄 ARCHITECTURE.md            # System architecture and design patterns
├── 📄 CHANGELOG.md               # Version history (currently v0.9.0)
├── 📄 PROJECT_STRUCTURE.md       # This file - organization guide
├── 📄 package.json               # Dependencies and npm scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 next.config.ts             # Next.js configuration (Turbopack enabled)
├── 📄 tailwind.config.ts         # Tailwind CSS configuration
├── 📄 eslint.config.mjs          # ESLint configuration
├── 📄 postcss.config.mjs         # PostCSS configuration
├── 📄 vercel.json                # Vercel deployment configuration
├── 📄 middleware.ts              # Next.js middleware (auth + security)
├── 📄 .env.example               # Environment variable template
├── 📄 .gitignore                 # Git ignore rules
│
├── 📁 src/                       # Application source code (ALL app code here)
│   ├── app/                      # Next.js App Router pages and API routes
│   ├── components/               # React components
│   ├── contexts/                 # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and services
│   ├── styles/                   # Global styles and design tokens
│   └── types/                    # TypeScript type definitions
│
├── 📁 public/                    # Static assets (served at /)
│   ├── icons/                    # PWA icons (various sizes)
│   ├── images/                   # Images and graphics
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker (offline support)
│
├── 📁 database/                  # Database schemas and migrations
│   ├── schema.sql                # Main database schema (34 tables)
│   ├── exercises-schema.sql      # Exercise library schema (500+ exercises)
│   ├── exercises-seed.sql        # Exercise seed data
│   └── *.sql                     # Additional schemas and migrations
│
├── 📁 database-export/           # Auto-generated schema exports
│   ├── schema-dump.sql           # Current production schema
│   ├── ANALYSIS.md               # Schema analysis report
│   └── data/                     # Exported data for analysis
│
├── 📁 scripts/                   # Utility scripts (ORGANIZED)
│   ├── database/                 # Database management (migrations, seeds)
│   ├── dev/                      # Development tools (server, diagnostics)
│   ├── deployment/               # Production deployment scripts
│   └── analysis/                 # Performance and code analysis
│
├── 📁 docs/                      # Documentation (100+ files ORGANIZED)
│   ├── guides/                   # 45+ how-to guides and quick references
│   ├── reports/                  # 50+ technical reports and audits
│   ├── checklists/              # 10+ deployment and process checklists
│   ├── DATABASE_SCHEMA.md        # Complete schema documentation (34 tables)
│   ├── ASSIGNMENT_SYSTEM_*.md    # Assignment system documentation
│   ├── UX_AUDIT_*.md            # UX audit reports
│   └── *.md                      # Major documentation files
│
├── 📁 config/                    # Configuration files
│   ├── archive/                  # Old/backup configurations
│   └── vscode-minimal-settings.json
│
├── 📁 .github/                   # GitHub configuration
│   └── copilot-instructions.md   # GitHub Copilot context (500+ lines)
│
├── 📁 supabase/                  # Supabase configuration
│   └── config.toml               # Supabase project config
│
├── 📁 .next/                     # Next.js build output (gitignored)
├── 📁 .vercel/                   # Vercel deployment data (gitignored)
└── 📁 node_modules/              # Dependencies (gitignored)
```

## Source Code Structure (`/src`)

### `/app` - Next.js App Router

Application pages and API routes following Next.js conventions.

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Home page
├── globals.css                   # Global styles
├── api/                          # API routes
│   ├── analytics/
│   ├── assignments/
│   ├── auth/
│   ├── exercises/
│   ├── groups/
│   ├── invites/
│   ├── messages/
│   ├── users/
│   └── workouts/
├── athletes/                     # Coach athlete management
├── dashboard/                    # Main dashboard
├── login/                        # Authentication
├── profile/                      # User profile
├── progress/                     # Progress analytics
├── schedule/                     # Calendar view
└── workouts/                     # Workout management
```

### `/components` - React Components

Reusable UI components organized by feature.

```
components/
├── AthleteCalendar.tsx           # Calendar with month/week/day views (NEW)
├── AthleteModificationModal.tsx  # Individual athlete customizations
├── BulkOperationModal.tsx        # Bulk athlete operations
├── CalendarView.tsx              # Schedule calendar (legacy)
├── DateTimePicker.tsx            # Date and time selection (NEW)
├── ExerciseLibrary.tsx           # Exercise browser
├── GroupAssignmentModal.tsx      # Assign workouts to groups (enhanced)
├── GroupFormModal.tsx            # Create/edit athlete groups
├── IndividualAssignmentModal.tsx # Assign workouts to individuals (NEW)
├── Navigation.tsx                # Main navigation
├── ProgressAnalytics.tsx         # Progress charts
├── WorkoutEditor.tsx             # Advanced workout builder
├── WorkoutLive.tsx               # Live workout session
├── WorkoutView.tsx               # View assigned workout
└── ui/                           # Base UI components
```

### `/lib` - Utilities and Services

Shared logic, API clients, and helper functions.

```
lib/
├── auth-client.ts                # Client-side authentication
├── auth-server.ts                # Server-side authentication
├── auth-utils.ts                 # Auth middleware wrappers
├── supabase-auth.ts              # Supabase auth service
├── supabase.ts                   # Supabase client
├── supabase-admin.ts             # Supabase admin client
├── supabase-server.ts            # Supabase server client
├── api-client.ts                 # API request wrapper
├── database-service.ts           # Database operations
├── logger.ts                     # Production-safe logging
└── env-validator.ts              # Environment validation
```

### `/types` - TypeScript Definitions

Comprehensive type definitions for the application.

```
types/
└── index.ts                      # All type definitions
    ├── User                      # User and authentication types
    ├── WorkoutPlan               # Workout structure
    ├── Exercise                  # Exercise definitions
    ├── AthleteGroup              # Group management
    └── WorkoutSession            # Session tracking
```

## Scripts Directory (`/scripts`)

### `/database` - Database Management

- Schema validation and setup
- User/profile creation
- Data migrations
- Test data cleanup

### `/dev` - Development Tools

- Development server management
- Environment validation
- VSCode configuration helpers

### `/deployment` - Production Deployment

- Pre-flight checks
- Build validation
- Deployment automation

### `/analysis` - Code Analysis

- Performance metrics
- Design token analysis
- Asset optimization

## Documentation Directory (`/docs`)

### `/guides` - How-To Guides

- Setup instructions
- Development workflow
- Deployment procedures
- Database migrations

### `/reports` - Technical Reports

- Security audits
- Performance analysis
- Code quality assessments
- Sprint summaries

### `/checklists` - Launch Checklists

- Production readiness
- Deployment verification
- Security validation

## Configuration Files

### Essential Root Configs

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js framework configuration
- `tailwind.config.ts` - Tailwind CSS styling
- `eslint.config.mjs` - Code linting rules
- `vercel.json` - Deployment settings

### Environment Files (not in git)

- `.env.local` - Local environment variables
- `.env.development` - Development settings
- `.env.production` - Production settings (Vercel)

## Key Features

### Authentication & Authorization

- **Supabase Auth**: JWT-based authentication
- **Role-Based Access**: Admin → Coach → Athlete hierarchy
- **RLS Policies**: Row-level security on all tables
- **Server-Side Validation**: Protected API routes

### Data Flow

```
User Action → Component → API Route → Auth Check → Database → Response
```

### PWA Features

- Offline capability
- Installable on mobile
- Service worker caching
- Push notifications (TODO)

## Development Workflow

1. **Setup**: Follow `docs/guides/QUICK_START_PLAN.md`
2. **Development**: Run `npm run dev`
3. **Testing**: Run `npm run typecheck` and `npm run build`
4. **Deployment**: Use `./scripts/deployment/deploy.sh`

## Best Practices

### File Placement Rules (ENFORCED)

**✅ KEEP in Root:**

- Essential configuration files only (package.json, tsconfig.json, etc.)
- Core documentation (README, ARCHITECTURE, CHANGELOG, PROJECT_STRUCTURE)
- Directory folders (src/, docs/, scripts/, etc.)

**❌ NEVER in Root:**

- Loose markdown files (except core 4)
- Temporary scripts (.sh, .mjs)
- Planning documents → move to /docs/guides/
- Audit reports → move to /docs/reports/
- Completion summaries → move to /docs/reports/
- Checklists → move to /docs/checklists/
- Loose utility files
- Temporary/test files

### Where Things Go

```
/src/                  → ALL application source code
/docs/reports/         → All audit/completion reports (50+ files)
/docs/guides/          → All how-to guides and quick refs (45+ files)
/docs/checklists/      → All process checklists (10+ files)
/docs/ (root level)    → Major documentation (DATABASE_SCHEMA.md, etc.)
/scripts/database/     → Database migrations, seeds, setup
/scripts/dev/          → Development tools, server scripts
/scripts/deployment/   → Production deployment scripts
/scripts/analysis/     → Performance and code analysis
/config/archive/       → Old config files
```

### Component Organization

**Feature Components** - `/components/` root

```typescript
// Single-responsibility, reusable components
WorkoutView.tsx;
WorkoutLive.tsx;
GroupAssignmentModal.tsx;
```

**Shared UI Components** - `/components/ui/`

```typescript
// Design system components
Typography.tsx; // Display, Heading, Body, Label, Caption
Input.tsx; // Input, Textarea, Select
Button.tsx; // All button variants
Modal.tsx; // ModalBackdrop, ModalHeader, ModalContent, ModalFooter
Badge.tsx; // Status badges
```

**Feature Sub-components** - `/components/feature-name/`

```typescript
// Components specific to a feature
/components/koortuw - editor / ExerciseItem.tsx;
GroupControls.tsx;
ExerciseLibraryPanel.tsx;
```

### File Naming Conventions

**React Components**: `PascalCase.tsx`

```
WorkoutEditor.tsx
AthleteCard.tsx
GroupFormModal.tsx
```

**Utilities**: `kebab-case.ts`

```
auth-utils.ts
api-client.ts
date-helpers.ts
```

**Scripts**: `kebab-case.mjs` or `.sh`

```
migrate-database.mjs
export-schema.sh
dev-persistent.sh
```

**API Routes**: `route.ts` in feature folders

```
/api/workouts/route.ts         # GET /api/workouts, POST /api/workouts
/api/workouts/[id]/route.ts   # GET/PUT/DELETE /api/workouts/:id
```

**Types**: `PascalCase` interfaces/types, `camelCase` variables

```typescript
interface WorkoutPlan { }      // PascalCase
type SessionStatus = ...       // PascalCase
const workoutData = ...        // camelCase
const API_ENDPOINT = ...       // SCREAMING_SNAKE_CASE for constants
```

### Documentation Organization

**Major Documentation** (docs/ root):

- DATABASE_SCHEMA.md (592 lines - complete schema reference)
- ASSIGNMENT*SYSTEM*\*.md (multi-file system documentation)
- UX*AUDIT*\*.md (user experience audits)

**Reports** (docs/reports/):

- \*\_COMPLETE.md - Completion reports
- \*\_AUDIT.md - Audit findings
- \*\_SUMMARY.md - Implementation summaries
- CRASH_FIXES_SUMMARY.md - Stability improvements

**Guides** (docs/guides/):

- \*\_GUIDE.md - How-to guides
- \*\_QUICK_REF.md - Quick reference sheets
- QUICK*START*\*.md - Getting started guides
- COMPONENT_USAGE_STANDARDS.md - Design system rules

**Checklists** (docs/checklists/):

- PRODUCTION_DEPLOYMENT_CHECKLIST.md
- \*-checklist.md - Process checklists
- \*-migration.md - Migration guides

### Maintenance Guidelines

**Daily:**

- Run `git status` - ensure no stray files in root
- Clean `.DS_Store`: `find . -name ".DS_Store" -delete`
- Check TypeScript: `npm run typecheck`

**Weekly:**

- Review root for new loose files
- Move documentation to proper /docs/ folders
- Archive old temporary files
- Update CHANGELOG.md with progress

**Monthly:**

- Review /docs/ organization
- Clean up old log files
- Update .gitignore if needed
- Verify all links in documentation

### Clean Root Achievement

**Before** (November 1, 2025): 80+ files in root
**After** (November 10, 2025): 24 items in root

**Reduction**: 70% cleaner, professional structure ✅

See `docs/reports/ROOT_DIRECTORY_SUMMARY.md` for complete cleanup documentation.

- **Components** → `/src/components/`
- **API Routes** → `/src/app/api/`
- **Pages** → `/src/app/`
- **Utilities** → `/src/lib/`
- **Types** → `/src/types/`
- **Scripts** → `/scripts/{category}/`
- **Docs** → `/docs/{category}/`

### Naming Conventions

- **Components**: PascalCase (e.g., `WorkoutEditor.tsx`)
- **Utilities**: kebab-case (e.g., `api-client.ts`)
- **API Routes**: kebab-case folders (e.g., `/api/workout-sessions/`)
- **Types**: PascalCase interfaces (e.g., `WorkoutPlan`)

### Import Paths

Use absolute imports with `@/` alias:

```typescript
import { WorkoutEditor } from "@/components/WorkoutEditor";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";
```

## Maintenance

### Adding New Features

1. Create types in `/src/types/`
2. Add API route in `/src/app/api/`
3. Create components in `/src/components/`
4. Add page in `/src/app/`
5. Update documentation

### Cleaning Up

- Archive old configs to `/config/archive/`
- Move test scripts to `/scripts/database/`
- Document changes in `CHANGELOG.md`
- Update `MVP_ROADMAP.md` progress

## Related Documentation

- **Architecture**: See `ARCHITECTURE.md`
- **API Documentation**: See `docs/reports/API_AUDIT.md`
- **Security**: See `docs/reports/SECURITY_AUDIT_REPORT.md`
- **Development**: See `docs/guides/DEV_SERVER_GUIDE.md`
- **Deployment**: See `docs/guides/DEPLOYMENT_GUIDE.md`
