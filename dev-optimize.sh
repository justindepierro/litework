#!/bin/bash

# LiteWork Development Server Optimization Script
# This script ensures clean development environment startup

echo "🔧 Optimizing LiteWork development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Kill any existing Next.js processes
print_info "Cleaning up existing Next.js processes..."
pkill -f "next" 2>/dev/null && print_status "Killed existing Next.js processes" || print_info "No Next.js processes to kill"

# 2. Kill any processes using port 3000
print_info "Freeing up port 3000..."
PORT_PID=$(lsof -ti :3000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    kill -9 $PORT_PID 2>/dev/null && print_status "Freed port 3000" || print_warning "Could not free port 3000"
else
    print_status "Port 3000 is already free"
fi

# 3. Clean Next.js cache
print_info "Cleaning Next.js cache..."
if [ -d ".next" ]; then
    rm -rf .next && print_status "Removed .next directory"
else
    print_info ".next directory doesn't exist"
fi

# 4. Clean node_modules cache if needed
if [ "$1" = "--deep-clean" ]; then
    print_info "Deep cleaning: removing node_modules..."
    rm -rf node_modules
    print_info "Reinstalling dependencies..."
    npm install
    print_status "Dependencies reinstalled"
fi

# 5. Verify environment
print_info "Verifying development environment..."

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check if package.json exists
if [ -f "package.json" ]; then
    print_status "package.json found"
else
    print_error "package.json not found!"
    exit 1
fi

# 6. Start development server with optimized settings
print_info "Starting optimized development server..."
echo ""
echo -e "${GREEN}🚀 Starting LiteWork development server...${NC}"
echo -e "${BLUE}📝 Server will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}⚡ Using Next.js with Turbopack for fast refresh${NC}"
echo ""

# Start with optimized settings
npm run dev

# If we get here, the server was stopped
echo ""
print_info "Development server stopped."