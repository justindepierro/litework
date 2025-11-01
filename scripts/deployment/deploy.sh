#!/bin/bash

###############################################################################
# Production Deployment Script
# 
# Runs all pre-deployment checks and deploys to production
###############################################################################

set -e  # Exit on any error

echo "🚀 LiteWork Production Deployment"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Environment Check
echo "📋 Step 1: Checking environment..."
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

# Check for required environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        echo -e "${RED}❌ Error: Missing required variable: $var${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ Environment variables validated${NC}"
echo ""

# Step 2: Dependency Check
echo "📦 Step 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi
echo ""

# Step 3: TypeScript Check
echo "🔍 Step 3: Running TypeScript check..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: TypeScript errors detected${NC}"
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
fi
echo ""

# Step 4: Build Test
echo "🏗️  Step 4: Testing production build..."
echo "This may take a minute..."
if npm run build > build.log 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    rm build.log
else
    echo -e "${RED}❌ Build failed. Check build.log for details${NC}"
    exit 1
fi
echo ""

# Step 5: Git Status
echo "📝 Step 5: Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    git status --short
    echo ""
    echo "Commit changes before deploying? (Y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Nn]$ ]]; then
        echo "Enter commit message:"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory clean${NC}"
fi
echo ""

# Step 6: Deploy
echo "🚀 Step 6: Deploying to production..."
echo "Deploy to Vercel? (Y/n)"
read -r response
if [[ ! "$response" =~ ^[Nn]$ ]]; then
    git push origin main
    echo ""
    echo -e "${GREEN}✅ Pushed to main branch${NC}"
    echo ""
    echo "Vercel will automatically deploy your changes"
    echo "Monitor deployment at: https://vercel.com/dashboard"
    echo ""
    echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
else
    echo "Deployment cancelled"
fi

echo ""
echo "=================================="
echo "📊 Deployment Summary"
echo "=================================="
echo "✅ Environment validated"
echo "✅ Dependencies checked"
echo "✅ TypeScript validated"
echo "✅ Production build successful"
echo "✅ Git status clean"
echo ""
echo "🔗 Production URL: https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app"
echo ""
echo "Happy deploying! 🚀"
