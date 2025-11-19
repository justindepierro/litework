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

set -o allexport
source .env.local
set +o allexport

required_vars=(
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    RESEND_API_KEY
    FROM_EMAIL
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required variable: $var"
        exit 1
    fi
done

echo "📋 Adding variables from .env.local..."

# Add each variable (one environment at a time)
echo ""
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo ""
echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo ""
echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
printf '%s' "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY development

echo ""
echo "Adding RESEND_API_KEY..."
printf '%s' "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production
printf '%s' "$RESEND_API_KEY" | vercel env add RESEND_API_KEY preview
printf '%s' "$RESEND_API_KEY" | vercel env add RESEND_API_KEY development

echo ""
echo "Adding FROM_EMAIL..."
printf '%s' "$FROM_EMAIL" | vercel env add FROM_EMAIL production
printf '%s' "$FROM_EMAIL" | vercel env add FROM_EMAIL preview
printf '%s' "$FROM_EMAIL" | vercel env add FROM_EMAIL development

echo ""
echo "Adding NEXT_PUBLIC_APP_URL..."
echo "https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel env ls' to verify variables are set"
echo "2. Deploy with 'vercel --prod' or wait for automatic deployment from git push"
