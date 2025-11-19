#!/bin/bash

# Production deployment script for LiteWork
echo "🚀 Starting LiteWork production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from project root."
    exit 1
fi

run_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Deploy manually from dashboard."
        return 1
    fi

    vercel --prod
    if [ $? -eq 0 ]; then
        print_status "Deployment to Vercel successful"
    else
        print_error "Vercel deployment failed"
        exit 1
    fi
}

echo "🎯 LiteWork Production Deployment"
echo "================================="

# Reuse unified verification with CI-friendly defaults
node ./scripts/deployment/deploy-verify.mjs --ci --with-tests "$@"

echo ""
echo "🔒 Running security audit (npm audit --audit-level=moderate)"
if npm audit --audit-level=moderate; then
    print_status "Security audit passed"
else
    print_warning "Security audit reported issues. Review before continuing."
fi

echo ""
echo "📊 Checking for optional performance analysis script"
if [ -f "scripts/analysis/contrast-audit.mjs" ]; then
    node scripts/analysis/contrast-audit.mjs || print_warning "Performance analysis script reported issues"
else
    print_warning "No performance analysis script found"
fi

if [ -z "$CI" ]; then
    echo ""
    echo "🚀 Deploying via Vercel CLI"
    run_vercel_cli || true
else
    print_status "CI environment detected, skipping manual Vercel deploy"
fi

echo ""
echo "🎉 Production deployment workflow complete"