#!/bin/bash

# Persistent Development Server for LiteWork
# Automatically restarts on crashes, file changes, or errors
# Runs until explicitly stopped with Ctrl+C

set -e

# Configuration
PROJECT_DIR="$(pwd)"
PORT=3000
MAX_CONSECUTIVE_FAILURES=5
RESTART_DELAY=3
LOG_FILE="$PROJECT_DIR/.dev-server.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# State tracking
FAILURE_COUNT=0
RESTART_COUNT=0
START_TIME=$(date +%s)

# Function to print with timestamp
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $1" | tee -a "$LOG_FILE"
}

error() {
    log "${RED}❌ ERROR: $1${NC}"
}

success() {
    log "${GREEN}✅ $1${NC}"
}

warning() {
    log "${YELLOW}⚠️  WARNING: $1${NC}"
}

info() {
    log "${BLUE}ℹ️  $1${NC}"
}

banner() {
    log "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${CYAN}${BOLD}  $1${NC}"
    log "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check if port is in use
is_port_in_use() {
    lsof -i :$PORT >/dev/null 2>&1
}

# Function to kill processes on port
kill_port() {
    if is_port_in_use; then
        warning "Port $PORT is in use. Cleaning up..."
        lsof -ti :$PORT | xargs kill -9 2>/dev/null || true
        pkill -f "next.*dev" 2>/dev/null || true
        sleep 2
        
        if is_port_in_use; then
            error "Failed to free port $PORT"
            return 1
        fi
        success "Port $PORT freed"
    fi
}

# Function to check system health
check_health() {
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found. Are you in the project root?"
        return 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        warning "node_modules not found. Installing dependencies..."
        npm install
    fi
    
    # Check available disk space (at least 1GB)
    local free_space=$(df -k . | tail -1 | awk '{print $4}')
    if [ "$free_space" -lt 1048576 ]; then
        warning "Low disk space (less than 1GB free)"
    fi
    
    return 0
}

# Function to start the dev server
start_server() {
    info "Starting Next.js development server (attempt $((RESTART_COUNT + 1)))..."
    
    # Kill any existing processes
    kill_port
    
    # Check system health
    if ! check_health; then
        return 1
    fi
    
    # Start the server
    npm run dev 2>&1 | tee -a "$LOG_FILE" &
    local PID=$!
    
    # Wait a bit for server to start
    sleep 5
    
    # Check if process is still running
    if ! kill -0 $PID 2>/dev/null; then
        error "Server failed to start (PID $PID exited)"
        return 1
    fi
    
    # Check if port is now in use (server is listening)
    if ! is_port_in_use; then
        error "Server process running but not listening on port $PORT"
        kill $PID 2>/dev/null || true
        return 1
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    success "Development server started successfully (PID: $PID)"
    info "Server running at: ${BOLD}http://localhost:$PORT${NC}"
    
    # Monitor the process
    monitor_server $PID
}

# Function to monitor server health
monitor_server() {
    local PID=$1
    local last_check=$(date +%s)
    
    while true; do
        sleep 5
        
        # Check if process is still running
        if ! kill -0 $PID 2>/dev/null; then
            warning "Server process (PID $PID) has stopped"
            return 1
        fi
        
        # Check if port is still in use
        if ! is_port_in_use; then
            warning "Server not responding on port $PORT"
            kill $PID 2>/dev/null || true
            return 1
        fi
        
        # Health check every 30 seconds
        local now=$(date +%s)
        if [ $((now - last_check)) -ge 30 ]; then
            # Try to ping the health endpoint
            if curl -sf http://localhost:$PORT/api/health >/dev/null 2>&1; then
                : # Health check passed (silent)
            else
                warning "Health check failed (server may be building)"
            fi
            last_check=$now
        fi
    done
}

# Function to handle restart logic
handle_restart() {
    FAILURE_COUNT=$((FAILURE_COUNT + 1))
    
    warning "Server stopped. Failure count: $FAILURE_COUNT/$MAX_CONSECUTIVE_FAILURES"
    
    if [ $FAILURE_COUNT -ge $MAX_CONSECUTIVE_FAILURES ]; then
        error "Too many consecutive failures ($FAILURE_COUNT). Stopping persistent mode."
        error "Check the logs at: $LOG_FILE"
        exit 1
    fi
    
    info "Restarting in $RESTART_DELAY seconds..."
    sleep $RESTART_DELAY
    
    # Exponential backoff for repeated failures
    if [ $FAILURE_COUNT -gt 2 ]; then
        local extra_delay=$((FAILURE_COUNT * 2))
        info "Adding $extra_delay second delay due to repeated failures..."
        sleep $extra_delay
    fi
}

# Function to handle graceful shutdown
cleanup() {
    banner "Shutting Down Persistent Dev Server"
    
    info "Stopping development server..."
    kill_port
    
    local uptime=$(($(date +%s) - START_TIME))
    local hours=$((uptime / 3600))
    local minutes=$(((uptime % 3600) / 60))
    local seconds=$((uptime % 60))
    
    success "Server ran for: ${hours}h ${minutes}m ${seconds}s"
    success "Total restarts: $RESTART_COUNT"
    success "Logs saved to: $LOG_FILE"
    
    exit 0
}

# Register cleanup handler
trap cleanup SIGINT SIGTERM EXIT

# Main execution
main() {
    banner "🚀 LiteWork Persistent Development Server"
    
    info "Press Ctrl+C to stop the server"
    info "Logs: $LOG_FILE"
    echo ""
    
    # Clear old log
    echo "=== New Session: $(date) ===" > "$LOG_FILE"
    
    while true; do
        if start_server; then
            # Server exited normally, reset failure count
            FAILURE_COUNT=0
            warning "Server exited. Restarting..."
        else
            # Server failed to start or crashed
            handle_restart
        fi
    done
}

# Run main function
main
