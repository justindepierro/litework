#!/bin/bash

# Codebase Cleanup Script
# Removes dead code, legacy files, and consolidates documentation

set -e

echo "🧹 Starting codebase cleanup..."
echo ""

# 1. Remove backup and old files
echo "📁 Removing backup/old files..."
rm -f src/components/WorkoutLive.tsx.backup
rm -f src/app/profile/page.tsx.old
echo "   ✅ Removed backup files"
echo ""

# 2. Move audit files to archive
echo "📊 Archiving audit reports..."
mkdir -p docs/reports/archive
mv -f audit-date-bugs-report.json docs/reports/archive/ 2>/dev/null || true
mv -f audit-output.txt docs/reports/archive/ 2>/dev/null || true
mv -f audit-report.json docs/reports/archive/ 2>/dev/null || true
echo "   ✅ Archived audit files to docs/reports/archive/"
echo ""

# 3. Remove outdated structure file
echo "📄 Removing outdated documentation..."
rm -f DIRECTORY_STRUCTURE.txt
echo "   ✅ Removed DIRECTORY_STRUCTURE.txt (info in PROJECT_STRUCTURE.md)"
echo ""

# 4. Consolidate performance docs
echo "📚 Consolidating performance documentation..."
mkdir -p docs/archive/performance
mv -f PERFORMANCE_COMPLETE_SUMMARY.md docs/archive/performance/ 2>/dev/null || true
mv -f PERFORMANCE_IMPLEMENTATION_LOG.md docs/archive/performance/ 2>/dev/null || true
mv -f PERFORMANCE_UX_OPTIMIZATION_COMPLETE.md docs/archive/performance/ 2>/dev/null || true
echo "   ✅ Archived old performance docs (kept PERFORMANCE_UX_COMPLETE_FINAL.md)"
echo ""

# 5. Create summary in archive
cat > docs/archive/performance/README.md << 'EOF'
# Archived Performance Documentation

These files represent the development history of the performance optimization work.

## Current Documentation

The latest and most comprehensive performance documentation is at:
- `/PERFORMANCE_UX_COMPLETE_FINAL.md` - Complete summary
- `/PERFORMANCE_QUICK_START.md` - Quick start guide
- `/docs/UX_PERFORMANCE_OPTIMIZATION_GUIDE.md` - API reference
- `/docs/checklists/performance-optimization-checklist.md` - Implementation checklist

## Archived Files

These files are kept for historical reference:
- `PERFORMANCE_COMPLETE_SUMMARY.md` - Earlier summary
- `PERFORMANCE_IMPLEMENTATION_LOG.md` - Development log
- `PERFORMANCE_UX_OPTIMIZATION_COMPLETE.md` - Initial completion summary
EOF

echo "   ✅ Created archive README"
echo ""

echo "✨ Cleanup complete!"
echo ""
echo "Summary:"
echo "  • Removed 2 backup files"
echo "  • Archived 3 audit reports"
echo "  • Removed 1 outdated structure file"
echo "  • Archived 3 duplicate performance docs"
echo ""
echo "Next steps:"
echo "  1. Run: npm run cleanup:imports (to fix unused imports)"
echo "  2. Run: npm uninstall critters next-pwa react-window"
echo "  3. Run: npm run lint"
echo ""
