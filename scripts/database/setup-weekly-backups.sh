#!/bin/bash

# ============================================
# Setup Weekly Database Backups (macOS)
# Runs every Sunday at 3:00 AM
# ============================================

set -e

WORKSPACE_DIR="/Users/justindepierro/Documents/LiteWork"
PLIST_FILE="$HOME/Library/LaunchAgents/com.litework.backup.plist"

echo "🔧 Setting up weekly database backups..."

# 1. Create logs directory
mkdir -p "$WORKSPACE_DIR/logs"

# 2. Create LaunchAgent plist
cat > "$PLIST_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.litework.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/justindepierro/Documents/LiteWork/scripts/database/export-schema.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>0</integer>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/justindepierro/Documents/LiteWork/logs/backup.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/justindepierro/Documents/LiteWork/logs/backup-error.log</string>
</dict>
</plist>
EOF

echo "✅ Created LaunchAgent plist: $PLIST_FILE"

# 3. Load the LaunchAgent
launchctl unload "$PLIST_FILE" 2>/dev/null || true
launchctl load "$PLIST_FILE"

echo "✅ Loaded LaunchAgent (runs every Sunday at 3:00 AM)"

# 4. Verify it's running
if launchctl list | grep -q "com.litework.backup"; then
  echo "✅ Backup agent is active and scheduled"
else
  echo "❌ Failed to load backup agent"
  exit 1
fi

# 5. Test the backup script immediately
echo ""
echo "🧪 Testing backup script now..."
bash "$WORKSPACE_DIR/scripts/database/export-schema.sh"

if [ -f "$WORKSPACE_DIR/database-export/schema-dump.sql" ]; then
  echo "✅ Test backup successful!"
  echo ""
  echo "📁 Backup location: database-export/schema-dump.sql"
  echo "📅 Schedule: Every Sunday at 3:00 AM"
  echo "📋 Logs: logs/backup.log"
else
  echo "❌ Test backup failed - check logs"
  exit 1
fi

echo ""
echo "✅ Weekly backups configured successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy audit trail SQL (copy/paste in Supabase SQL Editor)"
echo "   2. Backups will run automatically every Sunday"
echo "   3. Monitor logs/backup.log for backup status"
