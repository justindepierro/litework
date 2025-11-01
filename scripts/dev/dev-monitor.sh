#!/bin/bash

# LiteWork Development Server Monitor
# This script monitors the Next.js development server and automatically restarts it if it crashes

set -e

PROJECT_DIR="/Users/justindepierro/Documents/LiteWork"
PORT=3000
LOG_FILE="$PROJECT_DIR/dev-server.log"
PID_FILE="$PROJECT_DIR/dev-server.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Function to clean up processes on exit
cleanup() {
    log "Cleaning up..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null || true
            sleep 2
            kill -9 "$PID" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining Next.js processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    
    success "Cleanup completed"
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Function to check if server is healthy
check_server_health() {
    local retries=5
    local count=0
    
    while [ $count -lt $retries ]; do
        if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
            return 0
        fi
        count=$((count + 1))
        sleep 2
    done
    return 1
}

# Function to start the development server
start_server() {
    log "Starting development server..."
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Clean up any existing .next directory and cache
    rm -rf .next
    rm -rf node_modules/.cache
    
    # Start the server in background
    npm run dev > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Save PID
    echo "$SERVER_PID" > "$PID_FILE"
    
    log "Development server started with PID: $SERVER_PID"
    
    # Wait a moment for server to start
    sleep 5
    
    # Check if server is healthy
    if check_server_health; then
        success "Development server is running and healthy on http://localhost:$PORT"
        return 0
    else
        error "Development server failed to start properly"
        return 1
    fi
}

# Function to monitor the server
monitor_server() {
    local restart_count=0
    local max_restarts=10
    
    while true; do
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            
            # Check if process is still running
            if ! kill -0 "$PID" 2>/dev/null; then
                error "Development server process died (PID: $PID)"
                
                if [ $restart_count -lt $max_restarts ]; then
                    restart_count=$((restart_count + 1))
                    warning "Attempting restart #$restart_count..."
                    
                    # Clean up
                    rm -f "$PID_FILE"
                    pkill -f "next" 2>/dev/null || true
                    sleep 3
                    
                    # Restart server
                    if start_server; then
                        restart_count=0  # Reset counter on successful restart
                    fi
                else
                    error "Maximum restart attempts ($max_restarts) reached. Exiting."
                    exit 1
                fi
            else
                # Process is running, check if it's responding
                if ! check_server_health; then
                    warning "Server process exists but not responding to HTTP requests"
                    
                    # Try to restart
                    kill "$PID" 2>/dev/null || true
                    sleep 2
                    kill -9 "$PID" 2>/dev/null || true
                    rm -f "$PID_FILE"
                    
                    if [ $restart_count -lt $max_restarts ]; then
                        restart_count=$((restart_count + 1))
                        warning "Restarting unresponsive server (attempt #$restart_count)..."
                        sleep 3
                        start_server
                    fi
                fi
            fi
        else
            warning "PID file not found, starting server..."
            start_server
        fi
        
        # Wait before next check
        sleep 10
    done
}

# Main execution
main() {
    log "=== LiteWork Development Server Monitor Starting ==="
    log "Project: $PROJECT_DIR"
    log "Port: $PORT"
    log "Log file: $LOG_FILE"
    
    # Initial cleanup
    cleanup
    
    # Start the server
    if start_server; then
        log "=== Monitoring started. Press Ctrl+C to stop ==="
        monitor_server
    else
        error "Failed to start development server"
        exit 1
    fi
}

# Run if script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi