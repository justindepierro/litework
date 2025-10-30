#!/bin/bash

# Advanced Development Environment Manager for LiteWork
# Addresses persistent development issues and provides robust tooling

set -e  # Exit on any error

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Icons for better UX
SUCCESS="✅"
WARNING="⚠️ "
ERROR="❌"
INFO="ℹ️ "
ROCKET="🚀"
CLEAN="🧹"
CHECK="🔍"
GEAR="⚙️ "

print_header() {
    echo -e "\n${BOLD}${PURPLE}═══════════════════════════════════════${NC}"
    echo -e "${BOLD}${PURPLE}  LiteWork Advanced Development Manager${NC}"
    echo -e "${BOLD}${PURPLE}═══════════════════════════════════════${NC}\n"
}

print_status() {
    echo -e "${GREEN}${SUCCESS}${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}${WARNING}${NC} $1"
}

print_error() {
    echo -e "${RED}${ERROR}${NC} $1"
}

print_info() {
    echo -e "${CYAN}${INFO}${NC} $1"
}

print_section() {
    echo -e "\n${BOLD}${BLUE}${GEAR}$1${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get process info
get_process_info() {
    local process_name=$1
    ps aux | grep "$process_name" | grep -v grep || true
}

# Function to check system health
check_system_health() {
    print_section "System Health Check"
    
    # Check available memory
    local available_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local memory_gb=$((available_memory * 4096 / 1024 / 1024 / 1024))
    
    if [ $memory_gb -lt 2 ]; then
        print_warning "Low available memory: ${memory_gb}GB. Consider closing other applications."
    else
        print_status "Available memory: ${memory_gb}GB"
    fi
    
    # Check disk space
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 90 ]; then
        print_warning "Disk usage high: ${disk_usage}%. Consider cleaning up."
    else
        print_status "Disk usage: ${disk_usage}%"
    fi
    
    # Check file descriptor limits
    local fd_limit=$(ulimit -n)
    if [ $fd_limit -lt 4096 ]; then
        print_warning "File descriptor limit low: $fd_limit. Increasing to 8192."
        ulimit -n 8192 2>/dev/null || print_info "Could not increase fd limit (may require sudo)"
    else
        print_status "File descriptor limit: $fd_limit"
    fi
}

# Advanced process cleanup
advanced_cleanup() {
    print_section "Advanced Process Cleanup"
    
    # Find all Next.js related processes
    local next_pids=$(pgrep -f "next" 2>/dev/null || true)
    local node_dev_pids=$(pgrep -f "node.*dev" 2>/dev/null || true)
    local turbopack_pids=$(pgrep -f "turbopack" 2>/dev/null || true)
    
    # Kill Next.js processes
    if [ ! -z "$next_pids" ]; then
        echo "$next_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo "$next_pids" | xargs kill -KILL 2>/dev/null || true
        print_status "Terminated Next.js processes: $next_pids"
    else
        print_info "No Next.js processes found"
    fi
    
    # Kill development Node processes
    if [ ! -z "$node_dev_pids" ]; then
        echo "$node_dev_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        echo "$node_dev_pids" | xargs kill -KILL 2>/dev/null || true
        print_status "Terminated development Node processes: $node_dev_pids"
    fi
    
    # Clean up port 3000 more thoroughly
    local port_pids=$(lsof -ti :3000 2>/dev/null || true)
    if [ ! -z "$port_pids" ]; then
        echo "$port_pids" | xargs kill -KILL 2>/dev/null || true
        print_status "Freed port 3000 (PIDs: $port_pids)"
        sleep 1
    else
        print_status "Port 3000 is free"
    fi
    
    # Check for zombie processes
    local zombie_count=$(ps aux | awk '$8 ~ /^Z/ { count++ } END { print count+0 }')
    if [ $zombie_count -gt 0 ]; then
        print_warning "Found $zombie_count zombie processes"
    else
        print_status "No zombie processes detected"
    fi
}

# Comprehensive cache cleanup
comprehensive_cleanup() {
    print_section "Comprehensive Cache Cleanup"
    
    # Next.js cache
    if [ -d ".next" ]; then
        rm -rf .next && print_status "Removed .next directory"
    else
        print_info ".next directory doesn't exist"
    fi
    
    # Node modules cache
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache && print_status "Cleared node_modules cache"
    fi
    
    # NPM cache (if requested)
    if [ "$1" = "--deep-clean" ]; then
        npm cache clean --force 2>/dev/null && print_status "Cleared npm cache" || print_warning "Could not clear npm cache"
    fi
    
    # macOS specific caches
    if [ -d "$HOME/Library/Caches/nodejs" ]; then
        rm -rf "$HOME/Library/Caches/nodejs" && print_status "Cleared Node.js system cache"
    fi
    
    # Clear VS Code TypeScript cache
    if [ -d ".vscode" ]; then
        find .vscode -name "*.log" -delete 2>/dev/null && print_status "Cleared VS Code logs" || true
    fi
}

