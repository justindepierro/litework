# Supabase Setup Guide for LiteWork

## Prerequisites
✅ Supabase project created
✅ Supabase JavaScript client installed (`@supabase/supabase-js`)

## Setup Steps

### 1. Get your Supabase credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 2. Set up environment variables
1. Create `.env.local` file in your project root:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secure-jwt-secret-for-local-development
```

### 3. Run the database schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database/schema.sql`
4. Paste and run it in the SQL Editor
5. This will create all necessary tables, policies, and triggers

### 4. Set up Row Level Security (RLS)
The schema already includes RLS policies, but verify:
1. Go to **Authentication** → **Policies**
2. Ensure all tables have appropriate policies enabled
3. Test that coaches can only see their athletes, athletes can only see their own data

### 5. Test the integration
1. Start your development server: `npm run dev`
2. Try creating a coach account through the UI
3. Test creating athletes, groups, and workouts
4. Verify data is properly stored in Supabase

### 6. Update your components to use Supabase
Replace your existing API calls with Supabase:

```typescript
// Old way (mock API)
import { apiClient } from '@/lib/api-client'

// New way (Supabase)
import { supabaseApiClient } from '@/lib/supabase-client'

// Example: Get athletes
const { data: athletes, error } = await supabaseApiClient.getAthletes()
```

## Key Features Enabled

### ✅ **Authentication**
- User signup/signin with email/password
- Automatic session management
- Role-based access (coach/athlete)

### ✅ **Database Operations**
- Athletes management
- Group creation and management
- Workout plans with exercises
- KPI/Personal records tracking
- Progress analytics data

### ✅ **Security**
- Row Level Security (RLS) policies
- Coaches can only access their athletes
- Athletes can only access their own data
- Secure API endpoints

### ✅ **Real-time Capabilities** (future)
- Supabase supports real-time subscriptions
- Can add live workout session updates
- Real-time progress notifications

## Next Steps

1. **Test the setup** - Create a coach account and test all features
2. **Update frontend components** - Replace mock API calls with Supabase calls
3. **Add error handling** - Implement proper error boundaries
4. **Deploy** - Your app is now ready for production deployment!

## Production Deployment

For production:
1. Update environment variables in your hosting platform
2. Set up custom domain in Supabase (optional)
3. Configure email templates for auth
4. Set up database backups
5. Monitor usage and performance

## Troubleshooting

### Common Issues:
- **RLS Policy Errors**: Check that policies allow the current user to access data
- **Type Errors**: Ensure database column names match TypeScript interfaces
- **Auth Errors**: Verify email confirmation is disabled for testing
- **CORS Issues**: Supabase handles CORS automatically for same-origin requests

### Debug Commands:
```typescript
// Check current user
const { data: user } = await supabase.auth.getUser()
console.log('Current user:', user)

// Test database connection
const { data, error } = await supabase.from('users').select('count')
console.log('DB connection:', { data, error })
```

Your LiteWork app is now ready for production with Supabase! 🚀