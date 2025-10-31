# Development Optimization Guide

## Quick Start Commands

### Optimized Development (Recommended)

```bash
npm run dev:optimized
```

This command:

- ✅ Kills any existing Next.js processes
- ✅ Frees up port 3000
- ✅ Cleans Next.js cache
- ✅ Starts development server with Turbopack
- ✅ Provides colored status output

### Alternative Commands

```bash
# Standard development
npm run dev

# Clean restart
npm run dev:clean

# Kill development server
npm run kill:dev

# Deep clean (removes node_modules)
npm run dev:clean
```

## VS Code Integration

Use **Ctrl/Cmd + Shift + P** and type:

- `Tasks: Run Task` → `Start Development Server (Optimized)`
- `Tasks: Run Task` → `Kill Development Server`
- `Tasks: Run Task` → `Restart Development Server`

## Development Server Optimizations

### What's Optimized:

1. **Process Management**: Automatic cleanup of zombie processes
2. **Port Management**: Automatic port 3000 cleanup
3. **Cache Management**: Automatic .next directory cleanup
4. **Turbopack**: Enabled for faster builds and hot reload
5. **Memory Management**: Optimized webpack configuration
6. **File Watching**: Improved polling for better file change detection

### Performance Features:

- 🚀 **Turbopack**: ~10x faster than webpack
- 🔄 **Fast Refresh**: Near-instant updates
- 🧹 **Auto Cleanup**: No more manual process killing
- 📊 **Memory Efficient**: Optimized chunk splitting
- ⚡ **Smart Polling**: Better file watching on macOS

### Troubleshooting

#### If server won't start:

```bash
npm run kill:dev
npm run dev:optimized
```

#### If port 3000 is busy:

```bash
lsof -ti :3000 | xargs kill -9
npm run dev:optimized
```

#### If there are module issues:

```bash
npm run dev:clean  # Deep clean with npm install
```

#### Multiple terminal/zsh instances:

The optimization script prevents this by:

- Using single instance limits in VS Code tasks
- Automatic process cleanup
- Port collision detection

## Next.js Configuration

The `next.config.ts` includes:

- **Turbopack support** via CLI flag
- **Webpack optimizations** for development
- **Memory management** for large projects
- **File watching** improvements for macOS
- **Chunk splitting** optimization

## Best Practices

1. **Use the optimized command**: `npm run dev:optimized`
2. **Use VS Code tasks** instead of manual terminal commands
3. **Let the script handle cleanup** - don't manually kill processes
4. **Restart vs Kill**: Use restart task to maintain terminal history
5. **Deep clean** if you encounter persistent issues

## Files Created/Modified

- `dev-optimize.sh` - Main optimization script
- `package.json` - Enhanced npm scripts
- `next.config.ts` - Development optimizations
- `.vscode/tasks.json` - VS Code task integration
