#!/bin/bash
# Start VS Code with reduced permission requests

# Kill any existing VS Code processes
pkill -f "Visual Studio Code" 2>/dev/null || true
sleep 2

# Start VS Code with specific flags to reduce permission requests
if [[ -d "/Applications/Visual Studio Code-2.app" ]]; then
    echo "🚀 Starting VS Code with reduced permissions..."
    open "/Applications/Visual Studio Code-2.app" --args \
        --disable-web-security \
        --disable-features=TranslateUI \
        --disable-ipc-flooding-protection \
        /Users/justindepierro/Documents/LiteWork
else
    echo "❌ VS Code-2 not found, trying default VS Code..."
    open "/Applications/Visual Studio Code.app" --args \
        --disable-web-security \
        --disable-features=TranslateUI \
        --disable-ipc-flooding-protection \
        /Users/justindepierro/Documents/LiteWork
fi
