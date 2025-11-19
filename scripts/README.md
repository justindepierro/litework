# Scripts Directory

Utility scripts for development, deployment, and maintenance.

## Directory Structure

### `/database`

Database management scripts for schema setup, migrations, and data seeding.

- `*.sql` - SQL schema files
- `create-*.mjs` - User/profile creation scripts
- `migrate-*.mjs` - Database migration scripts
- `check-*.mjs` - Schema validation scripts
- `smoke-test-workouts.mjs` - Supabase workout/athlete-group smoke tests

### `/dev`

Development environment scripts and tools.

- `dev-*.sh` - Development server management
- `check-dev-env.mjs` - Environment validation
- `fix-vscode-permissions.sh` - VSCode permission fixes

### `/deployment`

Production deployment scripts.

- `deploy.sh` - Main deployment script with pre-flight checks
- `deploy-production.sh` - Legacy production deployment

### `/analysis`

Performance and code analysis tools.

- `analyze-performance.mjs` - Performance metrics analysis
- `analyze-tokens.mjs` - Design token analysis

## Usage

All scripts should be run from the project root:

```bash
# Database setup
node scripts/database/check-schema.mjs

# Development
./scripts/dev/dev-smart.sh

# Deployment
./scripts/deployment/deploy.sh
```
