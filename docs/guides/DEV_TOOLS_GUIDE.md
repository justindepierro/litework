# LiteWork Development Environment Guide

This guide covers the enhanced development tooling created to solve common development issues.

## 🚀 Quick Start

The fastest way to start development with automatic issue detection:

```bash
npm run dev:smart
```

## 🛠️ Available Development Tools

### 1. Smart Development Server (`dev-smart.sh`)
**Purpose**: Intelligent development server with automatic issue detection and health monitoring

**Features**:
- Automatic process cleanup before starting
- Port conflict resolution
- Cache management
- Health monitoring with restart capability
- Resource usage tracking

**Usage**:
```bash
npm run dev:smart
# or directly
./dev-smart.sh
```

### 2. Interactive Troubleshooter (`dev-troubleshoot.sh`)
**Purpose**: Interactive tool to diagnose and fix development issues

**Features**:
- Quick status overview
- Full diagnostic reports
- Targeted issue fixes
- Live environment monitoring
- Step-by-step problem resolution

**Usage**:
```bash
npm run dev:troubleshoot
# or directly
./dev-troubleshoot.sh
```

### 3. Development Diagnostics (`dev-diagnose.sh`)
**Purpose**: Comprehensive analysis of the development environment

**Features**:
- System information gathering
- Process analysis
- File system checks
- Performance metrics
- Detailed recommendations
- Report generation

**Usage**:
```bash
npm run dev:diagnose
# or directly
./dev-diagnose.sh
```

### 4. Advanced Development Server (`dev-advanced.sh`)
**Purpose**: Enhanced development server with deep cleaning options

**Features**:
- Multiple startup modes
- Deep cache cleaning
- Dependency verification
- Process optimization

**Usage**:
```bash
npm run dev:advanced     # Standard mode
npm run dev:quick        # Quick startup
npm run dev:deep         # Deep clean startup
```

### 5. Development Monitor (`dev-monitor.sh`)
**Purpose**: Continuous monitoring of the development environment

**Features**:
- Background process monitoring
- Automatic restart on crashes
- Resource usage tracking
- Performance logging

**Usage**:
```bash
npm run dev:monitor
```

## 🔧 Common Issues and Solutions

### Issue: Multiple zsh Instances
**Symptoms**: High CPU usage, slow terminal performance
**Causes**: Terminal tabs not properly closed, VS Code terminal management
**Solutions**:
1. Run the troubleshooter: `npm run dev:troubleshoot`
2. Close unnecessary terminal tabs
3. Restart Terminal.app
4. Use the "Fix zsh instances" option in troubleshooter

### Issue: Port 3000 Conflicts
**Symptoms**: "Port already in use" errors
**Causes**: Previous dev server didn't shut down properly
**Solutions**:
1. Quick fix: `npm run kill:dev`
2. Use troubleshooter: `npm run dev:troubleshoot` → "Fix port conflicts"
3. Force kill: `lsof -ti:3000 | xargs kill -9`

### Issue: Slow Development Server
**Symptoms**: Long startup times, slow hot reloading
**Causes**: Large cache files, excessive file watchers, memory issues
**Solutions**:
1. Deep clean: `npm run dev:deep`
2. Run diagnostics: `npm run dev:diagnose`
3. Use troubleshooter: `npm run dev:troubleshoot` → "Fix slow server"

### Issue: High Memory Usage
**Symptoms**: System slowdown, browser crashes
**Causes**: Memory leaks, large cache files, too many processes
**Solutions**:
1. Monitor resources: `npm run dev:troubleshoot` → "Monitor environment"
2. Restart development server: `npm run dev:restart`
3. Clear all caches: `npm run clean:full`

### Issue: File Watcher Problems
**Symptoms**: Hot reloading not working, high CPU from file watching
**Causes**: Watching too many files, large directories
**Solutions**:
1. Run diagnostics: `npm run dev:diagnose`
2. Use troubleshooter: `npm run dev:troubleshoot` → "Fix file watchers"
3. Optimize .gitignore to exclude large directories

## 📊 Development Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run dev` | Standard Next.js dev server | Normal development |
| `npm run dev:smart` | **Recommended** - Smart server with auto-fixes | Daily development |
| `npm run dev:troubleshoot` | Interactive problem solver | When issues occur |
| `npm run dev:diagnose` | Generate diagnostic report | Understanding issues |
| `npm run dev:advanced` | Enhanced server with options | Alternative to smart |
| `npm run dev:monitor` | Background monitoring | Long-term stability |
| `npm run kill:dev` | Kill all dev processes | Emergency cleanup |
| `npm run clean` | Clear Next.js cache | Build issues |
| `npm run clean:full` | Full environment reset | Major issues |

## 🎯 Recommended Workflow

### Daily Development
1. Start with: `npm run dev:smart`
2. If issues occur: `npm run dev:troubleshoot`
3. For monitoring: `npm run dev:monitor` in background

### Problem Diagnosis
1. Run: `npm run dev:diagnose`
2. Review generated report at `/tmp/litework-dev-report.txt`
3. Follow recommendations in the report

### Emergency Recovery
1. Kill everything: `npm run kill:dev`
2. Deep clean: `npm run clean:full`
3. Restart: `npm run dev:smart`

## 📋 Health Monitoring

The smart development server includes built-in health monitoring:

- **Process Monitoring**: Automatic detection of zombie processes
- **Resource Tracking**: CPU and memory usage monitoring
- **Port Management**: Automatic conflict resolution
- **Cache Optimization**: Intelligent cache management
- **Performance Metrics**: Response time tracking

## 🔄 Auto-Recovery Features

The enhanced development environment includes:

- **Automatic Restart**: Server restarts on crashes
- **Process Cleanup**: Automatic cleanup of orphaned processes
- **Cache Management**: Intelligent cache clearing
- **Port Recovery**: Automatic port conflict resolution
- **Health Checks**: Continuous server health monitoring

## 📝 Logging and Reports

All tools generate detailed logs and reports:

- **Development logs**: `dev-server.log`
- **Diagnostic reports**: `/tmp/litework-dev-report.txt`
- **Monitor logs**: `/tmp/litework-dev-monitor.log`

## 💡 Tips for Optimal Performance

1. **Use the smart server**: `npm run dev:smart` handles most issues automatically
2. **Monitor regularly**: Run diagnostics weekly to catch issues early
3. **Clean caches**: Regular cache cleaning prevents accumulation issues
4. **Manage terminals**: Close unused terminal tabs to reduce zsh instances
5. **Restart periodically**: Restart the development environment daily for best performance

## 🆘 Getting Help

When you encounter issues:

1. **First step**: Run `npm run dev:troubleshoot`
2. **For analysis**: Run `npm run dev:diagnose`
3. **Emergency**: Use `npm run kill:dev` followed by `npm run dev:smart`

The troubleshooter provides interactive guidance for most common development issues.