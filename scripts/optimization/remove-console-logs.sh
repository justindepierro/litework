#!/bin/bash

# Remove console.log statements from production code
# This script finds and removes console.log, console.warn statements
# but keeps console.error for debugging purposes

echo "🧹 Removing console.log/warn statements from production code..."

# Count before
BEFORE=$(grep -r "console\.\(log\|warn\)" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
echo "📊 Found $BEFORE console.log/warn statements"

# Remove console.log statements (keeping console.error)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/console\.log/d' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/console\.warn/d' {} +

# Count after
AFTER=$(grep -r "console\.\(log\|warn\)" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
REMOVED=$((BEFORE - AFTER))

echo "✅ Removed $REMOVED console statements"
echo "📊 Remaining: $AFTER (likely in comments or strings)"
echo ""
echo "Note: console.error statements were preserved for debugging"
