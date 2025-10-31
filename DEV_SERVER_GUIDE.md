# 🔄 Development Server Guide

## The Problem

Next.js dev servers can stop unexpectedly due to:
- File changes that cause compilation errors
- Memory issues or crashes
- System events (sleep, network changes)
- Manual code changes that break the build
- Hot reload failures

## The Solution: Persistent Dev Server

We've created a **persistent development server** that automatically restarts when it stops, with intelligent failure handling.

---

## 🚀 Quick Start

### Option 1: NPM Script (Recommended)
```bash
npm run dev:persistent
```

### Option 2: Direct Script
```bash
./dev-persistent.sh
```

### Option 3: VS Code Task
1. Press `Cmd+Shift+B` (or `Ctrl+Shift+B` on Windows/Linux)
2. Select **"Start Development Server (Persistent)"**

---

## ✨ Features

### 🔄 Automatic Restart
- Server automatically restarts when it stops
- Handles crashes gracefully
- Exponential backoff for repeated failures

### 🏥 Health Monitoring
- Checks server health every 30 seconds
- Monitors process status
- Verifies port availability
- Pings health endpoint

### 📊 Smart Recovery
- Tracks consecutive failures
- Stops after 5 consecutive failures (prevents infinite loops)
- Cleans up port conflicts automatically
- Adds delays for repeated failures

### 📝 Comprehensive Logging
- All events logged to `.dev-server.log`
- Timestamped entries
- Color-coded output
- Session tracking

### 🛡️ Safety Features
- Graceful shutdown with Ctrl+C
- Uptime tracking
- Restart counting
- Disk space monitoring

---

## 🎯 When to Use Each Server Mode

### `npm run dev:persistent` ⭐ **RECOMMENDED FOR DAILY WORK**
**Use when:**
- You're actively developing for extended periods
- You want the server to survive file saves and errors
- You step away and want the server running when you return
- You're making experimental changes that might break things

**Benefits:**
- Server stays up through errors
- Automatically recovers from crashes
- Best for "fire and forget" development

### `npm run dev:smart`
**Use when:**
- You want a clean start
- You're debugging specific issues
- You want to see the full startup process
- You prefer manual control

**Benefits:**
- Single clean startup
- Full visibility into initialization
- Better for troubleshooting

### `npm run dev`
**Use when:**
- You want vanilla Next.js behavior
- You're comparing behavior with standard setup
- Scripts aren't working

**Benefits:**
- Simplest possible setup
- No wrapper scripts

---

## 📋 Server Output Explained

### Starting Up
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 LiteWork Persistent Development Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:30:15] ℹ️  Press Ctrl+C to stop the server
[10:30:15] ℹ️  Logs: /path/to/.dev-server.log
[10:30:15] ℹ️  Starting Next.js development server (attempt 1)...
[10:30:20] ✅ Development server started successfully (PID: 12345)
[10:30:20] ℹ️  Server running at: http://localhost:3000
```

### Automatic Restart
```
[10:45:30] ⚠️  WARNING: Server process (PID 12345) has stopped
[10:45:30] ⚠️  WARNING: Server stopped. Failure count: 1/5
[10:45:30] ℹ️  Restarting in 3 seconds...
[10:45:33] ℹ️  Starting Next.js development server (attempt 2)...
```

### Graceful Shutdown
```
^C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Shutting Down Persistent Dev Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[10:50:00] ℹ️  Stopping development server...
[10:50:02] ✅ Server ran for: 0h 19m 45s
[10:50:02] ✅ Total restarts: 3
[10:50:02] ✅ Logs saved to: /path/to/.dev-server.log
```

---

## 🔍 Troubleshooting

### Server Won't Start

**Check the logs:**
```bash
tail -f .dev-server.log
```

**Common issues:**
1. **Port already in use**: Script should auto-fix, but you can manually run:
   ```bash
   npm run kill:dev
   ```

2. **Missing dependencies**: Script will auto-install, but you can manually run:
   ```bash
   npm install
   ```

3. **Compilation errors**: Fix the errors in your code, server will auto-restart

### Too Many Restarts

If you see:
```
ERROR: Too many consecutive failures (5). Stopping persistent mode.
```

**This means:**
- Your code has persistent errors preventing startup
- Check `.dev-server.log` for details
- Fix the issues, then restart

**Recovery:**
1. Fix the errors in your code
2. Run `npm run dev:persistent` again

### Server Stuck

If the server appears stuck:
1. Press `Ctrl+C` to stop cleanly
2. Run `npm run kill:dev` to force cleanup
3. Restart with `npm run dev:persistent`

---

## 📊 Log File Location

All activity is logged to: `.dev-server.log` in your project root

**View live logs:**
```bash
tail -f .dev-server.log
```

**Search logs:**
```bash
grep "ERROR" .dev-server.log
```

**Clear old logs:**
```bash
rm .dev-server.log
```

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+C` | Gracefully stop server and show stats |
| `Cmd+Shift+B` | Open VS Code task picker |

---

## 📈 Statistics Tracking

When you stop the server, you'll see:
- **Total uptime**: How long the server ran
- **Restart count**: How many times it recovered
- **Log location**: Where to find detailed logs

---

## 🚨 Emergency Stop

If you need to force-kill everything:

```bash
npm run kill:dev
```

This will:
- Kill all Node/Next.js processes
- Free port 3000
- Clean up any zombie processes

---

## 💡 Pro Tips

1. **Leave it running**: The persistent server is designed to run all day. Just start it in the morning!

2. **Check logs periodically**: The log file can help you understand patterns in crashes

3. **Use with VS Code**: The dedicated panel keeps the output visible while you work

4. **Combine with file watching**: The server works great with external file watchers and formatters

5. **Safe to experiment**: Make breaking changes without worrying - the server will restart when you fix them

---

## 🔗 Related Commands

```bash
npm run dev              # Standard Next.js dev server
npm run dev:persistent   # Persistent auto-restart server ⭐
npm run dev:smart        # Smart wrapper with health checks
npm run kill:dev         # Force kill all dev servers
npm run typecheck        # Check for TypeScript errors
```

---

## ❓ FAQ

**Q: Will this restart during file saves?**
A: No, Next.js hot reload handles normal file changes. This only restarts if the entire process stops.

**Q: What if I have a syntax error?**
A: Next.js will show the error in browser. The server keeps running. Only restarts if the process crashes.

**Q: Can I use this in production?**
A: No, this is for development only. Production uses `npm start` with properly built code.

**Q: Does this work on Windows?**
A: This script is bash-based for macOS/Linux. Windows users should use WSL or Git Bash.

**Q: How do I make it the default?**
A: It already is! Press `Cmd+Shift+B` in VS Code to run the default task.

---

Made with ❤️ for uninterrupted development! 🚀
