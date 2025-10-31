# Environment Variables for Vercel Deployment

## 🔑 Required Variables (Must Add to Vercel)

Copy these exact values to Vercel's environment variable settings:

### Database Configuration
```
NEXT_PUBLIC_SUPABASE_URL
Value: https://lzsjaqkhdoqsafptqpnt.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6c2phcWtoZG9xc2FmcHRxcG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MDc1NjUsImV4cCI6MjA3NzM4MzU2NX0.XDxEDT38xxzvTgmYghTvN2yiKS1ozyHI741QYS5imiY

SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6c2phcWtoZG9xc2FmcHRxcG50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTgwNzU2NSwiZXhwIjoyMDc3MzgzNTY1fQ.I7P73pbO1Ae01FPuJMRRbp9TICIkFsVRwboGN293mhY
```

### Authentication
```
JWT_SECRET
Value: litework-production-secret-2025-CHANGE-THIS-TO-RANDOM-STRING
⚠️ IMPORTANT: Generate a new secure secret for production!
You can use: openssl rand -base64 32
```

### Application
```
NEXT_PUBLIC_APP_VERSION
Value: 1.0.0

NODE_ENV
Value: production
```

## 📋 How to Add to Vercel

### Method 1: Via Vercel Dashboard (Easiest)
1. Go to your project on vercel.com
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. For each variable:
   - Enter the name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the value
   - Select environments: Production, Preview, Development (check all three)
   - Click "Add"

### Method 2: Via CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Then paste the value when prompted
```

### Method 3: Import from file
```bash
# Create a file with all variables
vercel env pull .env.production
```

## 🔒 Security Notes

### ⚠️ NEVER Commit These Files
- `.env.local` (already in .gitignore)
- `.env.production`
- Any file with real credentials

### ✅ Safe to Commit
- `.env.local.example` (template only)
- `VERCEL_ENV_REFERENCE.md` (this file - has your actual keys, so be careful!)

### 🔐 Production Security Checklist
- [ ] Change JWT_SECRET to a new random value for production
- [ ] Verify SUPABASE_SERVICE_ROLE_KEY is kept secret (not exposed in client)
- [ ] Enable Row Level Security (RLS) on all Supabase tables
- [ ] Set up proper CORS policies
- [ ] Configure Supabase auth settings

## 📊 Optional Variables (Analytics & Monitoring)

These are not required for deployment but add monitoring capabilities:

```
# Sentry Error Tracking (sentry.io)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# Google Analytics
GOOGLE_ANALYTICS_ID=

# Mixpanel
MIXPANEL_TOKEN=

# PostHog
POSTHOG_API_KEY=
POSTHOG_HOST=
```

## 🚀 Quick Deployment Checklist

1. [ ] Sign up for Vercel account
2. [ ] Connect GitHub repository
3. [ ] Add all required environment variables
4. [ ] Deploy!

Your app will be live at: `https://litework-username.vercel.app`

## 🆘 Troubleshooting

### Build Fails
- Check all required env vars are added
- Check for TypeScript errors: `npm run build`

### Database Connection Fails
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies allow access

### Authentication Fails
- Check JWT_SECRET is set
- Verify Supabase keys match your project
- Check auth configuration in Supabase dashboard
