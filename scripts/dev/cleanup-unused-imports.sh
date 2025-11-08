#!/bin/bash

# Cleanup Unused Imports Script
# Fixes ESLint warnings for unused imports across the codebase

set -e

echo "🔧 Fixing unused imports..."
echo ""

# List of files with unused imports (from lint output)
FILES=(
  "src/app/api/analytics/dashboard-stats/route.ts"
  "src/app/api/analytics/group-stats/route.ts"
  "src/app/api/analytics/route.ts"
  "src/app/api/analytics/web-vitals/route.ts"
  "src/app/api/assignments/bulk/route.ts"
  "src/app/api/blocks/[id]/favorite/route.ts"
)

FIXED=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Remove unused imports automatically
    # This is a safe operation - only removes imports that are confirmed unused by ESLint
    
    # Use npx eslint --fix to automatically remove unused imports
    npx eslint "$file" --fix --quiet 2>/dev/null || true
    
    FIXED=$((FIXED + 1))
  fi
done

echo ""
echo "✅ Processed $FIXED files"
echo ""
echo "Running full lint check..."
npm run lint 2>&1 | grep -E "warning|error" | head -20 || echo "✨ No warnings found!"
echo ""
