#!/bin/bash

# LiteWork Development Diagnostics
# Comprehensive analysis of development environment issues

PROJECT_DIR="/Users/justindepierro/Documents/LiteWork"
REPORT_FILE="/tmp/litework-dev-report.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔍 LiteWork Development Diagnostics${NC}"
echo "Analyzing development environment..."
echo ""

# Initialize report
echo "LiteWork Development Environment Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

diagnostic_summary() {
    echo -e "${CYAN}📋 DIAGNOSTIC SUMMARY${NC}"
    echo "======================================"
    
    # System Info
    echo -e "${BLUE}System:${NC} $(uname -s) $(uname -r)"
    echo -e "${BLUE}Node:${NC} $(node --version 2>/dev/null || echo 'Not installed')"
    echo -e "${BLUE}npm:${NC} $(npm --version 2>/dev/null || echo 'Not installed')"
    echo -e "${BLUE}Shell:${NC} $SHELL"
    echo ""
    
    # Save to report
    {
        echo "SYSTEM INFORMATION"
        echo "------------------"
        echo "OS: $(uname -s) $(uname -r)"
        echo "Node: $(node --version 2>/dev/null || echo 'Not installed')"
        echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
        echo "Shell: $SHELL"
        echo ""
    } >> "$REPORT_FILE"
}

analyze_processes() {
    echo -e "${CYAN}🔄 PROCESS ANALYSIS${NC}"
    echo "======================================"
    
    # Count shells
    local zsh_count=$(pgrep -c zsh 2>/dev/null || echo 0)
    local bash_count=$(pgrep -c bash 2>/dev/null || echo 0)
    
    echo -e "${BLUE}Shell Instances:${NC}"
    echo "  zsh: $zsh_count"
    echo "  bash: $bash_count"
    
    if [ "$zsh_count" -gt 10 ]; then
        echo -e "${RED}  ⚠️  ISSUE: Excessive zsh instances ($zsh_count)${NC}"
    fi
    
    # Node processes
    local node_count=$(pgrep -c node 2>/dev/null || echo 0)
    echo -e "${BLUE}Node processes:${NC} $node_count"
    
    # Detailed Node process info
    if [ "$node_count" -gt 0 ]; then
        echo -e "${BLUE}Node process details:${NC}"
        ps aux | grep node | grep -v grep | while read line; do
            echo "  $line"
        done
    fi
    
    # Port usage
    echo -e "${BLUE}Port 3000 usage:${NC}"
    local port_usage=$(lsof -ti:3000 2>/dev/null | wc -l)
    if [ "$port_usage" -gt 0 ]; then
        lsof -i:3000 2>/dev/null | while read line; do
            echo "  $line"
        done
    else
        echo "  No processes using port 3000"
    fi
    
    echo ""
    
    # Save to report
    {
        echo "PROCESS ANALYSIS"
        echo "----------------"
        echo "zsh instances: $zsh_count"
        echo "bash instances: $bash_count"
        echo "Node processes: $node_count"
        echo "Port 3000 usage: $port_usage"
        echo ""
        if [ "$node_count" -gt 0 ]; then
            echo "Node process details:"
            ps aux | grep node | grep -v grep
            echo ""
        fi
        if [ "$port_usage" -gt 0 ]; then
            echo "Port 3000 details:"
            lsof -i:3000 2>/dev/null
            echo ""
        fi
    } >> "$REPORT_FILE"
}

analyze_files() {
    echo -e "${CYAN}📁 FILE SYSTEM ANALYSIS${NC}"
    echo "======================================"
    
    cd "$PROJECT_DIR" || exit 1
    
    # Check key files
    echo -e "${BLUE}Key files:${NC}"
    for file in package.json next.config.ts tsconfig.json; do
        if [ -f "$file" ]; then
            echo -e "  ✅ $file"
        else
            echo -e "  ❌ $file (missing)"
        fi
    done
    
    # Check directories
    echo -e "${BLUE}Key directories:${NC}"
    for dir in src .next node_modules; do
        if [ -d "$dir" ]; then
            local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
            echo -e "  ✅ $dir ($size)"
        else
            echo -e "  ❌ $dir (missing)"
        fi
    done
    
    # File watchers
    local watch_count=$(lsof 2>/dev/null | grep -i node | grep -c "txt" || echo 0)
    echo -e "${BLUE}File watchers:${NC} $watch_count"
    
    if [ "$watch_count" -gt 2000 ]; then
        echo -e "${RED}  ⚠️  ISSUE: Excessive file watchers${NC}"
    fi
    
    echo ""
    
    # Save to report
    {
        echo "FILE SYSTEM ANALYSIS"
        echo "--------------------"
        echo "Key files status:"
        for file in package.json next.config.ts tsconfig.json; do
            if [ -f "$file" ]; then
                echo "  ✅ $file"
            else
                echo "  ❌ $file (missing)"
            fi
        done
        echo ""
        echo "Directory sizes:"
        for dir in src .next node_modules; do
            if [ -d "$dir" ]; then
                local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
                echo "  $dir: $size"
            fi
        done
        echo ""
        echo "File watchers: $watch_count"
        echo ""
    } >> "$REPORT_FILE"
}

