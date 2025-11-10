#!/bin/bash

# Add environment variables to Vercel
# Run this after linking project: vercel link

echo "🔧 Adding environment variables to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install it with: npm i -g vercel"
    exit 1
fi

# Check if project is linked
if [ ! -d .vercel ]; then
    echo "❌ Project not linked. Run 'vercel link' first"
    exit 1
fi

# Read from .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

echo "📋 Adding variables from .env.local..."

# Extract values from .env.local
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_ANON=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
SERVICE_ROLE=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)
RESEND_KEY=$(grep RESEND_API_KEY .env.local | cut -d '=' -f2)
FROM_EMAIL=$(grep FROM_EMAIL .env.local | cut -d '=' -f2-)

# Add each variable (one environment at a time)
echo ""
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo ""
echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$SUPABASE_ANON" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "$SUPABASE_ANON" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo ""
echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "$SERVICE_ROLE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "$SERVICE_ROLE" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
echo "$SERVICE_ROLE" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

echo ""
echo "Adding RESEND_API_KEY..."
echo "$RESEND_KEY" | vercel env add RESEND_API_KEY production
echo "$RESEND_KEY" | vercel env add RESEND_API_KEY preview
echo "$RESEND_KEY" | vercel env add RESEND_API_KEY development

echo ""
echo "Adding FROM_EMAIL..."
echo "$FROM_EMAIL" | vercel env add FROM_EMAIL production
echo "$FROM_EMAIL" | vercel env add FROM_EMAIL preview
echo "$FROM_EMAIL" | vercel env add FROM_EMAIL development

echo ""
echo "Adding NEXT_PUBLIC_APP_URL..."
echo "https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel env ls' to verify variables are set"
echo "2. Deploy with 'vercel --prod' or wait for automatic deployment from git push"
