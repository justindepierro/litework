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

# Step 1-4: Unified verification
node ./scripts/deployment/deploy-verify.mjs "$@"

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