analyze_performance() {
    echo -e "${CYAN}⚡ PERFORMANCE ANALYSIS${NC}"
    echo "======================================"
    
    # Memory usage
    local memory_info=$(vm_stat | grep "Pages free\|Pages active\|Pages inactive\|Pages wired down")
    echo -e "${BLUE}Memory status:${NC}"
    echo "$memory_info" | while read line; do
        echo "  $line"
    done
    
    # CPU usage
    echo -e "${BLUE}CPU usage (last 1 minute):${NC}"
    local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | head -1)
    echo "  $cpu_usage"
    
    # Disk usage
    echo -e "${BLUE}Disk usage:${NC}"
    local disk_usage=$(df -h . | tail -1)
    echo "  $disk_usage"
    
    echo ""
    
    # Save to report
    {
        echo "PERFORMANCE ANALYSIS"
        echo "--------------------"
        echo "Memory info:"
        vm_stat | grep "Pages free\|Pages active\|Pages inactive\|Pages wired down"
        echo ""
        echo "CPU usage:"
        top -l 1 -n 0 | grep "CPU usage" | head -1
        echo ""
        echo "Disk usage:"
        df -h .
        echo ""
    } >> "$REPORT_FILE"
}

test_development_server() {
    echo -e "${CYAN}🚀 DEVELOPMENT SERVER TEST${NC}"
    echo "======================================"
    
    # Test if server is running
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Development server is responding${NC}"
        
        # Test response time
        local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000)
        echo -e "${BLUE}Response time:${NC} ${response_time}s"
        
        if (( $(echo "$response_time > 2.0" | bc -l) )); then
            echo -e "${YELLOW}  ⚠️  Slow response time${NC}"
        fi
    else
        echo -e "${RED}❌ Development server not responding${NC}"
    fi
    
    echo ""
}

generate_recommendations() {
    echo -e "${CYAN}💡 RECOMMENDATIONS${NC}"
    echo "======================================"
    
    local recommendations=()
    
    # Check for issues and generate recommendations
    local zsh_count=$(pgrep -c zsh 2>/dev/null || echo 0)
    if [ "$zsh_count" -gt 10 ]; then
        recommendations+=("🔄 Restart terminal to reduce shell instances")
    fi
    
    local node_count=$(pgrep -c node 2>/dev/null || echo 0)
    if [ "$node_count" -gt 3 ]; then
        recommendations+=("🛑 Kill unnecessary Node processes: pkill -f 'next dev'")
    fi
    
    if [ -d ".next" ]; then
        local cache_size=$(du -sm .next | cut -f1)
        if [ "$cache_size" -gt 500 ]; then
            recommendations+=("🗑️  Clear Next.js cache: rm -rf .next")
        fi
    fi
    
    local watch_count=$(lsof 2>/dev/null | grep -i node | grep -c "txt" || echo 0)
    if [ "$watch_count" -gt 2000 ]; then
        recommendations+=("👁️  Reduce file watchers by excluding unnecessary directories")
    fi
    
    if [ ${#recommendations[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ No major issues detected${NC}"
        recommendations+=("🚀 Try running: npm run dev:smart")
    else
        for rec in "${recommendations[@]}"; do
            echo -e "${YELLOW}$rec${NC}"
        done
    fi
    
    echo ""
    echo -e "${BLUE}📄 Full report saved to: $REPORT_FILE${NC}"
    
    # Save recommendations to report
    {
        echo "RECOMMENDATIONS"
        echo "---------------"
        for rec in "${recommendations[@]}"; do
            echo "$rec"
        done
        echo ""
        echo "Report generated at: $(date)"
    } >> "$REPORT_FILE"
}

# Run all diagnostics
diagnostic_summary
analyze_processes
analyze_files
analyze_performance
test_development_server
generate_recommendations

echo -e "${GREEN}🎯 Diagnostics complete!${NC}"