#!/bin/bash

# Smart Development Wrapper for LiteWork
# Handles the most common development pain points automatically

set -e  # Exit on error

# Configuration
PROJECT_DIR="$(pwd)"
PORT=3000
MAX_RETRIES=3
RETRY_DELAY=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Function to print with timestamp
log() {
    echo -e "[$(date '+%H:%M:%S')] $1"
}

error() {
    log "${RED}ERROR: $1${NC}"
}

success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

info() {
    log "${BLUE}INFO: $1${NC}"
}

# Function to check if port is in use
is_port_in_use() {
    lsof -i :$PORT >/dev/null 2>&1
}

# Function to kill processes on port
kill_port() {
    local pids=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        success "Freed port $PORT"
        sleep 1
    fi
}

# Function to cleanup processes
cleanup_processes() {
    info "Cleaning up development processes..."
    
    # Kill Next.js processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "turbopack" 2>/dev/null || true
    
    # Kill port
    kill_port
    
    # Wait a moment
    sleep 2
}

# Function to check system resources
check_resources() {
    # Check available memory (basic check)
    local available_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local memory_gb=$((available_memory * 4096 / 1024 / 1024 / 1024))
    
    if [ $memory_gb -lt 1 ]; then
        warning "Low memory available: ${memory_gb}GB"
        return 1
    fi
    
    # Check disk space
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 95 ]; then
        warning "Disk space critically low: ${disk_usage}%"
        return 1
    fi
    
    return 0
}

# Function to prepare environment
prepare_environment() {
    info "Preparing development environment..."
    
    # Clean up processes first
    cleanup_processes
    
    # Remove Next.js cache
    if [ -d ".next" ]; then
        rm -rf .next
        success "Cleared .next cache"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        warning "node_modules missing. Installing dependencies..."
        npm install
    fi
    
    # Set environment variables
    export NODE_ENV=development
    export NEXT_TELEMETRY_DISABLED=1
    export NODE_OPTIONS="--max-old-space-size=4096"
    
    success "Environment prepared"
}

# Function to start development server with retry logic
start_dev_server() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        info "Starting development server (attempt $((retry_count + 1))/$MAX_RETRIES)..."
        
        # Check if port is already in use
        if is_port_in_use; then
            warning "Port $PORT is in use. Cleaning up..."
            kill_port
            sleep 2
        fi
        
        # Start the server in background
        npm run dev &
        local server_pid=$!
        
        # Wait for server to start
        info "Waiting for server to start..."
        local wait_count=0
        local max_wait=30
        
        while [ $wait_count -lt $max_wait ]; do
            if is_port_in_use; then
                # Test if server responds
                if curl -s -f http://localhost:$PORT >/dev/null 2>&1; then
                    success "Development server started successfully!"
                    success "🚀 Server running at http://localhost:$PORT"
                    
                    # Wait for the server process (bring to foreground)
                    wait $server_pid
                    return 0
                else
                    info "Server on port $PORT but not responding yet..."
                fi
            fi
            
            # Check if process is still running
            if ! kill -0 $server_pid 2>/dev/null; then
                error "Server process died unexpectedly"
                break
            fi
            
            sleep 1
            ((wait_count++))
        done
        
        # If we get here, startup failed
        error "Failed to start server on attempt $((retry_count + 1))"
        kill $server_pid 2>/dev/null || true
        cleanup_processes
        
        ((retry_count++))
        
        if [ $retry_count -lt $MAX_RETRIES ]; then
            warning "Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    done
    
    error "Failed to start development server after $MAX_RETRIES attempts"
    return 1
}

# Signal handlers
cleanup_and_exit() {
    echo ""
    info "Shutting down development server..."
    cleanup_processes
    success "Development server stopped"
    exit 0
}

# Trap signals
trap cleanup_and_exit INT TERM

# Main execution
main() {
    echo -e "${BOLD}${PURPLE}🔧 LiteWork Smart Development Server${NC}"
    echo -e "${PURPLE}════════════════════════════════════════${NC}"
    
    # Check system resources
    if ! check_resources; then
        warning "System resources are low. Performance may be affected."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Prepare environment
    prepare_environment
    
    # Start server
    start_dev_server
}

# Run main function
main "$@"