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

# Check if required environment variables are set
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables in your .env.local file or deployment environment."
        exit 1
    fi
    
    print_status "All required environment variables are set"
}

# Test database connection
test_database() {
    echo "🗄️  Testing database connection..."
    
    if command -v node &> /dev/null; then
        node test-supabase.mjs
        if [ $? -eq 0 ]; then
            print_status "Database connection successful"
        else
            print_error "Database connection failed"
            exit 1
        fi
    else
        print_warning "Node.js not found, skipping database test"
    fi
}

# Run build
run_build() {
    echo "🏗️  Building application..."
    
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Run tests if available
run_tests() {
    echo "🧪 Running tests..."
    
    if npm run test --silent 2>/dev/null; then
        print_status "All tests passed"
    else
        print_warning "No tests found or tests failed"
    fi
}

# Security audit
security_audit() {
    echo "🔒 Running security audit..."
    
    npm audit --audit-level moderate
    if [ $? -eq 0 ]; then
        print_status "Security audit passed"
    else
        print_warning "Security vulnerabilities found. Review before deploying."
    fi
}

# Performance analysis
performance_check() {
    echo "📊 Running performance analysis..."
    
    if [ -f "analyze-performance.mjs" ]; then
        node analyze-performance.mjs
        print_status "Performance analysis completed"
    else
        print_warning "Performance analysis script not found"
    fi
}

# Deploy to Vercel (if CLI is available)
deploy_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        if [ $? -eq 0 ]; then
            print_status "Deployment to Vercel successful"
        else
            print_error "Vercel deployment failed"
            exit 1
        fi
    else
        print_warning "Vercel CLI not found. Deploy manually via Vercel dashboard."
    fi
}

# Main deployment flow
main() {
    echo "🎯 LiteWork Production Deployment"
    echo "================================="
    
    check_env_vars
    test_database
    security_audit
    run_tests
    run_build
    performance_check
    
    # Only deploy if not in CI/CD environment
    if [ -z "$CI" ]; then
        deploy_vercel
    else
        print_status "CI/CD environment detected, skipping manual deployment"
    fi
    
    echo ""
    echo "🎉 Deployment preparation completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Verify environment variables in production"
    echo "2. Test authentication flows"
    echo "3. Monitor performance and errors"
    echo "4. Set up domain and SSL if needed"
    echo ""
    print_status "LiteWork is ready for production! 🏋️"
}

# Run main function
main