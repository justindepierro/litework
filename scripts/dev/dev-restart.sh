#!/bin/bash

# Simple dev server restart script
# Kills any existing Next.js dev server and starts a fresh one

echo "🔄 Restarting development server..."

# Kill any existing Next.js dev server
echo "   Stopping existing server..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Verify it's killed
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   Force killing port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Change to project directory
cd "$(dirname "$0")/../.."

# Start fresh server
echo "   Starting server..."
npm run dev

# Note: This runs in foreground so you can see logs
# Press Ctrl+C to stop the server
