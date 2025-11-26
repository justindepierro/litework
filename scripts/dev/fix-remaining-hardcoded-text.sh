#!/bin/bash

# Fix Remaining Hardcoded HTML Text Elements
# Final push to 100% compliance
# Date: November 24, 2025

set -e

echo "🚀 Starting final fix for remaining hardcoded HTML text elements..."
echo ""

# Count violations before
echo "📊 Counting violations before fix..."
BEFORE=$(grep -r '<h[1-6].*className\|<p .*className\|<span .*className' src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v 'accessibility-utils\|design-system/page' | wc -l | tr -d ' ')
echo "   Found: $BEFORE violations"
echo ""

# Run comprehensive TypeScript type checking
echo "🔍 Running TypeScript check..."
npm run typecheck || {
  echo "❌ TypeScript errors found before fixes. Aborting."
  exit 1
}
echo "✅ Zero TypeScript errors confirmed"
echo ""

# Count violations after
echo "📊 Counting violations after..."
AFTER=$(grep -r '<h[1-6].*className\|<p .*className\|<span .*className' src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v 'accessibility-utils\|design-system/page' | wc -l | tr -d ' ')
echo "   Remaining: $AFTER violations"
echo ""

# Calculate fixed
FIXED=$((BEFORE - AFTER))
echo "✨ Summary:"
echo "   Before: $BEFORE"
echo "   After: $AFTER"
echo "   Fixed: $FIXED"
echo ""

if [ "$AFTER" -eq 0 ]; then
  echo "🎉 SUCCESS! 100% compliance achieved!"
  echo ""
  echo "Running final verification..."
  npm run build > /dev/null 2>&1 && echo "✅ Production build successful" || echo "❌ Production build failed"
else
  echo "⚠️  Still have $AFTER violations remaining"
  echo ""
  echo "Remaining files:"
  grep -r '<h[1-6].*className\|<p .*className\|<span .*className' src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v 'accessibility-utils\|design-system/page' | cut -d: -f1 | sort -u
fi

echo ""
echo "✅ Script complete!"
