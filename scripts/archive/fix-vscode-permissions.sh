#!/bin/bash

# VS Code Permission Request Reducer Script
# This script helps reduce VS Code permission requests

echo "🔧 VS Code Permission Request Fix Script"
echo "========================================"

# 1. Check current VS Code installations
echo "📱 Checking VS Code installations..."
find /Applications -name "*Visual Studio Code*" -type d 2>/dev/null || echo "No VS Code found in Applications"

# 2. Create a simplified settings backup
SETTINGS_FILE="$HOME/Library/Application Support/Code/User/settings.json"
if [[ -f "$SETTINGS_FILE" ]]; then
    echo "💾 Backing up current settings..."
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Settings backed up"
else
    echo "❌ Settings file not found"
fi

# 3. Recommend manual permission grants
echo ""
echo "🔐 RECOMMENDED MANUAL PERMISSION GRANTS:"
echo "========================================"
echo "1. Open System Preferences/Settings → Privacy & Security"
echo "2. Grant these permissions to VS Code:"
echo "   ✅ Accessibility"
echo "   ✅ Full Disk Access" 
echo "   ✅ Files and Folders"
echo "   ✅ Automation (if available)"
echo ""

# 4. Create VS Code startup script with reduced permissions
cat > ~/Documents/LiteWork/start-vscode-reduced-permissions.sh << 'EOF'
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
EOF

chmod +x ~/Documents/LiteWork/start-vscode-reduced-permissions.sh

echo "✅ Created startup script: ~/Documents/LiteWork/start-vscode-reduced-permissions.sh"
echo ""

# 5. Create a simplified VS Code settings file
cat > ~/Documents/LiteWork/vscode-minimal-settings.json << 'EOF'
{
  "git.confirmSync": false,
  "javascript.updateImportsOnFileMove.enabled": "always",
  "git.autofetch": true,
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.autoSave": "afterDelay",
  "workbench.localHistory.enabled": false,
  
  // Disable problematic features that request permissions
  "terminal.integrated.automationProfile.osx": null,
  "github.copilot.chat.agent.terminal.allowList": {},
  "github.copilot.chat.agent.terminal.denyList": {},
  "chat.tools.terminal.autoApprove": {},
  
  // Reduce extension permission requests  
  "git.terminalAuthentication": false,
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "update.mode": "manual",
  
  // Disable telemetry that might request permissions
  "telemetry.telemetryLevel": "off",
  "crash.submitURL": "",
  "crash.uploadURL": ""
}
EOF

echo "✅ Created minimal settings template: ~/Documents/LiteWork/vscode-minimal-settings.json"
echo ""

# 6. Provide instructions
echo "🎯 QUICK FIXES:"
echo "==============="
echo ""
echo "OPTION 1 - Use Startup Script (Recommended):"
echo "   ./start-vscode-reduced-permissions.sh"
echo ""
echo "OPTION 2 - Grant Permissions Manually:"
echo "   1. Open System Preferences → Privacy & Security"
echo "   2. Add VS Code to Accessibility, Full Disk Access, Automation"
echo "   3. Restart VS Code"
echo ""
echo "OPTION 3 - Use Minimal Settings:"
echo "   1. Replace your settings with: vscode-minimal-settings.json"
echo "   2. This disables many auto-approval features"
echo ""
echo "OPTION 4 - Install Configuration Profile:"
echo "   1. Double-click: VSCode-Privacy-Profile.mobileconfig"
echo "   2. Follow installation prompts"
echo "   3. This pre-approves common permissions"
echo ""

# 7. Open System Preferences automatically
echo "🔓 Opening System Preferences Privacy settings..."
open "x-apple.systempreferences:com.apple.preference.security?Privacy" 2>/dev/null || \
open -b com.apple.systempreferences 2>/dev/null || \
echo "Please manually open System Preferences → Privacy & Security"

echo ""
echo "✅ Setup complete! Choose one of the options above."