# Changelog

All notable changes to LiteWork will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Group name display with color styling in athlete detail modal
- Dynamic group loading in invite form dropdown
- Comprehensive codebase cleanup report

### Changed

- Exercise Library now uses Supabase session tokens instead of localStorage
- Auth system completely unified under auth-client.ts and auth-server.ts

### Fixed

- Login infinite loading screen (users vs profiles table mismatch)
- Exercise Library authentication (localStorage → Supabase session)
- Admin role not inheriting coach permissions in dashboard calendar view
- Groups displaying UUIDs instead of names in athlete detail modal

## [0.8.0] - 2025-11-01 - Sprint 7: Auth System Overhaul

### Added

- New unified auth architecture (auth-client.ts for browser, auth-server.ts for API)
- Comprehensive codebase cleanup report (CODEBASE_CLEANUP_REPORT.md)
- Silent auth error handling (no info leaks to browser console)

### Changed

- **BREAKING**: Migrated all 13 API routes from JWT to Supabase auth
- **BREAKING**: Replaced users table references with correct schema
- Authentication flow now uses Supabase session management exclusively
- API routes use `getCurrentUser()` and `requireCoach()` pattern
- Removed verbose console.log statements from production code

### Removed

- ❌ **700+ lines of dead code removed**
- `src/lib/auth.ts` - Old JWT verification system
- `src/lib/auth-hybrid.ts` - Abandoned hybrid approach
- `src/lib/supabase-auth.ts` - Old auth layer (402 lines)
- `src/app/api/debug/me/route.ts` - Debug endpoint
- `src/app/api/auth/debug/route.ts` - Debug endpoint
- `src/app/debug/me/page.tsx` - Debug page

### Fixed

- Login flow now correctly fetches user from `users` table instead of non-existent `profiles`
- Auth server now reads `Authorization` header properly
- Exercise Library authentication token retrieval
- Admin role permission checks in dashboard (calendar view access)

### Security

- Removed console.error statements that could leak auth details
- Silent fail on auth errors to prevent information disclosure
- All API routes now require proper authentication

## [0.7.0] - 2025-10-30 - Sprint 6: Deployment & Advanced Features

### Added

- Production deployment to Vercel
- TypeScript compilation validation in deployment workflow
- Advanced workout editor features (exercise substitution, progression tracking)
- Comprehensive progress analytics dashboard

### Changed

- Environment configuration secured with key rotation after security incident
- Automated pre-deployment checks via package.json scripts

### Security

- Rotated all Supabase API keys after accidental exposure
- Updated environment variables in production

## [0.6.0] - 2025-10-25 - Sprint 5: UI Enhancement & PWA

### Added

- Enhanced Progressive Web App with v2 service worker
- Improved offline functionality and caching strategies
- Production build optimization

### Changed

- Mobile responsiveness audit completed
- Bundle analysis: 1.75MB optimized assets with proper chunking

## [0.5.0] - 2025-10-20 - Sprint 4: Authentication Enhancement

### Added

- Supabase Auth integration with comprehensive functionality
- Hybrid auth system for backward compatibility during migration

### Changed

- **BREAKING**: Migrated from JWT to Supabase Auth
- Updated AuthContext to use Supabase Auth hooks
- All API routes now use async Supabase verification

### Fixed

- TypeScript compilation and build validation issues

## [0.4.0] - 2025-10-15 - Sprint 3: Database Integration

### Added

- Real Supabase database integration (replaced mock data)
- Database service layer (database-service.ts)
- Seeded initial data (groups, workouts, exercises)

### Changed

- All API routes migrated to use real database
- Maintained backward compatibility during transition

## [0.3.0] - 2025-10-10 - Sprint 2: API Standardization

### Added

- Standardized API response format across all endpoints
- Complete auth guard rollout on all pages

### Changed

- Component refactoring and cleanup
- Error handling improvements

## [0.2.0] - 2025-10-05 - Sprint 1: Foundation Cleanup

### Added

- Consolidated mock data management
- Extracted reusable components
- Standardized API responses

### Removed

- Dead code and obsolete configurations

## [0.1.0] - 2025-09-30 - Initial MVP

### Added

- Basic authentication (login/logout)
- Group management (create, edit, assign athletes)
- Workout builder with exercise library (200+ exercises)
- Exercise grouping (supersets, circuits)
- Mobile-optimized workout viewing
- Live workout mode with set recording
- Basic progress tracking

---

## Version History Summary

| Version | Date       | Sprint                         | Major Changes                    |
| ------- | ---------- | ------------------------------ | -------------------------------- |
| 0.8.0   | 2025-11-01 | Auth Overhaul                  | Unified auth, 700+ lines removed |
| 0.7.0   | 2025-10-30 | Deployment & Advanced Features | Production deploy, analytics     |
| 0.6.0   | 2025-10-25 | UI Enhancement & PWA           | PWA v2, offline support          |
| 0.5.0   | 2025-10-20 | Authentication Enhancement     | JWT → Supabase Auth              |
| 0.4.0   | 2025-10-15 | Database Integration           | Mock data → Real Supabase        |
| 0.3.0   | 2025-10-10 | API Standardization            | Consistent APIs, auth guards     |
| 0.2.0   | 2025-10-05 | Foundation Cleanup             | Tech debt cleanup                |
| 0.1.0   | 2025-09-30 | Initial MVP                    | Core features                    |

---

## Migration Guides

### Upgrading from 0.7.0 to 0.8.0

**Breaking Changes:**

- All API routes now require Supabase auth token in `Authorization: Bearer <token>` header
- Old JWT tokens no longer work
- `localStorage.getItem("auth-token")` no longer used

**Action Required:**

1. Users must log in again after upgrade
2. Frontend code using `localStorage` auth tokens needs migration to `supabase.auth.getSession()`

**Example Migration:**

```typescript
// OLD (0.7.0)
const token = localStorage.getItem("auth-token");

// NEW (0.8.0)
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;
```