# Environment validation
validate_environment() {
    print_section "Environment Validation"
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local node_major=$(echo $node_version | cut -d. -f1)
    
    if [ $node_major -lt 18 ]; then
        print_error "Node.js version $node_version is too old. Requires Node 18+"
        exit 1
    else
        print_status "Node.js version: $node_version"
    fi
    
    # Check npm version
    local npm_version=$(npm --version)
    print_status "npm version: $npm_version"
    
    # Validate package.json
    if ! npm run dev --dry-run >/dev/null 2>&1; then
        print_error "package.json dev script is invalid"
        exit 1
    else
        print_status "package.json dev script is valid"
    fi
    
    # Check TypeScript
    if command_exists tsc; then
        if npx tsc --noEmit --skipLibCheck >/dev/null 2>&1; then
            print_status "TypeScript compilation successful"
        else
            print_warning "TypeScript compilation has errors (will continue anyway)"
        fi
    fi
    
    # Check for common issues
    if [ -f "package-lock.json" ] && [ -f "yarn.lock" ]; then
        print_warning "Both package-lock.json and yarn.lock exist. Consider removing one."
    fi
}

# Smart dependency check
check_dependencies() {
    print_section "Dependency Health Check"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules missing. Installing dependencies..."
        npm install
        print_status "Dependencies installed"
    else
        # Check if package.json is newer than node_modules
        if [ "package.json" -nt "node_modules" ]; then
            print_warning "package.json is newer than node_modules. Updating dependencies..."
            npm install
            print_status "Dependencies updated"
        else
            print_status "Dependencies are up to date"
        fi
    fi
    
    # Check for peer dependency warnings
    local peer_warnings=$(npm ls 2>&1 | grep "WARN.*peer dep" | wc -l)
    if [ $peer_warnings -gt 0 ]; then
        print_warning "$peer_warnings peer dependency warnings detected"
    fi
}

# Performance optimization
optimize_performance() {
    print_section "Performance Optimization"
    
    # Set optimal Node.js flags
    export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=128"
    print_status "Set Node.js memory optimization flags"
    
    # Set Next.js environment variables for better performance
    export NEXT_TELEMETRY_DISABLED=1
    export NODE_ENV=development
    export FORCE_COLOR=1
    print_status "Set Next.js optimization environment variables"
    
    # Check and set file watcher limits
    if command_exists sysctl; then
        local current_limit=$(sysctl -n kern.maxfilesperproc 2>/dev/null || echo "unknown")
        print_info "Current file limit: $current_limit"
    fi
}

# Start development server with monitoring
start_dev_server() {
    print_section "Starting Development Server"
    
    print_info "Development server configuration:"
    echo -e "  ${CYAN}•${NC} Port: 3000"
    echo -e "  ${CYAN}•${NC} Turbopack: Enabled"
    echo -e "  ${CYAN}•${NC} Environment: Development"
    echo -e "  ${CYAN}•${NC} Hot reload: Enabled"
    echo -e "  ${CYAN}•${NC} TypeScript: Enabled"
    
    echo ""
    echo -e "${BOLD}${GREEN}${ROCKET} Starting LiteWork development server...${NC}"
    echo -e "${CYAN}📝 Local:   http://localhost:3000${NC}"
    echo -e "${CYAN}📱 Network: http://$(ipconfig getifaddr en0 2>/dev/null || echo "192.168.x.x"):3000${NC}"
    echo -e "${YELLOW}⚡ Press Ctrl+C to stop the server${NC}"
    echo ""
    
    # Start with enhanced monitoring
    exec npm run dev
}

# Main execution
main() {
    print_header
    
    # Parse arguments
    DEEP_CLEAN=false
    QUICK_START=false
    
    case "${1:-}" in
        --deep-clean)
            DEEP_CLEAN=true
            ;;
        --quick)
            QUICK_START=true
            ;;
        --help)
            echo "Usage: $0 [--deep-clean|--quick|--help]"
            echo ""
            echo "Options:"
            echo "  --deep-clean  Perform full cleanup including npm cache"
            echo "  --quick       Skip system checks for faster startup"
            echo "  --help        Show this help message"
            exit 0
            ;;
    esac
    
    # Execute based on mode
    if [ "$QUICK_START" = true ]; then
        advanced_cleanup
        optimize_performance
        start_dev_server
    else
        check_system_health
        advanced_cleanup
        if [ "$DEEP_CLEAN" = true ]; then
            comprehensive_cleanup --deep-clean
        else
            comprehensive_cleanup
        fi
        validate_environment
        check_dependencies
        optimize_performance
        start_dev_server
    fi
}

# Run main function with all arguments
main "$@"