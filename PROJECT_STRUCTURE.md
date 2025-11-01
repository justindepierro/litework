# LiteWork Project Structure

Clean, professional directory organization for maintainability and scalability.

## Root Directory

```
litework/
├── 📄 README.md                  # Project overview and quick start
├── 📄 ARCHITECTURE.md            # System architecture and design decisions
├── 📄 CHANGELOG.md               # Version history and changes
├── 📄 MVP_ROADMAP.md             # Feature roadmap and development plan
├── 📄 package.json               # Dependencies and npm scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 next.config.ts             # Next.js configuration
├── 📄 tailwind.config.ts         # Tailwind CSS configuration
├── 📄 eslint.config.mjs          # ESLint configuration
├── 📄 postcss.config.mjs         # PostCSS configuration
├── 📄 vercel.json                # Vercel deployment configuration
├── 📄 middleware.ts              # Next.js middleware
│
├── 📁 src/                       # Application source code
│   ├── app/                      # Next.js App Router pages and API routes
│   ├── components/               # React components
│   ├── contexts/                 # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and services
│   ├── styles/                   # Global styles and design tokens
│   └── types/                    # TypeScript type definitions
│
├── 📁 public/                    # Static assets (served at /)
│   ├── icons/                    # PWA icons
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── 📁 database/                  # Database schemas and migrations
│   ├── schema.sql                # Main database schema
│   ├── exercises-schema.sql     # Exercise library schema
│   ├── exercises-seed.sql       # Exercise seed data
│   └── *.sql                     # Additional schemas
│
├── 📁 scripts/                   # Utility scripts
│   ├── database/                 # Database management scripts
│   ├── dev/                      # Development tools
│   ├── deployment/               # Production deployment scripts
│   └── analysis/                 # Performance and code analysis
│
├── 📁 docs/                      # Documentation
│   ├── guides/                   # Setup and usage guides
│   ├── reports/                  # Technical reports and audits
│   ├── checklists/              # Deployment and launch checklists
│   └── design-tokens.md         # Design system documentation
│
├── 📁 config/                    # Configuration files
│   ├── archive/                  # Old/backup configurations
│   └── vscode-minimal-settings.json
│
├── 📁 .github/                   # GitHub configuration
│   └── copilot-instructions.md  # Copilot context
│
├── 📁 .next/                     # Next.js build output (gitignored)
├── 📁 node_modules/              # Dependencies (gitignored)
└── 📁 .vercel/                   # Vercel deployment data (gitignored)
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
├── AthleteModificationModal.tsx  # Individual athlete customizations
├── BulkOperationModal.tsx        # Bulk athlete operations
├── CalendarView.tsx              # Schedule calendar
├── ExerciseLibrary.tsx           # Exercise browser
├── GroupAssignmentModal.tsx      # Assign workouts to groups
├── GroupFormModal.tsx            # Create/edit athlete groups
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

### File Placement

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
