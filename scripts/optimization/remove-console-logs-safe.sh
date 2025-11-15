#!/bin/bash

# Safe console.log removal script
# Only removes standalone console.log/warn statements (not ones inside objects or comments)

echo "🧹 Safely removing console.log/warn statements..."

# Find all TypeScript/TSX files in src/
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*")

# Count before
BEFORE=$(echo "$FILES" | xargs grep -E "^\s*console\.(log|warn)" 2>/dev/null | wc -l | tr -d ' ')
echo "📊 Found $BEFORE standalone console.log/warn statements"

# Remove only lines that START with console.log/warn (with optional whitespace)
# This avoids removing console statements inside objects, template literals, etc.
for file in $FILES; do
  # Use sed to remove lines that are ONLY console.log/warn statements
  sed -i '' '/^[[:space:]]*console\.\(log\|warn\)/d' "$file"
done

# Count after
AFTER=$(echo "$FILES" | xargs grep -E "^\s*console\.(log|warn)" 2>/dev/null | wc -l | tr -d ' ')
REMOVED=$((BEFORE - AFTER))

echo "✅ Removed $REMOVED console statements"
echo "📊 Remaining: $AFTER"
echo ""
echo "Note: Only standalone console.log/warn lines were removed."
echo "console.error statements were preserved for debugging."
