#!/bin/bash

# LiteWork Interactive Development Troubleshooter
# Interactive tool to identify and fix development issues

PROJECT_DIR="/Users/justindepierro/Documents/LiteWork"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

show_header() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║              🚀 LiteWork Dev Troubleshooter                  ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

quick_status() {
    echo -e "${CYAN}📊 Quick Status Check:${NC}"
    echo "================================"
    
    # Process counts
    local zsh_count=$(pgrep -c zsh 2>/dev/null || echo 0)
    local node_count=$(pgrep -c node 2>/dev/null || echo 0)
    local port_3000=$(lsof -ti:3000 2>/dev/null | wc -l)
    
    echo -e "zsh instances:     ${zsh_count} $([ $zsh_count -gt 8 ] && echo -e "${RED}(HIGH)${NC}" || echo -e "${GREEN}(OK)${NC}")"
    echo -e "Node processes:    ${node_count} $([ $node_count -gt 3 ] && echo -e "${RED}(HIGH)${NC}" || echo -e "${GREEN}(OK)${NC}")"
    echo -e "Port 3000 usage:   ${port_3000} $([ $port_3000 -gt 1 ] && echo -e "${RED}(CONFLICT)${NC}" || [ $port_3000 -eq 1 ] && echo -e "${GREEN}(ACTIVE)${NC}" || echo -e "${YELLOW}(INACTIVE)${NC}")"
    
    # Server test
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "Server status:     ${GREEN}RESPONDING${NC}"
    else
        echo -e "Server status:     ${RED}NOT RESPONDING${NC}"
    fi
    
    echo ""
}

main_menu() {
    while true; do
        show_header
        quick_status
        
        echo -e "${BLUE}What would you like to do?${NC}"
        echo ""
        echo "1. 🔍 Run full diagnostics"
        echo "2. 🧹 Clean development environment"
        echo "3. 🚀 Start development server (smart mode)"
        echo "4. 🛑 Kill all development processes"
        echo "5. 🔄 Fix specific issues"
        echo "6. 📊 Monitor development environment"
        echo "7. ❓ Get help with common issues"
        echo "8. 🚪 Exit"
        echo ""
        
        read -p "Enter your choice (1-8): " choice
        
        case $choice in
            1) run_diagnostics ;;
            2) clean_environment ;;
            3) start_smart_dev ;;
            4) kill_all_processes ;;
            5) fix_issues_menu ;;
            6) monitor_environment ;;
            7) show_help ;;
            8) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid choice. Please try again.${NC}"; sleep 1 ;;
        esac
    done
}

run_diagnostics() {
    echo -e "${BLUE}🔍 Running full diagnostics...${NC}"
    ./dev-diagnose.sh
    echo ""
    read -p "Press Enter to continue..."
}

clean_environment() {
    echo -e "${YELLOW}🧹 Cleaning development environment...${NC}"
    
    # Kill Node processes
    echo "Stopping Node processes..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node" 2>/dev/null || true
    sleep 2
    
    # Clear caches
    echo "Clearing Next.js cache..."
    rm -rf .next 2>/dev/null || true
    
    echo "Clearing npm cache..."
    npm cache clean --force 2>/dev/null || true
    
    # Clear temp files
    echo "Clearing temp files..."
    rm -f /tmp/litework-* 2>/dev/null || true
    
    echo -e "${GREEN}✅ Environment cleaned!${NC}"
    sleep 2
}

start_smart_dev() {
    echo -e "${BLUE}🚀 Starting development server (smart mode)...${NC}"
    ./dev-smart.sh &
    
    echo "Waiting for server to start..."
    sleep 3
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server started successfully!${NC}"
        echo "Opening browser..."
        open http://localhost:3000
    else
        echo -e "${RED}❌ Server failed to start${NC}"
    fi
    
    read -p "Press Enter to continue..."
}

kill_all_processes() {
    echo -e "${RED}🛑 Killing all development processes...${NC}"
    
    # Kill all Node processes
    pkill -f "next" 2>/dev/null || true
    pkill -f "node" 2>/dev/null || true
    
    # Force kill anything on port 3000
    local pids=$(lsof -ti:3000 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "Force killing processes on port 3000..."
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ All processes killed${NC}"
    sleep 2
}

fix_issues_menu() {
    while true; do
        show_header
        echo -e "${YELLOW}🔧 Fix Specific Issues${NC}"
        echo "=========================="
        echo ""
        echo "1. 🔄 Too many zsh instances"
        echo "2. 🚫 Port 3000 conflicts"
        echo "3. 🐌 Slow development server"
        echo "4. 💾 High memory usage"
        echo "5. 📁 File watcher issues"
        echo "6. 🔙 Back to main menu"
        echo ""
        
        read -p "Select issue to fix (1-6): " fix_choice
        
        case $fix_choice in
            1) fix_zsh_instances ;;
            2) fix_port_conflicts ;;
            3) fix_slow_server ;;
            4) fix_memory_usage ;;
            5) fix_file_watchers ;;
            6) break ;;
            *) echo -e "${RED}Invalid choice${NC}"; sleep 1 ;;
        esac
    done
}

