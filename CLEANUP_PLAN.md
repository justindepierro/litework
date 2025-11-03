# LiteWork Cleanup Plan - November 3, 2025

## 🗑️ Files to Archive/Remove

### Root Directory - Keep Only Essential

**KEEP (Essential):**
- ✅ README.md - Project overview
- ✅ ARCHITECTURE.md - System architecture  
- ✅ CHANGELOG.md - Version history
- ✅ MVP_ROADMAP.md - Feature roadmap
- ✅ PROJECT_STRUCTURE.md - Directory guide
- ✅ SECURITY_QUICK_REF.md - Security reference
- ✅ package.json, tsconfig.json, etc. - Config files

**ARCHIVE (Move to docs/):**
- 📦 BLOCK_SYSTEM_IMPLEMENTATION.md → docs/reports/
- 📦 NOTIFICATION_IMPLEMENTATION_PROGRESS.md → docs/reports/
- 📦 NOTIFICATION_SYSTEM_COMPLETE.md → docs/reports/
- 📦 PRODUCTION_DEPLOYMENT_CHECKLIST.md → docs/checklists/

### /docs - Consolidate Similar Topics

**Block System Docs (7 files → 2 files):**
- BLOCK_FIXES_AND_ENHANCEMENTS.md
- BLOCK_INSTANCE_SYSTEM.md
- BLOCK_SYSTEM_COMPLETE.md
- CREATE_CUSTOM_BLOCKS_GUIDE.md
- WORKOUT_BLOCKS_QUICK_REFERENCE.md
- WORKOUT_BLOCK_SYSTEM.md
- ENHANCED_EXERCISE_FIELDS.md

**Consolidate into:**
- docs/guides/WORKOUT_BLOCKS_GUIDE.md (comprehensive guide)
- Archive old versions to docs/reports/legacy-blocks/

**Notification Docs (2 files → 1 file):**
- NOTIFICATION_IMPLEMENTATION_SUMMARY.md
- NOTIFICATION_PREFERENCES.md

**Consolidate into:**
- docs/guides/NOTIFICATION_SYSTEM_GUIDE.md

### /scripts/dev - Remove Deprecated

**KEEP:**
- ✅ check-invite.mjs (recently added, useful)
- ✅ test-supabase-connection.mjs (diagnostic)
- ✅ dev-restart.sh (actively used)

**ARCHIVE/REMOVE:**
- 🗑️ dev-diagnose.sh (superseded by better tooling)
- 🗑️ dev-monitor.sh (not used)
- 🗑️ dev-persistent.sh (not in package.json)
- 🗑️ dev-smart.sh (not in package.json)
- 🗑️ dev-troubleshoot.sh (outdated)
- 🗑️ fix-vscode-permissions.sh (one-time use, done)
- 🗑️ start-vscode-reduced-permissions.sh (not needed)
- 🗑️ check-dev-env.mjs (one-time setup check)

### /database - Already Clean ✅

### /config - Already Organized ✅

## 📋 Cleanup Actions

### Phase 1: Move Root Files to Proper Locations
```bash
mv BLOCK_SYSTEM_IMPLEMENTATION.md docs/reports/
mv NOTIFICATION_IMPLEMENTATION_PROGRESS.md docs/reports/
mv NOTIFICATION_SYSTEM_COMPLETE.md docs/reports/
mv PRODUCTION_DEPLOYMENT_CHECKLIST.md docs/checklists/
```

### Phase 2: Consolidate Block Documentation
```bash
# Create comprehensive guide
# Archive old files to docs/reports/legacy-blocks/
```

### Phase 3: Clean Up Scripts
```bash
# Move to archive or delete outdated dev scripts
mkdir -p scripts/archive
mv scripts/dev/dev-diagnose.sh scripts/archive/
mv scripts/dev/dev-monitor.sh scripts/archive/
mv scripts/dev/dev-persistent.sh scripts/archive/
mv scripts/dev/dev-smart.sh scripts/archive/
mv scripts/dev/dev-troubleshoot.sh scripts/archive/
mv scripts/dev/fix-vscode-permissions.sh scripts/archive/
mv scripts/dev/start-vscode-reduced-permissions.sh scripts/archive/
mv scripts/dev/check-dev-env.mjs scripts/archive/
```

### Phase 4: Update References
- Update any links in remaining docs
- Update package.json scripts if needed
- Update .gitignore if needed

## 📊 Before vs After

**Root Directory:**
- Before: 12 markdown files
- After: 6 markdown files (50% reduction)

**Documentation:**
- Before: 20+ scattered docs
- After: Organized by type (guides, reports, checklists)

**Scripts:**
- Before: 11 dev scripts
- After: 3 active scripts + archived rest

## ✅ Benefits

1. **Cleaner Root** - Only essential docs visible
2. **Organized Docs** - Proper categorization
3. **Active Scripts Only** - Remove unused tooling
4. **Easier Navigation** - Less clutter
5. **Better Onboarding** - Clear structure for new devs

---

**Ready to execute?** Run the cleanup script or manual commands above.
