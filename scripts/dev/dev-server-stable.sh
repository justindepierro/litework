#!/bin/bash

# Stable Dev Server with Auto-Restart
# This script monitors the dev server and automatically restarts it if it crashes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}🚀 Starting Stable Dev Server...${NC}"
echo -e "${BLUE}   Project: $PROJECT_DIR${NC}"
echo -e "${BLUE}   Auto-restart: ENABLED${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}⚠️  Shutting down dev server...${NC}"
    # Kill all node processes related to next dev
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

# Trap Ctrl+C and other exit signals
trap cleanup SIGINT SIGTERM EXIT

# Counter for restarts
RESTART_COUNT=0
MAX_RESTARTS=10
RESTART_COOLDOWN=5

while true; do
    echo -e "${GREEN}▶️  Starting Next.js dev server (Attempt $((RESTART_COUNT + 1)))...${NC}"
    
    # Start the dev server
    npm run dev 2>&1 &
    DEV_PID=$!
    
    # Wait for the process
    wait $DEV_PID
    EXIT_CODE=$?
    
    # If we get here, the server has stopped
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Dev server exited cleanly${NC}"
        break
    else
        echo -e "${RED}❌ Dev server crashed with exit code $EXIT_CODE${NC}"
        
        # Check if we've exceeded max restarts
        if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
            echo -e "${RED}🛑 Maximum restart attempts ($MAX_RESTARTS) reached. Please check for errors.${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}⏳ Waiting ${RESTART_COOLDOWN}s before restarting...${NC}"
        sleep $RESTART_COOLDOWN
        
        # Clear .next cache every 3 restarts to prevent corruption
        if [ $((RESTART_COUNT % 3)) -eq 0 ]; then
            echo -e "${YELLOW}🧹 Clearing .next cache...${NC}"
            rm -rf .next
        fi
    fi
done