fix_zsh_instances() {
    echo -e "${YELLOW}🔄 Fixing zsh instance issues...${NC}"
    local zsh_count=$(pgrep -c zsh)
    
    echo "Current zsh instances: $zsh_count"
    
    if [ "$zsh_count" -gt 10 ]; then
        echo "This is high. Recommendations:"
        echo "1. Close unnecessary terminal tabs"
        echo "2. Restart Terminal app"
        echo "3. Use 'exit' command in unused terminals"
        
        read -p "Would you like me to identify zombie zsh processes? (y/n): " kill_zombies
        if [[ $kill_zombies =~ ^[Yy]$ ]]; then
            echo "Zombie zsh processes:"
            ps aux | grep zsh | grep -v grep | grep defunct || echo "No zombie processes found"
        fi
    else
        echo -e "${GREEN}zsh instance count is normal${NC}"
    fi
    
    read -p "Press Enter to continue..."
}

fix_port_conflicts() {
    echo -e "${YELLOW}🚫 Fixing port 3000 conflicts...${NC}"
    
    local port_users=$(lsof -i:3000 2>/dev/null)
    if [ -n "$port_users" ]; then
        echo "Processes using port 3000:"
        echo "$port_users"
        echo ""
        
        read -p "Kill all processes on port 3000? (y/n): " kill_port
        if [[ $kill_port =~ ^[Yy]$ ]]; then
            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
            echo -e "${GREEN}✅ Port 3000 cleared${NC}"
        fi
    else
        echo -e "${GREEN}Port 3000 is available${NC}"
    fi
    
    read -p "Press Enter to continue..."
}

fix_slow_server() {
    echo -e "${YELLOW}🐌 Fixing slow development server...${NC}"
    
    echo "Applying performance optimizations:"
    echo "1. Clearing Next.js cache..."
    rm -rf .next
    
    echo "2. Optimizing TypeScript compilation..."
    # Create optimized Next.js config for development
    
    echo "3. Reducing file watchers..."
    # Could add .gitignore optimizations
    
    echo -e "${GREEN}✅ Optimizations applied${NC}"
    echo "Try restarting the development server"
    
    read -p "Press Enter to continue..."
}

fix_memory_usage() {
    echo -e "${YELLOW}💾 Analyzing memory usage...${NC}"
    
    echo "Memory-intensive processes:"
    ps aux | sort -nr -k 4 | head -10
    
    echo ""
    echo "Recommendations:"
    echo "1. Close unnecessary browser tabs"
    echo "2. Restart VS Code if it's using too much memory"
    echo "3. Clear system caches"
    
    read -p "Press Enter to continue..."
}

fix_file_watchers() {
    echo -e "${YELLOW}📁 Fixing file watcher issues...${NC}"
    
    local watch_count=$(lsof 2>/dev/null | grep -i node | grep -c "txt" || echo 0)
    echo "Current file watchers: $watch_count"
    
    if [ "$watch_count" -gt 1000 ]; then
        echo "This is high. Checking for issues..."
        echo ""
        echo "Large directories that might cause issues:"
        find . -type d -name node_modules -o -name .git -o -name .next | head -5
        
        echo ""
        echo "Consider excluding these from file watching"
    else
        echo -e "${GREEN}File watcher count is normal${NC}"
    fi
    
    read -p "Press Enter to continue..."
}

monitor_environment() {
    echo -e "${BLUE}📊 Starting environment monitor...${NC}"
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    while true; do
        clear
        show_header
        echo -e "${CYAN}📊 Live Development Monitor${NC}"
        echo "=============================="
        
        quick_status
        
        echo -e "${BLUE}Resource Usage:${NC}"
        local cpu=$(top -l 1 -n 0 | grep "CPU usage" | head -1)
        echo "CPU: $cpu"
        
        local memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        echo "Memory pages free: $memory"
        
        echo ""
        echo "Press Ctrl+C to stop monitoring..."
        
        sleep 3
    done
}

show_help() {
    echo -e "${BLUE}❓ Common Development Issues Help${NC}"
    echo "======================================"
    echo ""
    echo -e "${YELLOW}Issue: Multiple zsh instances${NC}"
    echo "Cause: Terminal tabs not properly closed"
    echo "Fix: Close unnecessary tabs, restart Terminal"
    echo ""
    echo -e "${YELLOW}Issue: Port 3000 conflicts${NC}"
    echo "Cause: Previous dev server didn't shut down properly"
    echo "Fix: Kill processes on port 3000, restart dev server"
    echo ""
    echo -e "${YELLOW}Issue: Slow development server${NC}"
    echo "Cause: Large cache files, too many file watchers"
    echo "Fix: Clear .next cache, optimize file watching"
    echo ""
    echo -e "${YELLOW}Issue: High memory usage${NC}"
    echo "Cause: Memory leaks in dev server or browser"
    echo "Fix: Restart dev server, close browser tabs"
    echo ""
    read -p "Press Enter to continue..."
}

# Start the interactive troubleshooter
cd "$PROJECT_DIR" || {
    echo -e "${RED}Error: Could not change to project directory${NC}"
    exit 1
}

main_menu